import { alertasMock } from '../mocks/alertas';
import { usuariaMock } from '../mocks/usuaria';

// As telas usam só estas funções para mexer nos alertas.
// Quando a API estiver pronta, cada uma vira uma chamada à API
// (por isso já são async) e as telas não precisam mudar.

let alertas = [...alertasMock];
let proximoId = alertas.length + 1;

// GET /usuarias/:id/alertas
export async function listarAlertas(idUsuaria = usuariaMock.id_usuaria) {
  return alertas
    .filter((a) => a.id_usuaria === idUsuaria)
    .sort((a, b) => b.data_hora.localeCompare(a.data_hora));
}

// GET /alertas/:id
export async function buscarAlerta(id) {
  return alertas.find((a) => a.id_alerta === id) ?? null;
}

// POST /alertas
// Recebe a localização e o contato (opcional); o resto é preenchido aqui.
export async function criarAlerta({ latitude, longitude, id_contato = null }) {
  const novo = {
    id_alerta: proximoId++,
    id_usuaria: usuariaMock.id_usuaria,
    id_contato,
    data_hora: agoraBanco(),
    tipo: 'SOS',
    status: 'Novo',
    latitude,
    longitude,
  };
  alertas.push(novo);
  return novo;
}

// PATCH /alertas/:id/status
export async function atualizarStatusAlerta(id, status) {
  alertas = alertas.map((a) => (a.id_alerta === id ? { ...a, status } : a));
  return buscarAlerta(id);
}

// DELETE /alertas/:id
export async function excluirAlerta(id) {
  alertas = alertas.filter((a) => a.id_alerta !== id);
}

// Data e hora atuais no formato do banco: '2026-11-11T14:30:00'
function agoraBanco() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
