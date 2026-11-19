import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { criarContato, atualizarContato, excluirContato } from '../../services/contatosService';

// Mesma tela para criar e editar: se recebeu um contato, está editando
export default function FormContato({ navigation, route }) {
  const contato = route.params?.contato;
  const editando = contato !== undefined;

  const [nome, setNome] = useState(contato?.nome ?? '');
  const [telefone, setTelefone] = useState(contato?.telefone ?? '');
  const [parentesco, setParentesco] = useState(contato?.parentesco ?? '');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar contato' : 'Novo contato' });
  }, [navigation, editando]);

  // Validação antes de enviar (a API confere de novo)
  function validar() {
    if (nome.trim() === '') return 'Informe o nome.';
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length < 10 || numeros.length > 11) return 'Informe um telefone com DDD.';
    return '';
  }

  async function salvar() {
    const mensagem = validar();
    setErro(mensagem);
    if (mensagem !== '') return;

    const dados = { nome: nome.trim(), telefone: telefone.trim(), parentesco: parentesco.trim() };

    setSalvando(true);
    try {
      if (editando) {
        await atualizarContato(contato.id_contato, dados); // PUT /contatos/:id
      } else {
        await criarContato(dados); // POST /contatos
      }
      navigation.goBack(); // a lista recarrega da API ao voltar
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    try {
      await excluirContato(contato.id_contato); // DELETE /contatos/:id
      navigation.goBack();
    } catch (e) {
      setErro(e.message);
    }
  }

  function confirmarExclusao() {
    // No navegador o Alert não mostra botões, então usamos window.confirm
    if (Platform.OS === 'web') {
      if (window.confirm('Excluir este contato?')) excluir();
      return;
    }
    Alert.alert('Excluir contato', 'Tem certeza? Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: excluir },
    ]);
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

      <Text style={styles.label}>Telefone (com DDD)</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="(43) 90000-0000"
        keyboardType="phone-pad"
        maxLength={20}
      />

      <Text style={styles.label}>Parentesco (opcional)</Text>
      <TextInput
        style={styles.input}
        value={parentesco}
        onChangeText={setParentesco}
        placeholder="Ex.: mãe, amiga, vizinha"
        maxLength={40}
      />

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

      {editando && (
        <TouchableOpacity style={styles.botaoExcluir} onPress={confirmarExclusao}>
          <Text style={styles.botaoExcluirText}>Excluir contato</Text>
        </TouchableOpacity>
      )}
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
  botaoExcluir: {
    borderWidth: 1,
    borderColor: '#C62828',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  botaoExcluirText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
