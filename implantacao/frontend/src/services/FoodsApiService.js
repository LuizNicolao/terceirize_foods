import axios from 'axios';

const getFoodsConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return {
    baseURL: isDevelopment ? 'http://localhost:3001/api' : 'https://foods.terceirizemais.com.br/foods/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

const foodsApi = axios.create(getFoodsConfig());

foodsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

foodsApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/implantacao/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Classe unificada para gerenciar consultas ao sistema Foods
 * Centraliza todas as operações de consulta (read-only) para diferentes entidades
 */
class FoodsApiService {
  /**
   * Verificar conectividade com o sistema Foods
   */
  static async checkConnection() {
    try {
      const response = await foodsApi.get('/dashboard/stats', { timeout: 3000 });
      
      return {
        success: true,
        connected: true,
        message: 'Conexão com Foods estabelecida'
      };
    } catch (error) {
      return {
        success: false,
        connected: false,
        message: 'Falha na conexão com Foods',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * ==================== FORNECEDORES ====================
   */
  
  /**
   * Consultar fornecedores do sistema Foods
   */
  static async getFornecedores(params = {}) {
    try {
      const response = await foodsApi.get('/fornecedores', { params });
      
      // Garantir que data seja sempre um array
      let fornecedoresData = response.data.data || response.data;
      if (fornecedoresData && fornecedoresData.items && Array.isArray(fornecedoresData.items)) {
        fornecedoresData = fornecedoresData.items;
      }
      
      const arrayData = Array.isArray(fornecedoresData) ? fornecedoresData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.pagination || null,
        message: 'Fornecedores consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar fornecedores',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar fornecedor por ID
   */
  static async getFornecedorById(id) {
    try {
      const response = await foodsApi.get(`/fornecedores/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Fornecedor consultado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar fornecedor',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar fornecedores ativos
   */
  static async getFornecedoresAtivos(params = {}) {
    try {
      const response = await foodsApi.get('/fornecedores/ativos', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Fornecedores ativos consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erro ao consultar fornecedores ativos',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de fornecedores
   */
  static async getFornecedoresStats() {
    try {
      const response = await foodsApi.get('/fornecedores/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar estatísticas',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * ==================== UNIDADES ESCOLARES ====================
   */
  
  /**
   * Consultar unidades escolares do sistema Foods
   */
  static async getUnidadesEscolares(params = {}) {
    try {
      const response = await foodsApi.get('/unidades-escolares', { params });
      
      // Garantir que data seja sempre um array
      let unidadesData = response.data.data || response.data;
      if (unidadesData && unidadesData.items && Array.isArray(unidadesData.items)) {
        unidadesData = unidadesData.items;
      }
      
      const arrayData = Array.isArray(unidadesData) ? unidadesData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.pagination || null,
        message: 'Unidades escolares consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar unidades escolares',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar unidade escolar por ID
   */
  static async getUnidadeEscolarById(id) {
    try {
      const response = await foodsApi.get(`/unidades-escolares/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Unidade escolar consultada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar unidade escolar',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar unidades escolares ativas
   */
  static async getUnidadesEscolaresAtivas(params = {}) {
    try {
      const response = await foodsApi.get('/unidades-escolares/ativas', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Unidades escolares ativas consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erro ao consultar unidades escolares ativas',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de unidades escolares
   */
  static async getUnidadesEscolaresStats() {
    try {
      const response = await foodsApi.get('/unidades-escolares/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar estatísticas',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * ==================== PRODUTOS ORIGEM ====================
   */
  
  /**
   * Consultar produtos origem do sistema Foods
   */
  static async getProdutosOrigem(params = {}) {
    try {
      const response = await foodsApi.get('/produto-origem', { params });
      
      let produtosData = response.data.data || response.data;
      if (produtosData && produtosData.items && Array.isArray(produtosData.items)) {
        produtosData = produtosData.items;
      }
      
      const arrayData = Array.isArray(produtosData) ? produtosData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.pagination || null,
        message: 'Produtos origem consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar produtos origem',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar produto origem por ID
   */
  static async getProdutoOrigemById(id) {
    try {
      const response = await foodsApi.get(`/produto-origem/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Produto origem encontrado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar produto origem',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de produtos origem
   */
  static async getProdutosOrigemStats() {
    try {
      const response = await foodsApi.get('/produto-origem/estatisticas');
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas de produtos origem obtidas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas de produtos origem',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar produtos origem ativos
   */
  static async getProdutosOrigemAtivos(params = {}) {
    try {
      const response = await foodsApi.get('/produto-origem/ativos', { params });
      
      let produtosData = response.data.data || response.data;
      if (produtosData && produtosData.items && Array.isArray(produtosData.items)) {
        produtosData = produtosData.items;
      }
      
      const arrayData = Array.isArray(produtosData) ? produtosData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.pagination || null,
        message: 'Produtos origem ativos consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar produtos origem ativos',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * ==================== FILIAIS ====================
   */
  
  /**
   * Consultar filiais do sistema Foods
   */
  static async getFiliais(params = {}) {
    try {
      const response = await foodsApi.get('/filiais', { params });
      
      let filiaisData = response.data.data || response.data;
      if (filiaisData && filiaisData.items && Array.isArray(filiaisData.items)) {
        filiaisData = filiaisData.items;
      }
      
      const arrayData = Array.isArray(filiaisData) ? filiaisData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.pagination || null,
        message: 'Filiais consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar filiais',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar filial por ID
   */
  static async getFilialById(id) {
    try {
      const response = await foodsApi.get(`/filiais/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Filial consultada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar filial',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * ==================== ROTAS ====================
   */
  
  /**
   * Consultar rotas do sistema Foods
   */
  static async getRotas(params = {}) {
    try {
      const response = await foodsApi.get('/rotas', { params });
      
      let rotasData = response.data.data || response.data;
      if (rotasData && rotasData.items && Array.isArray(rotasData.items)) {
        rotasData = rotasData.items;
      }
      
      const arrayData = Array.isArray(rotasData) ? rotasData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.pagination || null,
        message: 'Rotas consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar rotas',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar rotas ativas (para dropdowns)
   */
  static async getRotasAtivas() {
    try {
      const response = await foodsApi.get('/rotas', { 
        params: { status: 'ativo', limit: 1000 } 
      });
      
      let rotasData = response.data.data || response.data;
      if (rotasData && rotasData.items && Array.isArray(rotasData.items)) {
        rotasData = rotasData.items;
      }
      
      const arrayData = Array.isArray(rotasData) ? rotasData : [];
      
      return {
        success: true,
        data: arrayData,
        message: 'Rotas ativas consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erro ao consultar rotas ativas',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * ==================== ROTAS NUTRICIONISTAS ====================
   */
  
  /**
   * Consultar rotas nutricionistas do sistema Foods
   */
  static async getRotasNutricionistas(params = {}) {
    try {
      const response = await foodsApi.get('/rotas-nutricionistas', { params });
      
      // Formato do Foods: { success: true, data: { rotas: [...], pagination: {...} } }
      let rotasData = response.data.data?.rotas || response.data.rotas || response.data.data || response.data;
      
      // Se ainda vier com items (formato antigo)
      if (rotasData && rotasData.items && Array.isArray(rotasData.items)) {
        rotasData = rotasData.items;
      }
      
      const arrayData = Array.isArray(rotasData) ? rotasData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.data?.pagination || response.data.pagination || null,
        message: 'Rotas nutricionistas consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar rotas nutricionistas',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar rota nutricionista por ID
   */
  static async getRotaNutricionistaById(id) {
    try {
      const response = await foodsApi.get(`/rotas-nutricionistas/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Rota nutricionista consultada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar rota nutricionista',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar rotas nutricionistas ativas
   */
  static async getRotasNutricionistasAtivas(params = {}) {
    try {
      const response = await foodsApi.get('/rotas-nutricionistas/ativas', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Rotas nutricionistas ativas consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erro ao consultar rotas nutricionistas ativas',
        error: error.response?.data || error.message
      };
    }
  }

  // ===== FILIAIS =====

  /**
   * Buscar filiais com paginação e filtros
   */
  static async getFiliais(params = {}) {
    try {
      const response = await foodsApi.get('/filiais', { params });
      return {
        success: true,
        data: response.data,
        message: 'Filiais consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar filiais',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar filial por ID
   */
  static async getFilialById(id) {
    try {
      const response = await foodsApi.get(`/filiais/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Filial encontrada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar filial',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de filiais
   */
  static async getFiliaisStats() {
    try {
      const response = await foodsApi.get('/filiais/estatisticas');
      return {
        success: true,
        data: response.data,
        message: 'Estatísticas de filiais consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar estatísticas',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar filiais ativas (para dropdowns)
   */
  static async getFiliaisAtivas() {
    try {
      const response = await foodsApi.get('/filiais', { 
        params: { status: 'ativo', limit: 1000 } 
      });
      return {
        success: true,
        data: response.data?.items || response.data?.data || response.data,
        message: 'Filiais ativas consultadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erro ao consultar filiais ativas',
        error: error.response?.data || error.message
      };
    }
  }

  // ===== ALMOXARIFADOS =====

  /**
   * Listar almoxarifados de uma filial
   */
  static async getAlmoxarifados(filialId) {
    try {
      const response = await foodsApi.get(`/filiais/${filialId}/almoxarifados`);
      return {
        success: true,
        data: response.data?.items || response.data?.data || response.data,
        message: 'Almoxarifados consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erro ao consultar almoxarifados',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Criar almoxarifado
   */
  static async criarAlmoxarifado(filialId, payload) {
    try {
      const response = await foodsApi.post(`/filiais/${filialId}/almoxarifados`, payload);
      return {
        success: true,
        data: response.data,
        message: 'Almoxarifado criado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao criar almoxarifado',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Atualizar almoxarifado
   */
  static async atualizarAlmoxarifado(almoxarifadoId, payload) {
    try {
      const response = await foodsApi.put(`/filiais/almoxarifados/${almoxarifadoId}`, payload);
      return {
        success: true,
        data: response.data,
        message: 'Almoxarifado atualizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao atualizar almoxarifado',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Excluir almoxarifado
   */
  static async excluirAlmoxarifado(almoxarifadoId) {
    try {
      const response = await foodsApi.delete(`/filiais/almoxarifados/${almoxarifadoId}`);
      return {
        success: true,
        data: response.data,
        message: 'Almoxarifado excluído com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao excluir almoxarifado',
        error: error.response?.data || error.message
      };
    }
  }

  // ==================== UNIDADES DE MEDIDA ====================

  /**
   * Buscar unidades de medida
   */
  static async getUnidadesMedida(params = {}) {
    try {
      const response = await foodsApi.get('/unidades', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination,
        message: 'Unidades de medida carregadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao carregar unidades de medida',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar unidade de medida por ID
   */
  static async getUnidadeMedidaById(id) {
    try {
      const response = await foodsApi.get(`/unidades/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Unidade de medida encontrada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar unidade de medida',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de unidades de medida
   */
  static async getUnidadesMedidaStats() {
    try {
      const response = await foodsApi.get('/unidades/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas de unidades de medida obtidas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas de unidades de medida',
        error: error.response?.data || error.message
      };
    }
  }

  // ==================== GRUPOS ====================

  /**
   * Buscar grupos
   */
  static async getGrupos(params = {}) {
    try {
      const response = await foodsApi.get('/grupos', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination,
        message: 'Grupos carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao carregar grupos',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar grupo por ID
   */
  static async getGrupoById(id) {
    try {
      const response = await foodsApi.get(`/grupos/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Grupo encontrado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar grupo',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar grupos ativos
   */
  static async getGruposAtivos(params = {}) {
    try {
      const response = await foodsApi.get('/grupos/ativos', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination,
        message: 'Grupos ativos carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao carregar grupos ativos',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de grupos
   */
  static async getGruposStats() {
    try {
      const response = await foodsApi.get('/grupos/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas de grupos obtidas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas de grupos',
        error: error.response?.data || error.message
      };
    }
  }

  // ==================== SUBGRUPOS ====================

  /**
   * Buscar subgrupos
   */
  static async getSubgrupos(params = {}) {
    try {
      const response = await foodsApi.get('/subgrupos', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination,
        message: 'Subgrupos carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao carregar subgrupos',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar subgrupo por ID
   */
  static async getSubgrupoById(id) {
    try {
      const response = await foodsApi.get(`/subgrupos/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Subgrupo encontrado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar subgrupo',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de subgrupos
   */
  static async getSubgruposStats() {
    try {
      const response = await foodsApi.get('/subgrupos/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas de subgrupos obtidas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas de subgrupos',
        error: error.response?.data || error.message
      };
    }
  }

  // ==================== CLASSES ====================

  /**
   * Buscar classes
   */
  static async getClasses(params = {}) {
    try {
      const response = await foodsApi.get('/classes', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination,
        message: 'Classes carregadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao carregar classes',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar classe por ID
   */
  static async getClasseById(id) {
    try {
      const response = await foodsApi.get(`/classes/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Classe encontrada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar classe',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de classes
   */
  static async getClassesStats() {
    try {
      const response = await foodsApi.get('/classes/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas de classes obtidas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas de classes',
        error: error.response?.data || error.message
      };
    }
  }

}

export default FoodsApiService;
