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
    keyGenerator: (req) => {
      let key = req.ip;
      if (req.user && req.user.id) {
        key += `:${req.user.id}`;
      }
      return key;
    },
    handler: (req, res) => {
      console.warn(`Rate limit excedido para IP: ${req.ip}, User: ${req.user?.id || 'anonymous'}`);
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

// Middleware para aplicar rate limiting baseado na rota
const routeBasedRateLimit = (req, res, next) => {
  const path = req.path;
  
  if (path.includes('/auth/') || path.includes('/login')) {
    return next();
  }
  
  if (path.startsWith('/api/')) {
    return apiLimiter(req, res, next);
  }
  
  return generalLimiter(req, res, next);
};

// Middleware para rate limiting por usuário autenticado
const userBasedRateLimit = (req, res, next) => {
  if (!req.user) {
    return next();
  }
  
  const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
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

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  routeBasedRateLimit,
  userBasedRateLimit,
  createRateLimiter,
  RATE_LIMIT_CONFIG
};

