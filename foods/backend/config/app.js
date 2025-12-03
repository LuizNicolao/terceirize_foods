const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de trust proxy para rate-limit funcionar corretamente
app.set('trust proxy', 1);

// Configuração de segurança
app.use(helmet());

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

// Rate limiting mais flexível para sistema em produção
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 2000, // limite de 2000 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/api/health' || 
           req.path === '/foods/api/health' ||
           req.path === '/api/auth/verify' ||
           req.path === '/foods/api/auth/verify' ||
           req.path.startsWith('/api/dashboard') ||
           req.path.startsWith('/foods/api/dashboard');
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
    return req.path !== '/api/auth/login' && req.path !== '/foods/api/auth/login';
  }
});

// Middleware para parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

module.exports = {
  app,
  PORT,
  limiter,
  loginLimiter
};
