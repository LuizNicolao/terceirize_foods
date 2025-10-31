import React from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAjusteNecessidadesOrchestrator } from '../../hooks/useAjusteNecessidadesOrchestrator';
import {
  NecessidadesLayout,
  NecessidadesLoading
} from '../../components/necessidades';
import NecessidadesTabs from '../../components/necessidades/NecessidadesTabs';
import AjusteHeader from '../../components/necessidades/ajuste/AjusteHeader';
import AjusteFiltros from '../../components/necessidades/ajuste/AjusteFiltros';
import AjusteTabelaNutricionista from '../../components/necessidades/ajuste/AjusteTabelaNutricionista';
import AjusteTabelaCoordenacao from '../../components/necessidades/ajuste/AjusteTabelaCoordenacao';
import AjusteTabelaLogistica from '../../components/necessidades/ajuste/AjusteTabelaLogistica';
import ModalProdutoExtra from '../../components/necessidades/ajuste/ModalProdutoExtra';
import AjusteActions from '../../components/necessidades/ajuste/AjusteActions';
import AjusteEmptyStates from '../../components/necessidades/ajuste/AjusteEmptyStates';
import { ConfirmModal } from '../../components/ui';
import { ExportButtons } from '../../components/shared';

const AjusteNecessidades = () => {
  const { user } = useAuth();
  const { canView, canEdit, loading: permissionsLoading } = usePermissions();
  
  // Hook principal que centraliza toda a lógica
  const {
    // Estados
    activeTab,
    setActiveTab,
    modalProdutoExtraAberto,
    ajustesLocais,
    buscaProduto,
    setBuscaProduto,
    necessidades,
    filtros,
    loading,
    error,
    necessidadesFiltradas,
    
    // Dados
    escolas,
    grupos,
    nutricionistas,
    opcoesSemanasConsumo,
    opcoesSemanasAbastecimento,
    loadingSemanaAbastecimento,
    statusAtual,
    
    // Handlers
    handleCarregarNecessidades,
    handleFiltroChange,
    handleAjusteChange,
    handleExcluirNecessidade,
    handleSalvarAjustes,
    handleLiberarCoordenacao,
    handleAbrirModalProdutoExtra,
    handleIncluirProdutosExtra,
    handleToggleProduto,
    handleSelecionarTodos,
    handleDesmarcarTodos,
    handleExportarExcel,
    handleExportarPDF,
    handleSearchProduto,
    
    // Modal helpers
    handleCloseModalProdutoExtra,
    handleClearSearch,
    
    // Estados do modal
    produtosDisponiveis,
    produtosSelecionados,
    searchProduto,
    
    // Estados de exclusão
    showDeleteConfirmModal,
    produtoToDelete,
    handleConfirmDelete,
    handleCloseDeleteModal
  } = useAjusteNecessidadesOrchestrator();

  // Verificar permissões específicas
  const tiposComAcesso = ['nutricionista', 'coordenador', 'supervisor', 'administrador'];
  const canViewAjuste = canView('analise_necessidades') || tiposComAcesso.includes(user.tipo_de_acesso);
  const canEditAjuste = canEdit('analise_necessidades') || tiposComAcesso.includes(user.tipo_de_acesso);

  // Verificar se pode visualizar
  if (permissionsLoading) {
    return <NecessidadesLoading />;
  }

  if (!canViewAjuste) {
    return (
      <NecessidadesLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o ajuste de necessidades.
          </p>
        </div>
      </NecessidadesLayout>
    );
  }

  return (
    <>
      <NecessidadesLayout hideHeader={true}>
        {/* Header com Status */}
        <AjusteHeader
          activeTab={activeTab}
          statusAtual={statusAtual}
        />

        {/* Abas */}
        <NecessidadesTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          userType={user?.tipo_de_acesso}
        />

        {/* Filtros */}
        <AjusteFiltros
          activeTab={activeTab}
          filtros={filtros}
          escolas={escolas}
          grupos={grupos}
          nutricionistas={nutricionistas}
          opcoesSemanasConsumo={opcoesSemanasConsumo}
          opcoesSemanasAbastecimento={opcoesSemanasAbastecimento}
          loading={loading}
          loadingSemanaAbastecimento={loadingSemanaAbastecimento}
          onFiltroChange={handleFiltroChange}
          onFiltrar={handleCarregarNecessidades}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Ações (Botões de Exportar) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Necessidades</h2>
            <div className="flex items-center gap-2">
              <ExportButtons
                onExportXLSX={handleExportarExcel}
                onExportPDF={handleExportarPDF}
                size="sm"
                variant="outline"
                showLabels={true}
                disabled={necessidadesFiltradas.length === 0}
              />
            </div>
          </div>
        </div>

        {/* Lista de Necessidades */}
        {necessidades.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <AjusteActions
              buscaProduto={buscaProduto}
              onBuscaChange={setBuscaProduto}
              onIncluirProduto={handleAbrirModalProdutoExtra}
              onSalvarAjustes={handleSalvarAjustes}
              onLiberar={handleLiberarCoordenacao}
              canEdit={canEditAjuste}
              activeTab={activeTab}
              statusAtual={statusAtual}
              filtros={filtros}
              titleIncluir={activeTab === 'coordenacao' && !filtros.escola_id ? 'Selecione uma escola e clique em Filtrar antes de incluir produtos' : undefined}
            />
            
            {/* Tabela de Produtos */}
            {activeTab === 'coordenacao' ? (
              <AjusteTabelaCoordenacao
                necessidades={necessidadesFiltradas}
                ajustesLocais={ajustesLocais}
                onAjusteChange={handleAjusteChange}
                onExcluirNecessidade={handleExcluirNecessidade}
                canEdit={canEditAjuste}
              />
            ) : activeTab === 'logistica' ? (
              <AjusteTabelaLogistica
                necessidades={necessidadesFiltradas}
                ajustesLocais={ajustesLocais}
                onAjusteChange={handleAjusteChange}
                onExcluirNecessidade={handleExcluirNecessidade}
                canEdit={canEditAjuste}
              />
            ) : (
              <AjusteTabelaNutricionista
                necessidades={necessidadesFiltradas}
                ajustesLocais={ajustesLocais}
                onAjusteChange={handleAjusteChange}
                onExcluirNecessidade={handleExcluirNecessidade}
                canEdit={canEditAjuste}
              />
            )}
          </div>
        ) : !loading && (
          <AjusteEmptyStates
            type="empty"
            message="Nenhuma necessidade encontrada"
          />
        )}

        {/* Mensagem quando busca não retorna resultados */}
        {necessidades.length > 0 && necessidadesFiltradas.length === 0 && (
          <AjusteEmptyStates
            type="busca"
            buscaProduto={buscaProduto}
            onClearSearch={handleClearSearch}
          />
        )}
      </NecessidadesLayout>

      {/* Modal de Produto Extra */}
      <ModalProdutoExtra
        isOpen={modalProdutoExtraAberto}
        onClose={handleCloseModalProdutoExtra}
        produtosDisponiveis={produtosDisponiveis}
        produtosSelecionados={produtosSelecionados}
        onToggleProduto={handleToggleProduto}
        onSelecionarTodos={handleSelecionarTodos}
        onDesmarcarTodos={handleDesmarcarTodos}
        onIncluirProdutos={handleIncluirProdutosExtra}
        searchProduto={searchProduto}
        onSearchChange={handleSearchProduto}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir o produto "${produtoToDelete?.produto}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
};

export default AjusteNecessidades;
