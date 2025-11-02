import api from './api';

/**
 * Service para substituições de necessidades
 * Comunicação com API de produtos genéricos e substituições
 */
class SubstituicoesNecessidadesService {
  /**
   * Listar necessidades para substituição (Nutricionista)
   * @param {Object} filtros - Filtros: grupo, semana_abastecimento, semana_consumo, tipo_rota_id
   */
  static async listarParaSubstituicao(filtros) {
    const params = new URLSearchParams();
    
    if (filtros.grupo) params.append('grupo', filtros.grupo);
    if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
    if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);
    if (filtros.tipo_rota_id) params.append('tipo_rota_id', filtros.tipo_rota_id);
    if (filtros.rota_id) params.append('rota_id', filtros.rota_id);

    const response = await api.get(`/necessidades-substituicoes/listar?${params.toString()}`);
    return response.data;
  }

  /**
   * Listar necessidades para coordenação (status conf log)
   * @param {Object} filtros - Filtros: grupo, semana_abastecimento, semana_consumo, tipo_rota_id
   */
  static async listarParaCoordenacao(filtros) {
    const params = new URLSearchParams();
    
    if (filtros.grupo) params.append('grupo', filtros.grupo);
    if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
    if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);
    if (filtros.tipo_rota_id) params.append('tipo_rota_id', filtros.tipo_rota_id);
    if (filtros.rota_id) params.append('rota_id', filtros.rota_id);

    const response = await api.get(`/necessidades-substituicoes/listar-coordenacao?${params.toString()}`);
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
   * Buscar grupos disponíveis para substituição
   * @param {String} aba - 'nutricionista' ou 'coordenacao'
   * @param {String|Number} tipoRotaId - ID do tipo de rota (opcional)
   */
  static async buscarGruposDisponiveis(aba = 'nutricionista', tipoRotaId = null) {
    const params = new URLSearchParams();
    if (aba) params.append('aba', aba);
    if (tipoRotaId) params.append('tipo_rota_id', tipoRotaId);
    const response = await api.get(`/necessidades-substituicoes/grupos-disponiveis?${params.toString()}`);
    return response.data;
  }

  /**
   * Buscar semanas de abastecimento disponíveis para substituição
   * @param {String} aba - 'nutricionista' ou 'coordenacao'
   */
  static async buscarSemanasAbastecimentoDisponiveis(aba = 'nutricionista') {
    const params = new URLSearchParams();
    if (aba) params.append('aba', aba);
    const response = await api.get(`/necessidades-substituicoes/semanas-abastecimento-disponiveis?${params.toString()}`);
    return response.data;
  }

  /**
   * Buscar tipos de rota disponíveis
   * @param {String} aba - 'nutricionista' ou 'coordenacao'
   */
  static async buscarTiposRotaDisponiveis(aba = 'nutricionista') {
    const params = new URLSearchParams();
    if (aba) params.append('aba', aba);
    const response = await api.get(`/necessidades-substituicoes/tipos-rota-disponiveis?${params.toString()}`);
    return response.data;
  }

  /**
   * Buscar rotas disponíveis
   * @param {String} aba - 'nutricionista' ou 'coordenacao'
   */
  static async buscarRotasDisponiveis(aba = 'nutricionista') {
    const params = new URLSearchParams();
    if (aba) params.append('aba', aba);
    const response = await api.get(`/necessidades-substituicoes/rotas-disponiveis?${params.toString()}`);
    return response.data;
  }
}

export default SubstituicoesNecessidadesService;
