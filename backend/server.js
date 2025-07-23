const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const fornecedoresRoutes = require('./routes/fornecedores');
const clientesRoutes = require('./routes/clientes');
const filiaisRoutes = require('./routes/filiais');
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
    ? [
        'http://82.29.57.43:3000', 
        'http://82.29.57.43', 
        'http://localhost:3000',
        'http://82.29.57.43:3001', // Sistema de cotação
        'http://82.29.57.43:3002', // Sistema de cotação (porta 3002)
        'http://localhost:3001',   // Sistema de cotação local
        'http://localhost:3002'    // Sistema de cotação local (porta 3002)
      ] 
    : [
        'http://localhost:3000',
        'http://localhost:3001',   // Sistema de cotação local
        'http://localhost:3002'    // Sistema de cotação local (porta 3002)
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'X-CSRF-Token']
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

// Middleware CSRF (exceto para rotas públicas)
app.use(
  csurf({
    cookie: true,
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    ignorePaths: ['/api/auth/validate-cotacao-token'] // Pular CSRF para validação de token
  })
);

// Rota para fornecer o token CSRF ao frontend
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Rota para validar token do sistema de cotação (antes das rotas protegidas)
app.post('/api/auth/validate-cotacao-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }

    console.log('🔍 Validando token do sistema de cotação:', token.substring(0, 20) + '...');

    // Verificar se o token é válido
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET não definido nas variáveis de ambiente!');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decodificado:', { userId: decoded.userId });
    
    // Buscar usuário
    const { executeQuery } = require('./config/database');
    const users = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log('❌ Usuário não encontrado:', decoded.userId);
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = users[0];
    console.log('✅ Usuário encontrado:', { id: user.id, nome: user.nome, status: user.status });

    if (user.status !== 'ativo') {
      console.log('❌ Usuário inativo:', user.status);
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    console.log('✅ Token validado com sucesso para usuário:', user.nome);
    res.json({ 
      valid: true, 
      user: user 
    });

  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Rota pública para busca de fornecedores (para sistema de cotação)
app.get('/api/fornecedores/public', async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || search.length < 2) {
      return res.json([]);
    }

    console.log('🔍 Busca pública de fornecedores:', search);
    
    const { executeQuery } = require('./config/database');
    
    // Primeiro, vamos verificar quantos fornecedores ativos existem
    const countQuery = 'SELECT COUNT(*) as total FROM fornecedores WHERE status = "ativo"';
    const countResult = await executeQuery(countQuery);
    console.log('📊 Total de fornecedores ativos:', countResult[0].total);
    
    // Buscar alguns fornecedores para debug
    const debugQuery = 'SELECT id, razao_social, nome_fantasia, status FROM fornecedores WHERE status = "ativo" LIMIT 5';
    const debugResult = await executeQuery(debugQuery);
    console.log('🔍 Primeiros 5 fornecedores ativos:', debugResult);
    
    const query = `
      SELECT 
        id, 
        razao_social, 
        nome_fantasia, 
        cnpj, 
        telefone, 
        email, 
        logradouro, 
        numero, 
        bairro, 
        municipio, 
        uf, 
        cep,
        status
      FROM fornecedores 
      WHERE status = 'ativo' 
        AND (
          razao_social LIKE ? OR 
          nome_fantasia LIKE ? OR 
          cnpj LIKE ?
        )
      ORDER BY razao_social 
      LIMIT 20
    `;
    
    const searchTerm = `%${search}%`;
    console.log('🔍 Termo de busca:', searchTerm);
    
    const fornecedores = await executeQuery(query, [searchTerm, searchTerm, searchTerm]);
    
    console.log('✅ Fornecedores encontrados:', fornecedores.length);
    if (fornecedores.length > 0) {
      console.log('🔍 Primeiro resultado:', fornecedores[0]);
    }
    
    res.json(fornecedores);
    
  } catch (error) {
    console.error('❌ Erro ao buscar fornecedores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de teste para verificar fornecedores (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/fornecedores/test', async (req, res) => {
    try {
      const { executeQuery } = require('./config/database');
      
      const query = 'SELECT id, razao_social, nome_fantasia, status FROM fornecedores LIMIT 10';
      const fornecedores = await executeQuery(query);
      
      res.json({
        total: fornecedores.length,
        fornecedores: fornecedores
      });
      
    } catch (error) {
      console.error('❌ Erro ao buscar fornecedores de teste:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
}

// Exceções para rotas públicas (login, verify, health, validate-cotacao-token, fornecedores-public)
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // Permitir login, verify, health, validate-cotacao-token e fornecedores-public sem CSRF
    if (
      req.path === '/api/auth/login' ||
      req.path === '/api/auth/verify' ||
      req.path === '/api/auth/validate-cotacao-token' ||
      req.path === '/api/fornecedores/public' ||
      req.path === '/api/health'
    ) {
      return next();
    }
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente.' });
  }
  next(err);
});

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
app.use('/api/filiais', filiaisRoutes);
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