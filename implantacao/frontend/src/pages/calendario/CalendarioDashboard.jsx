import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCog, FaChartBar, FaEye, FaCalendarCheck, FaCalendarTimes, FaTruck, FaShoppingCart } from 'react-icons/fa';
import { useCalendario } from '../../hooks/useCalendario';
import { usePermissions } from '../../contexts/PermissionsContext';
import { StatCard } from '../../components/ui';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CalendarioDashboard = () => {
  const { user } = usePermissions();
  const {
    loading,
    estatisticas,
    carregarEstatisticas,
    carregarResumo
  } = useCalendario();

  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    carregarEstatisticas(ano);
  }, [ano, carregarEstatisticas]);

  useEffect(() => {
    const carregarResumoMes = async () => {
      const dados = await carregarResumo(ano, mes);
      if (dados) {
        setResumo(dados);
      }
    };
    carregarResumoMes();
  }, [ano, mes, carregarResumo]);

  const handleAnoChange = (novoAno) => {
    setAno(novoAno);
  };

  const handleMesChange = (novoMes) => {
    setMes(novoMes);
  };

  const gerarAnos = () => {
    const anos = [];
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
      anos.push(i);
    }
    return anos;
  };

  const gerarMeses = () => {
    return [
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FaCalendarAlt className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
                <p className="text-sm text-gray-500">Gerenciamento de calendário e configurações</p>
              </div>
            </div>
            
            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <select
                  value={ano}
                  onChange={(e) => handleAnoChange(parseInt(e.target.value))}
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  {gerarAnos().map(anoOption => (
                    <option key={anoOption} value={anoOption}>{anoOption}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <select
                  value={mes}
                  onChange={(e) => handleMesChange(parseInt(e.target.value))}
                  className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  {gerarMeses().map(mesOption => (
                    <option key={mesOption.value} value={mesOption.value}>{mesOption.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas Gerais */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={FaCalendarCheck}
              title="Total de Dias"
              value={estatisticas.estatisticas?.total_dias || 0}
              color="blue"
            />
            <StatCard
              icon={FaCalendarTimes}
              title="Dias Úteis"
              value={estatisticas.estatisticas?.dias_uteis || 0}
              color="green"
            />
            <StatCard
              icon={FaTruck}
              title="Dias de Abastecimento"
              value={estatisticas.estatisticas?.dias_abastecimento || 0}
              color="yellow"
            />
            <StatCard
              icon={FaShoppingCart}
              title="Dias de Consumo"
              value={estatisticas.estatisticas?.dias_consumo || 0}
              color="purple"
            />
          </div>
        )}

        {/* Resumo do Mês */}
        {resumo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo do Mês - {gerarMeses().find(m => m.value === mes)?.label} {ano}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{resumo.total_dias || 0}</div>
                <div className="text-sm text-gray-500">Total de Dias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{resumo.dias_uteis || 0}</div>
                <div className="text-sm text-gray-500">Dias Úteis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{resumo.dias_abastecimento || 0}</div>
                <div className="text-sm text-gray-500">Dias de Abastecimento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{resumo.dias_consumo || 0}</div>
                <div className="text-sm text-gray-500">Dias de Consumo</div>
              </div>
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/calendario/visualizacao"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <FaEye className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Visualização</h3>
                <p className="text-sm text-gray-500">Visualizar calendário mensal</p>
              </div>
            </div>
          </Link>

          <Link
            to="/calendario/configuracao"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <FaCog className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Configuração</h3>
                <p className="text-sm text-gray-500">Configurar dias e feriados</p>
              </div>
            </div>
          </Link>

          <Link
            to="/calendario/relatorios"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <FaChartBar className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Relatórios</h3>
                <p className="text-sm text-gray-500">Análises e gráficos</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CalendarioDashboard;
