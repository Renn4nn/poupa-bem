// Dados fictícios da tabela ALERTA do DER (cada alerta ligado a uma usuária
// e, opcionalmente, a um contato da Rede de Apoio que foi notificado).
// Usados só até a integração com a API, quando os dados virão do banco.
// Localizações fictícias de teste (região central de Londrina).
export const alertasMock = [
  {
    id_alerta: 1,
    id_usuaria: 1,
    id_contato: 2,
    data_hora: '2026-11-08T21:40:00',
    tipo: 'SOS',
    status: 'Concluído',
    latitude: -23.3103,
    longitude: -51.1628,
  },
  {
    id_alerta: 2,
    id_usuaria: 1,
    id_contato: null,
    data_hora: '2026-11-10T19:05:00',
    tipo: 'SOS',
    status: 'Em atendimento',
    latitude: -23.3045,
    longitude: -51.1696,
  },
];

// Status possíveis de um alerta (os mesmos que o painel da delegacia vai usar)
export const statusAlerta = ['Novo', 'Em atendimento', 'Concluído'];

// Cor de cada status nas telas (a mesma ideia que o painel da delegacia vai usar)
export const corStatus = {
  'Novo': '#C62828',
  'Em atendimento': '#F5B700',
  'Concluído': '#2E7D32',
};
