import React from 'react';
import { FaSchool, FaChartLine } from 'react-icons/fa';
import { EmptyState } from '../ui';

const MediasCalculadasTab = ({ medias, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando médias...</span>
      </div>
    );
  }
  
  if (!medias || medias.length === 0) {
    return (
      <EmptyState
        title="Nenhuma média calculada"
        description="As médias são calculadas automaticamente quando você registra quantidades servidas"
        icon="chart"
      />
    );
  }
  
  // Extrair todos os períodos únicos de todas as unidades para construir o cabeçalho dinâmico
  const todosPeriodos = new Map();
  medias.forEach(media => {
    if (media.periodos && Array.isArray(media.periodos)) {
      media.periodos.forEach(periodo => {
        if (!todosPeriodos.has(periodo.periodo_atendimento_id)) {
          todosPeriodos.set(periodo.periodo_atendimento_id, {
            id: periodo.periodo_atendimento_id,
            nome: periodo.periodo_nome || periodo.periodo_codigo || `Período ${periodo.periodo_atendimento_id}`,
            codigo: periodo.periodo_codigo
          });
        }
      });
    }
  });
  const periodosArray = Array.from(todosPeriodos.values());
  
  // Cores para os períodos
  const cores = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-rose-100 text-rose-800',
    'bg-yellow-100 text-yellow-800',
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800'
  ];
  
  return (
    <>
      {/* Desktop */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                {periodosArray.map(periodo => (
                  <th key={periodo.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {periodo.nome}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Dias</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Última Atualização</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medias.map((media) => {
                // Criar um mapa de períodos para acesso rápido
                const periodosMap = new Map();
                if (media.periodos && Array.isArray(media.periodos)) {
                  media.periodos.forEach(periodo => {
                    periodosMap.set(periodo.periodo_atendimento_id, periodo);
                  });
                }
                
                return (
                  <tr key={`unidade-${media.unidade_id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaSchool className="text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {media.unidade_nome || `Unidade ID ${media.unidade_id}`}
                        </span>
                      </div>
                    </td>
                    {periodosArray.map(periodo => {
                      const periodoData = periodosMap.get(periodo.id);
                      const valor = periodoData ? parseFloat(periodoData.media || 0) : 0;
                      const corIndex = periodo.id % cores.length;
                      return (
                        <td key={periodo.id} className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 ${cores[corIndex]} rounded-full text-sm font-medium`}>
                            {valor.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        <FaChartLine className="mr-1" />
                        {media.periodos && media.periodos.length > 0 
                          ? media.periodos[0].quantidade_lancamentos || 0 
                          : 0} dias
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                      {media.periodos && media.periodos.length > 0 && media.periodos[0].data_calculo
                        ? new Date(media.periodos[0].data_calculo).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile */}
      <div className="xl:hidden space-y-3">
        {medias.map((media) => {
          // Criar um mapa de períodos para acesso rápido
          const periodosMap = new Map();
          if (media.periodos && Array.isArray(media.periodos)) {
            media.periodos.forEach(periodo => {
              periodosMap.set(periodo.periodo_atendimento_id, periodo);
            });
          }
          
          return (
            <div key={`unidade-${media.unidade_id}`} className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center mb-3">
                <FaSchool className="text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-900 text-sm">{media.unidade_nome || `Unidade ID ${media.unidade_id}`}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                {media.periodos && Array.isArray(media.periodos) && media.periodos.map(periodo => (
                  <div key={periodo.periodo_atendimento_id} className="flex justify-between items-center">
                    <span className="text-gray-500">{periodo.periodo_nome || periodo.periodo_codigo || `Período ${periodo.periodo_atendimento_id}`}:</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                      {parseFloat(periodo.media || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                <span>
                  <FaChartLine className="inline mr-1" />
                  {media.periodos && media.periodos.length > 0 
                    ? media.periodos[0].quantidade_lancamentos || 0 
                    : 0} dias registrados
                </span>
                <span>
                  {media.periodos && media.periodos.length > 0 && media.periodos[0].data_calculo
                    ? new Date(media.periodos[0].data_calculo).toLocaleDateString('pt-BR')
                    : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MediasCalculadasTab;

