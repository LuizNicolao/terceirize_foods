/**
 * Middleware para aplicar prefixos de rotas automaticamente
 * Segue o padrão do projeto Foods
 */

const applyRoutePrefixes = (app, routes) => {
  routes.forEach(({ path, router }) => {
    app.use(`/cotacao/api${path}`, router);
  });
};

module.exports = {
  applyRoutePrefixes
};
