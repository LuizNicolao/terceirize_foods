import api from './api';

/**
 * Service para Tipo de Atendimento por Escola
 * Segue padrão de excelência do sistema
 */
class TipoAtendimentoEscolaService {
  /**
   * Listar vínculos com filtros e paginação
   */
  static async listar(filtros = {}) {
    try {
      const response = await api.get('/tipo-atendimento-escola', { params: filtros });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination || null,
        message: response.data.message || 'Vínculos carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar vínculos',
        data: [],
        pagination: null
      };
    }
  }

  /**
   * Buscar vínculo por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/tipo-atendimento-escola/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Vínculo encontrado'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar vínculo',
        data: null
      };
    }
  }

  /**
   * Criar novo vínculo
   */
  static async criar(dados) {
    try {
      const response = await api.post('/tipo-atendimento-escola', dados);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Vínculo criado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar vínculo',
        data: null
      };
    }
  }

  /**
   * Atualizar vínculo
   */
  static async atualizar(id, dados) {
    try {
      const response = await api.put(`/tipo-atendimento-escola/${id}`, dados);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Vínculo atualizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar vínculo',
        data: null
      };
    }
  }

  /**
   * Deletar vínculo
   */
  static async deletar(id) {
    try {
      const response = await api.delete(`/tipo-atendimento-escola/${id}`);
      return {
        success: true,
        message: response.data.message || 'Vínculo deletado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao deletar vínculo'
      };
    }
  }

  /**
   * Buscar tipos de atendimento por escola
   */
  static async buscarPorEscola(escola_id) {
    try {
      const response = await api.get(`/tipo-atendimento-escola/por-escola/${escola_id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Tipos de atendimento encontrados'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar tipos de atendimento',
        data: []
      };
    }
  }

  /**
   * Buscar escolas por tipo de atendimento
   */
  static async buscarEscolasPorTipo(tipo_atendimento) {
    try {
      const response = await api.get(`/tipo-atendimento-escola/por-tipo/${tipo_atendimento}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Escolas encontradas'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar escolas',
        data: []
      };
    }
  }
}

export default TipoAtendimentoEscolaService;

