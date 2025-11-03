import React from 'react';
import { FaPlus, FaQuestionCircle, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../../contexts/PermissionsContext';
import { usePlanoAmostragem } from '../../hooks/usePlanoAmostragem';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { Button, ValidationErrorModal, ConfirmModal, ActionButtons } from '../../components/ui';
import { EmptyState } from '../../components/ui';
import NQAModal from '../../components/plano-amostragem/NQAModal';
import FaixaAmostragemModal from '../../components/plano-amostragem/FaixaAmostragemModal';
import VincularGrupoModal from '../../components/plano-amostragem/VincularGrupoModal';
import FaixasTable from '../../components/plano-amostragem/FaixasTable';
import { PlanoAmostragemStats } from '../../components/plano-amostragem';
import { AuditModal } from '../../components/shared';

const PlanoAmostragem = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    nqas,
    nqasLoading,
    faixasPorNQA,
    gruposPorNQA,
    showModalFaixa,
    showModalGrupo,
    showModalNQA,
    editingFaixa,
    editingNQA,
    viewMode,
    nqaSelecionado,
    validationErrors,
    showValidationModal,
    handleAddFaixa,
    handleEditFaixa,
    handleViewFaixa,
    handleDeleteFaixa,
    handleSaveFaixa,
    handleVincularGrupo,
    handleSaveVinculoGrupo,
    handleAddNQA,
    handleEditNQA,
    handleSaveNQA,
    handleDeleteNQA,
    handleDesvincularGrupo,
    handleCloseValidationModal,
    setShowModalFaixa,
    setShowModalGrupo,
    setShowModalNQA,
    setEditingFaixa,
    setEditingNQA,
    estatisticas
  } = usePlanoAmostragem();

  const {
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    auditPagination,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleAuditPageChange,
    handleAuditItemsPerPageChange,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useAuditoria('plano_amostragem');

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [faixaToDelete, setFaixaToDelete] = React.useState(null);
  const [showDeleteNQAConfirm, setShowDeleteNQAConfirm] = React.useState(false);
  const [nqaToDelete, setNqaToDelete] = React.useState(null);
  const [showDesvincularGrupoConfirm, setShowDesvincularGrupoConfirm] = React.useState(false);
  const [grupoToDesvincular, setGrupoToDesvincular] = React.useState(null);

  const handleDeleteClick = (faixa) => {
    setFaixaToDelete(faixa);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (faixaToDelete) {
      await handleDeleteFaixa(faixaToDelete);
      setShowDeleteConfirm(false);
      setFaixaToDelete(null);
    }
  };

  const handleDeleteNQAClick = (nqa) => {
    // Verificar se NQA tem faixas ou grupos vinculados
    const faixas = faixasPorNQA[nqa.id] || [];
    const grupos = gruposPorNQA[nqa.id] || [];
    
    if (faixas.length > 0 || grupos.length > 0) {
      let mensagem = 'Este NQA não pode ser excluído pois possui:';
      if (faixas.length > 0) {
        mensagem += `\n• ${faixas.length} faixa(s) de amostragem vinculada(s)`;
      }
      if (grupos.length > 0) {
        mensagem += `\n• ${grupos.length} grupo(s) vinculado(s)`;
      }
      mensagem += '\n\nPor favor, remova os vínculos antes de excluir o NQA.';
      
      toast.error(mensagem, {
        duration: 6000,
        style: {
          whiteSpace: 'pre-line'
        }
      });
      return;
    }
    
    setNqaToDelete(nqa);
    setShowDeleteNQAConfirm(true);
  };

  const handleConfirmDeleteNQA = async () => {
    if (nqaToDelete) {
      await handleDeleteNQA(nqaToDelete);
      setShowDeleteNQAConfirm(false);
      setNqaToDelete(null);
    }
  };

  const handleDesvincularGrupoClick = (grupo) => {
    setGrupoToDesvincular(grupo);
    setShowDesvincularGrupoConfirm(true);
  };

  const handleConfirmDesvincularGrupo = async () => {
    if (grupoToDesvincular) {
      await handleDesvincularGrupo(grupoToDesvincular);
      setShowDesvincularGrupoConfirm(false);
      setGrupoToDesvincular(null);
    }
  };

  const getNivelInspecaoLabel = (nivel) => {
    const labels = {
      'I': 'Reduzida',
      'II': 'Normal',
      'III': 'Rigorosa'
    };
    return labels[nivel] || nivel;
  };

  const getNivelInspecaoColor = (nivel) => {
    const colors = {
      'I': 'bg-blue-100 text-blue-800',
      'II': 'bg-green-100 text-green-800',
      'III': 'bg-red-100 text-red-800'
    };
    return colors[nivel] || 'bg-gray-100 text-gray-800';
  };

  if (nqasLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Plano de Amostragem</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
          {canCreate('plano_amostragem') && (
            <>
              <Button onClick={handleVincularGrupo} size="sm" variant="outline">
                <FaPlus className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Vincular Grupo</span>
                <span className="sm:hidden">Vincular</span>
              </Button>
              <Button onClick={handleAddNQA} size="sm">
                <FaPlus className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Adicionar NQA</span>
                <span className="sm:hidden">NQA</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <PlanoAmostragemStats estatisticas={estatisticas} />

      {/* Cards de NQAs */}
      {nqas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <EmptyState
            title="Nenhum NQA cadastrado"
            description="Comece adicionando seu primeiro NQA"
            icon="default"
            showContainer={false}
          />
          {canCreate('plano_amostragem') && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleAddNQA} size="sm">
                <FaPlus className="mr-2" />
                Adicionar Primeiro NQA
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {nqas.map((nqa) => {
            const faixas = faixasPorNQA[nqa.id] || [];
            const grupos = gruposPorNQA[nqa.id] || [];

            return (
              <div key={nqa.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header do Card */}
                <div className={`px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">NQA {nqa.codigo}</h3>
                      <p className="text-sm text-green-100">{nqa.nome}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getNivelInspecaoColor(nqa.nivel_inspecao)}`}>
                      {getNivelInspecaoLabel(nqa.nivel_inspecao)}
                    </span>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4">
                  {/* Estatísticas */}
                  <div className="flex gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">{faixas.length}</span> faixa(s)
                    </div>
                    <div>
                      <span className="font-semibold">{grupos.length}</span> grupo(s)
                    </div>
                  </div>

                  {/* Tabela de Faixas */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">Faixas de Lote</h4>
                      {canCreate('plano_amostragem') && (
                        <Button
                          onClick={() => handleAddFaixa(nqa.id)}
                          size="xs"
                          variant="ghost"
                          className="text-xs"
                        >
                          <FaPlus className="mr-1" />
                          Adicionar
                        </Button>
                      )}
                    </div>
                    <FaixasTable
                      faixas={faixas}
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={handleViewFaixa}
                      onEdit={handleEditFaixa}
                      onDelete={handleDeleteClick}
                    />
                  </div>

                  {/* Grupos Vinculados */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Grupos Vinculados</h4>
                    {grupos.length === 0 ? (
                      <p className="text-xs text-gray-500">Nenhum grupo vinculado</p>
                    ) : (
                      <ul className="space-y-1">
                        {grupos.map((grupo) => (
                          <li key={grupo.id} className="text-xs text-gray-600 flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              <span>{grupo.grupo_nome} ({grupo.grupo_codigo})</span>
                            </div>
                            {canDelete('plano_amostragem') && (
                              <button
                                onClick={() => handleDesvincularGrupoClick(grupo)}
                                className="ml-2 text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                                title="Desvincular grupo"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end">
                    <ActionButtons
                      canView={false}
                      canEdit={canEdit('plano_amostragem')}
                      canDelete={canDelete('plano_amostragem') && (faixas.length === 0 && grupos.length === 0)}
                      onEdit={handleEditNQA}
                      onDelete={handleDeleteNQAClick}
                      item={nqa}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <NQAModal
        isOpen={showModalNQA}
        onClose={() => {
          setShowModalNQA(false);
          setEditingNQA(null);
        }}
        onSubmit={handleSaveNQA}
        nqa={editingNQA}
        isViewMode={viewMode}
      />

      <FaixaAmostragemModal
        isOpen={showModalFaixa}
        onClose={() => {
          setShowModalFaixa(false);
          setEditingFaixa(null);
        }}
        onSubmit={handleSaveFaixa}
        faixa={editingFaixa}
        isViewMode={viewMode}
        nqaSelecionado={nqaSelecionado}
      />

      <VincularGrupoModal
        isOpen={showModalGrupo}
        onClose={() => setShowModalGrupo(false)}
        onSubmit={handleSaveVinculoGrupo}
      />

      {/* Modal de Confirmação de Exclusão de Faixa */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setFaixaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Faixa de Amostragem"
        message={`Tem certeza que deseja excluir esta faixa de amostragem?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Confirmação de Exclusão de NQA */}
      <ConfirmModal
        isOpen={showDeleteNQAConfirm}
        onClose={() => {
          setShowDeleteNQAConfirm(false);
          setNqaToDelete(null);
        }}
        onConfirm={handleConfirmDeleteNQA}
        title="Excluir NQA"
        message={`Tem certeza que deseja excluir o NQA "${nqaToDelete?.codigo} - ${nqaToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Confirmação de Desvinculação de Grupo */}
      <ConfirmModal
        isOpen={showDesvincularGrupoConfirm}
        onClose={() => {
          setShowDesvincularGrupoConfirm(false);
          setGrupoToDesvincular(null);
        }}
        onConfirm={handleConfirmDesvincularGrupo}
        title="Desvincular Grupo"
        message={`Tem certeza que deseja desvincular o grupo "${grupoToDesvincular?.grupo_nome} (${grupoToDesvincular?.grupo_codigo})" deste NQA?`}
        confirmText="Desvincular"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Plano de Amostragem"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        auditPagination={auditPagination}
        onApplyFilters={handleApplyAuditFilters}
        onPageChange={handleAuditPageChange}
        onItemsPerPageChange={handleAuditItemsPerPageChange}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />

      {/* Modal de Erros de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />
    </div>
  );
};

export default PlanoAmostragem;

