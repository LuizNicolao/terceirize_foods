import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Backups from './pages/Backups'
import Schedules from './pages/Schedules'
import Settings from './pages/Settings'
import Login from './pages/auth/Login'
import api from './services/api'
import Layout from './components/layout/Layout'

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppContent() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    api.get('/health')
      .then(res => setHealth(res.data))
      .catch(err => setHealth({ status: 'unhealthy' }))
  }, [])

  // Base path para funcionar em subdiretório
  // Se a URL já começa com /mysql-backup-web, usa esse basename
  // Caso contrário, usa vazio para funcionar na raiz
  const getBasename = () => {
    const pathname = window.location.pathname
    if (pathname.startsWith('/mysql-backup-web')) {
      return '/mysql-backup-web'
    }
    // Se PUBLIC_URL estiver definido, usa ele
    if (process.env.PUBLIC_URL) {
      return process.env.PUBLIC_URL
    }
    // Caso contrário, usa vazio (raiz)
    return ''
  }

  const basename = getBasename()

  return (
    <Router basename={basename}>
      <Routes>
        {/* Rota de login */}
        <Route
          path="/login"
          element={
            <Login />
          }
        />

        {/* Rotas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout health={health}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout health={health}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/backups"
          element={
            <ProtectedRoute>
              <Layout health={health}>
                <Backups />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedules"
          element={
            <ProtectedRoute>
              <Layout health={health}>
                <Schedules />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout health={health}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirecionar qualquer rota desconhecida para /dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

