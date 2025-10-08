import React, { useState } from 'react';
import { FaQuestionCircle, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useFornecedoresConsulta } from '../../hooks/useFornecedoresConsulta';
import { Button } from '../../components/ui';
import { 
  FornecedorModal,
  FornecedoresTable, 
  FornecedoresStats
} from '../../components/fornecedores';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ConsultaActions } from '../../components/shared';

const Fornecedores = () => {
  const { canView } = usePermissions();
  
  // Estados locais
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState(null);
  
  // Hook de consulta ao sistema Foods
  const {
    // Dados
    fornecedores,
    stats,
    connectionStatus,
    
    // Estados
    loading,
    error,
    
    // Paginação
    pagination,
    
    // Filtros
    filters,
    
    // Ações
    carregarFornecedores,
    buscarFornecedorPorId,
    atualizarFiltros,
    atualizarPaginacao,
    recarregar,
    
    // Utilitários
    isConnected,
    hasError,
    isEmpty
  } = useFornecedoresConsulta();

  // Handlers
  const handleView = async (fornecedor) => {
    try {
      const fornecedorCompleto = await buscarFornecedorPorId(fornecedor.id);
      setSelectedFornecedor(fornecedorCompleto);
      setShowViewModal(true);
    } catch (err) {
      console.error('Erro ao carregar fornecedor:', err);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedFornecedor(null);
  };

  const handleSearch = (searchTerm) => {
    atualizarFiltros({ search: searchTerm });
  };

  const handlePageChange = (page) => {
    atualizarPaginacao({ currentPage: page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    atualizarPaginacao({ itemsPerPage, currentPage: 1 });
  };

  const handleExportXLSX = () => {
    // TODO: Implementar exportação XLSX dos dados consultados
    console.log('Exportar XLSX dos fornecedores consultados');
  };

  const handleExportPDF = () => {
    // TODO: Implementar exportação PDF dos dados consultados
    console.log('Exportar PDF dos fornecedores consultados');
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Consultando fornecedores do sistema Foods...</p>
          {!isConnected && (
            <p className="text-orange-600 text-sm mt-2">
              <FaExclamationTriangle className="inline mr-1" />
              Verificando conexão com o sistema Foods
            </p>
          )}
        </div>
      </div>
    );
  }

  // Estado de erro de conexão
  if (hasError && !isConnected) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-4">
            Não foi possível conectar ao sistema Foods. Verifique sua conexão e tente novamente.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {connectionStatus?.message || 'Erro desconhecido'}
          </p>
          <Button onClick={recarregar} variant="primary">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Fornecedores</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={recarregar}
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={loading}
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <FornecedoresStats estatisticas={stats} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={filters.search}
        onSearchChange={handleSearch}
        placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
      />

      {/* Ações */}
      <ConsultaActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        totalItems={fornecedores.length}
        loading={loading}
      />

      {/* Tabela */}
      <FornecedoresTable
        fornecedores={fornecedores}
        loading={loading}
        onView={handleView}
        canView={canView('fornecedores')}
          mode="consulta" // Modo consulta apenas
        />

      {/* Modal de Visualização */}
      <FornecedorModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        onSubmit={() => {}} // Não usado no modo visualização
        viewMode={true}
        editingFornecedor={selectedFornecedor}
      />

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
        <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
        </div>
      )}
    </div>
  );
};

export default Fornecedores;
