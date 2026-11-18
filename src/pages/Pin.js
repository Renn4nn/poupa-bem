import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { verificarPin } from '../services/usuariaService';

// Teclas do teclado numérico, linha por linha ('' = espaço vazio)
const TECLAS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '←'],
];

export default function Pin({ navigation }) {
  const [pin, setPin] = useState(''); // fica só na memória da tela, nunca é salvo
  const [erro, setErro] = useState('');
  const [verificando, setVerificando] = useState(false);

  function apertar(tecla) {
    setErro('');
    if (tecla === '←') {
      setPin(pin.slice(0, -1)); // apaga o último número
    } else if (pin.length < 4) {
      setPin(pin + tecla);
    }
  }

  // A API compara o PIN com o hash salvo no banco (POST /usuarias/:id/verificar-pin)
  async function avancar() {
    if (pin.length < 4) {
      setErro('Digite os 4 números.');
      return;
    }
    setVerificando(true);
    try {
      const valido = await verificarPin(pin);
      if (valido) {
        // reset: a área de apoio vira a única tela, então "voltar" não mostra o PIN de novo
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        setErro('Código incorreto.');
        setPin('');
      }
    } catch (e) {
      // 404: o perfil foi excluído. Entra para a usuária poder criar outro na aba Perfil.
      if (e.status === 404) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        setErro(e.message);
      }
    } finally {
      setVerificando(false);
    }
  }

  return (
    <View style={styles.container}>

      <Image source={require('../assets/poupa-bem-logo.png')} style={{width: 120, height: 120}}/>
      {/* Título */}
      <Text style={styles.title}>Código de verificação</Text>

      {/* Bolinhas: ficam pretas conforme os números são digitados */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotPreenchido]} />
        ))}
      </View>

      {/* Teclado Numérico */}
      <View style={styles.keypad}>
        {TECLAS.map((linha, i) => (
          <View key={i} style={styles.row}>
            {linha.map((tecla) =>
              tecla === '' ? (
                <View key="vazio" style={{width: 72, height: 72}}/>
              ) : (
                <TouchableOpacity key={tecla} style={styles.button} onPress={() => apertar(tecla)}>
                  <Text style={styles.buttonText}>{tecla}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        ))}
      </View>

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      <TouchableOpacity
        style={styles.forwardButton}
        onPress={avancar}
        disabled={verificando}
      >
        {verificando
          ? <ActivityIndicator color="#1A1A1A" />
          : <Text style={styles.buttonText}>Avançar</Text>}
      </TouchableOpacity>

      {/* Volta para a tela de finanças */}
      <TouchableOpacity style={styles.cancelar} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelarText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 10,
    backgroundColor: '#D1CDC7',
    marginHorizontal: 8,
  },
  dotPreenchido: {
    backgroundColor: '#1A1A1A',
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2EEE3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  erro: {
    color: '#C62828',
    marginBottom: 12,
  },
  forwardButton: {
    width: '100%',
    maxWidth: 280,
    height: 50,
    backgroundColor: '#F2EEE3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelar: {
    marginTop: 16,
    padding: 8,
  },
  cancelarText: {
    color: '#6B6B6B',
    fontSize: 14,
  },
});
