import React, { useState, useEffect, useRef } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  NecessidadesLayout,
  NecessidadesActions,
  NecessidadesLoading,
  NecessidadesStats,
  NecessidadesFilters,
  NecessidadeModal,
  ImportNecessidadesModal,
  NecessidadesTabsCorrecao,
  CorrecaoNecessidadeModal,
  CorrecaoNecessidadesTab
} from '../../components/necessidades';
import { ExportButtons } from '../../components/shared';
import { useNecessidadesListagem } from './hooks/useNecessidadesListagem';
import { useNecessidadesCorrecao } from './hooks/useNecessidadesCorrecao';
import { NecessidadesListagemTab, NecessidadeVisualizacaoModal } from './components';
import {
  createSalvarNecessidadeHandler,
  createImportSuccessHandler,
  createExcluirNecessidadeHandler,
  createCorrecaoSalvaHandler
} from './handlers/necessidadesHandlers';
import toast from 'react-hot-toast';

const Necessidades = () => {
  const { canView, canCreate, loading: permissionsLoading } = usePermissions();
  const { user } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('listagem');
  const [gerando, setGerando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizacaoAberto, setModalVisualizacaoAberto] = useState(false);
  const [modalImportAberto, setModalImportAberto] = useState(false);
  const [modalCorrecaoAberto, setModalCorrecaoAberto] = useState(false);
  const [necessidadeSelecionada, setNecessidadeSelecionada] = useState(null);
  const [necessidadeIdParaCorrecao, setNecessidadeIdParaCorrecao] = useState(null);
  
  // Verificar permissões específicas
  const canViewNecessidades = canView('necessidades');
  const canCreateNecessidades = canCreate('necessidades');
  const isAdministrador = user?.tipo_de_acesso === 'administrador';

  // Hooks separados para cada aba - cada um com sua própria lógica e estado
  const listagemData = useNecessidadesListagem();
  const correcaoData = useNecessidadesCorrecao();

  // Ref para rastrear aba anterior e evitar recarregamentos desnecessários
  const abaAnteriorRef = useRef(abaAtiva);

  // Selecionar dados baseado na aba ativa
  const dadosAtivos = abaAtiva === 'correcao' ? correcaoData : listagemData;
  const { 
    necessidades, 
    escolas, 
    grupos, 
    loading, 
    error, 
    pagination, 
    filtros, 
    updateFiltros, 
    clearFiltros, 
    gerarNecessidade, 
    exportarXLSX, 
    exportarPDF, 
    recarregarNecessidades 
  } = dadosAtivos;

  // Garantir que apenas administradores possam acessar aba de correção
  useEffect(() => {
    if (abaAtiva === 'correcao' && !isAdministrador) {
      setAbaAtiva('listagem');
    }
  }, [abaAtiva, isAdministrador]);

  // Recarregar dados quando a aba mudar (cada aba tem sua própria lógica)
  useEffect(() => {
    if (canViewNecessidades && abaAnteriorRef.current !== abaAtiva) {
      abaAnteriorRef.current = abaAtiva;
      // Resetar paginação e forçar recarregamento ao mudar de aba
      if (abaAtiva === 'correcao') {
        correcaoData.pagination.resetPagination();
        correcaoData.recarregarNecessidades();
      } else {
        listagemData.pagination.resetPagination();
        listagemData.recarregarNecessidades();
      }
    }
  }, [abaAtiva, canViewNecessidades, correcaoData, listagemData]);


  // Verificar se pode visualizar
  if (permissionsLoading) {
    return <NecessidadesLoading />;
  }

  if (!canViewNecessidades) {
    return (
      <NecessidadesLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar a geração de necessidades.
          </p>
        </div>
      </NecessidadesLayout>
    );
  }

  // Handlers usando funções factory
  const handleGerarNecessidade = () => {
    if (!canCreateNecessidades) {
      toast.error('Você não tem permissão para gerar necessidades');
      return;
    }
    setModalAberto(true);
  };

  const handleSalvarNecessidade = createSalvarNecessidadeHandler(
    gerarNecessidade,
    recarregarNecessidades,
    setModalAberto,
    setGerando
  );

  const handleImportarNecessidades = () => {
    if (!canCreateNecessidades) {
      toast.error('Você não tem permissão para importar necessidades');
      return;
    }
    setModalImportAberto(true);
  };

  const handleImportSuccess = createImportSuccessHandler(
    setModalImportAberto,
    recarregarNecessidades
  );

  const handleVisualizarNecessidade = (grupo) => {
    setNecessidadeSelecionada(grupo);
    setModalVisualizacaoAberto(true);
  };

  const handleCorrigirNecessidade = (necessidadeId) => {
    setNecessidadeIdParaCorrecao(necessidadeId);
    setModalCorrecaoAberto(true);
  };

  const handleCorrecaoSalva = createCorrecaoSalvaHandler(recarregarNecessidades);

  const handleExcluirNecessidade = createExcluirNecessidadeHandler(recarregarNecessidades);


  return (
    <>
    <NecessidadesLayout>
      {/* Abas */}
      <NecessidadesTabsCorrecao
        activeTab={abaAtiva}
        setActiveTab={setAbaAtiva}
        isAdministrador={isAdministrador}
      />

      {/* Botão de Adicionar */}
      <NecessidadesActions
        canCreate={canCreateNecessidades}
        onAdd={handleGerarNecessidade}
        onImport={handleImportarNecessidades}
        onShowHelp={() => {}} // TODO: Implementar ajuda
        loading={loading}
      />

      {/* Estatísticas */}
      <NecessidadesStats
        produtos={necessidades}
        escola={filtros.escola}
        grupo={filtros.grupo}
        data={filtros.data}
      />

      {/* Filtros */}
      <NecessidadesFilters
        escolas={escolas}
        grupos={grupos}
        filtros={filtros}
        onFilterChange={updateFiltros}
        onClearFilters={clearFiltros}
        loading={loading}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Conteúdo baseado na aba ativa */}
      {abaAtiva === 'listagem' && (
        <NecessidadesListagemTab
          necessidades={necessidades}
          loading={loading}
          pagination={pagination}
          onView={handleVisualizarNecessidade}
        />
      )}

      {abaAtiva === 'correcao' && isAdministrador && (
        <CorrecaoNecessidadesTab
          necessidades={necessidades}
          onCorrigir={handleCorrigirNecessidade}
          onExcluir={handleExcluirNecessidade}
          loading={loading}
          pagination={pagination}
        />
      )}
    </NecessidadesLayout>

    <NecessidadeModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSalvarNecessidade}
        escolas={escolas}
        grupos={grupos}
        loading={gerando}
      />

      {/* Modal de Visualização */}
      <NecessidadeVisualizacaoModal
        isOpen={modalVisualizacaoAberto}
        onClose={() => setModalVisualizacaoAberto(false)}
        necessidade={necessidadeSelecionada}
      />

      {/* Modal de Importação */}
      <ImportNecessidadesModal
        isOpen={modalImportAberto}
        onClose={() => setModalImportAberto(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Modal de Correção */}
      <CorrecaoNecessidadeModal
        isOpen={modalCorrecaoAberto}
        onClose={() => {
          setModalCorrecaoAberto(false);
          setNecessidadeIdParaCorrecao(null);
        }}
        necessidadeId={necessidadeIdParaCorrecao}
        onSave={handleCorrecaoSalva}
      />
    </>
  );
};

export default Necessidades;