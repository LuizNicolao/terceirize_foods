const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de trust proxy para rate-limit funcionar corretamente
app.set('trust proxy', 1);

// Configuração de segurança com opções avançadas
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Configuração de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://foods.terceirizemais.com.br',
        'http://foods.terceirizemais.com.br',
        'https://cotacao.terceirizemais.com.br',
        'http://cotacao.terceirizemais.com.br',
        'https://implantacao.terceirizemais.com.br',
        'http://implantacao.terceirizemais.com.br',
        'https://cozinha-industrial.terceirizemais.com.br',
        'http://cozinha-industrial.terceirizemais.com.br',
        'http://82.29.57.43:3000', 
        'http://82.29.57.43', 
        'http://localhost:3000',
        'http://82.29.57.43:3001',
        'http://82.29.57.43:3002',
        'http://82.29.57.43:3004',
        'http://82.29.57.43:3005',
        'http://82.29.57.43:3006',
        'http://82.29.57.43:3007',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3004',
        'http://localhost:3005',
        'http://localhost:3006',
        'http://localhost:3007'
      ] 
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3004',
        'http://localhost:3005',
        'http://localhost:3006',
        'http://localhost:3007'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting otimizado para muitos acessos simultâneos
// Limite mais restritivo para prevenir abusos e garantir estabilidade
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // Reduzido para 1000 requisições por IP (era 2000)
  message: {
    error: 'Muitas requisições deste IP, tente novamente em alguns minutos.',
    retryAfter: 900 // 15 minutos em segundos
  },
  standardHeaders: true, // Retorna info sobre rate limit nos headers
  legacyHeaders: false,
  // Handler personalizado para incluir informações úteis
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições deste IP, tente novamente em alguns minutos.',
      retryAfter: 900
    });
  },
  skip: (req) => {
    return req.path === '/api/health' || 
           req.path === '/foods/api/health' ||
           req.path === '/api/auth/verify' ||
           req.path === '/foods/api/auth/verify' ||
           req.path.startsWith('/api/dashboard') ||
           req.path.startsWith('/foods/api/dashboard');
  }
});

// Rate limiting específico para login - mais restritivo
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // Reduzido para 15 tentativas de login por IP (era 20)
  message: {
    error: 'Muitas tentativas de login, tente novamente em 15 minutos.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar logins bem-sucedidos
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas de login, tente novamente em 15 minutos.',
      retryAfter: 900
    });
  },
  skip: (req) => {
    return req.path !== '/api/auth/login' && req.path !== '/foods/api/auth/login';
  }
});

// Middleware para parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Middleware para forçar HTTPS em produção
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Se estiver atrás de um proxy (como nginx), verificar header X-Forwarded-Proto
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

module.exports = {
  app,
  PORT,
  limiter,
  loginLimiter
};
