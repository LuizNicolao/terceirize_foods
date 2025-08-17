/**
 * Middleware para aplicar prefixos de rota automaticamente
 * Elimina a necessidade de duplicar rotas para diferentes prefixos
 */
const applyRoutePrefixes = (app, routes, prefixes = ['/api', '/foods/api']) => {
  prefixes.forEach(prefix => {
    routes.forEach(route => {
      const { path, router, middleware = [] } = route;
      const fullPath = `${prefix}${path}`;
      
      // Aplicar middlewares específicos se fornecidos
      if (middleware.length > 0) {
        app.use(fullPath, ...middleware, router);
      } else {
        app.use(fullPath, router);
      }
    });
  });
};

module.exports = { applyRoutePrefixes };
