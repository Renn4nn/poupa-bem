const db = require('../db');

// Colunas que saem da API
const CAMPOS = 'id_contato, id_usuaria, nome, telefone, parentesco';

// Converte um valor em id inteiro positivo; devolve null se não for válido
function paraId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Confere os campos do formulário; devolve a mensagem de erro ou null
function validar({ nome, telefone, parentesco }) {
  if (typeof nome !== 'string' || nome.trim() === '') return 'Informe o nome.';
  if (nome.trim().length > 100) return 'Nome muito longo (máximo 100).';
  // Aceita (43) 90000-0001, 43900000001 etc.: precisa ter de 10 a 11 números
  const numeros = typeof telefone === 'string' ? telefone.replace(/\D/g, '') : '';
  if (numeros.length < 10 || numeros.length > 11) return 'Informe um telefone com DDD.';
  if (parentesco !== undefined && parentesco !== null) {
    if (typeof parentesco !== 'string' || parentesco.length > 40) return 'Parentesco inválido.';
  }
  return null;
}

async function buscarPorId(id) {
  const [linhas] = await db.query(`SELECT ${CAMPOS} FROM contato_apoio WHERE id_contato = ?`, [id]);
  return linhas[0] ?? null;
}

// GET /contatos              -> todos
// GET /contatos?id_usuaria=1 -> só os da usuária
async function listar(req, res) {
  let where = '';
  const valores = [];

  if (req.query.id_usuaria !== undefined) {
    const idUsuaria = paraId(req.query.id_usuaria);
    if (!idUsuaria) return res.status(400).json({ erro: 'id_usuaria inválido.' });
    where = 'WHERE id_usuaria = ?';
    valores.push(idUsuaria);
  }

  const [linhas] = await db.query(`SELECT ${CAMPOS} FROM contato_apoio ${where} ORDER BY nome`, valores);
  res.json(linhas);
}

// GET /contatos/:id
async function buscar(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const contato = await buscarPorId(id);
  if (!contato) return res.status(404).json({ erro: 'Contato não encontrado.' });

  res.json(contato);
}

// POST /contatos  { id_usuaria, nome, telefone, parentesco? }
async function criar(req, res) {
  const corpo = req.body ?? {};

  const idUsuaria = paraId(corpo.id_usuaria);
  if (!idUsuaria) return res.status(400).json({ erro: 'Informe o id_usuaria.' });

  const erro = validar(corpo);
  if (erro) return res.status(400).json({ erro });

  try {
    const [resultado] = await db.query(
      'INSERT INTO contato_apoio (id_usuaria, nome, telefone, parentesco) VALUES (?, ?, ?, ?)',
      [idUsuaria, corpo.nome.trim(), corpo.telefone.trim(), corpo.parentesco?.trim() || null]
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

// PUT /contatos/:id  { nome, telefone, parentesco? }
async function atualizar(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const corpo = req.body ?? {};
  const erro = validar(corpo);
  if (erro) return res.status(400).json({ erro });

  const [resultado] = await db.query(
    'UPDATE contato_apoio SET nome = ?, telefone = ?, parentesco = ? WHERE id_contato = ?',
    [corpo.nome.trim(), corpo.telefone.trim(), corpo.parentesco?.trim() || null, id]
  );
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ erro: 'Contato não encontrado.' });
  }
  res.json(await buscarPorId(id));
}

// DELETE /contatos/:id  (os alertas que citavam o contato ficam com id_contato NULL)
async function excluir(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const [resultado] = await db.query('DELETE FROM contato_apoio WHERE id_contato = ?', [id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ erro: 'Contato não encontrado.' });
  }
  res.status(204).end();
}

module.exports = { listar, buscar, criar, atualizar, excluir };
