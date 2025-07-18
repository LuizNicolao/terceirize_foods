const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const fornecedoresRoutes = require('./routes/fornecedores');
const clientesRoutes = require('./routes/clientes');
const produtosRoutes = require('./routes/produtos');
const gruposRoutes = require('./routes/grupos');
const subgruposRoutes = require('./routes/subgrupos');
const unidadesRoutes = require('./routes/unidades');
const marcasRoutes = require('./routes/marcas');
const classesRoutes = require('./routes/classes');
const nomeGenericoProdutoRoutes = require('./routes/nome_generico_produto');
const { router: permissoesRoutes } = require('./routes/permissoes');
const dashboardRoutes = require('./routes/dashboard');
const auditoriaRoutes = require('./routes/auditoria');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de segurança
app.use(helmet());

// Configuração de CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://82.29.57.43:3000', 'http://82.29.57.43', 'http://localhost:3000'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting mais flexível para sistema em produção
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 2000, // limite de 2000 requisições por IP (aumentado significativamente)
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true, // Retorna rate limit info nos headers
  legacyHeaders: false, // Não usa headers legacy
  skip: (req) => {
    // Pular rate limiting para health check e algumas rotas específicas
    return req.path === '/api/health' || 
           req.path === '/api/auth/verify' || // Verificação de token
           req.path.startsWith('/api/dashboard'); // Dashboard (muitas requisições)
  }
});

// Rate limiting específico para login (mais restritivo)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // limite de 20 tentativas de login por IP (aumentado de 10)
  message: 'Muitas tentativas de login, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular se não for tentativa de login
    return req.path !== '/api/auth/login';
  }
});

app.use('/api/', limiter);
app.use('/api/auth', loginLimiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/subgrupos', subgruposRoutes);
app.use('/api/unidades', unidadesRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/nome-generico-produto', nomeGenericoProdutoRoutes);
app.use('/api/permissoes', permissoesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota para resetar rate limiting (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/reset-rate-limit', (req, res) => {
    try {
      // Resetar rate limiting para o IP atual
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Limpar rate limiting do login
      if (loginLimiter.resetKey) {
        loginLimiter.resetKey(clientIP);
      }
      
      // Limpar rate limiting geral
      if (limiter.resetKey) {
        limiter.resetKey(clientIP);
      }
      
      res.json({ 
        message: 'Rate limiting resetado com sucesso',
        ip: clientIP,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao resetar rate limiting:', error);
      res.status(500).json({ error: 'Erro ao resetar rate limiting' });
    }
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
}); 