import Perfil from '../pages/perfil/Perfil'
import EditarPerfil from '../pages/perfil/EditarPerfil'
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

// Stack do CRUD de Perfil: Perfil -> EditarPerfil.
// No Drawer da área protegida, registrar como:
// <Drawer.Screen name="MeuPerfil" component={PerfilStack} />
export default function PerfilStack(){
  return(
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#F5B700',
      }}
    >
      <Stack.Screen
        name="Perfil"
        component={Perfil}
        options={{ title: 'Meu perfil' }}
      />
      <Stack.Screen
        name="EditarPerfil"
        component={EditarPerfil}
        options={{ title: 'Editar perfil' }}
      />
    </Stack.Navigator>
  )
}
