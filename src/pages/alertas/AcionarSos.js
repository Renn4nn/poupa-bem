import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Pressable, Animated, StyleSheet, ScrollView, ActivityIndicator,
  Platform,
} from 'react-native';
import { criarAlerta } from '../../services/alertasService';
import { obterLocalizacao, dataHoraTela, localizacaoTela } from '../../utils/localizacao';
import { listarContatos } from '../../services/contatosService';

// No navegador, segurar o dedo/mouse em cima do código seleciona o conteúdo e abre
// o menu do navegador ("Copiar", "Pesquisar no Google"...). Isso cancela o toque e o
// QR volta ao normal sem enviar. Estes estilos desligam a seleção e o menu de toque.
const semSelecao = Platform.OS === 'web'
  ? { userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', touchAction: 'none' }
  : {};

// Disfarce: no lugar de um botão vermelho de SOS, a tela mostra um "QR Code de
// recebimento", como em qualquer app de finanças. O QR é só um desenho (não
// codifica nada): uma grade de quadradinhos pretos e brancos, com os três
// quadrados de canto que todo QR Code tem. Segurar o QR por 2 s envia o SOS.
const TAMANHO_QR = 25; // quadradinhos por lado
const CELULA = 8; // tamanho de cada quadradinho em pixels

// Os três quadrados de canto (7x7): borda preta, anel branco e miolo preto
function ehCanto(linha, coluna) {
  const cantos = [[0, 0], [0, TAMANHO_QR - 7], [TAMANHO_QR - 7, 0]];
  return cantos.some(([l0, c0]) => {
    const l = linha - l0;
    const c = coluna - c0;
    if (l < -1 || l > 7 || c < -1 || c > 7) return false;
    return true;
  });
}

function corCanto(linha, coluna) {
  const cantos = [[0, 0], [0, TAMANHO_QR - 7], [TAMANHO_QR - 7, 0]];
  for (const [l0, c0] of cantos) {
    const l = linha - l0;
    const c = coluna - c0;
    if (l >= 0 && l < 7 && c >= 0 && c < 7) {
      const borda = l === 0 || l === 6 || c === 0 || c === 6;
      const miolo = l >= 2 && l <= 4 && c >= 2 && c <= 4;
      return borda || miolo;
    }
  }
  return false; // faixa branca em volta dos cantos
}

// O resto da grade é preenchido de forma "aleatória", mas sempre igual
// (mesma semente), para o QR não mudar toda vez que a tela abre
const MATRIZ_QR = (() => {
  let semente = 20261123;
  const proximo = () => {
    semente = (semente * 1103515245 + 12345) % 2147483648;
    return semente / 2147483648;
  };
  return Array.from({ length: TAMANHO_QR }, (_, linha) =>
    Array.from({ length: TAMANHO_QR }, (_, coluna) =>
      ehCanto(linha, coluna) ? corCanto(linha, coluna) : proximo() < 0.5
    )
  );
})();

function QrCodeFalso() {
  return (
    <View style={estilosQr.qr}>
      {MATRIZ_QR.map((linha, i) => (
        <View key={i} style={estilosQr.linha}>
          {linha.map((preto, j) => (
            <View key={j} style={[estilosQr.celula, preto && estilosQr.preto]} />
          ))}
        </View>
      ))}
    </View>
  );
}

const estilosQr = StyleSheet.create({
  qr: {
    width: TAMANHO_QR * CELULA,
    height: TAMANHO_QR * CELULA,
    backgroundColor: '#FFFFFF',
  },
  linha: {
    flexDirection: 'row',
  },
  celula: {
    width: CELULA,
    height: CELULA,
  },
  preto: {
    backgroundColor: '#1A1A1A',
  },
});

export default function AcionarSos({ navigation }) {
  const [idContato, setIdContato] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [ultimoAlerta, setUltimoAlerta] = useState(null);
  const [erro, setErro] = useState('');
  const [contatos, setContatos] = useState([]);
  const [segurando, setSegurando] = useState(false);

  // Progresso do "segurar": 0 = acabou de apertar (QR escurecido),
  // 1 = completou os 2 segundos (QR normal). Parado, fica em 1.
  const progresso = useRef(new Animated.Value(1)).current;
  const botaoRef = useRef(null);

  // No navegador, bloqueia o menu do botão direito / toque longo só em cima do QR
  useEffect(() => {
    if (Platform.OS !== 'web' || !botaoRef.current) return undefined;
    const no = botaoRef.current;
    const bloquear = (e) => e.preventDefault();
    no.addEventListener('contextmenu', bloquear);
    return () => no.removeEventListener('contextmenu', bloquear);
  }, []);

  // Véu escuro por cima do QR: começa forte ao apertar e some em 2 s
  const opacidadeVeu = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  // Ao apertar: o QR escurece e vai voltando ao normal em 2 s.
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
  // e o QR volta na hora ao normal, sem enviar nada.
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

  // O QR só dispara segurando por 2 segundos, para evitar toque sem querer
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
      <Text style={styles.titulo}>Meu QR Code</Text>
      <Text style={styles.instrucao}>Use para receber pagamentos via Pix.</Text>

      <Pressable
        ref={botaoRef}
        onPressIn={aoApertar}
        onPressOut={aoSoltar}
        disabled={enviando}
        style={semSelecao}
      >
        <View style={[styles.cartaoQr, semSelecao, enviando && styles.qrDesativado]}>
          <QrCodeFalso />
          <Animated.View
            pointerEvents="none"
            style={[styles.veu, { opacity: opacidadeVeu }]}
          />
          {enviando && (
            <View style={styles.carregandoQr}>
              <ActivityIndicator color="#1A1A1A" size="large" />
            </View>
          )}
        </View>
      </Pressable>

      {/* Dica discreta: só quem sabe entende que é o pedido de ajuda */}
      <Text style={styles.dica}>
        {segurando ? 'Continue segurando...' : 'Chave aleatória · segure o código por 2 s'}
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
  cartaoQr: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1CDC7',
    marginBottom: 8,
  },
  veu: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
  },
  carregandoQr: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
  },
  dica: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 24,
  },
  qrDesativado: {
    opacity: 0.8,
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
