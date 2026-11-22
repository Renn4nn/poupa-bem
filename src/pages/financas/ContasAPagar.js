import { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  listarLembretes, criarLembrete, pagarLembrete, excluirLembrete,
} from '../../services/financasService';
import { reais, dataBr, lerValor, lerData } from '../../utils/dinheiro';
import { ef, cores } from './estilosFinancas';

// Aba "Anotações" da fachada: lembretes de contas a pagar.
// Criar, listar, pagar (desconta do saldo) e excluir.

export default function ContasAPagar() {
  const [contas, setContas] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const [vencimentoTexto, setVencimentoTexto] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function carregar() {
    try {
      setContas(await listarLembretes());
    } catch (e) {
      setErro(e.message);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  async function adicionar() {
    setErro('');
    const valor = lerValor(valorTexto);
    const vencimento = lerData(vencimentoTexto);
    if (!descricao.trim()) return setErro('Informe o nome da conta.');
    if (!valor) return setErro('Informe um valor válido. Ex.: 99,90');
    if (!vencimento) return setErro('Informe o vencimento no formato DD/MM/AAAA.');

    setOcupado(true);
    try {
      await criarLembrete({ descricao: descricao.trim(), valor, vencimento });
      setDescricao('');
      setValorTexto('');
      setVencimentoTexto('');
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  // Executa uma ação (pagar/excluir) e recarrega a lista
  async function acao(fn) {
    setErro('');
    setOcupado(true);
    try {
      await fn();
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  function confirmarExclusao(conta) {
    const mensagem = `Excluir o lembrete "${conta.descricao}"?`;
    // No navegador o Alert não mostra botões, então usamos window.confirm
    if (Platform.OS === 'web') {
      if (window.confirm(mensagem)) acao(() => excluirLembrete(conta.id_lembrete));
      return;
    }
    Alert.alert('Excluir lembrete', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => acao(() => excluirLembrete(conta.id_lembrete)) },
    ]);
  }

  return (
    <ScrollView style={ef.container} contentContainerStyle={ef.content} keyboardShouldPersistTaps="handled">
      <Text style={ef.secao}>Contas a pagar</Text>
      <View style={ef.card}>
        {contas.length === 0 && <Text style={ef.vazio}>Nenhuma conta anotada.</Text>}
        {contas.map((c) => (
          <View key={c.id_lembrete} style={[ef.linha, { flexWrap: 'wrap' }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[ef.texto, c.pago && { color: cores.cinza }]}>{c.descricao}</Text>
              <Text style={ef.textoMenor}>
                {reais(c.valor)} · vence {dataBr(c.vencimento)}{c.pago ? ' · paga' : ''}
              </Text>
            </View>
            {!c.pago && (
              <TouchableOpacity
                style={[ef.opcao, ef.opcaoAtiva, { marginBottom: 0 }]}
                onPress={() => acao(() => pagarLembrete(c.id_lembrete))}
                disabled={ocupado}
              >
                <Text style={ef.opcaoTextoAtiva}>Pagar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[ef.opcao, { marginBottom: 0, marginRight: 0 }]}
              onPress={() => confirmarExclusao(c)}
              disabled={ocupado}
            >
              <Text style={ef.opcaoTexto}>Excluir</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={ef.secao}>Nova conta</Text>
      <Text style={ef.label}>Nome</Text>
      <TextInput
        style={ef.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex.: Internet"
        placeholderTextColor={cores.cinza}
        maxLength={100}
      />
      <Text style={ef.label}>Valor (R$)</Text>
      <TextInput
        style={ef.input}
        value={valorTexto}
        onChangeText={setValorTexto}
        placeholder="0,00"
        placeholderTextColor={cores.cinza}
        keyboardType="decimal-pad"
      />
      <Text style={ef.label}>Vencimento</Text>
      <TextInput
        style={ef.input}
        value={vencimentoTexto}
        onChangeText={setVencimentoTexto}
        placeholder="DD/MM/AAAA"
        placeholderTextColor={cores.cinza}
        maxLength={10}
      />

      {erro !== '' && <Text style={ef.erro}>{erro}</Text>}

      <TouchableOpacity
        style={[ef.botao, ocupado && ef.botaoDesativado]}
        onPress={adicionar}
        disabled={ocupado}
      >
        <Text style={ef.botaoTexto}>Salvar conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
