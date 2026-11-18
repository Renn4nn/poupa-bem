import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { opcoesHeader } from './opcoesHeader';
import ListaContatos from '../pages/contatos/ListaContatos';

const Stack = createNativeStackNavigator();

export default function ContatosStack() {
  return (
    <Stack.Navigator screenOptions={opcoesHeader}>
      <Stack.Screen
        name="ListaContatos"
        component={ListaContatos}
        options={{ title: 'Pagamentos' }}
      />
    </Stack.Navigator>
  );
}