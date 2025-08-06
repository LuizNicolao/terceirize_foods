import React, { useState, useEffect } from 'react';
import { FaUsers, FaEye, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaUserCog, FaSearch, FaSync, FaChevronDown, FaQuestionCircle, FaFileExcel, FaFilePdf, FaUserShield, FaCheckCircle, FaTimesCircle, FaCog, FaBuilding, FaTruck, FaBox, FaFolder, FaFolderOpen, FaTags, FaTag, FaRuler, FaSchool, FaList, FaHandsHelping, FaCar, FaRoute, FaUserFriends } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Button, Input, Modal, StatCard } from '../components/ui';
import PermissoesService from '../services/permissoes';

const Permissoes = () => {
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
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    dataInicio: '',
    dataFim: '',
    acao: '',
    usuario_id: '',
    periodo: ''
  });
  const [expandedGroups, setExpandedGroups] = useState({});
  const [estatisticas, setEstatisticas] = useState({
    total_usuarios: 0,
    usuarios_com_permissoes: 0,
    usuarios_sem_permissoes: 0
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
        const total = data.length;
        const comPermissoes = data.filter(u => u.permissoes_count > 0).length;
        const semPermissoes = total - comPermissoes;
        
        setEstatisticas({
          total_usuarios: total,
          usuarios_com_permissoes: comPermissoes,
          usuarios_sem_permissoes: semPermissoes
        });
      } else {
        toast.error(result.error || 'Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Carregar permissões de um usuário
  const loadUserPermissions = async (userId) => {
    try {
      const result = await PermissoesService.buscarPermissoesUsuario(userId);
      
      if (result.success) {
        const permissoes = Array.isArray(result.data) ? result.data : [];
        const permissoesObj = {};
        
        permissoes.forEach(perm => {
          if (!permissoesObj[perm.tela]) {
            permissoesObj[perm.tela] = {};
          }
          permissoesObj[perm.tela][perm.acao] = perm.valor;
        });
        
        setUserPermissions(permissoesObj);
        setEditingPermissions(JSON.parse(JSON.stringify(permissoesObj)));
      } else {
        toast.error(result.error || 'Erro ao carregar permissões');
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      toast.error('Erro ao carregar permissões');
    }
  };

  // Recarregar permissões
  const reloadUserPermissions = async () => {
    if (selectedUserId) {
      await loadUserPermissions(selectedUserId);
    }
  };

  // Selecionar usuário
  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    const user = usuarios.find(u => u.id === userId);
    setSelectedUser(user);
    setIsSelectOpen(false);
    setSearchTerm('');
    
    if (userId) {
      loadUserPermissions(userId);
    } else {
      setUserPermissions({});
      setEditingPermissions({});
    }
  };

  // Handlers do seletor de usuário
  const handleSelectClick = () => {
    setIsSelectOpen(!isSelectOpen);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term) {
      const filtered = usuarios.filter(user => 
        user.nome.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsuarios(filtered);
    } else {
      setFilteredUsuarios(usuarios);
    }
  };

  const handleSelectBlur = () => {
    setTimeout(() => setIsSelectOpen(false), 200);
  };

  // Alterar permissão
  const handlePermissionChange = (tela, acao, value) => {
    setEditingPermissions(prev => ({
      ...prev,
      [tela]: {
        ...prev[tela],
        [acao]: value
      }
    }));
  };

  // Salvar permissões
  const handleSavePermissions = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um usuário primeiro');
      return;
    }

    try {
      setSaving(true);
      
      // Converter para formato esperado pelo backend
      const permissoesArray = [];
      Object.keys(editingPermissions).forEach(tela => {
        Object.keys(editingPermissions[tela]).forEach(acao => {
          permissoesArray.push({
            tela,
            acao,
            valor: editingPermissions[tela][acao]
          });
        });
      });

      const result = await PermissoesService.salvarPermissoes(selectedUserId, permissoesArray);
      
      if (result.success) {
        toast.success('Permissões salvas com sucesso!');
        setUserPermissions(JSON.parse(JSON.stringify(editingPermissions)));
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

  // Resetar permissões
  const handleResetPermissions = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um usuário primeiro');
      return;
    }

    if (!window.confirm('Tem certeza que deseja resetar todas as permissões deste usuário?')) {
      return;
    }

    try {
      setSaving(true);
      const result = await PermissoesService.resetarPermissoes(selectedUserId);
      
      if (result.success) {
        toast.success('Permissões resetadas com sucesso!');
        setEditingPermissions({});
        setUserPermissions({});
      } else {
        toast.error(result.error || 'Erro ao resetar permissões');
      }
    } catch (error) {
      console.error('Erro ao resetar permissões:', error);
      toast.error('Erro ao resetar permissões');
    } finally {
      setSaving(false);
    }
  };

  // Sincronizar permissões
  const handleSyncPermissions = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um usuário primeiro');
      return;
    }

    try {
      setSaving(true);
      const result = await PermissoesService.sincronizarPermissoes(selectedUserId);
      
      if (result.success) {
        toast.success('Permissões sincronizadas com sucesso!');
        await loadUserPermissions(selectedUserId);
      } else {
        toast.error(result.error || 'Erro ao sincronizar permissões');
      }
    } catch (error) {
      console.error('Erro ao sincronizar permissões:', error);
      toast.error('Erro ao sincronizar permissões');
    } finally {
      setSaving(false);
    }
  };

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = {
        entity: 'permissoes',
        ...auditFilters
      };

      const response = await fetch('/api/audit?' + new URLSearchParams(params));
      const data = await response.json();

      if (data.success) {
        setAuditLogs(data.data || []);
      } else {
        toast.error('Erro ao carregar logs de auditoria');
      }
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  // Handlers de auditoria
  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    loadAuditLogs();
  };

  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
    setAuditLogs([]);
    setAuditFilters({
      dataInicio: '',
      dataFim: '',
      acao: '',
      usuario_id: '',
      periodo: ''
    });
  };

  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action) => {
    const labels = {
      create: 'Criar',
      update: 'Editar',
      delete: 'Excluir'
    };
    return labels[action] || action;
  };

  const getFieldLabel = (field) => {
    const labels = {
      tela: 'Tela',
      acao: 'Ação',
      valor: 'Valor'
    };
    return labels[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined) return '-';
    
    if (field === 'valor') {
      return value === 1 ? 'Sim' : 'Não';
    }
    
    return value.toString();
  };

  const handleExportXLSX = async () => {
    try {
      const params = {
        usuario_id: selectedUserId,
        ...auditFilters
      };

      const result = await PermissoesService.exportarXLSX(params);
      if (result.success) {
        const blob = result.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `permissoes_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar relatório');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = {
        usuario_id: selectedUserId,
        ...auditFilters
      };

      const result = await PermissoesService.exportarPDF(params);
      if (result.success) {
        const blob = result.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `permissoes_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar relatório');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Funções auxiliares
  const getAccessTypeLabel = (type) => {
    const labels = {
      'pode_visualizar': 'Visualizar',
      'pode_criar': 'Criar',
      'pode_editar': 'Editar',
      'pode_excluir': 'Excluir'
    };
    return labels[type] || type;
  };

  const getAccessLevelLabel = (level) => {
    return level === 1 ? 'Sim' : 'Não';
  };

  const getScreenLabel = (screen) => {
    const labels = {
      'usuarios': 'Usuários',
      'filiais': 'Filiais',
      'fornecedores': 'Fornecedores',
      'clientes': 'Clientes',
      'produtos': 'Produtos',
      'grupos': 'Grupos',
      'subgrupos': 'Subgrupos',
      'classes': 'Classes',
      'marcas': 'Marcas',
      'unidades': 'Unidades',
      'unidades_escolares': 'Unidades Escolares',
      'nome_generico_produto': 'Nomes Genéricos',
      'motoristas': 'Motoristas',
      'ajudantes': 'Ajudantes',
      'veiculos': 'Veículos',
      'rotas': 'Rotas',
      'permissoes': 'Permissões'
    };
    return labels[screen] || screen;
  };

  const getScreenIcon = (screen) => {
    const icons = {
      'usuarios': FaUsers,
      'filiais': FaBuilding,
      'fornecedores': FaTruck,
      'clientes': FaUsers,
      'produtos': FaBox,
      'grupos': FaFolder,
      'subgrupos': FaFolderOpen,
      'classes': FaTags,
      'marcas': FaTag,
      'unidades': FaRuler,
      'unidades_escolares': FaSchool,
      'nome_generico_produto': FaList,
      'motoristas': FaUserTie,
      'ajudantes': FaHandsHelping,
      'veiculos': FaCar,
      'rotas': FaRoute,
      'permissoes': FaUserShield
    };
    return icons[screen] || FaCog;
  };

  const toggleGroup = (groupTitle) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  const expandAllGroups = () => {
    const allGroups = ['Cadastros', 'Operacional', 'Administrativo'];
    const expanded = {};
    allGroups.forEach(group => {
      expanded[group] = true;
    });
    setExpandedGroups(expanded);
  };

  const collapseAllGroups = () => {
    setExpandedGroups({});
  };

  // Agrupar telas
  const screenGroups = {
    'Cadastros': ['usuarios', 'filiais', 'fornecedores', 'clientes', 'produtos', 'grupos', 'subgrupos', 'classes', 'marcas', 'unidades', 'unidades_escolares', 'nome_generico_produto'],
    'Operacional': ['motoristas', 'ajudantes', 'veiculos', 'rotas'],
    'Administrativo': ['permissoes']
  };

  // Effects
  useEffect(() => {
    loadUsuarios();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gerenciar Permissões</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard
          title="Total de Usuários"
          value={estatisticas.total_usuarios}
          icon={FaUsers}
          color="blue"
        />
        <StatCard
          title="Com Permissões"
          value={estatisticas.usuarios_com_permissoes}
          icon={FaCheckCircle}
          color="green"
        />
        <StatCard
          title="Sem Permissões"
          value={estatisticas.usuarios_sem_permissoes}
          icon={FaTimesCircle}
          color="red"
        />
      </div>

      {/* Seletor de Usuário */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Selecionar Usuário</h2>
        
        <div className="relative">
          <div
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center"
            onClick={handleSelectClick}
            onBlur={handleSelectBlur}
          >
            <span className={selectedUser ? 'text-gray-900' : 'text-gray-500'}>
              {selectedUser ? `${selectedUser.nome} (${selectedUser.email})` : 'Selecione um usuário...'}
            </span>
            <FaChevronDown className={`text-gray-500 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
          </div>

          {isSelectOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-200">
                <Input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full"
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {filteredUsuarios.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    Nenhum usuário encontrado
                  </div>
                ) : (
                  filteredUsuarios.map(user => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <div className="font-medium text-gray-900">{user.nome}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permissões do Usuário */}
      {selectedUser && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Permissões de {selectedUser.nome}
              </h2>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                onClick={reloadUserPermissions}
                variant="outline"
                size="sm"
                disabled={saving}
              >
                <FaSync className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Recarregar</span>
                <span className="sm:hidden">Recarregar</span>
              </Button>
              
              <Button
                onClick={expandAllGroups}
                variant="outline"
                size="sm"
              >
                <span className="hidden sm:inline">Expandir Tudo</span>
                <span className="sm:hidden">Expandir</span>
              </Button>
              
              <Button
                onClick={collapseAllGroups}
                variant="outline"
                size="sm"
              >
                <span className="hidden sm:inline">Recolher Tudo</span>
                <span className="sm:hidden">Recolher</span>
              </Button>
            </div>
          </div>

          {/* Grupos de Permissões */}
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(screenGroups).map(([groupTitle, screens]) => (
              <div key={groupTitle} className="border border-gray-200 rounded-lg">
                <div
                  className="p-3 sm:p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleGroup(groupTitle)}
                >
                  <h3 className="font-semibold text-gray-800">{groupTitle}</h3>
                  <FaChevronDown className={`text-gray-500 transition-transform ${expandedGroups[groupTitle] ? 'rotate-180' : ''}`} />
                </div>
                
                {expandedGroups[groupTitle] && (
                  <div className="p-3 sm:p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {screens.map(screen => {
                        const ScreenIcon = getScreenIcon(screen);
                        const screenLabel = getScreenLabel(screen);
                        
                        return (
                          <div key={screen} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center mb-3">
                              <ScreenIcon className="text-blue-600 mr-2" />
                              <h4 className="font-medium text-gray-800">{screenLabel}</h4>
                            </div>
                            
                            <div className="space-y-2">
                              {['pode_visualizar', 'pode_criar', 'pode_editar', 'pode_excluir'].map(acao => (
                                <div key={acao} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    {getAccessTypeLabel(acao)}
                                  </span>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={editingPermissions[screen]?.[acao] === 1}
                                      onChange={(e) => handlePermissionChange(screen, acao, e.target.checked ? 1 : 0)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSavePermissions}
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              <FaSave className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Salvar Permissões</span>
              <span className="sm:hidden">Salvar</span>
            </Button>
            
            <Button
              onClick={handleResetPermissions}
              variant="outline"
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              <FaTimes className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Resetar Permissões</span>
              <span className="sm:hidden">Resetar</span>
            </Button>
            
            <Button
              onClick={handleSyncPermissions}
              variant="outline"
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              <FaSync className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sincronizar</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal
          isOpen={showAuditModal}
          onClose={handleCloseAuditModal}
          title="Relatório de Auditoria - Permissões"
          size="full"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Filtros de Auditoria */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Filtros</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Input
                  label="Data Início"
                  type="date"
                  value={auditFilters.dataInicio}
                  onChange={(e) => setAuditFilters({...auditFilters, dataInicio: e.target.value})}
                />
                <Input
                  label="Data Fim"
                  type="date"
                  value={auditFilters.dataFim}
                  onChange={(e) => setAuditFilters({...auditFilters, dataFim: e.target.value})}
                />
                <Input
                  label="Ação"
                  type="select"
                  value={auditFilters.acao}
                  onChange={(e) => setAuditFilters({...auditFilters, acao: e.target.value})}
                >
                  <option value="">Todas as ações</option>
                  <option value="create">Criar</option>
                  <option value="update">Editar</option>
                  <option value="delete">Excluir</option>
                </Input>
                <Input
                  label="Período"
                  type="select"
                  value={auditFilters.periodo}
                  onChange={(e) => setAuditFilters({...auditFilters, periodo: e.target.value})}
                >
                  <option value="">Período personalizado</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                  <option value="todos">Todos os registros</option>
                </Input>
                <div className="flex items-end">
                  <Button onClick={handleApplyAuditFilters} size="sm" className="w-full">
                    <span className="hidden sm:inline">Aplicar Filtros</span>
                    <span className="sm:hidden">Aplicar</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Botões de Exportação */}
            <div className="flex gap-2 sm:gap-3">
              <Button onClick={handleExportXLSX} variant="outline" size="sm">
                <FaFileExcel className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <FaFilePdf className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>

            {/* Resultados da Auditoria */}
            <div className="max-h-64 sm:max-h-96 overflow-y-auto">
              {auditLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Carregando logs...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                  Nenhum log encontrado com os filtros aplicados
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {auditLogs.length} log(s) encontrado(s)
                  </div>
                  {auditLogs.map((log, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-3 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            log.acao === 'create' ? 'bg-green-100 text-green-800' : 
                            log.acao === 'update' ? 'bg-yellow-100 text-yellow-800' : 
                            log.acao === 'delete' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getActionLabel(log.acao)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600">
                            por {log.usuario_nome || 'Usuário desconhecido'}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      
                      {log.detalhes && (
                        <div className="text-xs sm:text-sm text-gray-800">
                          {log.detalhes.changes && (
                            <div className="mb-2 sm:mb-3">
                              <strong>Mudanças Realizadas:</strong>
                              <div className="mt-1 sm:mt-2 space-y-1 sm:space-y-2">
                                {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                  <div key={field} className="p-2 sm:p-3 bg-gray-50 rounded-lg border">
                                    <div className="font-semibold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm">
                                      {getFieldLabel(field)}:
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs">
                                      <span className="text-red-600">
                                        <strong>Antes:</strong> {formatFieldValue(field, change.from)}
                                      </span>
                                      <span className="text-gray-500 hidden sm:inline">→</span>
                                      <span className="text-green-600">
                                        <strong>Depois:</strong> {formatFieldValue(field, change.to)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.detalhes.requestBody && !log.detalhes.changes && (
                            <div>
                              <strong>Dados das Permissões:</strong>
                              <div className="mt-1 sm:mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                                {Object.entries(log.detalhes.requestBody).map(([field, value]) => (
                                  <div key={field} className="p-1.5 sm:p-2 bg-gray-50 rounded border text-xs">
                                    <div className="font-semibold text-gray-800 mb-0.5 sm:mb-1">
                                      {getFieldLabel(field)}:
                                    </div>
                                    <div className="text-green-600">
                                      {formatFieldValue(field, value)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.detalhes.resourceId && (
                            <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-blue-50 rounded border text-xs">
                              <strong>ID do Usuário:</strong> 
                              <span className="text-blue-600 ml-1">
                                #{log.detalhes.resourceId}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Permissoes; 