import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { buscarOcorrencia, criarOcorrencia, atualizarOcorrencia } from '../../services/ocorrenciasService';
import { tiposOcorrencia } from '../../mocks/ocorrencias';
import { paraTela, paraBanco, hojeTela } from '../../utils/datas';

// Mesma tela para criar e editar: se recebeu um id, está editando
export default function FormOcorrencia({ navigation, route }) {
  const id = route.params?.id;
  const editando = id !== undefined;

  const [data, setData] = useState(hojeTela());
  const [tipo, setTipo] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar anotação' : 'Nova anotação' });
  }, [navigation, editando]);

  // Na edição, preenche o formulário com os dados salvos
  useEffect(() => {
    if (!editando) return;
    async function carregar() {
      const o = await buscarOcorrencia(id);
      if (!o) return;
      setData(paraTela(o.data));
      setTipo(o.tipo);
      setLocal(o.local);
      setDescricao(o.descricao);
    }
    carregar();
  }, [editando, id]);

  function validar() {
    const dataBanco = paraBanco(data);
    if (!dataBanco) return 'Informe uma data válida (DD/MM/AAAA).';
    // Datas no formato AAAA-MM-DD podem ser comparadas como texto
    if (dataBanco > paraBanco(hojeTela())) return 'A data não pode ser no futuro.';
    if (tipo === '') return 'Escolha o tipo.';
    if (descricao.trim().length < 5) return 'Descreva o que aconteceu (mínimo 5 letras).';
    return '';
  }

  async function salvar() {
    const mensagem = validar();
    setErro(mensagem);
    if (mensagem !== '') return;

    const dados = {
      data: paraBanco(data),
      tipo,
      local: local.trim(),
      descricao: descricao.trim(),
    };

    if (editando) {
      await atualizarOcorrencia(id, dados);
    } else {
      await criarOcorrencia(dados);
    }
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.label}>Data</Text>
      <TextInput
        style={styles.input}
        value={data}
        onChangeText={setData}
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.opcoes}>
        {tiposOcorrencia.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.opcao, tipo === t && styles.opcaoAtiva]}
            onPress={() => setTipo(t)}
          >
            <Text style={styles.opcaoText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Local (opcional)</Text>
      <TextInput
        style={styles.input}
        value={local}
        onChangeText={setLocal}
        placeholder="Ex.: casa, trabalho"
        maxLength={60}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.inputGrande]}
        value={descricao}
        onChangeText={setDescricao}
        multiline
        maxLength={500}
      />

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      <View style={styles.botoes}>
        <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
          <Text style={styles.botaoCancelarText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoSalvar} onPress={salvar}>
          <Text style={styles.botaoSalvarText}>Salvar</Text>
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
  inputGrande: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  opcao: {
    backgroundColor: '#F2EEE3',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  opcaoAtiva: {
    backgroundColor: '#F5B700',
  },
  opcaoText: {
    color: '#1A1A1A',
    fontSize: 14,
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
