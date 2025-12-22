import React from 'react';
import { FaSchool, FaBox, FaLayerGroup } from 'react-icons/fa';

/**
 * Componente de cards de estatísticas para Necessidades Padrão
 */
const CriarPedidoPadraoStats = ({ necessidadesAgrupadas, necessidadesPadroes }) => {
  // Calcular estatísticas
  const totalEscolas = necessidadesAgrupadas?.length || 0;
  const totalProdutos = necessidadesPadroes?.length || 0;
  const totalGrupos = new Set(necessidadesAgrupadas?.map(g => g.grupo_id) || []).size;

  const stats = [
    {
      icon: <FaSchool />,
      color: 'green',
      value: totalEscolas,
      title: 'Escolas com Padrão',
      subtitle: 'Escolas cadastradas'
    },
    {
      icon: <FaBox />,
      color: 'blue',
      value: totalProdutos,
      title: 'Total de Produtos',
      subtitle: 'Produtos cadastrados'
    },
    {
      icon: <FaLayerGroup />,
      color: 'purple',
      value: totalGrupos,
      title: 'Grupos Ativos',
      subtitle: 'Grupos de produtos'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => {
        const colorClasses = {
          green: 'bg-green-500',
          blue: 'bg-blue-500',
          purple: 'bg-purple-500',
          orange: 'bg-orange-500',
          red: 'bg-red-500',
          yellow: 'bg-yellow-500'
        };

        return (
          <div
            key={index}
            className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white ${colorClasses[stat.color]}`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {stat.value.toLocaleString('pt-BR')}
            </div>
            
            <div className="text-sm sm:text-base font-medium text-gray-600 mb-1">
              {stat.title}
            </div>
            
            {stat.subtitle && (
              <div className="text-xs text-gray-500">
                {stat.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CriarPedidoPadraoStats;

