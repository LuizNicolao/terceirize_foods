/**
 * Service para Produto Origem
 * Gerencia todas as operações de API relacionadas a produtos origem
 */

import api from '../utils/api';

class ProdutoOrigemService {
  /**
   * Listar produtos origem com paginação e filtros
   */
  static async listarProdutosOrigem(params = {}) {
    const response = await api.get('/produto-origem', { params });
    return response.data;
  }

  /**
   * Buscar produto origem por ID
   */
  static async buscarProdutoOrigemPorId(id) {
    const response = await api.get(`/produto-origem/${id}`);
    return response.data;
  }

  /**
   * Criar novo produto origem
   */
  static async criarProdutoOrigem(data) {
    const response = await api.post('/produto-origem', data);
    return response.data;
  }

  /**
   * Atualizar produto origem
   */
  static async atualizarProdutoOrigem(id, data) {
    const response = await api.put(`/produto-origem/${id}`, data);
    return response.data;
  }

  /**
   * Excluir produto origem
   */
  static async excluirProdutoOrigem(id) {
    const response = await api.delete(`/produto-origem/${id}`);
    return response.data;
  }

  /**
   * Buscar produtos origem por grupo
   */
  static async buscarProdutosOrigemPorGrupo(grupoId) {
    const response = await api.get(`/produto-origem/grupo/${grupoId}`);
    return response.data;
  }

  /**
   * Buscar produtos origem por subgrupo
   */
  static async buscarProdutosOrigemPorSubgrupo(subgrupoId) {
    const response = await api.get(`/produto-origem/subgrupo/${subgrupoId}`);
    return response.data;
  }

  /**
   * Buscar produtos origem por classe
   */
  static async buscarProdutosOrigemPorClasse(classeId) {
    const response = await api.get(`/produto-origem/classe/${classeId}`);
    return response.data;
  }

  /**
   * Buscar produtos origem ativos
   */
  static async buscarProdutosOrigemAtivos() {
    const response = await api.get('/produto-origem/ativos');
    return response.data;
  }

  /**
   * Buscar produto origem por código
   */
  static async buscarProdutoOrigemPorCodigo(codigo) {
    const response = await api.get(`/produto-origem/codigo/${codigo}`);
    return response.data;
  }

  /**
   * Listar grupos disponíveis
   */
  static async listarGrupos() {
    const response = await api.get('/produto-origem/grupos');
    return response.data;
  }

  /**
   * Listar subgrupos disponíveis
   */
  static async listarSubgrupos() {
    const response = await api.get('/produto-origem/subgrupos');
    return response.data;
  }

  /**
   * Listar classes disponíveis
   */
  static async listarClasses() {
    const response = await api.get('/produto-origem/classes');
    return response.data;
  }

  /**
   * Listar unidades de medida disponíveis
   */
  static async listarUnidadesMedida() {
    const response = await api.get('/produto-origem/unidades-medida');
    return response.data;
  }

  /**
   * Listar produtos genéricos padrão disponíveis
   */
  static async listarProdutosGenericosPadrao() {
    const response = await api.get('/produto-origem/produtos-genericos-padrao');
    return response.data;
  }

  /**
   * Exportar dados para XLSX
   */
  static async exportarXLSX(params = {}) {
    const response = await api.get('/produto-origem/export/xlsx', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Exportar dados para PDF
   */
  static async exportarPDF(params = {}) {
    const response = await api.get('/produto-origem/export/pdf', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  // ===== MÉTODOS DE BUSCA AVANÇADA =====

  /**
   * Busca avançada
   */
  static async buscaAvancada(params = {}) {
    const response = await api.get('/produto-origem/busca/avancada', { params });
    return response.data;
  }

  /**
   * Busca por similaridade
   */
  static async buscarPorSimilaridade(nome, limit = 10) {
    const response = await api.get('/produto-origem/busca/similaridade', { 
      params: { nome, limit } 
    });
    return response.data;
  }

  /**
   * Busca por código
   */
  static async buscarPorCodigo(codigo, exact = false) {
    const response = await api.get('/produto-origem/busca/codigo', { 
      params: { codigo, exact } 
    });
    return response.data;
  }

  /**
   * Buscar produtos sem classificação
   */
  static async buscarSemClassificacao(params = {}) {
    const response = await api.get('/produto-origem/busca/sem-classificacao', { params });
    return response.data;
  }

  // ===== MÉTODOS DE ESTATÍSTICAS =====

  /**
   * Estatísticas gerais
   */
  static async estatisticasGerais() {
    const response = await api.get('/produto-origem/stats/gerais');
    return response.data;
  }

  /**
   * Estatísticas por grupo
   */
  static async estatisticasPorGrupo() {
    const response = await api.get('/produto-origem/stats/grupo');
    return response.data;
  }

  /**
   * Estatísticas por subgrupo
   */
  static async estatisticasPorSubgrupo() {
    const response = await api.get('/produto-origem/stats/subgrupo');
    return response.data;
  }

  /**
   * Estatísticas por classe
   */
  static async estatisticasPorClasse() {
    const response = await api.get('/produto-origem/stats/classe');
    return response.data;
  }

  /**
   * Estatísticas por unidade de medida
   */
  static async estatisticasPorUnidadeMedida() {
    const response = await api.get('/produto-origem/stats/unidade-medida');
    return response.data;
  }

  /**
   * Produtos mais recentes
   */
  static async produtosRecentes(limit = 10) {
    const response = await api.get('/produto-origem/stats/recentes', { 
      params: { limit } 
    });
    return response.data;
  }

  /**
   * Produtos mais atualizados
   */
  static async produtosMaisAtualizados(limit = 10) {
    const response = await api.get('/produto-origem/stats/atualizados', { 
      params: { limit } 
    });
    return response.data;
  }

  /**
   * Relatório sem classificação
   */
  static async relatorioSemClassificacao() {
    const response = await api.get('/produto-origem/stats/sem-classificacao');
    return response.data;
  }

  /**
   * Distribuição por fator de conversão
   */
  static async distribuicaoFatorConversao() {
    const response = await api.get('/produto-origem/stats/fator-conversao');
    return response.data;
  }

  /**
   * Distribuição por peso líquido
   */
  static async distribuicaoPesoLiquido() {
    const response = await api.get('/produto-origem/stats/peso-liquido');
    return response.data;
  }
}

export default ProdutoOrigemService;
