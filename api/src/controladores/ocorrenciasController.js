const db = require('../db');

// Tipos de violência da Lei Maria da Penha (Lei 11.340/2006, art. 7º), os mesmos do app
const TIPOS = ['Física', 'Psicológica', 'Sexual', 'Patrimonial', 'Moral'];

// Colunas que saem da API (com dateStrings a data já sai como '2026-10-20')
const CAMPOS = 'id_ocorrencia, id_usuaria, data, tipo, local, descricao';

// Converte um valor em id inteiro positivo; devolve null se não for válido
function paraId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Data de hoje no formato do banco, para comparar como texto
function hoje() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Confere os campos do formulário; devolve a mensagem de erro ou null
function validar({ data, tipo, local, descricao }) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return 'Informe a data no formato AAAA-MM-DD.';
  }
  // new Date transforma 2026-02-31 em 03/03; se o dia mudou, a data não existe
  const d = new Date(`${data}T00:00:00`);
  if (Number.isNaN(d.getTime()) || d.getDate() !== Number(data.slice(8))) return 'Data inválida.';
  if (data > hoje()) return 'A data não pode ser no futuro.';
  if (!TIPOS.includes(tipo)) return `Tipo deve ser: ${TIPOS.join(', ')}.`;
  if (local !== undefined && local !== null && (typeof local !== 'string' || local.length > 60)) {
    return 'Local inválido (máximo 60).';
  }
  if (typeof descricao !== 'string' || descricao.trim().length < 5) {
    return 'Descreva o que aconteceu (mínimo 5 letras).';
  }
  if (descricao.length > 500) return 'Descrição muito longa (máximo 500).';
  return null;
}

async function buscarPorId(id) {
  const [linhas] = await db.query(`SELECT ${CAMPOS} FROM ocorrencia WHERE id_ocorrencia = ?`, [id]);
  return linhas[0] ?? null;
}

// GET /ocorrencias              -> todas
// GET /ocorrencias?id_usuaria=1 -> só as da usuária (mais recentes primeiro)
async function listar(req, res) {
  let where = '';
  const valores = [];

  if (req.query.id_usuaria !== undefined) {
    const idUsuaria = paraId(req.query.id_usuaria);
    if (!idUsuaria) return res.status(400).json({ erro: 'id_usuaria inválido.' });
    where = 'WHERE id_usuaria = ?';
    valores.push(idUsuaria);
  }

  const [linhas] = await db.query(
    `SELECT ${CAMPOS} FROM ocorrencia ${where} ORDER BY data DESC, id_ocorrencia DESC`,
    valores
  );
  res.json(linhas);
}

// GET /ocorrencias/:id
async function buscar(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const ocorrencia = await buscarPorId(id);
  if (!ocorrencia) return res.status(404).json({ erro: 'Ocorrência não encontrada.' });

  res.json(ocorrencia);
}

// POST /ocorrencias  { id_usuaria, data, tipo, local?, descricao }
async function criar(req, res) {
  const corpo = req.body ?? {};

  const idUsuaria = paraId(corpo.id_usuaria);
  if (!idUsuaria) return res.status(400).json({ erro: 'Informe o id_usuaria.' });

  const erro = validar(corpo);
  if (erro) return res.status(400).json({ erro });

  try {
    const [resultado] = await db.query(
      'INSERT INTO ocorrencia (id_usuaria, data, tipo, local, descricao) VALUES (?, ?, ?, ?, ?)',
      [idUsuaria, corpo.data, corpo.tipo, corpo.local?.trim() || null, corpo.descricao.trim()]
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

// PUT /ocorrencias/:id  { data, tipo, local?, descricao }
async function atualizar(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const corpo = req.body ?? {};
  const erro = validar(corpo);
  if (erro) return res.status(400).json({ erro });

  const [resultado] = await db.query(
    'UPDATE ocorrencia SET data = ?, tipo = ?, local = ?, descricao = ? WHERE id_ocorrencia = ?',
    [corpo.data, corpo.tipo, corpo.local?.trim() || null, corpo.descricao.trim(), id]
  );
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ erro: 'Ocorrência não encontrada.' });
  }
  res.json(await buscarPorId(id));
}

// DELETE /ocorrencias/:id
async function excluir(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const [resultado] = await db.query('DELETE FROM ocorrencia WHERE id_ocorrencia = ?', [id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ erro: 'Ocorrência não encontrada.' });
  }
  res.status(204).end();
}

module.exports = { listar, buscar, criar, atualizar, excluir };
