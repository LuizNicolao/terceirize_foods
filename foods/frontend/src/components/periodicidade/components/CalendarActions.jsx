import React from 'react';
import { FaDownload, FaCog } from 'react-icons/fa';
import { Button } from '../../ui';

const CalendarActions = ({
  isViewMode,
  exporting,
  generatingReport,
  loading,
  onExportCalendar,
  onGenerateReport
}) => {
  if (isViewMode) {
    return null;
  }

  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
        type="button"
        onClick={onExportCalendar}
        variant="outline"
        size="sm"
        disabled={exporting || loading}
      >
        {exporting ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
            Exportando...
          </>
        ) : (
          <>
            <FaDownload className="mr-1" />
            Exportar Calendário
          </>
        )}
      </Button>
      
      <Button
        type="button"
        onClick={onGenerateReport}
        variant="outline"
        size="sm"
        disabled={generatingReport || loading}
      >
        {generatingReport ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
            Gerando...
          </>
        ) : (
          <>
            <FaCog className="mr-1" />
            Gerar Relatório
          </>
        )}
      </Button>
    </div>
  );
};

export default CalendarActions;
