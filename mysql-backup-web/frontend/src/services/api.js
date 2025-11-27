import axios from 'axios'

// Determinar a URL base da API baseado no ambiente
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar o proxy nginx com base path
    const basePath = process.env.PUBLIC_URL || '/mysql-backup-web'
    return process.env.REACT_APP_API_URL || `${basePath}/api`
  }
  // Em desenvolvimento, usar a URL padrão (porta 3006 para evitar conflito com foods na 3000)
  return process.env.REACT_APP_API_URL || 'http://localhost:3006/api'
}

const API_URL = getBaseURL()


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para log de erros e tratamento de 401 e 403
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status
      
      // Se for 401 (não autorizado) ou 403 (proibido), limpar tokens e redirecionar
      if (status === 401 || status === 403) {
        // Se for 403, mostrar mensagem específica
        if (status === 403) {
          const errorMessage = error.response.data?.error || 'Acesso negado. Apenas administradores podem acessar este sistema.'
          console.error('Acesso negado:', errorMessage)
        }
        
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('rememberMe')
        
        // Redirecionar para login apenas se não estiver na página de login
        // Detectar basename automaticamente
        const getBasename = () => {
          const pathname = window.location.pathname
          if (pathname.startsWith('/mysql-backup-web')) {
            return '/mysql-backup-web'
          }
          return process.env.PUBLIC_URL || ''
        }
        const basename = getBasename()
        const loginPath = basename ? `${basename}/login` : '/login'
        if (window.location.pathname !== loginPath) {
          window.location.href = loginPath
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

