import { useState, useEffect, useCallback } from 'react';
import necessidadesService from '../services/necessidadesService';
import escolasService from '../services/escolasService';
import produtosService from '../services/produtosService';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useExport } from './common/useExport';

export const useNecessidadesAjuste = () => {
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

  // Carregar necessidades para ajuste automaticamente
  const carregarNecessidades = useCallback(async (filtrosAdicionais = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Carregar necessidades baseado no usuário logado
      const response = await necessidadesService.listarParaAjuste({
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

  // Carregar escolas disponíveis (apenas com necessidades geradas)
  const carregarEscolas = useCallback(async (filtrosAdicionais = {}) => {
    setLoading(true);
    try {
      const response = await necessidadesService.buscarEscolasDisponiveis({
        aba: 'nutricionista',
        ...filtrosAdicionais
      });
      if (response.success) {
        setEscolas(response.data || []);
      } else {
        toast.error(response.message || 'Erro ao carregar escolas');
        setEscolas([]);
      }
    } catch (err) {
      console.error('Erro ao carregar escolas:', err);
      toast.error('Erro ao carregar escolas');
      setEscolas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar grupos de produtos (apenas com necessidades geradas)
  const carregarGrupos = useCallback(async (filtrosAdicionais = {}) => {
    setLoading(true);
    try {
      const response = await necessidadesService.buscarGruposDisponiveis({
        aba: 'nutricionista',
        ...filtrosAdicionais
      });
      if (response.success) {
        setGrupos(response.data || []);
      } else {
        toast.error(response.message || 'Erro ao carregar grupos');
        setGrupos([]);
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
      toast.error('Erro ao carregar grupos');
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar ajustes da nutricionista
  const salvarAjustes = useCallback(async (dados) => {
    setLoading(true);
    try {
      const response = await necessidadesService.salvarAjustes(dados);
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
      const response = await necessidadesService.incluirProdutoExtra(dados);
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

  // Liberar para coordenação
  const liberarCoordenacao = useCallback(async (dados) => {
    setLoading(true);
    try {
      const response = await necessidadesService.liberarCoordenacao(dados);
      return response;
    } catch (err) {
      console.error('Erro ao liberar para coordenação:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar produtos para modal
  const buscarProdutosParaModal = useCallback(async (filtrosModal) => {
    try {
      const response = await necessidadesService.buscarProdutosParaModal(filtrosModal);
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

  // Hook de exportação padronizado
  const { handleExportXLSX, handleExportPDF } = useExport(necessidadesService);

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
    liberarCoordenacao,
    buscarProdutosParaModal,
    atualizarFiltros,

    // Dados auxiliares
    carregarEscolas,
    carregarGrupos,

    // Exportação
    exportarXLSX: handleExportXLSX,
    exportarPDF: handleExportPDF
  };
};
