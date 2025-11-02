import { useState, useEffect, useCallback } from 'react';
import SubstituicoesNecessidadesService from '../services/substituicoesNecessidades';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar substituições de necessidades
 */
export const useSubstituicoesNecessidades = (tipo = 'nutricionista') => {
  const [necessidades, setNecessidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [grupos, setGrupos] = useState([]);
  const [semanasAbastecimento, setSemanasAbastecimento] = useState([]);
  const [semanasConsumo, setSemanasConsumo] = useState([]);
  const [tiposRota, setTiposRota] = useState([]);
  
  const [produtosGenericos, setProdutosGenericos] = useState({});
  const [loadingGenericos, setLoadingGenericos] = useState({});
  
  const [filtros, setFiltros] = useState({
    grupo: '',
    semana_abastecimento: '',
    semana_consumo: '',
    tipo_rota_id: ''
  });

  /**
   * Carregar grupos (baseado no tipo: nutricionista ou coordenação)
   */
  const carregarGrupos = useCallback(async () => {
    try {
      // tipo pode ser 'nutricionista' (padrão) ou 'coordenacao'
      const aba = tipo === 'coordenacao' ? 'coordenacao' : 'nutricionista';
      const response = await SubstituicoesNecessidadesService.buscarGruposDisponiveis(aba);
      if (response.success) {
        setGrupos(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  }, [tipo]);

  /**
   * Carregar semanas de abastecimento (baseado no tipo: nutricionista ou coordenação)
   */
  const carregarSemanasAbastecimento = useCallback(async () => {
    try {
      // tipo pode ser 'nutricionista' (padrão) ou 'coordenacao'
      const aba = tipo === 'coordenacao' ? 'coordenacao' : 'nutricionista';
      const response = await SubstituicoesNecessidadesService.buscarSemanasAbastecimentoDisponiveis(aba);
      if (response.success) {
        setSemanasAbastecimento(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar semanas de abastecimento:', error);
    }
  }, [tipo]);

  /**
   * Carregar tipos de rota disponíveis (baseado no tipo: nutricionista ou coordenação)
   */
  const carregarTiposRota = useCallback(async () => {
    try {
      // tipo pode ser 'nutricionista' (padrão) ou 'coordenacao'
      const aba = tipo === 'coordenacao' ? 'coordenacao' : 'nutricionista';
      const response = await SubstituicoesNecessidadesService.buscarTiposRotaDisponiveis(aba);
      if (response.success) {
        setTiposRota(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de rota:', error);
    }
  }, [tipo]);

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
      const response = tipo === 'coordenacao' 
        ? await SubstituicoesNecessidadesService.listarParaCoordenacao(filtros)
        : await SubstituicoesNecessidadesService.listarParaSubstituicao(filtros);
      
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
  }, [filtros, tipo]);

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
   * Liberar análise (conf → conf log)
   */
  const liberarAnalise = useCallback(async (dados) => {
    try {
      const response = await SubstituicoesNecessidadesService.liberarAnalise(dados);
      
      if (response.success) {
        toast.success(response.message || 'Análise liberada com sucesso!');
        carregarNecessidades();
        return response;
      } else {
        toast.error(response.message || 'Erro ao liberar análise');
        return response;
      }
    } catch (error) {
      console.error('Erro ao liberar análise:', error);
      toast.error('Erro ao liberar análise');
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
      semana_consumo: '',
      tipo_rota_id: ''
    });
  }, []);

  // Efeito para carregar grupos - independente de outros filtros
  // Recarrega quando tipo mudar para garantir dados corretos
  useEffect(() => {
    carregarGrupos();
  }, [tipo, carregarGrupos]);

  // Efeito para carregar semanas de abastecimento - independente de outros filtros
  // Recarrega quando tipo mudar para garantir dados corretos
  useEffect(() => {
    carregarSemanasAbastecimento();
  }, [tipo, carregarSemanasAbastecimento]);

  // Efeito para carregar tipos de rota - independente de outros filtros
  // Recarrega quando tipo mudar para garantir dados corretos
  useEffect(() => {
    carregarTiposRota();
  }, [tipo, carregarTiposRota]);

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
    // Para aba nutricionista: exige AMBOS os filtros (grupo E semana de abastecimento)
    // Para aba coordenação: os filtros são independentes, qualquer combinação é válida
    if (tipo === 'coordenacao') {
      // Na coordenação, pode carregar mesmo sem todos os filtros preenchidos
      // Mas precisa ter pelo menos algum filtro para fazer sentido carregar
      if (filtros.grupo || filtros.semana_abastecimento || filtros.tipo_rota_id) {
        carregarNecessidades();
      } else {
        // Limpar necessidades se não tiver nenhum filtro
        setNecessidades([]);
      }
    } else {
      // Na nutricionista, exige AMBOS os filtros: grupo E semana de abastecimento
      if (filtros.grupo && filtros.semana_abastecimento) {
        carregarNecessidades();
      } else {
        // Limpar necessidades se não tiver ambos os filtros
        setNecessidades([]);
      }
    }
  }, [filtros.grupo, filtros.semana_abastecimento, filtros.semana_consumo, filtros.tipo_rota_id, tipo, carregarNecessidades]);

  return {
    // Estados
    necessidades,
    loading,
    error,
    grupos,
    semanasAbastecimento,
    semanasConsumo,
    tiposRota,
    filtros,
    produtosGenericos,
    loadingGenericos,
    
    // Ações
    carregarNecessidades,
    buscarProdutosGenericos,
    salvarSubstituicao,
    deletarSubstituicao,
    liberarAnalise,
    atualizarFiltros,
    limparFiltros
  };
};
