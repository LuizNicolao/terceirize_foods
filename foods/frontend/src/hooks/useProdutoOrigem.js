/**
 * Hook customizado para Produto Origem
 * Gerencia estado e operações relacionadas a produtos origem
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ProdutoOrigemService from '../services/produtoOrigem';
import api from '../services/api';

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
  const [statusFilter, setStatusFilter] = useState('todos');
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
      const [gruposRes, subgruposRes, classesRes, unidadesRes] = await Promise.all([
        api.get('/grupos?limit=1000'),
        api.get('/subgrupos?limit=1000'),
        api.get('/classes?limit=1000'),
        api.get('/unidades?limit=1000')
      ]);

      // Carregar grupos
      if (gruposRes.data?.data?.items) {
        setGrupos(gruposRes.data.data.items);
      } else if (gruposRes.data?.data) {
        setGrupos(gruposRes.data.data);
      } else {
        setGrupos(gruposRes.data || []);
      }

      // Carregar subgrupos
      if (subgruposRes.data?.data?.items) {
        setSubgrupos(subgruposRes.data.data.items);
      } else if (subgruposRes.data?.data) {
        setSubgrupos(subgruposRes.data.data);
      } else {
        setSubgrupos(subgruposRes.data || []);
      }

      // Carregar classes
      if (classesRes.data?.data?.items) {
        setClasses(classesRes.data.data.items);
      } else if (classesRes.data?.data) {
        setClasses(classesRes.data.data);
      } else {
        setClasses(classesRes.data || []);
      }

      // Carregar unidades de medida
      if (unidadesRes.data?.data?.items) {
        setUnidadesMedida(unidadesRes.data.data.items);
      } else if (unidadesRes.data?.data) {
        setUnidadesMedida(unidadesRes.data.data);
      } else {
        setUnidadesMedida(unidadesRes.data || []);
      }

      // Carregar produtos genéricos padrão
      try {
        const produtosGenericosRes = await api.get('/produto-generico?status=1&limit=1000');
        let produtosGenericos = [];
        
        if (produtosGenericosRes.data?.data?.items) {
          produtosGenericos = produtosGenericosRes.data.data.items;
        } else if (produtosGenericosRes.data?.data) {
          produtosGenericos = produtosGenericosRes.data.data;
        } else {
          produtosGenericos = produtosGenericosRes.data || [];
        }
        
        setProdutosGenericosPadrao(produtosGenericos);
      } catch (error) {
        console.error('Erro ao carregar produtos genéricos padrão:', error);
        setProdutosGenericosPadrao([]);
      }
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
        status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : statusFilter === 'todos' ? undefined : statusFilter,
        grupo_id: grupoFilter,
        subgrupo_id: subgrupoFilter,
        classe_id: classeFilter
      };

      const response = await ProdutoOrigemService.listar(params);
      
      if (response.success) {
        setProdutosOrigem(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotalItems(response.pagination?.total || 0);
        setEstatisticas(response.statistics || { total: 0, ativos: 0, inativos: 0 });
      } else {
        toast.error(response.error || 'Erro ao carregar produtos origem');
      }
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
        const response = await ProdutoOrigemService.atualizar(editingProdutoOrigem.id, data);
        if (response.success) {
          toast.success(response.message || 'Produto origem atualizado com sucesso!');
        } else {
          throw new Error(response.error);
        }
      } else {
        const response = await ProdutoOrigemService.criar(data);
        if (response.success) {
          toast.success(response.message || 'Produto origem criado com sucesso!');
        } else {
          throw new Error(response.error);
        }
      }
      
      handleCloseModal();
      carregarProdutosOrigem();
    } catch (error) {
      let message = 'Erro ao salvar produto origem';
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        message = validationErrors.map(err => err.msg).join(', ');
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
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
      const response = await ProdutoOrigemService.excluir(id);
      if (response.success) {
        toast.success(response.message || 'Produto origem excluído com sucesso!');
      } else {
        throw new Error(response.error);
      }
      carregarProdutosOrigem();
    } catch (error) {
      console.error('Erro ao excluir produto origem:', error);
      const message = error.message || 'Erro ao excluir produto origem';
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
      const response = await ProdutoOrigemService.buscarPorId(id);
      if (response.success) {
        setEditingProdutoOrigem(response.data);
        setViewMode(true);
        setShowModal(true);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Erro ao buscar produto origem:', error);
      const message = error.message || 'Erro ao carregar dados do produto origem';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProdutoOrigem = async (id) => {
    try {
      setLoading(true);
      const response = await ProdutoOrigemService.buscarPorId(id);
      if (response.success) {
        setEditingProdutoOrigem(response.data);
        setViewMode(false);
        setShowModal(true);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Erro ao buscar produto origem:', error);
      const message = error.message || 'Erro ao carregar dados do produto origem';
      toast.error(message);
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
    setStatusFilter('todos');
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
