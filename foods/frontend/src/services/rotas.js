import api from './api';

class RotasService {
  // Listar rotas com paginação, busca e filtros
  static async listar(params = {}) {
    try {
      const response = await api.get('/rotas', { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        filters: response.data.filters || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar rotas',
        data: []
      };
    }
  }

  // Buscar rota por ID
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/rotas/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar rota',
        data: null
      };
    }
  }

  // Criar rota
  static async criar(data) {
    try {
      const response = await api.post('/rotas', data);
      return {
        success: true,
        data: response.data.data,
        message: 'Rota criada com sucesso!'
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
        error: error.response?.data?.error || 'Erro ao criar rota'
      };
    }
  }

  // Atualizar rota
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/rotas/${id}`, data);
      return {
        success: true,
        data: response.data.data,
        message: 'Rota atualizada com sucesso!'
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
        error: error.response?.data?.error || 'Erro ao atualizar rota'
      };
    }
  }

  // Excluir rota
  static async excluir(id) {
    try {
      await api.delete(`/rotas/${id}`);
      return {
        success: true,
        message: 'Rota excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Erro ao excluir rota'
      };
    }
  }

  // Buscar rotas ativas
  static async buscarAtivas() {
    try {
      const response = await api.get('/rotas/ativas/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar rotas ativas',
        data: []
      };
    }
  }

  // Buscar rotas por filial
  static async buscarPorFilial(filialId) {
    try {
      const response = await api.get(`/rotas/filial/${filialId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar rotas por filial',
        data: []
      };
    }
  }

  // Buscar rotas por tipo
  static async buscarPorTipo(tipo) {
    try {
      const response = await api.get(`/rotas/tipo/${tipo}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar rotas por frequência',
        data: []
      };
    }
  }

  // Listar tipos de rota (DEPRECATED - usar listarFrequenciasEntrega)
  static async listarTipos() {
    try {
      const response = await api.get('/rotas/tipos/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar frequências de entrega',
        data: []
      };
    }
  }

  // Listar frequências de entrega disponíveis no ENUM
  static async listarFrequenciasEntrega() {
    try {
      const response = await api.get('/rotas/frequencias/listar');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar frequências de entrega',
        data: []
      };
    }
  }

  // Adicionar nova frequência de entrega
  static async adicionarFrequenciaEntrega(nome) {
    try {
      const response = await api.post('/rotas/frequencias/adicionar', { nome });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Frequência adicionada com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao adicionar frequência de entrega'
      };
    }
  }

  // Buscar unidades escolares de uma rota
  static async buscarUnidadesEscolares(rotaId) {
    try {
      const response = await api.get(`/rotas/${rotaId}/unidades-escolares`);
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

  // Buscar estatísticas das rotas
  static async buscarEstatisticas() {
    try {
      const response = await api.get('/rotas/estatisticas');
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

  // Exportar rotas para XLSX
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/rotas/export/xlsx', { 
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

  // Exportar rotas para PDF
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/rotas/export/pdf', { 
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

export default RotasService; 