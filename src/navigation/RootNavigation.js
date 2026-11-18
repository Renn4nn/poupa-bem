import TabsMain from './TabsMain'
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../pages/Home';
import Pin from '../pages/Pin';

const Stack = createNativeStackNavigator();

// Home (finanças, a fachada) -> segurar o saldo 3 s -> Pin -> Main (área de apoio em abas).
// A saída rápida (navegacao.js) volta para Home apagando o histórico.
export default function RootNavigation() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Pin" component={Pin} />
      <Stack.Screen name="Main" component={TabsMain} />
    </Stack.Navigator>
  );
}
