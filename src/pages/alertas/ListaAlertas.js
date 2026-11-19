import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { listarAlertas } from '../../services/alertasService';
import { dataHoraTela, localizacaoTela } from '../../utils/localizacao';
import { corStatus, statusAlerta } from '../../constantes';
import { Carregando, ErroTela } from '../../components/EstadoTela';

// Opções do filtro: todos os alertas ou só os de um status
const FILTROS = ['Todos', ...statusAlerta];

export default function ListaAlertas({ navigation }) {
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setAlertas(await listarAlertas());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  // "Puxar para atualizar": busca de novo na API sem trocar a tela pelo carregando
  async function atualizar() {
    setAtualizando(true);
    try {
      setAlertas(await listarAlertas());
      setErro('');
    } catch (e) {
      setErro(e.message);
    } finally {
      setAtualizando(false);
    }
  }

  // Recarrega a lista sempre que a tela volta a aparecer
  // (depois de enviar um SOS, mudar o status ou excluir)
  useEffect(() => {
    const remover = navigation.addListener('focus', carregar);
    return remover;
  }, [navigation]);

  if (carregando) return <Carregando />;
  if (erro !== '') return <ErroTela mensagem={erro} onTentar={carregar} />;

  // Lista mostrada de acordo com o filtro escolhido
  const visiveis = filtro === 'Todos' ? alertas : alertas.filter((a) => a.status === filtro);

  // Resumo: quantos alertas existem em cada status (ex.: "1 Novo · 2 Concluído")
  const resumo = statusAlerta
    .map((s) => ({ status: s, total: alertas.filter((a) => a.status === s).length }))
    .filter((r) => r.total > 0)
    .map((r) => `${r.total} ${r.status}`)
    .join(' · ');

  return (
    <View style={styles.container}>
      {resumo !== '' && <Text style={styles.resumo}>{resumo}</Text>}

      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtro, filtro === f && styles.filtroAtivo]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filtroText, filtro === f && styles.filtroTextAtivo]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={visiveis}
        keyExtractor={(item) => String(item.id_alerta)}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            {filtro === 'Todos' ? 'Nenhum alerta enviado.' : `Nenhum alerta "${filtro}".`}
          </Text>
        }
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
  resumo: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filtro: {
    borderWidth: 1,
    borderColor: '#D1CDC7',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  filtroAtivo: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  filtroText: {
    color: '#1A1A1A',
    fontSize: 13,
  },
  filtroTextAtivo: {
    color: '#F5B700',
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
