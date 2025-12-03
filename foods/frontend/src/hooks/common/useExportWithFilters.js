import { useCallback } from 'react';
import { useExport } from './useExport';

/**
 * Hook compartilhado para exportação com filtros
 * 
 * @param {Object} service - Serviço que possui métodos exportarXLSX e exportarPDF
 * @param {Function} getFilterParams - Função que retorna os parâmetros de filtro atuais
 * 
 * @returns {Object} - Objeto com handleExportXLSX e handleExportPDF que incluem os filtros automaticamente
 * 
 * @example
 * const { handleExportXLSX, handleExportPDF } = useExportWithFilters(
 *   RotasService,
 *   () => ({
 *     search: searchTerm || undefined,
 *     filial_id: filialFilter !== 'todos' ? filialFilter : undefined
 *   })
 * );
 */
export const useExportWithFilters = (service, getFilterParams) => {
  const { handleExportXLSX: baseExportXLSX, handleExportPDF: baseExportPDF } = useExport(service);

  /**
   * Exportar para XLSX com filtros aplicados
   */
  const handleExportXLSX = useCallback(() => {
    const params = getFilterParams ? getFilterParams() : {};
    // Remover propriedades undefined/null para não enviar parâmetros vazios
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    return baseExportXLSX(cleanParams);
  }, [baseExportXLSX, getFilterParams]);

  /**
   * Exportar para PDF com filtros aplicados
   */
  const handleExportPDF = useCallback(() => {
    const params = getFilterParams ? getFilterParams() : {};
    // Remover propriedades undefined/null para não enviar parâmetros vazios
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    return baseExportPDF(cleanParams);
  }, [baseExportPDF, getFilterParams]);

  return {
    handleExportXLSX,
    handleExportPDF
  };
};

