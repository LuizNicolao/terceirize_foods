import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import supervisorService from '../services/supervisor';
import toast from 'react-hot-toast';

export const useSupervisor = () => {
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFornecedor, setSelectedFornecedor] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusStats, setStatusStats] = useState({
    total: 0,
    aguardandoAnalise: 0,
    emRenegociacao: 0
  });

  const navigate = useNavigate();

  // Carregar cotações pendentes do supervisor
  const loadCotacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await supervisorService.getCotacoesPendentes();
      
      if (result.success) {
        setCotacoes(result.data);
      } else {
        setError(result.message || 'Erro ao carregar cotações');
        toast.error(result.message || 'Erro ao carregar cotações');
      }
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
      setError('Erro ao conectar com o servidor');
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadCotacoes();
  }, [loadCotacoes]);

  // Atualizar estatísticas quando cotações mudarem
  useEffect(() => {
    if (cotacoes.length > 0) {
      const stats = {
        total: cotacoes.length,
        aguardandoAnalise: cotacoes.filter(c => c.status === 'aguardando_aprovacao_supervisor').length,
        emRenegociacao: cotacoes.filter(c => c.status === 'renegociacao').length
      };
      setStatusStats(stats);
    }
  }, [cotacoes]);

  // Filtrar cotações
  const filteredCotacoes = useCallback(() => {
    let filtered = cotacoes;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(cotacao => 
        cotacao.comprador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cotacao.local_entrega?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cotacao.tipo_compra?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por fornecedor
    if (selectedFornecedor) {
      filtered = filtered.filter(cotacao => {
        // Verificar se a cotação tem produtos com o fornecedor selecionado
        return cotacao.produtos?.some(produto => 
          produto.fornecedor === selectedFornecedor
        );
      });
    }

    return filtered;
  }, [cotacoes, searchTerm, selectedFornecedor]);

  // Navegar para análise
  const handleAnalysisClick = (cotacao) => {
    navigate(`/analisar-cotacao-supervisor/${cotacao.id}`);
  };

  // Atualizar filtros
  const updateFilters = (newFilters) => {
    if (newFilters.searchTerm !== undefined) setSearchTerm(newFilters.searchTerm);
    if (newFilters.selectedFornecedor !== undefined) setSelectedFornecedor(newFilters.selectedFornecedor);
    if (newFilters.sortBy !== undefined) setSortBy(newFilters.sortBy);
    if (newFilters.sortOrder !== undefined) setSortOrder(newFilters.sortOrder);
  };

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFornecedor('');
    setSortBy('nome');
    setSortOrder('asc');
  };

  // Recarregar dados
  const refreshData = () => {
    loadCotacoes();
  };

  return {
    // Estados
    cotacoes: filteredCotacoes(),
    loading,
    error,
    searchTerm,
    selectedFornecedor,
    sortBy,
    sortOrder,
    statusStats,
    
    // Funções
    handleAnalysisClick,
    updateFilters,
    clearFilters,
    refreshData,
    loadCotacoes
  };
};
