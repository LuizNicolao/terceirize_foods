// Carregar variáveis de ambiente
require('dotenv').config();

// Importar configurações da aplicação
const { app, PORT, limiter, loginLimiter } = require('./config/app');

// Variáveis de ambiente carregadas

// Importar middleware de prefixo de rotas
const { applyRoutePrefixes } = require('./middleware/routePrefix');

// Importar middleware de tratamento de erros
const { errorHandler } = require('./middleware/responseHandler');

// Importar rotas
const routes = require('./routes');

// Aplicar rate limiting
app.use('/cotacao/api/', limiter);
app.use('/cotacao/api/auth', loginLimiter);

// Aplicar todas as rotas com prefixos automaticamente
applyRoutePrefixes(app, routes);

// Log das rotas carregadas (comentado para limpeza)
// console.log('🔗 Rotas carregadas:');
// routes.forEach(({ path, router }) => {
//   console.log(`  ${path} -> /api${path}`);
// });


// Rota de teste
app.get('/cotacao/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Sistema de Cotação API funcionando!',
    timestamp: new Date().toISOString(),
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
}); 