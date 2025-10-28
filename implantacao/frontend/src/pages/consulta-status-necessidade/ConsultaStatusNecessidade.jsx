import React, { useState } from 'react';
import { FaClipboardList, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useConsultaStatusNecessidade } from '../../hooks/useConsultaStatusNecessidade';
import { 
  ConsultaStatusLayout,
  ConsultaStatusLoading,
  ConsultaStatusHeader,
  ConsultaStatusTabs,
  RelatoriosConsultaStatus,
  StatusNecessidadesTab
} from './components';
import { ExportButtons } from '../../components/shared';
import toast from 'react-hot-toast';

const ConsultaStatusNecessidade = () => {
  const { canView } = usePermissions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('status');

  // Hook para gerenciar consulta de status
  const {
    exportarXLSX,
    exportarPDF
  } = useConsultaStatusNecessidade();

  // Verificar permissões
  const canViewConsulta = canView('consulta_status_necessidade');


  // Handlers de exportação
  const handleExportXLSX = async () => {
    try {
      await exportarXLSX();
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportarPDF();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  if (!canViewConsulta) {
    return (
      <ConsultaStatusLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta funcionalidade.
          </p>
        </div>
      </ConsultaStatusLayout>
    );
  }

  return (
    <ConsultaStatusLayout>
      {/* Header */}
      <ConsultaStatusHeader
        canView={canViewConsulta}
        onShowHelp={() => {}} // TODO: Implementar ajuda
        loading={loading}
      />


      {/* Abas */}
      <ConsultaStatusTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        userType={user?.tipo_de_acesso}
      />

      {/* Ações de Exportação - sempre visíveis */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
        />
      </div>


      {/* Conteúdo da aba Status das Necessidades */}
      {activeTab === 'status' && (
        <StatusNecessidadesTab />
      )}

      {/* Conteúdo da aba Relatórios */}
      {activeTab === 'relatorios' && (
        <RelatoriosConsultaStatus />
      )}

      {/* Loading Overlay */}
      {loading && <ConsultaStatusLoading />}
    </ConsultaStatusLayout>
  );
};

export default ConsultaStatusNecessidade;
