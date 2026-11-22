const db = require('../db');

// Fachada financeira: o "app de finanças" que qualquer pessoa vê antes do PIN.
// Tudo é fictício: os valores só existem neste banco de teste.

// Categorias que aparecem nos gastos (o app mostra as mesmas opções)
const CATEGORIAS = ['Mercado', 'Transporte', 'Contas da casa', 'Farmácia', 'Lazer', 'Outros'];

// Converte um valor em id inteiro positivo; devolve null se não for válido
function paraId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Valor em reais: número maior que zero, com no máximo 2 casas decimais
function paraValor(valor) {
  const numero = Number(valor);
  if (typeof valor !== 'number' || !Number.isFinite(numero) || numero <= 0) return null;
  if (numero > 1000000) return null;
  return Math.round(numero * 100) / 100;
}

// O MySQL devolve DECIMAL como texto ('150.00'); o app recebe número
const numero = (v) => (v === null || v === undefined ? 0 : Number(v));

// Saldo = soma de todas as movimentações da usuária
async function saldoDe(idUsuaria, conexao = db) {
  const [[linha]] = await conexao.query(
    'SELECT COALESCE(SUM(valor), 0) AS saldo FROM movimentacao WHERE id_usuaria = ?',
    [idUsuaria]
  );
  return numero(linha.saldo);
}

// Guardado no cofrinho = o que saiu da conta para o cofrinho menos o que foi resgatado
async function guardadoDe(idUsuaria, conexao = db) {
  const [[linha]] = await conexao.query(
    `SELECT COALESCE(-SUM(valor), 0) AS guardado FROM movimentacao
     WHERE id_usuaria = ? AND tipo = 'Cofrinho'`,
    [idUsuaria]
  );
  return numero(linha.guardado);
}

const CAMPOS_MOV = `id_movimentacao, id_usuaria,
  DATE_FORMAT(data_hora, '%Y-%m-%dT%H:%i:%s') AS data_hora, tipo, descricao, categoria, valor`;

const formatarMov = (m) => ({ ...m, valor: numero(m.valor) });

// Lê ?id_usuaria= da URL (todas as rotas de listagem usam)
function idDaQuery(req, res) {
  const id = paraId(req.query.id_usuaria);
  if (!id) res.status(400).json({ erro: 'Informe um id_usuaria válido.' });
  return id;
}

// ---------- Resumo (tela Início) ----------

// GET /financas/resumo?id_usuaria=1
// Saldo, total guardado, gastos por categoria e as últimas movimentações
async function resumo(req, res) {
  const idUsuaria = idDaQuery(req, res);
  if (!idUsuaria) return;

  const [gastos] = await db.query(
    `SELECT categoria, -SUM(valor) AS total FROM movimentacao
     WHERE id_usuaria = ? AND valor < 0 AND tipo <> 'Cofrinho'
     GROUP BY categoria ORDER BY total DESC`,
    [idUsuaria]
  );
  const [ultimas] = await db.query(
    `SELECT ${CAMPOS_MOV} FROM movimentacao WHERE id_usuaria = ?
     ORDER BY data_hora DESC, id_movimentacao DESC LIMIT 5`,
    [idUsuaria]
  );
  const [[meta]] = await db.query(
    'SELECT nome_meta, valor_meta FROM cofrinho WHERE id_usuaria = ?',
    [idUsuaria]
  );

  res.json({
    saldo: await saldoDe(idUsuaria),
    guardado: await guardadoDe(idUsuaria),
    valor_meta: meta ? numero(meta.valor_meta) : null,
    gastos: gastos.map((g) => ({ categoria: g.categoria, total: numero(g.total) })),
    ultimas: ultimas.map(formatarMov),
  });
}

// ---------- Movimentações (aba Pix e Pagamentos) ----------

// GET /financas/movimentacoes?id_usuaria=1  -> extrato completo, mais recente primeiro
async function listarMovimentacoes(req, res) {
  const idUsuaria = idDaQuery(req, res);
  if (!idUsuaria) return;

  const [linhas] = await db.query(
    `SELECT ${CAMPOS_MOV} FROM movimentacao WHERE id_usuaria = ?
     ORDER BY data_hora DESC, id_movimentacao DESC`,
    [idUsuaria]
  );
  res.json(linhas.map(formatarMov));
}

