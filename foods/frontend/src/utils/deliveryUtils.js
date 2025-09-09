// Utilitários para manipulação de entregas e cronogramas

/**
 * Gera entregas mock baseadas nas regras de periodicidade
 * @param {Object} agrupamentoData - Dados do agrupamento
 * @param {Date} selectedMonth - Mês selecionado
 * @returns {Array} Array de entregas geradas
 */
export const generateMockDeliveries = (agrupamentoData, selectedMonth) => {
  if (!agrupamentoData) return [];

  const deliveries = [];
  const currentMonth = selectedMonth.getMonth();
  const currentYear = selectedMonth.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Gerar entregas baseado no tipo de periodicidade
  const tipo = agrupamentoData.tipo_nome?.toLowerCase();
  const regras = agrupamentoData.regras_calendario || {};

  if (tipo === 'semanal' && regras.dias_semana) {
    // Entregas semanais
    regras.dias_semana.forEach(diaSemana => {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        if (date.getDay() === diaSemana) {
          deliveries.push({
            id: `delivery_${day}`,
            date: date,
            type: 'semanal',
            schools: agrupamentoData.unidades_escolares?.length || 0,
            products: agrupamentoData.produtos_individuais?.length || 0,
            status: 'scheduled',
            conflicts: []
          });
        }
      }
    });
  } else if (tipo === 'quinzenal' && regras.dias_semana && regras.quinzena) {
    // Entregas quinzenais
    const quinzenaDays = getQuinzenaDays(regras.quinzena, currentMonth, currentYear);
    regras.dias_semana.forEach(diaSemana => {
      quinzenaDays.forEach(day => {
        const date = new Date(currentYear, currentMonth, day);
        if (date.getDay() === diaSemana) {
          deliveries.push({
            id: `delivery_${day}`,
            date: date,
            type: 'quinzenal',
            schools: agrupamentoData.unidades_escolares?.length || 0,
            products: agrupamentoData.produtos_individuais?.length || 0,
            status: 'scheduled',
            conflicts: []
          });
        }
      });
    });
  } else if (tipo === 'mensal' && regras.dias_semana && regras.tipo_mensal) {
    // Entregas mensais
    const mensalDays = getMensalDays(regras.tipo_mensal, currentMonth, currentYear);
    regras.dias_semana.forEach(diaSemana => {
      mensalDays.forEach(day => {
        const date = new Date(currentYear, currentMonth, day);
        if (date.getDay() === diaSemana) {
          deliveries.push({
            id: `delivery_${day}`,
            date: date,
            type: 'mensal',
            schools: agrupamentoData.unidades_escolares?.length || 0,
            products: agrupamentoData.produtos_individuais?.length || 0,
            status: 'scheduled',
            conflicts: []
          });
        }
      });
    });
  }

  return deliveries;
};

/**
 * Obtém o tipo de entrega formatado
 * @param {string} type - Tipo da entrega
 * @returns {string} Tipo formatado
 */
export const getDeliveryType = (type) => {
  switch (type) {
    case 'semanal':
      return 'Semanal';
    case 'quinzenal':
      return 'Quinzenal';
    case 'mensal':
      return 'Mensal';
    default:
      return 'Entrega';
  }
};

/**
 * Obtém o tipo de entrega abreviado
 * @param {string} type - Tipo da entrega
 * @returns {string} Tipo abreviado
 */
export const getDeliveryTypeAbbr = (type) => {
  switch (type) {
    case 'semanal': return 'Sem';
    case 'quinzenal': return 'Quin';
    case 'mensal': return 'Men';
    default: return 'Ent';
  }
};

/**
 * Obtém a cor do tipo de entrega
 * @param {string} type - Tipo da entrega
 * @returns {string} Classes CSS para cor
 */
export const getTypeColor = (type) => {
  switch (type) {
    case 'semanal':
      return 'text-blue-600 bg-blue-100';
    case 'quinzenal':
      return 'text-purple-600 bg-purple-100';
    case 'mensal':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Obtém o ícone e cor baseado no status da entrega
 * @param {Object} delivery - Objeto da entrega
 * @returns {Object} Objeto com ícone e cores
 */
export const getDeliveryIcon = (delivery) => {
  switch (delivery.status) {
    case 'conflict':
      // Se é conflito por feriado, usar ícone de bandeira
      if (delivery.feriado) {
        return { icon: 'FaFlag', color: 'text-orange-600', bg: 'bg-orange-100' };
      }
      return { icon: 'FaExclamationTriangle', color: 'text-red-600', bg: 'bg-red-100' };
    case 'scheduled':
      return { icon: 'FaCheckCircle', color: 'text-green-600', bg: 'bg-green-100' };
    case 'pending':
      return { icon: 'FaClock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    default:
      return { icon: 'FaTruck', color: 'text-blue-600', bg: 'bg-blue-100' };
  }
};

/**
 * Obtém o status badge para uma entrega
 * @param {string} status - Status da entrega
 * @returns {Object} Objeto com classes CSS para o badge
 */
export const getStatusBadge = (status) => {
  switch (status) {
    case 'scheduled':
      return {
        classes: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
        icon: 'FaCheckCircle',
        text: 'Programada'
      };
    case 'conflict':
      return {
        classes: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
        icon: 'FaExclamationTriangle',
        text: 'Conflito'
      };
    case 'pending':
      return {
        classes: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
        icon: 'FaClock',
        text: 'Pendente'
      };
    default:
      return {
        classes: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
        icon: 'FaTruck',
        text: 'Entrega'
      };
  }
};

// Importar funções do calendarUtils
import { getQuinzenaDays, getMensalDays } from './calendarUtils';
