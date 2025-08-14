/**
 * Página de Produto Genérico
 * Interface principal para gerenciamento de produtos genéricos
 */

import React, { useState } from 'react';
import { useProdutoGenerico } from '../../hooks/useProdutoGenerico';
import ProdutoGenericoModal from '../../components/produto-generico/ProdutoGenericoModal';
import ProdutosGenericosTable from '../../components/produto-generico/ProdutosGenericosTable';
import ProdutosGenericosStats from '../../components/produto-generico/ProdutosGenericosStats';
import ProdutosGenericosActions from '../../components/produto-generico/ProdutosGenericosActions';
import ProdutosGenericosFilters from '../../components/produto-generico/ProdutosGenericosFilters';
import Pagination from '../../components/shared/Pagination';
import { FaPlus, FaSearch, FaFilter, FaDownload, FaFileExcel, FaFilePdf } from 'react-icons/fa';

const ProdutoGenerico = () => {
  const {
    produtosGenericos,
    loading,
    pagination,
    statistics,
    filters,
    grupos,
    subgrupos,
    classes,
    produtosOrigem,
    unidadesMedida,
    carregarProdutosGenericos,
    buscarProdutoGenericoPorId,
    criarProdutoGenerico,
    atualizarProdutoGenerico,
    excluirProdutoGenerico,
    exportarXLSX,
    exportarPDF,
    atualizarFiltros,
    limparFiltros,
    mudarPagina,
    mudarLimite
  } = useProdutoGenerico();

  // Estados locais
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' ou 'edit'
  const [selectedProdutoGenerico, setSelectedProdutoGenerico] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Abrir modal de criação
  const handleCreate = () => {
    setModalMode('create');
    setSelectedProdutoGenerico(null);
    setShowModal(true);
  };

  // Abrir modal de edição
  const handleEdit = async (id) => {
    setModalMode('edit');
    setLoading(true);
    
    try {
      const produtoGenerico = await buscarProdutoGenericoPorId(id);
      if (produtoGenerico) {
        setSelectedProdutoGenerico(produtoGenerico);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Erro ao buscar produto genérico:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProdutoGenerico(null);
  };

  // Salvar produto genérico
  const handleSave = async (data) => {
    try {
      if (modalMode === 'create') {
        await criarProdutoGenerico(data);
      } else {
        await atualizarProdutoGenerico(selectedProdutoGenerico.id, data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar produto genérico:', error);
    }
  };

  // Excluir produto genérico
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto genérico?')) {
      await excluirProdutoGenerico(id);
    }
  };

  // Aplicar filtros
  const handleApplyFilters = (newFilters) => {
    atualizarFiltros(newFilters);
    setShowFilters(false);
  };

  // Limpar filtros
  const handleClearFilters = () => {
    limparFiltros();
    setShowFilters(false);
  };

  // Exportar dados
  const handleExportXLSX = () => {
    exportarXLSX();
  };

  const handleExportPDF = () => {
    exportarPDF();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Produtos Genéricos</h1>
              <p className="text-gray-600 mt-1">
                Gerencie os produtos genéricos do sistema
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="mr-2" />
                Novo Produto Genérico
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FaFilter className="mr-2" />
                Filtros
              </button>
              
              <div className="relative">
                <button
                  onClick={handleExportXLSX}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaFileExcel className="mr-2" />
                  Exportar XLSX
                </button>
              </div>
              
              <div className="relative">
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FaFilePdf className="mr-2" />
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {statistics && (
          <ProdutosGenericosStats statistics={statistics} />
        )}

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <ProdutosGenericosFilters
              filters={filters}
              grupos={grupos}
              subgrupos={subgrupos}
              classes={classes}
              produtosOrigem={produtosOrigem}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ProdutosGenericosTable
            produtosGenericos={produtosGenericos}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Paginação */}
        {pagination && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={mudarPagina}
              onLimitChange={mudarLimite}
            />
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <ProdutoGenericoModal
            isOpen={showModal}
            onClose={handleCloseModal}
            mode={modalMode}
            produtoGenerico={selectedProdutoGenerico}
            grupos={grupos}
            subgrupos={subgrupos}
            classes={classes}
            produtosOrigem={produtosOrigem}
            unidadesMedida={unidadesMedida}
            onSubmit={handleSave}
          />
        )}
      </div>
    </div>
  );
};

export default ProdutoGenerico;
