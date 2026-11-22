// Funções de apoio para valores em reais e datas da fachada financeira.

// 2350.4 -> 'R$ 2.350,40'
export function reais(valor) {
  const [inteiro, centavos] = Math.abs(valor).toFixed(2).split('.');
  const comPontos = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${valor < 0 ? '- ' : ''}R$ ${comPontos},${centavos}`;
}

// Valor com sinal para o extrato: '+ R$ 150,00' ou '- R$ 74,90'
export function reaisComSinal(valor) {
  return valor >= 0 ? `+ ${reais(valor)}` : reais(valor);
}

// Texto digitado ('1.234,56', '50', '12.5') -> número (1234.56). Inválido -> null
export function lerValor(texto) {
  let limpo = String(texto).trim().replace(/\s|R\$/g, '');
  if (limpo.includes(',')) limpo = limpo.replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  const numero = Number(limpo);
  return numero > 0 ? numero : null;
}

// '2026-11-14T12:00:00' -> '14/11'
export function diaMes(dataHora) {
  const [, mes, dia] = dataHora.slice(0, 10).split('-');
  return `${dia}/${mes}`;
}

// '2026-11-25' -> '25/11/2026'
export function dataBr(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

// '25/11/2026' -> '2026-11-25'. Inválida -> null
export function lerData(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (data.getDate() !== Number(dia) || data.getMonth() !== Number(mes) - 1) return null;
  return `${ano}-${mes}-${dia}`;
}
