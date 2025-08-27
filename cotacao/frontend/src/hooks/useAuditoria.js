import { useState, useEffect } from 'react';
import { auditoriaService } from '../services/auditoria';
import toast from 'react-hot-toast';

export const useAuditoria = (entityName) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    data_inicio: '',
    data_fim: '',
    acao: 'todas',
    recurso: 'todos',
    usuario_id: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchLogs = async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro testar o endpoint simples
      console.log('Testando endpoint simples...');
      const simpleTest = await auditoriaService.testSimple();
      console.log('Teste simples:', simpleTest);
      
      // Depois testar o banco
      console.log('Testando banco...');
      const dbTest = await auditoriaService.testDB();
      console.log('Teste banco:', dbTest);
      
      const filtersToUse = customFilters || filters;
      const response = await auditoriaService.getLogs(filtersToUse);
      
      setLogs(response.data || []);
      setPagination(response.meta?.pagination || {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      setError(error.message || 'Erro ao carregar logs de auditoria');
      toast.error('Erro ao carregar logs de auditoria');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (customFilters = null) => {
    try {
      const filtersToUse = customFilters || filters;
      const response = await auditoriaService.getStats(filtersToUse);
      return response.data || {};
    } catch (error) {
      console.error('Erro ao buscar estatísticas de auditoria:', error);
      toast.error('Erro ao carregar estatísticas de auditoria');
      return {};
    }
  };

  const exportXLSX = async (customFilters = null) => {
    try {
      const filtersToUse = customFilters || filters;
      const response = await auditoriaService.exportXLSX(filtersToUse);
      
      // Criar blob e download
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auditoria_${entityName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Exportação em Excel realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar auditoria em Excel:', error);
      toast.error('Erro ao exportar dados de auditoria');
    }
  };

  const exportPDF = async (customFilters = null) => {
    try {
      const filtersToUse = customFilters || filters;
      const response = await auditoriaService.exportPDF(filtersToUse);
      
      // Criar blob e download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auditoria_${entityName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Exportação em PDF realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar auditoria em PDF:', error);
      toast.error('Erro ao exportar dados de auditoria');
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const goToPage = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      goToPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrevPage) {
      goToPage(pagination.page - 1);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  return {
    logs,
    loading,
    error,
    filters,
    pagination,
    fetchLogs,
    fetchStats,
    exportXLSX,
    exportPDF,
    updateFilters,
    goToPage,
    nextPage,
    prevPage
  };
};
