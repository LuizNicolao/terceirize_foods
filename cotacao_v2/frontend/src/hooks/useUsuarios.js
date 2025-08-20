import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usuariosService } from '../services/usuarios';

export const useUsuarios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados principais
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  // Estados de ações
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Opções de filtros
  const roles = [
    { value: 'administrador', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'comprador', label: 'Comprador' }
  ];

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' }
  ];

  // Buscar usuários
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await usuariosService.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError(error.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Ações de navegação
  const handleView = useCallback((user) => {
    navigate(`/visualizar-usuario/${user.id}`);
  }, [navigate]);

  const handleEdit = useCallback((user) => {
    navigate(`/editar-usuario/${user.id}`);
  }, [navigate]);

  const handleCreate = useCallback(() => {
    navigate('/editar-usuario/new');
  }, [navigate]);

  // Ação de exclusão
  const handleDelete = useCallback(async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await usuariosService.deleteUsuario(userId);
      await fetchUsuarios();
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert(`Erro ao excluir usuário: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setDeletingUserId(null);
    }
  }, [fetchUsuarios]);

  // Utilitários
  const getRoleLabel = useCallback((role) => {
    return roles.find(r => r.value === role)?.label || role;
  }, [roles]);

  const getStatusLabel = useCallback((status) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  }, [statusOptions]);

  // Filtros
  const filteredUsuarios = usuarios.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    // Estados
    usuarios: filteredUsuarios,
    loading,
    error,
    searchTerm,
    statusFilter,
    deletingUserId,
    
    // Opções
    roles,
    statusOptions,
    
    // Ações
    fetchUsuarios,
    handleView,
    handleEdit,
    handleCreate,
    handleDelete,
    
    // Setters
    setSearchTerm,
    setStatusFilter,
    
    // Utilitários
    getRoleLabel,
    getStatusLabel
  };
};
