import React, { useState } from 'react';
import { FaShoppingCart, FaPlus, FaUpload, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import {
  PedidoMensalTabs,
  ImportPedidoMensalModal
} from '../../components/necessidades-padroes';
import { CriarPedidoPadrao } from '../../components/necessidades-padroes/criar-pedido-padrao';
import GerarNecessidadePadrao from '../../components/necessidades-padroes/GerarNecessidadePadrao';
import { Button } from '../../components/ui';
import { AuditModal } from '../../components/shared';
import toast from 'react-hot-toast';

const PedidoMensal = () => {
  const { canView, canCreate, loading: permissionsLoading } = usePermissions();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('criar');
  
  // Estados para UI
  const [showImportModal, setShowImportModal] = useState(false);
  const criarPedidoPadraoRef = React.useRef(null);

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
  } = useAuditoria('necessidades_padroes');

  // Verificar permissões específicas
  const canViewPedidoMensal = canView('necessidades_padroes');
  const canCreatePedidoMensal = canCreate('necessidades_padroes');

  // Handler para quando importação for bem-sucedida
  const handleImportSuccess = () => {
    toast.success('Dados importados com sucesso!');
    // O componente CriarPedidoPadrao recarrega automaticamente quando os filtros estão definidos
    // Se necessário, podemos adicionar lógica adicional aqui
  };


  if (permissionsLoading) {
    return <div className="text-center py-8">Carregando permissões...</div>;
  }

  if (!canViewPedidoMensal) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FaShoppingCart className="text-5xl mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Acesso Restrito</h2>
        <p>Você não tem permissão para visualizar o pedido mensal.</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <FaShoppingCart className="mr-2 sm:mr-3 text-green-600" />
            Pedido Mensal
          </h1>
          <p className="text-gray-600 mt-1">
            Defina padrões de produtos para pedidos mensais por escola e grupo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {activeTab === 'criar' && (
            <Button
              onClick={() => {
                if (criarPedidoPadraoRef.current) {
                  criarPedidoPadraoRef.current();
                }
              }}
              color="green"
              icon={<FaPlus />}
              size="sm"
            >
              Criar Necessidade Padrão
            </Button>
          )}
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FaUpload className="text-green-600" />
            <span>Importar Dados</span>
          </Button>
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaQuestionCircle />
            <span>Auditoria</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <PedidoMensalTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Conteúdo das Abas */}
      {activeTab === 'criar' && (
        <CriarPedidoPadrao 
          onCriarClick={criarPedidoPadraoRef}
        />
      )}

      {activeTab === 'gerenciar' && (
        <GerarNecessidadePadrao />
      )}

      <ImportPedidoMensalModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />

      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Pedido Mensal"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />
    </div>
  );
};

export default PedidoMensal;