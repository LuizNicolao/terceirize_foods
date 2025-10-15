import React from 'react';
import { FaPlus, FaCalendarCheck } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRegistrosDiarios } from '../../hooks/useRegistrosDiarios';
import { Button, ConfirmModal } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { 
  RegistrosDiariosModal, 
  RegistrosDiariosTable, 
  RegistrosDiariosStats 
} from '../../components/registros-diarios';

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
    handleItemsPerPageChange
  } = useRegistrosDiarios();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deletingRegistro, setDeletingRegistro] = React.useState(null);
  
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
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaCalendarCheck className="mr-2 text-green-600" />
            Registros Diários de Refeições
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Registre diariamente as quantidades de refeições servidas
          </p>
        </div>
        
        {canCreate('registros_diarios') && (
          <Button onClick={handleAddRegistro} size="sm" className="mt-4 sm:mt-0">
            <FaPlus className="mr-2" />
            Novo Registro
          </Button>
        )}
      </div>
      
      {/* Estatísticas */}
      <RegistrosDiariosStats estatisticas={estatisticas} />
      
      {/* Tabela */}
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
    </div>
  );
};

export default RegistrosDiarios;

