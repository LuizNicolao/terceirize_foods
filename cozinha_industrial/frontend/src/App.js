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
import UnidadesEscolares from './pages/unidades-escolares/UnidadesEscolares';
import ProdutosOrigem from './pages/produtos-origem/ProdutosOrigem';
import ProdutosGenericos from './pages/produtos-genericos/ProdutosGenericos';
import ProdutosComerciais from './pages/produtos-comerciais/ProdutosComerciais';
import Almoxarifados from './pages/almoxarifados/Almoxarifados';
import CentrosCusto from './pages/centros-custo/CentrosCusto';
import UnidadesMedida from './pages/unidades-medida/UnidadesMedida';
import Grupos from './pages/grupos/Grupos';
import Subgrupos from './pages/subgrupos/Subgrupos';
import Classes from './pages/classes/Classes';
import Receitas from './pages/receitas/Receitas';
import TiposReceitas from './pages/tipos-receitas/TiposReceitas';
import TiposPratos from './pages/tipos-pratos/TiposPratos';
import Pratos from './pages/pratos/Pratos';
import PeriodosAtendimento from './pages/periodos-atendimento/PeriodosAtendimento';

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
                path="/produtos-genericos" 
                element={
                  <AuthenticatedRoute>
                    <ProdutosGenericos />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/produtos-comerciais" 
                element={
                  <AuthenticatedRoute>
                    <ProdutosComerciais />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/almoxarifados" 
                element={
                  <AuthenticatedRoute>
                    <Almoxarifados />
                  </AuthenticatedRoute>
                }
              />
              <Route 
                path="/centros-custo" 
                element={
                  <AuthenticatedRoute>
                    <CentrosCusto />
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
                path="/receitas" 
                element={
                  <AuthenticatedRoute>
                    <Receitas />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/tipos-receitas" 
                element={
                  <AuthenticatedRoute>
                    <TiposReceitas />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/tipos-pratos" 
                element={
                  <AuthenticatedRoute>
                    <TiposPratos />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/pratos" 
                element={
                  <AuthenticatedRoute>
                    <Pratos />
                  </AuthenticatedRoute>
                }
              />

              <Route 
                path="/periodos-atendimento" 
                element={
                  <AuthenticatedRoute>
                    <PeriodosAtendimento />
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
