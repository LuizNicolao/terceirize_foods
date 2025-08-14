/**
 * Utilitário para geração automática de códigos
 * Gera códigos únicos para diferentes entidades do sistema
 */

// Prefixos para cada tipo de entidade
const PREFIXOS = {
  PRODUTO: 'PROD',
  PRODUTO_ORIGEM: 'ORIG',
  PRODUTO_GENERICO: 'GEN',
  GRUPO: 'GRP',
  SUBGRUPO: 'SGRP',
  CLASSE: 'CLS'
};

/**
 * Gera um código único baseado no tipo de entidade e timestamp
 * @param {string} tipo - Tipo da entidade (PRODUTO, PRODUTO_ORIGEM, etc.)
 * @param {number} ultimoCodigo - Último código numérico da entidade (opcional)
 * @returns {string} Código único gerado
 */
export const gerarCodigo = (tipo, ultimoCodigo = 0) => {
  const prefixo = PREFIXOS[tipo];
  if (!prefixo) {
    throw new Error(`Tipo de entidade não suportado: ${tipo}`);
  }

  // Se não há último código, começa do 1
  const proximoNumero = ultimoCodigo + 1;
  
  // Para produtos, usar formato mais curto (máximo 10 caracteres)
  if (tipo === 'PRODUTO') {
    // Formato: PROD + número (ex: PROD0001)
    const numeroFormatado = proximoNumero.toString().padStart(4, '0');
    return `${prefixo}${numeroFormatado}`;
  }
  
  // Para outras entidades, manter formato original
  const numeroFormatado = proximoNumero.toString().padStart(4, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  return `${prefixo}${numeroFormatado}${timestamp}`;
};

/**
 * Gera um código de produto específico
 * @param {number} ultimoCodigo - Último código de produto
 * @returns {string} Código de produto único
 */
export const gerarCodigoProduto = (ultimoCodigo = 0) => {
  return gerarCodigo('PRODUTO', ultimoCodigo);
};

/**
 * Gera um código de produto origem
 * @param {number} ultimoCodigo - Último código de produto origem
 * @returns {string} Código de produto origem único
 */
export const gerarCodigoProdutoOrigem = (ultimoCodigo = 0) => {
  return gerarCodigo('PRODUTO_ORIGEM', ultimoCodigo);
};

/**
 * Gera um código de produto genérico
 * @param {number} ultimoCodigo - Último código de produto genérico
 * @returns {string} Código de produto genérico único
 */
export const gerarCodigoProdutoGenerico = (ultimoCodigo = 0) => {
  return gerarCodigo('PRODUTO_GENERICO', ultimoCodigo);
};

/**
 * Gera um código de grupo
 * @param {number} ultimoCodigo - Último código de grupo
 * @returns {string} Código de grupo único
 */
export const gerarCodigoGrupo = (ultimoCodigo = 0) => {
  return gerarCodigo('GRUPO', ultimoCodigo);
};

/**
 * Gera um código de subgrupo
 * @param {number} ultimoCodigo - Último código de subgrupo
 * @returns {string} Código de subgrupo único
 */
export const gerarCodigoSubgrupo = (ultimoCodigo = 0) => {
  return gerarCodigo('SUBGRUPO', ultimoCodigo);
};

/**
 * Gera um código de classe
 * @param {number} ultimoCodigo - Último código de classe
 * @returns {string} Código de classe único
 */
export const gerarCodigoClasse = (ultimoCodigo = 0) => {
  return gerarCodigo('CLASSE', ultimoCodigo);
};



/**
 * Extrai o número base de um código gerado
 * @param {string} codigo - Código gerado
 * @param {string} tipo - Tipo da entidade (opcional)
 * @returns {number} Número base extraído
 */
export const extrairNumeroBase = (codigo, tipo = null) => {
  if (!codigo || typeof codigo !== 'string') return 0;
  
  // Para produtos, formato é PROD + 4 dígitos
  if (tipo === 'PRODUTO') {
    const numeroBase = codigo.slice(4);
    return parseInt(numeroBase) || 0;
  }
  
  // Para outras entidades, formato é prefixo + 4 dígitos + 6 dígitos timestamp
  const numeroBase = codigo.slice(4, -6);
  return parseInt(numeroBase) || 0;
};

/**
 * Valida se um código segue o padrão correto
 * @param {string} codigo - Código a ser validado
 * @param {string} tipo - Tipo da entidade
 * @returns {boolean} True se o código é válido
 */
export const validarCodigo = (codigo, tipo) => {
  if (!codigo || typeof codigo !== 'string') return false;
  
  const prefixo = PREFIXOS[tipo];
  if (!prefixo) return false;
  
  // Verifica se começa com o prefixo correto
  if (!codigo.startsWith(prefixo)) return false;
  
  // Para produtos, formato é PROD + 4 dígitos (total: 8 caracteres)
  if (tipo === 'PRODUTO') {
    if (codigo.length !== 8) return false;
    const parteNumerica = codigo.slice(4);
    return /^\d{4}$/.test(parteNumerica);
  }
  
  // Para outras entidades, formato é prefixo + 4 dígitos + 6 dígitos timestamp (total: 14 caracteres)
  if (codigo.length !== 14) return false;
  
  // Verifica se os caracteres após o prefixo são números
  const parteNumerica = codigo.slice(4);
  return /^\d{10}$/.test(parteNumerica);
};
