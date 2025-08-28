/**
 * Middleware HATEOAS (Hypermedia as the Engine of Application State)
 * Implementa links de navegação e ações disponíveis nas respostas da API
 */

// Configuração base da API
const API_BASE_URL = process.env.API_BASE_URL || 'https://foods.terceirizemais.com.br/foods/api';

// Links padrão da API
const DEFAULT_LINKS = {
  self: null, // Será definido dinamicamente
  collection: null, // Será definido dinamicamente
  create: null, // Será definido dinamicamente
  update: null, // Será definido dinamicamente
  delete: null, // Será definido dinamicamente
  search: null // Será definido dinamicamente
};

// Classe para gerenciar links HATEOAS
class HateoasHelper {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Gerar links para um recurso específico
  generateResourceLinks(resourceType, resourceId = null, includeActions = true) {
    const links = {
      self: resourceId 
        ? `${this.baseUrl}/${resourceType}/${resourceId}`
        : `${this.baseUrl}/${resourceType}`
    };

    if (includeActions) {
      links.collection = `${this.baseUrl}/${resourceType}`;
      
      if (resourceId) {
        links.update = `${this.baseUrl}/${resourceType}/${resourceId}`;
        links.delete = `${this.baseUrl}/${resourceType}/${resourceId}`;
      } else {
        links.create = `${this.baseUrl}/${resourceType}`;
      }
      
      links.search = `${this.baseUrl}/${resourceType}?search=`;
    }

    return links;
  }

  // Gerar links para listagem com paginação
  generateListLinks(resourceType, pagination, queryParams = {}) {
    const baseUrl = `${this.baseUrl}/${resourceType}`;
    const links = {
      self: this.buildUrl(baseUrl, pagination.currentPage, queryParams),
      first: this.buildUrl(baseUrl, 1, queryParams),
      last: this.buildUrl(baseUrl, pagination.totalPages, queryParams),
      create: `${baseUrl}`,
      search: `${baseUrl}?search=`
    };

    if (pagination.hasNextPage) {
      links.next = this.buildUrl(baseUrl, pagination.currentPage + 1, queryParams);
    }

    if (pagination.hasPrevPage) {
      links.prev = this.buildUrl(baseUrl, pagination.currentPage - 1, queryParams);
    }

    return links;
  }

  // Construir URL com parâmetros
  buildUrl(baseUrl, page, queryParams = {}) {
    const url = new URL(baseUrl);
    
    // Adicionar parâmetros de paginação
    if (page) {
      url.searchParams.set('page', page.toString());
    }
    
    // Adicionar outros parâmetros
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value.toString());
      }
    });

    return url.toString();
  }

  // Adicionar links a um recurso individual
  addResourceLinks(resource, resourceType, includeActions = true) {
    if (!resource || !resource.id) {
      return resource;
    }

    return {
      ...resource,
      _links: this.generateResourceLinks(resourceType, resource.id, includeActions)
    };
  }

  // Adicionar links a uma lista de recursos
  addListLinks(resources, resourceType, pagination = null, queryParams = {}) {
    const items = resources.map(resource => 
      this.addResourceLinks(resource, resourceType, false)
    );

    const result = {
      items,
      _links: pagination 
        ? this.generateListLinks(resourceType, pagination, queryParams)
        : this.generateResourceLinks(resourceType, null, true)
    };

    if (pagination) {
      result._meta = {
        pagination
      };
    }

    return result;
  }

  // Gerar links de navegação para dashboard
  generateDashboardLinks() {
    return {
      self: `${this.baseUrl}/dashboard`,
      usuarios: `${this.baseUrl}/usuarios`,
      fornecedores: `${this.baseUrl}/fornecedores`,
      clientes: `${this.baseUrl}/clientes`,
      produtos: `${this.baseUrl}/produtos`,
      grupos: `${this.baseUrl}/grupos`,
      subgrupos: `${this.baseUrl}/subgrupos`,
      marcas: `${this.baseUrl}/marcas`,
      classes: `${this.baseUrl}/classes`,
      filiais: `${this.baseUrl}/filiais`,
      unidades: `${this.baseUrl}/unidades`,
      unidades_escolares: `${this.baseUrl}/unidades-escolares`,
      motoristas: `${this.baseUrl}/motoristas`,
      ajudantes: `${this.baseUrl}/ajudantes`,
      veiculos: `${this.baseUrl}/veiculos`,
      rotas: `${this.baseUrl}/rotas`,
      auditoria: `${this.baseUrl}/auditoria`,
      permissoes: `${this.baseUrl}/permissoes`,
      produto_generico: `${this.baseUrl}/produto-generico`,
      intolerancias: `${this.baseUrl}/intolerancias`,
      efetivos: `${this.baseUrl}/efetivos`
    };
  }

  // Gerar links de ações disponíveis baseado nas permissões do usuário
  generateActionLinks(resourceType, userPermissions = [], resourceId = null) {
    const actions = {};

    if (userPermissions.includes('visualizar')) {
      actions.view = {
        href: resourceId 
          ? `${this.baseUrl}/${resourceType}/${resourceId}`
          : `${this.baseUrl}/${resourceType}`,
        method: 'GET',
        description: 'Visualizar recurso'
      };
    }

    if (userPermissions.includes('criar') && !resourceId) {
      actions.create = {
        href: `${this.baseUrl}/${resourceType}`,
        method: 'POST',
        description: 'Criar novo recurso'
      };
    }

    if (userPermissions.includes('editar') && resourceId) {
      actions.update = {
        href: `${this.baseUrl}/${resourceType}/${resourceId}`,
        method: 'PUT',
        description: 'Atualizar recurso'
      };
    }

    if (userPermissions.includes('excluir') && resourceId) {
      actions.delete = {
        href: `${this.baseUrl}/${resourceType}/${resourceId}`,
        method: 'DELETE',
        description: 'Excluir recurso'
      };
    }

    return actions;
  }
}

// Middleware para adicionar HATEOAS às respostas
const hateoasMiddleware = (resourceType) => {
  return (req, res, next) => {
    const hateoas = new HateoasHelper();
    
    // Adicionar métodos HATEOAS ao objeto de resposta
    res.addResourceLinks = (resource, includeActions = true) => {
      return hateoas.addResourceLinks(resource, resourceType, includeActions);
    };

    res.addListLinks = (resources, pagination = null, queryParams = {}) => {
      return hateoas.addListLinks(resources, resourceType, pagination, queryParams);
    };

    res.generateActionLinks = (userPermissions = [], resourceId = null) => {
      return hateoas.generateActionLinks(resourceType, userPermissions, resourceId);
    };

    next();
  };
};

// Middleware para adicionar links de navegação ao dashboard
const dashboardHateoasMiddleware = (req, res, next) => {
  const hateoas = new HateoasHelper();
  
  res.addDashboardLinks = () => {
    return hateoas.generateDashboardLinks();
  };

  next();
};

// Função para criar resposta HATEOAS completa
const createHateoasResponse = (data, links, actions = null, meta = null) => {
  const response = {
    data,
    _links: links
  };

  if (actions) {
    response._actions = actions;
  }

  if (meta) {
    response._meta = meta;
  }

  return response;
};

module.exports = {
  HateoasHelper,
  hateoasMiddleware,
  dashboardHateoasMiddleware,
  createHateoasResponse,
  API_BASE_URL
}; 