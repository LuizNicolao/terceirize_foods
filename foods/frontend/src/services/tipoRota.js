import api from './api';

class TipoRotaService {
  // Listar tipos de rota com paginação, busca e filtros
  static async listar(params = {}) {
    try {
      const response = await api.get('/tipo-rota', { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        filters: response.data.filters || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar tipos de rota',
        data: []
      };
    }
  }

  // Buscar tipo de rota por ID
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/tipo-rota/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipo de rota',
        data: null
      };
    }
  }

  // Criar tipo de rota
  static async criar(data) {
    try {
      const response = await api.post('/tipo-rota', data);
      return {
        success: true,
        data: response.data.data,
        message: 'Tipo de rota criado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          message: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.error || 'Erro ao criar tipo de rota',
          message: error.response?.data?.message || error.response?.data?.error || 'Erro ao criar tipo de rota'
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar tipo de rota',
        message: error.response?.data?.message || error.response?.data?.error || 'Erro ao criar tipo de rota'
      };
    }
  }

  // Atualizar tipo de rota
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/tipo-rota/${id}`, data);
      return {
        success: true,
        data: response.data.data,
        message: 'Tipo de rota atualizado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          message: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.error || 'Erro ao atualizar tipo de rota',
          message: error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar tipo de rota'
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar tipo de rota',
        message: error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar tipo de rota'
      };
    }
  }

  // Excluir tipo de rota
  static async excluir(id) {
    try {
      await api.delete(`/tipo-rota/${id}`);
      return {
        success: true,
        message: 'Tipo de rota excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Erro ao excluir tipo de rota'
      };
    }
  }

  // Buscar tipos de rota ativos
  static async buscarAtivas() {
    try {
      const response = await api.get('/tipo-rota/ativas/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipos de rota ativos',
        data: []
      };
    }
  }

  // Buscar tipos de rota por filial
  static async buscarPorFilial(filialId) {
    try {
      const response = await api.get(`/tipo-rota/filial/${filialId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipos de rota por filial',
        data: []
      };
    }
  }

  // Buscar tipos de rota por grupo
  static async buscarPorGrupo(grupoId) {
    try {
      const response = await api.get(`/tipo-rota/grupo/${grupoId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar tipos de rota por grupo',
        data: []
      };
    }
  }

  // Buscar unidades escolares de um tipo de rota
  static async buscarUnidadesEscolares(tipoRotaId) {
    try {
      const response = await api.get(`/tipo-rota/${tipoRotaId}/unidades-escolares`);
      return {
        success: true,
        data: response.data.data || { unidades: [], total: 0 }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades escolares',
        data: { unidades: [], total: 0 }
      };
    }
  }

  // Buscar unidades escolares disponíveis por filial e grupo
  static async buscarUnidadesDisponiveis(filialId, grupoId, tipoRotaId = null) {
    try {
      const params = tipoRotaId ? { tipoRotaId } : {};
      const response = await api.get(`/tipo-rota/disponiveis/filial/${filialId}/grupo/${grupoId}`, { params });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar unidades disponíveis',
        data: []
      };
    }
  }

  // Buscar grupos disponíveis por filial (excluindo grupos já vinculados)
  static async buscarGruposDisponiveisPorFilial(filialId, tipoRotaId = null) {
    try {
      const params = tipoRotaId ? { tipoRotaId } : {};
      const response = await api.get(`/tipo-rota/grupos-disponiveis/filial/${filialId}`, { params });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar grupos disponíveis',
        data: []
      };
    }
  }

  // Buscar estatísticas dos tipos de rota
  static async buscarEstatisticas() {
    try {
      const response = await api.get('/tipo-rota/estatisticas');
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar estatísticas',
        data: {}
      };
    }
  }

  // Exportar tipos de rota para XLSX
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/tipo-rota/export/xlsx', { 
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
        error: error.response?.data?.error || 'Erro ao exportar dados'
      };
    }
  }

  // Exportar tipos de rota para PDF
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/tipo-rota/export/pdf', { 
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
        error: error.response?.data?.error || 'Erro ao exportar dados'
      };
    }
  }
}

export default TipoRotaService;

