import Perfil from '../pages/perfil/Perfil'
import { opcoesHeader } from './opcoesHeader';
import EditarPerfil from '../pages/perfil/EditarPerfil'
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

// Stack do CRUD de Perfil: Perfil -> EditarPerfil.
export default function PerfilStack(){
  return(
    <Stack.Navigator screenOptions={opcoesHeader}>
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
