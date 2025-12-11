import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNecessidades } from '../../hooks/useNecessidades';
import {
  NecessidadesStats,
  NecessidadesTable,
  NecessidadeGeracaoModal,
  NecessidadeDetalhesModal
} from '../../components/necessidades';
import { Button, Pagination, CadastroFilterBar, ConfirmModal, EmptyState } from '../../components/ui';
import { ExportButtons } from '../../components/shared';
import { usePermissions } from '../../contexts/PermissionsContext';
import necessidadesService from '../../services/necessidades';
import toast from 'react-hot-toast';

/**
 * Página de Geração de Necessidades
 */
const Necessidades = () => {
  const {
    necessidades,
    loading,
    pagination,
    filters,
    sortField,
    sortDirection,
    carregarNecessidades,
    gerarNecessidade,
    recalcularNecessidade,
    excluirNecessidade,
    exportarJson,
    handleSort,
    handlePageChange,
    handleSearchChange,
    clearFilters,
    previsualizarNecessidade
  } = useNecessidades();

  const { canView, canCreate, canDelete } = usePermissions();
  
  // Permissões específicas para necessidades
  const canViewNecessidades = canView('necessidades');
  const canCreateNecessidades = canCreate('necessidades');
  const canDeleteNecessidades = canDelete('necessidades');

  // Estados para modais
  const [showGeracaoModal, setShowGeracaoModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRecalcularModal, setShowRecalcularModal] = useState(false);
  const [selectedNecessidade, setSelectedNecessidade] = useState(null);
  const [necessidadeToDelete, setNecessidadeToDelete] = useState(null);
  const [necessidadeToRecalcular, setNecessidadeToRecalcular] = useState(null);

  // Estado local para o termo de busca
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Atualizar estado local quando filtros mudarem externamente
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Carregar necessidades ao montar
  useEffect(() => {
    carregarNecessidades();
  }, []);

  const handleLocalSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchChange(searchTerm);
      handlePageChange(1);
    }
  };

  // Handlers de modal
  const handleAddNecessidade = () => {
    setShowGeracaoModal(true);
  };

  const handleViewNecessidade = async (necessidade) => {
    setSelectedNecessidade(null);
    try {
      const response = await necessidadesService.buscarPorId(necessidade.id);
      if (response.success && response.data) {
        setSelectedNecessidade(response.data);
        setShowDetalhesModal(true);
      } else {
        toast.error(response.error || 'Erro ao carregar detalhes da necessidade');
      }
    } catch (error) {
      toast.error('Erro ao carregar detalhes da necessidade');
    }
  };

  const handleRecalcularNecessidade = (necessidade) => {
    setNecessidadeToRecalcular(necessidade);
    setShowRecalcularModal(true);
  };

  const confirmRecalcular = async () => {
    if (necessidadeToRecalcular) {
      await recalcularNecessidade(necessidadeToRecalcular.id);
      setShowRecalcularModal(false);
      setNecessidadeToRecalcular(null);
    }
  };

  const handleDeleteNecessidade = (necessidade) => {
    setNecessidadeToDelete(necessidade);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (necessidadeToDelete) {
      await excluirNecessidade(necessidadeToDelete.id);
      setShowDeleteModal(false);
      setNecessidadeToDelete(null);
    }
  };

  const handleGerarSuccess = () => {
    setShowGeracaoModal(false);
  };

  const handleExportXLSX = async () => {
    try {
      const result = await necessidadesService.exportarXLSX(filters);
      if (!result.success) {
        toast.error(result.error || 'Erro ao exportar necessidades em XLSX');
      }
    } catch (error) {
      toast.error('Erro ao exportar necessidades em XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      const result = await necessidadesService.exportarPDF(filters);
      if (!result.success) {
        toast.error(result.error || 'Erro ao exportar necessidades em PDF');
      }
    } catch (error) {
      toast.error('Erro ao exportar necessidades em PDF');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Geração de Necessidades</h1>
          <p className="text-gray-600 mt-1">Gerencie as necessidades de produtos para os cardápios</p>
        </div>
        {canCreateNecessidades && (
          <Button onClick={handleAddNecessidade}>
            <FaPlus className="w-4 h-4 mr-2" />
            Nova Necessidade
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      {canViewNecessidades && <NecessidadesStats necessidades={necessidades} />}

      {/* Filtros */}
      {canViewNecessidades && (
        <CadastroFilterBar
          searchValue={searchTerm}
          onSearchChange={handleLocalSearchChange}
          onSearchKeyPress={handleKeyPress}
          onClearFilters={clearFilters}
        />
      )}

      {/* Exportar */}
      {canViewNecessidades && (
        <div className="mb-4">
          <ExportButtons
            onExportXLSX={handleExportXLSX}
            onExportPDF={handleExportPDF}
            disabled={!canViewNecessidades}
          />
        </div>
      )}

      {/* Tabela */}
      {canViewNecessidades ? (
        <>
          <NecessidadesTable
            necessidades={necessidades}
            loading={loading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onView={handleViewNecessidade}
            onRecalcular={handleRecalcularNecessidade}
            onDelete={handleDeleteNecessidade}
            canView={canViewNecessidades}
            canDelete={canDeleteNecessidades}
          />

          {/* Paginação */}
          {pagination && pagination.totalItems > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="Sem permissão"
          message="Você não tem permissão para visualizar necessidades"
        />
      )}

      {/* Modais */}
      {canCreateNecessidades && (
        <NecessidadeGeracaoModal
          isOpen={showGeracaoModal}
          onClose={() => setShowGeracaoModal(false)}
          onGerar={gerarNecessidade}
          onPrevisualizar={previsualizarNecessidade}
        />
      )}

      {canViewNecessidades && (
        <NecessidadeDetalhesModal
          isOpen={showDetalhesModal}
          onClose={() => {
            setShowDetalhesModal(false);
            setSelectedNecessidade(null);
          }}
          necessidade={selectedNecessidade}
          loading={false}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setNecessidadeToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Necessidade"
        message={`Tem certeza que deseja excluir a necessidade "${necessidadeToDelete?.codigo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Modal de confirmação de recalcular */}
      <ConfirmModal
        isOpen={showRecalcularModal}
        onClose={() => {
          setShowRecalcularModal(false);
          setNecessidadeToRecalcular(null);
        }}
        onConfirm={confirmRecalcular}
        title="Recalcular Necessidade"
        message={`Deseja recalcular a necessidade "${necessidadeToRecalcular?.codigo}"? Esta ação irá atualizar todos os itens baseado nos dados atuais.`}
        confirmText="Recalcular"
        cancelText="Cancelar"
        variant="primary"
      />
    </div>
  );
};

export default Necessidades;
