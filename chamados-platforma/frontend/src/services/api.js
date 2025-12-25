import axios from 'axios';

// Determinar a URL base da API baseado no ambiente
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://foods.terceirizemais.com.br/chamados/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3007/chamados/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
});

// Interceptor para garantir o envio do token JWT
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    // Só redirecionar para login se for realmente um erro de autenticação
    // Não redirecionar se for erro de validação (422) ou outros erros esperados
    if (error.response?.status === 401) {
      // Verificar se a requisição pediu para não redirecionar
      if (error.config?.skipAuthRedirect) {
        return Promise.reject(error);
      }
      
      // Verificar se o token ainda existe (pode ter expirado)
      const token = localStorage.getItem('token');
      if (!token) {
        // Sem token, redirecionar para login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/chamados/login';
      } else {
        // Token existe mas foi rejeitado - pode ser expirado
        // Não redirecionar automaticamente, deixar o componente tratar
        console.warn('Token pode ter expirado:', error.response?.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

