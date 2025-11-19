import React, { useState } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ConsultaStatusLayout,
  ConsultaStatusHeader,
  ConsultaStatusTabs,
  RelatoriosConsultaStatus,
  StatusNecessidadesTab
} from './components';
import NecVsConfTab from './components/NecVsConfTab';

const ConsultaStatusNecessidade = () => {
  const { canView } = usePermissions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('status');

  // Verificar permissões
  const canViewConsulta = canView('consulta_status_necessidade');

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
        loading={false}
      />


      {/* Abas */}
      <ConsultaStatusTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        userType={user?.tipo_de_acesso}
      />

      {/* Conteúdo da aba Status das Necessidades */}
      {activeTab === 'status' && (
        <StatusNecessidadesTab />
      )}

      {/* Conteúdo da aba NEC x CONF */}
      {activeTab === 'nec-vs-conf' && (
        <NecVsConfTab />
      )}

      {/* Conteúdo da aba Relatórios */}
      {activeTab === 'relatorios' && (
        <RelatoriosConsultaStatus />
      )}

      {/* Loading Overlay - gerenciado pelos componentes filhos */}
    </ConsultaStatusLayout>
  );
};

export default ConsultaStatusNecessidade;
