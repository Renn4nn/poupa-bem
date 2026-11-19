import { TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { saidaRapida } from '../navigation/navegacao';

// Ícone no canto do cabeçalho de todas as telas da área de apoio.
// Um toque volta para a tela de finanças.
export default function BotaoSaidaRapida() {
  return (
    <TouchableOpacity
      style={styles.botao}
      onPress={saidaRapida}
      accessibilityLabel="Saída rápida"
      hitSlop={10}
    >
      <Ionicons name="exit-outline" size={26} color="#F5B700" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingHorizontal: 8,
  },
});
