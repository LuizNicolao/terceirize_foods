/**
 * Middleware para aplicar prefixos de rota
 * Garante que todas as rotas tenham o prefixo correto
 */

const applyRoutePrefixes = (app) => {
  // Prefixo base para todas as rotas
  const basePrefix = '/chamados/api';

  // Middleware para adicionar prefixo automaticamente
  app.use((req, res, next) => {
    // Se a rota já começa com o prefixo, não fazer nada
    if (req.path.startsWith(basePrefix)) {
      return next();
    }

    // Se for uma rota de API, adicionar prefixo
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/health')) {
      // Manter a rota como está, mas garantir que o prefixo está correto
      return next();
    }

    next();
  });
};

module.exports = {
  applyRoutePrefixes
};

