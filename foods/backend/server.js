require('dotenv').config();

// Debug: verificar variáveis de ambiente
console.log('🔧 Variáveis de ambiente carregadas (Foods):');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Definida' : '❌ Não definida');
console.log('SSO_SECRET:', process.env.SSO_SECRET ? '✅ Definida' : '❌ Não definida');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);

// Importar configurações da aplicação
const { app, PORT, limiter, loginLimiter } = require('./config/app');
const { connectRedis } = require('./config/redis');

// Importar middleware de prefixo de rotas
const { applyRoutePrefixes } = require('./middleware/routePrefix');

// Importar rotas
const routes = require('./routes');
const sharedRoutes = require('./routes/shared');

// Aplicar rate limiting
app.use('/api/', limiter);
app.use('/foods/api/', limiter);
app.use('/api/auth', loginLimiter);
app.use('/foods/api/auth', loginLimiter);

// Armazenar limiters no app.locals para acesso nas rotas
app.locals.limiter = limiter;
app.locals.loginLimiter = loginLimiter;

// Middleware de logging
app.use((req, res, next) => {
  next();
});

// Aplicar rotas compartilhadas em ambos os prefixos
app.use('/api', sharedRoutes);
app.use('/foods/api', sharedRoutes);

// Aplicar todas as rotas com prefixos automaticamente
applyRoutePrefixes(app, routes);

// Middleware de tratamento de erros padronizado
const { errorHandler } = require('./middleware/responseHandler');
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar servidor
app.listen(PORT, () => {
  // Redis desabilitado - comentado para não gerar logs de erro
  // connectRedis();
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌐 URL Externa: https://foods.terceirizemais.com.br`);
  console.log(`✅ Estrutura modular carregada com sucesso`);
  console.log(`🔄 Prefixos de rota aplicados: /api e /foods/api`);
}); 