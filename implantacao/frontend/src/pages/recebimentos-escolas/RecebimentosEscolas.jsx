import React, { useState, useEffect } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import useRecebimentosEscolas from '../../hooks/useRecebimentosEscolas';
import { useRecebimentosFilters } from '../../hooks/useRecebimentosFilters';
import { 
  RecebimentosLayout,
  RecebimentosActions,
  RecebimentosLoading,
  RecebimentosStats,
  RecebimentosFilters,
  RecebimentoModal,
  RecebimentosTable,
  RecebimentosTabs,
  RelatoriosRecebimentos
} from '../../components/recebimentos-escolas';
import { RecebimentosEscolasHeader } from './components';
import ActionButtons from '../../components/ui/ActionButtons';
import Modal from '../../components/ui/Modal';
import { Pagination } from '../../components/ui';
// import { formatarDataParaExibicao } from '../../utils/recebimentosUtils';
import toast from 'react-hot-toast';

const RecebimentosEscolas = () => {
  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  const { user } = useAuth();
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizacaoAberto, setModalVisualizacaoAberto] = useState(false);
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState(null);
  const [activeTab, setActiveTab] = useState('lista');
  
  // Hook para gerenciar recebimentos
  const {
    recebimentos,
    todosRecebimentos,
    escolas,
    loading,
    error,
    pagination,
    carregarRecebimentos,
    carregarEscolas,
    carregarEstatisticas,
    atualizarPaginacao,
    criarRecebimento,
    editarRecebimento,
    excluirRecebimento,
    exportarXLSX,
    exportarPDF,
    estatisticas
  } = useRecebimentosEscolas();

  // Hook para filtros
  const {
    filtros,
    updateFiltros,
    clearFiltros
  } = useRecebimentosFilters();

  // Verificar permissões específicas
  const canViewRecebimentos = canView('recebimentos_escolas');
  const canCreateRecebimentos = canCreate('recebimentos_escolas');
  const canEditRecebimentos = canEdit('recebimentos_escolas');
  const canDeleteRecebimentos = canDelete('recebimentos_escolas');

  // Carregar recebimentos quando a página for montada ou quando os filtros mudarem
  useEffect(() => {
    carregarRecebimentos(filtros);
    carregarEstatisticas(filtros);
  }, [carregarRecebimentos, carregarEstatisticas, filtros]);

  // Carregar escolas baseado no tipo de usuário
  useEffect(() => {
    if (user) {
      const tipoUsuario = user.tipo_de_acesso; // Usar tipo_de_acesso do backend
      carregarEscolas(tipoUsuario, user.id);
    }
  }, [user, carregarEscolas]);

  // Handlers de paginação
  const handlePageChange = (page) => {
    atualizarPaginacao({ currentPage: page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    atualizarPaginacao({ itemsPerPage, currentPage: 1 });
  };

  // Handler para criar recebimento
  const handleCriarRecebimento = () => {
    if (!canCreateRecebimentos) {
      toast.error('Você não tem permissão para criar recebimentos');
      return;
    }
    setModalAberto(true);
  };

  const handleSalvarRecebimento = async (dados) => {
    try {
      const resultado = await criarRecebimento(dados);
      if (resultado.success) {
        toast.success('Recebimento criado com sucesso!');
        setModalAberto(false);
        // Recarregar recebimentos após criar
        carregarRecebimentos();
      } else {
        toast.error(resultado.error || 'Erro ao criar recebimento');
      }
    } catch (error) {
      console.error('Erro ao criar recebimento:', error);
      toast.error('Erro ao criar recebimento');
    }
  };

  const handleVisualizarRecebimento = (recebimento) => {
    setRecebimentoSelecionado(recebimento);
    setModalVisualizacaoAberto(true);
  };

  const handleEditarRecebimento = (recebimento) => {
    if (!canEditRecebimentos) {
      toast.error('Você não tem permissão para editar recebimentos');
      return;
    }
    setRecebimentoSelecionado(recebimento);
    setModalAberto(true);
  };

  const handleExcluirRecebimento = async (recebimento) => {
    if (!canDeleteRecebimentos) {
      toast.error('Você não tem permissão para excluir recebimentos');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este recebimento?')) {
      try {
        const resultado = await excluirRecebimento(recebimento.id);
        if (resultado.success) {
          toast.success('Recebimento excluído com sucesso!');
          carregarRecebimentos();
        } else {
          toast.error(resultado.error || 'Erro ao excluir recebimento');
        }
      } catch (error) {
        console.error('Erro ao excluir recebimento:', error);
        toast.error('Erro ao excluir recebimento');
      }
    }
  };

  return (
    <>
      <RecebimentosLayout>
        {/* Header */}
        <RecebimentosEscolasHeader
          canCreate={canCreateRecebimentos}
          canView={canViewRecebimentos}
          onAddRecebimento={handleCriarRecebimento}
          onShowHelp={() => {}} // TODO: Implementar ajuda
            loading={loading}
          />

        {/* Estatísticas - sempre visíveis */}
        <RecebimentosStats
          recebimentos={todosRecebimentos}
          escola={filtros.escola}
          estatisticas={estatisticas}
        />

        {/* Abas */}
        <RecebimentosTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          userType={user?.tipo_de_acesso}
        />

        {/* Ações de Exportação - sempre visíveis */}
        <RecebimentosActions 
          canCreate={false}
          canExport={recebimentos && recebimentos.length > 0}
          onAdd={handleCriarRecebimento}
          onExportXLSX={exportarXLSX}
          onExportPDF={exportarPDF}
          loading={loading}
        />

        {/* Conteúdo da aba Lista de Recebimentos */}
        {activeTab === 'lista' && (
          <>
            {/* Filtros */}
            <RecebimentosFilters
              escolas={escolas}
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

            {/* Tabela de Recebimentos */}
            <RecebimentosTable
              recebimentos={recebimentos || []}
              loading={loading}
              canView={canViewRecebimentos}
              canEdit={canEditRecebimentos}
              canDelete={canDeleteRecebimentos}
              canCreate={canCreateRecebimentos}
              onView={handleVisualizarRecebimento}
              onEdit={handleEditarRecebimento}
              onDelete={handleExcluirRecebimento}
              onAdd={handleCriarRecebimento}
            />

            {/* Paginação */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </>
        )}

        {/* Conteúdo da aba Relatórios */}
        {activeTab === 'relatorios' && (
          <RelatoriosRecebimentos />
        )}
      </RecebimentosLayout>

      {/* Modal de Criação/Edição */}
      <RecebimentoModal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setRecebimentoSelecionado(null);
        }}
        onSave={handleSalvarRecebimento}
        escolas={escolas}
        recebimento={recebimentoSelecionado}
        loading={loading}
      />

      {/* Modal de Visualização */}
      <RecebimentoModal
        isOpen={modalVisualizacaoAberto}
        onClose={() => setModalVisualizacaoAberto(false)}
        onSave={() => {}} // Não salva no modo visualização
        escolas={escolas}
        recebimento={recebimentoSelecionado}
        loading={loading}
        isViewMode={true} // Modo somente leitura
      />
    </>
  );
};

export default RecebimentosEscolas;