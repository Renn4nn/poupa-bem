const db = require('../db');

// Status possíveis de um alerta (os mesmos do app e do painel da delegacia)
const STATUS = ['Novo', 'Em atendimento', 'Concluído'];

// Colunas que saem da API. A data vai no mesmo formato que o app usa
// ('2026-11-10T19:05:00') e o nome da usuária vem junto para o painel.
const CAMPOS = `
  a.id_alerta, a.id_usuaria, u.nome AS nome_usuaria, a.id_contato,
  DATE_FORMAT(a.data_hora, '%Y-%m-%dT%H:%i:%s') AS data_hora,
  a.tipo, a.status, a.latitude, a.longitude`;

const ORIGEM = 'FROM alerta a JOIN usuaria u ON u.id_usuaria = a.id_usuaria';

// Converte um valor em id inteiro positivo; devolve null se não for válido
function paraId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Latitude e longitude são opcionais (o SOS é enviado mesmo sem localização),
// mas se vierem precisam ser as duas e dentro dos limites do mapa
function validarLocalizacao(latitude, longitude) {
  const semLat = latitude === undefined || latitude === null;
  const semLon = longitude === undefined || longitude === null;
  if (semLat && semLon) return null;
  if (semLat || semLon) return 'Envie latitude e longitude juntas.';
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    return 'Latitude inválida.';
  }
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    return 'Longitude inválida.';
  }
  return null;
}

async function buscarPorId(id) {
  const [linhas] = await db.query(`SELECT ${CAMPOS} ${ORIGEM} WHERE a.id_alerta = ?`, [id]);
  return linhas[0] ?? null;
}

// GET /alertas            -> todos (usado pelo painel da delegacia)
// GET /alertas?id_usuaria=1 -> só os da usuária (histórico no app)
// GET /alertas?status=Novo  -> filtra por status
async function listar(req, res) {
  const filtros = [];
  const valores = [];

  if (req.query.id_usuaria !== undefined) {
    const idUsuaria = paraId(req.query.id_usuaria);
    if (!idUsuaria) return res.status(400).json({ erro: 'id_usuaria inválido.' });
    filtros.push('a.id_usuaria = ?');
    valores.push(idUsuaria);
  }
  if (req.query.status !== undefined) {
    if (!STATUS.includes(req.query.status)) {
      return res.status(400).json({ erro: `Status deve ser: ${STATUS.join(', ')}.` });
    }
    filtros.push('a.status = ?');
    valores.push(req.query.status);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [linhas] = await db.query(
    `SELECT ${CAMPOS} ${ORIGEM} ${where} ORDER BY a.data_hora DESC, a.id_alerta DESC`,
    valores
  );
  res.json(linhas);
}

// GET /alertas/:id
async function buscar(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const alerta = await buscarPorId(id);
  if (!alerta) return res.status(404).json({ erro: 'Alerta não encontrado.' });

  res.json(alerta);
}

// POST /alertas  { id_usuaria, latitude?, longitude?, id_contato? }
// Data/hora, tipo e status são preenchidos pela API no momento do SOS.
async function criar(req, res) {
  const corpo = req.body ?? {};

  const idUsuaria = paraId(corpo.id_usuaria);
  if (!idUsuaria) return res.status(400).json({ erro: 'Informe o id_usuaria.' });

  let idContato = null;
  if (corpo.id_contato !== undefined && corpo.id_contato !== null) {
    idContato = paraId(corpo.id_contato);
    if (!idContato) return res.status(400).json({ erro: 'id_contato inválido.' });
  }

  const erro = validarLocalizacao(corpo.latitude, corpo.longitude);
  if (erro) return res.status(400).json({ erro });

  try {
    const [resultado] = await db.query(
      `INSERT INTO alerta (id_usuaria, id_contato, data_hora, tipo, status, latitude, longitude)
       VALUES (?, ?, NOW(), 'SOS', 'Novo', ?, ?)`,
      [idUsuaria, idContato, corpo.latitude ?? null, corpo.longitude ?? null]
    );
    res.status(201).json(await buscarPorId(resultado.insertId));
  } catch (e) {
    // A FOREIGN KEY recusou: não existe usuária com esse id
    if (e.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ erro: 'Usuária não encontrada.' });
    }
    throw e;
  }
}

// PATCH /alertas/:id/status  { status }
// É o "Update" do CRUD: quem atende (painel ou app) muda só o status.
async function atualizarStatus(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const { status } = req.body ?? {};
  if (!STATUS.includes(status)) {
    return res.status(400).json({ erro: `Status deve ser: ${STATUS.join(', ')}.` });
  }

  const [resultado] = await db.query('UPDATE alerta SET status = ? WHERE id_alerta = ?', [status, id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ erro: 'Alerta não encontrado.' });
  }
  res.json(await buscarPorId(id));
}

// DELETE /alertas/:id
async function excluir(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const [resultado] = await db.query('DELETE FROM alerta WHERE id_alerta = ?', [id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ erro: 'Alerta não encontrado.' });
  }
  res.status(204).end();
}

module.exports = { listar, buscar, criar, atualizarStatus, excluir };
