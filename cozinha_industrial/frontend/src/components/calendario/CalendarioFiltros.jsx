import React from 'react';
import { FaCalendarAlt, FaFilter, FaTimes } from 'react-icons/fa';
import { Input, SearchableSelect, Button } from '../ui';

const CalendarioFiltros = ({
  filtros,
  onFilterChange,
  onClearFilters,
  loading = false
}) => {
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

  const opcoesFeriado = [
    { value: '', label: 'Todos' },
    { value: '1', label: 'Apenas Feriados' },
    { value: '0', label: 'Excluir Feriados' }
  ];

  const handleInputChange = (campo, valor) => {
    onFilterChange({ [campo]: valor });
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div className="space-y-4">
      {/* Filtros de Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Data Início"
            type="date"
            value={filtros.data_inicio || ''}
            onChange={(e) => handleInputChange('data_inicio', e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div>
          <Input
            label="Data Fim"
            type="date"
            value={filtros.data_fim || ''}
            onChange={(e) => handleInputChange('data_fim', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Filtros de Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <SearchableSelect
            label="Tipo de Dia"
            value={filtros.tipo_dia || ''}
            onChange={(value) => handleInputChange('tipo_dia', value)}
            options={opcoesTipoDia}
            placeholder="Selecione o tipo..."
            disabled={loading}
          />
        </div>
        
        <div>
          <SearchableSelect
            label="Dia da Semana"
            value={filtros.dia_semana || ''}
            onChange={(value) => handleInputChange('dia_semana', value)}
            options={opcoesDiaSemana}
            placeholder="Selecione o dia..."
            disabled={loading}
          />
        </div>
        
        <div>
          <SearchableSelect
            label="Feriado"
            value={filtros.feriado || ''}
            onChange={(value) => handleInputChange('feriado', value)}
            options={opcoesFeriado}
            placeholder="Filtrar feriados..."
            disabled={loading}
          />
        </div>
      </div>

      {/* Filtros de Paginação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Limite de Registros"
            type="number"
            value={filtros.limit || 100}
            onChange={(e) => handleInputChange('limit', parseInt(e.target.value) || 100)}
            disabled={loading}
            min="1"
            max="1000"
          />
        </div>
        
        <div>
          <Input
            label="Offset"
            type="number"
            value={filtros.offset || 0}
            onChange={(e) => handleInputChange('offset', parseInt(e.target.value) || 0)}
            disabled={loading}
            min="0"
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          onClick={handleClearFilters}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <FaTimes className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
        
        <Button
          onClick={() => onFilterChange(filtros)}
          variant="primary"
          size="sm"
          disabled={loading}
        >
          <FaFilter className="h-4 w-4 mr-2" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

export default CalendarioFiltros;
