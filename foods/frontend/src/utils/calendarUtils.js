// Utilitários para manipulação de calendário e datas

/**
 * Formata uma data para o padrão brasileiro
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

/**
 * Formata mês e ano para exibição
 * @param {Date} date - Data contendo mês e ano
 * @returns {string} Mês e ano formatados
 */
export const formatMonthYear = (date) => {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

/**
 * Obtém os dias de uma quinzena específica
 * @param {string} quinzena - Tipo de quinzena
 * @param {number} month - Mês (0-11)
 * @param {number} year - Ano
 * @returns {number[]} Array com os dias da quinzena
 */
export const getQuinzenaDays = (quinzena, month, year) => {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  switch (quinzena) {
    case 'primeira_quinzena':
      for (let day = 1; day <= 15; day++) days.push(day);
      break;
    case 'segunda_quinzena':
      for (let day = 16; day <= daysInMonth; day++) days.push(day);
      break;
    case 'semanas_impares':
      for (let week = 1; week <= Math.ceil(daysInMonth / 7); week += 2) {
        for (let day = (week - 1) * 7 + 1; day <= Math.min(week * 7, daysInMonth); day++) {
          days.push(day);
        }
      }
      break;
    case 'semanas_pares':
      for (let week = 2; week <= Math.ceil(daysInMonth / 7); week += 2) {
        for (let day = (week - 1) * 7 + 1; day <= Math.min(week * 7, daysInMonth); day++) {
          days.push(day);
        }
      }
      break;
    case 'ultima_semana':
      const lastWeekStart = daysInMonth - 6;
      for (let day = lastWeekStart; day <= daysInMonth; day++) {
        days.push(day);
      }
      break;
  }
  
  return days;
};

/**
 * Obtém os dias para entrega mensal
 * @param {string} tipoMensal - Tipo de entrega mensal
 * @param {number} month - Mês (0-11)
 * @param {number} year - Ano
 * @returns {number[]} Array com os dias da entrega mensal
 */
export const getMensalDays = (tipoMensal, month, year) => {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  switch (tipoMensal) {
    case 'primeira':
      days.push(1);
      break;
    case 'ultima':
      days.push(daysInMonth);
      break;
    case 'primeira_ultima':
      days.push(1, daysInMonth);
      break;
  }
  
  return days;
};

/**
 * Obtém data alternativa para entrega em feriado
 * @param {Date} dataFeriado - Data do feriado
 * @returns {Date} Data alternativa
 */
export const getDataAlternativa = (dataFeriado) => {
  const dataAlternativa = new Date(dataFeriado);
  dataAlternativa.setDate(dataFeriado.getDate() - 1);
  
  // Se for domingo, ir para sexta
  if (dataAlternativa.getDay() === 0) {
    dataAlternativa.setDate(dataFeriado.getDate() - 2);
  }
  
  return dataAlternativa;
};

/**
 * Detecta conflitos entre entregas
 * @param {Array} deliveries - Array de entregas
 * @returns {Array} Array de entregas com conflitos detectados
 */
export const detectConflicts = (deliveries) => {
  const conflicts = [];
  const deliveryDates = deliveries.map(d => d.date.getTime());
  
  // Detectar entregas no mesmo dia
  const dateCounts = {};
  deliveryDates.forEach(date => {
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });
  
  Object.keys(dateCounts).forEach(date => {
    if (dateCounts[date] > 1) {
      const conflictDate = new Date(parseInt(date));
      const conflictDeliveries = deliveries.filter(d => d.date.getTime() === parseInt(date));
      conflicts.push({
        date: conflictDate,
        deliveries: conflictDeliveries,
        type: 'same_day'
      });
    }
  });
  
  // Marcar entregas com conflitos
  return deliveries.map(delivery => {
    const hasConflict = conflicts.some(c => c.date.getTime() === delivery.date.getTime());
    return {
      ...delivery,
      status: hasConflict ? 'conflict' : delivery.status,
      conflicts: hasConflict ? conflicts.filter(c => c.date.getTime() === delivery.date.getTime()) : []
    };
  });
};
