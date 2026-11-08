import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { listarOcorrencias } from '../../services/ocorrenciasService';
import { paraTela } from '../../utils/datas';

export default function ListaOcorrencias({ navigation }) {
  const [ocorrencias, setOcorrencias] = useState([]);

  // Recarrega a lista sempre que a tela volta a aparecer
  // (depois de criar, editar ou excluir uma anotação)
  useEffect(() => {
    async function carregar() {
      const dados = await listarOcorrencias();
      setOcorrencias(dados);
    }
    const remover = navigation.addListener('focus', carregar);
    return remover;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.botaoNovo}
        onPress={() => navigation.navigate('FormOcorrencia')}
      >
        <Text style={styles.botaoNovoText}>+ Nova anotação</Text>
      </TouchableOpacity>

      <FlatList
        data={ocorrencias}
        keyExtractor={(item) => String(item.id_ocorrencia)}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma anotação ainda.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cartao}
            onPress={() => navigation.navigate('DetalheOcorrencia', { id: item.id_ocorrencia })}
          >
            <View style={styles.linha}>
              <Text style={styles.tipo}>{item.tipo}</Text>
              <Text style={styles.data}>{paraTela(item.data)}</Text>
            </View>
            <Text style={styles.descricao} numberOfLines={1}>{item.descricao}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.aviso}>Emergência: 190 · Central de Atendimento à Mulher: 180</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFD',
    padding: 24,
  },
  botaoNovo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoNovoText: {
    color: '#F5B700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vazio: {
    textAlign: 'center',
    color: '#6B6B6B',
    marginTop: 24,
  },
  cartao: {
    backgroundColor: '#F2EEE3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  data: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  descricao: {
    fontSize: 14,
    color: '#1A1A1A',
    marginTop: 6,
  },
  aviso: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 12,
  },
});
