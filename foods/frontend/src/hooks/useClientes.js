import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ClientesService from '../services/clientes';

export const useClientes = () => {
  // Estados principais
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [ufFilter, setUfFilter] = useState('todos');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_clientes: 0,
    clientes_ativos: 0,
    com_email: 0,
    com_telefone: 0
  });

  // Carregar clientes
  const loadClientes = async (params = {}) => {
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await ClientesService.listar(paginationParams);
      if (result.success) {
        setClientes(result.data || []);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }
        
        // Calcular estatísticas básicas
        const total = result.pagination?.totalItems || result.data.length;
        const ativos = result.data.filter(c => c.status === 'ativo').length;
        const comEmail = result.data.filter(c => c.email && c.email.trim() !== '').length;
        const comTelefone = result.data.filter(c => c.telefone && c.telefone.trim() !== '').length;
        
        setEstatisticas({
          total_clientes: total,
          clientes_ativos: ativos,
          com_email: comEmail,
          com_telefone: comTelefone
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadClientes();
  }, [currentPage, itemsPerPage]);

  // Filtrar clientes (client-side)
  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = !searchTerm || 
      (cliente.razao_social && cliente.razao_social.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cliente.nome_fantasia && cliente.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cliente.cnpj && cliente.cnpj.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'todos' || cliente.status === statusFilter;
    const matchesUf = ufFilter === 'todos' || cliente.uf === ufFilter;
    
    return matchesSearch && matchesStatus && matchesUf;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        razao_social: data.razao_social && data.razao_social.trim() !== '' ? data.razao_social.trim() : null,
        nome_fantasia: data.nome_fantasia && data.nome_fantasia.trim() !== '' ? data.nome_fantasia.trim() : null,
        cnpj: data.cnpj && data.cnpj.trim() !== '' ? data.cnpj.trim() : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        telefone: data.telefone && data.telefone.trim() !== '' ? data.telefone.trim() : null
      };

      let result;
      if (editingCliente) {
        result = await ClientesService.atualizar(editingCliente.id, cleanData);
      } else {
        result = await ClientesService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingCliente ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
        handleCloseModal();
        loadClientes();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleDeleteCliente = async (clienteId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const result = await ClientesService.excluir(clienteId);
        if (result.success) {
          toast.success('Cliente excluído com sucesso!');
          loadClientes();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  // Funções de modal
  const handleAddCliente = () => {
    setViewMode(false);
    setEditingCliente(null);
    setShowModal(true);
  };

  const handleViewCliente = (cliente) => {
    setViewMode(true);
    setEditingCliente(cliente);
    setShowModal(true);
  };

  const handleEditCliente = (cliente) => {
    setViewMode(false);
    setEditingCliente(cliente);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingCliente(null);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Funções utilitárias
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return {
    // Estados
    clientes: Array.isArray(filteredClientes) ? filteredClientes : [],
    loading,
    showModal,
    viewMode,
    editingCliente,
    searchTerm,
    statusFilter,
    ufFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções CRUD
    onSubmit,
    handleDeleteCliente,

    // Funções de modal
    handleAddCliente,
    handleViewCliente,
    handleEditCliente,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,
    handleItemsPerPageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setUfFilter,

    // Funções utilitárias
    formatDate
  };
};
