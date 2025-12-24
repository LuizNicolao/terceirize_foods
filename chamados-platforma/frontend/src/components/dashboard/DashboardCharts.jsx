import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardCharts = ({ estatisticas, dadosTemporais }) => {
  if (!estatisticas) return null;

  const { distribuicao, metricas } = estatisticas;

  // Preparar dados para gráfico de linha (chamados ao longo do tempo)
  const dadosLinha = dadosTemporais || [];

  // Preparar dados para gráfico de pizza (distribuição por status)
  const dadosPizza = estatisticas.distribuicao?.por_status?.map(item => ({
    name: item.status,
    value: item.total
  })) || [];

  // Preparar dados para gráfico de barras (por sistema)
  const dadosBarras = distribuicao?.por_sistema || [];

  const coresPizza = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];
  const coresBarras = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const formatarStatus = (status) => {
    const labels = {
      'aberto': 'Aberto',
      'em_analise': 'Em Análise',
      'em_desenvolvimento': 'Em Desenvolvimento',
      'em_teste': 'Em Teste',
      'concluido': 'Concluído',
      'fechado': 'Fechado'
    };
    return labels[status] || status;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Gráfico de Linha - Chamados ao longo do tempo */}
      {dadosLinha.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Chamados ao Longo do Tempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosLinha}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total de Chamados" />
              <Line type="monotone" dataKey="abertos" stroke="#3b82f6" strokeWidth={2} name="Abertos" />
              <Line type="monotone" dataKey="concluidos" stroke="#10b981" strokeWidth={2} name="Concluídos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Pizza - Distribuição por Status */}
      {dadosPizza.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosPizza}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${formatarStatus(name)}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosPizza.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={coresPizza[index % coresPizza.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Barras - Por Sistema */}
      {dadosBarras.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Chamados por Sistema</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosBarras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sistema" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Métricas */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de SLA</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tempo Médio de Resolução</p>
            <p className="text-2xl font-bold text-gray-800">
              {metricas?.tempo_medio_resolucao_horas ? 
                `${parseFloat(metricas.tempo_medio_resolucao_horas).toFixed(1)}h` : 
                'N/A'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tempo Médio de Primeira Resposta</p>
            <p className="text-2xl font-bold text-gray-800">
              {metricas?.tempo_medio_primeira_resposta_minutos ? 
                `${parseFloat(metricas.tempo_medio_primeira_resposta_minutos).toFixed(0)}min` : 
                'N/A'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Taxa de Conclusão</p>
            <p className="text-2xl font-bold text-gray-800">
              {metricas?.taxa_conclusao ? 
                `${(metricas.taxa_conclusao * 100).toFixed(1)}%` : 
                'N/A'
              }
            </p>
          </div>
          {estatisticas.meus_chamados && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Meus Chamados</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Abertos por mim:</span>
                  <span className="text-sm font-medium text-gray-800">{estatisticas.meus_chamados.abertos || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Atribuídos a mim:</span>
                  <span className="text-sm font-medium text-gray-800">{estatisticas.meus_chamados.atribuidos || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
