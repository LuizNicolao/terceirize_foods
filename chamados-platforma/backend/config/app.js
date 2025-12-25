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
const PORT = process.env.PORT || 3007;

// Configuração de trust proxy para rate-limit funcionar corretamente
app.set('trust proxy', 1);

// Configuração de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Configuração de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://foods.terceirizemais.com.br',
        'http://foods.terceirizemais.com.br',
        'http://82.29.57.43:3000', 
        'http://82.29.57.43', 
        'http://localhost:3000',
        'http://82.29.57.43:3007',
        'http://localhost:3007'
      ] 
    : [
        'http://localhost:3002',
        'http://localhost:3007',
        'http://localhost:3007',
        'http://localhost:3000'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
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

// Servir arquivos estáticos (uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Middleware de log global para debug
app.use((req, res, next) => {
  next();
});

module.exports = {
  app,
  PORT,
  generalLimiter,
  authLimiter
};

