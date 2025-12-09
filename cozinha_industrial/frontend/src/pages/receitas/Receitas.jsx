import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle, FaUpload } from 'react-icons/fa';
import { useReceitas } from '../../hooks/useReceitas';
import { ReceitasStats, ReceitasTable, ReceitaModal } from '../../components/receitas';
import ImportReceitasModal from '../../components/receitas/ImportReceitasModal';
import { Button, Pagination, CadastroFilterBar } from '../../components/ui';
import { ExportButtons, AuditModal } from '../../components/shared';
import { ConfirmModal } from '../../components/ui';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import FoodsApiService from '../../services/FoodsApiService';
import tiposReceitasService from '../../services/tiposReceitas';
import receitasService from '../../services/receitas';
import toast from 'react-hot-toast';

/**
 * Página de Cadastro de Receitas
 */
const Receitas = () => {
  const {
    receitas,
    loading,
    error,
    stats,
    pagination,
    filters,
    sortField,
    sortDirection,
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    handleSort,
    carregarReceitaPorId,
    criarReceita,
    atualizarReceita,
    excluirReceita,
    duplicarReceita,
    exportarReceitas
  } = useReceitas();

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedReceita, setSelectedReceita] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [receitaToDelete, setReceitaToDelete] = useState(null);

  // Estado local para o termo de busca
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Estados para filtros adicionais
  const [filiais, setFiliais] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [tiposReceitas, setTiposReceitas] = useState([]);
  const [loadingFiltros, setLoadingFiltros] = useState(false);

  // Estados locais para os filtros
  const [filialFilter, setFilialFilter] = useState(filters.filial || '');
  const [centroCustoFilter, setCentroCustoFilter] = useState(filters.centro_custo || '');
  const [tipoReceitaFilter, setTipoReceitaFilter] = useState(filters.tipo_receita || '');

  // Atualizar estado local quando filtros mudarem externamente
  useEffect(() => {
    setSearchTerm(filters.search || '');
    setFilialFilter(filters.filial || '');
    setCentroCustoFilter(filters.centro_custo || '');
    setTipoReceitaFilter(filters.tipo_receita || '');
  }, [filters]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      atualizarFiltros({ 
        search: searchTerm,
        filial: filialFilter,
        centro_custo: centroCustoFilter,
        tipo_receita: tipoReceitaFilter
      });
    }
  };

  // Carregar opções para os filtros
  useEffect(() => {
    carregarFiltros();
  }, []);

  const carregarFiltros = async () => {
    setLoadingFiltros(true);
    try {
      // Carregar filiais
      const filiaisData = [];
      let page = 1;
      let hasMore = true;
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getFiliais({ page, limit: 100 });
        if (result.success && result.data) {
          let items = [];
          if (result.data.items) {
            items = result.data.items;
          } else if (Array.isArray(result.data)) {
            items = result.data;
          } else if (result.data.data) {
            items = result.data.data;
          }
          filiaisData.push(...items);
          hasMore = items.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      setFiliais(filiaisData);

      // Carregar centros de custo
      const centrosCustoData = [];
      page = 1;
      hasMore = true;
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getCentrosCusto({ page, limit: 100 });
        if (result.success && result.data && result.data.length > 0) {
          centrosCustoData.push(...result.data);
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      setCentrosCusto(centrosCustoData);

      // Carregar tipos de receitas
      const tiposReceitasData = [];
      page = 1;
      hasMore = true;
      while (hasMore && page <= 50) {
        const result = await tiposReceitasService.listar({ page, limit: 100, status: 1 });
        if (result.success && result.data && result.data.length > 0) {
          tiposReceitasData.push(...result.data);
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      setTiposReceitas(tiposReceitasData);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    } finally {
      setLoadingFiltros(false);
    }
  };

  // Handlers para mudança de filtros
  const handleFilialChange = (value) => {
    const newValue = typeof value === 'string' ? value : (value?.value || value?.id?.toString() || '');
    setFilialFilter(newValue);
    
    // Verificar se o centro de custo atual pertence à nova filial
    let newCentroCusto = centroCustoFilter;
    if (newValue && centroCustoFilter) {
      const centroCustoAtual = centrosCusto.find(cc => cc.id?.toString() === centroCustoFilter);
      if (!centroCustoAtual || centroCustoAtual.filial_id?.toString() !== newValue) {
        newCentroCusto = '';
        setCentroCustoFilter('');
      }
    } else if (!newValue) {
      newCentroCusto = '';
      setCentroCustoFilter('');
    }
    
    atualizarFiltros({ 
      filial: newValue,
      centro_custo: newCentroCusto
    });
  };

  const handleCentroCustoChange = (value) => {
    const newValue = typeof value === 'string' ? value : (value?.value || value?.id?.toString() || '');
    setCentroCustoFilter(newValue);
    atualizarFiltros({ centro_custo: newValue });
  };

  const handleTipoReceitaChange = (value) => {
    const newValue = typeof value === 'string' ? value : (value?.value || value?.id?.toString() || '');
    setTipoReceitaFilter(newValue);
    atualizarFiltros({ tipo_receita: newValue });
  };

  // Handlers de modal
  const handleAddReceita = () => {
    setSelectedReceita(null);
    setIsViewMode(false);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleViewReceita = async (receita) => {
    try {
      const receitaCompleta = await carregarReceitaPorId(receita.id);
      setSelectedReceita(receitaCompleta);
      setIsViewMode(true);
      setIsEditing(false);
      setShowModal(true);
    } catch (err) {
      console.error('Erro ao carregar receita:', err);
    }
  };

  const handleEditReceita = async (receita) => {
    try {
      const receitaCompleta = await carregarReceitaPorId(receita.id);
      setSelectedReceita(receitaCompleta);
      setIsViewMode(false);
      setIsEditing(true);
      setIsDuplicating(false);
      setShowModal(true);
    } catch (err) {
      console.error('Erro ao carregar receita:', err);
    }
  };

  const handleDuplicateReceita = async (receita) => {
    try {
      const receitaParaDuplicar = await duplicarReceita(receita);
      if (receitaParaDuplicar) {
        setSelectedReceita(receitaParaDuplicar);
        setIsViewMode(false);
        setIsEditing(false);
        setIsDuplicating(true);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Erro ao duplicar receita:', err);
    }
  };

  const handleDeleteReceita = (receita) => {
    setReceitaToDelete(receita);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReceita(null);
    setIsViewMode(false);
    setIsEditing(false);
    setIsDuplicating(false);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setReceitaToDelete(null);
  };

  // Handler de submit do formulário
  const handleSubmit = async (data) => {
    if (isEditing && selectedReceita) {
      await atualizarReceita(selectedReceita.id, data);
    } else {
      await criarReceita(data);
    }
    handleCloseModal();
  };

  // Handler de confirmação de exclusão
  const handleConfirmDelete = async () => {
    if (receitaToDelete) {
      await excluirReceita(receitaToDelete.id);
      handleCloseDeleteModal();
    }
  };

  // Handlers de paginação
  const handlePageChange = (page) => {
    atualizarPaginacao({ currentPage: page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    atualizarPaginacao({ itemsPerPage, currentPage: 1 });
  };

  // Handlers de exportação
  const handleExportJSON = async () => {
    await exportarReceitas();
  };

  const handleExportXLSX = async () => {
    try {
      const params = {
        search: filters.search || '',
        tipo_receita: filters.tipo_receita || '',
        filial: filters.filial || '',
        centro_custo: filters.centro_custo || ''
      };
      
      const result = await receitasService.exportarXLSX(params);
      
      if (result.success) {
        toast.success(result.message || 'Receitas exportadas para XLSX com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar receitas para XLSX');
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar receitas para XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = {
        search: filters.search || '',
        tipo_receita: filters.tipo_receita || '',
        filial: filters.filial || '',
        centro_custo: filters.centro_custo || ''
      };
      
      const result = await receitasService.exportarPDF(params);
      
      if (result.success) {
        toast.success(result.message || 'Receitas exportadas para PDF com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar receitas para PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar receitas para PDF');
    }
  };

  // Hook de auditoria
  const {
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useAuditoria('receitas');

  if (loading && receitas.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Cadastro de Receitas</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <FaUpload className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Importar</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button
            onClick={handleAddReceita}
            variant="primary"
            size="sm"
            className="text-xs"
          >
            <FaPlus className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Nova Receita</span>
            <span className="sm:hidden">Nova</span>
          </Button>
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={loading}
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <ReceitasStats stats={stats} loading={loading} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        onClear={limparFiltros}
        placeholder="Buscar por código, nome, tipo, filial, centro de custo ou produtos..."
        additionalFilters={[
          {
            value: tipoReceitaFilter,
            onChange: (selectedValue) => {
              const value = typeof selectedValue === 'string' ? selectedValue : (selectedValue?.value || selectedValue?.tipo_receita || '');
              handleTipoReceitaChange(value);
            },
            options: [
              { value: '', label: 'Todos os tipos' },
              ...tiposReceitas.map(t => ({
                value: t.tipo_receita || t.id?.toString() || '',
                label: t.tipo_receita || 'Sem tipo'
              }))
            ],
            searchable: true,
            placeholder: 'Selecione um tipo de receita...'
          },
          {
            value: filialFilter,
            onChange: (selectedValue) => {
              const value = typeof selectedValue === 'string' ? selectedValue : (selectedValue?.value || selectedValue?.id?.toString() || '');
              handleFilialChange(value);
            },
            options: [
              { value: '', label: 'Todas as filiais' },
              ...filiais.map(f => ({
                value: f.id?.toString() || '',
                label: f.filial || f.nome || f.razao_social || 'Sem nome'
              }))
            ],
            searchable: true,
            placeholder: 'Selecione uma filial...'
          },
          {
            value: centroCustoFilter,
            onChange: (selectedValue) => {
              const value = typeof selectedValue === 'string' ? selectedValue : (selectedValue?.value || selectedValue?.id?.toString() || '');
              handleCentroCustoChange(value);
            },
            options: [
              { value: '', label: 'Todos os centros de custo' },
              ...centrosCusto
                .filter(cc => {
                  // Se há filial selecionada, filtrar apenas centros de custo dessa filial
                  if (filialFilter) {
                    return cc.filial_id?.toString() === filialFilter;
                  }
                  // Se não há filial selecionada, mostrar todos
                  return true;
                })
                .map(cc => ({
                  value: cc.id?.toString() || '',
                  label: cc.centro_custo_nome || cc.nome || cc.centro_custo || 'Sem nome'
                }))
            ],
            searchable: true,
            placeholder: filialFilter ? 'Selecione um centro de custo...' : 'Selecione uma filial primeiro...',
            disabled: !filialFilter
          }
        ]}
      />

      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
        />
      </div>

      {/* Tabela */}
      <ReceitasTable
        receitas={receitas}
        loading={loading}
        onView={handleViewReceita}
        onEdit={handleEditReceita}
        onDelete={handleDeleteReceita}
        onDuplicate={handleDuplicateReceita}
        canView={true}
        canEdit={true}
        canDelete={true}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Paginação */}
      <Pagination
        currentPage={pagination.currentPage || 1}
        totalPages={pagination.totalPages || 1}
        onPageChange={handlePageChange}
        itemsPerPage={pagination.itemsPerPage || 20}
        onItemsPerPageChange={handleItemsPerPageChange}
        totalItems={pagination.totalItems || 0}
      />

      {/* Modal de Receita */}
      <ReceitaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        receita={selectedReceita}
        isViewMode={isViewMode}
        isDuplicating={isDuplicating}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Receita"
        message={`Tem certeza que deseja excluir a receita "${receitaToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Receitas"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />

      {/* Modal de Importação */}
      <ImportReceitasModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={(data) => {
          if (data && (data.importados > 0 || data.atualizados > 0)) {
            recarregar();
            toast.success(`Importação concluída! ${data.importados} receitas importadas, ${data.atualizados} atualizadas.`);
          }
        }}
      />
    </div>
  );
};

export default Receitas;

