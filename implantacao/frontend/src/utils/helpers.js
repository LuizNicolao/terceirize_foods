/**
 * Utilitários auxiliares
 * Centraliza funções auxiliares reutilizáveis
 */

/**
 * Debounce function
 * @param {Function} func - Função para debounce
 * @param {number} wait - Tempo de espera em ms
 * @param {boolean} immediate - Executar imediatamente
 * @returns {Function} Função com debounce
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Throttle function
 * @param {Function} func - Função para throttle
 * @param {number} limit - Limite de tempo em ms
 * @returns {Function} Função com throttle
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone object
 * @param {any} obj - Objeto para clonar
 * @returns {any} Objeto clonado
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Merge objects deeply
 * @param {object} target - Objeto alvo
 * @param {object} source - Objeto fonte
 * @returns {object} Objeto mesclado
 */
export const deepMerge = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
};

/**
 * Get nested object property
 * @param {object} obj - Objeto
 * @param {string} path - Caminho da propriedade
 * @param {any} defaultValue - Valor padrão
 * @returns {any} Valor da propriedade
 */
export const getNestedProperty = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || !result.hasOwnProperty(key)) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result;
};

/**
 * Set nested object property
 * @param {object} obj - Objeto
 * @param {string} path - Caminho da propriedade
 * @param {any} value - Valor para definir
 * @returns {object} Objeto modificado
 */
export const setNestedProperty = (obj, path, value) => {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
};

/**
 * Remove empty values from object
 * @param {object} obj - Objeto
 * @returns {object} Objeto sem valores vazios
 */
export const removeEmptyValues = (obj) => {
  const result = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleaned = removeEmptyValues(value);
          if (Object.keys(cleaned).length > 0) {
            result[key] = cleaned;
          }
        } else {
          result[key] = value;
        }
      }
    }
  }
  
  return result;
};

/**
 * Generate unique ID
 * @param {number} length - Tamanho do ID
 * @returns {string} ID único
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Generate UUID v4
 * @returns {string} UUID v4
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Capitalize first letter
 * @param {string} str - String
 * @returns {string} String capitalizada
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize all words
 * @param {string} str - String
 * @returns {string} String com todas as palavras capitalizadas
 */
export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Convert to slug
 * @param {string} str - String
 * @returns {string} Slug
 */
export const toSlug = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Truncate text
 * @param {string} str - String
 * @param {number} length - Tamanho máximo
 * @param {string} suffix - Sufixo
 * @returns {string} Texto truncado
 */
export const truncate = (str, length = 100, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  
  return str.substring(0, length).trim() + suffix;
};

/**
 * Check if value is empty
 * @param {any} value - Valor
 * @returns {boolean} Valor vazio
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if value is not empty
 * @param {any} value - Valor
 * @returns {boolean} Valor não vazio
 */
export const isNotEmpty = (value) => {
  return !isEmpty(value);
};

/**
 * Sleep function
 * @param {number} ms - Milissegundos
 * @returns {Promise} Promise que resolve após o tempo
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function
 * @param {Function} fn - Função para executar
 * @param {number} retries - Número de tentativas
 * @param {number} delay - Delay entre tentativas
 * @returns {Promise} Promise com resultado
 */
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay);
    }
    throw error;
  }
};

/**
 * Group array by key
 * @param {Array} array - Array
 * @param {string|Function} key - Chave ou função
 * @returns {object} Objeto agrupado
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array
 * @param {string} key - Chave
 * @param {string} direction - Direção (asc/desc)
 * @returns {Array} Array ordenado
 */
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = getNestedProperty(a, key);
    const bVal = getNestedProperty(b, key);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array
 * @param {string} key - Chave para comparação
 * @returns {Array} Array sem duplicatas
 */
export const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = getNestedProperty(item, key);
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array
 * @param {number} size - Tamanho do chunk
 * @returns {Array} Array de chunks
 */
export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Flatten nested array
 * @param {Array} array - Array
 * @param {number} depth - Profundidade
 * @returns {Array} Array achatado
 */
export const flatten = (array, depth = Infinity) => {
  return array.flat(depth);
};

/**
 * Get random item from array
 * @param {Array} array - Array
 * @returns {any} Item aleatório
 */
export const getRandomItem = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array
 * @param {Array} array - Array
 * @returns {Array} Array embaralhado
 */
export const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
