import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function Pin({ navigation }) {
  return (
    <View style={styles.container}>

      <Image source={require('../assets/poupa-bem-logo.png')} style={{width: 120, height: 120}}/>
      {/* Título */}
      <Text style={styles.title}>Código de verificação</Text>

      {/* Bolinhas */}
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Teclado Numérico */}
      <View style={styles.keypad}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>3</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>6</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>9</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
        <View style={{width: 72, height: 72}}/>{/* Espaço vazio */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.forwardButton} 
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.buttonText}>Avançar</Text>
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
  forwardButton: {
    width: '100%',
    maxWidth: 280,
    height: 50,
    backgroundColor: '#F2EEE3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});