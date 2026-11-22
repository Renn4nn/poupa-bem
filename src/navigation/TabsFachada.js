import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../pages/Home';
import PixPagamentos from '../pages/financas/PixPagamentos';
import ContasAPagar from '../pages/financas/ContasAPagar';
import CofrinhoFinancas from '../pages/financas/CofrinhoFinancas';
import PerfilFinancas from '../pages/financas/PerfilFinancas';
import { opcoesHeaderFachada } from '../pages/financas/estilosFinancas';

const Tab = createBottomTabNavigator();

// Abas da fachada financeira (antes do PIN). Têm os mesmos nomes e ícones das
// abas da área de apoio (TabsMain), mas aqui tudo é um app de finanças que
// funciona de verdade. Quem pegar o celular não vê diferença entre os dois lados.
// Segurar o saldo 3 s na aba Início continua abrindo o PIN.
export default function TabsFachada() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...opcoesHeaderFachada,
        tabBarActiveTintColor: '#1A1A1A',
        tabBarInactiveTintColor: '#6B6B6B',
      }}
    >
      <Tab.Screen
        name="FInicio"
        component={Home}
        options={{
          headerShown: false,
          title: 'Início',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FPagamentos"
        component={PixPagamentos}
        options={{
          title: 'Pix e Pagamentos',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FAnotacoes"
        component={ContasAPagar}
        options={{
          title: 'Anotações',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FCofrinho"
        component={CofrinhoFinancas}
        options={{
          title: 'Cofrinho',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FPerfil"
        component={PerfilFinancas}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
