import { createNavigationContainerRef } from '@react-navigation/native';

// Referência ao NavigationContainer (ligada no App.js). Permite mexer na
// navegação principal de qualquer tela, mesmo de dentro das abas.
export const navigationRef = createNavigationContainerRef();

// Saída rápida: volta para a tela de finanças e apaga o histórico,
// então o botão "voltar" não leva de novo para a área de apoio.
export function saidaRapida() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: 'Home' }] });
  }
}
