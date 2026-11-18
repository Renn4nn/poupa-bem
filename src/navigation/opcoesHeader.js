import BotaoSaidaRapida from '../components/BotaoSaidaRapida';

// Cabeçalho padrão da área de apoio (preto e amarelo, com a saída rápida à direita).
// Todos os stacks usam: <Stack.Navigator screenOptions={opcoesHeader}>
export const opcoesHeader = {
  headerStyle: { backgroundColor: '#1A1A1A' },
  headerTintColor: '#F5B700',
  headerRight: () => <BotaoSaidaRapida />,
};
