/**
 * Hook customizado para Produto Origem
 * Gerencia estado e operações relacionadas a produtos origem
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ProdutoOrigemService from '../services/produtoOrigem';

export const useProdutoOrigem = () => {
  const [produtosOrigem, setProdutosOrigem] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingProdutoOrigem, setEditingProdutoOrigem] = useState(null);
  
  // Dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [produtosGenericosPadrao, setProdutosGenericosPadrao] = useState([]);
  
  // Filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [grupoFilter, setGrupoFilter] = useState('');
  const [subgrupoFilter, setSubgrupoFilter] = useState('');
  const [classeFilter, setClasseFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    inativos: 0
  });

  // Carregar dados auxiliares
  const carregarDadosAuxiliares = useCallback(async () => {
    try {
      const [gruposRes, subgruposRes, classesRes, unidadesRes, produtosGenericosRes] = await Promise.all([
        ProdutoOrigemService.listarGrupos(),
        ProdutoOrigemService.listarSubgrupos(),
        ProdutoOrigemService.listarClasses(),
        ProdutoOrigemService.listarUnidadesMedida(),
        ProdutoOrigemService.listarProdutosGenericosPadrao()
      ]);

      setGrupos(gruposRes.data || []);
      setSubgrupos(subgruposRes.data || []);
      setClasses(classesRes.data || []);
      setUnidadesMedida(unidadesRes.data || []);
      setProdutosGenericosPadrao(produtosGenericosRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
      toast.error('Erro ao carregar dados auxiliares');
    }
  }, []);

  // Carregar produtos origem
  const carregarProdutosOrigem = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        grupo_id: grupoFilter,
        subgrupo_id: subgrupoFilter,
        classe_id: classeFilter
      };

      const response = await ProdutoOrigemService.listarProdutosOrigem(params);
      
      setProdutosOrigem(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || 0);
      setEstatisticas(response.statistics || { total: 0, ativos: 0, inativos: 0 });
    } catch (error) {
      console.error('Erro ao carregar produtos origem:', error);
      toast.error('Erro ao carregar produtos origem');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, grupoFilter, subgrupoFilter, classeFilter]);

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDadosAuxiliares();
  }, [carregarDadosAuxiliares]);

  useEffect(() => {
    carregarProdutosOrigem();
  }, [carregarProdutosOrigem]);

  // Funções de manipulação
  const handleSubmitProdutoOrigem = async (data) => {
    try {
      setLoading(true);
      
      if (editingProdutoOrigem) {
        await ProdutoOrigemService.atualizarProdutoOrigem(editingProdutoOrigem.id, data);
        toast.success('Produto origem atualizado com sucesso!');
      } else {
        await ProdutoOrigemService.criarProdutoOrigem(data);
        toast.success('Produto origem criado com sucesso!');
      }
      
      handleCloseModal();
      carregarProdutosOrigem();
    } catch (error) {
      console.error('Erro ao salvar produto origem:', error);
      const message = error.response?.data?.message || 'Erro ao salvar produto origem';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProdutoOrigem = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto origem?')) {
      return;
    }

    try {
      setLoading(true);
      await ProdutoOrigemService.excluirProdutoOrigem(id);
      toast.success('Produto origem excluído com sucesso!');
      carregarProdutosOrigem();
    } catch (error) {
      console.error('Erro ao excluir produto origem:', error);
      const message = error.response?.data?.message || 'Erro ao excluir produto origem';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProdutoOrigem = () => {
    setEditingProdutoOrigem(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewProdutoOrigem = async (id) => {
    try {
      setLoading(true);
      const response = await ProdutoOrigemService.buscarProdutoOrigemPorId(id);
      setEditingProdutoOrigem(response.data);
      setViewMode(true);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao buscar produto origem:', error);
      toast.error('Erro ao carregar dados do produto origem');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProdutoOrigem = async (id) => {
    try {
      setLoading(true);
      const response = await ProdutoOrigemService.buscarProdutoOrigemPorId(id);
      setEditingProdutoOrigem(response.data);
      setViewMode(false);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao buscar produto origem:', error);
      toast.error('Erro ao carregar dados do produto origem');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProdutoOrigem(null);
    setViewMode(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setGrupoFilter('');
    setSubgrupoFilter('');
    setClasseFilter('');
    setCurrentPage(1);
  };

  // Funções auxiliares para obter nomes
  const getGrupoName = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : '-';
  };

  const getSubgrupoName = (subgrupoId) => {
    const subgrupo = subgrupos.find(sg => sg.id === subgrupoId);
    return subgrupo ? subgrupo.nome : '-';
  };

  const getClasseName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nome : '-';
  };

  const getUnidadeMedidaName = (unidadeId) => {
    const unidade = unidadesMedida.find(um => um.id === unidadeId);
    return unidade ? unidade.nome : '-';
  };

  const getProdutoGenericoPadraoName = (produtoId) => {
    const produto = produtosGenericosPadrao.find(p => p.id === produtoId);
    return produto ? produto.nome : '-';
  };

  return {
    // Estado
    produtosOrigem,
    loading,
    showModal,
    viewMode,
    editingProdutoOrigem,
    grupos,
    subgrupos,
    classes,
    unidadesMedida,
    produtosGenericosPadrao,
    searchTerm,
    statusFilter,
    grupoFilter,
    subgrupoFilter,
    classeFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções
    handleSubmitProdutoOrigem,
    handleDeleteProdutoOrigem,
    handleAddProdutoOrigem,
    handleViewProdutoOrigem,
    handleEditProdutoOrigem,
    handleCloseModal,
    handlePageChange,
    handleClearFilters,
    setSearchTerm,
    setStatusFilter,
    setGrupoFilter,
    setSubgrupoFilter,
    setClasseFilter,
    setItemsPerPage,

    // Funções auxiliares
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getUnidadeMedidaName,
    getProdutoGenericoPadraoName
  };
};
