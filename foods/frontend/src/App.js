import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Layout, ProtectedRoute } from './components/layout';
import { LoadingSpinner } from './components/ui';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/usuarios/Usuarios';
import Fornecedores from './pages/fornecedores/Fornecedores';
import Clientes from './pages/clientes/Clientes';
import Filiais from './pages/filiais/Filiais';
import Rotas from './pages/rotas/Rotas';
import TipoRota from './pages/tipo-rota/TipoRota';
import UnidadesEscolares from './pages/unidades-escolares/UnidadesEscolares';
import Produtos from './pages/produtos/Produtos';
import Grupos from './pages/grupos/Grupos';
import Subgrupos from './pages/subgrupos/Subgrupos';
import Unidades from './pages/unidades/Unidades';
import Marcas from './pages/marcas/Marcas';
import Classes from './pages/classes/Classes';
import Permissoes from './pages/permissoes/Permissoes';
import Veiculos from './pages/veiculos/Veiculos';
import Motoristas from './pages/motoristas/Motoristas';
import Ajudantes from './pages/ajudantes/Ajudantes';
import ProdutoOrigem from './pages/produto-origem/ProdutoOrigem';
import ProdutoComercial from './pages/produto-comercial/ProdutoComercial';
import ProdutoGenerico from './pages/produto-generico/ProdutoGenerico';
import FichaHomologacao from './pages/ficha-homologacao/FichaHomologacao';
import Intolerancias from './pages/intolerancias/Intolerancias';
import Patrimonios from './pages/patrimonios/Patrimonios';
import RotasNutricionistas from './pages/rotas-nutricionistas/RotasNutricionistas';
import TiposCardapio from './pages/tipos-cardapio/TiposCardapio';
import PeriodosRefeicao from './pages/periodos-refeicao/PeriodosRefeicao';
import FaturamentoPage from './pages/faturamento/FaturamentoPage';
import Receitas from './pages/cardapios/Receitas';
import NecessidadesMerenda from './pages/necessidades-merenda/NecessidadesMerenda';
import PlanoAmostragem from './pages/plano-amostragem/PlanoAmostragem';
import RelatorioInspecao from './pages/relatorio-inspecao/RelatorioInspecao';
import SolicitacoesCompras from './pages/solicitacoes-compras/SolicitacoesCompras';
import CalendarioDashboard from './pages/calendario/CalendarioDashboard';
import CalendarioVisualizacao from './pages/calendario/CalendarioVisualizacao';
import CalendarioConfiguracao from './pages/calendario/CalendarioConfiguracao';
import CalendarioRelatorios from './pages/calendario/CalendarioRelatorios';
import FormasPagamento from './pages/formas-pagamento/FormasPagamento';
import PrazosPagamento from './pages/prazos-pagamento/PrazosPagamento';
import PedidosCompras from './pages/pedidos-compras/PedidosCompras';
import NotasFiscais from './pages/notas-fiscais/NotasFiscais';
import CentroCusto from './pages/centro-custo/CentroCusto';
import Almoxarifado from './pages/almoxarifado/Almoxarifado';
import Estoque from './pages/estoque/Estoque';
import PdfTemplates from './pages/pdf-templates/PdfTemplates';

// Componente para rotas protegidas com autenticação
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/foods/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Componente para rotas públicas
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/foods" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Rota pública */}
      <Route 
        path="/foods/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Rotas protegidas */}
      <Route 
        path="/foods" 
        element={
          <AuthenticatedRoute>
            <Dashboard />
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/usuarios" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="usuarios">
              <Usuarios />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/fornecedores" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="fornecedores">
              <Fornecedores />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/clientes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="clientes">
              <Clientes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/filiais" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="filiais">
              <Filiais />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/rotas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="rotas">
              <Rotas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/tipo-rota" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="tipo_rota">
              <TipoRota />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/rotas-nutricionistas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="rotas_nutricionistas">
              <RotasNutricionistas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/tipos-cardapio" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="tipos_cardapio">
              <TiposCardapio />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/periodos-refeicao" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="periodos_refeicao">
              <PeriodosRefeicao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />


      <Route 
        path="/foods/unidades-escolares" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="unidades_escolares">
              <UnidadesEscolares />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/produtos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="produtos">
              <Produtos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/grupos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="grupos">
              <Grupos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/subgrupos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="subgrupos">
              <Subgrupos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/unidades" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="unidades">
              <Unidades />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/marcas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="marcas">
              <Marcas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/classes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="classes">
              <Classes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />


      <Route 
        path="/foods/veiculos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="veiculos">
              <Veiculos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/motoristas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="motoristas">
              <Motoristas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/ajudantes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="ajudantes">
              <Ajudantes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/produto-origem" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="produto_origem">
              <ProdutoOrigem />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/produto-comercial" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="produto_comercial">
              <ProdutoComercial />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/produto-generico" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="produto_generico">
              <ProdutoGenerico />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/ficha-homologacao" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="ficha_homologacao">
              <FichaHomologacao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/intolerancias" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="intolerancias">
              <Intolerancias />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/patrimonios" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="patrimonios">
              <Patrimonios />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />


      <Route 
        path="/foods/permissoes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="permissoes">
              <Permissoes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/faturamento" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="faturamento">
              <FaturamentoPage />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/receitas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="receitas">
              <Receitas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/necessidades-merenda" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="necessidades_merenda">
              <NecessidadesMerenda />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/plano-amostragem" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="plano_amostragem">
              <PlanoAmostragem />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/relatorio-inspecao" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="relatorio_inspecao">
              <RelatorioInspecao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/solicitacoes-compras" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="solicitacoes_compras">
              <SolicitacoesCompras />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/formas-pagamento" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="formas_pagamento">
              <FormasPagamento />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/prazos-pagamento" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="prazos_pagamento">
              <PrazosPagamento />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/pedidos-compras" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="pedidos_compras">
              <PedidosCompras />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/notas-fiscais" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="notas_fiscais">
              <NotasFiscais />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/centro-custo" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="centro_custo">
              <CentroCusto />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/almoxarifado" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="almoxarifado">
              <Almoxarifado />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/estoque" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="almoxarifado_estoque">
              <Estoque />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/pdf-templates" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="pdf_templates">
              <PdfTemplates />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/calendario" 
        element={
          <AuthenticatedRoute>
            <CalendarioDashboard />
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/calendario/visualizacao" 
        element={
          <AuthenticatedRoute>
            <CalendarioVisualizacao />
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/calendario/configuracao" 
        element={
          <AuthenticatedRoute>
            <CalendarioConfiguracao />
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/calendario/relatorios" 
        element={
          <AuthenticatedRoute>
            <CalendarioRelatorios />
          </AuthenticatedRoute>
        } 
      />

      {/* Redirecionar rotas não encontradas */}
      <Route path="*" element={<Navigate to="/foods" replace />} />
    </Routes>
  );
};

export default App; 
