/**
 * Utilitários de formatação
 * Centraliza funções de formatação reutilizáveis
 */

/**
 * Formatar data para exibição
 * @param {string|Date} dateString - Data para formatar
 * @returns {string} Data formatada
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
};

/**
 * Formatar data apenas (sem hora)
 * @param {string|Date} dateString - Data para formatar
 * @returns {string} Data formatada
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
};

/**
 * Formatar moeda para exibição
 * @param {number} value - Valor para formatar
 * @param {string} currency - Moeda (padrão: BRL)
 * @returns {string} Valor formatado
 */
export const formatCurrency = (value, currency = 'BRL') => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return '-';
  }
};

/**
 * Formatar número para exibição
 * @param {number} value - Valor para formatar
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Número formatado
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  } catch (error) {
    console.error('Erro ao formatar número:', error);
    return '-';
  }
};

/**
 * Formatar per capita (peso em kg)
 * @param {number} value - Valor para formatar
 * @returns {string} Per capita formatado
 */
export const formatPerCapita = (value) => {
  if (value === null || value === undefined || isNaN(value) || value === 0) return '0,000000';
  
  try {
    return parseFloat(value).toFixed(6).replace('.', ',');
  } catch (error) {
    console.error('Erro ao formatar per capita:', error);
    return '0,000000';
  }
};

/**
 * Formatar status para exibição
 * @param {boolean|number} status - Status para formatar
 * @returns {string} Status formatado
 */
export const formatStatus = (status) => {
  if (status === true || status === 1 || status === '1') return 'Ativo';
  if (status === false || status === 0 || status === '0') return 'Inativo';
  return 'Indefinido';
};

/**
 * Formatar boolean para exibição
 * @param {boolean|number} value - Valor para formatar
 * @returns {string} Boolean formatado
 */
export const formatBoolean = (value) => {
  if (value === true || value === 1 || value === '1') return 'Sim';
  if (value === false || value === 0 || value === '0') return 'Não';
  return 'Indefinido';
};

/**
 * Formatar período para exibição
 * @param {string} periodo - Período para formatar
 * @returns {string} Período formatado
 */
export const formatPeriodo = (periodo) => {
  const periodos = {
    'lanche_manha': 'Lanche Manhã',
    'almoco': 'Almoço',
    'lanche_tarde': 'Lanche Tarde',
    'parcial': 'Parcial',
    'eja': 'EJA'
  };
  return periodos[periodo] || periodo;
};

/**
 * Formatar CPF para exibição
 * @param {string} cpf - CPF para formatar
 * @returns {string} CPF formatado
 */
export const formatCPF = (cpf) => {
  if (!cpf) return '-';
  
  try {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } catch (error) {
    console.error('Erro ao formatar CPF:', error);
    return cpf;
  }
};

/**
 * Formatar CNPJ para exibição
 * @param {string} cnpj - CNPJ para formatar
 * @returns {string} CNPJ formatado
 */
export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '-';
  
  try {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  } catch (error) {
    console.error('Erro ao formatar CNPJ:', error);
    return cnpj;
  }
};

/**
 * Formatar telefone para exibição
 * @param {string} phone - Telefone para formatar
 * @returns {string} Telefone formatado
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  
  try {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  } catch (error) {
    console.error('Erro ao formatar telefone:', error);
    return phone;
  }
};
