import { useState, useEffect, useCallback } from 'react';
import NecessidadesPadroesService from '../../../../services/necessidadesPadroes';
import FoodsApiService from '../../../../services/FoodsApiService';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar estado e lógica da tela Criar Pedido Padrão
 */
export const useCriarPedidoPadrao = () => {
  const [necessidadesPadroes, setNecessidadesPadroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    filial_id: '',
    grupo_id: '',
    escola_id: ''
  });

  // Estados para opções dos filtros
  const [filiais, setFiliais] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);

  // Estados para paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Carregar escolas quando filial for selecionada
  useEffect(() => {
    if (filtros.filial_id) {
      carregarEscolas(filtros.filial_id);
    } else {
      setEscolas([]);
      // Limpar escola_id quando filial for removida
      setFiltros(prev => ({ ...prev, escola_id: '' }));
    }
  }, [filtros.filial_id]);

  const carregarNecessidadesPadroes = useCallback(async () => {
    setLoading(true);
    try {
      let necessidadesData = [];
      let totalItems = 0;
      let totalPages = 0;

      // Se filial foi selecionada, precisamos carregar todos os dados
      // e filtrar client-side (backend não suporta filtro por filial)
      if (filtros.filial_id) {
        // Carregar todas as necessidades padrão (sem paginação do backend)
        const params = {
          ativo: 1,
          limit: 10000 // Carregar muitas para filtrar client-side
        };

        if (filtros.grupo_id) {
          params.grupo_id = filtros.grupo_id;
        }

        const response = await NecessidadesPadroesService.listar(params);

        if (response.success && response.data) {
          necessidadesData = response.data?.data || [];

          // Buscar escolas da filial
          const escolasResponse = await FoodsApiService.getUnidadesEscolares({ 
            filial_id: filtros.filial_id, 
            limit: 1000 
          });

          let escolasIds = [];
          if (escolasResponse.success && escolasResponse.data) {
            const escolasData = Array.isArray(escolasResponse.data) 
              ? escolasResponse.data 
              : escolasResponse.data.data;
            
            if (Array.isArray(escolasData)) {
              escolasIds = escolasData.map(e => e.id);
            }
          }

          // Filtrar necessidades padrão que pertencem às escolas da filial
          necessidadesData = Array.isArray(necessidadesData)
            ? necessidadesData.filter(np => escolasIds.includes(np.escola_id))
            : [];

          // Se escola específica foi selecionada, filtrar por ela também
          if (filtros.escola_id) {
            necessidadesData = necessidadesData.filter(np => np.escola_id === parseInt(filtros.escola_id));
          }

          // Calcular paginação client-side
          totalItems = necessidadesData.length;
          totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
          
          // Aplicar paginação client-side
          const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
          const endIndex = startIndex + pagination.itemsPerPage;
          necessidadesData = necessidadesData.slice(startIndex, endIndex);
        }
      } else {
        // Quando não há filtro de filial, usar paginação do backend
        const params = {
          ativo: 1,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage
        };

        if (filtros.grupo_id) {
          params.grupo_id = filtros.grupo_id;
        }

        const response = await NecessidadesPadroesService.listar(params);

        if (response.success && response.data) {
          necessidadesData = response.data?.data || [];
          
          // Se escola específica foi selecionada, filtrar por ela
          if (filtros.escola_id) {
            necessidadesData = necessidadesData.filter(np => np.escola_id === parseInt(filtros.escola_id));
          }
          
          const paginationData = response.data?.pagination || {};
          
          // Se filtramos por escola, recalcular paginação
          if (filtros.escola_id) {
            totalItems = necessidadesData.length;
            totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
            
            // Aplicar paginação client-side
            const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
            const endIndex = startIndex + pagination.itemsPerPage;
            necessidadesData = necessidadesData.slice(startIndex, endIndex);
          } else {
            totalItems = paginationData.total || necessidadesData.length;
            totalPages = paginationData.totalPages || Math.ceil(totalItems / pagination.itemsPerPage) || 1;
          }
        }
      }

      setNecessidadesPadroes(necessidadesData);
      setPagination(prev => ({
        ...prev,
        totalItems,
        totalPages
      }));
    } catch (error) {
      console.error('Erro ao carregar necessidades padrão:', error);
      toast.error('Erro ao carregar necessidades padrão');
      setNecessidadesPadroes([]);
      setPagination(prev => ({
        ...prev,
        totalItems: 0,
        totalPages: 0
      }));
    } finally {
      setLoading(false);
    }
  }, [filtros.filial_id, filtros.grupo_id, filtros.escola_id, pagination.currentPage, pagination.itemsPerPage]);

  // Carregar necessidades padrão quando filtros mudarem ou na inicialização
  useEffect(() => {
    carregarNecessidadesPadroes();
  }, [carregarNecessidadesPadroes]);

  const carregarDadosIniciais = async () => {
    setLoadingFiltros(true);
    try {
      // Carregar filiais
      const filiaisResponse = await FoodsApiService.getFiliais({ limit: 1000 });
      if (filiaisResponse.success && filiaisResponse.data) {
        const filiaisData = Array.isArray(filiaisResponse.data) 
          ? filiaisResponse.data 
          : filiaisResponse.data.data;
        
        if (Array.isArray(filiaisData)) {
          setFiliais(filiaisData.map(f => ({ 
            value: f.id, 
            label: f.filial || f.nome || f.razao_social || `Filial ${f.id}`
          })));
        }
      }

      // Carregar grupos
      const gruposResponse = await FoodsApiService.getGrupos({ limit: 1000 });
      if (gruposResponse.success && gruposResponse.data) {
        const gruposData = Array.isArray(gruposResponse.data) 
          ? gruposResponse.data 
          : gruposResponse.data.data;
        
        if (Array.isArray(gruposData)) {
          setGrupos(gruposData.map(g => ({ 
            value: g.id, 
            label: g.nome || g.descricao || `Grupo ${g.id}`
          })));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setLoadingFiltros(false);
    }
  };

  const carregarEscolas = async (filialId) => {
    setLoadingEscolas(true);
    try {
      const escolasResponse = await FoodsApiService.getUnidadesEscolares({ 
        filial_id: filialId, 
        limit: 1000 
      });

      if (escolasResponse.success && escolasResponse.data) {
        const escolasData = Array.isArray(escolasResponse.data) 
          ? escolasResponse.data 
          : escolasResponse.data.data;
        
        if (Array.isArray(escolasData)) {
          setEscolas(escolasData.map(e => ({ 
            value: e.id, 
            label: e.nome_escola || e.nome || e.unidade_escolar || `Escola ${e.id}`
          })));
        } else {
          setEscolas([]);
        }
      } else {
        setEscolas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      toast.error('Erro ao carregar escolas');
      setEscolas([]);
    } finally {
      setLoadingEscolas(false);
    }
  };


  const handleFiltroChange = (name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    
    // Limpar dependências quando filial mudar
    if (name === 'filial_id') {
      setFiltros(prev => ({ ...prev, grupo_id: '', escola_id: '' }));
    }
    
    // Resetar para primeira página quando filtro mudar
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setPagination(prev => ({ 
      ...prev, 
      itemsPerPage, 
      currentPage: 1 
    }));
  };

  const handleRecarregar = useCallback(() => {
    carregarNecessidadesPadroes();
  }, [carregarNecessidadesPadroes]);

  // Agrupar necessidades padrão por escola
  const necessidadesAgrupadasPorEscola = useCallback(() => {
    const agrupadas = {};
    
    necessidadesPadroes.forEach(np => {
      const escolaId = np.escola_id;
      const escolaNome = np.escola_nome || `Escola ${escolaId}`;
      
      if (!agrupadas[escolaId]) {
        agrupadas[escolaId] = {
          escola_id: escolaId,
          escola_nome: escolaNome,
          grupo_id: np.grupo_id,
          grupo_nome: np.grupo_nome,
          produtos: []
        };
      }
      
      agrupadas[escolaId].produtos.push(np);
    });

    return Object.values(agrupadas);
  }, [necessidadesPadroes]);

  return {
    // Estados
    necessidadesPadroes,
    necessidadesAgrupadas: necessidadesAgrupadasPorEscola(),
    loading,
    loadingFiltros,
    loadingEscolas,
    filtros,
    filiais,
    grupos,
    escolas,
    pagination,
    
    // Ações
    handleFiltroChange,
    handlePageChange,
    handleItemsPerPageChange,
    handleRecarregar
  };
};

