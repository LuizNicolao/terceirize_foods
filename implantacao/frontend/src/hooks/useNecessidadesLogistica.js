import { useState, useEffect, useCallback } from 'react';
import necessidadesLogisticaService from '../services/necessidadesLogisticaService';
import necessidadesService from '../services/necessidadesService';
import escolasService from '../services/escolasService';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const useNecessidadesLogistica = () => {
  const { user } = useAuth();
  const [necessidades, setNecessidades] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros para busca
  const [filtros, setFiltros] = useState({
    escola_id: null,
    grupo: null,
    semana_consumo: '',
    semana_abastecimento: ''
  });

  // Carregar necessidades para logística automaticamente
  const carregarNecessidades = useCallback(async (filtrosAdicionais = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await necessidadesLogisticaService.listarParaLogistica({
        ...filtros,
        ...filtrosAdicionais
      });
      
      if (response.success) {
        setNecessidades(response.data || []);
      } else {
        setError(response.message || 'Erro ao carregar necessidades');
        setNecessidades([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar necessidades');
      console.error('Erro ao carregar necessidades:', err);
      setNecessidades([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Carregar escolas disponíveis
  const carregarEscolas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await escolasService.listar({}, user);
      if (response.success) {
        setEscolas(response.data);
      } else {
        toast.error(response.message || 'Erro ao carregar escolas');
      }
    } catch (err) {
      console.error('Erro ao carregar escolas:', err);
      toast.error('Erro ao carregar escolas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar grupos de produtos
  const carregarGrupos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await produtosPerCapita.listarGrupos();
      if (response.success) {
        setGrupos(response.data);
      } else {
        toast.error(response.message || 'Erro ao carregar grupos');
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar ajustes da logística
  const salvarAjustes = useCallback(async (dados) => {
    setLoading(true);
    try {
      const response = await necessidadesLogisticaService.salvarAjustesLogistica(dados);
      return response;
    } catch (err) {
      console.error('Erro ao salvar ajustes:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Incluir produto extra
  const incluirProdutoExtra = useCallback(async (dados) => {
    setLoading(true);
    try {
      const response = await necessidadesLogisticaService.incluirProdutoExtra(dados);
      if (response.success) {
        toast.success(response.message || 'Produto incluído com sucesso');
        return true;
      } else {
        toast.error(response.message || 'Erro ao incluir produto');
        return false;
      }
    } catch (err) {
      console.error('Erro ao incluir produto extra:', err);
      toast.error('Erro ao incluir produto extra');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enviar para confirmação da nutricionista
  const enviarParaNutricionista = useCallback(async (dados) => {
    setLoading(true);
    try {
      const response = await necessidadesLogisticaService.enviarParaNutricionista(dados);
      return response;
    } catch (err) {
      console.error('Erro ao enviar para nutricionista:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar produtos para modal
  const buscarProdutosParaModal = useCallback(async (filtrosModal) => {
    try {
      const response = await necessidadesLogisticaService.buscarProdutosParaModal(filtrosModal);
      return response;
    } catch (err) {
      console.error('Erro ao buscar produtos para modal:', err);
      throw err;
    }
  }, []);

  // Atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    carregarEscolas();
    carregarGrupos();
  }, [carregarEscolas, carregarGrupos]);

  return {
    // Estados
    necessidades,
    escolas,
    grupos,
    filtros,
    loading,
    error,

    // Ações
    carregarNecessidades,
    salvarAjustes,
    incluirProdutoExtra,
    enviarParaNutricionista,
    buscarProdutosParaModal,
    atualizarFiltros,

    // Dados auxiliares
    carregarEscolas,
    carregarGrupos
  };
};
