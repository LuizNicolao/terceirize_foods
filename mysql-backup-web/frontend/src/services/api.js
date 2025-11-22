import axios from 'axios'

// Determinar a URL base da API baseado no ambiente
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar o proxy nginx
    return process.env.REACT_APP_API_URL || '/api'
  }
  // Em desenvolvimento, usar a URL padrão
  return process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
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

// Interceptor para log de erros e tratamento de 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      
      // Se for 401 (não autorizado), limpar tokens e redirecionar
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('rememberMe')
        // Redirecionar para login apenas se não estiver na página de login
        const basename = process.env.PUBLIC_URL || '/mysql-backup-web'
        if (window.location.pathname !== `${basename}/login`) {
          window.location.href = `${basename}/login`
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

