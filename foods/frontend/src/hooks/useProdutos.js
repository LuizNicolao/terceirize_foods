import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ProdutosService from '../services/produtos';
import api from '../services/api';

export const useProdutos = () => {
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
  const [fornecedores, setFornecedores] = useState([]);

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

      const [produtosRes, gruposRes, subgruposRes, classesRes, unidadesRes, marcasRes, fornecedoresRes] = await Promise.all([
        ProdutosService.listar(paginationParams),
        api.get('/grupos?limit=1000'),
        api.get('/subgrupos?limit=1000'),
        api.get('/classes?limit=1000'),
        api.get('/unidades?limit=1000'),
        api.get('/marcas?limit=1000'),
        api.get('/fornecedores?limit=1000')
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

      if (unidadesRes.data?.data) {
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

      if (fornecedoresRes.data?.data?.items) {
        setFornecedores(fornecedoresRes.data.data.items);
      } else if (fornecedoresRes.data?.data) {
        setFornecedores(fornecedoresRes.data.data);
      } else {
        setFornecedores(fornecedoresRes.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  // Funções de CRUD
  const handleSubmitProduto = async (data) => {
    try {
      if (editingProduto) {
        // Para edição, enviar apenas os campos que foram alterados
        const updateData = {};
        
        if (data.nome !== editingProduto.nome) {
          updateData.nome = data.nome;
        }
        
        if (data.codigo_barras !== editingProduto.codigo_barras) {
          updateData.codigo_barras = data.codigo_barras;
        }
        
        if (data.fator_conversao !== editingProduto.fator_conversao) {
          updateData.fator_conversao = data.fator_conversao;
        }
        
        if (data.descricao !== editingProduto.descricao) {
          updateData.descricao = data.descricao;
        }
        
        if (data.grupo_id !== editingProduto.grupo_id) {
          updateData.grupo_id = data.grupo_id;
        }
        
        if (data.subgrupo_id !== editingProduto.subgrupo_id) {
          updateData.subgrupo_id = data.subgrupo_id;
        }
        
        if (data.classe_id !== editingProduto.classe_id) {
          updateData.classe_id = data.classe_id;
        }
        
        if (data.unidade_id !== editingProduto.unidade_id) {
          updateData.unidade_id = data.unidade_id;
        }
        
        if (data.status !== editingProduto.status) {
          updateData.status = parseInt(data.status);
        }
        
        // Se não há campos para atualizar, mostrar erro
        if (Object.keys(updateData).length === 0) {
          toast.error('Nenhum campo foi alterado');
          return;
        }
        
        const result = await ProdutosService.atualizar(editingProduto.id, updateData);
        if (result.success) {
          toast.success(result.message);
          handleCloseModal();
          loadData();
        } else {
          toast.error(result.error);
        }
      } else {
        // Para criação, enviar todos os campos
        const createData = { ...data };
        if (createData.status) {
          createData.status = parseInt(createData.status);
        }
        
        const result = await ProdutosService.criar(createData);
        if (result.success) {
          toast.success(result.message);
          handleCloseModal();
          loadData();
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDeleteProduto = async (produtoId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const result = await ProdutosService.excluir(produtoId);
        if (result.success) {
          toast.success(result.message);
          loadData();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast.error('Erro ao excluir produto');
      }
    }
  };

  // Funções de modal
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
    setEditingProduto(null);
    setViewMode(false);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funções de filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setCurrentPage(1);
  };

  // Funções utilitárias
  const getGrupoName = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : 'N/A';
  };

  const getUnidadeName = (unidadeId) => {
    const unidade = unidades.find(u => u.id === unidadeId);
    return unidade ? unidade.nome : 'N/A';
  };

  return {
    // Estados
    produtos,
    loading,
    showModal,
    viewMode,
    editingProduto,
    grupos,
    subgrupos,
    classes,
    unidades,
    marcas,
    fornecedores,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções
    loadData,
    handleSubmitProduto,
    handleDeleteProduto,
    handleAddProduto,
    handleViewProduto,
    handleEditProduto,
    handleCloseModal,
    handlePageChange,
    handleClearFilters,
    setSearchTerm,
    setStatusFilter,
    setItemsPerPage,
    getGrupoName,
    getUnidadeName
  };
};
