import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { buscarResumoFinancas } from '../services/financasService';
import { reais, reaisComSinal, diaMes } from '../utils/dinheiro';

// Tela de fachada (aba Início): parece um app comum de controle financeiro.
// Saldo, gastos e movimentações vêm da API (/financas/resumo) e mudam quando
// a pessoa faz um Pix, paga uma conta ou mexe no cofrinho nas outras abas.
// Segurar o card do saldo por 3 segundos abre o PIN da área de apoio
// (não há nenhuma dica visível disso na tela).

export default function Home({ navigation }) {
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState('');

  // Busca de novo toda vez que a aba aparece (ex.: depois de um Pix)
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      buscarResumoFinancas()
        .then((dados) => { if (ativo) { setResumo(dados); setErro(''); } })
        .catch((e) => { if (ativo) setErro(e.message); });
      return () => { ativo = false; };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.topo}>
          <Image source={require('../assets/poupa-bem-logo.png')} style={styles.logo} />
          <Text style={styles.marca}>PoupaBem</Text>
        </View>

        {/* Toque comum não faz nada; segurar 3 s abre o PIN.
            O card aparece mesmo se a API falhar, para o PIN continuar acessível. */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.cardSaldo}
          onLongPress={() => navigation.navigate('Pin')}
          delayLongPress={3000}
        >
          <Text style={styles.saldoLabel}>Saldo disponível</Text>
          {resumo ? (
            <Text style={styles.saldoValor}>{reais(resumo.saldo)}</Text>
          ) : (
            <View style={styles.saldoCarregando}>
              {!erro && <ActivityIndicator color="#F5B700" />}
              {erro !== '' && <Text style={styles.saldoValor}>R$ --</Text>}
            </View>
          )}
          <Text style={styles.saldoMeta}>
            {resumo?.valor_meta
              ? `Cofrinho: ${reais(resumo.guardado)} de ${reais(resumo.valor_meta)}`
              : 'Cofrinho'}
          </Text>
        </TouchableOpacity>

        {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

        {resumo && (
          <>
            <Text style={styles.secao}>Gastos do mês</Text>
            <View style={styles.card}>
              {resumo.gastos.length === 0 && <Text style={styles.vazio}>Nenhum gasto ainda.</Text>}
              {resumo.gastos.map((g) => (
                <View key={g.categoria} style={styles.linha}>
                  <Text style={styles.texto}>{g.categoria}</Text>
                  <Text style={styles.texto}>{reais(g.total)}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.secao}>Últimas movimentações</Text>
            <View style={styles.card}>
              {resumo.ultimas.map((m) => (
                <View key={m.id_movimentacao} style={styles.linha}>
                  <View style={styles.descricao}>
                    <Text style={styles.texto}>{m.descricao}</Text>
                    <Text style={styles.data}>{diaMes(m.data_hora)}</Text>
                  </View>
                  <Text style={[styles.texto, { color: m.valor >= 0 ? '#2E7D32' : '#C62828' }]}>
                    {reaisComSinal(m.valor)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
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
  saldoCarregando: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  saldoMeta: {
    color: '#D1CDC7',
    fontSize: 13,
  },
  erro: {
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 16,
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
  descricao: {
    flex: 1,
    marginRight: 12,
  },
  texto: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  data: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  vazio: {
    fontSize: 14,
    color: '#6B6B6B',
    paddingVertical: 8,
  },
});
