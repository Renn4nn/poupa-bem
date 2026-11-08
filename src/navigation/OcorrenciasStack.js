import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListaOcorrencias from '../pages/ocorrencias/ListaOcorrencias';
import DetalheOcorrencia from '../pages/ocorrencias/DetalheOcorrencia';
import FormOcorrencia from '../pages/ocorrencias/FormOcorrencia';

const Stack = createNativeStackNavigator();

// Stack do CRUD Diário de Ocorrências: Lista -> Detalhe -> Formulário.
export default function OcorrenciasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#F5B700',
      }}
    >
      <Stack.Screen
        name="ListaOcorrencias"
        component={ListaOcorrencias}
        options={{ title: 'Anotações' }}
      />
      <Stack.Screen
        name="DetalheOcorrencia"
        component={DetalheOcorrencia}
        options={{ title: 'Anotação' }}
      />
      <Stack.Screen name="FormOcorrencia" component={FormOcorrencia} />
    </Stack.Navigator>
  );
}
