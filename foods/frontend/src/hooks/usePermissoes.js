import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PermissoesService from '../services/permissoes';

export const usePermissoes = () => {
  // Estados principais
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [editingPermissions, setEditingPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

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
        const permissoes = result.data.permissoes || result.data || [];
        
        // Converter array de permissões para objeto
        const permissionsObj = {};
        permissoes.forEach(perm => {
          permissionsObj[perm.tela] = {
            pode_visualizar: perm.pode_visualizar === 1 || perm.pode_visualizar === true,
            pode_criar: perm.pode_criar === 1 || perm.pode_criar === true,
            pode_editar: perm.pode_editar === 1 || perm.pode_editar === true,
            pode_excluir: perm.pode_excluir === 1 || perm.pode_excluir === true
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
    const matchesSearch = !searchTerm || 
      (usuario.nome && usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario.email && usuario.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
        pode_excluir: perms.pode_excluir ? 1 : 0
      }));

      const result = await PermissoesService.atualizarPermissoes(selectedUserId, {
        permissoes: permissoesArray
      });

      if (result.success) {
        toast.success('Permissões atualizadas com sucesso!');
        setUserPermissions(JSON.parse(JSON.stringify(editingPermissions)));
        // Recarregar usuários para atualizar contadores
        loadUsuarios();
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

  const handleResetPermissions = () => {
    setEditingPermissions(JSON.parse(JSON.stringify(userPermissions)));
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    const user = usuarios.find(u => u.id === userId);
    setSelectedUser(user);
    setIsSelectOpen(false);
    
    if (userId) {
      loadUserPermissions(userId);
    } else {
      setUserPermissions({});
      setEditingPermissions({});
    }
  };

  const handlePermissionChange = (tela, permission, value) => {
    setEditingPermissions(prev => ({
      ...prev,
      [tela]: {
        ...prev[tela],
        [permission]: value
      }
    }));
  };

  const handleExpandGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Funções utilitárias
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusLabel = (status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  };

  const getTelaLabel = (tela) => {
    const labels = {
      usuarios: 'Usuários',
      fornecedores: 'Fornecedores',
      clientes: 'Clientes',
      filiais: 'Filiais',
      rotas: 'Rotas',
      produtos: 'Produtos',
      grupos: 'Grupos',
      subgrupos: 'Subgrupos',
      classes: 'Classes',
      nome_generico_produto: 'Nome Genérico',
      unidades: 'Unidades',
      unidades_escolares: 'Unidades Escolares',
      marcas: 'Marcas',
      veiculos: 'Veículos',
      motoristas: 'Motoristas',
      ajudantes: 'Ajudantes',
      cotacao: 'Cotação',
      permissoes: 'Permissões'
    };
    return labels[tela] || tela;
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      pode_visualizar: 'Visualizar',
      pode_criar: 'Criar',
      pode_editar: 'Editar',
      pode_excluir: 'Excluir'
    };
    return labels[permission] || permission;
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
    searchTerm,
    isSelectOpen,
    expandedGroups,
    estatisticas,

    // Funções CRUD
    handleSavePermissions,
    handleResetPermissions,
    handleSelectUser,
    handlePermissionChange,
    handleExpandGroup,

    // Funções de filtros
    setSearchTerm,
    setIsSelectOpen,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getTelaLabel,
    getPermissionLabel
  };
};
