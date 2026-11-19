import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { buscarOcorrencia, excluirOcorrencia } from '../../services/ocorrenciasService';
import { paraTela } from '../../utils/datas';
import { Carregando, ErroTela } from '../../components/EstadoTela';

export default function DetalheOcorrencia({ navigation, route }) {
  const { id } = route.params;
  const [ocorrencia, setOcorrencia] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const dados = await buscarOcorrencia(id);
      if (!dados) setErro('Anotação não encontrada.');
      setOcorrencia(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  // Recarrega ao voltar da edição, para mostrar os dados novos
  useEffect(() => {
    const remover = navigation.addListener('focus', carregar);
    return remover;
  }, [navigation, id]);

  async function excluir() {
    try {
      await excluirOcorrencia(id);
      navigation.goBack();
    } catch (e) {
      setErro(e.message);
    }
  }

  function confirmarExclusao() {
    // No navegador o Alert não mostra botões, então usamos window.confirm
    if (Platform.OS === 'web') {
      if (window.confirm('Excluir esta anotação?')) excluir();
      return;
    }
    Alert.alert(
      'Excluir anotação',
      'Tem certeza? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: excluir },
      ]
    );
  }

  if (carregando) return <Carregando />;
  if (erro !== '') return <ErroTela mensagem={erro} onTentar={carregar} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.card}>
        <Text style={styles.label}>Data</Text>
        <Text style={styles.valor}>{paraTela(ocorrencia.data)}</Text>

        <Text style={styles.label}>Tipo</Text>
        <Text style={styles.valor}>{ocorrencia.tipo}</Text>

        <Text style={styles.label}>Local</Text>
        <Text style={styles.valor}>{ocorrencia.local || '—'}</Text>

        <Text style={styles.label}>Descrição</Text>
        <Text style={styles.valor}>{ocorrencia.descricao}</Text>
      </View>

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => navigation.navigate('FormOcorrencia', { id })}
      >
        <Text style={styles.botaoEditarText}>Editar</Text>
      </TouchableOpacity>

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
  botaoEditar: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoEditarText: {
    color: '#F5B700',
    fontSize: 16,
    fontWeight: 'bold',
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
