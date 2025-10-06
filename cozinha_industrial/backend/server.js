require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? 'env.production' : 'env.development' });

// Importar configurações da aplicação
const { app, PORT } = require('./config/app');
const { testConnection } = require('./config/database');

// Importar middleware de prefixo de rotas
const { applyRoutePrefixes } = require('./middleware/routePrefix');

// Importar rotas
const authRoute = require('./routes/auth/authRoute');
const usuariosRoute = require('./routes/usuarios');
const permissoesRoute = require('./routes/permissoes');
const produtosPerCapitaRoute = require('./routes/produtos-per-capita/produtosPerCapitaRoute');
const recebimentosEscolasRoute = require('./routes/recebimentos-escolas');
const auditoriaRoute = require('./routes/auditoria/auditoriaRoute');

// Definir rotas com seus middlewares
const routes = [
  { path: '/health', router: (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'cozinha-industrial-backend'
    });
  }},
  { path: '/auth', router: authRoute },
  { path: '/usuarios', router: usuariosRoute },
  { path: '/permissoes', router: permissoesRoute },
  { path: '/produtos-per-capita', router: produtosPerCapitaRoute },
  { path: '/recebimentos-escolas', router: recebimentosEscolasRoute },
  { path: '/auditoria', router: auditoriaRoute }
];

// Aplicar rotas com prefixos para desenvolvimento e produção
if (process.env.NODE_ENV === 'production') {
  // Em produção, usar prefixo /cozinha_industrial/api
  applyRoutePrefixes(app, routes, ['/cozinha_industrial/api']);
} else {
  // Em desenvolvimento, usar apenas /api
  applyRoutePrefixes(app, routes, ['/api']);
}

// Rota padrão
app.get('/', (req, res) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/cozinha_industrial/api' : '/api';
  res.json({ 
    message: 'Sistema de Cozinha Industrial API',
    version: '1.0.0',
    endpoints: {
      health: `${basePath}/health`,
      auth: `${basePath}/auth`,
      auditoria: `${basePath}/auditoria`,
      usuarios: `${basePath}/usuarios`,
      permissoes: `${basePath}/permissoes`,
      produtosPerCapita: `${basePath}/produtos-per-capita`,
      recebimentosEscolas: `${basePath}/recebimentos-escolas`
    }
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada' 
  });
});

// Middleware de tratamento de erros padronizado
const { errorHandler } = require('./middleware/responseHandler');
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    await testConnection();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      const basePath = process.env.NODE_ENV === 'production' ? '/cozinha_industrial/api' : '/api';
      console.log(`🚀 Servidor de Cozinha Industrial rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}${basePath}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}${basePath}/auth`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
