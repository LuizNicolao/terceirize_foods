/**
 * Utilitário para geração automática de códigos no Backend
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
const gerarCodigo = (tipo, ultimoCodigo = 0) => {
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
 * Gera um código de grupo
 * @param {number} ultimoCodigo - Último código de grupo
 * @returns {string} Código de grupo único
 */
const gerarCodigoGrupo = (ultimoCodigo = 0) => {
  return gerarCodigo('GRUPO', ultimoCodigo);
};

/**
 * Gera um código de subgrupo
 * @param {number} ultimoCodigo - Último código de subgrupo
 * @returns {string} Código de subgrupo único
 */
const gerarCodigoSubgrupo = (ultimoCodigo = 0) => {
  return gerarCodigo('SUBGRUPO', ultimoCodigo);
};

/**
 * Gera um código de classe
 * @param {number} ultimoCodigo - Último código de classe
 * @returns {string} Código de classe único
 */
const gerarCodigoClasse = (ultimoCodigo = 0) => {
  return gerarCodigo('CLASSE', ultimoCodigo);
};

/**
 * Gera um código de produto
 * @param {number} ultimoCodigo - Último código de produto
 * @returns {string} Código de produto único
 */
const gerarCodigoProduto = (ultimoCodigo = 0) => {
  return gerarCodigo('PRODUTO', ultimoCodigo);
};

/**
 * Gera um código de produto origem
 * @param {number} ultimoCodigo - Último código de produto origem
 * @returns {string} Código de produto origem único
 */
const gerarCodigoProdutoOrigem = (ultimoCodigo = 0) => {
  return gerarCodigo('PRODUTO_ORIGEM', ultimoCodigo);
};

/**
 * Gera um código de produto genérico
 * @param {number} ultimoCodigo - Último código de produto genérico
 * @returns {string} Código de produto genérico único
 */
const gerarCodigoProdutoGenerico = (ultimoCodigo = 0) => {
  return gerarCodigo('PRODUTO_GENERICO', ultimoCodigo);
};

module.exports = {
  gerarCodigo,
  gerarCodigoGrupo,
  gerarCodigoSubgrupo,
  gerarCodigoClasse,
  gerarCodigoProduto,
  gerarCodigoProdutoOrigem,
  gerarCodigoProdutoGenerico
};
