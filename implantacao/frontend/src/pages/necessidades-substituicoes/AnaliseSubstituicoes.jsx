import React, { useState } from 'react';
import { FaExchangeAlt, FaClipboardList } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { NecessidadesLayout, NecessidadesLoading } from '../../components/necessidades';
import AnaliseNutricionista from './AnaliseNutricionista';
import AnaliseCoordenacao from './AnaliseCoordenacao';
import AnaliseImpressao from './AnaliseImpressao';

const AnaliseSubstituicoes = () => {
  const { user } = useAuth();
  const { canView, loading: permissionsLoading } = usePermissions();
  const [activeTab, setActiveTab] = useState('nutricionista');

  // Verificar permissões baseado no tipo de acesso do usuário
  const tiposComAcesso = ['nutricionista', 'coordenador', 'supervisor', 'administrador', 'administrativo', 'gerente'];
  const canViewSubstituicoes = canView('analise_necessidades') || tiposComAcesso.includes(user.tipo_de_acesso);
  const canViewCoordenacao = ['coordenador', 'administrador'].includes(user.tipo_de_acesso);
  const canViewImpressao = ['coordenador', 'administrador', 'supervisor', 'gerente'].includes(user.tipo_de_acesso);

  if (permissionsLoading) {
    return <NecessidadesLoading />;
  }

  if (!canViewSubstituicoes) {
    return (
      <NecessidadesLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar a análise de substituições.
          </p>
        </div>
      </NecessidadesLayout>
    );
  }

  return (
    <NecessidadesLayout hideHeader={true}>
      {/* Header Personalizado */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FaExchangeAlt className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">Análise de Necessidades</h1>
        </div>
        <p className="text-gray-600">
          Gerencie substituições de produtos solicitados por produtos genéricos disponíveis em estoque
        </p>
      </div>

      {/* Abas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('nutricionista')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'nutricionista'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Análise de Necessidades
            </button>
            {canViewCoordenacao && (
              <button
                onClick={() => setActiveTab('coordenacao')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'coordenacao'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Análise de Necessidades Coordenação
              </button>
            )}
            {canViewImpressao && (
              <button
                onClick={() => setActiveTab('impressao')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'impressao'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Impressão de Romaneio
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'nutricionista' && <AnaliseNutricionista />}
      {activeTab === 'coordenacao' && canViewCoordenacao && <AnaliseCoordenacao />}
      {activeTab === 'impressao' && canViewImpressao && <AnaliseImpressao />}
    </NecessidadesLayout>
  );
};

export default AnaliseSubstituicoes;
