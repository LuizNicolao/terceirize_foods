/**
 * Configuração das datas de entrega por tipo
 * IMPORTANTE: Confirmar estas datas com o Arlindo antes de implementar
 */

const DELIVERY_SCHEDULE = {
  // HORTI - Hortifrúti (exemplo: terças e quintas)
  HORTI: {
    daysOfWeek: [2, 4], // 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta
    description: 'Terças e Quintas'
  },
  
  // PAO - Pão (exemplo: segundas, quartas e sextas)
  PAO: {
    daysOfWeek: [1, 3, 5], // Segunda, Quarta, Sexta
    description: 'Segundas, Quartas e Sextas'
  },
  
  // PERECIVEL - Perecíveis (exemplo: terças e quintas)
  PERECIVEL: {
    daysOfWeek: [2, 4], // Terça, Quinta
    description: 'Terças e Quintas'
  },
  
  // BASE SECA - Base Seca (exemplo: segundas e quartas)
  'BASE SECA': {
    daysOfWeek: [1, 3], // Segunda, Quarta
    description: 'Segundas e Quartas'
  },
  
  // LIMPEZA - Limpeza (exemplo: sextas)
  LIMPEZA: {
    daysOfWeek: [5], // Sexta
    description: 'Sextas'
  }
};

/**
 * Calcula o status de entrega baseado na data e tipo
 * @param {Date} dataRecebimento - Data do recebimento
 * @param {string} tipoEntrega - Tipo da entrega (HORTI, PAO, etc.)
 * @returns {string} - Status: 'No Prazo', 'Atrasado', 'Antecipado'
 */
function calcularStatusEntrega(dataRecebimento, tipoEntrega) {
  const data = new Date(dataRecebimento);
  const diaSemana = data.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado
  
  const config = DELIVERY_SCHEDULE[tipoEntrega];
  if (!config) {
    return 'No Prazo'; // Tipo não configurado, assume no prazo
  }
  
  // Verificar se a data está em um dia válido para o tipo
  const isDiaValido = config.daysOfWeek.includes(diaSemana);
  
  if (isDiaValido) {
    return 'No Prazo';
  } else {
    // Verificar se é antecipado ou atrasado
    const hoje = new Date();
    const diffDias = Math.floor((data - hoje) / (1000 * 60 * 60 * 24));
    
    if (diffDias > 0) {
      return 'Antecipado';
    } else {
      return 'Atrasado';
    }
  }
}

/**
 * Obtém a próxima data válida para um tipo de entrega
 * @param {string} tipoEntrega - Tipo da entrega
 * @param {Date} dataBase - Data base para cálculo (opcional, usa hoje se não informado)
 * @returns {Date} - Próxima data válida
 */
function obterProximaDataValida(tipoEntrega, dataBase = new Date()) {
  const config = DELIVERY_SCHEDULE[tipoEntrega];
  if (!config) {
    return dataBase;
  }
  
  const data = new Date(dataBase);
  
  // Buscar próximo dia válido
  for (let i = 0; i < 7; i++) {
    const diaSemana = data.getDay();
    if (config.daysOfWeek.includes(diaSemana)) {
      return new Date(data);
    }
    data.setDate(data.getDate() + 1);
  }
  
  return data;
}

module.exports = {
  DELIVERY_SCHEDULE,
  calcularStatusEntrega,
  obterProximaDataValida
};
