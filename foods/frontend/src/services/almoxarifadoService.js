import api from './api';

class AlmoxarifadoService {
  async listar(params = {}) {
    try {
      const response = await api.get('/almoxarifado', { params });
      
      let almoxarifados = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        if (response.data.data.items) {
          almoxarifados = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
          statistics = response.data.data._meta?.statistics;
        } else {
          almoxarifados = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        almoxarifados = response.data;
      }
      
      if (!pagination) {
        pagination = response.data.pagination || response.data.meta?.pagination;
      }
      if (!statistics) {
        statistics = response.data.statistics || response.data.meta?.statistics;
      }
      
      return {
        success: true,
        data: almoxarifados,
        pagination: pagination || response.data.pagination || response.data.meta?.pagination,
        statistics: statistics || response.data.statistics || response.data.meta?.statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar almoxarifados'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/almoxarifado/${id}`);
      
      let almoxarifado = null;
      
      if (response.data.data) {
        almoxarifado = response.data.data;
      } else {
        almoxarifado = response.data;
      }
      
      return {
        success: true,
        data: almoxarifado
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar almoxarifado'
      };
    }
  }

  async obterProximoCodigo() {
    try {
      const response = await api.get('/almoxarifado/proximo-codigo');
      
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
      const response = await api.post('/almoxarifado', data);
      
      let almoxarifado = null;
      
      if (response.data.data) {
        almoxarifado = response.data.data;
      } else {
        almoxarifado = response.data;
      }
      
      return {
        success: true,
        data: almoxarifado,
        message: 'Almoxarifado criado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar almoxarifado'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/almoxarifado/${id}`, data);
      
      let almoxarifado = null;
      
      if (response.data.data) {
        almoxarifado = response.data.data;
      } else {
        almoxarifado = response.data;
      }
      
      return {
        success: true,
        data: almoxarifado,
        message: 'Almoxarifado atualizado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar almoxarifado'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/almoxarifado/${id}`);
      return {
        success: true,
        message: 'Almoxarifado excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir almoxarifado'
      };
    }
  }

  async buscarAtivos(filialId = null, centroCustoId = null) {
    try {
      const params = {};
      if (filialId) params.filial_id = filialId;
      if (centroCustoId) params.centro_custo_id = centroCustoId;
      
      const response = await api.get('/almoxarifado/ativos', { params });
      
      let almoxarifados = [];
      
      if (response.data.data) {
        if (response.data.data.items) {
          almoxarifados = response.data.data.items;
        } else {
          almoxarifados = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        almoxarifados = response.data;
      }
      
      return {
        success: true,
        data: almoxarifados
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar almoxarifados ativos'
      };
    }
  }

  /**
   * Exportar almoxarifados para XLSX
   */
  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/almoxarifado/export/xlsx', {
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

  /**
   * Exportar almoxarifados para PDF
   */
  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/almoxarifado/export/pdf', {
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

export default new AlmoxarifadoService();

