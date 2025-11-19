/**
 * Funções utilitárias para obter labels de status
 */
export const getStatusNecessidadeLabel = (status) => {
  const statusMap = {
    'NEC': 'NEC - Necessidade Criada',
    'NEC NUTRI': 'NEC NUTRI - Necessidade Ajustada pela Nutricionista',
    'NEC COORD': 'NEC COORD - Necessidade Ajustada pela Coordenação',
    'CONF': 'CONF - Confirmada',
    'CONF NUTRI': 'CONF NUTRI - Confirmada pela Nutricionista',
    'CONF COORD': 'CONF COORD - Confirmada pela Coordenação'
  };
  return statusMap[status] || status;
};

export const getStatusSubstituicaoLabel = (status) => {
  const statusMap = {
    'conf': 'CONF - Aguardando Confirmação',
    'conf log': 'CONF LOG - Confirmado pela Logística',
    'impressao': 'IMPRESSÃO - Já Impresso',
    'aprovado': 'APROVADO - Aprovado'
  };
  return statusMap[status] || status;
};

