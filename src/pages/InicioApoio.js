import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { saidaRapida } from '../navigation/navegacao';

// Primeira aba da área de apoio (depois do PIN): atalhos para ligar
// 180 / 190 e a saída rápida. A ligação só acontece se a usuária tocar;
// o app não envia nada automaticamente à polícia.

function ligar(numero) {
  Linking.openURL(`tel:${numero}`);
}

export default function InicioApoio() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Você não está sozinha.</Text>
      <Text style={styles.texto}>
        Aqui você guarda seus contatos de confiança, registra o que aconteceu
        e pode pedir ajuda com o SOS.
      </Text>

      <TouchableOpacity style={styles.botaoLigar} onPress={() => ligar('180')}>
        <Text style={styles.botaoLigarNumero}>180</Text>
        <Text style={styles.botaoLigarTexto}>Central de Atendimento à Mulher</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoLigar} onPress={() => ligar('190')}>
        <Text style={styles.botaoLigarNumero}>190</Text>
        <Text style={styles.botaoLigarTexto}>Polícia Militar (emergência)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={saidaRapida}>
        <Text style={styles.botaoSairTexto}>Saída rápida</Text>
      </TouchableOpacity>
      <Text style={styles.dica}>
        O ícone no canto de cima também volta para a tela de finanças.
      </Text>

      <Text style={styles.aviso}>
        Protótipo acadêmico. Não substitui atendimento policial, jurídico ou psicológico.
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
    padding: 24,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  texto: {
    fontSize: 15,
    color: '#6B6B6B',
    marginTop: 8,
    marginBottom: 24,
  },
  botaoLigar: {
    backgroundColor: '#F2EEE3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoLigarNumero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C62828',
    marginRight: 16,
  },
  botaoLigarTexto: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  botaoSair: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoSairTexto: {
    color: '#F5B700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dica: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 8,
  },
  aviso: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 32,
  },
});
