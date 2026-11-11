import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { buscarAlerta, atualizarStatusAlerta, excluirAlerta } from '../../services/alertasService';
import { statusAlerta, corStatus } from '../../mocks/alertas';
import { contatosMock } from '../../mocks/contatos';
import { dataHoraTela, localizacaoTela } from '../../utils/localizacao';

export default function DetalheAlerta({ navigation, route }) {
  const { id } = route.params;
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    async function carregar() {
      setAlerta(await buscarAlerta(id));
    }
    carregar();
  }, [id]);

  // Update do CRUD: o que muda num alerta é o status
  async function mudarStatus(novoStatus) {
    setAlerta(await atualizarStatusAlerta(id, novoStatus));
  }

  async function excluir() {
    await excluirAlerta(id);
    navigation.goBack();
  }

  function confirmarExclusao() {
    // No navegador o Alert não mostra botões, então usamos window.confirm
    if (Platform.OS === 'web') {
      if (window.confirm('Excluir este alerta do histórico?')) excluir();
      return;
    }
    Alert.alert(
      'Excluir alerta',
      'Tem certeza? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: excluir },
      ]
    );
  }

  if (!alerta) {
    return (
      <View style={styles.container}>
        <Text style={styles.valor}>Carregando...</Text>
      </View>
    );
  }

  const contato = contatosMock.find((c) => c.id_contato === alerta.id_contato);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Data e hora</Text>
        <Text style={styles.valor}>{dataHoraTela(alerta.data_hora)}</Text>

        <Text style={styles.label}>Localização</Text>
        <Text style={styles.valor}>{localizacaoTela(alerta.latitude, alerta.longitude)}</Text>

        <Text style={styles.label}>Contato avisado</Text>
        <Text style={styles.valor}>{contato ? contato.nome : '—'}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={[styles.valor, { color: corStatus[alerta.status], fontWeight: 'bold' }]}>
          {alerta.status}
        </Text>
      </View>

      <Text style={styles.label}>Alterar status</Text>
      <View style={styles.opcoes}>
        {statusAlerta.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.opcao, alerta.status === s && styles.opcaoAtiva]}
            onPress={() => mudarStatus(s)}
          >
            <Text style={[styles.opcaoText, alerta.status === s && styles.opcaoTextAtiva]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.botaoExcluir} onPress={confirmarExclusao}>
        <Text style={styles.botaoExcluirText}>Excluir</Text>
      </TouchableOpacity>
    </ScrollView>
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
  card: {
    backgroundColor: '#F2EEE3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 8,
  },
  valor: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 24,
  },
  opcao: {
    borderWidth: 1,
    borderColor: '#D1CDC7',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  opcaoAtiva: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  opcaoText: {
    color: '#1A1A1A',
  },
  opcaoTextAtiva: {
    color: '#F5B700',
  },
  botaoExcluir: {
    borderWidth: 1,
    borderColor: '#C62828',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  botaoExcluirText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
