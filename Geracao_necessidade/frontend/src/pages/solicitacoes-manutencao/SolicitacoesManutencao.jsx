import React, { useState, useEffect } from 'react';
import { useSolicitacoesManutencao } from '../../hooks/useSolicitacoesManutencao';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSolicitacoesManutencaoFilters } from '../../hooks/useSolicitacoesManutencaoFilters';
import {
  SolicitacoesManutencaoLayout,
  SolicitacaoModal,
  SolicitacoesStats,
  SolicitacoesFilters,
  SolicitacoesTable,
  SolicitacoesActions,
  SolicitacoesTabs,
  GerenciarSolicitacoes
} from '../../components/solicitacoes-manutencao';
import useEscolas from '../../hooks/useEscolas';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SolicitacoesManutencao = () => {
  const { user } = useAuth();
  const { canView, canCreate, canEdit, canDelete, loading: permissionsLoading } = usePermissions();
  
  const {
    solicitacoes,
    stats,
    loading,
    error,
    pagination,
    carregarSolicitacoes,
    carregarStats,
    criarSolicitacao,
    atualizarSolicitacao,
    deletarSolicitacao,
    exportarPDF,
    exportarXLSX
  } = useSolicitacoesManutencao();

  const {
    filtros,
    updateFiltros,
    clearFiltros,
    setPage,
    setLimit
  } = useSolicitacoesManutencaoFilters();

  const { escolas, carregarEscolas } = useEscolas();

  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  
  // Estado para controlar as tabs da página
  const [activeTab, setActiveTab] = useState('lista');

  // Verificar permissões específicas
  const canViewSolicitacoes = canView('solicitacoes-manutencao');
  const canCreateSolicitacoes = canCreate('solicitacoes-manutencao');
  const canEditSolicitacoes = canEdit('solicitacoes-manutencao');
  const canDeleteSolicitacoes = canDelete('solicitacoes-manutencao');

  // Carregar dados quando as permissões carregarem
  useEffect(() => {
    if (!permissionsLoading && canViewSolicitacoes) {
      carregarSolicitacoes(filtros);
      carregarStats();
      
      // Carregar escolas baseado no tipo de usuário
      if (user?.tipo_usuario === 'Coordenacao' || user?.tipo_usuario === 'Supervisao') {
        carregarEscolas({}, true); // Todas as escolas
      } else {
        carregarEscolas({}, false); // Apenas escolas relacionadas ao nutricionista
      }
    }
  }, [permissionsLoading, canViewSolicitacoes, user?.tipo_usuario]);

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    if (!permissionsLoading && canViewSolicitacoes) {
      carregarSolicitacoes(filtros);
    }
  }, [filtros]);

  // Funções para modal
  const handleAddSolicitacao = () => {
    if (!canCreateSolicitacoes) {
      toast.error('Você não tem permissão para criar solicitações');
      return;
    }
    setSelectedSolicitacao(null);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditSolicitacao = (solicitacao) => {
    if (!canEditSolicitacoes) {
      toast.error('Você não tem permissão para editar solicitações');
      return;
    }
    setSelectedSolicitacao(solicitacao);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewSolicitacao = (solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteSolicitacao = async (solicitacao) => {
    if (!canDeleteSolicitacoes) {
      toast.error('Você não tem permissão para excluir solicitações');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a solicitação de ${solicitacao.escola_nome}?`)) {
      const result = await deletarSolicitacao(solicitacao.id);
      if (result) {
        // Recarregar dados após exclusão
        carregarSolicitacoes(filtros);
        carregarStats();
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSolicitacao(null);
    setViewMode(false);
  };

  const handleSaveSolicitacao = async (solicitacaoData) => {
    setModalLoading(true);
    
    try {
      let result;
      if (selectedSolicitacao) {
        result = await atualizarSolicitacao(selectedSolicitacao.id, solicitacaoData);
      } else {
        result = await criarSolicitacao(solicitacaoData);
      }

      if (result === true || (result && result.id)) {
        // Operação bem-sucedida - recarregar dados e fechar modal
        await carregarSolicitacoes(filtros);
        await carregarStats();
        handleCloseModal();
      } else if (result === null) {
        // Erro já foi tratado no hook, não precisa mostrar toast novamente
        return;
      } else {
        toast.error(result?.error || result?.message || 'Erro ao salvar solicitação');
      }
    } catch (error) {
      console.error('Erro ao salvar solicitação:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setModalLoading(false);
    }
  };

  // Funções de exportação
  const handleExportPDF = async () => {
    try {
      await exportarPDF(solicitacoes);
      toast.success('Relatório PDF gerado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    }
  };

  const handleExportXLSX = async () => {
    try {
      await exportarXLSX(solicitacoes);
      toast.success('Planilha Excel gerada com sucesso');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao gerar planilha Excel');
    }
  };

  const handleViewStats = () => {
    // TODO: Implementar modal de estatísticas detalhadas
    toast('Funcionalidade em desenvolvimento', {
      icon: 'ℹ️',
      duration: 3000,
    });
  };

  // Se não tem permissão para visualizar, mostrar mensagem
  if (!permissionsLoading && !canViewSolicitacoes) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Acesso Negado
          </h2>
          <p className="text-red-600">
            Você não tem permissão para visualizar solicitações de manutenção.
          </p>
        </div>
      </div>
    );
  }


  return (
    <SolicitacoesManutencaoLayout
      actions={
        <SolicitacoesActions
          onCreateNew={handleAddSolicitacao}
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          canCreate={canCreateSolicitacoes}
          canExport={canViewSolicitacoes}
          loading={loading}
        />
      }
    >
      {/* Estatísticas */}
      <SolicitacoesStats stats={stats} loading={loading} />

      {/* Tabs de navegação */}
      <SolicitacoesTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userType={user?.tipo_usuario} 
      />

      {/* Conteúdo das tabs */}
      {activeTab === 'lista' && (
        <>
          {/* Filtros */}
          <SolicitacoesFilters
            filtros={filtros}
            onFiltrosChange={updateFiltros}
            escolas={escolas}
            onLimparFiltros={clearFiltros}
          />

          {/* Tabela */}
          <SolicitacoesTable
            solicitacoes={solicitacoes}
            onEdit={handleEditSolicitacao}
            onView={handleViewSolicitacao}
            onDelete={handleDeleteSolicitacao}
            canEdit={canEditSolicitacoes}
            canDelete={canDeleteSolicitacoes}
            loading={loading}
          />

          {/* Paginação */}
          {pagination && pagination.total > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700 bg-white border-t border-b border-gray-300">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
          )}
        </>
      )}

      {activeTab === 'gerenciar' && (
        <GerenciarSolicitacoes 
          onSolicitacaoAtualizada={() => {
            // Recarregar dados da aba "Lista" quando uma solicitação for atualizada na aba "Gerenciar"
            carregarSolicitacoes(filtros);
            carregarStats();
          }}
        />
      )}

      {/* Modal */}
      <SolicitacaoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSolicitacao}
        solicitacao={selectedSolicitacao}
        escolas={escolas}
        loading={modalLoading}
        viewMode={viewMode}
        userType={user?.tipo_usuario}
      />
    </SolicitacoesManutencaoLayout>
  );
};

export default SolicitacoesManutencao;
