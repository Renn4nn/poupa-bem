import { requisicao } from './api';
import { getIdUsuaria } from './usuariaService';

// As telas usam só estas funções para mexer nos alertas;
// cada uma chama uma rota de /alertas na API.

// GET /alertas?id_usuaria=1  (a API já devolve do mais recente para o mais antigo)
export async function listarAlertas(idUsuaria = getIdUsuaria()) {
  return requisicao(`/alertas?id_usuaria=${idUsuaria}`);
}

// GET /alertas/:id  -> devolve null se não existe (404)
export async function buscarAlerta(id) {
  try {
    return await requisicao(`/alertas/${id}`);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

// POST /alertas  { id_usuaria, latitude, longitude, id_contato }
// Data/hora, tipo e status ('Novo') são preenchidos pela API.
export async function criarAlerta({ latitude, longitude, id_contato = null }) {
  return requisicao('/alertas', {
    method: 'POST',
    body: JSON.stringify({ id_usuaria: getIdUsuaria(), latitude, longitude, id_contato }),
  });
}

// PATCH /alertas/:id/status  { status }
export async function atualizarStatusAlerta(id, status) {
  return requisicao(`/alertas/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

// DELETE /alertas/:id
export async function excluirAlerta(id) {
  await requisicao(`/alertas/${id}`, { method: 'DELETE' });
}
