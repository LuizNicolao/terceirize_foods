import api from './api';

/**
 * Service para Registros Diários de Refeições
 */
class RegistrosDiariosService {
  /**
   * Listar registros diários com paginação
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/registros-diarios', { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar registros diários',
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
      const response = await api.get('/registros-diarios/export/xlsx', {
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
      const response = await api.get('/registros-diarios/export/pdf', {
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
   * Buscar registros de uma escola em uma data específica
   */
  static async buscarPorEscolaData(escolaId, data) {
    try {
      const response = await api.get('/registros-diarios/buscar', {
        params: { escola_id: escolaId, data }
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
      const response = await api.post('/registros-diarios', dados);
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
  static async excluir(escolaId, data) {
    try {
      const response = await api.delete('/registros-diarios', {
        data: { escola_id: escolaId, data }
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
   * Listar médias por escola com paginação
   */
  static async listarMedias(params = {}) {
    try {
      const {
        escola_id = null,
        page = 1,
        limit = 20,
        search = ''
      } = params;

      const queryParams = {
        page,
        limit
      };

      if (escola_id) {
        queryParams.escola_id = escola_id;
      }

      if (search && search.trim() !== '') {
        queryParams.search = search.trim();
      }

      const response = await api.get('/registros-diarios/medias', { params: queryParams });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar médias',
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Listar histórico completo de uma escola
   */
  static async listarHistorico(escolaId) {
    try {
      const response = await api.get('/registros-diarios/historico', {
        params: { escola_id: escolaId }
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
      const response = await api.get('/registros-diarios/estatisticas');
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
      const response = await api.get('/registros-diarios/modelo', {
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
      const response = await api.post('/registros-diarios/importar', formData, {
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

export default RegistrosDiariosService;

