const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Configuração de segurança
app.use(helmet());

// Compressão
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: {
    error: {
      message: 'Muitas requisições deste IP, tente novamente em 15 minutos',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});
app.use('/cotacao/api/', limiter);

// Logging
app.use(morgan('combined'));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://foods.terceirizemais.com.br'] 
    : ['http://localhost:3000', 'http://localhost:3081'],
  credentials: true
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prefixo da API
app.use('/cotacao/api', (req, res, next) => {
  req.apiPrefix = '/cotacao/api';
  next();
});

// Rotas da API
app.use('/cotacao/api/auth', require('./routes/auth'));
app.use('/cotacao/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/cotacao/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(500).json({
    error: {
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    }
  });
});

// Middleware para rotas não encontradas
app.use('/cotacao/api/*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint não encontrado',
      code: 'ENDPOINT_NOT_FOUND'
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local: http://localhost:${PORT}/cotacao/api`);
  console.log(`🌐 Produção: https://foods.terceirizemais.com.br/cotacao/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/cotacao/api/health`);
});

module.exports = app;
