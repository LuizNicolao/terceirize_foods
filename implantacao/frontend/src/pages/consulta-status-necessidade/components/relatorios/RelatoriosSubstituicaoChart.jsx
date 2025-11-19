import React from 'react';

const RelatoriosSubstituicaoChart = ({ estatisticas, loading }) => {
  const getStatusLabel = (status) => {
    const statusMap = {
      'conf': 'CONF - Confirmado',
      'conf log': 'CONF LOG - Confirmado pela Logística',
      'impressao': 'IMPRESSÃO - Impresso',
      'aprovado': 'APROVADO - Aprovado',
      'sem_substituicao': 'Sem Substituição'
    };
    return statusMap[status] || status;
  };

  const formatarNumero = (valor) => {
    if (!valor && valor !== 0) return '0';
    return new Intl.NumberFormat('pt-BR').format(parseFloat(valor));
  };

  const getStatusColor = (status) => {
    const colors = {
      'conf': 'bg-yellow-600',
      'conf log': 'bg-green-600',
      'impressao': 'bg-blue-600',
      'aprovado': 'bg-purple-600',
      'sem_substituicao': 'bg-gray-600'
    };
    return colors[status] || 'bg-gray-600';
  };

  // Verificar tanto 'substituicao' quanto 'substituicoes' para compatibilidade
  const substituicaoData = estatisticas?.substituicao || estatisticas?.substituicoes;
  if (!substituicaoData || substituicaoData.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Distribuição por Status de Substituição
      </h3>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {substituicaoData.map((item, index) => {
            const total = substituicaoData.reduce((sum, s) => sum + parseInt(s.quantidade), 0);
            const percentual = total > 0 ? ((parseInt(item.quantidade) / total) * 100).toFixed(1) : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{getStatusLabel(item.status_substituicao)}</span>
                  <span className="text-gray-600">
                    {formatarNumero(item.quantidade)} ({percentual}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${getStatusColor(item.status_substituicao)} h-2.5 rounded-full transition-all duration-300`}
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

export default RelatoriosSubstituicaoChart;

