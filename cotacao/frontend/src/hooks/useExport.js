import { useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar exportações (XLSX e PDF)
 * @param {Object} service - Serviço que contém os métodos de exportação
 * @returns {Object} Funções de exportação
 */
export const useExport = (service) => {
  const handleExportXLSX = useCallback(async (filters = {}) => {
    try {
      const response = await api.get(service.exportXLSXEndpoint || '/export/xlsx', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${service.entityName || 'relatorio'}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar relatório');
    }
  }, [service]);

  const handleExportPDF = useCallback(async (filters = {}) => {
    try {
      const response = await api.get(service.exportPDFEndpoint || '/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${service.entityName || 'relatorio'}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório');
    }
  }, [service]);

  return {
    handleExportXLSX,
    handleExportPDF
  };
};
