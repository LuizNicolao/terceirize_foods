import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import NomeGenericoProdutoService from '../services/nomeGenericoProduto';

export const useNomeGenericoProduto = () => {
  // Estados principais
  const [nomesGenericos, setNomesGenericos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingNomeGenerico, setEditingNomeGenerico] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_nomes_genericos: 0,
    nomes_genericos_ativos: 0,
    nomes_genericos_inativos: 0,
    produtos_vinculados: 0
  });

  // Carregar nomes genéricos
  const loadNomesGenericos = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await NomeGenericoProdutoService.listar(paginationParams);
      if (result.success) {
        setNomesGenericos(result.data);
        
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
        const ativos = result.data.filter(n => n.status === 1 || n.status === 'ativo').length;
        const inativos = result.data.filter(n => n.status === 0 || n.status === 'inativo').length;
        const comProdutos = result.data.filter(n => n.total_produtos > 0).length;
        
        setEstatisticas({
          total_nomes_genericos: total,
          nomes_genericos_ativos: ativos,
          nomes_genericos_inativos: inativos,
          produtos_vinculados: comProdutos
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar nomes genéricos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadNomesGenericos();
  }, [currentPage, itemsPerPage]);

  // Filtrar nomes genéricos (client-side)
  const filteredNomesGenericos = (Array.isArray(nomesGenericos) ? nomesGenericos : []).filter(nomeGenerico => {
    const matchesSearch = !searchTerm || 
      (nomeGenerico.nome && nomeGenerico.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (nomeGenerico.grupo_nome && nomeGenerico.grupo_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (nomeGenerico.subgrupo_nome && nomeGenerico.subgrupo_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (nomeGenerico.classe_nome && nomeGenerico.classe_nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        grupo_id: data.grupo_id ? parseInt(data.grupo_id) : null,
        subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
        classe_id: data.classe_id ? parseInt(data.classe_id) : null,
        status: data.status === 'ativo' ? 1 : 0
      };

      let result;
      if (editingNomeGenerico) {
        result = await NomeGenericoProdutoService.atualizar(editingNomeGenerico.id, cleanData);
      } else {
        result = await NomeGenericoProdutoService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingNomeGenerico ? 'Nome genérico atualizado com sucesso!' : 'Nome genérico criado com sucesso!');
        handleCloseModal();
        loadNomesGenericos();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar nome genérico');
    }
  };

  const handleDeleteNomeGenerico = async (nomeGenericoId) => {
    if (window.confirm('Tem certeza que deseja excluir este nome genérico?')) {
      try {
        const result = await NomeGenericoProdutoService.excluir(nomeGenericoId);
        if (result.success) {
          toast.success('Nome genérico excluído com sucesso!');
          loadNomesGenericos();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir nome genérico');
      }
    }
  };

  // Funções de modal
  const handleAddNomeGenerico = () => {
    setViewMode(false);
    setEditingNomeGenerico(null);
    setShowModal(true);
  };

  const handleViewNomeGenerico = (nomeGenerico) => {
    setViewMode(true);
    setEditingNomeGenerico(nomeGenerico);
    setShowModal(true);
  };

  const handleEditNomeGenerico = (nomeGenerico) => {
    setViewMode(false);
    setEditingNomeGenerico(nomeGenerico);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingNomeGenerico(null);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funções utilitárias
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      1: 'Ativo',
      0: 'Inativo',
      ativo: 'Ativo',
      inativo: 'Inativo'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      1: 'text-green-600',
      0: 'text-red-600',
      ativo: 'text-green-600',
      inativo: 'text-red-600'
    };
    return colorMap[status] || 'text-gray-600';
  };

  return {
    // Estados
    nomesGenericos: filteredNomesGenericos,
    loading,
    showModal,
    viewMode,
    editingNomeGenerico,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções CRUD
    onSubmit,
    handleDeleteNomeGenerico,

    // Funções de modal
    handleAddNomeGenerico,
    handleViewNomeGenerico,
    handleEditNomeGenerico,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    setItemsPerPage,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getStatusColor
  };
};
