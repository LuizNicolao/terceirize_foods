import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import PermissoesService from '../services/permissoes';
import { usePermissions } from '../contexts/PermissionsContext';

export const usePermissoes = () => {
  // Contexto de permissões para recarregar
  const { reloadPermissions } = usePermissions();
  
  // Estados principais
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [editingPermissions, setEditingPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [nivelFilter, setNivelFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');

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
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
      setUsuarios([]);
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
  const filteredUsuariosData = useMemo(() => {
    const lista = Array.isArray(usuarios) ? usuarios : [];

    return lista
      .filter(usuario => {
        const termo = searchTerm.trim().toLowerCase();
        if (!termo) return true;

        const nomeMatch = usuario.nome && usuario.nome.toLowerCase().includes(termo);
        const emailMatch = usuario.email && usuario.email.toLowerCase().includes(termo);
        return nomeMatch || emailMatch;
      })
      .filter(usuario => {
        if (statusFilter === 'todos') return true;
        return (usuario.status || '').toLowerCase() === statusFilter.toLowerCase();
      })
      .filter(usuario => {
        if (nivelFilter === 'todos') return true;
        return (usuario.nivel_de_acesso || '').toString().toLowerCase() === nivelFilter.toLowerCase();
      })
      .filter(usuario => {
        if (tipoFilter === 'todos') return true;
        return (usuario.tipo_de_acesso || '').toLowerCase() === tipoFilter.toLowerCase();
      })
      .sort((a, b) => {
        const nomeA = (a.nome || '').toLowerCase();
        const nomeB = (b.nome || '').toLowerCase();
        return nomeA.localeCompare(nomeB);
      });
  }, [usuarios, searchTerm, statusFilter, nivelFilter, tipoFilter]);

  // Funções de CRUD
  const handleSavePermissions = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um usuário primeiro');
      return;
    }

    try {
      setSaving(true);
      
      // Lista de todas as telas disponíveis no sistema
      const todasAsTelas = [
        'usuarios',
        'fornecedores', 
        'filiais',
        'rotas_nutricionistas',
        'unidades_escolares',
        'produtos_origem',
        'unidades_medida',
        'grupos',
        'subgrupos',
        'classes',
        'produtos_per_capita',
        'tipo_atendimento_escola',
        'recebimentos_escolas',
        'registros_diarios',
        'necessidades',
        'calendario',
        'analise_necessidades',
        'analise_necessidades_substituicoes',
        'consulta_status_necessidade',
        'necessidades_padroes',
        'permissoes'
      ];
      
      // Converter para array incluindo TODAS as telas, mesmo as sem permissões
      const permissoesArray = todasAsTelas.map(tela => {
        const perms = editingPermissions[tela] || {
          pode_visualizar: false,
          pode_criar: false,
          pode_editar: false,
          pode_excluir: false,
          pode_movimentar: false
        };
        
        return {
          tela,
          pode_visualizar: perms.pode_visualizar ? 1 : 0,
          pode_criar: perms.pode_criar ? 1 : 0,
          pode_editar: perms.pode_editar ? 1 : 0,
          pode_excluir: perms.pode_excluir ? 1 : 0,
          pode_movimentar: perms.pode_movimentar ? 1 : 0
        };
      });


      const result = await PermissoesService.salvarPermissoes(selectedUserId, permissoesArray);
      
      if (result.success) {
        toast.success('Permissões salvas com sucesso!');
        setUserPermissions(JSON.parse(JSON.stringify(editingPermissions)));
        loadUsuarios(); // Recarregar para atualizar estatísticas
        reloadPermissions(); // Recarregar permissões do contexto
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
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleNivelFilterChange = (value) => {
    setNivelFilter(value);
  };

  const handleTipoFilterChange = (value) => {
    setTipoFilter(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setNivelFilter('todos');
    setTipoFilter('todos');
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
    searchTerm,
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
    handleStatusFilterChange,
    handleNivelFilterChange,
    handleTipoFilterChange,
    handleClearFilters,

    // Funções de estado
    setIsSelectOpen,
    setShowPermissionsModal,
    statusFilter,
    nivelFilter,
    tipoFilter,

    // Funções utilitárias
    formatDate,
    getStatusLabel
  };
};
