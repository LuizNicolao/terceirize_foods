const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeApp } = require('./config/init');
const { errorHandler } = require('./middleware/responseHandler');
// Carregar variáveis de ambiente baseado no NODE_ENV
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: './env.production' });
} else {
  require('dotenv').config({ path: './env.development' });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 10000 : 1000, // Mais permissivo em desenvolvimento
  message: 'Muitas tentativas de acesso. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para requisições OPTIONS (preflight)
    return req.method === 'OPTIONS';
  }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'http://82.29.57.43:3082',
          'http://82.29.57.43:3000',
          'https://82.29.57.43:3082',
          'https://82.29.57.43:3000'
        ] 
      : [
          'http://localhost:3000', 
          'http://localhost:3082',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3082'
        ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Middleware para lidar com requisições OPTIONS (preflight)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Middleware de debug para CORS
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware personalizados - errorHandler será aplicado no final

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Sistema de Necessidades - Backend funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/necessidades', require('./routes/necessidades'));
app.use('/api/produtos', require('./routes/produtos'));
app.use('/api/escolas', require('./routes/escolas'));
app.use('/api/tipos-entrega', require('./routes/tipos-entrega'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/permissoes', require('./routes/permissoes'));
app.use('/api/medias-escolas', require('./routes/medias-escolas'));
app.use('/api/registros-diarios', require('./routes/registros-diarios'));
app.use('/api/produtos-per-capita', require('./routes/produtos-per-capita'));
app.use('/api/recebimentos-escolas', require('./routes/recebimentos-escolas'));
app.use('/api/recebimentos-escolas/relatorios', require('./routes/recebimentos-escolas/relatoriosRoute'));
app.use('/api/solicitacoes-manutencao', require('./routes/solicitacoes-manutencao'));

// Middleware de tratamento de erros
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: 'A rota solicitada não existe'
  });
});

// Iniciar servidor
const startServer = async () => {
  const initialized = await initializeApp();
  
  if (initialized) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } else {
    console.log('❌ Falha ao inicializar servidor');
    process.exit(1);
  }
};

startServer();

module.exports = app;
