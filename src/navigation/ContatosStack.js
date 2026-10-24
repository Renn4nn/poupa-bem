import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListaContatos from '../pages/contatos/ListaContatos';

const Stack = createNativeStackNavigator();

export default function ContatosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#F5B700',
      }}
    >
      <Stack.Screen
        name="ListaContatos"
        component={ListaContatos}
        options={{ title: 'Pagamentos' }}
      />
    </Stack.Navigator>
  );
}
