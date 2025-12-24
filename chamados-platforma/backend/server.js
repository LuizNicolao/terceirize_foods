require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? 'env.production' : 'env.development' });

// Importar configurações da aplicação
const { app, PORT } = require('./config/app');
const { testConnection } = require('./config/database');

// Importar middleware de prefixo de rotas
const { applyRoutePrefixes } = require('./middleware/routePrefix');

// Importar rotas
const authRoute = require('./routes/auth/authRoute');
const permissoesRoute = require('./routes/permissoes/permissoesRoute');
const usuariosRoute = require('./routes/usuarios/usuarioRoute');
const chamadosRoute = require('./routes/chamados/chamadosRoute');
const notificacoesRoute = require('./routes/notificacoes/notificacoesRoute');
const dashboardRoute = require('./routes/dashboard/dashboardRoute');
const templatesRoute = require('./routes/templates/templatesRoute');

// Definir rotas com seus middlewares
const routes = [
  { path: '/health', router: (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'chamados-backend'
    });
  }},
  { path: '/auth', router: authRoute },
  { path: '/permissoes', router: permissoesRoute },
  { path: '/usuarios', router: usuariosRoute },
  { path: '/chamados', router: chamadosRoute },
  { path: '/notificacoes', router: notificacoesRoute },
  { path: '/dashboard', router: dashboardRoute },
  { path: '/templates', router: templatesRoute }
];

// Aplicar prefixos de rota
applyRoutePrefixes(app);

// Registrar rotas
routes.forEach(({ path, router }) => {
  app.use(`/chamados/api${path}`, router);
});

// Rota de health check sem prefixo
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'chamados-backend'
  });
});

// Middleware de tratamento de erros (deve ser o último)
const { errorHandler } = require('./middleware/responseHandler');
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    await testConnection();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/chamados/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
