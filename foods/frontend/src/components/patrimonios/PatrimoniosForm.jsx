import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal } from '../ui';
import { useHistoricoPatrimonio } from '../../hooks/useHistoricoPatrimonio';
import DadosTab from './abas/DadosTab';
import HistoricoTab from './abas/HistoricoTab';

const PatrimoniosForm = ({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  produtosEquipamentos,
  produtosLoading,
  onLoadProdutos,
  saving,
  isEdit,
  isViewMode,
  onSubmit,
  filiais,
  filiaisLoading,
  movimentacoes = [],
  loadingMovimentacoes = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dados');
  
  // Hook personalizado para gerenciar histórico
  const {
    filtrosHistorico,
    setFiltrosHistorico,
    paginaHistorico,
    setPaginaHistorico,
    itensPorPagina,
    movimentacoesFiltradas,
    movimentacoesPaginadas,
    totalPaginas,
    limparFiltros
  } = useHistoricoPatrimonio(movimentacoes);

  // Função otimizada para preencher dados do produto
  const preencherDadosProduto = useCallback((produto) => {
    if (produto && produto.nome) {
      setSearchTerm(produto.nome);
      // Preencher marca e fabricante automaticamente
      if (produto.marca) {
        onFormDataChange('marca', produto.marca);
      }
      if (produto.fabricante) {
        onFormDataChange('fabricante', produto.fabricante);
      }
    }
  }, [onFormDataChange]);

  useEffect(() => {
    if (isOpen && produtosEquipamentos.length === 0) {
      onLoadProdutos();
    }
  }, [isOpen, produtosEquipamentos.length, onLoadProdutos]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Preencher marca e fabricante automaticamente quando produto for selecionado
  useEffect(() => {
    if (formData.produto_id && produtosEquipamentos.length > 0) {
      const produto = produtosEquipamentos.find(p => p.id === formData.produto_id);
      if (produto) {
        preencherDadosProduto(produto);
      }
    }
  }, [formData.produto_id, produtosEquipamentos, preencherDadosProduto]);

  // Preencher o searchTerm quando produtosEquipamentos mudar e estiver em modo de visualização
  useEffect(() => {
    if (isViewMode && isOpen && formData.produto_id && produtosEquipamentos.length > 0) {
      const produto = produtosEquipamentos.find(p => p.id === formData.produto_id);
      if (produto && produto.nome) {
        setSearchTerm(produto.nome);
      }
    }
  }, [isViewMode, isOpen, formData.produto_id, produtosEquipamentos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const filteredProdutos = Array.isArray(produtosEquipamentos) ? produtosEquipamentos.filter(produto =>
    (produto.nome && produto.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (produto.codigo_produto && produto.codigo_produto.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Patrimônio' : isEdit ? 'Editar Patrimônio' : 'Adicionar Patrimônio'}
      size="full"
    >
      {/* Abas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dados'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dados
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historico')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'historico'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Histórico
          </button>
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'dados' ? (
        <DadosTab
          formData={formData}
          onFormDataChange={onFormDataChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          produtosEquipamentos={produtosEquipamentos}
          produtosLoading={produtosLoading}
          filteredProdutos={filteredProdutos}
          filiais={filiais}
          filiaisLoading={filiaisLoading}
          isViewMode={isViewMode}
          isEdit={isEdit}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      ) : (
        <HistoricoTab
          movimentacoes={movimentacoes}
          loadingMovimentacoes={loadingMovimentacoes}
          filtrosHistorico={filtrosHistorico}
          onFiltrosChange={setFiltrosHistorico}
          onLimparFiltros={limparFiltros}
          paginaHistorico={paginaHistorico}
          setPaginaHistorico={setPaginaHistorico}
          itensPorPagina={itensPorPagina}
          movimentacoesFiltradas={movimentacoesFiltradas}
          movimentacoesPaginadas={movimentacoesPaginadas}
          totalPaginas={totalPaginas}
        />
      )}
    </Modal>
  );
};

export default PatrimoniosForm;
