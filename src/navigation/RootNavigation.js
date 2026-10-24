import Pin from '../../src/pages/Pin'
import Home from '../../src/pages/Home'
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function RootNavigation(){
  return(
    <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="Pin"
      component={Pin}
    />
    <Stack.Screen 
      name="Home" 
      component={Home} 
    />
  </Stack.Navigator>
  )
}