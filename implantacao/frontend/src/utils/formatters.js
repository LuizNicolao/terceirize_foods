/**
 * Utilitários de formatação
 */

/**
 * Formata data para exibição no formato brasileiro (DD/MM/YYYY HH:mm)
 * @param {string|Date} dateString - Data no formato ISO ou Date object
 * @returns {string} - Data formatada (DD/MM/YYYY HH:mm) ou string vazia se inválida
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    let data;
    
    // Se já for um objeto Date
    if (dateString instanceof Date) {
      data = dateString;
    } else if (typeof dateString === 'string') {
      // Se está no formato ISO com timezone (ex: "2024-01-15T10:30:00.000Z")
      if (dateString.includes('T')) {
        // Extrair apenas a parte da data (YYYY-MM-DD) para evitar problemas de timezone
        const dataPart = dateString.split('T')[0];
        const [year, month, day] = dataPart.split('-');
        data = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (dateString.includes('-')) {
        // Se está no formato YYYY-MM-DD, fazer parsing manual
        const [year, month, day] = dateString.split('-');
        data = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Tentar parse direto
        data = new Date(dateString);
      }
    } else {
      return '';
    }
    
    // Verificar se a data é válida
    if (isNaN(data.getTime())) {
      return '';
    }
    
    // Formatar para DD/MM/YYYY HH:mm
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Formata data apenas com data (sem hora) no formato brasileiro (DD/MM/YYYY)
 * @param {string|Date} dateString - Data no formato ISO ou Date object
 * @returns {string} - Data formatada (DD/MM/YYYY) ou string vazia se inválida
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return '';
  
  try {
    let data;
    
    // Se já for um objeto Date
    if (dateString instanceof Date) {
      data = dateString;
    } else if (typeof dateString === 'string') {
      // Se está no formato ISO com timezone (ex: "2024-01-15T10:30:00.000Z")
      if (dateString.includes('T')) {
        // Extrair apenas a parte da data (YYYY-MM-DD) para evitar problemas de timezone
        const dataPart = dateString.split('T')[0];
        const [year, month, day] = dataPart.split('-');
        data = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (dateString.includes('-')) {
        // Se está no formato YYYY-MM-DD, fazer parsing manual
        const [year, month, day] = dateString.split('-');
        data = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Tentar parse direto
        data = new Date(dateString);
      }
    } else {
      return '';
    }
    
    // Verificar se a data é válida
    if (isNaN(data.getTime())) {
      return '';
    }
    
    // Formatar para DD/MM/YYYY
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};
