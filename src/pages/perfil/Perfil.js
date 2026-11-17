import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { buscarUsuaria, buscarResumo, excluirUsuaria } from '../../services/usuariaService';

// Converte '2026-10-01' em '01/10/2026'
function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function Perfil({ navigation }) {
  const [usuaria, setUsuaria] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const dados = await buscarUsuaria();
      setUsuaria(dados);
      setResumo(dados ? await buscarResumo(dados.id_usuaria) : null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  // Busca de novo sempre que a tela aparece (inclusive ao voltar da edição)
  useEffect(() => {
    const remover = navigation.addListener('focus', carregar);
    return remover;
  }, [navigation]);

  async function excluir() {
    try {
      await excluirUsuaria(usuaria.id_usuaria);
      setUsuaria(null);
      setResumo(null);
    } catch (e) {
      setErro(e.message);
    }
  }

  function confirmarExclusao() {
    const mensagem = 'Tem certeza? Todos os seus dados de apoio serão apagados.';
    // No navegador o Alert não mostra botões, então usamos window.confirm
    if (Platform.OS === 'web') {
      if (window.confirm(mensagem)) excluir();
      return;
    }
    Alert.alert('Excluir conta', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: excluir },
    ]);
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </View>
    );
  }

  if (erro !== '') {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro}>{erro}</Text>
        <TouchableOpacity style={styles.botaoEditar} onPress={carregar}>
          <Text style={styles.botaoEditarText}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Perfil não existe (foi excluído ou ainda não foi criado)
  if (!usuaria) {
    return (
      <View style={styles.centro}>
        <Text style={styles.nome}>Nenhum perfil cadastrado</Text>
        <TouchableOpacity style={styles.botaoEditar} onPress={() => navigation.navigate('EditarPerfil')}>
          <Text style={styles.botaoEditarText}>Criar perfil</Text>
        </TouchableOpacity>
      </View>
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

        {/* Vem do relacionamento USUARIA 1:N ALERTA, contado pela API */}
        <Text style={styles.label}>Alertas enviados</Text>
        <Text style={styles.valor}>{resumo?.total_alertas ?? 0}</Text>
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
