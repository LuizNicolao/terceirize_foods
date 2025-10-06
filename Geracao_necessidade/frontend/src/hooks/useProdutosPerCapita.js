import { useState, useEffect, useCallback } from 'react';
import ProdutosPerCapitaService from '../services/produtosPerCapitaService';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

/**
 * Hook customizado para Produtos Per Capita
 * Segue o padrão de excelência do Dashboard
 */
export const useProdutosPerCapita = () => {
  // Estados principais
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Estados para funcionalidades específicas
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [loadingProdutosDisponiveis, setLoadingProdutosDisponiveis] = useState(false);
  const [estatisticas, setEstatisticas] = useState({});
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(false);

  /**
   * Carregar produtos com filtros e paginação
   */
  const carregarProdutos = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ProdutosPerCapitaService.listar(filtros);
      
      if (response.success) {
        setProdutos(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Erro ao carregar produtos');
        toast.error(response.error || 'Erro ao carregar produtos');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar produtos';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar produto específico por ID
   */
  const buscarProdutoPorId = useCallback(async (id) => {
    try {
      const response = await ProdutosPerCapitaService.buscarPorId(id);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao buscar produto');
      }
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      throw err;
    }
  }, []);

  /**
   * Criar novo produto
   */
  const criarProduto = useCallback(async (dados) => {
    try {
      const response = await ProdutosPerCapitaService.criar(dados);
      
      if (response.success) {
        toast.success(response.message || 'Produto criado com sucesso!');
        await carregarProdutos();
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.error || 'Erro ao criar produto';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar produto';
      toast.error(errorMessage);
      console.error('Erro ao criar produto:', err);
      return { success: false, error: errorMessage };
    }
  }, [carregarProdutos]);

  /**
   * Atualizar produto existente
   */
  const atualizarProduto = useCallback(async (id, dados) => {
    try {
      const response = await ProdutosPerCapitaService.atualizar(id, dados);
      
      if (response.success) {
        toast.success(response.message || 'Produto atualizado com sucesso!');
        await carregarProdutos();
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.error || 'Erro ao atualizar produto';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar produto';
      toast.error(errorMessage);
      console.error('Erro ao atualizar produto:', err);
      return { success: false, error: errorMessage };
    }
  }, [carregarProdutos]);

  /**
   * Deletar produto
   */
  const deletarProduto = useCallback(async (id) => {
    try {
      const response = await ProdutosPerCapitaService.deletar(id);
      
      if (response.success) {
        toast.success(response.message || 'Produto excluído com sucesso!');
        await carregarProdutos();
        return { success: true };
      } else {
        const errorMessage = response.error || 'Erro ao excluir produto';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao excluir produto';
      toast.error(errorMessage);
      console.error('Erro ao excluir produto:', err);
      return { success: false, error: errorMessage };
    }
  }, [carregarProdutos]);

  /**
   * Carregar produtos disponíveis para seleção
   */
  const carregarProdutosDisponiveis = useCallback(async (incluirProdutoId = null) => {
    setLoadingProdutosDisponiveis(true);
    
    try {
      const response = await ProdutosPerCapitaService.listarProdutosDisponiveis(incluirProdutoId);
      
      if (response.success) {
        setProdutosDisponiveis(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao carregar produtos disponíveis');
      }
    } catch (err) {
      console.error('Erro ao carregar produtos disponíveis:', err);
      setProdutosDisponiveis([]);
      throw err;
    } finally {
      setLoadingProdutosDisponiveis(false);
    }
  }, []);

  /**
   * Carregar TODOS os produtos ativos (para dropdown completo)
   */
  const carregarTodosProdutos = useCallback(async () => {
    setLoadingProdutosDisponiveis(true);
    
    try {
      const response = await ProdutosPerCapitaService.listarTodosProdutos();
      
      if (response.success) {
        setProdutosDisponiveis(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao carregar todos os produtos');
      }
    } catch (err) {
      console.error('Erro ao carregar todos os produtos:', err);
      setProdutosDisponiveis([]);
      throw err;
    } finally {
      setLoadingProdutosDisponiveis(false);
    }
  }, []);

  /**
   * Carregar estatísticas dos produtos
   */
  const carregarEstatisticas = useCallback(async (filtros = {}) => {
    setLoadingEstatisticas(true);
    
    try {
      const response = await ProdutosPerCapitaService.obterEstatisticas(filtros);
      
      if (response.success) {
        setEstatisticas(response.data);
        return response.data;
      } else {
        console.error('Erro ao carregar estatísticas:', response.error);
        return {};
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      return {};
    } finally {
      setLoadingEstatisticas(false);
    }
  }, []);

  /**
   * Refresh dos dados principais
   */
  const refreshProdutos = useCallback(async (filtros = {}) => {
    await carregarProdutos(filtros);
  }, [carregarProdutos]);

  /**
   * Refresh das estatísticas
   */
  const refreshEstatisticas = useCallback(async (filtros = {}) => {
    await carregarEstatisticas(filtros);
  }, [carregarEstatisticas]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  // Exportar para XLSX
  const exportarXLSX = useCallback(() => {
    try {
      if (!produtos || produtos.length === 0) {
        toast.error('Nenhum produto para exportar');
        return;
      }

      // Preparar dados para exportação
      const dadosExportacao = produtos.map(produto => ({
        'ID': produto.id,
        'Nome do Produto': produto.nome_produto || produto.nome || '-',
        'Tipo': produto.tipo_produto || produto.tipo || '-',
        'Status': produto.ativo ? 'Ativo' : 'Inativo',
        'Per Capita Parcial': produto.per_capita_parcial || '-',
        'Per Capita Almoço': produto.per_capita_almoco || '-',
        'Per Capita Lanche da Manhã': produto.per_capita_lanche_manha || '-',
        'Per Capita Lanche da Tarde': produto.per_capita_lanche_tarde || '-',
        'Per Capita EJA': produto.per_capita_eja || '-',
        'Data de Criação': produto.data_cadastro ? new Date(produto.data_cadastro).toLocaleDateString('pt-BR') : '-',
        'Última Atualização': produto.data_atualizacao ? new Date(produto.data_atualizacao).toLocaleDateString('pt-BR') : '-'
      }));

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);

      // Ajustar largura das colunas
      const colWidths = [
        { wch: 5 },   // ID
        { wch: 30 },  // Nome do Produto
        { wch: 15 },  // Tipo
        { wch: 10 },  // Status
        { wch: 18 },  // Per Capita Parcial
        { wch: 18 },  // Per Capita Almoço
        { wch: 25 },  // Per Capita Lanche da Manhã
        { wch: 25 },  // Per Capita Lanche da Tarde
        { wch: 18 },  // Per Capita EJA
        { wch: 15 },  // Data de Criação
        { wch: 20 }   // Última Atualização
      ];
      ws['!cols'] = colWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Produtos Per Capita');

      // Gerar nome do arquivo com data atual
      const dataAtual = new Date().toISOString().split('T')[0];
      const nomeArquivo = `produtos_per_capita_${dataAtual}.xlsx`;

      // Fazer download do arquivo
      XLSX.writeFile(wb, nomeArquivo);
      toast.success('Arquivo XLSX exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar arquivo XLSX');
    }
  }, [produtos]);

  return {
    // Estados principais
    produtos,
    loading,
    error,
    pagination,
    
    // Estados específicos
    produtosDisponiveis,
    loadingProdutosDisponiveis,
    estatisticas,
    loadingEstatisticas,
    
    // Ações principais
    carregarProdutos,
    buscarProdutoPorId,
    criarProduto,
    atualizarProduto,
    deletarProduto,
    
    // Ações específicas
    carregarProdutosDisponiveis,
    carregarTodosProdutos,
    carregarEstatisticas,
    
    // Exportação
    exportarXLSX,
    
    // Refresh functions
    refreshProdutos,
    refreshEstatisticas
  };
};
