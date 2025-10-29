import React, { useState } from 'react';
import { FaPlus, FaUpload } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRegistrosDiarios } from '../../hooks/useRegistrosDiarios';
import { Button, ConfirmModal } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ExportButtons } from '../../components/shared';
import { 
  RegistrosDiariosModal, 
  RegistrosDiariosTable, 
  RegistrosDiariosStats,
  RegistrosDiariosFilters
} from '../../components/registros-diarios';
import ImportRegistrosModal from '../../components/registros-diarios/ImportRegistrosModal';

const RegistrosDiarios = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    registros,
    loading,
    saving,
    showModal,
    editingRegistro,
    viewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    onSubmit,
    handleDeleteRegistro,
    handleAddRegistro,
    handleEditRegistro,
    handleViewRegistro,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleEscolaFilterChange,
    handleDataInicioChange,
    handleDataFimChange,
    clearFiltros
  } = useRegistrosDiarios();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRegistro, setDeletingRegistro] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const handleDeleteClick = (escolaId, data) => {
    setDeletingRegistro({ escolaId, data });
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    if (deletingRegistro) {
      handleDeleteRegistro(deletingRegistro.escolaId, deletingRegistro.data);
      setShowDeleteConfirm(false);
      setDeletingRegistro(null);
    }
  };
  
  const handleExportXLSX = () => {
    // TODO: Implementar exportação para Excel
    console.log('Exportar para Excel');
  };
  
  const handleExportPDF = () => {
    // TODO: Implementar exportação para PDF
    console.log('Exportar para PDF');
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleImportSuccess = (data) => {
    // Recarregar registros após importação bem-sucedida
    if (data && (data.importados > 0 || data.atualizados > 0)) {
      // Recarregar a página para mostrar os novos dados
      window.location.reload();
    }
  };
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quantidade Servida</h1>
          <p className="text-sm text-gray-600 mt-1">
            Registre diariamente as quantidades de refeições servidas por escola
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {canCreate('registros_diarios') && (
            <>
              <Button onClick={handleImportClick} size="sm" variant="outline" className="flex items-center space-x-2">
                <FaUpload size={14} />
                <span>Importar</span>
              </Button>
              <Button onClick={handleAddRegistro} size="sm">
                <FaPlus className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Novo Registro</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Estatísticas */}
      <RegistrosDiariosStats estatisticas={estatisticas} />
      
      {/* Filtros */}
      <RegistrosDiariosFilters
        onFilter={(filters) => {
          if (filters.escola_id) handleEscolaFilterChange(filters.escola_id);
          if (filters.data_inicio) handleDataInicioChange(filters.data_inicio);
          if (filters.data_fim) handleDataFimChange(filters.data_fim);
        }}
        onClear={clearFiltros}
      />
      
      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('registros_diarios')}
        />
      </div>
      
      {/* Tabela de Registros */}
      <RegistrosDiariosTable
        registros={registros}
        canView={canView('registros_diarios')}
        canEdit={canEdit('registros_diarios')}
        canDelete={canDelete('registros_diarios')}
        onView={handleViewRegistro}
        onEdit={handleEditRegistro}
        onDelete={handleDeleteClick}
        loading={loading}
      />
      
      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
      
      {/* Modal de Cadastro/Edição */}
      <RegistrosDiariosModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={onSubmit}
        registro={editingRegistro}
        isViewMode={viewMode}
      />
      
      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir todos os registros desta data?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      {/* Modal de Import */}
      <ImportRegistrosModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default RegistrosDiarios;

