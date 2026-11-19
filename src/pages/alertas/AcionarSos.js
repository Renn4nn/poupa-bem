import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Pressable, Animated, StyleSheet, ScrollView, ActivityIndicator,
  Platform,
} from 'react-native';
import { criarAlerta } from '../../services/alertasService';
import { obterLocalizacao, dataHoraTela, localizacaoTela } from '../../utils/localizacao';
import { listarContatos } from '../../services/contatosService';

// No navegador, segurar o dedo/mouse em cima do texto "SOS" seleciona o texto e abre
// o menu do navegador ("Copiar", "Pesquisar no Google"...). Isso cancela o toque e o
// botão volta ao normal sem enviar. Estes estilos desligam a seleção e o menu de toque.
const semSelecao = Platform.OS === 'web'
  ? { userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', touchAction: 'none' }
  : {};

export default function AcionarSos({ navigation }) {
  const [idContato, setIdContato] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [ultimoAlerta, setUltimoAlerta] = useState(null);
  const [erro, setErro] = useState('');
  const [contatos, setContatos] = useState([]);
  const [segurando, setSegurando] = useState(false);

  // Progresso do "segurar": 0 = acabou de apertar (vermelho escuro),
  // 1 = completou os 2 segundos (vermelho normal). Parado, fica em 1.
  const progresso = useRef(new Animated.Value(1)).current;
  const botaoRef = useRef(null);

  // No navegador, bloqueia o menu do botão direito / toque longo só em cima do botão
  useEffect(() => {
    if (Platform.OS !== 'web' || !botaoRef.current) return undefined;
    const no = botaoRef.current;
    const bloquear = (e) => e.preventDefault();
    no.addEventListener('contextmenu', bloquear);
    return () => no.removeEventListener('contextmenu', bloquear);
  }, []);

  const corBotao = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: ['#5C0F0F', '#C62828'],
  });

  // Ao apertar: o botão escurece e vai voltando ao vermelho normal em 2 s.
  // Se a animação chegar ao fim (finished), a pessoa segurou o tempo todo: envia o SOS.
  function aoApertar() {
    if (enviando) return;
    setSegurando(true);
    progresso.setValue(0);
    Animated.timing(progresso, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false, // cor não roda no driver nativo
    }).start(({ finished }) => {
      setSegurando(false);
      if (finished) enviarSos();
    });
  }

  // Soltou antes dos 2 s: a animação é interrompida (finished = false)
  // e o botão volta na hora para a cor normal, sem enviar nada.
  function aoSoltar() {
    progresso.stopAnimation();
    progresso.setValue(1);
    setSegurando(false);
  }

  // Contatos da Rede de Apoio para escolher quem avisar.
  // Se a API falhar, a lista fica vazia e o SOS continua funcionando.
  useEffect(() => {
    async function carregarContatos() {
      try {
        setContatos(await listarContatos());
      } catch {
        setContatos([]);
      }
    }
    const remover = navigation.addListener('focus', carregarContatos);
    return remover;
  }, [navigation]);

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

      <Pressable
        ref={botaoRef}
        onPressIn={aoApertar}
        onPressOut={aoSoltar}
        disabled={enviando}
        style={semSelecao}
      >
        <Animated.View
          style={[
            styles.botaoSos,
            semSelecao,
            { backgroundColor: corBotao },
            enviando && styles.botaoSosDesativado,
          ]}
        >
          {enviando
            ? <ActivityIndicator color="#FEFDFD" size="large" />
            : <Text selectable={false} style={[styles.botaoSosText, semSelecao]}>SOS</Text>}
        </Animated.View>
      </Pressable>

      <Text style={styles.dica}>
        {segurando ? 'Continue segurando...' : 'Toque e segure'}
      </Text>

      {ultimoAlerta && (
        <View style={styles.confirmacao}>
          <Text style={styles.confirmacaoTitulo}>Alerta registrado</Text>
          <Text style={styles.confirmacaoTexto}>{dataHoraTela(ultimoAlerta.data_hora)}</Text>
          <Text style={styles.confirmacaoTexto}>
            {localizacaoTela(ultimoAlerta.latitude, ultimoAlerta.longitude)}
          </Text>
          {ultimoAlerta.nome_contato && (
            <Text style={styles.confirmacaoTexto}>Contato marcado: {ultimoAlerta.nome_contato}</Text>
          )}
          <Text style={styles.confirmacaoNota}>
            O alerta aparece no painel da central de atendimento. Neste protótipo,
            nenhuma mensagem é enviada automaticamente ao contato.
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
        {contatos.map((c) => (
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
    marginBottom: 8,
  },
  dica: {
    fontSize: 13,
    color: '#6B6B6B',
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
  confirmacaoNota: {
    fontSize: 12,
    color: '#6B6B6B',
    marginTop: 8,
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
