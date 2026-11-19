import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './src/navigation/RootNavigation';
import { navigationRef } from './src/navigation/navegacao';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <RootNavigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
