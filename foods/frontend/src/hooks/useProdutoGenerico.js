/**
 * Hook customizado para Produto Genérico
 * Gerencia estado e operações relacionadas a produtos genéricos
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import produtoGenericoService from '../services/produtoGenerico';
import api from '../services/api';
import { useValidation } from './useValidation';

export const useProdutoGenerico = () => {
  // Hook de validação universal
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Estados principais
  const [produtosGenericos, setProdutosGenericos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingProdutoGenerico, setEditingProdutoGenerico] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [grupoFilter, setGrupoFilter] = useState('');
  const [subgrupoFilter, setSubgrupoFilter] = useState('');
  const [classeFilter, setClasseFilter] = useState('');
  const [produtoOrigemFilter, setProdutoOrigemFilter] = useState('');
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
        api.get('/grupos?limit=1000'),
        api.get('/subgrupos?limit=1000'),
        api.get('/classes?limit=1000'),
        api.get('/produto-origem?limit=1000'),
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

      // Carregar produtos origem
      if (produtosOrigemRes.data?.data?.items) {
        setProdutosOrigem(produtosOrigemRes.data.data.items);
      } else if (produtosOrigemRes.data?.data) {
        setProdutosOrigem(produtosOrigemRes.data.data);
      } else {
        setProdutosOrigem(produtosOrigemRes.data || []);
      }

      // Carregar unidades de medida
      if (unidadesRes.data?.data?.items) {
        setUnidadesMedida(unidadesRes.data.data.items);
      } else if (unidadesRes.data?.data) {
        setUnidadesMedida(unidadesRes.data.data);
      } else {
        setUnidadesMedida(unidadesRes.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
      toast.error('Erro ao carregar dados auxiliares');
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
        status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : statusFilter === 'todos' ? undefined : statusFilter,
        grupo_id: grupoFilter || undefined,
        subgrupo_id: subgrupoFilter || undefined,
        classe_id: classeFilter || undefined,
        produto_origem_id: produtoOrigemFilter || undefined,
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
        
        // Usar estatísticas do backend
        
        if (result.statistics) {
          setEstatisticas({
            total_produtos_genericos: result.statistics.total || 0,
            produtos_ativos: result.statistics.ativos || 0,
            produtos_inativos: result.statistics.inativos || 0,
            produtos_padrao: result.statistics.produtos_padrao || 0,
            com_produto_origem: result.statistics.com_produto_origem || 0,
            total_produtos_vinculados: result.statistics.total_produtos_vinculados || 0
          });
        } else {
          // Fallback para estatísticas básicas
          const total = result.pagination?.totalItems || result.data.length;
          const ativos = result.data.filter(p => p.status === 1).length;
          const inativos = result.data.filter(p => p.status === 0).length;
          
          setEstatisticas({
            total_produtos_genericos: total,
            produtos_ativos: ativos,
            produtos_inativos: inativos,
            produtos_padrao: 0,
            com_produto_origem: 0,
            total_produtos_vinculados: 0
          });
        }
      } else {
        toast.error(result.message || 'Erro ao carregar produtos genéricos');
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
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, grupoFilter, subgrupoFilter, classeFilter, produtoOrigemFilter]);

  // Filtrar produtos genéricos (client-side)
  const filteredProdutosGenericos = (Array.isArray(produtosGenericos) ? produtosGenericos : []).filter(produto => {
    const matchesSearch = !searchTerm || 
      (produto.nome && produto.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      clearValidationErrors(); // Limpar erros anteriores
      
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
          handleCloseModal();
          loadProdutosGenericos();
        } else {
          if (handleApiResponse(result)) {
            return; // Erros de validação foram tratados
          }
          toast.error(result.message || 'Erro ao atualizar produto genérico');
        }
      } else {
        result = await produtoGenericoService.criar(cleanData);
        if (result.success) {
          toast.success('Produto genérico criado com sucesso!');
          handleCloseModal();
          loadProdutosGenericos();
        } else {
          if (handleApiResponse(result)) {
            return; // Erros de validação foram tratados
          }
          toast.error(result.message || 'Erro ao criar produto genérico');
        }
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
          toast.error(result.message || 'Erro ao excluir produto genérico');
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
        toast.error(result.message || 'Erro ao carregar produto genérico');
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
        toast.error(result.message || 'Erro ao carregar produto genérico');
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

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setGrupoFilter('');
    setSubgrupoFilter('');
    setClasseFilter('');
    setProdutoOrigemFilter('');
    setCurrentPage(1);
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
    showValidationModal,
    validationErrors,
    grupos,
    subgrupos,
    classes,
    produtosOrigem,
    unidadesMedida,
    searchTerm,
    statusFilter,
    grupoFilter,
    subgrupoFilter,
    classeFilter,
    produtoOrigemFilter,
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
    handleCloseValidationModal,
    handlePageChange,
    handleClearFilters,
    setSearchTerm,
    setStatusFilter,
    setGrupoFilter,
    setSubgrupoFilter,
    setClasseFilter,
    setProdutoOrigemFilter,
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
