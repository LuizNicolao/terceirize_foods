const addHateoasLinks = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const apiBase = `${baseUrl}/api`;
    
    // Adicionar links HATEOAS baseados no tipo de resposta
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        // Lista de recursos
        data = {
          data: data,
          links: {
            self: `${apiBase}${req.path}`,
            first: `${apiBase}${req.path}?page=1`,
            last: `${apiBase}${req.path}?page=${Math.ceil(data.length / 10)}`,
            next: data.length > 10 ? `${apiBase}${req.path}?page=2` : null,
            prev: null
          },
          meta: {
            total: data.length,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            totalPages: Math.ceil(data.length / 10)
          }
        };
      } else if (data.id) {
        // Recurso individual
        data = {
          ...data,
          links: {
            self: `${apiBase}${req.path}`,
            collection: `${apiBase}${req.path.split('/').slice(0, -1).join('/')}`,
            update: `${apiBase}${req.path}`,
            delete: `${apiBase}${req.path}`
          }
        };
      } else if (data.success !== undefined) {
        // Resposta de sucesso/erro
        data = {
          ...data,
          links: {
            self: `${apiBase}${req.path}`,
            home: `${apiBase}/`,
            docs: `${baseUrl}/docs`
          }
        };
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = { addHateoasLinks };
