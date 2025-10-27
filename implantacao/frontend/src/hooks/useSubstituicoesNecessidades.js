import { useState, useEffect, useCallback } from 'react';
import SubstituicoesNecessidadesService from '../services/substituicoesNecessidades';
import calendarioService from '../services/calendarioService';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar substituições de necessidades
 */
export const useSubstituicoesNecessidades = () => {
  const [necessidades, setNecessidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [grupos, setGrupos] = useState([]);
  const [semanasAbastecimento, setSemanasAbastecimento] = useState([]);
  const [semanasConsumo, setSemanasConsumo] = useState([]);
  
  const [produtosGenericos, setProdutosGenericos] = useState({});
  const [loadingGenericos, setLoadingGenericos] = useState({});
  
  const [filtros, setFiltros] = useState({
    grupo: '',
    semana_abastecimento: '',
    semana_consumo: ''
  });

  /**
   * Carregar grupos
   */
  const carregarGrupos = useCallback(async () => {
    try {
      const response = await calendarioService.buscarGruposComPercapita();
      if (response.success) {
        setGrupos(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  }, []);

  /**
   * Carregar semanas de abastecimento
   */
  const carregarSemanasAbastecimento = useCallback(async () => {
    try {
      const ano = new Date().getFullYear();
      const response = await calendarioService.buscarSemanasAbastecimento(ano);
      if (response.success) {
        setSemanasAbastecimento(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar semanas de abastecimento:', error);
    }
  }, []);

  /**
   * Carregar semana de consumo baseado na semana de abastecimento
   */
  const carregarSemanaConsumo = useCallback(async (semanaAbast) => {
    if (!semanaAbast) {
      setSemanasConsumo([]);
      return;
    }

    try {
      // Buscar semana de consumo diretamente da tabela necessidades
      const response = await SubstituicoesNecessidadesService.buscarSemanaConsumo(semanaAbast);
      
      if (response.success && response.data && response.data.semana_consumo) {
        // Retornar apenas a semana de consumo relacionada
        setSemanasConsumo([response.data.semana_consumo]);
        // Auto preencher o filtro de semana de consumo
        setFiltros(prev => ({ ...prev, semana_consumo: response.data.semana_consumo }));
      }
    } catch (error) {
      console.error('Erro ao carregar semana de consumo:', error);
    }
  }, []);

  /**
   * Carregar necessidades para substituição
   */
  const carregarNecessidades = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await SubstituicoesNecessidadesService.listarParaSubstituicao(filtros);
      
      if (response.success) {
        setNecessidades(response.data || []);
      } else {
        setError(response.message || 'Erro ao carregar necessidades');
      }
    } catch (error) {
      console.error('Erro ao carregar necessidades:', error);
      setError('Erro ao carregar necessidades');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  /**
   * Buscar produtos genéricos para um produto origem
   */
  const buscarProdutosGenericos = useCallback(async (produtoOrigemId, grupo, search = '') => {
    const key = `${produtoOrigemId}_${grupo}_${search}`;
    
    // Se já está carregando, não fazer outra requisição
    if (loadingGenericos[key]) {
      return;
    }

    setLoadingGenericos(prev => ({ ...prev, [key]: true }));

    try {
      const response = await SubstituicoesNecessidadesService.buscarProdutosGenericos({
        produto_origem_id: produtoOrigemId,
        grupo,
        search
      });

      if (response.success) {
        setProdutosGenericos(prev => ({
          ...prev,
          [produtoOrigemId]: response.data || []
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar produtos genéricos:', error);
    } finally {
      setLoadingGenericos(prev => ({ ...prev, [key]: false }));
    }
  }, [loadingGenericos]);

  /**
   * Salvar substituição
   */
  const salvarSubstituicao = useCallback(async (dados) => {
    try {
      const response = await SubstituicoesNecessidadesService.salvarSubstituicao(dados);
      
      if (response.success) {
        toast.success(response.message || 'Substituição salva com sucesso!');
        // Recarregar necessidades
        carregarNecessidades();
        return response;
      } else {
        toast.error(response.message || 'Erro ao salvar substituição');
        return response;
      }
    } catch (error) {
      console.error('Erro ao salvar substituição:', error);
      toast.error('Erro ao salvar substituição');
      return { success: false, error: error.message };
    }
  }, [carregarNecessidades]);

  /**
   * Deletar substituição
   */
  const deletarSubstituicao = useCallback(async (id) => {
    try {
      const response = await SubstituicoesNecessidadesService.deletarSubstituicao(id);
      
      if (response.success) {
        toast.success(response.message || 'Substituição excluída com sucesso!');
        carregarNecessidades();
        return response;
      } else {
        toast.error(response.message || 'Erro ao excluir substituição');
        return response;
      }
    } catch (error) {
      console.error('Erro ao deletar substituição:', error);
      toast.error('Erro ao excluir substituição');
      return { success: false, error: error.message };
    }
  }, [carregarNecessidades]);

  /**
   * Aprovar substituição
   */
  const aprovarSubstituicao = useCallback(async (id) => {
    try {
      const response = await SubstituicoesNecessidadesService.aprovarSubstituicao(id);
      
      if (response.success) {
        toast.success(response.message || 'Substituição aprovada com sucesso!');
        carregarNecessidades();
        return response;
      } else {
        toast.error(response.message || 'Erro ao aprovar substituição');
        return response;
      }
    } catch (error) {
      console.error('Erro ao aprovar substituição:', error);
      toast.error('Erro ao aprovar substituição');
      return { success: false, error: error.message };
    }
  }, [carregarNecessidades]);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  /**
   * Limpar filtros
   */
  const limparFiltros = useCallback(() => {
    setFiltros({
      grupo: '',
      semana_abastecimento: '',
      semana_consumo: ''
    });
  }, []);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    carregarGrupos();
    carregarSemanasAbastecimento();
  }, [carregarGrupos, carregarSemanasAbastecimento]);

  // Efeito para carregar semana de consumo quando abastecimento mudar
  useEffect(() => {
    if (filtros.semana_abastecimento) {
      carregarSemanaConsumo(filtros.semana_abastecimento);
    } else {
      setSemanasConsumo([]);
    }
  }, [filtros.semana_abastecimento, carregarSemanaConsumo]);

  // Efeito para carregar necessidades quando filtros mudarem
  useEffect(() => {
    // Só carrega se tiver filtro de grupo ou semana
    if (filtros.grupo || filtros.semana_abastecimento) {
      carregarNecessidades();
    }
  }, [filtros.grupo, filtros.semana_abastecimento, filtros.semana_consumo, carregarNecessidades]);

  return {
    // Estados
    necessidades,
    loading,
    error,
    grupos,
    semanasAbastecimento,
    semanasConsumo,
    filtros,
    produtosGenericos,
    loadingGenericos,
    
    // Ações
    carregarNecessidades,
    buscarProdutosGenericos,
    salvarSubstituicao,
    deletarSubstituicao,
    aprovarSubstituicao,
    atualizarFiltros,
    limparFiltros
  };
};
