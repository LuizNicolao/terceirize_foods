import { useState } from 'react';
import { supervisorExportService } from '../services/supervisorExport';

export const useAprovacaoExport = () => {
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async (viewMode, cotacao) => {
    if (!cotacao) {
      console.error('Cotação não fornecida para exportação');
      return;
    }

    setExporting(true);
    try {
      await supervisorExportService.exportarPDF(cotacao.id, viewMode);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async (viewMode, cotacao) => {
    if (!cotacao) {
      console.error('Cotação não fornecida para exportação');
      return;
    }

    setExporting(true);
    try {
      await supervisorExportService.exportarExcel(cotacao.id, viewMode);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    handleExportPDF,
    handleExportExcel
  };
};
