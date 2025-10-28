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
   * Aprovar substituição
   * @param {Number} id - ID da substituição
   */
  static async aprovarSubstituicao(id) {
    const response = await api.put(`/necessidades-substituicoes/${id}/aprovar`);
    return response.data;
  }

  /**
   * Rejeitar substituição
   * @param {Number} id - ID da substituição
   */
  static async rejeitarSubstituicao(id) {
    const response = await api.put(`/necessidades-substituicoes/${id}/rejeitar`);
    return response.data;
  }

  /**
   * Liberar para coordenação (mudar status para 'conf')
   * @param {Array} substituicaoIds - IDs das substituições
   */
  static async liberarParaCoordenacao(substituicaoIds) {
    const response = await api.put('/necessidades-substituicoes/liberar-coordenacao', {
      substituicao_ids: substituicaoIds
    });
    return response.data;
  }

  /**
   * Listar necessidades para nutricionista (status 'pendente')
   * @param {Object} filtros - Filtros: grupo, semana_abastecimento, semana_consumo
   */
  static async listarParaNutricionista(filtros) {
    const params = new URLSearchParams();
    
    if (filtros.grupo) params.append('grupo', filtros.grupo);
    if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
    if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);

    const response = await api.get(`/necessidades-substituicoes/nutricionista?${params.toString()}`);
    return response.data;
  }

  /**
   * Listar necessidades para coordenação (status 'conf')
   * @param {Object} filtros - Filtros: grupo, semana_abastecimento, semana_consumo
   */
  static async listarParaCoordenacao(filtros) {
    const params = new URLSearchParams();
    
    if (filtros.grupo) params.append('grupo', filtros.grupo);
    if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
    if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);

    const response = await api.get(`/necessidades-substituicoes/coordenacao?${params.toString()}`);
    return response.data;
  }

  /**
   * Exportar para PDF
   * @param {Array} necessidades - Dados das necessidades
   * @param {String} tipo - Tipo: 'nutricionista' ou 'coordenacao'
   */
  static async exportarPDF(necessidades, tipo = 'nutricionista') {
    const response = await api.post('/necessidades-substituicoes/exportar/pdf', {
      necessidades,
      tipo
    }, {
      responseType: 'blob'
    });
    return response;
  }

  /**
   * Exportar para XLSX
   * @param {Array} necessidades - Dados das necessidades
   * @param {String} tipo - Tipo: 'nutricionista' ou 'coordenacao'
   */
  static async exportarXLSX(necessidades, tipo = 'nutricionista') {
    const response = await api.post('/necessidades-substituicoes/exportar/xlsx', {
      necessidades,
      tipo
    }, {
      responseType: 'blob'
    });
    return response;
  }
}

export default SubstituicoesNecessidadesService;
