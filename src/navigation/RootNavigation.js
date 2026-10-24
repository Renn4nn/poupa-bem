import TabsPrincipais from './TabsPrincipais'
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Pin from '../pages/Pin';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pin" component={Pin} />
      <Stack.Screen name="Principal" component={TabsPrincipais} />
    </Stack.Navigator>
  );
}
