import React, { useState, useEffect } from 'react';
import { FaChartBar, FaArrowLeft, FaDownload, FaCalendarAlt, FaChartPie, FaTable } from 'react-icons/fa';
import { useCalendario } from '../../hooks/useCalendario';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Button, SearchableSelect } from '../../components/ui';
import { Link } from 'react-router-dom';
import CalendarioGraficos from '../../components/calendario/CalendarioGraficos';
import CalendarioTabelas from '../../components/calendario/CalendarioTabelas';

const CalendarioRelatorios = () => {
  const { user } = usePermissions();
  const {
    loading,
    estatisticas,
    carregarEstatisticas
  } = useCalendario();

  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState('');
  const [tipoRelatorio, setTipoRelatorio] = useState('geral'); // 'geral', 'mensal', 'dias_semana'

  useEffect(() => {
    carregarEstatisticas(ano);
  }, [ano, carregarEstatisticas]);

  const handleAnoChange = (novoAno) => {
    setAno(novoAno);
  };

  const handleMesChange = (novoMes) => {
    setMes(novoMes);
  };

  const handleTipoRelatorioChange = (tipo) => {
    setTipoRelatorio(tipo);
  };

  const gerarAnos = () => {
    const anos = [];
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
      anos.push({ value: i, label: i.toString() });
    }
    return anos;
  };

  const gerarMeses = () => {
    return [
      { value: '', label: 'Todos os meses' },
      { value: 1, label: 'Janeiro' },
      { value: 2, label: 'Fevereiro' },
      { value: 3, label: 'Março' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Maio' },
      { value: 6, label: 'Junho' },
      { value: 7, label: 'Julho' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Setembro' },
      { value: 10, label: 'Outubro' },
      { value: 11, label: 'Novembro' },
      { value: 12, label: 'Dezembro' }
    ];
  };

  const opcoesTipoRelatorio = [
    { value: 'geral', label: 'Relatório Geral' },
    { value: 'mensal', label: 'Análise Mensal' },
    { value: 'dias_semana', label: 'Análise por Dias da Semana' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center">
          <Link
            to="/calendario"
            className="mr-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <FaChartBar className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Relatórios do Calendário</h1>
            <p className="text-sm text-gray-600">Análises e gráficos do calendário</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <FaDownload className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <SearchableSelect
                  value={ano}
                  onChange={handleAnoChange}
                  options={gerarAnos()}
                  placeholder="Selecione o ano..."
                  usePortal={false}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <SearchableSelect
                  value={mes}
                  onChange={handleMesChange}
                  options={gerarMeses()}
                  placeholder="Selecione o mês..."
                  usePortal={false}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {opcoesTipoRelatorio.map((opcao) => (
                <Button
                  key={opcao.value}
                  onClick={() => handleTipoRelatorioChange(opcao.value)}
                  variant={tipoRelatorio === opcao.value ? 'primary' : 'outline'}
                  size="sm"
                >
                  {opcao.value === 'geral' && <FaChartBar className="h-4 w-4 mr-2" />}
                  {opcao.value === 'mensal' && <FaCalendarAlt className="h-4 w-4 mr-2" />}
                  {opcao.value === 'dias_semana' && <FaChartPie className="h-4 w-4 mr-2" />}
                  {opcao.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo dos Relatórios */}
        {tipoRelatorio === 'geral' && (
          <div className="space-y-6">
            {/* Estatísticas Gerais */}
            {estatisticas && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaCalendarAlt className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total de Dias</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {estatisticas.estatisticas?.total_dias || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaCalendarAlt className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Dias Úteis</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {estatisticas.estatisticas?.dias_uteis || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaCalendarAlt className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Dias de Abastecimento</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {estatisticas.estatisticas?.dias_abastecimento || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaCalendarAlt className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Dias de Consumo</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {estatisticas.estatisticas?.dias_consumo || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gráficos */}
            <CalendarioGraficos
              dados={estatisticas}
              tipo="geral"
              ano={ano}
              mes={mes}
            />
          </div>
        )}

        {tipoRelatorio === 'mensal' && (
          <CalendarioGraficos
            dados={estatisticas}
            tipo="mensal"
            ano={ano}
            mes={mes}
          />
        )}

        {tipoRelatorio === 'dias_semana' && (
          <CalendarioGraficos
            dados={estatisticas}
            tipo="dias_semana"
            ano={ano}
            mes={mes}
          />
        )}

        {/* Tabelas */}
        <div className="mt-8">
          <CalendarioTabelas
            dados={estatisticas}
            ano={ano}
            mes={mes}
          />
        </div>
    </div>
  );
};

export default CalendarioRelatorios;
