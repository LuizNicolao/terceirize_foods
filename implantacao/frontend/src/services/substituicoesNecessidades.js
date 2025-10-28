import api from './api';

/**
 * Service para substituições de necessidades
 * Comunicação com API de produtos genéricos e substituições
 */
class SubstituicoesNecessidadesService {
  /**
   * Listar necessidades para substituição
   * @param {Object} filtros - Filtros: grupo, semana_abastecimento, semana_consumo
   */
  static async listarParaSubstituicao(filtros) {
    const params = new URLSearchParams();
    
    if (filtros.grupo) params.append('grupo', filtros.grupo);
    if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
    if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);

    const response = await api.get(`/necessidades-substituicoes/listar?${params.toString()}`);
    return response.data;
  }

  /**
   * Buscar semana de consumo por semana de abastecimento
   * @param {String} semana_abastecimento - Semana de abastecimento
   */
  static async buscarSemanaConsumo(semana_abastecimento) {
    const response = await api.get(`/necessidades-substituicoes/buscar-semana-consumo?semana_abastecimento=${semana_abastecimento}`);
    return response.data;
  }

  /**
   * Buscar produtos genéricos do Foods
   * @param {Object} params - Parâmetros: produto_origem_id, search
   */
  static async buscarProdutosGenericos(params) {
    const queryParams = new URLSearchParams();
    
    if (params.produto_origem_id) queryParams.append('produto_origem_id', params.produto_origem_id);
    if (params.search) queryParams.append('search', params.search);

    const response = await api.get(`/necessidades-substituicoes/produtos-genericos?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Salvar substituição
   * @param {Object} dados - Dados da substituição
   */
  static async salvarSubstituicao(dados) {
    const response = await api.post('/necessidades-substituicoes', dados);
    return response.data;
  }

  /**
   * Deletar substituição
   * @param {Number} id - ID da substituição
   */
  static async deletarSubstituicao(id) {
    const response = await api.delete(`/necessidades-substituicoes/${id}`);
    return response.data;
  }

  /**
   * Liberar análise (conf → conf log)
   * @param {Object} dados - Dados: produto_origem_id, semana_abastecimento, semana_consumo
   */
  static async liberarAnalise(dados) {
    const response = await api.post('/necessidades-substituicoes/liberar-analise', dados);
    return response.data;
  }

  /**
   * Aprovar substituição (conf log → aprovado)
   * @param {Number} id - ID da substituição
   */
  static async aprovarSubstituicao(id) {
    const response = await api.put(`/necessidades-substituicoes/${id}/aprovar`);
    return response.data;
  }
}

export default SubstituicoesNecessidadesService;
