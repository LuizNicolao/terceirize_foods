import React from 'react';
import { Button } from '../../ui';

const CalendarNavigation = ({
  selectedMonth,
  onMonthChange,
  isViewMode
}) => {
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center">
        <Button
          type="button"
          onClick={() => onMonthChange('prev')}
          variant="outline"
          size="sm"
          disabled={isViewMode}
        >
          ← Mês Anterior
        </Button>
        
        <h2 className="text-xl font-semibold text-gray-800 capitalize">
          {formatMonthYear(selectedMonth)}
        </h2>
        
        <Button
          type="button"
          onClick={() => onMonthChange('next')}
          variant="outline"
          size="sm"
          disabled={isViewMode}
        >
          Próximo Mês →
        </Button>
      </div>
    </div>
  );
};

export default CalendarNavigation;
