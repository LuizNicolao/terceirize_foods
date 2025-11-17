import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

/**
 * Hook para consultar rotas nutricionistas do sistema Foods
 * Modo apenas leitura - sem operações CRUD
 */
export const useRotasNutricionistasConsulta = () => {
  // Estados principais
  const [allRotasNutricionistas, setAllRotasNutricionistas] = useState([]); // Todos os dados
  const [rotasNutricionistas, setRotasNutricionistas] = useState([]); // Dados da página atual
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos', // todos, ativo, inativo
    nutricionista: '',
    supervisor: '',
    coordenador: ''
  });

  // Estado separado para o termo de busca (muda a cada letra)
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0
  });

  /**
   * Aplicar paginação no frontend
   */
  const applyFrontendPagination = useCallback((allData, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allData.slice(startIndex, endIndex);
  }, []);

  /**
   * Calcular estatísticas localmente
   */
  const calcularEstatisticas = useCallback((rotasData) => {
    const total = rotasData.length;
    const ativos = rotasData.filter(r => r.status === 'ativo' || r.status === 1).length;
    const inativos = rotasData.filter(r => r.status === 'inativo' || r.status === 0).length;
    
    return { total, ativos, inativos };
  }, []);

  /**
   * Verificar conexão com Foods
   */
  const checkConnection = useCallback(async () => {
    try {
      const result = await FoodsApiService.checkConnection();
      setConnectionStatus(result);
      return result.connected;
    } catch (error) {
      setConnectionStatus({
        success: false,
        connected: false,
        message: 'Erro ao verificar conexão',
        error: error.message
      });
      return false;
    }
  }, []);

  /**
   * Filtrar dados localmente
   */
  const filtrarDadosLocalmente = useCallback((dados, filtros) => {
    if (!filtros.search) {
      return dados;
    }
    
    const searchLower = filtros.search.toLowerCase();
    return dados.filter(rota => {
      const nomeRota = (rota.nome || '').toLowerCase();
      const nutricionista = (rota.usuario_nome || rota.nutricionista_nome || '').toLowerCase();
      const supervisor = (rota.supervisor_nome || '').toLowerCase();
      const coordenador = (rota.coordenador_nome || '').toLowerCase();
      
      return nomeRota.includes(searchLower) ||
             nutricionista.includes(searchLower) ||
             supervisor.includes(searchLower) ||
             coordenador.includes(searchLower);
    });
  }, []);

  /**
   * Carregar rotas nutricionistas
   */
  const carregarRotasNutricionistas = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Verificar conexão primeiro
      const connected = await checkConnection();
      
      if (!connected) {
        throw new Error('Não foi possível conectar ao sistema Foods');
      }


      // Preparar parâmetros da consulta (não incluir search, pois busca é local)
      const queryParams = {
        ...filters,
        ...params
      };
      
      // Remover search dos parâmetros da API (busca é feita localmente)
      delete queryParams.search;

      // Remover parâmetros vazios
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === 'todos') {
          delete queryParams[key];
        }
      });

      // Buscar todos os dados fazendo múltiplas requisições
      let allRotasData = [];
      let page = 1;
      let hasMoreData = true;
      const limit = 100; // Limite máximo permitido pelo Foods

      while (hasMoreData) {
        const result = await FoodsApiService.getRotasNutricionistas({
          ...queryParams,
          page,
          limit
        });

        if (result.success && result.data.length > 0) {
          allRotasData = [...allRotasData, ...result.data];
          
          // Se retornou menos que o limite, não há mais dados
          if (result.data.length < limit) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }

        // Limite de segurança para evitar loop infinito
        if (page > 50) {
          hasMoreData = false;
        }
      }

      // Simular resultado como se fosse uma única requisição
      const result = {
        success: true,
        data: allRotasData,
        pagination: null
      };

      if (result.success) {
        // Garantir que result.data seja sempre um array
        const rotasData = Array.isArray(result.data) ? result.data : [];
        
        // Aplicar filtro de busca localmente se houver
        const dadosFiltrados = filtrarDadosLocalmente(rotasData, filters);
        
        // Sempre aplicar paginação no frontend (como no fornecedores)
        setAllRotasNutricionistas(rotasData);
        
        const totalItems = dadosFiltrados.length;
        const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
        const currentPage = Math.min(pagination.currentPage, totalPages);
        
        // Aplicar paginação nos dados filtrados
        const paginatedData = applyFrontendPagination(dadosFiltrados, currentPage, pagination.itemsPerPage);
        
        setRotasNutricionistas(paginatedData);
        setPagination(prev => ({
          ...prev,
          totalItems,
          totalPages,
          currentPage
        }));

        // Calcular estatísticas com todos os dados carregados (não apenas da página atual)
        const estatisticas = calcularEstatisticas(rotasData);
        setStats(estatisticas);
      } else {
        setError(result.message);
        setRotasNutricionistas([]);
      }
    } catch (err) {
      setError(err.message);
      setRotasNutricionistas([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters.status, filters.nutricionista, filters.supervisor, filters.coordenador, checkConnection, filtrarDadosLocalmente]);

  /**
   * Carregar estatísticas
   */
  const carregarEstatisticas = useCallback(async () => {
    // Se temos dados locais, calcular estatísticas localmente
    if (allRotasNutricionistas.length > 0) {
      const estatisticas = calcularEstatisticas(allRotasNutricionistas);
      setStats(estatisticas);
      return;
    }

    // Senão, tentar buscar do backend (se existir endpoint de stats)
    try {
      // Por enquanto, não temos endpoint de stats específico para rotas nutricionistas
      // As estatísticas são calculadas localmente
    } catch (err) {
      // Não definir erro aqui pois não é crítico
    }
  }, [allRotasNutricionistas, calcularEstatisticas]);

  /**
   * Buscar rota nutricionista por ID
   */
  const buscarRotaNutricionistaPorId = useCallback(async (id) => {
    try {
      const result = await FoodsApiService.getRotaNutricionistaById(id);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      throw err;
    }
  }, []);

  /**
   * Atualizar termo de busca (sem aplicar filtro)
   */
  const atualizarSearchTerm = useCallback((termo) => {
    setSearchTerm(termo);
  }, []);

  /**
   * Aplicar busca (chamado quando pressiona Enter)
   */
  const aplicarBusca = useCallback(() => {
    const novosFiltros = { ...filters, search: searchTerm };
    setFilters(novosFiltros);
    
    // Filtrar dados localmente
    const dadosFiltrados = filtrarDadosLocalmente(allRotasNutricionistas, novosFiltros);
    
    setPagination(prev => {
      const updatedPagination = { ...prev, currentPage: 1 }; // Reset para primeira página
      
      const totalItems = dadosFiltrados.length;
      const totalPages = Math.ceil(totalItems / updatedPagination.itemsPerPage) || 1;
      
      // Aplicar paginação no frontend com os dados filtrados
      const paginatedData = applyFrontendPagination(dadosFiltrados, updatedPagination.currentPage, updatedPagination.itemsPerPage);
      setRotasNutricionistas(paginatedData);
      
      return {
        ...updatedPagination,
        totalItems,
        totalPages
      };
    });
  }, [searchTerm, filters, allRotasNutricionistas, filtrarDadosLocalmente, applyFrontendPagination]);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFilters(prev => ({ ...prev, ...novosFiltros }));
    // Se atualizou o search, também atualiza o searchTerm
    if (novosFiltros.search !== undefined) {
      setSearchTerm(novosFiltros.search);
    }
    setPagination(prev => {
      const updatedPagination = { ...prev, currentPage: 1 }; // Reset para primeira página
      
      // Aplicar paginação no frontend com os novos filtros
      const paginatedData = applyFrontendPagination(allRotasNutricionistas, updatedPagination.currentPage, updatedPagination.itemsPerPage);
      setRotasNutricionistas(paginatedData);
      
      return updatedPagination;
    });
  }, [allRotasNutricionistas, applyFrontendPagination]);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => {
      const updatedPagination = { ...prev, ...novaPaginacao };
      
      // Se mudou a página ou itens por página, aplicar paginação no frontend
      if (novaPaginacao.currentPage || novaPaginacao.itemsPerPage) {
        const paginatedData = applyFrontendPagination(allRotasNutricionistas, updatedPagination.currentPage, updatedPagination.itemsPerPage);
        setRotasNutricionistas(paginatedData);
      }
      
      return updatedPagination;
    });
  }, [allRotasNutricionistas, applyFrontendPagination]);

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    setFilters({ search: '', status: 'todos', nutricionista: '', supervisor: '', coordenador: '' });
    setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 });
    setAllRotasNutricionistas([]);
    setRotasNutricionistas([]);
    setLoading(true);
    setError(null);
    checkConnection();
    carregarRotasNutricionistas();
    carregarEstatisticas();
  }, [checkConnection, carregarRotasNutricionistas, carregarEstatisticas]);

  // Efeitos
  useEffect(() => {
    carregarRotasNutricionistas();
  }, [carregarRotasNutricionistas]);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  // Retornar interface do hook
  const isConnected = connectionStatus?.connected;
  const hasError = error !== null || !isConnected;
  const isEmpty = !loading && rotasNutricionistas.length === 0 && !hasError;

  return {
    // Dados
    rotasNutricionistas,
    stats,
    connectionStatus,
    loading,
    error,
    pagination,
    filters,
    searchTerm,
    
    // Ações
    carregarRotasNutricionistas,
    buscarRotaNutricionistaPorId,
    atualizarFiltros,
    atualizarSearchTerm,
    aplicarBusca,
    atualizarPaginacao,
    recarregar,

    // Status
    isConnected,
    hasError,
    isEmpty
  };
};


