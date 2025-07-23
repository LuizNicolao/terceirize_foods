import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Função para buscar e setar o token CSRF
export const setCSRFToken = async () => {
  try {
    // Verificar se já temos um token CSRF válido
    if (api.defaults.headers['X-CSRF-Token']) {
      return;
    }
    
    const response = await api.get('/csrf-token', { 
      withCredentials: true,
      timeout: 5000 // Timeout menor para CSRF
    });
    
    if (response.data && response.data.csrfToken) {
      api.defaults.headers['X-CSRF-Token'] = response.data.csrfToken;
      console.log('✅ Token CSRF obtido com sucesso');
    }
  } catch (error) {
    console.warn('⚠️ Erro ao buscar token CSRF:', error.message);
    // Não rejeitar a promise, apenas logar o erro
  }
};

// Interceptor para garantir o envio do token CSRF em métodos protegidos
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Sempre enviar cookies
    config.withCredentials = true;
    
    // Lista de rotas que não precisam de CSRF
    const rotasSemCSRF = [
      '/api/auth/login',
      '/api/auth/verify',
      '/api/auth/validate-cotacao-token',
      '/api/fornecedores/public',
      '/api/health',
      '/api/csrf-token'
    ];
    
    // Adicionar CSRF apenas em métodos protegidos e rotas que precisam
    if (['post', 'put', 'delete', 'patch'].includes(config.method) && 
        !rotasSemCSRF.some(rota => config.url.includes(rota))) {
      try {
        await setCSRFToken();
        config.headers['X-CSRF-Token'] = api.defaults.headers['X-CSRF-Token'];
      } catch (error) {
        console.warn('Erro ao buscar CSRF token, continuando sem:', error.message);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 