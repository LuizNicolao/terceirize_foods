import axios from 'axios';

// Determinar a URL base da API baseado no ambiente
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar o path /implantacao/api com HTTPS
    return process.env.REACT_APP_API_URL || 'https://foods.terceirizemais.com.br/implantacao/api';
  }
  // Em desenvolvimento, usar a URL padrão
  return process.env.REACT_APP_API_URL || 'http://localhost:3005/api';
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
    console.error('=== API INTERCEPTOR ERROR ===');
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
    console.error('Error:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.error('Erro 401 detectado - redirecionando para login');
      // Remover o redirecionamento imediato para permitir logs
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/implantacao/login';
      }, 5000); // 5 segundos para ver os logs
    }
    return Promise.reject(error);
  }
);

export default api;
