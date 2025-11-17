import { useState, useCallback } from 'react';
import necessidadesService from '../../services/necessidadesService';
import escolasService from '../../services/escolasService';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { usePagination } from '../common/usePagination';

/**
 * Hook para gerenciar o carregamento de dados relacionados a necessidades
 * (escolas, grupos, produtos, percapitas, necessidades)
 */
export const useNecessidadesData = () => {
  const { user } = useAuth();
  const [necessidades, setNecessidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [escolas, setEscolas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [percapitas, setPercapitas] = useState({});
  
  // Hook de paginação
  const pagination = usePagination(20);

  // Carregar necessidades existentes
  const carregarNecessidades = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Converter filtros para o formato esperado pelo backend
      const paramsComPaginacao = {};
      
      // Verificar se há filtros significativos selecionados pelo usuário
      const temEscola = filtros.escola && (typeof filtros.escola === 'object' ? filtros.escola.nome_escola || filtros.escola.nome : filtros.escola);
      const temGrupo = filtros.grupo && (typeof filtros.grupo === 'object' ? filtros.grupo.id || filtros.grupo.nome : filtros.grupo);
      const temSearch = filtros.search && filtros.search.trim() !== '';
      
      // Mapear filtros para os parâmetros corretos
      if (temEscola) {
        paramsComPaginacao.escola = typeof filtros.escola === 'object' ? filtros.escola.nome_escola || filtros.escola.nome : filtros.escola;
      }
      if (temGrupo) {
        paramsComPaginacao.grupo = typeof filtros.grupo === 'object' ? filtros.grupo.id || filtros.grupo.nome : filtros.grupo;
      }
      if (filtros.search) {
        paramsComPaginacao.search = filtros.search;
      }
      if (filtros.semana_abastecimento) {
        paramsComPaginacao.semana_abastecimento = filtros.semana_abastecimento;
      }
      
      // Sempre passar a data se ela estiver selecionada (mesmo que seja preenchida automaticamente)
      if (filtros.data) {
        paramsComPaginacao.data = filtros.data;
      }
      
      // Adicionar parâmetros de paginação
      const paginationParams = pagination.getPaginationParams();
      paramsComPaginacao.page = paginationParams.page;
      paramsComPaginacao.limit = paginationParams.limit;
      
      const response = await necessidadesService.listar(paramsComPaginacao);
      
      if (response.success) {
        setNecessidades(response.data || []);
        // Atualizar informações de paginação se vierem do backend
        if (response.pagination) {
          pagination.updatePagination(response.pagination);
        }
      } else {
        setError(response.message || 'Erro ao carregar necessidades');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar necessidades');
      console.error('Erro ao carregar necessidades:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  // Carregar escolas disponíveis (filtradas por nutricionista se aplicável)
  const carregarEscolas = useCallback(async () => {
    try {
      const response = await escolasService.listar({}, user);
      if (response.success) {
        setEscolas(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar escolas:', err);
    }
  }, [user]);

  // Carregar grupos de produtos que têm percapita cadastrado
  const carregarGrupos = useCallback(async () => {
    try {
      const response = await necessidadesService.buscarGruposComPercapita();
      if (response.success) {
        setGrupos(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
    }
  }, []);

  // Carregar produtos por grupo
  const carregarProdutosPorGrupo = useCallback(async (grupoId) => {
    if (!grupoId) return;
    
    setLoading(true);
    try {
      const response = await necessidadesService.buscarProdutosPorGrupo(grupoId);
      if (response.success) {
        setProdutos(response.data);
        
        // Carregar percapitas dos produtos
        const produtoIds = response.data.map(p => p.produto_id);
        const percapitaResponse = await necessidadesService.buscarPercapitaProdutos(produtoIds);
        
        if (percapitaResponse.success) {
          const percapitaMap = {};
          percapitaResponse.data.forEach(p => {
            // Usar estrutura igual ao Geracao_necessidade
            percapitaMap[p.produto_id] = {
              lanche_manha: p.per_capita_lanche_manha || 0,
              almoco: p.per_capita_almoco || 0,
              lanche_tarde: p.per_capita_lanche_tarde || 0,
              parcial: p.per_capita_parcial || 0,
              eja: p.per_capita_eja || 0
            };
          });
          setPercapitas(percapitaMap);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      toast.error('Erro ao carregar produtos do grupo');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    necessidades,
    setNecessidades,
    loading,
    setLoading,
    error,
    escolas,
    grupos,
    produtos,
    percapitas,
    pagination,
    carregarNecessidades,
    carregarEscolas,
    carregarGrupos,
    carregarProdutosPorGrupo
  };
};

