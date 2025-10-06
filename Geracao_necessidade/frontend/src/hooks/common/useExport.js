/**
 * Hook para funcionalidades de exportação
 */

import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useExport = (service) => {
  /**
   * Exporta dados para Excel (XLSX)
   */
  const handleExportXLSX = useCallback(async (filters = {}) => {
    try {
      const response = await service.exportXLSX(filters);
      
      // Cria link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Exportação para Excel realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      toast.error('Erro ao exportar para Excel');
    }
  }, [service]);

  /**
   * Exporta dados para PDF
   */
  const handleExportPDF = useCallback(async (filters = {}) => {
    try {
      const response = await service.exportPDF(filters);
      
      // Cria link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Exportação para PDF realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      toast.error('Erro ao exportar para PDF');
    }
  }, [service]);

  return {
    handleExportXLSX,
    handleExportPDF
  };
};
