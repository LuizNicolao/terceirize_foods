import React from 'react';
import { FaClipboardList, FaSchool, FaBox, FaLayerGroup, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const ConsultaStatusStats = ({ necessidades, estatisticas, filtros }) => {
  if (!estatisticas) {
    return null;
  }

  const { geral, status, substituicoes, grupos } = estatisticas;

  // Calcular totais
  const totalNecessidades = geral?.total_necessidades || 0;
  const totalEscolas = geral?.total_escolas || 0;
  const totalProdutos = geral?.total_produtos || 0;
  const totalGrupos = geral?.total_grupos || 0;

  // Status das necessidades
  const statusConf = status?.find(s => s.status === 'CONF')?.quantidade || 0;
  const statusPend = status?.find(s => s.status === 'PEND')?.quantidade || 0;
  const statusCanc = status?.find(s => s.status === 'CANC')?.quantidade || 0;
  const statusReje = status?.find(s => s.status === 'REJE')?.quantidade || 0;

  // Status das substituições
  const semSubstituicao = substituicoes?.find(s => s.status_substituicao === 'sem_substituicao')?.quantidade || 0;
  const substituicaoConf = substituicoes?.find(s => s.status_substituicao === 'conf')?.quantidade || 0;
  const substituicaoAprovado = substituicoes?.find(s => s.status_substituicao === 'aprovado')?.quantidade || 0;

  return (
    <div className="mb-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaClipboardList className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Necessidades</p>
              <p className="text-2xl font-semibold text-gray-900">{totalNecessidades.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaSchool className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Escolas</p>
              <p className="text-2xl font-semibold text-gray-900">{totalEscolas.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaBox className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Produtos</p>
              <p className="text-2xl font-semibold text-gray-900">{totalProdutos.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaLayerGroup className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Grupos</p>
              <p className="text-2xl font-semibold text-gray-900">{totalGrupos.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status das Necessidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Status das Necessidades</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Confirmadas</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{statusConf.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaClock className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Pendentes</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{statusPend.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaTimesCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Canceladas</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{statusCanc.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaTimesCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Rejeitadas</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{statusReje.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Status das Substituições</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Aprovadas</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{substituicaoAprovado.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaClock className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Confirmadas</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{substituicaoConf.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaTimesCircle className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Sem Substituição</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{semSubstituicao.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grupos de Produtos */}
      {grupos && grupos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Distribuição por Grupos</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grupos.map((grupo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{grupo.grupo}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{grupo.quantidade.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{grupo.total_quantidade?.toLocaleString() || 0} unidades</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaStatusStats;
