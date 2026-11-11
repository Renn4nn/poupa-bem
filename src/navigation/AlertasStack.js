import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AcionarSos from '../pages/alertas/AcionarSos';
import ListaAlertas from '../pages/alertas/ListaAlertas';
import DetalheAlerta from '../pages/alertas/DetalheAlerta';

const Stack = createNativeStackNavigator();

// Stack do CRUD Alertas/SOS: Botão SOS -> Histórico -> Detalhe.
// Os títulos mantêm a fachada financeira ("Cofrinho").
export default function AlertasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#F5B700',
      }}
    >
      <Stack.Screen
        name="AcionarSos"
        component={AcionarSos}
        options={{ title: 'Cofrinho' }}
      />
      <Stack.Screen
        name="ListaAlertas"
        component={ListaAlertas}
        options={{ title: 'Histórico' }}
      />
      <Stack.Screen
        name="DetalheAlerta"
        component={DetalheAlerta}
        options={{ title: 'Detalhe' }}
      />
    </Stack.Navigator>
  );
}
