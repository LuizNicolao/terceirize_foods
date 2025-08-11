import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import UsuariosService from '../services/usuarios';

export const useUsuarios = () => {
  // Estados principais
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_usuarios: 0,
    usuarios_ativos: 0,
    administradores: 0,
    gestores: 0,
    supervisores: 0,
    compradores: 0
  });

  // React Hook Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Carregar usuários
  const loadUsuarios = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

             const result = await UsuariosService.getUsuarios(paginationParams.page, paginationParams.limit, params);
      
      if (result.success) {
        setUsuarios(result.data);
        
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
        const ativos = result.data.filter(u => u.status === 'ativo').length;
        const administradores = result.data.filter(u => u.role === 'administrador').length;
        const gestores = result.data.filter(u => u.role === 'gestor').length;
        const supervisores = result.data.filter(u => u.role === 'supervisor').length;
        const compradores = result.data.filter(u => u.role === 'comprador').length;
        
        setEstatisticas({
          total_usuarios: total,
          usuarios_ativos: ativos,
          administradores,
          gestores,
          supervisores,
          compradores
        });
      } else {
        toast.error(result.error || 'Erro ao carregar usuários');
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadUsuarios();
  }, [currentPage, itemsPerPage]);

  // Filtrar usuários (client-side)
  const filteredUsuarios = (Array.isArray(usuarios) ? usuarios : []).filter(usuario => {
    const matchesSearch = !searchTerm || 
      (usuario.name && usuario.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario.email && usuario.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        name: data.name && data.name.trim() !== '' ? data.name.trim() : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        role: data.role || 'comprador',
        status: data.status || 'ativo'
      };

      let result;
             if (editingUsuario) {
         result = await UsuariosService.updateUsuario(editingUsuario.id, cleanData);
        if (result.success) {
          toast.success('Usuário atualizado com sucesso!');
        }
      } else {
        result = await UsuariosService.createUsuario(cleanData);
        if (result.success) {
          toast.success('Usuário criado com sucesso!');
        }
      }

      if (result.success) {
        handleCloseModal();
        loadUsuarios();
      } else {
        toast.error(result.error || 'Erro ao salvar usuário');
      }
    } catch (error) {
      toast.error('Erro ao salvar usuário');
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const result = await UsuariosService.deleteUsuario(userId);
        if (result.success) {
          toast.success('Usuário excluído com sucesso!');
          loadUsuarios();
        } else {
          toast.error(result.error || 'Erro ao excluir usuário');
        }
      } catch (error) {
        toast.error('Erro ao excluir usuário');
        console.error('Erro ao excluir usuário:', error);
      }
    }
  };

  const handleAddUser = () => {
    setEditingUsuario(null);
    setViewMode(false);
    setShowModal(true);
    reset();
  };

  const handleViewUser = (usuario) => {
    setEditingUsuario(usuario);
    setViewMode(true);
    setShowModal(true);
    reset(usuario);
  };

  const handleEditUser = (usuario) => {
    setEditingUsuario(usuario);
    setViewMode(false);
    setShowModal(true);
    reset(usuario);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUsuario(null);
    setViewMode(false);
    reset();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'ativo': 'Ativo',
      'inativo': 'Inativo'
    };
    return statusMap[status] || status;
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      'administrador': 'Administrador',
      'gestor': 'Gestor',
      'supervisor': 'Supervisor',
      'comprador': 'Comprador'
    };
    return roleMap[role] || role;
  };

  return {
    // Estados
    usuarios: filteredUsuarios,
    loading,
    showModal,
    viewMode,
    editingUsuario,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    
    // React Hook Form
    register,
    handleSubmit,
    reset,
    errors,
    
    // Funções
    onSubmit,
    handleDeleteUser,
    handleAddUser,
    handleViewUser,
    handleEditUser,
    handleCloseModal,
    handlePageChange,
    setSearchTerm,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    getRoleLabel
  };
};
