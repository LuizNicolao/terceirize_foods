import React from 'react';
import { FaClipboardList, FaUsers, FaBox } from 'react-icons/fa';

const AjusteNecessidadesStats = ({ necessidades, modoCoordenacao }) => {
  if (!necessidades || necessidades.length === 0) {
    return null;
  }

  // Agrupar por necessidade_id
  const necessidadesAgrupadas = necessidades.reduce((acc, nec) => {
    const key = nec.necessidade_id;
    if (!acc[key]) {
      acc[key] = {
        necessidade_id: nec.necessidade_id,
        escola: nec.escola,
        semana_consumo: nec.semana_consumo,
        status: nec.status,
        produtos: []
      };
    }
    acc[key].produtos.push(nec);
    return acc;
  }, {});

  const grupos = Object.values(necessidadesAgrupadas);
  const totalProdutos = necessidades.length;
  const totalEscolas = grupos.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaClipboardList className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">
              {modoCoordenacao ? 'Necessidades para Coordenação' : 'Necessidades Disponíveis para Ajuste'}
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {grupos.length} {grupos.length === 1 ? 'necessidade' : 'necessidades'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaUsers className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Escolas</p>
            <p className="text-2xl font-semibold text-gray-900">{totalEscolas}</p>
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
            <p className="text-2xl font-semibold text-gray-900">{totalProdutos}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjusteNecessidadesStats;
