import FoodsApiService from './FoodsApiService';

/**
 * Service para Produtos Origem
 * Busca produtos do sistema Foods para uso em recebimentos
 */
class ProdutosOrigemService {
  /**
   * Buscar produtos origem por grupo
   */
  static async buscarPorGrupo(grupoId) {
    try {
      const response = await FoodsApiService.getProdutosOrigem({
        grupo_id: grupoId,
        status: 1, // Apenas ativos
        limit: 1000 // Buscar todos os produtos do grupo
      });
      
      if (response.success) {
        return {
          success: true,
          data: response.data || [],
          message: 'Produtos origem carregados com sucesso'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erro ao carregar produtos origem',
          data: []
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos origem',
        data: []
      };
    }
  }

  /**
   * Buscar todos os produtos origem ativos
   */
  static async buscarTodos() {
    try {
      const response = await FoodsApiService.getProdutosOrigem({
        status: 1, // Apenas ativos
        limit: 1000 // Buscar todos os produtos ativos
      });
      
      if (response.success) {
        return {
          success: true,
          data: response.data || [],
          message: 'Produtos origem carregados com sucesso'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erro ao carregar produtos origem',
          data: []
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos origem',
        data: []
      };
    }
  }

  /**
   * Buscar grupos disponíveis
   */
  static async buscarGrupos() {
    try {
      const response = await FoodsApiService.getGruposAtivos({
        limit: 1000 // Buscar todos os grupos ativos
      });
      
      if (response.success) {
        return {
          success: true,
          data: response.data || [],
          message: 'Grupos carregados com sucesso'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erro ao carregar grupos',
          data: []
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar grupos',
        data: []
      };
    }
  }
}

export default ProdutosOrigemService;
