import api from './api';

class CentroCustoService {
  async listar(params = {}) {
    try {
      const response = await api.get('/centro-custo', { params });
      
      // Extrair dados da estrutura HATEOAS
      let centrosCusto = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        if (response.data.data.items) {
          centrosCusto = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
          statistics = response.data.data._meta?.statistics;
        } else {
          centrosCusto = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        centrosCusto = response.data;
      }
      
      if (!pagination) {
        pagination = response.data.pagination || response.data.meta?.pagination;
      }
      if (!statistics) {
        statistics = response.data.statistics || response.data.meta?.statistics;
      }
      
      return {
        success: true,
        data: centrosCusto,
        pagination: pagination || response.data.pagination || response.data.meta?.pagination,
        statistics: statistics || response.data.statistics || response.data.meta?.statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar centros de custo'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/centro-custo/${id}`);
      
      let centroCusto = null;
      
      if (response.data.data) {
        centroCusto = response.data.data;
      } else {
        centroCusto = response.data;
      }
      
      return {
        success: true,
        data: centroCusto
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar centro de custo'
      };
    }
  }

  async obterProximoCodigo() {
    try {
      const response = await api.get('/centro-custo/proximo-codigo');
      
      let data = null;
      
      if (response.data.data) {
        data = response.data.data;
      } else {
        data = response.data;
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter próximo código'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/centro-custo', data);
      
      let centroCusto = null;
      
      if (response.data.data) {
        centroCusto = response.data.data;
      } else {
        centroCusto = response.data;
      }
      
      return {
        success: true,
        data: centroCusto,
        message: 'Centro de custo criado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar centro de custo'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/centro-custo/${id}`, data);
      
      let centroCusto = null;
      
      if (response.data.data) {
        centroCusto = response.data.data;
      } else {
        centroCusto = response.data;
      }
      
      return {
        success: true,
        data: centroCusto,
        message: 'Centro de custo atualizado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar centro de custo'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/centro-custo/${id}`);
      return {
        success: true,
        message: 'Centro de custo excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir centro de custo'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/centro-custo/ativos');
      
      let centrosCusto = [];
      
      if (response.data.data) {
        if (response.data.data.items) {
          centrosCusto = response.data.data.items;
        } else {
          centrosCusto = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        centrosCusto = response.data;
      }
      
      return {
        success: true,
        data: centrosCusto
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar centros de custo ativos'
      };
    }
  }
}

export default new CentroCustoService();

