import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { recebimentosEscolasService } from '../services/recebimentos';
import { useExport } from './common/useExport';

/**
 * Hook customizado para Recebimentos Escolas
 * Segue padrão de excelência do sistema
 */
const useRecebimentosEscolas = () => {
  // Estados principais
  const [recebimentos, setRecebimentos] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estatisticas, setEstatisticas] = useState({});
  const [todosRecebimentos, setTodosRecebimentos] = useState([]); // Para estatísticas
  
  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
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
   * Carregar recebimentos
   */
  const carregarRecebimentos = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Carregar todos os recebimentos (sem paginação)
      const response = await recebimentosEscolasService.listarTodas(filtros);
      if (response.success) {
        const todosRecebimentosData = response.data || [];
        setTodosRecebimentos(todosRecebimentosData);
        
        // Aplicar paginação no frontend
        const totalItems = todosRecebimentosData.length;
        const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
        const currentPage = Math.min(pagination.currentPage, totalPages);
        
        const paginatedData = applyFrontendPagination(todosRecebimentosData, currentPage, pagination.itemsPerPage);
        setRecebimentos(paginatedData);
        
        setPagination(prev => ({
          ...prev,
          totalItems,
          totalPages,
          currentPage
        }));
      } else {
        setError(response.error || 'Erro ao carregar recebimentos');
      }
    } catch (error) {
      console.error('Erro ao carregar recebimentos:', error);
      setError('Erro ao carregar recebimentos');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, applyFrontendPagination]);

  /**
   * Carregar escolas
   */
  const carregarEscolas = useCallback(async (tipoUsuario = null, usuarioId = null) => {
    try {
      const response = await recebimentosEscolasService.listarEscolas(tipoUsuario, usuarioId);
      if (response.success) {
        setEscolas(response.data || []);
      } else {
        console.error('Erro ao carregar escolas:', response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
    }
  }, []);

  /**
   * Carregar estatísticas
   */
  const carregarEstatisticas = useCallback(async (filtros = {}) => {
    try {
      const response = await recebimentosEscolasService.obterEstatisticas(filtros);
      if (response.success) {
        setEstatisticas(response.data || {});
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => {
      const updatedPagination = { ...prev, ...novaPaginacao };
      
      // Se mudou a página ou itens por página, aplicar paginação no frontend
      if (novaPaginacao.currentPage || novaPaginacao.itemsPerPage) {
        const paginatedData = applyFrontendPagination(todosRecebimentos, updatedPagination.currentPage, updatedPagination.itemsPerPage);
        setRecebimentos(paginatedData);
      }
      
      return updatedPagination;
    });
  }, [todosRecebimentos, applyFrontendPagination]);

  /**
   * Criar recebimento
   */
  const criarRecebimento = useCallback(async (dados) => {
    try {
      const response = await recebimentosEscolasService.criar(dados);
      if (response.success) {
        toast.success('Recebimento criado com sucesso!');
        return { success: true, data: response.data };
      } else {
        toast.error(response.error || 'Erro ao criar recebimento');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro ao criar recebimento:', error);
      toast.error('Erro ao criar recebimento');
      return { success: false, error: 'Erro ao criar recebimento' };
    }
  }, []);

  /**
   * Editar recebimento
   */
  const editarRecebimento = useCallback(async (id, dados) => {
    try {
      const response = await recebimentosEscolasService.editar(id, dados);
      if (response.success) {
        toast.success('Recebimento editado com sucesso!');
        return { success: true, data: response.data };
      } else {
        toast.error(response.error || 'Erro ao editar recebimento');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro ao editar recebimento:', error);
      toast.error('Erro ao editar recebimento');
      return { success: false, error: 'Erro ao editar recebimento' };
    }
  }, []);

  /**
   * Excluir recebimento
   */
  const excluirRecebimento = useCallback(async (id) => {
    try {
      const response = await recebimentosEscolasService.excluir(id);
      if (response.success) {
        toast.success('Recebimento excluído com sucesso!');
        return { success: true };
      } else {
        toast.error(response.error || 'Erro ao excluir recebimento');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro ao excluir recebimento:', error);
      toast.error('Erro ao excluir recebimento');
      return { success: false, error: 'Erro ao excluir recebimento' };
    }
  }, []);

  // Hook de exportação padronizado
  const { handleExportXLSX, handleExportPDF } = useExport(recebimentosEscolasService);

  // Carregar dados iniciais
  // useEffect removido - carregarEscolas será chamado pela página com parâmetros corretos

  // Aplicar paginação quando todosRecebimentos mudar
  useEffect(() => {
    if (todosRecebimentos.length > 0) {
      const paginatedData = applyFrontendPagination(todosRecebimentos, pagination.currentPage, pagination.itemsPerPage);
      setRecebimentos(paginatedData);
    }
  }, [todosRecebimentos, pagination.currentPage, pagination.itemsPerPage, applyFrontendPagination]);

  return {
    // Estados
    recebimentos,
    todosRecebimentos,
    escolas,
    loading,
    error,
    estatisticas,
    pagination,

    // Funções
    carregarRecebimentos,
    carregarEscolas,
    carregarEstatisticas,
    atualizarPaginacao,
    criarRecebimento,
    editarRecebimento,
    excluirRecebimento,
    exportarXLSX: handleExportXLSX,
    exportarPDF: handleExportPDF
  };
};

export default useRecebimentosEscolas;