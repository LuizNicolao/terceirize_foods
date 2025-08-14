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
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import { FaPlus } from 'react-icons/fa';

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

  // Abrir modal de criação
  const handleCreate = () => {
    setModalMode('create');
    setSelectedProdutoGenerico(null);
    setShowModal(true);
  };

  // Abrir modal de edição
  const handleEdit = async (id) => {
    setModalMode('edit');
    
    try {
      const produtoGenerico = await buscarProdutoGenericoPorId(id);
      if (produtoGenerico) {
        setSelectedProdutoGenerico(produtoGenerico);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Erro ao buscar produto genérico:', error);
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
              

              

            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {statistics && (
          <ProdutosGenericosStats estatisticas={statistics} />
        )}

        {/* Filtros */}
        <CadastroFilterBar
          searchTerm={filters.search}
          onSearchChange={(value) => atualizarFiltros({ ...filters, search: value })}
          statusFilter={filters.status}
          onStatusFilterChange={(value) => atualizarFiltros({ ...filters, status: value })}
          onClear={limparFiltros}
          placeholder="Buscar por nome..."
          additionalFilters={[
            {
              label: 'Grupo',
              value: filters.grupo_id,
              onChange: (value) => atualizarFiltros({ ...filters, grupo_id: value }),
              options: [
                { value: '', label: 'Todos os Grupos' },
                ...grupos.map(grupo => ({
                  value: grupo.id.toString(),
                  label: grupo.nome
                }))
              ]
            },
            {
              label: 'Subgrupo',
              value: filters.subgrupo_id,
              onChange: (value) => atualizarFiltros({ ...filters, subgrupo_id: value }),
              options: [
                { value: '', label: 'Todos os Subgrupos' },
                ...subgrupos.map(subgrupo => ({
                  value: subgrupo.id.toString(),
                  label: subgrupo.nome
                }))
              ]
            },
            {
              label: 'Classe',
              value: filters.classe_id,
              onChange: (value) => atualizarFiltros({ ...filters, classe_id: value }),
              options: [
                { value: '', label: 'Todas as Classes' },
                ...classes.map(classe => ({
                  value: classe.id.toString(),
                  label: classe.nome
                }))
              ]
            },
            {
              label: 'Produto Origem',
              value: filters.produto_origem_id,
              onChange: (value) => atualizarFiltros({ ...filters, produto_origem_id: value }),
              options: [
                { value: '', label: 'Todos os Produtos Origem' },
                ...produtosOrigem.map(produto => ({
                  value: produto.id.toString(),
                  label: produto.nome
                }))
              ]
            }
          ]}
        />

        {/* Ações */}
        <ProdutosGenericosActions
          onExportXLSX={exportarXLSX}
          onExportPDF={exportarPDF}
        />

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ProdutosGenericosTable
            produtosGenericos={produtosGenericos}
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
              onItemsPerPageChange={mudarLimite}
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
