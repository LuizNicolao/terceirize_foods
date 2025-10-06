import { useState, useEffect } from 'react';
import { recebimentosRelatoriosService } from '../services/recebimentos';
import toast from 'react-hot-toast';

const useRecebimentosRelatorios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados de paginação para cada tipo de relatório
  const [paginationPendencias, setPaginationPendencias] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const [paginationCompletos, setPaginationCompletos] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Estados para armazenar dados carregados
  const [dadosPendencias, setDadosPendencias] = useState(null);
  const [dadosCompletos, setDadosCompletos] = useState(null);
  const [dadosDashboard, setDadosDashboard] = useState(null);

  const carregarRelatorioPendencias = async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Armazenar filtros atuais para recarregamento automático
      setFiltrosAtuaisPendencias(filtros);
      
      // Incluir parâmetros de paginação nos filtros
      const filtrosComPaginacao = {
        ...filtros,
        page: paginationPendencias.currentPage,
        limit: paginationPendencias.itemsPerPage
      };
      
      const response = await recebimentosRelatoriosService.relatorioPendencias(filtrosComPaginacao);
      if (response.success) {
        // Atualizar paginação se fornecida na resposta
        if (response.data && response.data.pagination) {
          setPaginationPendencias(response.data.pagination);
        }
        // Armazenar dados
        setDadosPendencias(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao carregar relatório de pendências');
      }
    } catch (error) {
      console.error('Erro ao carregar relatório de pendências:', error);
      setError('Erro ao carregar relatório de pendências');
      toast.error('Erro ao carregar relatório de pendências');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const carregarRelatorioCompletos = async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Armazenar filtros atuais para recarregamento automático
      setFiltrosAtuaisCompletos(filtros);
      
      // Incluir parâmetros de paginação nos filtros
      const filtrosComPaginacao = {
        ...filtros,
        page: paginationCompletos.currentPage,
        limit: paginationCompletos.itemsPerPage
      };
      
      const response = await recebimentosRelatoriosService.relatorioCompletos(filtrosComPaginacao);
      if (response.success) {
        // Atualizar paginação se fornecida na resposta
        if (response.data && response.data.pagination) {
          setPaginationCompletos(response.data.pagination);
        }
        // Armazenar dados
        setDadosCompletos(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao carregar relatório de completos');
      }
    } catch (error) {
      console.error('Erro ao carregar relatório de completos:', error);
      setError('Erro ao carregar relatório de completos');
      toast.error('Erro ao carregar relatório de completos');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const carregarDashboard = async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await recebimentosRelatoriosService.dashboardRelatorios(filtros);
      if (response.success) {
        // Armazenar dados
        setDadosDashboard(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao carregar dashboard');
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dashboard');
      toast.error('Erro ao carregar dashboard');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar todos os dados iniciais (sem filtros)
  const carregarDadosIniciais = async () => {
    try {
      await Promise.all([
        carregarDashboard({}),
        carregarRelatorioPendencias({}),
        carregarRelatorioCompletos({})
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  // Função para obter dados com paginação
  const obterDadosComPaginacao = async (tipo, filtros = {}) => {
    switch (tipo) {
      case 'pendencias':
        return await carregarRelatorioPendencias(filtros);
      case 'completos':
        return await carregarRelatorioCompletos(filtros);
      case 'dashboard':
        return await carregarDashboard(filtros);
      default:
        throw new Error('Tipo de relatório inválido');
    }
  };

  // Funções de controle de paginação para pendências
  const setPagePendencias = (page) => {
    setPaginationPendencias(prev => ({ ...prev, currentPage: page }));
  };

  const setLimitPendencias = (limit) => {
    setPaginationPendencias(prev => ({ ...prev, itemsPerPage: limit, currentPage: 1 }));
  };

  // Funções de controle de paginação para completos
  const setPageCompletos = (page) => {
    setPaginationCompletos(prev => ({ ...prev, currentPage: page }));
  };

  const setLimitCompletos = (limit) => {
    setPaginationCompletos(prev => ({ ...prev, itemsPerPage: limit, currentPage: 1 }));
  };

  // Estados para armazenar filtros atuais
  const [filtrosAtuaisPendencias, setFiltrosAtuaisPendencias] = useState({});
  const [filtrosAtuaisCompletos, setFiltrosAtuaisCompletos] = useState({});

  // Recarregar dados quando a paginação de pendências mudar (com debounce)
  useEffect(() => {
    if (Object.keys(filtrosAtuaisPendencias).length > 0) {
      const timeoutId = setTimeout(() => {
        carregarRelatorioPendencias(filtrosAtuaisPendencias);
      }, 300); // Debounce de 300ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [paginationPendencias.currentPage, paginationPendencias.itemsPerPage]);

  // Recarregar dados quando a paginação de completos mudar (com debounce)
  useEffect(() => {
    if (Object.keys(filtrosAtuaisCompletos).length > 0) {
      const timeoutId = setTimeout(() => {
        carregarRelatorioCompletos(filtrosAtuaisCompletos);
      }, 300); // Debounce de 300ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [paginationCompletos.currentPage, paginationCompletos.itemsPerPage]);

  return {
    loading,
    error,
    carregarRelatorioPendencias,
    carregarRelatorioCompletos,
    carregarDashboard,
    carregarDadosIniciais,
    obterDadosComPaginacao,
    // Estados de paginação
    paginationPendencias,
    paginationCompletos,
    // Funções de controle de paginação
    setPagePendencias,
    setLimitPendencias,
    setPageCompletos,
    setLimitCompletos,
    // Dados armazenados
    dadosPendencias,
    dadosCompletos,
    dadosDashboard
  };
};

export default useRecebimentosRelatorios;
