import { useState, useCallback } from 'react';
import necessidadesCoordenacaoService from '../services/necessidadesCoordenacaoService';
import toast from 'react-hot-toast';
import { useExport } from './common/useExport';

const useNecessidadesCoordenacao = () => {
  const [necessidades, setNecessidades] = useState([]);
  const [nutricionistas, setNutricionistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    escola_id: null,
    grupo: null,
    semana_consumo: null,
    semana_abastecimento: null,
    nutricionista_id: null
  });

  // Carregar necessidades
  const carregarNecessidades = useCallback(async (filtrosAtualizados = filtros) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await necessidadesCoordenacaoService.listarParaCoordenacao(filtrosAtualizados);
      
      if (response.success) {
        setNecessidades(response.data);
        setFiltros(filtrosAtualizados);
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

  // Carregar nutricionistas
  const carregarNutricionistas = useCallback(async () => {
    try {
      const response = await necessidadesCoordenacaoService.listarNutricionistas();
      
      if (response.success) {
        setNutricionistas(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar nutricionistas:', error);
    }
  }, []);

  // Salvar ajustes
  const salvarAjustes = useCallback(async (ajustes) => {
    setLoading(true);
    
    try {
      const response = await necessidadesCoordenacaoService.salvarAjustesCoordenacao(ajustes);
      
      if (response.success) {
        toast.success(response.message);
        // Recarregar necessidades após salvar
        await carregarNecessidades();
        return true;
      } else {
        toast.error(response.message || 'Erro ao salvar ajustes');
        return false;
      }
    } catch (error) {
      console.error('Erro ao salvar ajustes:', error);
      toast.error('Erro ao salvar ajustes');
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarNecessidades]);

  // Liberar para logística
  const liberarParaLogistica = useCallback(async (necessidadeIds) => {
    setLoading(true);
    
    try {
      const response = await necessidadesCoordenacaoService.liberarParaLogistica(necessidadeIds);
      
      if (response.success) {
        toast.success(response.message);
        // Recarregar necessidades após liberar
        await carregarNecessidades();
        return true;
      } else {
        toast.error(response.message || 'Erro ao liberar para logística');
        return false;
      }
    } catch (error) {
      console.error('Erro ao liberar para logística:', error);
      toast.error('Erro ao liberar para logística');
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarNecessidades]);

  // Buscar produtos para modal
  const buscarProdutosParaModal = useCallback(async (filtrosModal) => {
    try {
      const response = await necessidadesCoordenacaoService.buscarProdutosParaModal(filtrosModal);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar produtos');
      }
    } catch (error) {
      console.error('Erro ao buscar produtos para modal:', error);
      throw error;
    }
  }, []);

  // Incluir produto extra
  const incluirProdutoExtra = useCallback(async (dados) => {
    try {
      const response = await necessidadesCoordenacaoService.incluirProdutoExtra(dados);
      
      if (response.success) {
        toast.success(response.message);
        // Recarregar necessidades após incluir
        await carregarNecessidades();
        return true;
      } else {
        toast.error(response.message || 'Erro ao incluir produto');
        return false;
      }
    } catch (error) {
      console.error('Erro ao incluir produto extra:', error);
      toast.error('Erro ao incluir produto extra');
      return false;
    }
  }, [carregarNecessidades]);

  // Atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setFiltros({
      escola_id: null,
      grupo: null,
      semana_consumo: null,
      semana_abastecimento: null,
      nutricionista_id: null
    });
  }, []);

  // Hook de exportação padronizado
  const { handleExportXLSX, handleExportPDF } = useExport(necessidadesCoordenacaoService);

  return {
    // Estados
    necessidades,
    nutricionistas,
    filtros,
    loading,
    error,
    
    // Ações
    carregarNecessidades,
    carregarNutricionistas,
    salvarAjustes,
    liberarParaLogistica,
    buscarProdutosParaModal,
    incluirProdutoExtra,
    atualizarFiltros,
    limparFiltros,

    // Exportação
    exportarXLSX: handleExportXLSX,
    exportarPDF: handleExportPDF
  };
};

export default useNecessidadesCoordenacao;