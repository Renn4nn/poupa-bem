import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { criarAlerta } from '../../services/alertasService';
import { obterLocalizacao, dataHoraTela, localizacaoTela } from '../../utils/localizacao';
import { contatosMock } from '../../mocks/contatos';

export default function AcionarSos({ navigation }) {
  const [idContato, setIdContato] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [ultimoAlerta, setUltimoAlerta] = useState(null);
  const [erro, setErro] = useState('');

  // O botão só dispara segurando por 2 segundos, para evitar toque sem querer
  async function enviarSos() {
    setEnviando(true);
    setErro('');
    try {
      const posicao = await obterLocalizacao();
      const alerta = await criarAlerta({
        latitude: posicao?.latitude ?? null,
        longitude: posicao?.longitude ?? null,
        id_contato: idContato,
      });
      setUltimoAlerta(alerta);
    } catch {
      setErro('Não foi possível enviar agora. Tente de novo ou ligue 190.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Pedido de ajuda</Text>
      <Text style={styles.instrucao}>
        Segure o botão por 2 segundos para enviar um alerta com a sua localização.
      </Text>

      <TouchableOpacity
        style={[styles.botaoSos, enviando && styles.botaoSosDesativado]}
        onLongPress={enviarSos}
        delayLongPress={2000}
        disabled={enviando}
      >
        {enviando
          ? <ActivityIndicator color="#FEFDFD" size="large" />
          : <Text style={styles.botaoSosText}>SOS</Text>}
      </TouchableOpacity>

      {ultimoAlerta && (
        <View style={styles.confirmacao}>
          <Text style={styles.confirmacaoTitulo}>Alerta enviado</Text>
          <Text style={styles.confirmacaoTexto}>{dataHoraTela(ultimoAlerta.data_hora)}</Text>
          <Text style={styles.confirmacaoTexto}>
            {localizacaoTela(ultimoAlerta.latitude, ultimoAlerta.longitude)}
          </Text>
        </View>
      )}

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      {/* Contato da Rede de Apoio avisado junto com o alerta (opcional) */}
      <Text style={styles.label}>Avisar também (opcional)</Text>
      <View style={styles.opcoes}>
        <TouchableOpacity
          style={[styles.opcao, idContato === null && styles.opcaoAtiva]}
          onPress={() => setIdContato(null)}
        >
          <Text style={[styles.opcaoText, idContato === null && styles.opcaoTextAtiva]}>Ninguém</Text>
        </TouchableOpacity>
        {contatosMock.map((c) => (
          <TouchableOpacity
            key={c.id_contato}
            style={[styles.opcao, idContato === c.id_contato && styles.opcaoAtiva]}
            onPress={() => setIdContato(c.id_contato)}
          >
            <Text style={[styles.opcaoText, idContato === c.id_contato && styles.opcaoTextAtiva]}>
              {c.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.botaoHistorico}
        onPress={() => navigation.navigate('ListaAlertas')}
      >
        <Text style={styles.botaoHistoricoText}>Ver histórico de alertas</Text>
      </TouchableOpacity>

      <Text style={styles.aviso}>Emergência: 190 · Central de Atendimento à Mulher: 180</Text>
      <Text style={styles.aviso}>
        Protótipo acadêmico: não substitui atendimento policial, jurídico ou de saúde.
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
    alignItems: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  instrucao: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  botaoSos: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#C62828',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  botaoSosDesativado: {
    opacity: 0.6,
  },
  botaoSosText: {
    color: '#FEFDFD',
    fontSize: 36,
    fontWeight: 'bold',
  },
  confirmacao: {
    width: '100%',
    backgroundColor: '#F2EEE3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confirmacaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  confirmacaoTexto: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  erro: {
    color: '#C62828',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 8,
  },
  opcoes: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  opcao: {
    borderWidth: 1,
    borderColor: '#D1CDC7',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  opcaoAtiva: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  opcaoText: {
    color: '#1A1A1A',
  },
  opcaoTextAtiva: {
    color: '#F5B700',
  },
  botaoHistorico: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  botaoHistoricoText: {
    color: '#F5B700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aviso: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 4,
  },
});
