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
   * Listar médias por escola
   */
  static async listarMedias(escolaId = null) {
    try {
      const params = escolaId ? { escola_id: escolaId } : {};
      const response = await api.get('/registros-diarios/medias', { params });
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
}

export default RegistrosDiariosService;

