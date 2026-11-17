// Endereço da API. No navegador, localhost funciona; no celular (Expo Go) use o IP
// do computador, criando um .env na raiz com: EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// Faz uma chamada à API e devolve o JSON da resposta.
// Se a API responder erro, lança um Error com a mensagem dela e o status HTTP.
export async function requisicao(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes.headers },
    });
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique se a API está rodando.');
  }

  if (resposta.status === 204) return null; // DELETE não devolve corpo

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const erro = new Error(dados?.erro ?? `Erro ${resposta.status} na API.`);
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}
