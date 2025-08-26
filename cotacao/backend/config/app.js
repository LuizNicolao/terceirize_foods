const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração de trust proxy para rate-limit funcionar corretamente
app.set('trust proxy', 1);

// Configuração de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuração de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://cotacao.terceirizemais.com.br',
        'http://cotacao.terceirizemais.com.br',
        'http://82.29.57.43:3000', 
        'http://82.29.57.43:3002',
        'http://localhost:3000',
        'http://localhost:3002'
      ] 
    : [
        'http://localhost:3000',
        'http://localhost:3002'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // limite de 1000 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/api/health' ||
           req.path === '/api/auth/verify' ||
           req.path.startsWith('/api/dashboard');
  }
});

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // limite de 20 tentativas de login por IP
  message: 'Muitas tentativas de login, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path !== '/api/auth/login';
  }
});

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

module.exports = {
  app,
  PORT,
  limiter,
  loginLimiter
};

