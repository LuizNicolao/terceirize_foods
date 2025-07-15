const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const fornecedoresRoutes = require('./routes/fornecedores');
const produtosRoutes = require('./routes/produtos');
const gruposRoutes = require('./routes/grupos');
const subgruposRoutes = require('./routes/subgrupos');
const unidadesRoutes = require('./routes/unidades');
const permissoesRoutes = require('./routes/permissoes');

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);

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
app.use('/api/produtos', produtosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/subgrupos', subgruposRoutes);
app.use('/api/unidades', unidadesRoutes);
app.use('/api/permissoes', permissoesRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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