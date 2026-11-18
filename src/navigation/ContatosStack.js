import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { opcoesHeader } from './opcoesHeader';
import ListaContatos from '../pages/contatos/ListaContatos';
import FormContato from '../pages/contatos/FormContato';

const Stack = createNativeStackNavigator();

// Stack do CRUD Rede de Apoio: Lista -> Formulário (criar, editar e excluir).
export default function ContatosStack() {
  return (
    <Stack.Navigator screenOptions={opcoesHeader}>
      <Stack.Screen
        name="ListaContatos"
        component={ListaContatos}
        options={{ title: 'Pagamentos' }}
      />
      <Stack.Screen name="FormContato" component={FormContato} />
    </Stack.Navigator>
  );
}
