import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import RelatorioInspecaoService from '../services/relatorioInspecao';

export const useRelatorioInspecao = () => {
  const [rirs, setRirs] = useState([]);
  const [rir, setRir] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [filtros, setFiltros] = useState({
    search: '',
    status_geral: '',
    fornecedor: '',
    data_inicio: '',
    data_fim: ''
  });

  /**
   * Carregar lista de RIRs
   */
  const carregarRIRs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        ...filtros,
        ...params
      };

      // Remover filtros vazios
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await RelatorioInspecaoService.listar(queryParams);
      
      if (response.success) {
        setRirs(response.data || []);
        setPagination(response.pagination || null);
        setStatistics(response.statistics || null);
      } else {
        console.error('Erro ao carregar RIRs:', response.error);
        // Não mostrar toast automaticamente, deixar a página mostrar estado vazio
        setRirs([]);
        setPagination(null);
        setStatistics(null);
      }
    } catch (error) {
      console.error('Erro ao carregar RIRs:', error);
      // Não mostrar toast automaticamente no catch também
      setRirs([]);
      setPagination(null);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  /**
   * Buscar RIR por ID
   */
  const buscarRIRPorId = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await RelatorioInspecaoService.buscarPorId(id);
      
      if (response.success) {
        setRir(response.data);
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao buscar relatório de inspeção');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar RIR:', error);
      toast.error('Erro ao buscar relatório de inspeção');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Criar novo RIR
   */
  const criarRIR = useCallback(async (data) => {
    try {
      const response = await RelatorioInspecaoService.criar(data);
      
      if (response.success) {
        toast.success(response.message || 'Relatório de inspeção criado com sucesso!');
        return response;
      } else {
        if (response.validationErrors) {
          return response; // Retornar para o componente tratar
        }
        toast.error(response.error || 'Erro ao criar relatório de inspeção');
        return response;
      }
    } catch (error) {
      console.error('Erro ao criar RIR:', error);
      toast.error('Erro ao criar relatório de inspeção');
      return { success: false };
    }
  }, []);

  /**
   * Atualizar RIR
   */
  const atualizarRIR = useCallback(async (id, data) => {
    try {
      const response = await RelatorioInspecaoService.atualizar(id, data);
      
      if (response.success) {
        toast.success(response.message || 'Relatório de inspeção atualizado com sucesso!');
        return response;
      } else {
        if (response.validationErrors) {
          return response; // Retornar para o componente tratar
        }
        toast.error(response.error || 'Erro ao atualizar relatório de inspeção');
        return response;
      }
    } catch (error) {
      console.error('Erro ao atualizar RIR:', error);
      toast.error('Erro ao atualizar relatório de inspeção');
      return { success: false };
    }
  }, []);

  /**
   * Excluir RIR
   */
  const excluirRIR = useCallback(async (id) => {
    try {
      const response = await RelatorioInspecaoService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Relatório de inspeção excluído com sucesso!');
        await carregarRIRs(); // Recarregar lista
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir relatório de inspeção');
        return false;
      }
    } catch (error) {
      console.error('Erro ao excluir RIR:', error);
      toast.error('Erro ao excluir relatório de inspeção');
      return false;
    }
  }, [carregarRIRs]);

  /**
   * Buscar produtos do pedido
   */
  const buscarProdutosPedido = useCallback(async (pedidoId) => {
    try {
      const response = await RelatorioInspecaoService.buscarProdutosPedido(pedidoId);
      return response;
    } catch (error) {
      console.error('Erro ao buscar produtos do pedido:', error);
      return { success: false, error: 'Erro ao buscar produtos do pedido' };
    }
  }, []);

  /**
   * Buscar NQA do grupo
   */
  const buscarNQAGrupo = useCallback(async (grupoId) => {
    try {
      const response = await RelatorioInspecaoService.buscarNQAGrupo(grupoId);
      return response;
    } catch (error) {
      console.error('Erro ao buscar NQA do grupo:', error);
      return { success: false, error: 'Erro ao buscar NQA do grupo' };
    }
  }, []);

  /**
   * Buscar plano por lote
   */
  const buscarPlanoPorLote = useCallback(async (nqaId, tamanhoLote) => {
    try {
      const response = await RelatorioInspecaoService.buscarPlanoPorLote(nqaId, tamanhoLote);
      return response;
    } catch (error) {
      console.error('Erro ao buscar plano por lote:', error);
      return { success: false, error: 'Erro ao buscar plano de amostragem' };
    }
  }, []);

  /**
   * Buscar pedidos aprovados
   */
  const buscarPedidosAprovados = useCallback(async () => {
    try {
      const response = await RelatorioInspecaoService.buscarPedidosAprovados();
      return response;
    } catch (error) {
      console.error('Erro ao buscar pedidos aprovados:', error);
      return { success: false, error: 'Erro ao buscar pedidos aprovados' };
    }
  }, []);

  /**
   * Buscar grupos
   */
  const buscarGrupos = useCallback(async () => {
    try {
      const response = await RelatorioInspecaoService.buscarGrupos();
      if (response.success) {
        setGrupos(response.data || []);
      }
      return response;
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return { success: false, error: 'Erro ao buscar grupos' };
    }
  }, []);

  // Carregar grupos ao montar (apenas uma vez)
  useEffect(() => {
    buscarGrupos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Estados
    rirs,
    rir,
    loading,
    pagination,
    statistics,
    grupos,
    filtros,

    // Ações
    carregarRIRs,
    buscarRIRPorId,
    criarRIR,
    atualizarRIR,
    excluirRIR,
    setFiltros,
    
    // Integrações
    buscarProdutosPedido,
    buscarNQAGrupo,
    buscarPlanoPorLote,
    buscarPedidosAprovados,
    buscarGrupos
  };
};

