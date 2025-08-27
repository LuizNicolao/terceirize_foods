import axios from 'axios';

// Determinar a URL base da API baseado no ambiente
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar o path /cotacao/api com HTTPS
    return process.env.REACT_APP_API_URL || 'https://foods.terceirizemais.com.br/cotacao/api';
  }
  // Em desenvolvimento, usar a URL padrão com prefixo /api
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// Interceptor para adicionar token SSO nas requisições
api.interceptors.request.use(
  async (config) => {
    const ssoToken = localStorage.getItem('sso_token');
    if (ssoToken) {
      // Adicionar token SSO como parâmetro de query
      config.params = {
        ...config.params,
        sso_token: ssoToken
      };
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
      // window.location.href = '/cotacao/login'; // DESABILITADO - Autenticação centralizada no Foods
      window.location.href = '/cotacao/dashboard'; // Redirecionar para dashboard por enquanto
    }
    return Promise.reject(error);
  }
);

export default api;
