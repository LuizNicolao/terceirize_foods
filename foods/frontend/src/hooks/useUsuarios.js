import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import UsuariosService from '../services/usuarios';
import { useValidation } from './useValidation';

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
    coordenadores: 0
  });

  // Estados para modal de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

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

      const result = await UsuariosService.listar(paginationParams);
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
        const administradores = result.data.filter(u => u.tipo_de_acesso === 'administrador').length;
        const coordenadores = result.data.filter(u => u.tipo_de_acesso === 'coordenador').length;
        const nutricionistas = result.data.filter(u => u.tipo_de_acesso === 'nutricionista').length;
        
        setEstatisticas({
          total_usuarios: total,
          usuarios_ativos: ativos,
          administradores,
          coordenadores
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
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
      (usuario.nome && usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario.email && usuario.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        senha: data.senha && data.senha.trim() !== '' ? data.senha.trim() : null
      };

      let result;
      if (editingUsuario) {
        result = await UsuariosService.atualizar(editingUsuario.id, cleanData);
      } else {
        result = await UsuariosService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingUsuario ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
        handleCloseModal();
        loadUsuarios();
      } else {
        if (handleApiResponse(result)) {
          return; // Erros de validação foram tratados
        }
        toast.error(result.message || 'Erro ao salvar usuário');
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário');
    }
  };

  const handleDeleteUser = (usuario) => {
    setUsuarioToDelete(usuario);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!usuarioToDelete) return;

    try {
      const result = await UsuariosService.excluir(usuarioToDelete.id);
      if (result.success) {
        toast.success('Usuário excluído com sucesso!');
        loadUsuarios();
        setShowDeleteConfirmModal(false);
        setUsuarioToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setUsuarioToDelete(null);
  };

  // Funções de modal
  const handleAddUser = () => {
    setViewMode(false);
    setEditingUsuario(null);
    setShowModal(true);
  };

  const handleViewUser = async (usuario) => {
    try {
      // Buscar usuário completo com filiais vinculadas
      const result = await UsuariosService.buscarPorId(usuario.id);
      if (result.success) {
        setViewMode(true);
        setEditingUsuario(result.data);
        setShowModal(true);
      } else {
        toast.error('Erro ao carregar dados do usuário');
      }
    } catch (verifyError) {
      console.error('Erro ao buscar usuário:', verifyError);
      toast.error('Erro ao carregar dados do usuário');
    }
  };

  const handleEditUser = async (usuario) => {
    try {
      // Buscar usuário completo com filiais vinculadas
      const result = await UsuariosService.buscarPorId(usuario.id);
      if (result.success) {
        setViewMode(false);
        setEditingUsuario(result.data);
        setShowModal(true);
      } else {
        toast.error('Erro ao carregar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingUsuario(null);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Recarregar dados da nova página
    loadUsuarios({ page });
  };

  // Funções utilitárias
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      bloqueado: 'Bloqueado'
    };
    return statusMap[status] || status;
  };

  const getNivelAcessoLabel = (nivel) => {
    const niveis = {
      'I': 'Nível I',
      'II': 'Nível II',
      'III': 'Nível III'
    };
    return niveis[nivel] || nivel;
  };

  const getTipoAcessoLabel = (tipo) => {
    const tipos = {
      'administrador': 'Administrador',
      'coordenador': 'Coordenador',
      'administrativo': 'Administrativo',
      'gerente': 'Gerente',
      'supervisor': 'Supervisor'
    };
    return tipos[tipo] || tipo;
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

    // Estados de validação
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,

    // Estados para modal de confirmação
    showDeleteConfirmModal,
    usuarioToDelete,

    // Funções CRUD
    onSubmit,
    handleDeleteUser,
    handleConfirmDelete,
    handleCloseDeleteModal,

    // Funções de modal
    handleAddUser,
    handleViewUser,
    handleEditUser,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    setItemsPerPage,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getNivelAcessoLabel,
    getTipoAcessoLabel
  };
};
