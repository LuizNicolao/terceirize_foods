/**
 * Middleware HATEOAS
 * Adiciona links de navegação nas respostas da API
 */

const hateoasMiddleware = (resourceName) => {
  return (req, res, next) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const currentUrl = req.originalUrl;
    
    // Sobrescrever o método res.json para adicionar links HATEOAS
    const originalJson = res.json;
    
    res.json = function(data) {
      // Se a resposta já tem links HATEOAS, não adicionar novamente
      if (data && data._links) {
        return originalJson.call(this, data);
      }
      
      // Criar links baseados no tipo de recurso e método HTTP
      const links = {
        self: {
          href: `${baseUrl}${currentUrl}`,
          method: req.method
        }
      };
      
      // Adicionar links específicos baseados no recurso
      switch (resourceName) {
        case 'cotacoes':
          links.collection = {
            href: `${baseUrl}/api/cotacoes`,
            method: 'GET'
          };
          
          if (req.method === 'GET' && req.params.id) {
            links.update = {
              href: `${baseUrl}/api/cotacoes/${req.params.id}`,
              method: 'PUT'
            };
            links.delete = {
              href: `${baseUrl}/api/cotacoes/${req.params.id}`,
              method: 'DELETE'
            };
            links.enviarSupervisor = {
              href: `${baseUrl}/api/cotacoes/${req.params.id}/enviar-supervisor`,
              method: 'POST'
            };
          }
          
          if (req.method === 'GET' && !req.params.id) {
            links.create = {
              href: `${baseUrl}/api/cotacoes`,
              method: 'POST'
            };
            links.stats = {
              href: `${baseUrl}/api/cotacoes/stats/overview`,
              method: 'GET'
            };
            links.pendentesSupervisor = {
              href: `${baseUrl}/api/cotacoes/pendentes-supervisor/listar`,
              method: 'GET'
            };
            links.aprovacoes = {
              href: `${baseUrl}/api/cotacoes/aprovacoes/listar`,
              method: 'GET'
            };
          }
          break;
          
        case 'usuarios':
          links.collection = {
            href: `${baseUrl}/api/users`,
            method: 'GET'
          };
          
          if (req.method === 'GET' && req.params.id) {
            links.update = {
              href: `${baseUrl}/api/users/${req.params.id}`,
              method: 'PUT'
            };
            links.delete = {
              href: `${baseUrl}/api/users/${req.params.id}`,
              method: 'DELETE'
            };
          }
          
          if (req.method === 'GET' && !req.params.id) {
            links.create = {
              href: `${baseUrl}/api/users`,
              method: 'POST'
            };
          }
          break;
          
        default:
          // Links genéricos para outros recursos
          if (req.method === 'GET' && !req.params.id) {
            links.create = {
              href: `${baseUrl}${currentUrl}`,
              method: 'POST'
            };
          }
          
          if (req.method === 'GET' && req.params.id) {
            links.update = {
              href: `${baseUrl}${currentUrl}`,
              method: 'PUT'
            };
            links.delete = {
              href: `${baseUrl}${currentUrl}`,
              method: 'DELETE'
            };
          }
      }
      
      // Adicionar links de navegação geral
      links.dashboard = {
        href: `${baseUrl}/api/dashboard`,
        method: 'GET'
      };
      
      // Estruturar resposta com HATEOAS
      const response = {
        success: true,
        data: data,
        _links: links,
        _meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };
      
      return originalJson.call(this, response);
    };
    
    next();
  };
};

module.exports = {
  hateoasMiddleware
};
