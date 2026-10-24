import TabsMain from './TabsMain'
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Pin from '../pages/Pin';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pin" component={Pin} />
      <Stack.Screen name="Main" component={TabsMain} />
    </Stack.Navigator>
  );
}
