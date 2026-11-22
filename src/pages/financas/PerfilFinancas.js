import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarUsuaria } from '../../services/usuariaService';
import { ef, cores } from './estilosFinancas';

// Aba "Perfil" da fachada: dados da conta como em qualquer app de banco.
// Nome e e-mail vêm da API (/usuarias/:id); agência e conta são fictícias.

export default function PerfilFinancas() {
  const [usuaria, setUsuaria] = useState(null);
  const [erro, setErro] = useState('');

  useFocusEffect(
    useCallback(() => {
      buscarUsuaria()
        .then((dados) => { setUsuaria(dados); setErro(''); })
        .catch((e) => setErro(e.message));
    }, [])
  );

  const inicial = usuaria?.nome?.charAt(0).toUpperCase() ?? '';

  return (
    <ScrollView style={ef.container} contentContainerStyle={ef.content}>
      <View style={styles.topo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{inicial}</Text>
        </View>
        <Text style={styles.nome}>{usuaria?.nome ?? ' '}</Text>
        <Text style={ef.textoMenor}>{usuaria?.email ?? ' '}</Text>
      </View>

      {erro !== '' && <Text style={ef.erro}>{erro}</Text>}

      <Text style={ef.secao}>Minha conta</Text>
      <View style={ef.card}>
        <View style={ef.linha}>
          <Text style={ef.texto}>Agência</Text>
          <Text style={ef.texto}>0001</Text>
        </View>
        <View style={ef.linha}>
          <Text style={ef.texto}>Conta</Text>
          <Text style={ef.texto}>102030-4</Text>
        </View>
        <View style={ef.linha}>
          <Text style={ef.texto}>Chave Pix</Text>
          <Text style={ef.texto}>Chave aleatória</Text>
        </View>
      </View>

      <Text style={ef.secao}>Aplicativo</Text>
      <View style={ef.card}>
        <View style={ef.linha}>
          <Text style={ef.texto}>Versão</Text>
          <Text style={ef.texto}>1.0.0</Text>
        </View>
      </View>

      <Text style={styles.aviso}>
        Protótipo acadêmico. Valores fictícios: nenhum dinheiro real é movimentado.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topo: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.texto,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarTexto: { color: cores.amarelo, fontSize: 30, fontWeight: 'bold' },
  nome: { fontSize: 18, fontWeight: 'bold', color: cores.texto },
  aviso: { fontSize: 12, color: cores.cinza, textAlign: 'center', marginTop: 8 },
});
