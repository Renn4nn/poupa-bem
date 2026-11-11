import * as Location from 'expo-location';

// Pega a localização atual do celular (ou do navegador, na versão web).
// Retorna { latitude, longitude } ou null se a permissão for negada
// ou se não for possível obter a posição. O alerta é enviado mesmo assim.
export async function obterLocalizacao() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const posicao = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: posicao.coords.latitude,
      longitude: posicao.coords.longitude,
    };
  } catch {
    return null;
  }
}

// '2026-11-10T19:05:00' -> '10/11/2026 às 19:05'
export function dataHoraTela(dataHoraBanco) {
  const [data, hora] = dataHoraBanco.split('T');
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano} às ${hora.slice(0, 5)}`;
}

// Texto curto para mostrar a localização na tela
export function localizacaoTela(latitude, longitude) {
  if (latitude == null || longitude == null) return 'Localização indisponível';
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}
