const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
require('dotenv').config();

// Importar configuração do banco
const { testConnection } = require('./config/database');

// Importar middlewares
const { errorHandler } = require('./middleware/responseHandler');

// Importar rotas organizadas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const cotacoesRoutes = require('./routes/cotacoes');
const savingRoutes = require('./routes/saving');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração de trust proxy para rate-limit funcionar corretamente
app.set('trust proxy', 1);

// Configuração de segurança
app.use(helmet());

// Configuração de CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://cotacao.terceirizemais.com.br',
        'http://cotacao.terceirizemais.com.br',
        'https://foods.terceirizemais.com.br',
        'http://foods.terceirizemais.com.br',
        'http://82.29.57.43:3000', 
        'http://82.29.57.43:3002',
        'http://82.29.57.43', 
        'http://localhost:3000',
        'http://localhost:3002'
      ] 
    : [
        'http://localhost:3000',
        'http://localhost:3002'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'X-CSRF-Token']
}));

// Rate limiting mais flexível para sistema em produção
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 2000, // limite de 2000 requisições por IP
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

app.use('/api/', limiter);
app.use('/api/auth', loginLimiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Configuração CSRF
app.use(csurf({ cookie: true }));

// Middleware para garantir resposta a preflight OPTIONS
app.options('*', cors());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cotacoes', cotacoesRoutes);
app.use('/api/saving', savingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Sistema de Cotação API funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de tratamento de erros global
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Rota não encontrada',
    timestamp: new Date().toISOString()
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer(); 