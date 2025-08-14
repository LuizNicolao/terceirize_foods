/**
 * Hook customizado para Produto Genérico
 * Gerencia estado e operações relacionadas a produtos genéricos
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import produtoGenericoService from '../services/produtoGenerico';

export const useProdutoGenerico = () => {
  // Estados principais
  const [produtosGenericos, setProdutosGenericos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingProdutoGenerico, setEditingProdutoGenerico] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_produtos_genericos: 0,
    produtos_ativos: 0,
    produtos_inativos: 0
  });

  // Estados para dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [produtosOrigem, setProdutosOrigem] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);

  // Carregar dados auxiliares
  const carregarDadosAuxiliares = async () => {
    try {
      const [gruposRes, subgruposRes, classesRes, produtosOrigemRes, unidadesRes] = await Promise.all([
        produtoGenericoService.getGrupos(),
        produtoGenericoService.getSubgrupos(),
        produtoGenericoService.getClasses(),
        produtoGenericoService.getProdutosOrigem(),
        produtoGenericoService.getUnidadesMedida()
      ]);

      setGrupos(gruposRes.data || []);
      setSubgrupos(subgruposRes.data || []);
      setClasses(classesRes.data || []);
      setProdutosOrigem(produtosOrigemRes.data || []);
      setUnidadesMedida(unidadesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  };

  // Carregar produtos genéricos
  const loadProdutosGenericos = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...params
      };

      const result = await produtoGenericoService.listar(paginationParams);
      if (result.success) {
        setProdutosGenericos(result.data);
        
        // Extrair informações de paginação
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          // Fallback se não houver paginação no backend
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }
        
        // Calcular estatísticas básicas
        const total = result.pagination?.totalItems || result.data.length;
        const ativos = result.data.filter(p => p.status === 1).length;
        const inativos = result.data.filter(p => p.status === 0).length;
        
        setEstatisticas({
          total_produtos_genericos: total,
          produtos_ativos: ativos,
          produtos_inativos: inativos
        });
      } else {
        toast.error(result.error || 'Erro ao carregar produtos genéricos');
      }
    } catch (error) {
      toast.error('Erro ao carregar produtos genéricos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    carregarDadosAuxiliares();
    loadProdutosGenericos();
  }, [currentPage, itemsPerPage]);

  // Filtrar produtos genéricos (client-side)
  const filteredProdutosGenericos = (Array.isArray(produtosGenericos) ? produtosGenericos : []).filter(produto => {
    const matchesSearch = !searchTerm || 
      (produto.nome && produto.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        descricao: data.descricao && data.descricao.trim() !== '' ? data.descricao.trim() : null
      };

      let result;
      if (editingProdutoGenerico) {
        result = await produtoGenericoService.atualizar(editingProdutoGenerico.id, cleanData);
        if (result.success) {
          toast.success('Produto genérico atualizado com sucesso!');
        }
      } else {
        result = await produtoGenericoService.criar(cleanData);
        if (result.success) {
          toast.success('Produto genérico criado com sucesso!');
        }
      }

      if (result.success) {
        handleCloseModal();
        loadProdutosGenericos();
      } else {
        toast.error(result.error || 'Erro ao salvar produto genérico');
      }
    } catch (error) {
      toast.error('Erro ao salvar produto genérico');
    }
  };

  const handleDeleteProdutoGenerico = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto genérico?')) {
      try {
        const result = await produtoGenericoService.excluir(id);
        if (result.success) {
          toast.success('Produto genérico excluído com sucesso!');
          loadProdutosGenericos();
        } else {
          toast.error(result.error || 'Erro ao excluir produto genérico');
        }
      } catch (error) {
        toast.error('Erro ao excluir produto genérico');
      }
    }
  };

  const handleAddProdutoGenerico = () => {
    setEditingProdutoGenerico(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewProdutoGenerico = async (id) => {
    try {
      const result = await produtoGenericoService.buscarPorId(id);
      if (result.success) {
        setEditingProdutoGenerico(result.data);
        setViewMode(true);
        setShowModal(true);
      } else {
        toast.error(result.error || 'Erro ao carregar produto genérico');
      }
    } catch (error) {
      toast.error('Erro ao carregar produto genérico');
    }
  };

  const handleEditProdutoGenerico = async (id) => {
    try {
      const result = await produtoGenericoService.buscarPorId(id);
      if (result.success) {
        setEditingProdutoGenerico(result.data);
        setViewMode(false);
        setShowModal(true);
      } else {
        toast.error(result.error || 'Erro ao carregar produto genérico');
      }
    } catch (error) {
      toast.error('Erro ao carregar produto genérico');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProdutoGenerico(null);
    setViewMode(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funções auxiliares
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  };

  const getStatusColor = (status) => {
    return status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

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

  const getProdutoOrigemName = (produtoOrigemId) => {
    const produtoOrigem = produtosOrigem.find(po => po.id === produtoOrigemId);
    return produtoOrigem ? produtoOrigem.nome : '-';
  };

  const getUnidadeMedidaName = (unidadeId) => {
    const unidade = unidadesMedida.find(u => u.id === unidadeId);
    return unidade ? unidade.nome : '-';
  };

  return {
    // Estados
    produtosGenericos: filteredProdutosGenericos,
    loading,
    showModal,
    viewMode,
    editingProdutoGenerico,
    grupos,
    subgrupos,
    classes,
    produtosOrigem,
    unidadesMedida,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções
    onSubmit,
    handleDeleteProdutoGenerico,
    handleAddProdutoGenerico,
    handleViewProdutoGenerico,
    handleEditProdutoGenerico,
    handleCloseModal,
    handlePageChange,
    setSearchTerm,
    setItemsPerPage,

    // Funções auxiliares
    formatDate,
    getStatusLabel,
    getStatusColor,
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getProdutoOrigemName,
    getUnidadeMedidaName
  };
};
