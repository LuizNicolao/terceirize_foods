import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRelatorioInspecao } from '../../hooks/useRelatorioInspecao';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { Button, ConfirmModal, CadastroFilterBar, Pagination, StatCard, LoadingSpinner } from '../../components/ui';
import { AuditModal, ExportButtons } from '../../components/shared';
import RelatorioInspecaoModal from '../../components/relatorio-inspecao/RelatorioInspecaoModal';
import RelatorioInspecaoView from './RelatorioInspecaoView';

const RelatorioInspecao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    rirs,
    loading,
    pagination,
    statistics,
    filtros,
    setFiltros,
    carregarRIRs,
    excluirRIR
  } = useRelatorioInspecao();

  const {
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleAuditPageChange,
    handleAuditItemsPerPageChange,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useAuditoria('relatorio_inspecao');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rirToDelete, setRirToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Paginação
  const currentPage = pagination?.current_page || 1;
  const totalPages = pagination?.total_pages || 1;
  const totalItems = pagination?.total_items || 0;
  const itemsPerPage = pagination?.items_per_page || 20;

  useEffect(() => {
    // Só carregar se não estiver em modo de visualização
    if (!isViewMode) {
      carregarRIRs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setFiltros(prev => ({ ...prev, search: searchTerm }));
      carregarRIRs({ search: searchTerm });
    }
  };

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
    carregarRIRs({ [key]: value });
  };

  const clearFiltros = () => {
    const newFiltros = {
      search: '',
      status_geral: '',
      fornecedor: '',
      data_inicio: '',
      data_fim: ''
    };
    setFiltros(newFiltros);
    setSearchTerm('');
    carregarRIRs(newFiltros);
  };

  const handlePageChange = (page) => {
    carregarRIRs({ page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    carregarRIRs({ limit: itemsPerPage, page: 1 });
  };

  const handleViewRIR = (rir) => {
    navigate(`/foods/relatorio-inspecao/${rir.id}/visualizar`);
  };

  const handleEditRIR = (rir) => {
    setEditingRirId(rir.id);
    setShowModal(true);
  };

  const handleDeleteRIR = (rir) => {
    setRirToDelete(rir);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (rirToDelete) {
      const success = await excluirRIR(rirToDelete.id);
      if (success) {
        setShowDeleteConfirm(false);
        setRirToDelete(null);
      }
    }
  };

  const handleAddRIR = () => {
    setEditingRirId(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRirId(null);
  };

  const handleModalSuccess = () => {
    carregarRIRs();
  };

  const handleExportXLSX = () => {
    toast.info('Exportação em Excel em desenvolvimento');
  };

  const handleExportPDF = () => {
    toast.info('Exportação em PDF em desenvolvimento');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('pt-BR');
    return timeString ? `${formattedDate} ${timeString}` : formattedDate;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'APROVADO': { label: 'Aprovado', className: 'bg-green-100 text-green-800' },
      'REPROVADO': { label: 'Reprovado', className: 'bg-red-100 text-red-800' },
      'PARCIAL': { label: 'Parcial', className: 'bg-yellow-100 text-yellow-800' }
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Detectar se está em modo de visualização
  const isViewMode = location.pathname.includes('/visualizar');
  const pathParts = location.pathname.split('/');
  const rirId = isViewMode && pathParts[pathParts.length - 2] ? parseInt(pathParts[pathParts.length - 2]) : null;

  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [editingRirId, setEditingRirId] = useState(null);

  // Se estiver em modo de visualização, renderizar componente de visualização
  if (isViewMode && rirId) {
    return <RelatorioInspecaoView rirId={rirId} />;
  }

  // Caso contrário, renderizar lista
  if (loading) {
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
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Relatórios de Inspeção de Recebimento</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie os relatórios de inspeção de recebimento de produtos</p>
        </div>
        {canCreate('relatorio_inspecao') && (
          <Button onClick={handleAddRIR} size="sm">
            <FaPlus className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Novo Relatório</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total de RIRs"
            value={statistics.total || 0}
            icon="chart"
            color="blue"
          />
          <StatCard
            title="Aprovados"
            value={statistics.aprovados || 0}
            icon="check"
            color="green"
          />
          <StatCard
            title="Reprovados"
            value={statistics.reprovados || 0}
            icon="times"
            color="red"
          />
          <StatCard
            title="Parciais"
            value={statistics.parciais || 0}
            icon="exclamation"
            color="yellow"
          />
        </div>
      )}

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        onClear={clearFiltros}
        additionalFilters={[
          {
            label: 'Status',
            value: filtros.status_geral,
            onChange: (value) => handleFiltroChange('status_geral', value),
            options: [
              { value: '', label: 'Todos os status' },
              { value: 'APROVADO', label: 'Aprovado' },
              { value: 'REPROVADO', label: 'Reprovado' },
              { value: 'PARCIAL', label: 'Parcial' }
            ]
          },
          {
            label: 'Data Início',
            value: filtros.data_inicio,
            onChange: (value) => handleFiltroChange('data_inicio', value),
            type: 'date'
          },
          {
            label: 'Data Fim',
            value: filtros.data_fim,
            onChange: (value) => handleFiltroChange('data_fim', value),
            type: 'date'
          }
        ]}
        placeholder="Buscar por NF, Fornecedor ou AF..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('relatorio_inspecao')}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº NF
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produtos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rirs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Nenhum relatório de inspeção encontrado
                  </td>
                </tr>
              ) : (
                rirs.map((rir) => (
                  <tr key={rir.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{rir.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(rir.data_inspecao, rir.hora_inspecao)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {rir.numero_nota_fiscal || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-xs truncate" title={rir.fornecedor}>
                        {rir.fornecedor || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {rir.total_produtos || 0} {rir.total_produtos === 1 ? 'item' : 'itens'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(rir.status_geral)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {rir.usuario_nome || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center items-center gap-2">
                        {canView('relatorio_inspecao') && (
                          <button
                            onClick={() => handleViewRIR(rir)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Visualizar"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit('relatorio_inspecao') && (
                          <button
                            onClick={() => handleEditRIR(rir)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete('relatorio_inspecao') && (
                          <button
                            onClick={() => handleDeleteRIR(rir)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Excluir"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        logs={auditLogs}
        loading={auditLoading}
        filters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onSetFilters={setAuditFilters}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setRirToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o relatório de inspeção #${rirToDelete?.id.toString().padStart(4, '0')}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Relatório de Inspeção */}
      <RelatorioInspecaoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        rirId={editingRirId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default RelatorioInspecao;

