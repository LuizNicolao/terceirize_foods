import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import UsuariosService from '../services/usuarios';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useUsuarios = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('usuarios', UsuariosService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para usuários
  const customFilters = useFilters({});

  // Hook de busca com debounce

  // Hook de ordenação híbrida
  const {
    sortedData: usuariosOrdenados,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    defaultField: null,
    defaultDirection: null,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Estados de estatísticas específicas dos usuários
  const [estatisticasUsuarios, setEstatisticasUsuarios] = useState({
    total_usuarios: 0,
    usuarios_ativos: 0,
    administradores: 0,
    coordenadores: 0
  });

  /**
   * Calcula estatísticas específicas dos usuários
   */
  const calculateEstatisticas = useCallback((usuarios) => {
    if (!usuarios || usuarios.length === 0) {
      setEstatisticasUsuarios({
        total_usuarios: 0,
        usuarios_ativos: 0,
        administradores: 0,
        coordenadores: 0
      });
      return;
    }

    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.status === 'ativo').length;
    const administradores = usuarios.filter(u => u.tipo_de_acesso === 'administrador').length;
    const coordenadores = usuarios.filter(u => u.tipo_de_acesso === 'coordenador').length;

    setEstatisticasUsuarios({
      total_usuarios: total,
      usuarios_ativos: ativos,
      administradores,
      coordenadores
    });
  }, []);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.searchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  /**
   * Submissão customizada com limpeza de dados
   */
  const onSubmitCustom = useCallback(async (data) => {
    // Limpar campos vazios para evitar problemas de validação
    const cleanData = {
      ...data,
      nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
      email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
      senha: data.senha && data.senha.trim() !== '' ? data.senha.trim() : null
    };

    await baseEntity.onSubmit(cleanData);
    // Recalcular estatísticas após salvar
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recalcular estatísticas após excluir
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  /**
   * Visualização customizada que busca dados completos
   */
  const handleViewCustom = useCallback(async (usuario) => {
    try {
      // Buscar usuário completo
      const result = await UsuariosService.buscarPorId(usuario.id);
      if (result.success) {
        baseEntity.handleView(result.data);
      } else {
        toast.error('Erro ao carregar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
    }
  }, [baseEntity]);

  /**
   * Edição customizada que busca dados completos
   */
  const handleEditCustom = useCallback(async (usuario) => {
    try {
      // Buscar usuário completo
      const result = await UsuariosService.buscarPorId(usuario.id);
      if (result.success) {
        baseEntity.handleEdit(result.data);
      } else {
        toast.error('Erro ao carregar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
    }
  }, [baseEntity]);

  /**
   * Funções utilitárias
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  const getStatusLabel = useCallback((status) => {
    const statusMap = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      bloqueado: 'Bloqueado'
    };
    return statusMap[status] || status;
  }, []);

  const getNivelAcessoLabel = useCallback((nivel) => {
    const niveis = {
      'I': 'Nível I',
      'II': 'Nível II',
      'III': 'Nível III'
    };
    return niveis[nivel] || nivel;
  }, []);

  const getTipoAcessoLabel = useCallback((tipo) => {
    const tipos = {
      'administrador': 'Administrador',
      'coordenador': 'Coordenador',
      'administrativo': 'Administrativo',
      'gerente': 'Gerente',
      'supervisor': 'Supervisor'
    };
    return tipos[tipo] || tipo;
  }, []);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);

  // Carregar dados quando paginação muda
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  // Recalcular estatísticas quando os dados mudam
  useEffect(() => {
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity.items, calculateEstatisticas]);

  return {
    // Estados principais (usa dados ordenados se ordenação local)
    usuarios: isSortingLocally ? usuariosOrdenados : baseEntity.items,
    loading: baseEntity.loading,
    
    estatisticas: estatisticasUsuarios, // Usar estatísticas específicas dos usuários
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingUsuario: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    usuarioToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Ações de modal (customizadas)
    handleAddUser: baseEntity.handleAdd,
    handleViewUser: handleViewCustom,
    handleEditUser: handleEditCustom,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    setStatusFilter: customFilters.setStatusFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange, // Alias para compatibilidade
    
    // Ações de ordenação
    handleSort,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteUser: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getNivelAcessoLabel,
    getTipoAcessoLabel
  };
};