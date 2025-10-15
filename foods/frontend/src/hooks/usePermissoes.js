import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PermissoesService from '../services/permissoes';
import { useDebouncedSearch } from './common/useDebouncedSearch';

export const usePermissoes = () => {
  // Hook de busca com debounce
  const debouncedSearch = useDebouncedSearch(500);

  // Estados específicos das permissões
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [editingPermissions, setEditingPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_usuarios: 0,
    usuarios_ativos: 0,
    usuarios_com_permissoes: 0
  });

  // Carregar usuários
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const result = await PermissoesService.listarUsuarios({ limit: 1000 });
      
      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        setUsuarios(data);
        setFilteredUsuarios(data);
        
        // Calcular estatísticas
        const ativos = data.filter(u => u.status === 'ativo').length;
        const comPermissoes = data.filter(u => u.permissoes_count > 0).length;
        
        setEstatisticas({
          total_usuarios: data.length,
          usuarios_ativos: ativos,
          usuarios_com_permissoes: comPermissoes
        });
      } else {
        toast.error(result.error || 'Erro ao carregar usuários');
        setUsuarios([]);
        setFilteredUsuarios([]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
      setUsuarios([]);
      setFilteredUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar permissões de um usuário
  const loadUserPermissions = async (userId) => {
    try {
      const result = await PermissoesService.buscarPermissoesUsuario(userId);
      
      if (result.success) {
        // O backend retorna { usuario, permissoes: [...] }
        const permissoes = result.data.permissoes || [];
        
        // Verificar se permissoes é um array antes de usar forEach
        if (!Array.isArray(permissoes)) {
          console.error('Permissões não é um array:', permissoes);
          toast.error('Formato de permissões inválido');
          setUserPermissions({});
          setEditingPermissions({});
          return;
        }
        
        // Converter array de permissões para objeto
        const permissionsObj = {};
        permissoes.forEach(perm => {
          permissionsObj[perm.tela] = {
            pode_visualizar: perm.pode_visualizar === 1 || perm.pode_visualizar === true,
            pode_criar: perm.pode_criar === 1 || perm.pode_criar === true,
            pode_editar: perm.pode_editar === 1 || perm.pode_editar === true,
            pode_excluir: perm.pode_excluir === 1 || perm.pode_excluir === true,
            pode_movimentar: perm.pode_movimentar === 1 || perm.pode_movimentar === true
          };
        });
        
        setUserPermissions(permissionsObj);
        setEditingPermissions(JSON.parse(JSON.stringify(permissionsObj))); // Deep copy
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

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadUsuarios();
  }, []);

  // Filtrar usuários (client-side)
  const filteredUsuariosData = (Array.isArray(usuarios) ? usuarios : []).filter(usuario => {
    const matchesSearch = !debouncedSearch.debouncedSearchTerm || 
      (usuario.nome && usuario.nome.toLowerCase().includes(debouncedSearch.debouncedSearchTerm.toLowerCase())) ||
      (usuario.email && usuario.email.toLowerCase().includes(debouncedSearch.debouncedSearchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Funções de CRUD
  const handleSavePermissions = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um usuário primeiro');
      return;
    }

    try {
      setSaving(true);
      
      // Converter objeto de permissões para array
      const permissoesArray = Object.entries(editingPermissions).map(([tela, perms]) => ({
        tela,
        pode_visualizar: perms.pode_visualizar ? 1 : 0,
        pode_criar: perms.pode_criar ? 1 : 0,
        pode_editar: perms.pode_editar ? 1 : 0,
        pode_excluir: perms.pode_excluir ? 1 : 0,
        pode_movimentar: perms.pode_movimentar ? 1 : 0
      }));

      const result = await PermissoesService.salvarPermissoes(selectedUserId, permissoesArray);
      
      if (result.success) {
        toast.success('Permissões salvas com sucesso!');
        setUserPermissions(JSON.parse(JSON.stringify(editingPermissions)));
        loadUsuarios(); // Recarregar para atualizar estatísticas
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

  // Funções de seleção de usuário
  const handleUserSelect = async (userId) => {
    setSelectedUserId(userId);
    const user = usuarios.find(u => u.id === userId);
    setSelectedUser(user);
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

  // Funções de permissões
  const handlePermissionChange = (tela, action, value) => {
    setEditingPermissions(prev => ({
      ...prev,
      [tela]: {
        ...prev[tela],
        [action]: value
      }
    }));
  };

  const handleExpandGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Funções de busca
  const handleSearchChange = (value) => {
    debouncedSearch.updateSearchTerm(value);
  };

  // Funções utilitárias
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusLabel = (status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  };

  return {
    // Estados
    usuarios: filteredUsuariosData,
    loading,
    selectedUserId,
    selectedUser,
    userPermissions,
    editingPermissions,
    saving,
    searchTerm: debouncedSearch.searchTerm,
    isSearching: debouncedSearch.isSearching,
    isSelectOpen,
    expandedGroups,
    showPermissionsModal,
    estatisticas,

    // Funções CRUD
    handleSavePermissions,

    // Funções de seleção
    handleUserSelect,

    // Funções de permissões
    handlePermissionChange,
    handleExpandGroup,

    // Funções de busca
    handleSearchChange,
    setSearchTerm: debouncedSearch.updateSearchTerm,
    handleKeyPress: debouncedSearch.handleKeyPress,
    clearSearch: debouncedSearch.clearSearch,

    // Funções de estado
    setIsSelectOpen,
    setShowPermissionsModal,

    // Funções utilitárias
    formatDate,
    getStatusLabel
  };
};
