const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug: verificar se as variáveis estão carregadas
console.log('🔧 Variáveis de ambiente carregadas:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Definida' : '❌ Não definida');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const cotacoesRoutes = require('./routes/cotacoes');
const savingRoutes = require('./routes/saving');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - deve vir antes do helmet
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://82.29.57.43:3000', 'http://82.29.57.43:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para garantir resposta a preflight OPTIONS em todas as rotas
app.options('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://82.29.57.43:3000', 'http://82.29.57.43:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - aumentando o limite
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // aumentando para 1000 requests por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cotacoes', cotacoesRoutes);
app.use('/api/saving', savingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Log das rotas carregadas
console.log('🚀 Rotas de saving carregadas - Endpoints disponíveis:');
console.log('  - GET /api/saving/');
console.log('  - GET /api/saving/:id');
console.log('  - GET /api/saving/compradores/listar');

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Sistema de Cotação API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
}); 