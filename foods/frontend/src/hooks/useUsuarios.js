import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import UsuariosService from '../services/usuarios';
import { useValidation } from './useValidation';

export const useUsuarios = () => {
  // Hook universal de validação
  const {
    validationErrors,
    showValidationModal,
    handleServerResponse,
    closeValidationModal,
    clearValidationErrors
  } = useValidation();

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
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        senha: data.senha && data.senha.trim() !== '' ? data.senha.trim() : null
      };

      let response;
      if (editingUsuario) {
        response = await UsuariosService.atualizar(editingUsuario.id, cleanData);
        const success = handleServerResponse(
          response, 
          'Usuário atualizado com sucesso',
          () => {
            handleCloseModal();
            loadUsuarios();
          }
        );
        if (!success) return;
      } else {
        response = await UsuariosService.criar(cleanData);
        const success = handleServerResponse(
          response, 
          'Usuário criado com sucesso',
          () => {
            handleCloseModal();
            loadUsuarios();
          }
        );
        if (!success) return;
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const response = await UsuariosService.excluir(id);
      const success = handleServerResponse(
        response, 
        'Usuário excluído com sucesso',
        () => loadUsuarios()
      );
      if (!success) return;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleAddUser = () => {
    setEditingUsuario(null);
    setViewMode(false);
    setShowModal(true);
    clearValidationErrors();
  };

  const handleViewUser = (usuario) => {
    setEditingUsuario(usuario);
    setViewMode(true);
    setShowModal(true);
    clearValidationErrors();
  };

  const handleEditUser = (usuario) => {
    setEditingUsuario(usuario);
    setViewMode(false);
    setShowModal(true);
    clearValidationErrors();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingUsuario(null);
    clearValidationErrors();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funções auxiliares
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'ativo': { label: 'Ativo', color: 'text-green-600' },
      'inativo': { label: 'Inativo', color: 'text-red-600' }
    };
    return statusMap[status] || { label: status, color: 'text-gray-600' };
  };

  const getNivelAcessoLabel = (nivel) => {
    const nivelMap = {
      'I': { label: 'Nível I', color: 'text-blue-600' },
      'II': { label: 'Nível II', color: 'text-green-600' },
      'III': { label: 'Nível III', color: 'text-purple-600' }
    };
    return nivelMap[nivel] || { label: nivel, color: 'text-gray-600' };
  };

  const getTipoAcessoLabel = (tipo) => {
    const tipoMap = {
      'administrador': { label: 'Administrador', color: 'text-red-600' },
      'coordenador': { label: 'Coordenador', color: 'text-blue-600' },
      'administrativo': { label: 'Administrativo', color: 'text-green-600' },
      'gerente': { label: 'Gerente', color: 'text-purple-600' },
      'supervisor': { label: 'Supervisor', color: 'text-orange-600' }
    };
    return tipoMap[tipo] || { label: tipo, color: 'text-gray-600' };
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
    
    // Funções
    onSubmit,
    handleDeleteUser,
    handleAddUser,
    handleViewUser,
    handleEditUser,
    handleCloseModal,
    handlePageChange,
    closeValidationModal,
    setSearchTerm,
    setItemsPerPage,
    
    // Funções auxiliares
    formatDate,
    getStatusLabel,
    getNivelAcessoLabel,
    getTipoAcessoLabel
  };
};
