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
      window.location.href = '/cozinha_industrial/login';
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
   * ==================== CLIENTES ====================
   */
  
  /**
   * Consultar clientes do sistema Foods
   */
  static async getClientes(params = {}) {
    try {
      const response = await foodsApi.get('/clientes', { params });
      
      let clientesData = response.data.data || response.data;
      if (clientesData && clientesData.items && Array.isArray(clientesData.items)) {
        clientesData = clientesData.items;
      }
      
      const arrayData = Array.isArray(clientesData) ? clientesData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.pagination || response.data._meta?.pagination || null,
        message: 'Clientes consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar clientes',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar cliente por ID
   */
  static async getClienteById(id) {
    try {
      const response = await foodsApi.get(`/clientes/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Cliente consultado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar cliente',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar clientes ativos
   */
  static async getClientesAtivos(params = {}) {
    try {
      const response = await foodsApi.get('/clientes', { 
        params: { ...params, status: 1 } 
      });
      
      let clientesData = response.data.data || response.data;
      if (clientesData && clientesData.items && Array.isArray(clientesData.items)) {
        clientesData = clientesData.items;
      }
      
      const arrayData = Array.isArray(clientesData) ? clientesData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.pagination || response.data._meta?.pagination || null,
        message: 'Clientes ativos consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar clientes ativos',
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
   * ==================== PRODUTOS GENÉRICOS ====================
   */
  
  /**
   * Consultar produtos genéricos do sistema Foods
   */
  static async getProdutosGenericos(params = {}) {
    try {
      const response = await foodsApi.get('/produto-generico', { params });
      
      let produtosData = response.data.data || response.data;
      if (produtosData && produtosData.items && Array.isArray(produtosData.items)) {
        produtosData = produtosData.items;
      }
      
      const arrayData = Array.isArray(produtosData) ? produtosData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.meta?.pagination || response.data.pagination || null,
        message: 'Produtos genéricos consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar produtos genéricos',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar produto genérico por ID
   */
  static async getProdutoGenericoById(id) {
    try {
      const response = await foodsApi.get(`/produto-generico/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Produto genérico encontrado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar produto genérico',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de produtos genéricos
   */
  static async getProdutosGenericosStats() {
    try {
      const response = await foodsApi.get('/produto-generico/estatisticas');
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas de produtos genéricos obtidas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas de produtos genéricos',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * ==================== PRODUTOS COMERCIAIS ====================
   */
  
  /**
   * Consultar produtos comerciais do sistema Foods
   */
  static async getProdutosComerciais(params = {}) {
    try {
      const response = await foodsApi.get('/produto-comercial', { params });
      
      let produtosData = response.data.data || response.data;
      if (produtosData && produtosData.items && Array.isArray(produtosData.items)) {
        produtosData = produtosData.items;
      }
      
      const arrayData = Array.isArray(produtosData) ? produtosData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.meta?.pagination || response.data.pagination || null,
        message: 'Produtos comerciais consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar produtos comerciais',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar produto comercial por ID
   */
  static async getProdutoComercialById(id) {
    try {
      const response = await foodsApi.get(`/produto-comercial/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Produto comercial encontrado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar produto comercial',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de produtos comerciais
   */
  static async getProdutosComerciaisStats() {
    try {
      const response = await foodsApi.get('/produto-comercial/estatisticas');
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas de produtos comerciais obtidas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas de produtos comerciais',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * ==================== ALMOXARIFADOS ====================
   */
  
  /**
   * Consultar almoxarifados do sistema Foods
   */
  static async getAlmoxarifados(params = {}) {
    try {
      // Garantir que os parâmetros de paginação estão corretos
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 100,
        ...params
      };
      
      const response = await foodsApi.get('/almoxarifado', { params: queryParams });
      // Processar resposta - estrutura identificada: response.data.data (array)
      let almoxarifadosData = response.data?.data;
      
      // Garantir que é um array
      const arrayData = Array.isArray(almoxarifadosData) ? almoxarifadosData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.meta?.pagination || response.data.pagination || null,
        message: 'Almoxarifados consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar almoxarifados',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar almoxarifado por ID
   */
  static async getAlmoxarifadoById(id) {
    try {
      const response = await foodsApi.get(`/almoxarifado/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Almoxarifado encontrado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar almoxarifado',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de almoxarifados
   */
  static async getAlmoxarifadosStats() {
    try {
      const response = await foodsApi.get('/almoxarifado/estatisticas');
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Estatísticas de almoxarifados obtidas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas de almoxarifados',
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
   * Listar centros de custo
   */
  static async getCentrosCusto(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 100,
        ...params
      };
      
      const response = await foodsApi.get('/centro-custo', { params: queryParams });
      
      let centrosCustoData = response.data?.data;
      
      // Garantir que é um array
      const arrayData = Array.isArray(centrosCustoData) ? centrosCustoData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.meta?.pagination || response.data.pagination || null,
        message: 'Centros de custo consultados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        message: error.response?.data?.message || 'Erro ao consultar centros de custo',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar centro de custo por ID
   */
  static async getCentroCustoById(id) {
    try {
      const response = await foodsApi.get(`/centro-custo/${id}`);
      
      let centroCustoData = response.data?.data || response.data;
      
      return {
        success: true,
        data: centroCustoData,
        message: 'Centro de custo consultado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao consultar centro de custo',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Buscar estatísticas de centros de custo
   */
  static async getCentrosCustoStats() {
    try {
      const response = await foodsApi.get('/centro-custo/estatisticas');
      
      return {
        success: true,
        data: response.data?.data || response.data,
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
   * Listar almoxarifados de uma filial
   */
  static async getAlmoxarifadosPorFilial(filialId) {
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
      
      let unidadesData = response.data.data || response.data;
      if (unidadesData && unidadesData.items && Array.isArray(unidadesData.items)) {
        unidadesData = unidadesData.items;
      }
      
      const arrayData = Array.isArray(unidadesData) ? unidadesData : [];
      
      return {
        success: true,
        data: arrayData,
        pagination: response.data.meta?.pagination || response.data.pagination || null,
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
        pagination: response.data.meta?.pagination || response.data.pagination,
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
        pagination: response.data.meta?.pagination || response.data.pagination,
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
