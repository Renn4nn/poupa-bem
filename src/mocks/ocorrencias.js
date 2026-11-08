// Dados fictícios da tabela OCORRENCIA do DER (cada uma ligada a uma usuária).
// Usados só até a Entrega 4, quando os dados virão da API.
export const ocorrenciasMock = [
  {
    id_ocorrencia: 1,
    id_usuaria: 1,
    data: '2026-10-20',
    tipo: 'Psicológica',
    local: 'Casa',
    descricao: 'Registro fictício de teste: discussão com ameaças verbais.',
  },
  {
    id_ocorrencia: 2,
    id_usuaria: 1,
    data: '2026-10-28',
    tipo: 'Patrimonial',
    local: 'Casa',
    descricao: 'Registro fictício de teste: celular retido sem autorização.',
  },
];

// Tipos de violência da Lei Maria da Penha (Lei 11.340/2006, art. 7º)
export const tiposOcorrencia = ['Física', 'Psicológica', 'Sexual', 'Patrimonial', 'Moral'];
