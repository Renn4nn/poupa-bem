import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

// Telas que buscam dados na API mostram um destes enquanto não têm o que exibir.

// Rodinha de "carregando"
export function Carregando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color="#1A1A1A" />
    </View>
  );
}

// Mensagem de erro (ex.: API desligada) com botão para tentar de novo
export function ErroTela({ mensagem, onTentar }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.erro}>{mensagem}</Text>
      {onTentar && (
        <TouchableOpacity style={styles.botao} onPress={onTentar}>
          <Text style={styles.botaoText}>Tentar de novo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    backgroundColor: '#FEFDFD',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  erro: {
    color: '#C62828',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  botaoText: {
    color: '#F5B700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
