import api from './api';

class NecessidadesPadroesService {
  /**
   * Listar padrões com paginação e filtros
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/necessidades-padroes', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar padrões:', error);
      throw error;
    }
  }

  /**
   * Buscar padrão por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/necessidades-padroes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar padrão:', error);
      throw error;
    }
  }

  /**
   * Buscar padrões por escola e grupo
   */
  static async buscarPorEscolaGrupo(escola_id, grupo_id) {
    try {
      const response = await api.get(`/necessidades-padroes/escola/${escola_id}/grupo/${grupo_id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar padrões por escola e grupo:', error);
      throw error;
    }
  }

  /**
   * Criar novo padrão
   */
  static async criar(dados) {
    try {
      const response = await api.post('/necessidades-padroes', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar padrão:', error);
      throw error;
    }
  }

  /**
   * Atualizar padrão
   */
  static async atualizar(id, dados) {
    try {
      const response = await api.put(`/necessidades-padroes/${id}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar padrão:', error);
      throw error;
    }
  }

  /**
   * Excluir padrão
   */
  static async excluir(id) {
    try {
      const response = await api.delete(`/necessidades-padroes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir padrão:', error);
      throw error;
    }
  }

  /**
   * Salvar padrão completo (múltiplos produtos)
   */
  static async salvarPadrao(dados) {
    try {
      const response = await api.post('/necessidades-padroes/salvar-padrao', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar padrão:', error);
      throw error;
    }
  }

  /**
   * Gerar necessidades padrão a partir de necessidades_substituicoes
   */
  static async gerarNecessidadesPadrao(dados) {
    try {
      const response = await api.post('/necessidades-padroes/gerar-necessidades', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar necessidades padrão:', error);
      throw error;
    }
  }

  /**
   * Buscar semana de consumo por semana de abastecimento
   */
  static async buscarSemanaConsumoPorAbastecimento(semana_abastecimento) {
    try {
      const response = await api.get('/necessidades-padroes/buscar-semana-consumo', {
        params: { semana_abastecimento }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar semana de consumo:', error);
      throw error;
    }
  }
}

export default NecessidadesPadroesService;
