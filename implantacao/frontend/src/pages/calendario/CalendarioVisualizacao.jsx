import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaFilter, FaTimes, FaCalendarCheck, FaTruck, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';
import { useCalendario } from '../../hooks/useCalendario';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Button, Input, SearchableSelect } from '../../components/ui';
import { Link } from 'react-router-dom';
import CalendarioGrid from '../../components/calendario/CalendarioGrid';
import CalendarioFiltros from '../../components/calendario/CalendarioFiltros';
import toast from 'react-hot-toast';

const CalendarioVisualizacao = () => {
  const { user } = usePermissions();
  const {
    loading,
    dados,
    filtros,
    carregarPorMes,
    carregarDados,
    atualizarFiltros,
    limparFiltros
  } = useCalendario();

  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  // Removido tipoVisualizacao - apenas visualização em mês

  useEffect(() => {
    if (ano && mes && mes > 0) {
      carregarPorMes(ano, mes);
    }
  }, [ano, mes, carregarPorMes]);

  const handleAnoChange = (novoAno) => {
    setAno(novoAno);
    atualizarFiltros({ ano: novoAno });
  };

  const handleMesChange = (novoMes) => {
    setMes(novoMes);
    atualizarFiltros({ mes: novoMes });
  };


  const handleLimparFiltros = () => {
    limparFiltros();
    setAno(new Date().getFullYear());
    setMes(new Date().getMonth() + 1);
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

  const opcoesTipoDia = [
    { value: '', label: 'Todos os tipos' },
    { value: 'util', label: 'Dias Úteis' },
    { value: 'abastecimento', label: 'Dias de Abastecimento' },
    { value: 'consumo', label: 'Dias de Consumo' },
    { value: 'feriado', label: 'Feriados' }
  ];

  const opcoesDiaSemana = [
    { value: '', label: 'Todos os dias' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' }
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
          <FaCalendarAlt className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Visualização do Calendário</h1>
            <p className="text-sm text-gray-600">Visualize e filtre dados do calendário</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            variant={mostrarFiltros ? "primary" : "outline"}
            size="sm"
          >
            <FaFilter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>
        {/* Controles */}
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
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <SearchableSelect
                  value={mes}
                  onChange={handleMesChange}
                  options={gerarMeses()}
                  placeholder="Selecione o mês..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                variant={mostrarFiltros ? 'primary' : 'outline'}
                size="sm"
              >
                <FaFilter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
              <Button
                onClick={handleLimparFiltros}
                variant="outline"
                size="sm"
              >
                <FaTimes className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
            
            <CalendarioFiltros
              filtros={filtros}
              onFilterChange={handleFiltrosChange}
              onClearFilters={handleLimparFiltros}
              loading={loading}
            />
          </div>
        )}

        {/* Conteúdo */}
        <CalendarioGrid
          dados={dados}
          ano={ano}
          mes={mes}
          loading={loading}
        />
    </div>
  );
};

export default CalendarioVisualizacao;
