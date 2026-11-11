import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { listarAlertas } from '../../services/alertasService';
import { dataHoraTela, localizacaoTela } from '../../utils/localizacao';
import { corStatus } from '../../mocks/alertas';

export default function ListaAlertas({ navigation }) {
  const [alertas, setAlertas] = useState([]);

  // Recarrega a lista sempre que a tela volta a aparecer
  // (depois de enviar um SOS, mudar o status ou excluir)
  useEffect(() => {
    async function carregar() {
      setAlertas(await listarAlertas());
    }
    const remover = navigation.addListener('focus', carregar);
    return remover;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={alertas}
        keyExtractor={(item) => String(item.id_alerta)}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum alerta enviado.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cartao}
            onPress={() => navigation.navigate('DetalheAlerta', { id: item.id_alerta })}
          >
            <View style={styles.linha}>
              <Text style={styles.data}>{dataHoraTela(item.data_hora)}</Text>
              <Text style={[styles.status, { backgroundColor: corStatus[item.status] }]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.local}>{localizacaoTela(item.latitude, item.longitude)}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.aviso}>Emergência: 190 · Central de Atendimento à Mulher: 180</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFD',
    padding: 24,
  },
  vazio: {
    textAlign: 'center',
    color: '#6B6B6B',
    marginTop: 24,
  },
  cartao: {
    backgroundColor: '#F2EEE3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  data: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  status: {
    color: '#FEFDFD',
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  local: {
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 6,
  },
  aviso: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 12,
  },
});
