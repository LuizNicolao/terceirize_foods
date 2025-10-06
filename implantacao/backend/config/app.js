const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { 
  generalLimiter, 
  authLimiter, 
  routeBasedRateLimit,
  userBasedRateLimit 
} = require('../middleware/rateLimiter');
const { errorHandler } = require('../middleware/responseHandler');

const app = express();
const PORT = process.env.PORT || 3005;

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
        'http://82.29.57.43:3000', 
        'http://82.29.57.43', 
        'http://localhost:3000',
        'http://82.29.57.43:3003',
        'http://localhost:3003'
      ] 
    : [
        'http://localhost:3004',
        'http://localhost:3005'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting baseado em rota
app.use(routeBasedRateLimit);

// Rate limiting adicional para usuários autenticados
app.use(userBasedRateLimit);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

module.exports = {
  app,
  PORT,
  generalLimiter,
  authLimiter
};
