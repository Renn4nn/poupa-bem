const bcrypt = require('bcryptjs');
const db = require('../db');

// Colunas que podem sair da API. O pin_hash nunca é devolvido.
const CAMPOS = 'id_usuaria, nome, email, data_cadastro';

// Valida o corpo da requisição; devolve a mensagem de erro ou null
function validar({ nome, email, pin }, pinObrigatorio) {
  if (typeof nome !== 'string' || nome.trim() === '' || nome.trim().length > 100) {
    return 'Informe o nome (até 100 caracteres).';
  }
  if (typeof email !== 'string' || !email.includes('@') || email.trim().length > 120) {
    return 'Informe um e-mail válido.';
  }
  // No PUT o PIN é opcional: só valida se ele foi enviado
  if (pin === undefined || pin === '') {
    if (pinObrigatorio) return 'Informe o PIN de 4 números.';
  } else if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return 'O PIN deve ter 4 números.';
  }
  return null;
}

// Converte o :id da URL em número; devolve null se não for um id válido
function lerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function buscarPorId(id) {
  const [linhas] = await db.query(`SELECT ${CAMPOS} FROM usuaria WHERE id_usuaria = ?`, [id]);
  return linhas[0] ?? null;
}

// GET /usuarias
async function listar(req, res) {
  const [linhas] = await db.query(`SELECT ${CAMPOS} FROM usuaria ORDER BY id_usuaria`);
  res.json(linhas);
}

// GET /usuarias/:id
async function buscar(req, res) {
  const id = lerId(req);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const usuaria = await buscarPorId(id);
  if (!usuaria) return res.status(404).json({ erro: 'Usuária não encontrada.' });

  res.json(usuaria);
}

// POST /usuarias  { nome, email, pin }
async function criar(req, res) {
  const corpo = req.body ?? {};
  const erro = validar(corpo, true);
  if (erro) return res.status(400).json({ erro });

  const pinHash = await bcrypt.hash(corpo.pin, 10);
  try {
    const [resultado] = await db.query(
      'INSERT INTO usuaria (nome, email, pin_hash, data_cadastro) VALUES (?, ?, ?, CURDATE())',
      [corpo.nome.trim(), corpo.email.trim().toLowerCase(), pinHash]
    );
    res.status(201).json(await buscarPorId(resultado.insertId));
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe uma usuária com este e-mail.' });
    }
    throw e;
  }
}

// PUT /usuarias/:id  { nome, email, pin? }
async function atualizar(req, res) {
  const id = lerId(req);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const corpo = req.body ?? {};
  const erro = validar(corpo, false);
  if (erro) return res.status(400).json({ erro });

  const nome = corpo.nome.trim();
  const email = corpo.email.trim().toLowerCase();

  // Só troca o hash se um PIN novo foi enviado
  let sql = 'UPDATE usuaria SET nome = ?, email = ? WHERE id_usuaria = ?';
  let valores = [nome, email, id];
  if (corpo.pin) {
    sql = 'UPDATE usuaria SET nome = ?, email = ?, pin_hash = ? WHERE id_usuaria = ?';
    valores = [nome, email, await bcrypt.hash(corpo.pin, 10), id];
  }

  try {
    const [resultado] = await db.query(sql, valores);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuária não encontrada.' });
    }
    res.json(await buscarPorId(id));
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe uma usuária com este e-mail.' });
    }
    throw e;
  }
}

// DELETE /usuarias/:id
async function excluir(req, res) {
  const id = lerId(req);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const [resultado] = await db.query('DELETE FROM usuaria WHERE id_usuaria = ?', [id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ erro: 'Usuária não encontrada.' });
  }
  res.status(204).end();
}

// GET /usuarias/:id/resumo
// Relacionamento USUARIA 1:N ALERTA: conta os alertas ligados à usuária.
// Quando as tabelas de contatos e ocorrências existirem, as contagens delas entram aqui.
async function resumo(req, res) {
  const id = lerId(req);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const [linhas] = await db.query(
    `SELECT u.id_usuaria,
            (SELECT COUNT(*) FROM alerta a WHERE a.id_usuaria = u.id_usuaria) AS total_alertas
       FROM usuaria u
      WHERE u.id_usuaria = ?`,
    [id]
  );
  if (linhas.length === 0) return res.status(404).json({ erro: 'Usuária não encontrada.' });

  res.json(linhas[0]);
}

// POST /usuarias/:id/verificar-pin  { pin }
// Compara o PIN digitado com o hash salvo; o hash nunca sai da API.
async function verificarPin(req, res) {
  const id = lerId(req);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const { pin } = req.body ?? {};
  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ erro: 'O PIN deve ter 4 números.' });
  }

  const [linhas] = await db.query('SELECT pin_hash FROM usuaria WHERE id_usuaria = ?', [id]);
  if (linhas.length === 0) return res.status(404).json({ erro: 'Usuária não encontrada.' });

  const valido = await bcrypt.compare(pin, linhas[0].pin_hash);
  res.json({ valido });
}

module.exports = { listar, buscar, criar, atualizar, excluir, resumo, verificarPin };
