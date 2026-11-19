// Valores fixos usados pelas telas. Os dados de verdade vêm da API;
// aqui ficam só as listas que não mudam (as mesmas que a API valida).

// Usuária de teste do banco (api/database/schema.sql). Enquanto o app não tem
// login, é a usuária que o app usa ao abrir.
export const ID_USUARIA_TESTE = 1;

// Tipos de violência da Lei Maria da Penha (Lei 11.340/2006, art. 7º)
export const tiposOcorrencia = ['Física', 'Psicológica', 'Sexual', 'Patrimonial', 'Moral'];

// Status possíveis de um alerta (os mesmos do painel da delegacia)
export const statusAlerta = ['Novo', 'Em atendimento', 'Concluído'];

// Cor de cada status nas telas de alerta
export const corStatus = {
  'Novo': '#C62828',
  'Em atendimento': '#F5B700',
  'Concluído': '#2E7D32',
};
