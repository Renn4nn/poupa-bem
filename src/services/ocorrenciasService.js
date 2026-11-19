import { requisicao } from './api';
import { getIdUsuaria } from './usuariaService';

// As telas usam só estas funções para mexer nas ocorrências;
// cada uma chama uma rota de /ocorrencias na API.

// GET /ocorrencias?id_usuaria=1  (a API já devolve da mais recente para a mais antiga)
export async function listarOcorrencias(idUsuaria = getIdUsuaria()) {
  return requisicao(`/ocorrencias?id_usuaria=${idUsuaria}`);
}

// GET /ocorrencias/:id  -> devolve null se não existe (404)
export async function buscarOcorrencia(id) {
  try {
    return await requisicao(`/ocorrencias/${id}`);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

// POST /ocorrencias  { id_usuaria, data, tipo, local, descricao }
export async function criarOcorrencia(dados) {
  return requisicao('/ocorrencias', {
    method: 'POST',
    body: JSON.stringify({ ...dados, id_usuaria: getIdUsuaria() }),
  });
}

// PUT /ocorrencias/:id
export async function atualizarOcorrencia(id, dados) {
  return requisicao(`/ocorrencias/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
}

// DELETE /ocorrencias/:id
export async function excluirOcorrencia(id) {
  await requisicao(`/ocorrencias/${id}`, { method: 'DELETE' });
}
