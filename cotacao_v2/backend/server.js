const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

// Importar middlewares customizados
const { addHateoasLinks } = require('./middleware/hateoas');
const { paginateResults } = require('./middleware/pagination');
const responseHandler = require('./middleware/responseHandler');
const { apiLimiter, authLimiter, createLimiter } = require('./middleware/limiter');

// Importar rotas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios/index');
const cotacoesRoutes = require('./routes/cotacoes/index');
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

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/cotacoes', createLimiter);
app.use('/api/usuarios', createLimiter);

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares customizados
app.use(responseHandler);
app.use(addHateoasLinks);
app.use(paginateResults);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
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
  res.success({ 
    message: 'Sistema de Cotação API funcionando!',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.error('Erro interno do servidor', 500, process.env.NODE_ENV === 'development' ? err.message : null);
});

// Rota 404
app.use('*', (req, res) => {
  res.notFound('Rota não encontrada');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
}); 