import { useState, useEffect } from 'react';
import recebimentosRelatoriosService from '../services/recebimentosRelatoriosService';
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
    setLoading(true);
    setError(null);
    
    try {
      // Carregar dashboard sem filtros
      await carregarDashboard({});
      
      // Carregar pendências sem filtros
      await carregarRelatorioPendencias({});
      
      // Carregar completos sem filtros
      await carregarRelatorioCompletos({});
      
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      setError('Erro ao carregar dados iniciais');
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter dados com paginação correta
  const obterDadosComPaginacao = (tipo) => {
    switch (tipo) {
      case 'pendencias':
        return {
          dados: dadosPendencias,
          pagination: paginationPendencias
        };
      case 'completos':
        return {
          dados: dadosCompletos,
          pagination: paginationCompletos
        };
      case 'dashboard':
        return {
          dados: dadosDashboard,
          pagination: null
        };
      default:
        return { dados: null, pagination: null };
    }
  };

  // Funções para controlar paginação
  const setPagePendencias = (page) => {
    setPaginationPendencias(prev => ({ ...prev, currentPage: page }));
  };

  const setLimitPendencias = (limit) => {
    setPaginationPendencias(prev => ({ ...prev, itemsPerPage: limit, currentPage: 1 }));
  };

  const setPageCompletos = (page) => {
    setPaginationCompletos(prev => ({ ...prev, currentPage: page }));
  };

  const setLimitCompletos = (limit) => {
    setPaginationCompletos(prev => ({ ...prev, itemsPerPage: limit, currentPage: 1 }));
  };

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
