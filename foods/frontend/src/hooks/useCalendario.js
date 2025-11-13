import { useState, useEffect, useCallback } from 'react';
import calendarioService from '../services/calendarioService';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar dados do calendário
 */
export const useCalendario = () => {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [configuracao, setConfiguracao] = useState(null);
  const [diasNaoUteis, setDiasNaoUteis] = useState([]);
  const [filtros, setFiltros] = useState({
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    data_inicio: '',
    data_fim: '',
    dia_semana: '',
    tipo_dia: '',
    feriado: '',
    limit: 100,
    offset: 0
  });

  // ===== DASHBOARD =====
  const carregarEstatisticas = useCallback(async (ano) => {
    setLoading(true);
    try {
      const response = await calendarioService.obterEstatisticas(ano);
      if (response.success) {
        setEstatisticas(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarResumo = useCallback(async (ano, mes) => {
    setLoading(true);
    try {
      const response = await calendarioService.obterResumo(ano, mes);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      toast.error('Erro ao carregar resumo');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== VISUALIZAÇÃO =====
  const carregarDados = useCallback(async (novosFiltros = {}) => {
    setLoading(true);
    try {
      const filtrosCombinados = { ...filtros, ...novosFiltros };
      const response = await calendarioService.listar(filtrosCombinados);
      if (response.success) {
        setDados(response.data);
        return response;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do calendário');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const carregarPorMes = useCallback(async (ano, mes) => {
    setLoading(true);
    try {
      const response = await calendarioService.obterPorMes(ano, mes);
      if (response.success) {
        setDados(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao carregar dados do mês:', error);
      toast.error('Erro ao carregar dados do mês');
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarPorData = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await calendarioService.buscarPorData(data);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao buscar data:', error);
      toast.error('Erro ao buscar data');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== CONFIGURAÇÃO =====
  const configurarDiasUteis = useCallback(async (ano, diasUteis) => {
    setLoading(true);
    try {
      const response = await calendarioService.configurarDiasUteis({
        ano,
        dias_uteis: diasUteis
      });
      if (response.success) {
        toast.success('Dias úteis configurados com sucesso');
        await carregarConfiguracao(ano);
        return true;
      }
    } catch (error) {
      console.error('Erro ao configurar dias úteis:', error);
      toast.error('Erro ao configurar dias úteis');
    } finally {
      setLoading(false);
    }
  }, []);

  const configurarDiasAbastecimento = useCallback(async (ano, diasAbastecimento) => {
    setLoading(true);
    try {
      const response = await calendarioService.configurarDiasAbastecimento({
        ano,
        dias_abastecimento: diasAbastecimento
      });
      if (response.success) {
        toast.success('Dias de abastecimento configurados com sucesso');
        await carregarConfiguracao(ano);
        return true;
      }
    } catch (error) {
      console.error('Erro ao configurar dias de abastecimento:', error);
      toast.error('Erro ao configurar dias de abastecimento');
    } finally {
      setLoading(false);
    }
  }, []);

  const configurarDiasConsumo = useCallback(async (ano, diasConsumo) => {
    setLoading(true);
    try {
      const response = await calendarioService.configurarDiasConsumo({
        ano,
        dias_consumo: diasConsumo
      });
      if (response.success) {
        toast.success('Dias de consumo configurados com sucesso');
        await carregarConfiguracao(ano);
        return true;
      }
    } catch (error) {
      console.error('Erro ao configurar dias de consumo:', error);
      toast.error('Erro ao configurar dias de consumo');
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarConfiguracao = useCallback(async (ano) => {
    setLoading(true);
    try {
      const response = await calendarioService.obterConfiguracao(ano);
      if (response.success) {
        setConfiguracao(response.data);
        setDiasNaoUteis(response.data.dias_nao_uteis || []);
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração');
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarFeriado = useCallback(async (dados) => {
    setLoading(true);
    try {
      const response = await calendarioService.adicionarFeriado(dados);
      if (response.success) {
        toast.success('Feriado adicionado com sucesso');
        await carregarConfiguracao(new Date(dados.data).getFullYear());
        return true;
      }
    } catch (error) {
      console.error('Erro ao adicionar feriado:', error);
      toast.error('Erro ao adicionar feriado');
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarDiaNaoUtil = useCallback(async (dados, options = {}) => {
    const { reload = true } = options;
    setLoading(true);
    try {
      const response = await calendarioService.adicionarDiaNaoUtil(dados);
      if (response.success && reload) {
        const anoReferencia = dados?.data
          ? new Date(`${dados.data}T00:00:00`).getFullYear()
          : new Date().getFullYear();
        await carregarConfiguracao(anoReferencia);
      }
      return {
        success: Boolean(response.success),
        message: response.message,
        data: response.data || null
      };
    } catch (error) {
      console.error('Erro ao adicionar dia não útil:', error);
      return {
        success: false,
        message: 'Erro ao adicionar dia não útil',
        error
      };
    } finally {
      setLoading(false);
    }
  }, [carregarConfiguracao]);

  const removerFeriado = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await calendarioService.removerFeriado(data);
      if (response.success) {
        toast.success('Feriado removido com sucesso');
        await carregarConfiguracao(new Date(data).getFullYear());
        return true;
      }
    } catch (error) {
      console.error('Erro ao remover feriado:', error);
      toast.error('Erro ao remover feriado');
    } finally {
      setLoading(false);
    }
  }, []);

  const removerDiaNaoUtil = useCallback(async (id, dataReferencia) => {
    setLoading(true);
    try {
      const response = await calendarioService.removerDiaNaoUtil(id);
      if (response.success) {
        toast.success(response.message || 'Dia não útil removido com sucesso');
        const anoReferencia = dataReferencia
          ? new Date(`${dataReferencia}T00:00:00`).getFullYear()
          : (configuracao?.ano || new Date().getFullYear());
        await carregarConfiguracao(anoReferencia);
        return true;
      }
      toast.error(response.message || 'Erro ao remover dia não útil');
      return false;
    } catch (error) {
      console.error('Erro ao remover dia não útil:', error);
      toast.error('Erro ao remover dia não útil');
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarConfiguracao, configuracao]);

  // ===== API DE INTEGRAÇÃO =====
  const buscarSemanasConsumo = useCallback(async (ano) => {
    try {
      const response = await calendarioService.buscarSemanasConsumo(ano);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao buscar semanas de consumo:', error);
      throw error;
    }
  }, []);

  const buscarSemanasAbastecimento = useCallback(async (ano) => {
    try {
      const response = await calendarioService.buscarSemanasAbastecimento(ano);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao buscar semanas de abastecimento:', error);
      throw error;
    }
  }, []);

  const buscarDiasUteis = useCallback(async (ano, mes) => {
    try {
      const response = await calendarioService.buscarDiasUteis(ano, mes);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao buscar dias úteis:', error);
      throw error;
    }
  }, []);

  const verificarFeriado = useCallback(async (data) => {
    try {
      const response = await calendarioService.verificarFeriado(data);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao verificar feriado:', error);
      throw error;
    }
  }, []);

  // ===== FILTROS =====
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({
      ano: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      data_inicio: '',
      data_fim: '',
      dia_semana: '',
      tipo_dia: '',
      feriado: '',
      limit: 100,
      offset: 0
    });
  }, []);

  // ===== EFEITOS =====
  useEffect(() => {
    carregarEstatisticas(filtros.ano);
  }, [filtros.ano, carregarEstatisticas]);

  return {
    // Estados
    loading,
    dados,
    estatisticas,
    configuracao,
    diasNaoUteis,
    filtros,

    // Dashboard
    carregarEstatisticas,
    carregarResumo,

    // Visualização
    carregarDados,
    carregarPorMes,
    buscarPorData,

    // Configuração
    configurarDiasUteis,
    configurarDiasAbastecimento,
    configurarDiasConsumo,
    adicionarFeriado,
    removerFeriado,
    adicionarDiaNaoUtil,
    removerDiaNaoUtil,
    carregarConfiguracao,

    // API de Integração
    buscarSemanasConsumo,
    buscarSemanasAbastecimento,
    buscarDiasUteis,
    verificarFeriado,

    // Filtros
    atualizarFiltros,
    limparFiltros
  };
};
