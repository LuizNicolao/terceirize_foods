import api from './api';
import FoodsApiService from './FoodsApiService';

/**
 * Service para Produtos Per Capita
 * Segue padrão de excelência do sistema
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
        message: response.data.message || 'Produtos per capita carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos per capita',
        data: [],
        pagination: null
      };
    }
  }

  /**
   * Buscar produto per capita por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/produtos-per-capita/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto per capita encontrado'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produto per capita',
        data: null
      };
    }
  }

  /**
   * Criar novo produto per capita
   */
  static async criar(dados) {
    try {
      const response = await api.post('/produtos-per-capita', dados);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto per capita criado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar produto per capita',
        data: null
      };
    }
  }

  /**
   * Atualizar produto per capita
   */
  static async atualizar(id, dados) {
    try {
      const response = await api.put(`/produtos-per-capita/${id}`, dados);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto per capita atualizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar produto per capita',
        data: null
      };
    }
  }

  /**
   * Excluir produto per capita
   */
  static async excluir(id) {
    try {
      const response = await api.delete(`/produtos-per-capita/${id}`);
      return {
        success: true,
        message: response.data.message || 'Produto per capita excluído com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir produto per capita'
      };
    }
  }

  /**
   * Buscar produtos disponíveis para per capita
   * Busca produtos do Foods que NÃO têm percapita cadastrado
   */
  static async buscarProdutosDisponiveis(filtros = {}) {
    try {
      // Primeiro, buscar IDs de produtos que já têm percapita cadastrado
      const response = await api.get('/produtos-per-capita/produtos-disponiveis');
      
      if (!response.data.success) {
        return {
          success: false,
          error: response.data.error || 'Erro ao buscar produtos disponíveis',
          data: []
        };
      }
      
      const idsComPercapita = response.data.data.produtos_com_percapita || [];
      
      // Buscar todos os produtos do Foods
      const result = await FoodsApiService.getProdutosOrigem({ 
        status: 1, // Apenas ativos
        limit: 1000 // Buscar todos os produtos ativos
      });
      
      if (result.success) {
        // Filtrar produtos que NÃO têm percapita cadastrado
        const produtosDisponiveis = (result.data || []).filter(produto => 
          !idsComPercapita.includes(produto.id)
        );
        
        return {
          success: true,
          data: produtosDisponiveis,
          message: `${produtosDisponiveis.length} produtos disponíveis para per capita`
        };
      } else {
        return {
          success: false,
          error: result.error || 'Erro ao carregar produtos origem',
          data: []
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos disponíveis',
        data: []
      };
    }
  }

  /**
   * Buscar produtos per capita por produtos específicos
   */
  static async buscarPorProdutos(produtoIds) {
    try {
      const response = await api.post('/produtos-per-capita/buscar-por-produtos', { produto_ids: produtoIds });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produtos per capita encontrados'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produtos per capita',
        data: []
      };
    }
  }

  /**
   * Obter estatísticas
   */
  static async obterEstatisticas() {
    try {
      const response = await api.get('/produtos-per-capita/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Estatísticas carregadas com sucesso'
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
   * Obter resumo por período
   */
  static async obterResumoPorPeriodo() {
    try {
      const response = await api.get('/produtos-per-capita/resumo-por-periodo');
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Resumo por período carregado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar resumo por período',
        data: []
      };
    }
  }

  /**
   * Obter dados para exportação
   */
  static async obterDadosExportacao(format = 'xlsx') {
    try {
      const response = await api.get('/produtos-per-capita/estatisticas-exportacao', { params: { format } });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Dados para exportação carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar dados para exportação',
        data: null
      };
    }
  }
}

export default ProdutosPerCapitaService;
