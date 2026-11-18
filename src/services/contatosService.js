import { requisicao } from './api';
import { getIdUsuaria } from './usuariaService';

// As telas de Contatos usam só estas funções; cada uma chama uma rota de /contatos.

// GET /contatos?id_usuaria=1
export async function listarContatos(idUsuaria = getIdUsuaria()) {
  return requisicao(`/contatos?id_usuaria=${idUsuaria}`);
}

// GET /contatos/:id  -> devolve null se o contato não existe (404)
export async function buscarContato(id) {
  try {
    return await requisicao(`/contatos/${id}`);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

// POST /contatos  { id_usuaria, nome, telefone, parentesco? }
export async function criarContato(dados) {
  return requisicao('/contatos', {
    method: 'POST',
    body: JSON.stringify({ ...dados, id_usuaria: getIdUsuaria() }),
  });
}

// PUT /contatos/:id  { nome, telefone, parentesco? }
export async function atualizarContato(id, dados) {
  return requisicao(`/contatos/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
}

// DELETE /contatos/:id
export async function excluirContato(id) {
  await requisicao(`/contatos/${id}`, { method: 'DELETE' });
}
