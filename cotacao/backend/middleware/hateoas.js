/**
 * Middleware HATEOAS para adicionar links de navegação
 * Implementa padrões RESTful com links de navegação
 */

const hateoasMiddleware = (resourceName) => {
  return (req, res, next) => {
    // Adicionar função para criar links HATEOAS
    res.addHateoasLinks = (data, id = null) => {
      
      const baseUrl = `${req.protocol}://${req.get('host')}/api/${resourceName}`;
      
      const links = {
        self: id ? `${baseUrl}/${id}` : baseUrl,
        collection: baseUrl
      };

      // Adicionar links específicos baseados no resource
      switch (resourceName) {
        case 'auth':
          links.login = `${baseUrl}/login`;
          links.logout = `${baseUrl}/logout`;
          links.verify = `${baseUrl}/verify`;
          break;
        case 'dashboard':
          links.stats = `${baseUrl}/stats`;
          links.activity = `${baseUrl}/activity`;
          break;
        case 'usuarios':
          links.create = `${baseUrl}`;
          links.search = `${baseUrl}/search`;
          break;
        default:
          links.create = `${baseUrl}`;
          links.search = `${baseUrl}/search`;
      }

      const result = {
        data,
        links
      }; 
      
      return result;
    };

    next();
  };
};

// Função para criar links de navegação para listas
const createCollectionLinks = (req, resourceName, totalPages) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/${resourceName}`;
  const { page } = req.pagination || { page: 1 };

  const links = {
    self: `${baseUrl}?page=${page}`,
    first: `${baseUrl}?page=1`,
    last: `${baseUrl}?page=${totalPages}`,
    create: `${baseUrl}`,
    search: `${baseUrl}/search`
  };

  if (page > 1) {
    links.prev = `${baseUrl}?page=${page - 1}`;
  }

  if (page < totalPages) {
    links.next = `${baseUrl}?page=${page + 1}`;
  }

  return links;
};

// Função para criar links de navegação para recursos individuais
const createResourceLinks = (req, resourceName, id) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/${resourceName}`;

  return {
    self: `${baseUrl}/${id}`,
    collection: baseUrl,
    update: `${baseUrl}/${id}`,
    delete: `${baseUrl}/${id}`
  };
};

module.exports = {
  hateoasMiddleware,
  createCollectionLinks,
  createResourceLinks
};
