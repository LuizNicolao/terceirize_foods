import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import UsuariosService from '../services/usuarios';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useUsuarios = () => {
  const baseEntity = useBaseEntity('usuarios', UsuariosService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  const customFilters = useFilters({});

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

  const [estatisticasUsuarios, setEstatisticasUsuarios] = useState({
    total_usuarios: 0,
    usuarios_ativos: 0,
    administradores: 0,
    coordenadores: 0
  });

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

  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.searchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  const onSubmitCustom = useCallback(async (data) => {
    const cleanData = {
      ...data,
      nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
      email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
      senha: data.senha && data.senha.trim() !== '' ? data.senha.trim() : null
    };

    await baseEntity.onSubmit(cleanData);
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  const handleViewCustom = useCallback(async (usuario) => {
    try {
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

  const handleEditCustom = useCallback(async (usuario) => {
    try {
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

  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);

  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  useEffect(() => {
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity.items, calculateEstatisticas]);

  const handleSearchChange = useCallback((value) => {
    customFilters.setSearchTerm(value);
    if (baseEntity.setSearchTerm) {
      baseEntity.setSearchTerm(value);
    }
  }, [customFilters, baseEntity]);

  const handleClearSearch = useCallback(() => {
    customFilters.setSearchTerm('');
    if (baseEntity.clearSearch) {
      baseEntity.clearSearch();
    }
  }, [customFilters, baseEntity]);

  return {
    usuarios: isSortingLocally ? usuariosOrdenados : baseEntity.items,
    loading: baseEntity.loading,
    estatisticas: estatisticasUsuarios,
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingUsuario: baseEntity.editingItem,
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    usuarioToDelete: baseEntity.itemToDelete,
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    searchTerm: customFilters.searchTerm,
    statusFilter: customFilters.statusFilter,
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    sortField,
    sortDirection,
    isSortingLocally,
    handleAddUser: baseEntity.handleAdd,
    handleViewUser: handleViewCustom,
    handleEditUser: handleEditCustom,
    handleCloseModal: baseEntity.handleCloseModal,
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    setSearchTerm: handleSearchChange,
    clearSearch: handleClearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    setStatusFilter: customFilters.setStatusFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    onSubmit: onSubmitCustom,
    handleDeleteUser: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    handleSort,
    formatDate,
    getStatusLabel,
    getNivelAcessoLabel,
    getTipoAcessoLabel
  };
};