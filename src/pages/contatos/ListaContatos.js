import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { listarContatos } from '../../services/contatosService';
import { Carregando, ErroTela } from '../../components/EstadoTela';

export default function ListaContatos({ navigation }) {
  const [contatos, setContatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setContatos(await listarContatos());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  // Recarrega sempre que a tela aparece (depois de criar, editar ou excluir)
  useEffect(() => {
    const remover = navigation.addListener('focus', carregar);
    return remover;
  }, [navigation]);

  if (carregando) return <Carregando />;
  if (erro !== '') return <ErroTela mensagem={erro} onTentar={carregar} />;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pagamentos</Text>
      <Text style={styles.subtitulo}>Contatos salvos</Text>

      <TouchableOpacity style={styles.botaoNovo} onPress={() => navigation.navigate('FormContato')}>
        <Text style={styles.botaoNovoText}>+ Novo contato</Text>
      </TouchableOpacity>

      <FlatList
        data={contatos}
        keyExtractor={(contato) => String(contato.id_contato)}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum contato salvo.</Text>}
        renderItem={({ item }) => (
          // Tocar no contato abre o formulário já preenchido (editar/excluir)
          <TouchableOpacity
            style={styles.cartao}
            onPress={() => navigation.navigate('FormContato', { contato: item })}
          >
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.telefone}>
              {item.telefone}{item.parentesco ? ` · ${item.parentesco}` : ''}
            </Text>
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
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 4,
    marginBottom: 20,
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
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  telefone: {
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 4,
  },
  aviso: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 12,
  },
});
