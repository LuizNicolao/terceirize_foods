/**
 * Service para produtos
 * Utiliza o FoodsApiService para buscar dados do sistema Foods
 */
import FoodsApiService from './FoodsApiService';

const produtosService = {
  /**
   * Buscar produtos (Produtos Origem do Foods)
   */
  listar: async (params = {}) => {
    return await FoodsApiService.getProdutosOrigem(params);
  },

  /**
   * Buscar produtos ativos
   */
  listarAtivos: async (params = {}) => {
    return await FoodsApiService.getProdutosOrigemAtivos(params);
  },

  /**
   * Buscar produto por ID
   */
  buscarPorId: async (id) => {
    return await FoodsApiService.getProdutoOrigemById(id);
  },

  /**
   * Buscar produtos por grupo
   */
  buscarPorGrupo: async (grupoId) => {
    return await FoodsApiService.getProdutosOrigem({ grupo_id: grupoId, ativo: true });
  }
};

export default produtosService;

