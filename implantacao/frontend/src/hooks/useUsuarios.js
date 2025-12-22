import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import UsuariosService from '../services/usuarios';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

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

  // Ref para manter referência estável do loadData
  const loadDataRef = useRef(baseEntity.loadData);
  useEffect(() => {
    loadDataRef.current = baseEntity.loadData;
  }, [baseEntity.loadData]);

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
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage,
      search: customFilters.appliedSearchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.loadData, customFilters.appliedSearchTerm, customFilters.statusFilter]);

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
  }, [baseEntity.onSubmit, baseEntity.items, calculateEstatisticas]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recalcular estatísticas após excluir
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity.handleConfirmDelete, baseEntity.items, calculateEstatisticas]);

  /**
   * Visualização customizada que busca dados completos
   */
  const handleViewCustom = useCallback(async (usuario) => {
    try {
      // Buscar usuário completo com filiais vinculadas
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
  }, [baseEntity.handleView]);

  /**
   * Edição customizada que busca dados completos
   */
  const handleEditCustom = useCallback(async (usuario) => {
    try {
      // Buscar usuário completo com filiais vinculadas
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
  }, [baseEntity.handleEdit]);

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

  /**
   * Handler para pressionar Enter na busca
   */
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      customFilters.applySearch();
      baseEntity.handlePageChange(1); // Reset para primeira página
    }
  }, [customFilters.applySearch, baseEntity.handlePageChange]);

  // Carregar dados quando filtros aplicados ou paginação mudam
  useEffect(() => {
    const params = {
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage,
      search: customFilters.appliedSearchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };
    loadDataRef.current(params);
  }, [customFilters.appliedSearchTerm, customFilters.statusFilter, baseEntity.currentPage, baseEntity.itemsPerPage]);

  // Recalcular estatísticas quando os dados mudam
  useEffect(() => {
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity.items, calculateEstatisticas]);

  return {
    // Estados principais (do hook base)
    usuarios: baseEntity.items,
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
    searchTerm: customFilters.searchTerm,
    statusFilter: customFilters.statusFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (customizadas)
    handleAddUser: baseEntity.handleAdd,
    handleViewUser: handleViewCustom,
    handleEditUser: handleEditCustom,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: customFilters.setSearchTerm,
    setStatusFilter: customFilters.setStatusFilter,
    handleKeyPress,
    setItemsPerPage: baseEntity.handleItemsPerPageChange, // Alias para compatibilidade
    
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