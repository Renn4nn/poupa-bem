import { FlatList, StyleSheet, Text, View } from 'react-native';
import { contatosMock } from '../../mocks/contatos';

export default function ListaContatos() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pagamentos</Text>
      <Text style={styles.subtitulo}>Contatos salvos</Text>

      <FlatList
        data={contatosMock}
        keyExtractor={(contato) => String(contato.id_contato)}
        renderItem={({ item }) => (
          <View style={styles.cartao}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.telefone}>{item.telefone}</Text>
          </View>
        )}
      />
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
});
