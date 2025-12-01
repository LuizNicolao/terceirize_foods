import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle, FaUpload } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNotaFiscal } from '../../hooks/useNotaFiscal';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import { Button, ValidationErrorModal, ConfirmModal, Pagination } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import NotaFiscalModal from '../../components/notas-fiscais/NotaFiscalModal';
import NotaFiscalTable from '../../components/notas-fiscais/NotaFiscalTable';
import NotasFiscaisStats from '../../components/notas-fiscais/NotasFiscaisStats';
import ImportNotasFiscaisModal from '../../components/notas-fiscais/ImportNotasFiscaisModal';
import { AuditModal, ExportButtons } from '../../components/shared';
import notaFiscalService from '../../services/notaFiscalService';
import FornecedoresService from '../../services/fornecedores';
import FiliaisService from '../../services/filiais';
import toast from 'react-hot-toast';

const NotasFiscais = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    notasFiscais,
    notaFiscalSelecionada,
    loading,
    estatisticas,
    pagination,
    filters,
    sortField,
    sortDirection,
    carregarNotasFiscais,
    carregarNotaFiscal,
    criarNotaFiscal,
    atualizarNotaFiscal,
    excluirNotaFiscal,
    atualizarFiltros,
    atualizarPaginacao,
    limparSelecao,
    setNotaFiscalSelecionada,
    handlePrintNotaFiscal,
    onSort
  } = useNotaFiscal();

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
  } = useAuditoria('notas_fiscais');

  // Hook de exportação
  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(notaFiscalService);

  // Funções wrapper para exportação com filtros
  const handleExportXLSX = React.useCallback(() => {
    const params = {
      search: filters.search || undefined,
      status: filters.status || undefined,
      tipo_nota: filters.tipo_nota || undefined
    };
    return exportXLSX(params);
  }, [exportXLSX, filters]);

  const handleExportPDF = React.useCallback(() => {
    const params = {
      search: filters.search || undefined,
      status: filters.status || undefined,
      tipo_nota: filters.tipo_nota || undefined
    };
    return exportPDF(params);
  }, [exportPDF, filters]);

  // Estados locais
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [notaFiscalToDelete, setNotaFiscalToDelete] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);

  // Carregar dados auxiliares
  useEffect(() => {
    const carregarDadosAuxiliares = async () => {
      try {
        const [fornecedoresRes, filiaisRes] = await Promise.all([
          FornecedoresService.listar({ limit: 1000, status: 1 }),
          FiliaisService.buscarAtivas()
        ]);

        if (fornecedoresRes.success) {
          setFornecedores(fornecedoresRes.data || []);
        }

        if (filiaisRes.success) {
          setFiliais(filiaisRes.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados auxiliares:', error);
      }
    };

    carregarDadosAuxiliares();
  }, []);

  // Handlers
  const handleAddNotaFiscal = () => {
    limparSelecao();
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewNotaFiscal = async (notaFiscal) => {
    const nota = await carregarNotaFiscal(notaFiscal.id);
    if (nota) {
      setNotaFiscalSelecionada(nota);
      setViewMode(true);
      setShowModal(true);
    }
  };

  const handleEditNotaFiscal = async (notaFiscal) => {
    const nota = await carregarNotaFiscal(notaFiscal.id);
    if (nota) {
      setNotaFiscalSelecionada(nota);
      setViewMode(false);
      setShowModal(true);
    }
  };

  const handleDeleteNotaFiscal = (notaFiscal) => {
    setNotaFiscalToDelete(notaFiscal);
    setShowDeleteConfirmModal(true);
  };

  const handleDownloadArquivo = async (notaFiscal) => {
    if (!notaFiscal.xml_path || !notaFiscal.xml_path.trim()) {
      toast.error('Arquivo não disponível para esta nota fiscal');
      return;
    }

    try {
      const resultado = await notaFiscalService.downloadArquivo(notaFiscal.id, notaFiscal.xml_path);
      if (resultado.success) {
        toast.success('Arquivo baixado com sucesso');
      } else {
        toast.error(resultado.error || 'Erro ao baixar arquivo');
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error('Erro ao baixar arquivo');
    }
  };

  const handleConfirmDelete = async () => {
    if (notaFiscalToDelete) {
      const sucesso = await excluirNotaFiscal(notaFiscalToDelete.id);
      if (sucesso) {
        setShowDeleteConfirmModal(false);
        setNotaFiscalToDelete(null);
      }
    }
  };


  const handleSubmitNotaFiscal = async (notaFiscalData) => {
    try {
      let resultado;
      
      if (notaFiscalSelecionada) {
        resultado = await atualizarNotaFiscal(notaFiscalSelecionada.id, notaFiscalData);
      } else {
        resultado = await criarNotaFiscal(notaFiscalData);
      }

      if (resultado) {
        setShowModal(false);
        limparSelecao();
      } else {
        // Não mostrar modal de validação se o erro já foi exibido via toast
        // (ex: erro de duplicação de nota fiscal)
        // O hook já trata e exibe os erros via toast
      }
    } catch (error) {
      console.error('Erro ao salvar nota fiscal:', error);
      // Verificar se é erro de duplicação (409) ou outro erro que já foi exibido via toast
      const isConflictError = error.response?.status === 409;
      const hasValidationErrors = error.response?.data?.errors;
      
      // Só mostrar modal se houver erros de validação e não for erro de conflito
      if (hasValidationErrors && !isConflictError) {
        setValidationErrors(error.response.data);
        setShowValidationModal(true);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    limparSelecao();
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setNotaFiscalToDelete(null);
  };

  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
    setValidationErrors(null);
  };

  const handlePageChange = (page) => {
    atualizarPaginacao({ page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    atualizarPaginacao({ limit: itemsPerPage, page: 1 });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      carregarNotasFiscais();
    }
  };

  const handleClearFilters = () => {
    atualizarFiltros({
      search: '',
      status: '',
      tipo_nota: '',
      fornecedor_id: '',
      filial_id: '',
      data_inicio: '',
      data_fim: ''
    });
  };

  // Funções auxiliares
  const getFornecedorName = (fornecedorId) => {
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    return fornecedor ? fornecedor.razao_social : '';
  };

  const getFilialName = (filialId) => {
    const filial = filiais.find(f => f.id === filialId);
    return filial ? filial.filial : '';
  };

  if (loading && notasFiscais.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notas fiscais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Notas Fiscais</h1>
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
          {canCreate('notas_fiscais') && (
            <>
              <Button 
                onClick={() => setShowImportModal(true)} 
                variant="outline"
                size="sm"
              >
                <FaUpload className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Importar</span>
                <span className="sm:hidden">Importar</span>
              </Button>
            <Button onClick={handleAddNotaFiscal} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nova Nota Fiscal</span>
              <span className="sm:hidden">Nova</span>
            </Button>
            </>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <NotasFiscaisStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={filters.search}
        onSearchChange={(value) => atualizarFiltros({ search: value })}
        onKeyPress={handleKeyPress}
        additionalFilters={[
          {
            label: 'Status',
            value: filters.status || '',
            onChange: (e) => atualizarFiltros({ status: e.target.value }),
            options: [
              { value: '', label: 'Todos os status' },
              { value: 'LANCADA', label: 'Lançada' }
            ]
          },
          {
            label: 'Tipo',
            value: filters.tipo_nota || '',
            onChange: (e) => atualizarFiltros({ tipo_nota: e.target.value }),
            options: [
              { value: '', label: 'Todos os tipos' },
              { value: 'ENTRADA', label: 'Entrada' },
              { value: 'SAIDA', label: 'Saída' }
            ]
          }
        ]}
        placeholder="Buscar por número, série, chave de acesso, fornecedor ou filial..."
        onClear={handleClearFilters}
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('notas_fiscais')}
        />
      </div>

      {/* Tabela */}
      <NotaFiscalTable
        notasFiscais={Array.isArray(notasFiscais) ? notasFiscais : []}
        onView={canView('notas_fiscais') ? handleViewNotaFiscal : null}
        onEdit={canEdit('notas_fiscais') ? handleEditNotaFiscal : null}
        onDelete={canDelete('notas_fiscais') ? handleDeleteNotaFiscal : null}
        onPrint={canView('notas_fiscais') ? handlePrintNotaFiscal : null}
        onDownload={canView('notas_fiscais') ? handleDownloadArquivo : null}
        getFornecedorName={getFornecedorName}
        getFilialName={getFilialName}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
      />

      {/* Paginação */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Modal de Nota Fiscal */}
      <NotaFiscalModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitNotaFiscal}
        notaFiscal={notaFiscalSelecionada}
        isViewMode={viewMode}
        onPrint={canView('notas_fiscais') ? handlePrintNotaFiscal : null}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Notas Fiscais"
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Nota Fiscal"
        message={`Tem certeza que deseja excluir a nota fiscal ${notaFiscalToDelete?.numero_nota}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Importação */}
      <ImportNotasFiscaisModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={(data) => {
          toast.success(`Importação concluída! ${data?.importados || 0} importadas, ${data?.atualizados || 0} atualizadas.`);
          carregarNotasFiscais();
        }}
      />
    </div>
  );
};

export default NotasFiscais;

