/**
 * Utilitário para geração de códigos de vitrine
 * Sistema baseado em ID numérico global (auto_increment) + código de vitrine para UI
 */

// Prefixos para códigos de vitrine por tipo de entidade
const PREFIXOS_VITRINE = {
  PRODUTO_ORIGEM: 'ORIG',
  PRODUTO_GENERICO: 'GEN',
  PRODUTO: 'PROD',
  GRUPO: 'GRP',
  SUBGRUPO: 'SGRP',
  CLASSE: 'CLS'
};

/**
 * Gera um código de vitrine baseado no ID numérico
 * @param {string} tipo - Tipo da entidade
 * @param {number} id - ID numérico da entidade
 * @returns {string} Código de vitrine (ex: ORIG-0576)
 */
export const gerarCodigoVitrine = (tipo, id) => {
  const prefixo = PREFIXOS_VITRINE[tipo];
  if (!prefixo) {
    throw new Error(`Tipo de entidade não suportado: ${tipo}`);
  }

  if (!id || id <= 0) {
    throw new Error('ID deve ser um número positivo');
  }

  // Formato: prefixo-id (ex: ORIG-0576, GEN-1234)
  return `${prefixo}-${id.toString().padStart(4, '0')}`;
};

/**
 * Extrai o ID numérico de um código de vitrine
 * @param {string} codigoVitrine - Código de vitrine (ex: ORIG-0576)
 * @returns {number} ID numérico extraído
 */
export const extrairIdDoCodigoVitrine = (codigoVitrine) => {
  if (!codigoVitrine || typeof codigoVitrine !== 'string') return null;
  
  // Remove espaços e converte para maiúsculo
  codigoVitrine = codigoVitrine.trim().toUpperCase();
  
  // Verifica se tem o formato correto: prefixo-id
  const match = codigoVitrine.match(/^([A-Z]+)-(\d+)$/);
  if (!match) return null;
  
  const [, prefixo, idStr] = match;
  const id = parseInt(idStr);
  
  // Verifica se o prefixo é válido
  const prefixosValidos = Object.values(PREFIXOS_VITRINE);
  if (!prefixosValidos.includes(prefixo)) return null;
  
  return id;
};

/**
 * Identifica o tipo de entidade baseado no código de vitrine
 * @param {string} codigoVitrine - Código de vitrine
 * @returns {string|null} Tipo da entidade ou null se não encontrado
 */
export const identificarTipoPorCodigoVitrine = (codigoVitrine) => {
  if (!codigoVitrine || typeof codigoVitrine !== 'string') return null;
  
  // Remove espaços e converte para maiúsculo
  codigoVitrine = codigoVitrine.trim().toUpperCase();
  
  // Verifica se tem o formato correto: prefixo-id
  const match = codigoVitrine.match(/^([A-Z]+)-(\d+)$/);
  if (!match) return null;
  
  const [, prefixo] = match;
  
  // Encontra o tipo pelo prefixo
  for (const [tipo, prefixoTipo] of Object.entries(PREFIXOS_VITRINE)) {
    if (prefixoTipo === prefixo) {
      return tipo;
    }
  }
  
  return null;
};

/**
 * Valida se um código de vitrine segue o padrão correto
 * @param {string} codigoVitrine - Código de vitrine a ser validado
 * @returns {boolean} True se o código é válido
 */
export const validarCodigoVitrine = (codigoVitrine) => {
  if (!codigoVitrine || typeof codigoVitrine !== 'string') return false;
  
  const tipo = identificarTipoPorCodigoVitrine(codigoVitrine);
  if (!tipo) return false;
  
  const id = extrairIdDoCodigoVitrine(codigoVitrine);
  return id !== null && id > 0;
};

/**
 * Busca por código - aceita ID numérico ou código de vitrine
 * @param {string|number} busca - ID numérico ou código de vitrine para buscar
 * @returns {object} Objeto com tipo identificado e ID
 */
