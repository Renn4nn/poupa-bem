import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tela de fachada: parece um app comum de controle financeiro.
// Os valores são fictícios e fixos. Segurar o card do saldo por 3 segundos
// abre o PIN da área de apoio (não há nenhuma dica visível disso na tela).

const gastos = [
  { categoria: 'Mercado', valor: 'R$ 412,80' },
  { categoria: 'Transporte', valor: 'R$ 156,00' },
  { categoria: 'Contas da casa', valor: 'R$ 289,35' },
  { categoria: 'Farmácia', valor: 'R$ 74,90' },
];

const movimentacoes = [
  { descricao: 'Salário', data: '05/11', valor: '+ R$ 2.800,00', entrada: true },
  { descricao: 'Supermercado', data: '09/11', valor: '- R$ 186,40', entrada: false },
  { descricao: 'Conta de luz', data: '12/11', valor: '- R$ 132,15', entrada: false },
  { descricao: 'Transferência recebida', data: '14/11', valor: '+ R$ 150,00', entrada: true },
];

export default function Home({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.topo}>
          <Image source={require('../assets/poupa-bem-logo.png')} style={styles.logo} />
          <Text style={styles.marca}>PoupaBem</Text>
        </View>

        {/* Toque comum não faz nada; segurar 3 s abre o PIN */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.cardSaldo}
          onLongPress={() => navigation.navigate('Pin')}
          delayLongPress={3000}
        >
          <Text style={styles.saldoLabel}>Saldo disponível</Text>
          <Text style={styles.saldoValor}>R$ 2.350,40</Text>
          <Text style={styles.saldoMeta}>Meta do mês: guardar R$ 300,00</Text>
        </TouchableOpacity>

        <Text style={styles.secao}>Gastos do mês</Text>
        <View style={styles.card}>
          {gastos.map((g) => (
            <View key={g.categoria} style={styles.linha}>
              <Text style={styles.texto}>{g.categoria}</Text>
              <Text style={styles.texto}>{g.valor}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.secao}>Últimas movimentações</Text>
        <View style={styles.card}>
          {movimentacoes.map((m) => (
            <View key={m.descricao} style={styles.linha}>
              <View>
                <Text style={styles.texto}>{m.descricao}</Text>
                <Text style={styles.data}>{m.data}</Text>
              </View>
              <Text style={[styles.texto, { color: m.entrada ? '#2E7D32' : '#C62828' }]}>
                {m.valor}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFD',
  },
  content: {
    padding: 24,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  marca: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  cardSaldo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  saldoLabel: {
    color: '#FEFDFD',
    fontSize: 14,
  },
  saldoValor: {
    color: '#F5B700',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  saldoMeta: {
    color: '#D1CDC7',
    fontSize: 13,
  },
  secao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#F2EEE3',
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
  texto: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  data: {
    fontSize: 12,
    color: '#6B6B6B',
  },
});
