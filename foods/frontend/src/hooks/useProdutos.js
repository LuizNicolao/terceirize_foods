import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ProdutosService from '../services/produtos';
import api from '../services/api';
import { useValidation } from './useValidation';

export const useProdutos = () => {
  // Hook de validação universal
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Estados principais
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  
  // Estados de dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [produtoGenerico, setProdutoGenerico] = useState([]);
  const [produtoOrigem, setProdutoOrigem] = useState([]);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_produtos: 0,
    produtos_ativos: 0,
    produtos_inativos: 0,
    grupos_diferentes: 0
  });

  // Carregar dados principais
  const loadData = async () => {
    setLoading(true);
    try {
      // Resetar página se os filtros mudaram
      if (searchTerm !== '' || statusFilter !== 'todos') {
        setCurrentPage(1);
      }
      
      // Carregar produtos com paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined
      };

      const [produtosRes, gruposRes, subgruposRes, classesRes, unidadesRes, marcasRes, produtoGenericoRes, produtoOrigemRes] = await Promise.all([
        ProdutosService.listar(paginationParams),
        api.get('/grupos?limit=1000'),
        api.get('/subgrupos?limit=1000'),
        api.get('/classes?limit=1000'),
        api.get('/unidades?limit=1000'),
        api.get('/marcas?limit=1000'),
        api.get('/produto-generico?limit=1000'),
        api.get('/produto-origem?limit=1000')
      ]);

      if (produtosRes.success) {
        setProdutos(produtosRes.data);
        
        // Extrair informações de paginação
        if (produtosRes.pagination) {
          setTotalPages(produtosRes.pagination.totalPages || 1);
          setTotalItems(produtosRes.pagination.totalItems || produtosRes.data.length);
          setCurrentPage(produtosRes.pagination.currentPage || 1);
        } else {
          setTotalItems(produtosRes.data.length);
          setTotalPages(Math.ceil(produtosRes.data.length / itemsPerPage));
        }
        
        // Calcular estatísticas
        const total = produtosRes.pagination?.totalItems || produtosRes.data.length;
        const ativos = produtosRes.data.filter(p => p.status === 1).length;
        const inativos = produtosRes.data.filter(p => p.status === 0).length;
        const gruposUnicos = new Set(produtosRes.data.map(p => p.grupo_id)).size;
        
        setEstatisticas({
          total_produtos: total,
          produtos_ativos: ativos,
          produtos_inativos: inativos,
          grupos_diferentes: gruposUnicos
        });
      } else {
        toast.error(produtosRes.error);
      }

      // Carregar dados auxiliares
      if (gruposRes.data?.data?.items) {
        setGrupos(gruposRes.data.data.items);
      } else if (gruposRes.data?.data) {
        setGrupos(gruposRes.data.data);
      } else {
        setGrupos(gruposRes.data || []);
      }

      if (subgruposRes.data?.data?.items) {
        setSubgrupos(subgruposRes.data.data.items);
      } else if (subgruposRes.data?.data) {
        setSubgrupos(subgruposRes.data.data);
      } else {
        setSubgrupos(subgruposRes.data || []);
      }

      if (classesRes.data?.data?.items) {
        setClasses(classesRes.data.data.items);
      } else if (classesRes.data?.data) {
        setClasses(classesRes.data.data);
      } else {
        setClasses(classesRes.data || []);
      }

      if (unidadesRes.data?.data?.items) {
        setUnidades(unidadesRes.data.data.items);
      } else if (unidadesRes.data?.data) {
        setUnidades(unidadesRes.data.data);
      } else {
        setUnidades(unidadesRes.data || []);
      }

      if (marcasRes.data?.data?.items) {
        setMarcas(marcasRes.data.data.items);
      } else if (marcasRes.data?.data) {
        setMarcas(marcasRes.data.data);
      } else {
        setMarcas(marcasRes.data || []);
      }

      if (produtoGenericoRes.data?.data?.items) {
        setProdutoGenerico(produtoGenericoRes.data.data.items);
      } else if (produtoGenericoRes.data?.data) {
        setProdutoGenerico(produtoGenericoRes.data.data);
      } else {
        setProdutoGenerico(produtoGenericoRes.data || []);
      }

      if (produtoOrigemRes.data?.data?.items) {
        setProdutoOrigem(produtoOrigemRes.data.data.items);
      } else if (produtoOrigemRes.data?.data) {
        setProdutoOrigem(produtoOrigemRes.data.data);
      } else {
        setProdutoOrigem(produtoOrigemRes.data || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando componentes montar ou filtros mudarem
  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  // Funções de manipulação de produtos
  const handleSubmitProduto = async (data) => {
    try {
      let response;
      if (editingProduto) {
        response = await ProdutosService.atualizar(editingProduto.id, data);
        if (response.success) {
          toast.success('Produto atualizado com sucesso');
        } else {
          // Usar sistema universal de validação
          if (handleApiResponse(response)) {
            return; // Erros de validação tratados pelo hook
          } else {
            toast.error(response.error);
          }
          return;
        }
      } else {
        response = await ProdutosService.criar(data);
        if (response.success) {
          toast.success('Produto criado com sucesso');
        } else {
          // Usar sistema universal de validação
          if (handleApiResponse(response)) {
            return; // Erros de validação tratados pelo hook
          } else {
            toast.error(response.error);
          }
          return;
        }
      }
      
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDeleteProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      const response = await ProdutosService.excluir(id);
      if (response.success) {
        toast.success('Produto excluído com sucesso');
        loadData();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const handleAddProduto = () => {
    setEditingProduto(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewProduto = (produto) => {
    setEditingProduto(produto);
    setViewMode(true);
    setShowModal(true);
  };

  const handleEditProduto = (produto) => {
    setEditingProduto(produto);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingProduto(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setCurrentPage(1);
  };

  // Funções auxiliares
  const getGrupoName = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : '-';
  };

  const getUnidadeName = (unidadeId) => {
    const unidade = unidades.find(u => u.id === unidadeId);
    return unidade ? unidade.nome : '-';
  };

  return {
    // Estados
    produtos,
    loading,
    showModal,
    viewMode,
    editingProduto,
    showValidationModal,
    validationErrors,
    grupos,
    subgrupos,
    classes,
    unidades,
    marcas,
    produtoGenerico,
    produtoOrigem,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    
    // Funções
    handleSubmitProduto,
    handleDeleteProduto,
    handleAddProduto,
    handleViewProduto,
    handleEditProduto,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleClearFilters,
    setSearchTerm,
    setStatusFilter,
    setItemsPerPage,
    getGrupoName,
    getUnidadeName
  };
};