export const buscarPorCodigo = (busca) => {
  if (!busca) return null;
  
  let id;
  let tipo;
  
  // Se é string, pode ser código de vitrine ou apenas número
  if (typeof busca === 'string') {
    // Remove espaços
    busca = busca.trim();
    
    // Se tem hífen, é código de vitrine
    if (busca.includes('-')) {
      id = extrairIdDoCodigoVitrine(busca);
      tipo = identificarTipoPorCodigoVitrine(busca);
    } else {
      // É apenas número (ID)
      id = parseInt(busca);
      // Não conseguimos identificar o tipo apenas pelo ID numérico
      tipo = null;
    }
  } else {
    // É número (ID)
    id = parseInt(busca);
    // Não conseguimos identificar o tipo apenas pelo ID numérico
    tipo = null;
  }
  
  if (!id || id <= 0) return null;
  
  return {
    tipo,
    id,
    codigoVitrine: tipo ? gerarCodigoVitrine(tipo, id) : null
  };
};

/**
 * Funções específicas para cada tipo de entidade
 * Estas funções são mantidas para compatibilidade com o código existente
 * mas agora geram códigos de vitrine baseados no ID fornecido
 */

/**
 * Gera um código de vitrine para produto origem
 * @param {number} id - ID do produto origem
 * @returns {string} Código de vitrine
 */
export const gerarCodigoProdutoOrigem = (id) => {
  return gerarCodigoVitrine('PRODUTO_ORIGEM', id);
};

/**
 * Gera um código de vitrine para produto genérico
 * @param {number} id - ID do produto genérico
 * @returns {string} Código de vitrine
 */
export const gerarCodigoProdutoGenerico = (id) => {
  return gerarCodigoVitrine('PRODUTO_GENERICO', id);
};

/**
 * Gera um código de vitrine para produto
 * @param {number} id - ID do produto
 * @returns {string} Código de vitrine
 */
export const gerarCodigoProduto = (id) => {
  return gerarCodigoVitrine('PRODUTO', id);
};

/**
 * Gera um código de vitrine para grupo
 * @param {number} id - ID do grupo
 * @returns {string} Código de vitrine
 */
export const gerarCodigoGrupo = (id) => {
  return gerarCodigoVitrine('GRUPO', id);
};

/**
 * Gera um código de vitrine para subgrupo
 * @param {number} id - ID do subgrupo
 * @returns {string} Código de vitrine
 */
export const gerarCodigoSubgrupo = (id) => {
  return gerarCodigoVitrine('SUBGRUPO', id);
};

/**
 * Gera um código de vitrine para classe
 * @param {number} id - ID da classe
 * @returns {string} Código de vitrine
 */
export const gerarCodigoClasse = (id) => {
  return gerarCodigoVitrine('CLASSE', id);
};

/**
 * Obtém informações sobre os prefixos disponíveis
 * @returns {object} Informações sobre os prefixos
 */
export const obterInfoPrefixos = () => {
  return {
    PRODUTO_ORIGEM: {
      prefixo: 'ORIG',
      exemplo: 'ORIG-0001'
    },
    PRODUTO_GENERICO: {
      prefixo: 'GEN',
      exemplo: 'GEN-0001'
    },
    PRODUTO: {
      prefixo: 'PROD',
      exemplo: 'PROD-0001'
    },
    GRUPO: {
      prefixo: 'GRP',
      exemplo: 'GRP-0001'
    },
    SUBGRUPO: {
      prefixo: 'SGRP',
      exemplo: 'SGRP-0001'
    },
    CLASSE: {
      prefixo: 'CLS',
      exemplo: 'CLS-0001'
    }
  };
};

/**
 * Função de compatibilidade - mantém a interface antiga mas agora requer ID
 * @param {string} tipo - Tipo da entidade
 * @param {number} id - ID da entidade
 * @returns {string} Código de vitrine
 */
export const gerarCodigo = (tipo, id) => {
  return gerarCodigoVitrine(tipo, id);
};

/**
 * Gera um código de vitrine temporário para preview
 * Usa um ID estimado baseado no timestamp para mostrar um código mais realista
 * @param {string} tipo - Tipo da entidade
 * @returns {string} Código de vitrine temporário
 */
export const gerarCodigoTemporario = (tipo) => {
  // Usar timestamp para gerar um ID mais realista
  const timestamp = Date.now();
  const idEstimado = Math.floor(timestamp / 1000) % 10000; // ID entre 1-9999
  return gerarCodigoVitrine(tipo, idEstimado);
};
