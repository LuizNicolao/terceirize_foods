/**
 * Utilitários para recebimentos de escolas
 */

/**
 * Calcula o status de entrega baseado na data e tipo de entrega
 * @param {string} dataRecebimento - Data no formato YYYY-MM-DD
 * @param {string} tipoEntrega - Tipo de entrega (HORTI, PAO, PERECIVEL, BASE SECA, LIMPEZA)
 * @returns {string} - Status da entrega ('No Prazo', 'Atrasado', 'Antecipado')
 */
export const calcularStatusEntrega = (dataRecebimento, tipoEntrega) => {
  if (!dataRecebimento || !tipoEntrega) {
    return 'No Prazo';
  }

  // Corrigir parsing de data para evitar problemas de fuso horário
  const [ano, mes, dia] = dataRecebimento.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
  const diaSemana = data.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  
  // Hortifruti e Pão: Segunda (1) e Terça (2) = No Prazo
  if (tipoEntrega === 'HORTI' || tipoEntrega === 'PAO') {
    if (diaSemana === 1 || diaSemana === 2) {
      return 'No Prazo';
    } else {
      return 'Atrasado';
    }
  }
  
  // Perecíveis, Base Seca e Limpeza: Quarta (3) e Quinta (4) = No Prazo
  if (tipoEntrega === 'PERECIVEL' || tipoEntrega === 'BASE SECA' || tipoEntrega === 'LIMPEZA') {
    if (diaSemana === 3 || diaSemana === 4) {
      return 'No Prazo';
    } else if (diaSemana === 1 || diaSemana === 2) {
      return 'Antecipado'; // Segunda e Terça = Antecipado
    } else {
      return 'Atrasado'; // Sexta e outros dias = Atrasado
    }
  }
  
  return 'No Prazo'; // Default
};

/**
 * Obtém a cor do badge baseado no status
 * @param {string} status - Status da entrega
 * @returns {string} - Classe CSS para cor
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'No Prazo':
      return 'bg-green-100 text-green-800';
    case 'Atrasado':
      return 'bg-red-100 text-red-800';
    case 'Antecipado':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Obtém o ícone baseado no status
 * @param {string} status - Status da entrega
 * @returns {string} - Nome do ícone
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'No Prazo':
      return 'FaCheckCircle';
    case 'Atrasado':
      return 'FaTimesCircle';
    case 'Antecipado':
      return 'FaClock';
    default:
      return 'FaQuestionCircle';
  }
};

/**
 * Obtém a descrição do status
 * @param {string} status - Status da entrega
 * @returns {string} - Descrição do status
 */
export const getStatusDescription = (status) => {
  switch (status) {
    case 'No Prazo':
      return 'Entrega realizada no prazo';
    case 'Atrasado':
      return 'Entrega realizada fora do prazo';
    case 'Antecipado':
      return 'Entrega realizada antecipadamente';
    default:
      return 'Status não definido';
  }
};

/**
 * Formata data para exibição no formato brasileiro (DD/MM/YYYY)
 * @param {string} dataRecebimento - Data no formato YYYY-MM-DD
 * @returns {string} - Data formatada (DD/MM/YYYY)
 */
export const formatarDataParaExibicao = (dataRecebimento) => {
  if (!dataRecebimento) return '';
  
  try {
    // Usar a mesma abordagem do sistema Foods - parsing manual para evitar timezone
    let data;
    
    if (dataRecebimento.includes('T')) {
      // Se está no formato ISO, extrair apenas a parte da data (YYYY-MM-DD)
      const dataPart = dataRecebimento.split('T')[0];
      const [year, month, day] = dataPart.split('-');
      data = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Se está no formato YYYY-MM-DD, fazer parsing manual
      const [year, month, day] = dataRecebimento.split('-');
      data = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    return data.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

/**
 * Valida se a data de recebimento é válida
 * @param {string} dataRecebimento - Data no formato YYYY-MM-DD
 * @returns {boolean} - Se a data é válida
 */
export const validarDataRecebimento = (dataRecebimento) => {
  if (!dataRecebimento) return false;
  
  const data = new Date(dataRecebimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Não permitir datas futuras
  return data <= hoje;
};

/**
 * Obtém estatísticas de status dos recebimentos
 * @param {Array} recebimentos - Lista de recebimentos
 * @returns {Object} - Estatísticas de status
 */
export const obterEstatisticasStatus = (recebimentos) => {
  const stats = {
    total: recebimentos.length,
    noPrazo: 0,
    atrasado: 0,
    antecipado: 0
  };

  recebimentos.forEach(recebimento => {
    switch (recebimento.status_entrega) {
      case 'No Prazo':
        stats.noPrazo++;
        break;
      case 'Atrasado':
        stats.atrasado++;
        break;
      case 'Antecipado':
        stats.antecipado++;
        break;
    }
  });

  return stats;
};
