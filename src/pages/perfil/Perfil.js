import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { usuariaMock } from '../../mocks/usuaria';

// Converte '2026-10-01' em '01/10/2026'
function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function Perfil({ navigation, route }) {
  // Se voltou da tela de edição, usa os dados editados; senão, o mock
  const usuaria = route.params?.usuaria ?? usuariaMock;

  function confirmarExclusao() {
    Alert.alert(
      'Excluir conta',
      'Tem certeza? Todos os seus dados de apoio serão apagados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        // Na Entrega 4 este botão vai chamar DELETE /usuarias/:id
        { text: 'Excluir', style: 'destructive', onPress: () => Alert.alert('Conta excluída (simulação)') },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Avatar com a inicial do nome */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{usuaria.nome.charAt(0)}</Text>
      </View>
      <Text style={styles.nome}>{usuaria.nome}</Text>

      {/* Dados da conta */}
      <View style={styles.card}>
        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.valor}>{usuaria.email}</Text>

        <Text style={styles.label}>PIN de acesso</Text>
        <Text style={styles.valor}>••••</Text>

        <Text style={styles.label}>Cadastrada em</Text>
        <Text style={styles.valor}>{formatarData(usuaria.data_cadastro)}</Text>
      </View>

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => navigation.navigate('EditarPerfil', { usuaria })}
      >
        <Text style={styles.botaoEditarText}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoExcluir} onPress={confirmarExclusao}>
        <Text style={styles.botaoExcluirText}>Excluir conta</Text>
      </TouchableOpacity>

      <Text style={styles.aviso}>
        Protótipo acadêmico. Não substitui atendimento policial, jurídico ou psicológico.
        Em emergência ligue 190. Central de Atendimento à Mulher: 180.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFD',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F5B700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  card: {
    width: '100%',
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
    width: '100%',
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
    width: '100%',
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
  aviso: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 24,
  },
});
