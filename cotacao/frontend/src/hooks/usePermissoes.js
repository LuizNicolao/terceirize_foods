import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import PermissoesService from '../services/permissoes';
import { usePermissions } from '../contexts/PermissionsContext';

const PERMISSION_SCREENS = [
  'dashboard',
  'usuarios',
  'cotacoes',
  'supervisor',
  'aprovacoes',
  'aprovacoes_supervisor',
  'saving',
  'nova-cotacao',
  'visualizar-cotacao',
  'editar-cotacao'
];

const DEFAULT_PERMISSION = {
  pode_visualizar: false,
  pode_criar: false,
  pode_editar: false,
  pode_excluir: false
};

export const usePermissoes = () => {
  const { reloadPermissions } = usePermissions();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [editingPermissions, setEditingPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [roleFilter, setRoleFilter] = useState('todos');

  const [estatisticas, setEstatisticas] = useState({
    total_usuarios: 0,
    usuarios_ativos: 0,
    usuarios_com_permissoes: 0
  });

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const result = await PermissoesService.listarUsuarios();

      if (result.success) {
        const lista = Array.isArray(result.data) ? result.data : [];
        setUsuarios(lista);

        const ativos = lista.filter((u) => (u.status || '').toLowerCase() === 'ativo').length;
        const comPermissoes = lista.filter((u) => (u.permissoes_count || 0) > 0).length;

        setEstatisticas({
          total_usuarios: lista.length,
          usuarios_ativos: ativos,
          usuarios_com_permissoes: comPermissoes
        });
      } else {
        toast.error(result.error || 'Erro ao carregar usuários');
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId) => {
    try {
      const result = await PermissoesService.buscarPermissoesUsuario(userId);

      if (result.success) {
        const permissionsObj = {};
        result.data.forEach((perm) => {
          permissionsObj[perm.screen] = {
            pode_visualizar: !!perm.can_view,
            pode_criar: !!perm.can_create,
            pode_editar: !!perm.can_edit,
            pode_excluir: !!perm.can_delete
          };
        });

        setUserPermissions(permissionsObj);
        setEditingPermissions(JSON.parse(JSON.stringify(permissionsObj)));
      } else {
        toast.error(result.error || 'Erro ao carregar permissões');
        setUserPermissions({});
        setEditingPermissions({});
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      toast.error('Erro ao carregar permissões');
      setUserPermissions({});
      setEditingPermissions({});
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const filteredUsuariosData = useMemo(() => {
    const lista = Array.isArray(usuarios) ? usuarios : [];
    const termo = searchTerm.trim().toLowerCase();

    return lista
      .filter((usuario) => {
        if (!termo) return true;
        const nomeMatch = usuario.nome && usuario.nome.toLowerCase().includes(termo);
        const emailMatch = usuario.email && usuario.email.toLowerCase().includes(termo);
        return nomeMatch || emailMatch;
      })
      .filter((usuario) => {
        if (statusFilter === 'todos') return true;
        return (usuario.status || '').toLowerCase() === statusFilter.toLowerCase();
      })
      .filter((usuario) => {
        if (roleFilter === 'todos') return true;
        return (usuario.tipo_de_acesso || '').toLowerCase() === roleFilter.toLowerCase();
      })
      .sort((a, b) => {
        const nomeA = (a.nome || '').toLowerCase();
        const nomeB = (b.nome || '').toLowerCase();
        return nomeA.localeCompare(nomeB);
      });
  }, [usuarios, searchTerm, statusFilter, roleFilter]);

  const handleSavePermissions = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um usuário primeiro');
      return;
    }

    try {
      setSaving(true);

      const permissoesArray = PERMISSION_SCREENS.map((screen) => {
        const perms = editingPermissions[screen] || DEFAULT_PERMISSION;
        return {
          screen,
          can_view: perms.pode_visualizar ? 1 : 0,
          can_create: perms.pode_criar ? 1 : 0,
          can_edit: perms.pode_editar ? 1 : 0,
          can_delete: perms.pode_excluir ? 1 : 0
        };
      });

      const result = await PermissoesService.salvarPermissoes(selectedUserId, permissoesArray);

      if (result.success) {
        toast.success('Permissões salvas com sucesso!');
        setUserPermissions(JSON.parse(JSON.stringify(editingPermissions)));
        loadUsuarios();
        reloadPermissions();
        setShowPermissionsModal(false);
      } else {
        toast.error(result.error || 'Erro ao salvar permissões');
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      toast.error('Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  const handleUserSelect = async (userId) => {
    setSelectedUserId(userId);
    const user = usuarios.find((u) => u.id === userId);
    setSelectedUser(user || null);
    setIsSelectOpen(false);

    if (userId) {
      await loadUserPermissions(userId);
      setShowPermissionsModal(true);
    } else {
      setUserPermissions({});
      setEditingPermissions({});
      setShowPermissionsModal(false);
    }
  };

  const handlePermissionChange = (screen, key, value) => {
    setEditingPermissions((prev) => ({
      ...prev,
      [screen]: {
        ...DEFAULT_PERMISSION,
        ...prev[screen],
        [key]: value
      }
    }));
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setRoleFilter('todos');
  };

  const getStatusLabel = (status) => (status === 'ativo' ? 'Ativo' : 'Inativo');

  return {
    usuarios: filteredUsuariosData,
    loading,
    selectedUserId,
    selectedUser,
    userPermissions,
    editingPermissions,
    saving,
    searchTerm,
    isSelectOpen,
    showPermissionsModal,
    estatisticas,
    handleSavePermissions,
    handleUserSelect,
    handlePermissionChange,
    handleSearchChange,
    handleStatusFilterChange,
    handleRoleFilterChange,
    handleClearFilters,
    setIsSelectOpen,
    setShowPermissionsModal,
    statusFilter,
    roleFilter,
    getStatusLabel
  };
};
