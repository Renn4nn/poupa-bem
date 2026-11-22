import { requisicao } from './api';
import { getIdUsuaria } from './usuariaService';

// Fachada financeira: as abas que aparecem antes do PIN.
// Cada função chama uma rota de /financas na API.

// GET /financas/resumo  -> { saldo, guardado, valor_meta, gastos, ultimas }
export async function buscarResumoFinancas() {
  return requisicao(`/financas/resumo?id_usuaria=${getIdUsuaria()}`);
}

// GET /financas/movimentacoes  -> extrato completo
export async function listarMovimentacoes() {
  return requisicao(`/financas/movimentacoes?id_usuaria=${getIdUsuaria()}`);
}

// POST /financas/movimentacoes  -> faz um Pix ou paga uma conta
export async function criarMovimentacao({ tipo, descricao, categoria, valor }) {
  return requisicao('/financas/movimentacoes', {
    method: 'POST',
    body: JSON.stringify({ id_usuaria: getIdUsuaria(), tipo, descricao, categoria, valor }),
  });
}

// GET /financas/lembretes  -> contas a pagar
export async function listarLembretes() {
  return requisicao(`/financas/lembretes?id_usuaria=${getIdUsuaria()}`);
}

// POST /financas/lembretes  { descricao, valor, vencimento: 'AAAA-MM-DD' }
export async function criarLembrete({ descricao, valor, vencimento }) {
  return requisicao('/financas/lembretes', {
    method: 'POST',
    body: JSON.stringify({ id_usuaria: getIdUsuaria(), descricao, valor, vencimento }),
  });
}

// POST /financas/lembretes/:id/pagar  -> marca como paga e desconta do saldo
export async function pagarLembrete(id) {
  return requisicao(`/financas/lembretes/${id}/pagar`, { method: 'POST' });
}

// DELETE /financas/lembretes/:id
export async function excluirLembrete(id) {
  await requisicao(`/financas/lembretes/${id}`, { method: 'DELETE' });
}

// GET /financas/cofrinho  -> { nome_meta, valor_meta, guardado, saldo }
export async function buscarCofrinho() {
  return requisicao(`/financas/cofrinho?id_usuaria=${getIdUsuaria()}`);
}

// PUT /financas/cofrinho  -> cria ou altera a meta
export async function salvarMeta({ nome_meta, valor_meta }) {
  return requisicao('/financas/cofrinho', {
    method: 'PUT',
    body: JSON.stringify({ id_usuaria: getIdUsuaria(), nome_meta, valor_meta }),
  });
}

// POST /financas/cofrinho/movimentar  { operacao: 'guardar' | 'resgatar', valor }
export async function movimentarCofrinho(operacao, valor) {
  return requisicao('/financas/cofrinho/movimentar', {
    method: 'POST',
    body: JSON.stringify({ id_usuaria: getIdUsuaria(), operacao, valor }),
  });
}
