import axios from 'axios';

// Determinar a URL base da API baseado no ambiente
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar o path /foods/api com HTTPS
    return process.env.REACT_APP_API_URL || 'https://foods.terceirizemais.com.br/foods/api';
  }
  // Em desenvolvimento, usar a URL padrão
  return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// Interceptor para garantir o envio do token JWT
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Sempre enviar cookies
    config.withCredentials = true;
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
      // Verificar se é uma requisição relacionada ao SSO ou cotacao
      const isSSORequest = error.config?.url?.includes('/cotacao') || 
                          error.config?.url?.includes('/sso') ||
                          error.config?.headers?.['x-sso-request'] === 'true';
      
      if (isSSORequest) {
        console.log('🔄 [FOODS] Erro 401 em requisição SSO, não fazendo logout');
        return Promise.reject(error);
      }
      
      // Apenas fazer logout para erros 401 não relacionados ao SSO
      console.log('🔄 [FOODS] Erro 401 não relacionado ao SSO, fazendo logout');
      localStorage.removeItem('token');
      window.location.href = '/foods/login';
    }
    return Promise.reject(error);
  }
);

export default api; 