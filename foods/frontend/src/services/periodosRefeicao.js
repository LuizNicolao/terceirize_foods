import api from './api';

class PeriodosRefeicaoService {
  // Listar períodos de refeição com paginação, busca e filtros
  static async listar(params = {}) {
    try {
      const response = await api.get('/periodos-refeicao', { params });
      
      // Extrair dados da estrutura HATEOAS
      let periodos = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.periodos (estrutura específica do backend)
        if (response.data.data.periodos) {
          periodos = response.data.data.periodos;
          pagination = response.data.data.pagination;
        }
        // Se tem data.items (estrutura HATEOAS)
        else if (response.data.data.items) {
          periodos = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          periodos = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        periodos = response.data;
      }
      
      return {
        success: true,
        data: periodos,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      console.error('PeriodosRefeicaoService.listar - Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar períodos de refeição',
        data: []
      };
    }
  }

  // Buscar período de refeição por ID
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/periodos-refeicao/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar período de refeição',
        data: null
      };
    }
  }

  // Listar períodos de refeição por filial
  static async listarPorFilial(filialId) {
    try {
      const response = await api.get(`/periodos-refeicao/filial/${filialId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar períodos de refeição da filial',
        data: []
      };
    }
  }

  // Criar período de refeição
  static async criar(data) {
    try {
      const response = await api.post('/periodos-refeicao', data);
      return {
        success: true,
        data: response.data.data,
        message: 'Período de refeição criado com sucesso!'
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
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao criar período de refeição'
      };
    }
  }

  // Atualizar período de refeição
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/periodos-refeicao/${id}`, data);
      return {
        success: true,
        data: response.data.data,
        message: 'Período de refeição atualizado com sucesso!'
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
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar período de refeição'
      };
    }
  }

  // Excluir período de refeição
  static async excluir(id) {
    try {
      await api.delete(`/periodos-refeicao/${id}`);
      return {
        success: true,
        message: 'Período de refeição excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao excluir período de refeição'
      };
    }
  }

  // Buscar períodos de refeição ativos
  static async buscarAtivos() {
    try {
      const response = await api.get('/periodos-refeicao/ativas/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar períodos de refeição ativos',
        data: []
      };
    }
  }

  // Buscar períodos de refeição por filial
  static async buscarPorFilial(filialId) {
    try {
      const response = await api.get(`/periodos-refeicao/filial/${filialId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar períodos de refeição por filial',
        data: []
      };
    }
  }

  // Buscar períodos de refeição disponíveis para uma unidade escolar
  static async buscarDisponiveisParaUnidade(unidadeEscolarId) {
    try {
      const response = await api.get(`/periodos-refeicao/unidade-escolar/${unidadeEscolarId}/disponiveis`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar períodos de refeição disponíveis',
        data: []
      };
    }
  }

  // Buscar períodos de refeição por IDs específicos
  static async buscarPorIds(ids) {
    try {
      const response = await api.post('/periodos-refeicao/buscar-por-ids', { ids });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar períodos de refeição por IDs',
        data: []
      };
    }
  }

  // Exportar períodos de refeição para XLSX
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/periodos-refeicao/export/xlsx', { 
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar XLSX'
      };
    }
  }

  // Exportar períodos de refeição para PDF
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/periodos-refeicao/export/pdf', { 
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar PDF'
      };
    }
  }
}

export default PeriodosRefeicaoService;
