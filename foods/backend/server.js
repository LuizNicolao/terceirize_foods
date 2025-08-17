require('dotenv').config();

// Importar configurações da aplicação
const { app, PORT, limiter, loginLimiter } = require('./config/app');

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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Aplicar rotas compartilhadas em ambos os prefixos
app.use('/api', sharedRoutes);
app.use('/foods/api', sharedRoutes);

// Aplicar todas as rotas com prefixos automaticamente
applyRoutePrefixes(app, routes);

// Middleware de tratamento de erros CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.log('❌ Erro CSRF:', req.path);
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente.' });
  }
  next(err);
});

// Middleware de tratamento de erros padronizado
const { errorHandler } = require('./middleware/responseHandler');
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌐 URL Externa: https://foods.terceirizemais.com.br`);
  console.log(`✅ Estrutura modular carregada com sucesso`);
  console.log(`🔄 Prefixos de rota aplicados: /api e /foods/api`);
}); 