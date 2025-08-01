import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
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
    console.log('Debug - Interceptor: Config inicial:', config);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Debug - Interceptor: Token adicionado');
    }
    
    // Sempre enviar cookies
    config.withCredentials = true;
    
    // Adicionar CSRF em métodos protegidos
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      console.log('Debug - Interceptor: Método protegido detectado, buscando CSRF');
      await setCSRFToken();
      config.headers['X-CSRF-Token'] = api.defaults.headers['X-CSRF-Token'];
      console.log('Debug - Interceptor: CSRF adicionado:', api.defaults.headers['X-CSRF-Token']);
    }
    
    console.log('Debug - Interceptor: Config final:', config);
    return config;
  },
  (error) => {
    console.log('Debug - Interceptor: Erro:', error);
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