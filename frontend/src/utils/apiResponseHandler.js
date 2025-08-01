/**
 * Utilitário para padronizar o tratamento de respostas da API
 * Trata tanto a estrutura {success: true, data: {...}} quanto a estrutura direta
 */

/**
 * Extrai os dados da resposta da API, tratando diferentes estruturas
 * @param {Object} response - Resposta da API
 * @returns {Object} Dados extraídos
 */
export const extractApiData = (response) => {
  if (!response || !response.data) {
    return null;
  }

  // Se tem a estrutura {success: true, data: {...}}
  if (response.data && response.data.data !== undefined) {
    return response.data.data;
  }

  // Se tem a estrutura direta
  if (response.data) {
    return response.data;
  }

  return null;
};

/**
 * Extrai dados de uma resposta de lista paginada
 * @param {Object} response - Resposta da API
 * @returns {Object} {items, pagination, meta}
 */
export const extractPaginatedData = (response) => {
  const data = extractApiData(response);
  
  if (!data) {
    return { items: [], pagination: null, meta: null };
  }

  // Se tem estrutura de paginação
  if (data.items && data.meta) {
    return {
      items: data.items,
      pagination: data.meta.pagination,
      meta: data.meta
    };
  }

  // Se tem estrutura simples de lista
  if (Array.isArray(data)) {
    return {
      items: data,
      pagination: null,
      meta: null
    };
  }

  // Se tem estrutura com data direta
  if (data.data && Array.isArray(data.data)) {
    return {
      items: data.data,
      pagination: data.pagination || null,
      meta: data.meta || null
    };
  }

  return { items: [], pagination: null, meta: null };
};

/**
 * Verifica se a resposta da API foi bem-sucedida
 * @param {Object} response - Resposta da API
 * @returns {boolean}
 */
export const isApiSuccess = (response) => {
  if (!response || !response.data) {
    return false;
  }

  // Se tem a estrutura {success: true, data: {...}}
  if (response.data.success !== undefined) {
    return response.data.success === true;
  }

  // Se tem dados diretos, considera sucesso
  return response.data !== null && response.data !== undefined;
};

/**
 * Extrai mensagem de erro da resposta da API
 * @param {Object} error - Erro da API
 * @returns {string} Mensagem de erro
 */
export const extractErrorMessage = (error) => {
  if (!error) {
    return 'Erro desconhecido';
  }

  // Se tem resposta do servidor
  if (error.response && error.response.data) {
    const data = error.response.data;
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
    
    if (typeof data === 'string') {
      return data;
    }
  }

  // Se tem mensagem direta
  if (error.message) {
    return error.message;
  }

  return 'Erro desconhecido';
}; 