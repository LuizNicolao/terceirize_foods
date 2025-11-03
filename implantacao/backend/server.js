require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? 'env.production' : 'env.development' });

// Importar configurações da aplicação
const { app, PORT } = require('./config/app');
const { testConnection } = require('./config/database');

// Importar middleware de prefixo de rotas
const { applyRoutePrefixes } = require('./middleware/routePrefix');

// Importar rotas
const authRoute = require('./routes/auth/authRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const usuariosRoute = require('./routes/usuarios');
const permissoesRoute = require('./routes/permissoes');
const produtosPerCapitaRoute = require('./routes/produtos-per-capita/produtosPerCapitaRoute');
const recebimentosEscolasRoute = require('./routes/recebimentos-escolas');
const registrosDiariosRoute = require('./routes/registros-diarios/registrosDiariosRoute');
const necessidadesRoute = require('./routes/necessidades');
const substituicoesRoute = require('./routes/necessidades-substituicoes/substituicoesRoute');
const consultaStatusRoute = require('./routes/consulta-status-necessidade/consultaStatusRoute');
const necessidadesPadroesRoute = require('./routes/necessidades-padroes/necessidadesPadroesRoute');
const auditoriaRoute = require('./routes/auditoria/auditoriaRoute');
const calendarioRoute = require('./routes/calendario/calendarioRoute');

// Definir rotas com seus middlewares
const routes = [
  { path: '/health', router: (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'implantacao-backend'
    });
  }},
  { path: '/auth', router: authRoute },
  { path: '/dashboard', router: dashboardRoute },
  { path: '/usuarios', router: usuariosRoute },
  { path: '/permissoes', router: permissoesRoute },
  { path: '/produtos-per-capita', router: produtosPerCapitaRoute },
  { path: '/recebimentos-escolas', router: recebimentosEscolasRoute },
  { path: '/registros-diarios', router: registrosDiariosRoute },
  { path: '/necessidades', router: necessidadesRoute },
  { path: '/necessidades-substituicoes', router: substituicoesRoute },
  { path: '/consulta-status-necessidade', router: consultaStatusRoute },
  { path: '/necessidades-padroes', router: necessidadesPadroesRoute },
  { path: '/auditoria', router: auditoriaRoute },
  { path: '/calendario', router: calendarioRoute }
];

// Aplicar rotas com prefixos automaticamente (desenvolvimento e produção)
applyRoutePrefixes(app, routes, ['/api', '/implantacao/api']);

// Rota padrão
app.get('/', (req, res) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/implantacao/api' : '/api';
  res.json({ 
    message: 'Sistema de Implantação API',
    version: '1.0.0',
    endpoints: {
      health: `${basePath}/health`,
      auth: `${basePath}/auth`,
      auditoria: `${basePath}/auditoria`,
      usuarios: `${basePath}/usuarios`,
      permissoes: `${basePath}/permissoes`,
      produtosPerCapita: `${basePath}/produtos-per-capita`,
      recebimentosEscolas: `${basePath}/recebimentos-escolas`,
      registrosDiarios: `${basePath}/registros-diarios`,
      necessidades: `${basePath}/necessidades`,
      substituicoes: `${basePath}/necessidades-substituicoes`,
      consultaStatus: `${basePath}/consulta-status-necessidade`,
      necessidadesPadroes: `${basePath}/necessidades-padroes`,
      calendario: `${basePath}/calendario`
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
      const basePath = process.env.NODE_ENV === 'production' ? '/implantacao/api' : '/api';
      console.log(`🚀 Servidor de Implantação rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}${basePath}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}${basePath}/auth`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
