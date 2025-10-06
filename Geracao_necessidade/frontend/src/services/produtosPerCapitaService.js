import api from './api';

/**
 * Service para Produtos Per Capita
 * Segue o padrão de excelência do Dashboard
 */
class ProdutosPerCapitaService {
  /**
   * Listar produtos per capita com filtros e paginação
   */
  static async listar(filtros = {}) {
    try {
      const response = await api.get('/produtos-per-capita', { params: filtros });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination || null,
        message: response.data.message || 'Produtos carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos',
        data: [],
        pagination: null
      };
    }
  }

  /**
   * Buscar produto por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/produtos-per-capita/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto encontrado'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produto',
        data: null
      };
    }
  }

  /**
   * Criar novo produto
   */
  static async criar(dados) {
    try {
      const response = await api.post('/produtos-per-capita', dados);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto criado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar produto',
        data: null
      };
    }
  }

  /**
   * Atualizar produto existente
   */
  static async atualizar(id, dados) {
    try {
      const response = await api.put(`/produtos-per-capita/${id}`, dados);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto atualizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar produto',
        data: null
      };
    }
  }

  /**
   * Deletar produto
   */
  static async deletar(id) {
    try {
      const response = await api.delete(`/produtos-per-capita/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto excluído com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir produto',
        data: null
      };
    }
  }

  /**
   * Listar produtos disponíveis para seleção (apenas os que não têm per capita)
   */
  static async listarProdutosDisponiveis(incluirProdutoId = null) {
    try {
      const params = incluirProdutoId ? { incluir_produto_id: incluirProdutoId } : {};
      const response = await api.get('/produtos-per-capita/produtos-disponiveis', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produtos disponíveis carregados'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos disponíveis',
        data: []
      };
    }
  }

  /**
   * Listar TODOS os produtos ativos (incluindo os que já têm per capita)
   */
  static async listarTodosProdutos() {
    try {
      const response = await api.get('/produtos-per-capita/todos-produtos');
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Todos os produtos carregados'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar todos os produtos',
        data: []
      };
    }
  }

  /**
   * Obter estatísticas dos produtos
   */
  static async obterEstatisticas(filtros = {}) {
    try {
      const response = await api.get('/produtos-per-capita/stats/estatisticas', { params: filtros });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Estatísticas carregadas'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar estatísticas',
        data: {}
      };
    }
  }

  /**
   * Obter resumo dos produtos
   */
  static async obterResumo(filtros = {}) {
    try {
      const response = await api.get('/produtos-per-capita/stats/resumo', { params: filtros });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Resumo carregado'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar resumo',
        data: {}
      };
    }
  }

  /**
   * Buscar produtos por múltiplos IDs
   */
  static async buscarPorProdutos(produtoIds) {
    try {
      const response = await api.post('/produtos-per-capita/buscar-por-produtos', { produto_ids: produtoIds });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produtos encontrados'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produtos',
        data: []
      };
    }
  }
}

export default ProdutosPerCapitaService;
