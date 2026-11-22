import { StyleSheet } from 'react-native';

// Estilos repetidos nas abas da fachada financeira (mesmas cores do resto do app)
export const cores = {
  fundo: '#FEFDFD',
  cartao: '#F2EEE3',
  texto: '#1A1A1A',
  cinza: '#6B6B6B',
  borda: '#D1CDC7',
  amarelo: '#F5B700',
  verde: '#2E7D32',
  vermelho: '#C62828',
};

export const ef = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  content: { padding: 24 },
  secao: { fontSize: 16, fontWeight: 'bold', color: cores.texto, marginBottom: 10 },
  card: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  texto: { fontSize: 15, color: cores.texto },
  textoMenor: { fontSize: 12, color: cores.cinza },
  vazio: { fontSize: 14, color: cores.cinza, paddingVertical: 8 },
  label: { fontSize: 13, color: cores.cinza, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: cores.texto,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  botao: {
    backgroundColor: cores.texto,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoTexto: { color: cores.amarelo, fontSize: 16, fontWeight: 'bold' },
  botaoDesativado: { opacity: 0.6 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  opcao: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  opcaoAtiva: { backgroundColor: cores.texto, borderColor: cores.texto },
  opcaoTexto: { color: cores.texto },
  opcaoTextoAtiva: { color: cores.amarelo },
  erro: { color: cores.vermelho, marginBottom: 12, textAlign: 'center' },
  sucesso: { color: cores.verde, marginBottom: 12, textAlign: 'center' },
});

// Cabeçalho claro das abas da fachada (sem a saída rápida da área de apoio)
export const opcoesHeaderFachada = {
  headerStyle: { backgroundColor: cores.fundo },
  headerTintColor: cores.texto,
  headerShadowVisible: false,
};
