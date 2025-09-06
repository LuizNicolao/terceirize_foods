import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { usePatrimonios } from '../../hooks/usePatrimonios';
import PatrimoniosTable from './PatrimoniosTable';
import { Pagination, Modal, Button } from '../ui';
import PatrimoniosMovimentacaoForm from './PatrimoniosMovimentacaoForm';
import toast from 'react-hot-toast';

const PatrimoniosList = ({ 
  tipoLocal, 
  localId, 
  localNome, 
  canView, 
  canEdit, 
  canDelete,
  canMovimentar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para modais
  const [selectedPatrimonio, setSelectedPatrimonio] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [movimentacaoData, setMovimentacaoData] = useState({});
  
  const { 
    patrimonios, 
    loading, 
    totalItems, 
    totalPages,
    loadPatrimonios 
  } = usePatrimonios();

  useEffect(() => {
    if (localId) {
      loadPatrimonios({
        search: searchTerm,
        status: statusFilter,
        page: currentPage,
        limit: itemsPerPage,
        localId,
        tipoLocal
      });
    }
  }, [localId, tipoLocal, searchTerm, statusFilter, currentPage, itemsPerPage, loadPatrimonios]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Funções para modais
  const handleViewPatrimonio = (patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setShowViewModal(true);
  };

  const handleMovimentarPatrimonio = (patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setMovimentacaoData({
      patrimonio_id: patrimonio.id,
      local_destino_id: '',
      motivo: 'transferencia',
      observacoes: ''
    });
    setShowMovimentacaoModal(true);
  };

  const handleCloseModals = () => {
    setShowViewModal(false);
    setShowMovimentacaoModal(false);
    setSelectedPatrimonio(null);
    setMovimentacaoData({});
  };

  const handleMovimentacaoSuccess = () => {
    toast.success('Patrimônio movimentado com sucesso!');
    handleCloseModals();
    // Recarregar a lista de patrimônios
    loadPatrimonios({
      search: searchTerm,
      status: statusFilter,
      page: currentPage,
      limit: itemsPerPage,
      localId,
      tipoLocal
    });
  };

  if (!localId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Selecione um local para visualizar os patrimônios
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Patrimônios - {localNome}
          </h3>
          <p className="text-sm text-gray-500">
            {tipoLocal === 'filial' ? 'Filial' : 'Unidade Escolar'}
          </p>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Busca */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar patrimônios..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="manutencao">Manutenção</option>
            <option value="baixado">Baixado</option>
          </select>

          {/* Limpar Filtros */}
          {(searchTerm || statusFilter) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <FaTimes />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Patrimônios */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          <PatrimoniosTable
            patrimonios={patrimonios}
            canView={canView}
            canEdit={canEdit}
            canDelete={canDelete}
            canMovimentar={canMovimentar}
            onPatrimonioSelect={handleViewPatrimonio}
            onView={handleViewPatrimonio}
            onEdit={(patrimonio) => {
              toast.info('Funcionalidade de edição será implementada em breve');
            }}
            onDelete={(patrimonio) => {
              toast.info('Funcionalidade de exclusão será implementada em breve');
            }}
            onMovimentar={handleMovimentarPatrimonio}
          />

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}

        </>
      )}

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={handleCloseModals}
        title={`Patrimônio - ${selectedPatrimonio?.numero_patrimonio}`}
        size="lg"
      >
        {selectedPatrimonio && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número do Patrimônio</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPatrimonio.numero_patrimonio}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPatrimonio.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Produto</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPatrimonio.nome_produto}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Localização Atual</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPatrimonio.local_atual_nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Aquisição</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedPatrimonio.data_aquisicao ? new Date(selectedPatrimonio.data_aquisicao).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
            </div>
            {selectedPatrimonio.observacoes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPatrimonio.observacoes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Movimentação */}
      <PatrimoniosMovimentacaoForm
        isOpen={showMovimentacaoModal}
        onClose={handleCloseModals}
        patrimonio={selectedPatrimonio}
        movimentacaoData={movimentacaoData}
        onMovimentacaoDataChange={(field, value) => {
          setMovimentacaoData(prev => ({ ...prev, [field]: value }));
        }}
        onSubmit={handleMovimentacaoSuccess}
      />
    </div>
  );
};

export default PatrimoniosList;
