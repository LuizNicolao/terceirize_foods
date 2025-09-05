import api from './api';

class TiposCardapioService {
  // Listar tipos de cardápio com paginação, busca e filtros
  static async listar(params = {}) {
    try {
      const response = await api.get('/tipos-cardapio', { params });
      
      // Extrair dados da estrutura HATEOAS
      let tipos = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.tipos (estrutura específica do backend)
        if (response.data.data.tipos) {
          tipos = response.data.data.tipos;
          pagination = response.data.data.pagination;
        }
        // Se tem data.items (estrutura HATEOAS)
        else if (response.data.data.items) {
          tipos = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          tipos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        tipos = response.data;
      }
      
      return {
        success: true,
        data: tipos,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      console.error('TiposCardapioService.listar - Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar tipos de cardápio',
        data: []
      };
    }
  }

  // Buscar tipo de cardápio por ID
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/tipos-cardapio/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipo de cardápio',
        data: null
      };
    }
  }

  // Listar tipos de cardápio por filial
  static async listarPorFilial(filialId) {
    try {
      const response = await api.get(`/tipos-cardapio/filial/${filialId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar tipos de cardápio da filial',
        data: []
      };
    }
  }

  // Criar tipo de cardápio
  static async criar(data) {
    try {
      const response = await api.post('/tipos-cardapio', data);
      return {
        success: true,
        data: response.data.data,
        message: 'Tipo de cardápio criado com sucesso!'
      };
    } catch (error) {
      // Capturar erros de validação do backend
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar tipo de cardápio'
      };
    }
  }

  // Atualizar tipo de cardápio
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/tipos-cardapio/${id}`, data);
      return {
        success: true,
        data: response.data.data,
        message: 'Tipo de cardápio atualizado com sucesso!'
      };
    } catch (error) {
      // Capturar erros de validação do backend
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar tipo de cardápio'
      };
    }
  }

  // Excluir tipo de cardápio
  static async excluir(id) {
    try {
      await api.delete(`/tipos-cardapio/${id}`);
      return {
        success: true,
        message: 'Tipo de cardápio excluído com sucesso!'
      };
    } catch (error) {
      console.log('Erro ao excluir tipo de cardápio:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao excluir tipo de cardápio'
      };
    }
  }

  // Buscar tipos de cardápio ativos
  static async buscarAtivos() {
    try {
      const response = await api.get('/tipos-cardapio/ativas/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipos de cardápio ativos',
        data: []
      };
    }
  }

  // Buscar tipos de cardápio por filial
  static async buscarPorFilial(filialId) {
    try {
      const response = await api.get(`/tipos-cardapio/filial/${filialId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipos de cardápio por filial',
        data: []
      };
    }
  }

  // Buscar tipos de cardápio disponíveis para uma unidade escolar
  static async buscarDisponiveisParaUnidade(unidadeEscolarId) {
    try {
      const response = await api.get(`/tipos-cardapio/unidade-escolar/${unidadeEscolarId}/disponiveis`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipos de cardápio disponíveis',
        data: []
      };
    }
  }

  // Buscar tipos de cardápio por IDs específicos
  static async buscarPorIds(ids) {
    try {
      const response = await api.post('/tipos-cardapio/buscar-por-ids', { ids });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipos de cardápio por IDs',
        data: []
      };
    }
  }
}

export default TiposCardapioService;
