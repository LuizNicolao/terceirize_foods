import api from '../services/api';

// Configurar interceptor para incluir token automaticamente
api.interceptors.request.use(
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

// Interceptor para tratar erros de autenticação
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
        console.log('🔄 [COTACAO AXIOS] Token expirado em modo SSO, tentando re-autenticação...');
        
        // Limpar token atual
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        
        // Tentar re-autenticação via SSO
        if (foodsUser) {
          try {
            const userData = JSON.parse(foodsUser);
            // Recarregar a página para tentar SSO novamente
            window.location.reload();
            return Promise.reject(error);
          } catch (e) {
            console.error('❌ [COTACAO AXIOS] Erro ao processar dados SSO:', e);
          }
        }
        
        // Se não conseguiu re-autenticar via SSO, redirecionar para foods
        console.log('🔄 [COTACAO AXIOS] Redirecionando para foods devido a falha SSO');
        window.location.href = 'https://foods.terceirizemais.com.br/foods';
        return Promise.reject(error);
      } else {
        // Modo normal, redirecionar para login do cotacao
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        window.location.href = '/cotacao/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 