import { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarCofrinho, movimentarCofrinho, salvarMeta } from '../../services/financasService';
import { reais, lerValor } from '../../utils/dinheiro';
import { ef, cores } from './estilosFinancas';

// Aba "Cofrinho" da fachada: uma meta de economia.
// Guardar tira do saldo e põe no cofrinho; resgatar devolve para o saldo.

export default function CofrinhoFinancas() {
  const [cofrinho, setCofrinho] = useState(null);
  const [valorTexto, setValorTexto] = useState('');
  const [editando, setEditando] = useState(false);
  const [nomeMeta, setNomeMeta] = useState('');
  const [valorMetaTexto, setValorMetaTexto] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useFocusEffect(
    useCallback(() => {
      buscarCofrinho().then(setCofrinho).catch((e) => setErro(e.message));
    }, [])
  );

  async function movimentar(operacao) {
    setErro('');
    const valor = lerValor(valorTexto);
    if (!valor) return setErro('Informe um valor válido. Ex.: 50,00');
    setOcupado(true);
    try {
      setCofrinho(await movimentarCofrinho(operacao, valor));
      setValorTexto('');
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  function abrirEdicao() {
    setNomeMeta(cofrinho.nome_meta);
    setValorMetaTexto(cofrinho.valor_meta.toFixed(2).replace('.', ','));
    setEditando(true);
  }

  async function salvar() {
    setErro('');
    const valor = lerValor(valorMetaTexto);
    if (!nomeMeta.trim()) return setErro('Informe o nome da meta.');
    if (!valor) return setErro('Informe o valor da meta.');
    setOcupado(true);
    try {
      setCofrinho(await salvarMeta({ nome_meta: nomeMeta.trim(), valor_meta: valor }));
      setEditando(false);
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  if (!cofrinho) {
    return (
      <View style={[ef.container, ef.content]}>
        {erro !== '' ? <Text style={ef.erro}>{erro}</Text> : <Text style={ef.vazio}>Carregando...</Text>}
      </View>
    );
  }

  // Quanto da meta já foi alcançado (0 a 100%)
  const porcentagem = cofrinho.valor_meta > 0
    ? Math.min(100, Math.round((cofrinho.guardado / cofrinho.valor_meta) * 100))
    : 0;

  return (
    <ScrollView style={ef.container} contentContainerStyle={ef.content} keyboardShouldPersistTaps="handled">
      <View style={styles.cartaoMeta}>
        <Text style={styles.nomeMeta}>{cofrinho.nome_meta}</Text>
        <Text style={styles.guardado}>{reais(cofrinho.guardado)}</Text>
        <Text style={styles.deMeta}>de {reais(cofrinho.valor_meta)} · {porcentagem}%</Text>
        <View style={styles.barra}>
          <View style={[styles.barraCheia, { width: `${porcentagem}%` }]} />
        </View>
      </View>

      <Text style={[ef.textoMenor, { marginBottom: 16 }]}>
        Saldo disponível na conta: {reais(cofrinho.saldo)}
      </Text>

      <Text style={ef.label}>Valor (R$)</Text>
      <TextInput
        style={ef.input}
        value={valorTexto}
        onChangeText={setValorTexto}
        placeholder="0,00"
        placeholderTextColor={cores.cinza}
        keyboardType="decimal-pad"
      />

      {erro !== '' && <Text style={ef.erro}>{erro}</Text>}

      <View style={styles.botoes}>
        <TouchableOpacity
          style={[ef.botao, styles.botaoMetade, ocupado && ef.botaoDesativado]}
          onPress={() => movimentar('guardar')}
          disabled={ocupado}
        >
          <Text style={ef.botaoTexto}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[ef.botao, styles.botaoMetade, styles.botaoClaro, ocupado && ef.botaoDesativado]}
          onPress={() => movimentar('resgatar')}
          disabled={ocupado}
        >
          <Text style={[ef.botaoTexto, { color: cores.texto }]}>Resgatar</Text>
        </TouchableOpacity>
      </View>

      {!editando ? (
        <TouchableOpacity onPress={abrirEdicao} style={styles.linkEditar}>
          <Text style={styles.linkEditarTexto}>Alterar meta</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ marginTop: 16 }}>
          <Text style={ef.label}>Nome da meta</Text>
          <TextInput style={ef.input} value={nomeMeta} onChangeText={setNomeMeta} maxLength={60} />
          <Text style={ef.label}>Valor da meta (R$)</Text>
          <TextInput
            style={ef.input}
            value={valorMetaTexto}
            onChangeText={setValorMetaTexto}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={[ef.botao, ocupado && ef.botaoDesativado]} onPress={salvar} disabled={ocupado}>
            <Text style={ef.botaoTexto}>Salvar meta</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditando(false)} style={styles.linkEditar}>
            <Text style={styles.linkEditarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cartaoMeta: {
    backgroundColor: cores.texto,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  nomeMeta: { color: cores.fundo, fontSize: 14 },
  guardado: { color: cores.amarelo, fontSize: 30, fontWeight: 'bold', marginVertical: 4 },
  deMeta: { color: cores.borda, fontSize: 13, marginBottom: 12 },
  barra: { height: 8, borderRadius: 4, backgroundColor: '#3A3A3A', overflow: 'hidden' },
  barraCheia: { height: 8, borderRadius: 4, backgroundColor: cores.amarelo },
  botoes: { flexDirection: 'row', justifyContent: 'space-between' },
  botaoMetade: { width: '48%' },
  botaoClaro: { backgroundColor: cores.cartao },
  linkEditar: { alignItems: 'center', padding: 8 },
  linkEditarTexto: { color: cores.cinza, textDecorationLine: 'underline' },
});
