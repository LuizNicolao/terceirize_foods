import api from './api';

/**
 * Service para Contratos
 * Gerencia comunicação com a API de contratos
 */
const contratosService = {
  /**
   * Listar contratos com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/contratos', { params });
      
      // O backend retorna: { success: true, data: { items: [...], pagination: {...} } }
      const responseData = response.data?.data || response.data || {};
      
      // Extrair items e pagination
      let items = [];
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        items = responseData.items;
      } else if (Array.isArray(responseData.data)) {
        items = responseData.data;
      }
      
      const paginationData = responseData.pagination || response.data?.pagination || null;
      
      // Normalizar dados de paginação para o formato esperado pelo frontend
      const normalizedPagination = paginationData ? {
        currentPage: paginationData.page || paginationData.currentPage || 1,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.total || paginationData.totalItems || 0,
        itemsPerPage: paginationData.limit || paginationData.itemsPerPage || 20
      } : null;
      
      return {
        success: true,
        data: items,
        pagination: normalizedPagination,
        links: response.data?.links || null
      };
    } catch (error) {
      console.error('Erro ao listar contratos:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar contratos',
        data: []
      };
    }
  },

  /**
   * Buscar contrato por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/contratos/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data || null
      };
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar contrato',
        data: null
      };
    }
  },

  /**
   * Buscar unidades vinculadas a um contrato
   */
  async buscarUnidadesVinculadas(id) {
    try {
      const response = await api.get(`/contratos/${id}/unidades`);
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao buscar unidades vinculadas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar unidades vinculadas',
        data: []
      };
    }
  },

  /**
   * Buscar produtos vinculados a um contrato
   */
  async buscarProdutosVinculados(id) {
    try {
      const response = await api.get(`/contratos/${id}/produtos`);
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao buscar produtos vinculados:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produtos vinculados',
        data: []
      };
    }
  },

  /**
   * Criar novo contrato
   */
  async criar(dados) {
    try {
      const response = await api.post('/contratos', dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Contrato criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
                          'Erro ao criar contrato';
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Atualizar contrato
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/contratos/${id}`, dados);
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Contrato atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar contrato',
        data: null
      };
    }
  },

  /**
   * Vincular unidades a um contrato
   */
  async vincularUnidades(id, cozinha_industrial_ids) {
    try {
      // Garantir que cozinha_industrial_ids seja um array de números
      const idsArray = Array.isArray(cozinha_industrial_ids) 
        ? cozinha_industrial_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id) && id > 0)
        : [];
      
      if (idsArray.length === 0) {
        return {
          success: false,
          error: 'Deve informar pelo menos uma unidade escolar válida',
          data: null
        };
      }
      
      const response = await api.post(`/contratos/${id}/vincular-unidades`, {
        cozinha_industrial_ids: idsArray
      });
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Unidades vinculadas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao vincular unidades:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao vincular unidades';
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Vincular produtos a um contrato
   */
  async vincularProdutos(id, produtos) {
    try {
      // Validar produtos
      if (!Array.isArray(produtos) || produtos.length === 0) {
        return {
          success: false,
          error: 'Deve informar pelo menos um produto comercial',
          data: null
        };
      }

      // Garantir que todos os produtos tenham produto_comercial_id e valor_unitario
      const produtosValidados = produtos.map(produto => ({
        produto_comercial_id: parseInt(produto.produto_comercial_id, 10),
        valor_unitario: parseFloat(produto.valor_unitario)
      })).filter(p => !isNaN(p.produto_comercial_id) && p.produto_comercial_id > 0 && 
                      !isNaN(p.valor_unitario) && p.valor_unitario > 0);

      if (produtosValidados.length === 0) {
        return {
          success: false,
          error: 'Todos os produtos devem ter produto_comercial_id válido e valor_unitario maior que zero',
          data: null
        };
      }
      
      const response = await api.post(`/contratos/${id}/vincular-produtos`, {
        produtos: produtosValidados
      });
      return {
        success: true,
        data: response.data?.data || response.data || null,
        message: response.data?.message || 'Produtos vinculados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao vincular produtos:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao vincular produtos';
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Excluir contrato
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/contratos/${id}`);
      return {
        success: true,
        message: response.data?.message || 'Contrato excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir contrato'
      };
    }
  },

  /**
   * Exportar contratos em JSON
   */
  async exportarJson() {
    try {
      const response = await api.get('/contratos/exportar/json');
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('Erro ao exportar contratos:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar contratos',
        data: []
      };
    }
  }
};

export default contratosService;

