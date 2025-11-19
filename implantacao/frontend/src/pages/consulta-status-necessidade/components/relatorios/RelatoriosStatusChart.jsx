import React from 'react';

const RelatoriosStatusChart = ({ estatisticas, loading }) => {
  const getStatusNecessidadeLabel = (status) => {
    const statusMap = {
      'NEC': 'NEC - Necessidade Criada',
      'NEC NUTRI': 'NEC NUTRI - Necessidade Ajustada pela Nutricionista',
      'NEC COORD': 'NEC COORD - Necessidade Ajustada pela Coordenação',
      'CONF': 'CONF - Confirmada',
      'CONF NUTRI': 'CONF NUTRI - Confirmada pela Nutricionista',
      'CONF COORD': 'CONF COORD - Confirmada pela Coordenação'
    };
    return statusMap[status] || status;
  };

  const formatarNumero = (valor) => {
    if (!valor && valor !== 0) return '0';
    return new Intl.NumberFormat('pt-BR').format(parseFloat(valor));
  };

  if (!estatisticas?.status || estatisticas.status.length === 0) return null;

  // Calcular total geral
  const totalGeral = estatisticas.status.reduce((sum, s) => sum + parseInt(s.quantidade || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Distribuição por Status da Necessidade
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-xl font-bold text-gray-900">
            {formatarNumero(totalGeral)}
          </div>
          <div className="text-xs text-gray-500">100%</div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {estatisticas.status.map((item, index) => {
            const percentual = totalGeral > 0 ? ((parseInt(item.quantidade || 0) / totalGeral) * 100).toFixed(1) : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">
                    {getStatusNecessidadeLabel(item.status)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {formatarNumero(item.quantidade)} ({percentual}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentual}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RelatoriosStatusChart;

