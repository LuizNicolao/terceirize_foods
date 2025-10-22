import React from 'react';
import { FaChartBar, FaChartPie, FaCalendarAlt } from 'react-icons/fa';

const CalendarioGraficos = ({ dados, tipo, ano, mes }) => {
  if (!dados) {
    return (
      <div className="text-center py-12">
        <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado disponível</h3>
        <p className="mt-1 text-sm text-gray-500">
          Não há dados para gerar os gráficos.
        </p>
      </div>
    );
  }

  const renderGraficoBarras = () => {
    if (tipo === 'mensal' && dados.mensais) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise Mensal - {ano}</h3>
          <div className="space-y-4">
            {dados.mensais.map((mes, index) => (
              <div key={mes.mes} className="flex items-center">
                <div className="w-20 text-sm font-medium text-gray-700">
                  {getNomeMes(mes.mes)}
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Dias Úteis</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(mes.dias_uteis / mes.total_dias) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Abastecimento</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ width: `${(mes.dias_abastecimento / mes.total_dias) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Consumo</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(mes.dias_consumo / mes.total_dias) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-500 text-right">
                  {mes.total_dias} dias
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderGraficoPizza = () => {
    if (tipo === 'dias_semana' && dados.diasSemana) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Dias da Semana - {ano}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {dados.diasSemana.map((dia) => (
                <div key={dia.dia_semana_numero} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">{dia.dia_semana_nome}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {dia.total_dias} dias
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {dados.diasSemana.map((dia) => (
                <div key={dia.dia_semana_numero} className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">{dia.dia_semana_nome}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Úteis</span>
                      <span>{dia.dias_uteis}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Abastecimento</span>
                      <span>{dia.dias_abastecimento}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Consumo</span>
                      <span>{dia.dias_consumo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getNomeMes = (numeroMes) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[numeroMes - 1] || '';
  };

  return (
    <div className="space-y-6">
      {tipo === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Geral - {ano}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total de Dias</span>
                <span className="text-lg font-semibold text-gray-900">
                  {dados.estatisticas?.total_dias || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Dias Úteis</span>
                <span className="text-lg font-semibold text-green-600">
                  {dados.estatisticas?.dias_uteis || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Dias de Abastecimento</span>
                <span className="text-lg font-semibold text-yellow-600">
                  {dados.estatisticas?.dias_abastecimento || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Dias de Consumo</span>
                <span className="text-lg font-semibold text-purple-600">
                  {dados.estatisticas?.dias_consumo || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Feriados</span>
                <span className="text-lg font-semibold text-red-600">
                  {dados.estatisticas?.feriados || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Percentuais</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Dias Úteis</span>
                  <span>{Math.round(((dados.estatisticas?.dias_uteis || 0) / (dados.estatisticas?.total_dias || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${((dados.estatisticas?.dias_uteis || 0) / (dados.estatisticas?.total_dias || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Abastecimento</span>
                  <span>{Math.round(((dados.estatisticas?.dias_abastecimento || 0) / (dados.estatisticas?.total_dias || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${((dados.estatisticas?.dias_abastecimento || 0) / (dados.estatisticas?.total_dias || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Consumo</span>
                  <span>{Math.round(((dados.estatisticas?.dias_consumo || 0) / (dados.estatisticas?.total_dias || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${((dados.estatisticas?.dias_consumo || 0) / (dados.estatisticas?.total_dias || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tipo === 'mensal' && renderGraficoBarras()}
      {tipo === 'dias_semana' && renderGraficoPizza()}
    </div>
  );
};

export default CalendarioGraficos;
