import { requisicao } from './api';
import { ID_USUARIA_TESTE } from '../constantes';

// As telas do Perfil usam só estas funções; cada uma chama uma rota de /usuarias.

// Usuária que está usando o app. Começa na usuária de teste (id 1)
// e muda quando um perfil novo é criado.
let idUsuariaAtual = ID_USUARIA_TESTE;

export function getIdUsuaria() {
  return idUsuariaAtual;
}

// GET /usuarias/:id  -> devolve null se a usuária não existe (404)
export async function buscarUsuaria(id = idUsuariaAtual) {
  try {
    return await requisicao(`/usuarias/${id}`);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

// GET /usuarias/:id/resumo  -> quantos alertas estão ligados a ela
export async function buscarResumo(id = idUsuariaAtual) {
  return requisicao(`/usuarias/${id}/resumo`);
}

// POST /usuarias  { nome, email, pin }
export async function criarUsuaria(dados) {
  const nova = await requisicao('/usuarias', { method: 'POST', body: JSON.stringify(dados) });
  idUsuariaAtual = nova.id_usuaria;
  return nova;
}

// PUT /usuarias/:id  { nome, email, pin? }
export async function atualizarUsuaria(id, dados) {
  return requisicao(`/usuarias/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
}

// DELETE /usuarias/:id  (o banco apaga junto os alertas dela)
export async function excluirUsuaria(id) {
  await requisicao(`/usuarias/${id}`, { method: 'DELETE' });
}

// POST /usuarias/:id/verificar-pin  -> true se o PIN confere
export async function verificarPin(pin, id = idUsuariaAtual) {
  const { valido } = await requisicao(`/usuarias/${id}/verificar-pin`, {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
  return valido;
}
