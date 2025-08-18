/**
 * Utilitário para geração automática de códigos
 * Gera códigos únicos para diferentes entidades do sistema
 * Sistema de faixas numéricas globais
 */

// Faixas numéricas por tipo de entidade
const FAIXAS = {
  PRODUTO_ORIGEM: { min: 1, max: 9999, prefixo: 'ORIG' },
  PRODUTO_GENERICO: { min: 10001, max: 19999, prefixo: 'GEN' },
  PRODUTO: { min: 20001, max: 29999, prefixo: 'PROD' },
  GRUPO: { min: 30001, max: 39999, prefixo: 'GRP' },
  SUBGRUPO: { min: 40001, max: 49999, prefixo: 'SGRP' },
  CLASSE: { min: 50001, max: 59999, prefixo: 'CLS' }
};

// Mapeamento reverso para identificar tipo pelo número
const MAPEAMENTO_TIPO = {
  PRODUTO_ORIGEM: { min: 1, max: 9999 },
  PRODUTO_GENERICO: { min: 10001, max: 19999 },
  PRODUTO: { min: 20001, max: 29999 },
  GRUPO: { min: 30001, max: 39999 },
  SUBGRUPO: { min: 40001, max: 49999 },
  CLASSE: { min: 50001, max: 59999 }
};

/**
 * Identifica o tipo de entidade baseado no número
 * @param {number} numero - Número para identificar o tipo
 * @returns {string|null} Tipo da entidade ou null se não encontrado
 */
export const identificarTipoPorNumero = (numero) => {
  for (const [tipo, faixa] of Object.entries(MAPEAMENTO_TIPO)) {
    if (numero >= faixa.min && numero <= faixa.max) {
      return tipo;
    }
  }
  return null;
};

/**
 * Gera um código único baseado no tipo de entidade e próximo número disponível
 * @param {string} tipo - Tipo da entidade (PRODUTO, PRODUTO_ORIGEM, PRODUTO_GENERICO)
 * @param {number} ultimoCodigo - Último código numérico da entidade (opcional)
 * @returns {string} Código único gerado
 */
export const gerarCodigo = (tipo, ultimoCodigo = 0) => {
  const faixa = FAIXAS[tipo];
  if (!faixa) {
    throw new Error(`Tipo de entidade não suportado: ${tipo}`);
  }

  // Encontra o próximo número disponível na faixa
  let proximoNumero = Math.max(ultimoCodigo + 1, faixa.min);
  
  // Verifica se não excedeu o limite da faixa
  if (proximoNumero > faixa.max) {
    throw new Error(`Faixa de códigos esgotada para ${tipo}. Limite: ${faixa.max}`);
  }
  
  // Formato: prefixo + número (ex: ORIG0001, GEN10001, PROD20001)
  const numeroFormatado = proximoNumero.toString().padStart(5, '0');
  return `${faixa.prefixo}${numeroFormatado}`;
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
 * @returns {number} Número base extraído
 */
export const extrairNumeroBase = (codigo) => {
  if (!codigo || typeof codigo !== 'string') return 0;
  
  // Remove o prefixo e converte para número
  const numeroBase = codigo.slice(4);
  return parseInt(numeroBase) || 0;
};

/**
 * Identifica o tipo de entidade baseado no código completo
 * @param {string} codigo - Código completo
 * @returns {string|null} Tipo da entidade ou null se não encontrado
 */
export const identificarTipoPorCodigo = (codigo) => {
  if (!codigo || typeof codigo !== 'string') return null;
  
  const numero = extrairNumeroBase(codigo);
  return identificarTipoPorNumero(numero);
};

/**
 * Valida se um código segue o padrão correto
 * @param {string} codigo - Código a ser validado
 * @param {string} tipo - Tipo da entidade (opcional, se não informado tenta identificar)
 * @returns {boolean} True se o código é válido
 */
export const validarCodigo = (codigo, tipo = null) => {
  if (!codigo || typeof codigo !== 'string') return false;
  
  // Se o tipo não foi informado, tenta identificar
  if (!tipo) {
    tipo = identificarTipoPorCodigo(codigo);
    if (!tipo) return false;
  }
  
  const faixa = FAIXAS[tipo];
  if (!faixa) return false;
  
  // Verifica se começa com o prefixo correto
  if (!codigo.startsWith(faixa.prefixo)) return false;
  
  // Verifica se tem o formato correto: prefixo + 5 dígitos (total: 9 caracteres)
  if (codigo.length !== 9) return false;
  
  // Verifica se os caracteres após o prefixo são números
  const parteNumerica = codigo.slice(4);
  if (!/^\d{5}$/.test(parteNumerica)) return false;
  
  // Verifica se o número está na faixa correta
  const numero = parseInt(parteNumerica);
  return numero >= faixa.min && numero <= faixa.max;
};

/**
 * Busca por código - aceita número ou código completo
 * @param {string|number} busca - Número ou código para buscar
 * @returns {object} Objeto com tipo identificado e número
 */
export const buscarPorCodigo = (busca) => {
  if (!busca) return null;
  
  let numero;
  let tipo;
  
  // Se é string, pode ser código completo ou apenas número
  if (typeof busca === 'string') {
    // Remove espaços e converte para maiúsculo
    busca = busca.trim().toUpperCase();
    
         // Se tem prefixo, é código completo
     if (busca.startsWith('ORIG') || busca.startsWith('GEN') || busca.startsWith('PROD') || 
         busca.startsWith('GRP') || busca.startsWith('SGRP') || busca.startsWith('CLS')) {
       numero = extrairNumeroBase(busca);
       tipo = identificarTipoPorCodigo(busca);
     } else {
      // É apenas número
      numero = parseInt(busca);
      tipo = identificarTipoPorNumero(numero);
    }
  } else {
    // É número
    numero = parseInt(busca);
    tipo = identificarTipoPorNumero(numero);
  }
  
  if (!tipo || !numero) return null;
  
  return {
    tipo,
    numero,
    codigoCompleto: `${FAIXAS[tipo].prefixo}${numero.toString().padStart(5, '0')}`
  };
};

/**
 * Obtém informações sobre as faixas disponíveis
 * @returns {object} Informações sobre as faixas
 */
export const obterInfoFaixas = () => {
  return {
    PRODUTO_ORIGEM: {
      faixa: '1-9999',
      prefixo: 'ORIG',
      exemplo: 'ORIG00001'
    },
    PRODUTO_GENERICO: {
      faixa: '10001-19999',
      prefixo: 'GEN',
      exemplo: 'GEN10001'
    },
    PRODUTO: {
      faixa: '20001-29999',
      prefixo: 'PROD',
      exemplo: 'PROD20001'
    },
    GRUPO: {
      faixa: '30001-39999',
      prefixo: 'GRP',
      exemplo: 'GRP30001'
    },
    SUBGRUPO: {
      faixa: '40001-49999',
      prefixo: 'SGRP',
      exemplo: 'SGRP40001'
    },
    CLASSE: {
      faixa: '50001-59999',
      prefixo: 'CLS',
      exemplo: 'CLS50001'
    }
  };
};
