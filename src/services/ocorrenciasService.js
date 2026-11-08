import { ocorrenciasMock } from '../mocks/ocorrencias';
import { usuariaMock } from '../mocks/usuaria';

// As telas usam só estas funções para mexer nas ocorrências.
// Na Entrega 4 cada uma vira uma chamada à API (por isso já são async).

let ocorrencias = [...ocorrenciasMock];
let proximoId = ocorrencias.length + 1;

// GET /usuarias/:id/ocorrencias
export async function listarOcorrencias(idUsuaria = usuariaMock.id_usuaria) {
  return ocorrencias
    .filter((o) => o.id_usuaria === idUsuaria)
    .sort((a, b) => b.data.localeCompare(a.data));
}

// GET /ocorrencias/:id
export async function buscarOcorrencia(id) {
  return ocorrencias.find((o) => o.id_ocorrencia === id) ?? null;
}

// POST /ocorrencias
export async function criarOcorrencia(dados) {
  const nova = {
    ...dados,
    id_ocorrencia: proximoId++,
    id_usuaria: usuariaMock.id_usuaria,
  };
  ocorrencias.push(nova);
  return nova;
}

// PUT /ocorrencias/:id
export async function atualizarOcorrencia(id, dados) {
  ocorrencias = ocorrencias.map((o) =>
    o.id_ocorrencia === id ? { ...o, ...dados } : o
  );
  return buscarOcorrencia(id);
}

// DELETE /ocorrencias/:id
export async function excluirOcorrencia(id) {
  ocorrencias = ocorrencias.filter((o) => o.id_ocorrencia !== id);
}
