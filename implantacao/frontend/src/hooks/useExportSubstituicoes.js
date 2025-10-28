import { useState, useCallback } from 'react';
import { substituicoesNecessidadesService } from '../services/substituicoesNecessidades';

/**
 * Hook para gerenciar exportações de substituições
 */
export const useExportSubstituicoes = () => {
  const [exportando, setExportando] = useState(false);

  // Exportar para PDF
  const exportarPDF = useCallback(async (necessidades, tipo = 'nutricionista') => {
    setExportando(true);
    try {
      const response = await substituicoesNecessidadesService.exportarPDF(necessidades, tipo);
      
      if (response.success) {
        // Criar link para download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `substituicoes_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    } finally {
      setExportando(false);
    }
  }, []);

  // Exportar para XLSX
  const exportarXLSX = useCallback(async (necessidades, tipo = 'nutricionista') => {
    setExportando(true);
    try {
      const response = await substituicoesNecessidadesService.exportarXLSX(necessidades, tipo);
      
      if (response.success) {
        // Criar link para download
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `substituicoes_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      throw error;
    } finally {
      setExportando(false);
    }
  }, []);

  return {
    exportando,
    exportarPDF,
    exportarXLSX
  };
};
