/**
 * Middleware de Rate Limiting
 * Implementa limitação de requisições para diferentes tipos de endpoints
 */

const rateLimit = require('express-rate-limit');

// Configurações de rate limiting
const RATE_LIMIT_CONFIG = {
  // Limite geral para todas as rotas
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requisições por IP por janela
    message: {
      success: false,
      error: 'Muitas requisições. Tente novamente em 15 minutos.',
      message: 'Rate limit excedido'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Limite para autenticação (mais restritivo)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas de login por IP por janela
    message: {
      success: false,
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      message: 'Rate limit de autenticação excedido'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
    skipFailedRequests: false
  },

  // Limite para APIs públicas (moderado)
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // máximo 500 requisições por IP por janela
    message: {
      success: false,
      error: 'Limite de API excedido. Tente novamente em 15 minutos.',
      message: 'Rate limit de API excedido'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Limite para uploads (muito restritivo)
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // máximo 10 uploads por IP por hora
    message: {
      success: false,
      error: 'Limite de uploads excedido. Tente novamente em 1 hora.',
      message: 'Rate limit de upload excedido'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Limite para relatórios (mais permissivo para desenvolvimento)
  reports: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 relatórios por IP por 5 minutos
    message: {
      success: false,
      error: 'Limite de relatórios excedido. Tente novamente em 5 minutos.',
      message: 'Rate limit de relatórios excedido'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};

// Função para criar rate limiter personalizado
const createRateLimiter = (config) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    // Função para personalizar a chave do rate limit
    keyGenerator: (req) => {
      // Usar IP do usuário como chave base
      let key = req.ip;
      
      // Se o usuário estiver autenticado, incluir o ID do usuário
      if (req.user && req.user.id) {
        key += `:${req.user.id}`;
      }
      
      return key;
    },
    // Função para personalizar quando pular o rate limit
    skip: (req) => {
      // Pular rate limit para usuários admin em desenvolvimento
      if (process.env.NODE_ENV === 'development' && req.user && req.user.tipo_de_acesso === 'admin') {
        return true;
      }
      return false;
    },
    // Handler personalizado para quando o limite é excedido
    handler: (req, res) => {
      console.warn(`Rate limit excedido para IP: ${req.ip}, User: ${req.user?.id || 'anonymous'}`);
      
      // Adicionar headers informativos
      res.set({
        'Retry-After': Math.round(config.windowMs / 1000),
        'X-RateLimit-Limit': config.max,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(Date.now() + config.windowMs).toISOString()
      });
      
      return res.status(429).json(config.message);
    }
  });
};

// Rate limiters pré-configurados
const generalLimiter = createRateLimiter(RATE_LIMIT_CONFIG.general);
const authLimiter = createRateLimiter(RATE_LIMIT_CONFIG.auth);
const apiLimiter = createRateLimiter(RATE_LIMIT_CONFIG.api);
const uploadLimiter = createRateLimiter(RATE_LIMIT_CONFIG.upload);
const reportsLimiter = createRateLimiter(RATE_LIMIT_CONFIG.reports);

// Middleware para aplicar rate limiting baseado na rota
const routeBasedRateLimit = (req, res, next) => {
  const path = req.path;
  
  // Desativar temporariamente o rate limit específico de autenticação
  if (path.includes('/auth/') || path.includes('/login')) {
    return next();
  }
  
  // Aplicar rate limiting específico baseado na rota
  if (path.includes('/upload') || path.includes('/anexos')) {
    return uploadLimiter(req, res, next);
  }
  
  if (path.includes('/relatorios') || path.includes('/export')) {
    return reportsLimiter(req, res, next);
  }
  
  if (path.startsWith('/api/')) {
    return apiLimiter(req, res, next);
  }
  
  // Rate limiting geral para outras rotas
  return generalLimiter(req, res, next);
};

// Middleware para rate limiting por usuário autenticado
const userBasedRateLimit = (req, res, next) => {
  if (!req.user) {
    return next();
  }
  
  // Rate limiting mais permissivo para usuários autenticados
  const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 2000, // 2000 requisições para usuários autenticados
    message: {
      success: false,
      error: 'Limite de requisições excedido para usuário autenticado.',
      message: 'Rate limit de usuário excedido'
    },
    keyGenerator: (req) => `user:${req.user.id}`,
    standardHeaders: true,
    legacyHeaders: false
  });
  
  return userLimiter(req, res, next);
};

// Função para criar rate limiter customizado para entidades específicas
const createEntityRateLimiter = (entityName, maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      error: `Limite de requisições excedido para ${entityName}. Tente novamente em ${Math.round(windowMs / 60000)} minutos.`,
      message: `Rate limit de ${entityName} excedido`
    },
    keyGenerator: (req) => `${entityName}:${req.ip}:${req.user?.id || 'anonymous'}`,
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Rate limiters específicos por entidade
const usuariosLimiter = createEntityRateLimiter('usuarios', 200, 15 * 60 * 1000);
const recebimentosLimiter = createEntityRateLimiter('recebimentos', 500, 15 * 60 * 1000);
const permissoesLimiter = createEntityRateLimiter('permissoes', 100, 15 * 60 * 1000);
const produtosLimiter = createEntityRateLimiter('produtos', 500, 15 * 60 * 1000);

module.exports = {
  // Rate limiters pré-configurados
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  reportsLimiter,
  
  // Middleware baseado em rota
  routeBasedRateLimit,
  userBasedRateLimit,
  
  // Função para criar rate limiters customizados
  createRateLimiter,
  createEntityRateLimiter,
  
  // Rate limiters específicos por entidade
  usuariosLimiter,
  recebimentosLimiter,
  permissoesLimiter,
  produtosLimiter,
  
  // Configurações
  RATE_LIMIT_CONFIG
};
