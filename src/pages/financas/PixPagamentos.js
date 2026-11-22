import { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { criarMovimentacao, listarMovimentacoes } from '../../services/financasService';
import { reais, reaisComSinal, diaMes, lerValor } from '../../utils/dinheiro';
import { ef, cores } from './estilosFinancas';

// Aba "Pix e Pagamentos" da fachada: faz um Pix ou paga uma conta (o valor sai
// do saldo) e mostra o extrato completo. Os valores são fictícios.

const CATEGORIAS = ['Mercado', 'Transporte', 'Contas da casa', 'Farmácia', 'Lazer', 'Outros'];

export default function PixPagamentos() {
  const [tipo, setTipo] = useState('Pix');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [valorTexto, setValorTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [extrato, setExtrato] = useState([]);
  const [saldo, setSaldo] = useState(null);

  async function carregarExtrato() {
    try {
      const lista = await listarMovimentacoes();
      setExtrato(lista);
      setSaldo(lista.reduce((soma, m) => soma + m.valor, 0));
    } catch (e) {
      setErro(e.message);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarExtrato();
    }, [])
  );

  async function confirmar() {
    setErro('');
    setSucesso('');
    const valor = lerValor(valorTexto);
    if (!descricao.trim()) {
      setErro(tipo === 'Pix' ? 'Informe a chave Pix ou o nome.' : 'Informe a conta que vai pagar.');
      return;
    }
    if (!valor) {
      setErro('Informe um valor válido. Ex.: 50,00');
      return;
    }

    setEnviando(true);
    try {
      const resposta = await criarMovimentacao({ tipo, descricao: descricao.trim(), categoria, valor });
      setSucesso(`${tipo === 'Pix' ? 'Pix enviado' : 'Pagamento realizado'}: ${reais(valor)}`);
      setDescricao('');
      setValorTexto('');
      setSaldo(resposta.saldo);
      await carregarExtrato();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView style={ef.container} contentContainerStyle={ef.content} keyboardShouldPersistTaps="handled">
      {saldo !== null && (
        <Text style={[ef.textoMenor, { marginBottom: 12 }]}>Saldo disponível: {reais(saldo)}</Text>
      )}

      {/* Pix ou pagamento de conta */}
      <View style={ef.opcoes}>
        {['Pix', 'Pagamento'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[ef.opcao, tipo === t && ef.opcaoAtiva]}
            onPress={() => setTipo(t)}
          >
            <Text style={[ef.opcaoTexto, tipo === t && ef.opcaoTextoAtiva]}>
              {t === 'Pix' ? 'Fazer Pix' : 'Pagar conta'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={ef.label}>{tipo === 'Pix' ? 'Chave Pix ou nome' : 'Conta'}</Text>
      <TextInput
        style={ef.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder={tipo === 'Pix' ? 'Ex.: Padaria do Bairro' : 'Ex.: Conta de água'}
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

      <Text style={ef.label}>Categoria</Text>
      <View style={ef.opcoes}>
        {CATEGORIAS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[ef.opcao, categoria === c && ef.opcaoAtiva]}
            onPress={() => setCategoria(c)}
          >
            <Text style={[ef.opcaoTexto, categoria === c && ef.opcaoTextoAtiva]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {erro !== '' && <Text style={ef.erro}>{erro}</Text>}
      {sucesso !== '' && <Text style={ef.sucesso}>{sucesso}</Text>}

      <TouchableOpacity
        style={[ef.botao, enviando && ef.botaoDesativado]}
        onPress={confirmar}
        disabled={enviando}
      >
        <Text style={ef.botaoTexto}>{enviando ? 'Enviando...' : 'Confirmar'}</Text>
      </TouchableOpacity>

      <Text style={[ef.secao, { marginTop: 12 }]}>Extrato</Text>
      <View style={ef.card}>
        {extrato.length === 0 && <Text style={ef.vazio}>Nenhuma movimentação.</Text>}
        {extrato.map((m) => (
          <View key={m.id_movimentacao} style={ef.linha}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={ef.texto}>{m.descricao}</Text>
              <Text style={ef.textoMenor}>{diaMes(m.data_hora)} · {m.tipo}</Text>
            </View>
            <Text style={[ef.texto, { color: m.valor >= 0 ? cores.verde : cores.vermelho }]}>
              {reaisComSinal(m.valor)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
