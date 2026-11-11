import ContatosStack from './ContatosStack';
import PerfilStack from './PerfilStack';
import OcorrenciasStack from './OcorrenciasStack';
import AlertasStack from './AlertasStack';
import Home from '../pages/Home';
import Ionicons from '@expo/vector-icons/Ionicons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function TabsMain() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A1A1A',
        tabBarInactiveTintColor: '#6B6B6B',
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={Home}
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Pagamentos"
        component={ContatosStack}
        options={{
          title:'Pix e Pagamentos',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Anotacoes"
        component={OcorrenciasStack}
        options={{
          title: 'Anotações',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cofrinho"
        component={AlertasStack}
        options={{
          title: 'Cofrinho',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilStack}
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