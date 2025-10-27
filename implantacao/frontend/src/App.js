import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { Layout, ProtectedRoute } from './components/layout';
import { LoadingSpinner } from './components/ui';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/usuarios/Usuarios';
import Permissoes from './pages/permissoes/Permissoes';
import Filiais from './pages/filiais/Filiais';
import Fornecedores from './pages/fornecedores/Fornecedores';
import RotasNutricionistas from './pages/rotas-nutricionistas/RotasNutricionistas';
import UnidadesEscolares from './pages/unidades-escolares/UnidadesEscolares';
import ProdutosOrigem from './pages/produtos-origem/ProdutosOrigem';
import UnidadesMedida from './pages/unidades-medida/UnidadesMedida';
import Grupos from './pages/grupos/Grupos';
import Subgrupos from './pages/subgrupos/Subgrupos';
import Classes from './pages/classes/Classes';
import RecebimentosEscolas from './pages/recebimentos-escolas/RecebimentosEscolas';
import ProdutosPerCapita from './pages/produtos-per-capita/ProdutosPerCapita';
import RegistrosDiarios from './pages/registros-diarios/RegistrosDiarios';
import Necessidades from './pages/necessidades/Necessidades';
import AjusteNecessidades from './pages/necessidades/AjusteNecessidades';
import AnaliseSubstituicoes from './pages/necessidades-substituicoes';
import CalendarioDashboard from './pages/calendario/CalendarioDashboard';
import CalendarioVisualizacao from './pages/calendario/CalendarioVisualizacao';
import CalendarioConfiguracao from './pages/calendario/CalendarioConfiguracao';
import CalendarioRelatorios from './pages/calendario/CalendarioRelatorios';

// Componente para rotas protegidas com autenticação
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PermissionsProvider>
      <Layout>{children}</Layout>
    </PermissionsProvider>
  );
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Rota de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login />
        } 
      />

      {/* Rotas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <AuthenticatedRoute>
            <Dashboard />
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/usuarios" 
        element={
          <AuthenticatedRoute>
            <Usuarios />
          </AuthenticatedRoute>
        } 
      />

              <Route 
                path="/permissoes" 
                element={
                  <AuthenticatedRoute>
                    <Permissoes />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/filiais" 
                element={
                  <AuthenticatedRoute>
                    <Filiais />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/fornecedores" 
                element={
                  <AuthenticatedRoute>
                    <Fornecedores />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/rotas-nutricionistas" 
                element={
                  <AuthenticatedRoute>
                    <RotasNutricionistas />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/unidades-escolares" 
                element={
                  <AuthenticatedRoute>
                    <UnidadesEscolares />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/produtos-origem" 
                element={
                  <AuthenticatedRoute>
                    <ProdutosOrigem />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/unidades-medida" 
                element={
                  <AuthenticatedRoute>
                    <UnidadesMedida />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/grupos" 
                element={
                  <AuthenticatedRoute>
                    <Grupos />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/subgrupos" 
                element={
                  <AuthenticatedRoute>
                    <Subgrupos />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/classes" 
                element={
                  <AuthenticatedRoute>
                    <Classes />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/recebimentos-escolas" 
                element={
                  <AuthenticatedRoute>
                    <RecebimentosEscolas />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/produtos-per-capita" 
                element={
                  <AuthenticatedRoute>
                    <ProdutosPerCapita />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/registros-diarios" 
                element={
                  <AuthenticatedRoute>
                    <RegistrosDiarios />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/necessidades" 
                element={
                  <AuthenticatedRoute>
                    <Necessidades />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/ajuste-necessidade" 
                element={
                  <AuthenticatedRoute>
                    <AjusteNecessidades />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/analise-substituicoes" 
                element={
                  <AuthenticatedRoute>
                    <AnaliseSubstituicoes />
                  </AuthenticatedRoute>
                } 
              />

              {/* Rotas do Calendário */}
              <Route 
                path="/calendario" 
                element={
                  <AuthenticatedRoute>
                    <CalendarioDashboard />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/calendario/visualizacao" 
                element={
                  <AuthenticatedRoute>
                    <CalendarioVisualizacao />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/calendario/configuracao" 
                element={
                  <AuthenticatedRoute>
                    <CalendarioConfiguracao />
                  </AuthenticatedRoute>
                } 
              />

              <Route 
                path="/calendario/relatorios" 
                element={
                  <AuthenticatedRoute>
                    <CalendarioRelatorios />
                  </AuthenticatedRoute>
                } 
              />

      {/* Rota padrão */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />

      {/* Rota 404 */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Página não encontrada</p>
              <button 
                onClick={() => window.history.back()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Voltar
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
}

export default App;
