import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { criarUsuaria, atualizarUsuaria } from '../../services/usuariaService';

export default function EditarPerfil({ navigation, route }) {
  // Sem usuária nos parâmetros = criar perfil novo; com usuária = editar
  const usuaria = route.params?.usuaria;
  const criando = !usuaria;

  // Cada campo do formulário é um estado controlado (value + onChangeText)
  const [nome, setNome] = useState(usuaria?.nome ?? '');
  const [email, setEmail] = useState(usuaria?.email ?? '');
  const [novoPin, setNovoPin] = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (criando) navigation.setOptions({ title: 'Criar perfil' });
  }, [criando, navigation]);

  // Validação básica antes de salvar; devolve a mensagem de erro ou ''
  // (a API valida de novo, mas assim a usuária vê o erro sem esperar a rede)
  function validar() {
    if (nome.trim() === '') return 'Informe o nome.';
    if (!email.includes('@')) return 'Informe um e-mail válido.';
    // Ao criar o PIN é obrigatório; ao editar, só valida se ela quiser trocar
    if (criando || novoPin !== '' || confirmarPin !== '') {
      if (!/^\d{4}$/.test(novoPin)) return 'O PIN deve ter 4 números.';
      if (novoPin !== confirmarPin) return 'Os PINs não conferem.';
    }
    return '';
  }

  async function salvar() {
    const mensagem = validar();
    setErro(mensagem);
    if (mensagem !== '') return;

    const dados = { nome: nome.trim(), email: email.trim() };
    if (novoPin !== '') dados.pin = novoPin; // o hash é feito na API

    setSalvando(true);
    try {
      if (criando) {
        await criarUsuaria(dados); // POST /usuarias
      } else {
        await atualizarUsuaria(usuaria.id_usuaria, dados); // PUT /usuarias/:id
      }
      navigation.goBack(); // o Perfil recarrega da API ao voltar
    } catch (e) {
      setErro(e.message); // ex.: e-mail já cadastrado (409) ou sem conexão
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
        maxLength={100}
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={120}
      />

      <Text style={styles.label}>
        {criando ? 'PIN de acesso (4 números)' : 'Novo PIN (deixe em branco para manter)'}
      </Text>
      <TextInput
        style={styles.input}
        value={novoPin}
        onChangeText={setNovoPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
      />

      <Text style={styles.label}>Confirmar PIN</Text>
      <TextInput
        style={styles.input}
        value={confirmarPin}
        onChangeText={setConfirmarPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
      />

      {/* Só aparece quando a validação falha */}
      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      <View style={styles.botoes}>
        <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoCancelarText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botaoSalvar, salvando && { opacity: 0.6 }]}
          onPress={salvar}
          disabled={salvando}
        >
          <Text style={styles.botaoSalvarText}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>
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
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F2EEE3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  erro: {
    color: '#C62828',
    marginTop: 16,
    textAlign: 'center',
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  botaoCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  botaoCancelarText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoSalvar: {
    flex: 1,
    backgroundColor: '#F5B700',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  botaoSalvarText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
