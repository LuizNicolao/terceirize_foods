import api from './api';

/**
 * Service para Quantidades Servidas (Cozinha Industrial)
 * Sistema de registros diários com períodos de atendimento dinâmicos
 */
class QuantidadesServidasService {
  /**
   * Listar registros diários com paginação
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/quantidades-servidas', { params });
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
      
      return {
        success: true,
        data: items,
        pagination: paginationData,
        periodos: responseData.periodos || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar quantidades servidas',
        data: [],
        pagination: null
      };
    }
  }

  /**
   * Exportar registros diários em XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/quantidades-servidas/export/xlsx', {
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
   * Exportar registros diários em PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/quantidades-servidas/export/pdf', {
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

  /**
   * Buscar registros de uma unidade em uma data específica
   */
  static async buscarPorUnidadeData(unidadeId, data) {
    try {
      const response = await api.get('/quantidades-servidas/buscar', {
        params: { unidade_id: unidadeId, data }
      });
      return {
        success: true,
        data: response.data.data || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar registros',
        data: null
      };
    }
  }

  /**
   * Criar/atualizar registros diários
   */
  static async criar(dados) {
    try {
      const response = await api.post('/quantidades-servidas', dados);
      return {
        success: true,
        data: response.data.data || null,
        message: response.data.message || 'Registros salvos com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao salvar registros',
        errors: error.response?.data?.errors || null
      };
    }
  }

  /**
   * Excluir registros de uma data
   */
  static async excluir(unidadeId, data) {
    try {
      const response = await api.delete('/quantidades-servidas', {
        data: { unidade_id: unidadeId, data }
      });
      return {
        success: true,
        message: response.data.message || 'Registros excluídos com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir registros'
      };
    }
  }

  /**
   * Listar médias por unidade
   */
  static async listarMedias(unidadeId = null) {
    try {
      const params = unidadeId ? { unidade_id: unidadeId } : {};
      const response = await api.get('/quantidades-servidas/medias', { params });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar médias',
        data: []
      };
    }
  }

  /**
   * Listar histórico completo de uma unidade
   */
  static async listarHistorico(unidadeId) {
    try {
      const response = await api.get('/quantidades-servidas/historico', {
        params: { unidade_id: unidadeId }
      });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar histórico',
        data: []
      };
    }
  }

  /**
   * Obter estatísticas
   */
  static async obterEstatisticas() {
    try {
      const response = await api.get('/quantidades-servidas/estatisticas');
      return {
        success: true,
        data: response.data.data || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter estatísticas',
        data: {}
      };
    }
  }

  /**
   * Baixar modelo de planilha para importação
   */
  static async baixarModelo() {
    try {
      const response = await api.get('/quantidades-servidas/modelo', {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao baixar modelo'
      };
    }
  }

  /**
   * Importar registros diários via Excel
   */
  static async importar(formData) {
    try {
      const response = await api.post('/quantidades-servidas/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data.data || null,
        message: response.data.message || 'Importação realizada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro na importação',
        data: error.response?.data?.data || null
      };
    }
  }
}

export default QuantidadesServidasService;

