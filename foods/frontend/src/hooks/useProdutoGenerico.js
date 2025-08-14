/**
 * Hook customizado para Produto Genérico
 * Gerencia estado e operações relacionadas a produtos genéricos
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import produtoGenericoService from '../services/produtoGenerico';
import api from '../services/api';

export const useProdutoGenerico = () => {
  const [produtosGenericos, setProdutosGenericos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    grupo_id: '',
    subgrupo_id: '',
    classe_id: '',
    produto_origem_id: '',
    produto_padrao: '',
    page: 1,
    limit: 10
  });

  // Estados para dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [produtosOrigem, setProdutosOrigem] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);

  // Carregar dados auxiliares
  const carregarDadosAuxiliares = useCallback(async () => {
    try {
      // Carregar grupos
      const gruposResponse = await api.get('/grupos');
      if (gruposResponse.data.data) {
        setGrupos(gruposResponse.data.data);
      } else if (Array.isArray(gruposResponse.data)) {
        setGrupos(gruposResponse.data);
      }

      // Carregar subgrupos
      const subgruposResponse = await api.get('/subgrupos');
      if (subgruposResponse.data.data) {
        setSubgrupos(subgruposResponse.data.data);
      } else if (Array.isArray(subgruposResponse.data)) {
        setSubgrupos(subgruposResponse.data);
      }

      // Carregar classes
      const classesResponse = await api.get('/classes');
      if (classesResponse.data.data) {
        setClasses(classesResponse.data.data);
      } else if (Array.isArray(classesResponse.data)) {
        setClasses(classesResponse.data);
      }

      // Carregar produtos origem
      const produtosOrigemResponse = await api.get('/produto-origem');
      if (produtosOrigemResponse.data.data) {
        setProdutosOrigem(produtosOrigemResponse.data.data);
      } else if (Array.isArray(produtosOrigemResponse.data)) {
        setProdutosOrigem(produtosOrigemResponse.data);
      }

      // Carregar unidades de medida
      const unidadesResponse = await api.get('/unidades');
      if (unidadesResponse.data.data) {
        setUnidadesMedida(unidadesResponse.data.data);
      } else if (Array.isArray(unidadesResponse.data)) {
        setUnidadesMedida(unidadesResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  }, []);

  // Carregar produtos genéricos
  const carregarProdutosGenericos = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await produtoGenericoService.listar({ ...filters, ...params });
      
      if (response.success) {
        setProdutosGenericos(response.data || []);
        setPagination(response.pagination);
        setStatistics(response.statistics);
      } else {
        toast.error(response.error || 'Erro ao carregar produtos genéricos');
      }
    } catch (error) {
      toast.error('Erro ao carregar produtos genéricos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Buscar produto genérico por ID
  const buscarProdutoGenericoPorId = useCallback(async (id) => {
    try {
      const response = await produtoGenericoService.buscarPorId(id);
      
      if (response.success) {
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao buscar produto genérico');
        return null;
      }
    } catch (error) {
      toast.error('Erro ao buscar produto genérico');
      return null;
    }
  }, []);

  // Criar produto genérico
  const criarProdutoGenerico = useCallback(async (data) => {
    try {
      const response = await produtoGenericoService.criar(data);
      
      if (response.success) {
        toast.success(response.message || 'Produto genérico criado com sucesso!');
        await carregarProdutosGenericos();
        return response.data;
      } else {
        if (response.validationErrors && response.validationErrors.length > 0) {
          response.validationErrors.forEach(error => {
            toast.error(error.msg);
          });
        } else {
          toast.error(response.error || 'Erro ao criar produto genérico');
        }
        return null;
      }
    } catch (error) {
      toast.error('Erro ao criar produto genérico');
      return null;
    }
  }, [carregarProdutosGenericos]);

  // Atualizar produto genérico
  const atualizarProdutoGenerico = useCallback(async (id, data) => {
    try {
      const response = await produtoGenericoService.atualizar(id, data);
      
      if (response.success) {
        toast.success(response.message || 'Produto genérico atualizado com sucesso!');
        await carregarProdutosGenericos();
        return response.data;
      } else {
        if (response.validationErrors && response.validationErrors.length > 0) {
          response.validationErrors.forEach(error => {
            toast.error(error.msg);
          });
        } else {
          toast.error(response.error || 'Erro ao atualizar produto genérico');
        }
        return null;
      }
    } catch (error) {
      toast.error('Erro ao atualizar produto genérico');
      return null;
    }
  }, [carregarProdutosGenericos]);

  // Excluir produto genérico
  const excluirProdutoGenerico = useCallback(async (id) => {
    try {
      const response = await produtoGenericoService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Produto genérico excluído com sucesso!');
        await carregarProdutosGenericos();
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir produto genérico');
        return false;
      }
    } catch (error) {
      toast.error('Erro ao excluir produto genérico');
      return false;
    }
  }, [carregarProdutosGenericos]);

  // Buscar produtos genéricos ativos
  const buscarProdutosGenericosAtivos = useCallback(async () => {
    try {
      const response = await produtoGenericoService.buscarAtivos();
      
      if (response.success) {
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao carregar produtos genéricos ativos');
        return [];
      }
    } catch (error) {
      toast.error('Erro ao carregar produtos genéricos ativos');
      return [];
    }
  }, []);

  // Buscar produtos genéricos padrão
  const buscarProdutosGenericosPadrao = useCallback(async () => {
    try {
      const response = await produtoGenericoService.buscarPadrao();
      
      if (response.success) {
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao carregar produtos genéricos padrão');
        return [];
      }
    } catch (error) {
      toast.error('Erro ao carregar produtos genéricos padrão');
      return [];
    }
  }, []);

  // Buscar por código
  const buscarPorCodigo = useCallback(async (codigo) => {
    try {
      const response = await produtoGenericoService.buscarPorCodigo(codigo);
      
      if (response.success) {
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao buscar produto genérico por código');
        return [];
      }
    } catch (error) {
      toast.error('Erro ao buscar produto genérico por código');
      return [];
    }
  }, []);

  // Buscar similares
  const buscarSimilares = useCallback(async (search, limit = 10) => {
    try {
      const response = await produtoGenericoService.buscarSimilares(search, limit);
      
      if (response.success) {
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao buscar produtos genéricos similares');
        return [];
      }
    } catch (error) {
      toast.error('Erro ao buscar produtos genéricos similares');
      return [];
    }
  }, []);

  // Exportar XLSX
  const exportarXLSX = useCallback(async (params = {}) => {
    try {
      const response = await produtoGenericoService.exportarXLSX({ ...filters, ...params });
      
      if (response.success) {
        // Criar link para download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', response.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Exportação realizada com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao exportar produtos genéricos');
        return false;
      }
    } catch (error) {
      toast.error('Erro ao exportar produtos genéricos');
      return false;
    }
  }, [filters]);

  // Exportar PDF
  const exportarPDF = useCallback(async (params = {}) => {
    try {
      const response = await produtoGenericoService.exportarPDF({ ...filters, ...params });
      
      if (response.success) {
        // Criar link para download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', response.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Exportação realizada com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao exportar produtos genéricos');
        return false;
      }
    } catch (error) {
      toast.error('Erro ao exportar produtos genéricos');
      return false;
    }
  }, [filters]);

  // Atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFilters(prev => ({ ...prev, ...novosFiltros, page: 1 }));
  }, []);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      grupo_id: '',
      subgrupo_id: '',
      classe_id: '',
      produto_origem_id: '',
      produto_padrao: '',
      page: 1,
      limit: 10
    });
  }, []);

  // Mudar página
  const mudarPagina = useCallback((novaPagina) => {
    setFilters(prev => ({ ...prev, page: novaPagina }));
  }, []);

  // Mudar limite por página
  const mudarLimite = useCallback((novoLimite) => {
    setFilters(prev => ({ ...prev, limit: novoLimite, page: 1 }));
  }, []);

  // Função para visualizar produto genérico
  const handleView = useCallback((produtoGenerico) => {
    // Implementar visualização se necessário
    console.log('Visualizar produto genérico:', produtoGenerico);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosAuxiliares();
  }, [carregarDadosAuxiliares]);

  useEffect(() => {
    carregarProdutosGenericos();
  }, [carregarProdutosGenericos]);

  return {
    // Estados
    produtosGenericos,
    loading,
    pagination,
    statistics,
    filters,
    grupos,
    subgrupos,
    classes,
    produtosOrigem,
    unidadesMedida,

    // Funções
    carregarProdutosGenericos,
    buscarProdutoGenericoPorId,
    criarProdutoGenerico,
    atualizarProdutoGenerico,
    excluirProdutoGenerico,
    buscarProdutosGenericosAtivos,
    buscarProdutosGenericosPadrao,
    buscarPorCodigo,
    buscarSimilares,
    exportarXLSX,
    exportarPDF,
    atualizarFiltros,
    limparFiltros,
    mudarPagina,
    mudarLimite,
    handleView
  };
};
