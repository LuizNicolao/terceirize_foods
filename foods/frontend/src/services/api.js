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

// Função para buscar e setar o token CSRF
export const setCSRFToken = async () => {
  try {
    const response = await api.get('/csrf-token', { withCredentials: true });
    api.defaults.headers['X-CSRF-Token'] = response.data.csrfToken;
  } catch (error) {
    console.error('Erro ao buscar token CSRF:', error);
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
    // Adicionar CSRF em métodos protegidos
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      await setCSRFToken();
      config.headers['X-CSRF-Token'] = api.defaults.headers['X-CSRF-Token'];
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
      window.location.href = '/foods/login';
    }
    return Promise.reject(error);
  }
);

export default api; 