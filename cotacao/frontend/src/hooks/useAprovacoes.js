import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import aprovacoesService from '../services/aprovacoes';
import { useAuditoria } from './useAuditoria';
import toast from 'react-hot-toast';

export const useAprovacoes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [aprovacoes, setAprovacoes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [compradorFilter, setCompradorFilter] = useState('');
  const [dataInicioFilter, setDataInicioFilter] = useState('');
  const [dataFimFilter, setDataFimFilter] = useState('');

  // Hook de auditoria
  const {
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useAuditoria('aprovacoes');

  const fetchAprovacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const data = await aprovacoesService.getAprovacoes(params.toString());
      setAprovacoes(data.data || data);
    } catch (error) {
      console.error('Erro ao buscar aprovações:', error);
      setError(error.message || 'Erro ao carregar aprovações');
      toast.error('Erro ao carregar aprovações');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await aprovacoesService.getStats();
      setStats(data.data || data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, []);

  const handleView = useCallback((id) => {
    navigate(`/visualizar-cotacao/${id}`);
  }, [navigate]);

  const handleAnalisar = useCallback((id) => {
    navigate(`/analisar-cotacao/${id}`);
  }, [navigate]);



  const refetch = useCallback(() => {
    fetchAprovacoes();
  }, [fetchAprovacoes]);

  useEffect(() => {
    fetchAprovacoes();
    fetchStats();
  }, [fetchAprovacoes, fetchStats]);

  return {
    // Estados
    aprovacoes,
    stats,
    loading,
    error,
    
    // Filtros
    searchTerm,
    setSearchTerm,
    
    // Funções
    refetch,
    fetchCotacoesPendentes: fetchAprovacoes,
    fetchStats,
    
    // Auditoria
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  };
};
