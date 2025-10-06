import axios from 'axios';

// Determinar a URL base da API baseado no ambiente
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar o IP e porta corretos
    return process.env.REACT_APP_API_URL || 'http://82.29.57.43:3003/api';
  }
  // Em desenvolvimento, usar a URL padrão
  return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('necessidades_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('necessidades_token');
      localStorage.removeItem('necessidades_user');
      localStorage.removeItem('necessidades_rememberMe');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
