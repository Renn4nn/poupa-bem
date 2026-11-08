// No banco a data fica '2026-10-20'; na tela aparece '20/10/2026'

// '2026-10-20' -> '20/10/2026'
export function paraTela(dataBanco) {
  const [ano, mes, dia] = dataBanco.split('-');
  return `${dia}/${mes}/${ano}`;
}

// '20/10/2026' -> '2026-10-20' (null se a data não existir)
export function paraBanco(dataTela) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataTela);
  if (!partes) return null;
  const [, dia, mes, ano] = partes;

  // new Date transforma 31/02 em 03/03; se o dia mudou, a data é inválida
  const d = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (d.getDate() !== Number(dia) || d.getMonth() !== Number(mes) - 1) return null;
  return `${ano}-${mes}-${dia}`;
}

export function hojeTela() {
  const d = new Date();
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}