// POST /financas/movimentacoes  { id_usuaria, tipo: 'Pix'|'Pagamento', descricao, categoria, valor }
// Faz um Pix ou paga uma conta: grava uma saída e devolve o novo saldo.
async function criarMovimentacao(req, res) {
  const corpo = req.body ?? {};
  const idUsuaria = paraId(corpo.id_usuaria);
  if (!idUsuaria) return res.status(400).json({ erro: 'Informe o id_usuaria.' });

  if (!['Pix', 'Pagamento'].includes(corpo.tipo)) {
    return res.status(400).json({ erro: 'Tipo deve ser Pix ou Pagamento.' });
  }
  const descricao = typeof corpo.descricao === 'string' ? corpo.descricao.trim() : '';
  if (!descricao || descricao.length > 100) {
    return res.status(400).json({ erro: 'Informe para quem é o Pix ou o que está pagando.' });
  }
  const categoria = CATEGORIAS.includes(corpo.categoria) ? corpo.categoria : 'Outros';
  const valor = paraValor(corpo.valor);
  if (!valor) return res.status(400).json({ erro: 'Informe um valor maior que zero.' });

  if (valor > (await saldoDe(idUsuaria))) {
    return res.status(400).json({ erro: 'Saldo insuficiente.' });
  }

  try {
    const [resultado] = await db.query(
      `INSERT INTO movimentacao (id_usuaria, data_hora, tipo, descricao, categoria, valor)
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      [idUsuaria, corpo.tipo, descricao, categoria, -valor]
    );
    const [[mov]] = await db.query(
      `SELECT ${CAMPOS_MOV} FROM movimentacao WHERE id_movimentacao = ?`,
      [resultado.insertId]
    );
    res.status(201).json({ movimentacao: formatarMov(mov), saldo: await saldoDe(idUsuaria) });
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ erro: 'Usuária não encontrada.' });
    }
    throw e;
  }
}

// ---------- Lembretes de contas (aba Anotações) ----------

const CAMPOS_LEMBRETE = `id_lembrete, id_usuaria, descricao, valor,
  DATE_FORMAT(vencimento, '%Y-%m-%d') AS vencimento, pago`;

const formatarLembrete = (l) => ({ ...l, valor: numero(l.valor), pago: Boolean(l.pago) });

// GET /financas/lembretes?id_usuaria=1  -> a pagar primeiro, por vencimento
async function listarLembretes(req, res) {
  const idUsuaria = idDaQuery(req, res);
  if (!idUsuaria) return;

  const [linhas] = await db.query(
    `SELECT ${CAMPOS_LEMBRETE} FROM lembrete_conta WHERE id_usuaria = ?
     ORDER BY pago ASC, vencimento ASC`,
    [idUsuaria]
  );
  res.json(linhas.map(formatarLembrete));
}

// POST /financas/lembretes  { id_usuaria, descricao, valor, vencimento: 'AAAA-MM-DD' }
async function criarLembrete(req, res) {
  const corpo = req.body ?? {};
  const idUsuaria = paraId(corpo.id_usuaria);
  if (!idUsuaria) return res.status(400).json({ erro: 'Informe o id_usuaria.' });

  const descricao = typeof corpo.descricao === 'string' ? corpo.descricao.trim() : '';
  if (!descricao || descricao.length > 100) {
    return res.status(400).json({ erro: 'Informe o nome da conta.' });
  }
  const valor = paraValor(corpo.valor);
  if (!valor) return res.status(400).json({ erro: 'Informe um valor maior que zero.' });

  const vencimento = corpo.vencimento;
  const dataValida = typeof vencimento === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(vencimento)
    && !Number.isNaN(new Date(`${vencimento}T00:00:00`).getTime());
  if (!dataValida) return res.status(400).json({ erro: 'Vencimento inválido.' });

  try {
    const [resultado] = await db.query(
      'INSERT INTO lembrete_conta (id_usuaria, descricao, valor, vencimento) VALUES (?, ?, ?, ?)',
      [idUsuaria, descricao, valor, vencimento]
    );
    const [[lembrete]] = await db.query(
      `SELECT ${CAMPOS_LEMBRETE} FROM lembrete_conta WHERE id_lembrete = ?`,
      [resultado.insertId]
    );
    res.status(201).json(formatarLembrete(lembrete));
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ erro: 'Usuária não encontrada.' });
    }
    throw e;
  }
}

// POST /financas/lembretes/:id/pagar
// Marca a conta como paga e desconta do saldo, tudo numa transação:
// ou as duas coisas acontecem, ou nenhuma.
async function pagarLembrete(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const conexao = await db.getConnection();
  try {
    await conexao.beginTransaction();

    const [[lembrete]] = await conexao.query(
      'SELECT * FROM lembrete_conta WHERE id_lembrete = ? FOR UPDATE',
      [id]
    );
    if (!lembrete) {
      await conexao.rollback();
      return res.status(404).json({ erro: 'Conta não encontrada.' });
    }
    if (lembrete.pago) {
      await conexao.rollback();
      return res.status(400).json({ erro: 'Esta conta já foi paga.' });
    }
    if (numero(lembrete.valor) > (await saldoDe(lembrete.id_usuaria, conexao))) {
      await conexao.rollback();
      return res.status(400).json({ erro: 'Saldo insuficiente.' });
    }

    await conexao.query(
      `INSERT INTO movimentacao (id_usuaria, data_hora, tipo, descricao, categoria, valor)
       VALUES (?, NOW(), 'Pagamento', ?, 'Contas da casa', ?)`,
      [lembrete.id_usuaria, lembrete.descricao, -numero(lembrete.valor)]
    );
    await conexao.query('UPDATE lembrete_conta SET pago = 1 WHERE id_lembrete = ?', [id]);
    await conexao.commit();

    const [[atualizado]] = await db.query(
      `SELECT ${CAMPOS_LEMBRETE} FROM lembrete_conta WHERE id_lembrete = ?`,
      [id]
    );
    res.json(formatarLembrete(atualizado));
  } catch (e) {
    await conexao.rollback();
    throw e;
  } finally {
    conexao.release();
  }
}

// DELETE /financas/lembretes/:id
async function excluirLembrete(req, res) {
  const id = paraId(req.params.id);
  if (!id) return res.status(400).json({ erro: 'Id inválido.' });

  const [resultado] = await db.query('DELETE FROM lembrete_conta WHERE id_lembrete = ?', [id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ erro: 'Conta não encontrada.' });
  }
  res.status(204).end();
}

// ---------- Cofrinho (aba Cofrinho) ----------

// GET /financas/cofrinho?id_usuaria=1  -> meta, quanto já foi guardado e o saldo da conta
async function dadosCofrinho(idUsuaria) {
  const [[meta]] = await db.query(
    'SELECT nome_meta, valor_meta FROM cofrinho WHERE id_usuaria = ?',
    [idUsuaria]
  );
  return {
    nome_meta: meta?.nome_meta ?? 'Minha meta',
    valor_meta: meta ? numero(meta.valor_meta) : 0,
    guardado: await guardadoDe(idUsuaria),
    saldo: await saldoDe(idUsuaria),
  };
}

async function buscarCofrinho(req, res) {
  const idUsuaria = idDaQuery(req, res);
  if (!idUsuaria) return;
  res.json(await dadosCofrinho(idUsuaria));
}

// PUT /financas/cofrinho  { id_usuaria, nome_meta, valor_meta }  -> cria ou altera a meta
async function salvarMeta(req, res) {
  const corpo = req.body ?? {};
  const idUsuaria = paraId(corpo.id_usuaria);
  if (!idUsuaria) return res.status(400).json({ erro: 'Informe o id_usuaria.' });

  const nome = typeof corpo.nome_meta === 'string' ? corpo.nome_meta.trim() : '';
  if (!nome || nome.length > 60) return res.status(400).json({ erro: 'Informe o nome da meta.' });
  const valor = paraValor(corpo.valor_meta);
  if (!valor) return res.status(400).json({ erro: 'Informe o valor da meta.' });

  try {
    await db.query(
      `INSERT INTO cofrinho (id_usuaria, nome_meta, valor_meta) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nome_meta = VALUES(nome_meta), valor_meta = VALUES(valor_meta)`,
      [idUsuaria, nome, valor]
    );
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ erro: 'Usuária não encontrada.' });
    }
    throw e;
  }
  res.json(await dadosCofrinho(idUsuaria));
}

// POST /financas/cofrinho/movimentar  { id_usuaria, operacao: 'guardar'|'resgatar', valor }
// Guardar tira da conta e põe no cofrinho; resgatar faz o contrário.
async function movimentarCofrinho(req, res) {
  const corpo = req.body ?? {};
  const idUsuaria = paraId(corpo.id_usuaria);
  if (!idUsuaria) return res.status(400).json({ erro: 'Informe o id_usuaria.' });
  if (!['guardar', 'resgatar'].includes(corpo.operacao)) {
    return res.status(400).json({ erro: 'Operação deve ser guardar ou resgatar.' });
  }
  const valor = paraValor(corpo.valor);
  if (!valor) return res.status(400).json({ erro: 'Informe um valor maior que zero.' });

  const guardar = corpo.operacao === 'guardar';
  if (guardar && valor > (await saldoDe(idUsuaria))) {
    return res.status(400).json({ erro: 'Saldo insuficiente.' });
  }
  if (!guardar && valor > (await guardadoDe(idUsuaria))) {
    return res.status(400).json({ erro: 'O cofrinho não tem esse valor.' });
  }

  try {
    await db.query(
      `INSERT INTO movimentacao (id_usuaria, data_hora, tipo, descricao, categoria, valor)
       VALUES (?, NOW(), 'Cofrinho', ?, 'Cofrinho', ?)`,
      [idUsuaria, guardar ? 'Guardado no cofrinho' : 'Resgate do cofrinho', guardar ? -valor : valor]
    );
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ erro: 'Usuária não encontrada.' });
    }
    throw e;
  }
  res.json(await dadosCofrinho(idUsuaria));
}

module.exports = {
  resumo,
  listarMovimentacoes,
  criarMovimentacao,
  listarLembretes,
  criarLembrete,
  pagarLembrete,
  excluirLembrete,
  buscarCofrinho,
  salvarMeta,
  movimentarCofrinho,
};
