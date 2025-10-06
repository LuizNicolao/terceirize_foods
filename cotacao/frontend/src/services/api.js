import axios from 'axios';

// Determinar a URL base da API baseado no ambiente
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar o path /cotacao/api com HTTPS
    return process.env.REACT_APP_API_URL || 'https://foods.terceirizemais.com.br/cotacao/api';
  }
  // Em desenvolvimento, usar a URL padrão com prefixo /cotacao/api
  return process.env.REACT_APP_API_URL || 'http://localhost:3002/cotacao/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (config) => {
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

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Verificar se está em modo SSO (dados do foods no localStorage)
      const foodsUser = localStorage.getItem('foodsUser');
      const ssoDebugLog = localStorage.getItem('sso_debug_log');
      
      if (foodsUser || ssoDebugLog) {
        // Se está em modo SSO, tentar fazer login novamente via SSO
        console.log('🔄 [COTACAO] Token expirado em modo SSO, tentando re-autenticação...');
        
        // Limpar token atual
        localStorage.removeItem('token');
        
        // Tentar re-autenticação via SSO
        if (foodsUser) {
          try {
            const userData = JSON.parse(foodsUser);
            // Recarregar a página para tentar SSO novamente
            window.location.reload();
            return Promise.reject(error);
          } catch (e) {
            console.error('❌ [COTACAO] Erro ao processar dados SSO:', e);
          }
        }
        
        // Se não conseguiu re-autenticar via SSO, redirecionar para foods
        console.log('🔄 [COTACAO] Redirecionando para foods devido a falha SSO');
        window.location.href = 'https://foods.terceirizemais.com.br/foods';
        return Promise.reject(error);
      } else {
        // Modo normal, redirecionar para login do cotacao
        localStorage.removeItem('token');
        window.location.href = '/cotacao/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
