import React, { useState } from 'react';
import { FaPlus, FaUpload } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useQuantidadesServidas } from '../../hooks/useQuantidadesServidas';
import { Button, ConfirmModal } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ExportButtons } from '../../components/shared';
import { 
  QuantidadesServidasModal, 
  QuantidadesServidasTable, 
  QuantidadesServidasStats,
  QuantidadesServidasFilters,
  ModalValidacaoExclusao
} from '../../components/quantidades-servidas';
import ImportRegistrosModal from '../../components/quantidades-servidas/ImportRegistrosModal';
import ModalExportRegistros from '../../components/quantidades-servidas/ModalExportRegistros';

const QuantidadesServidas = () => {
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
    unidadeFilter,
    dataInicio,
    dataFim,
    estatisticas,
    onSubmit,
    handleDeleteRegistro,
    handleAddRegistro,
    handleEditRegistro,
    handleViewRegistro,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleUnidadeFilterChange,
    handleDataInicioChange,
    handleDataFimChange,
    clearFiltros,
    loadRegistros,
    loadEstatisticas
  } = useQuantidadesServidas();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRegistro, setDeletingRegistro] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showValidacaoExclusao, setShowValidacaoExclusao] = useState(false);
  const [unidadeParaExclusao, setUnidadeParaExclusao] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [tipoFormatoExport, setTipoFormatoExport] = useState(null); // 'xlsx' ou 'pdf'
  
  const handleDeleteClick = (unidadeId, data, unidadeNome, tipoCardapioId = undefined) => {
    // Usar o novo modal de validação em vez do modal simples
    setUnidadeParaExclusao({ id: unidadeId, nome: unidadeNome, tipo_cardapio_id: tipoCardapioId });
    setShowValidacaoExclusao(true);
  };
  
  const confirmDelete = () => {
    if (deletingRegistro) {
      handleDeleteRegistro(deletingRegistro.unidadeId, deletingRegistro.data);
      setShowDeleteConfirm(false);
      setDeletingRegistro(null);
    }
  };

  const filtrosExportacao = {
    unidade_id: unidadeFilter || undefined,
    data_inicio: dataInicio || undefined,
    data_fim: dataFim || undefined
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

  const handleEditFromHistorico = (registroHistorico) => {
    handleCloseModal();

    setTimeout(() => {
      handleEditRegistro(registroHistorico);
    }, 0);
  };

  const handleConfirmExclusao = () => {
    // Recarregar dados após exclusão
    loadRegistros();
    loadEstatisticas();
  };

  const handleCloseValidacaoExclusao = () => {
    setShowValidacaoExclusao(false);
    setUnidadeParaExclusao(null);
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
          {canCreate('quantidades_servidas') && (
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
      <QuantidadesServidasStats estatisticas={estatisticas} />
      
      {/* Filtros */}
      <QuantidadesServidasFilters
        onFilter={(filters) => {
          if (filters.unidade_id) handleUnidadeFilterChange(filters.unidade_id);
          if (filters.data_inicio) handleDataInicioChange(filters.data_inicio);
          if (filters.data_fim) handleDataFimChange(filters.data_fim);
        }}
        onClear={clearFiltros}
      />
      
      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={() => {
            setTipoFormatoExport('xlsx');
            setShowExportModal(true);
          }}
          onExportPDF={() => {
            setTipoFormatoExport('pdf');
            setShowExportModal(true);
          }}
          disabled={!canView('quantidades_servidas')}
        />
      </div>
      
      {/* Tabela de Registros */}
      <QuantidadesServidasTable
        registros={registros}
        canView={canView('quantidades_servidas')}
        canEdit={canEdit('quantidades_servidas')}
        canDelete={canDelete('quantidades_servidas')}
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
      <QuantidadesServidasModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={onSubmit}
        registro={editingRegistro}
        isViewMode={viewMode}
        onRequestEdit={handleEditFromHistorico}
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

      {/* Modal de Validação de Exclusão */}
      <ModalValidacaoExclusao
        isOpen={showValidacaoExclusao}
        onClose={handleCloseValidacaoExclusao}
        unidadeId={unidadeParaExclusao?.id}
        unidadeNome={unidadeParaExclusao?.nome}
        onConfirmExclusao={handleConfirmExclusao}
      />

      {/* Modal de Exportação */}
      <ModalExportRegistros
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setTipoFormatoExport(null);
        }}
        filtros={filtrosExportacao}
        tipoFormato={tipoFormatoExport}
      />
    </div>
  );
};

export default QuantidadesServidas;

