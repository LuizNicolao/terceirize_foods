import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaEye, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaUserCog, FaSearch, FaSync, FaChevronDown, FaQuestionCircle } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  color: var(--dark-gray);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const UserSelector = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const CustomSelect = styled.div`
  position: relative;
  width: 100%;
`;

const SelectInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);
  color: var(--dark-gray);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }

  &::placeholder {
    color: var(--gray);
  }
`;

const SelectIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  font-size: 12px;
  pointer-events: none;
  transition: transform 0.2s ease;

  ${props => props.isOpen && `
    transform: translateY(-50%) rotate(180deg);
  `}
`;

const SelectDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SelectOption = styled.div`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }

  ${props => props.isSelected && `
    background-color: var(--primary-green);
    color: white;
  `}
`;

const NoResults = styled.div`
  padding: 12px;
  text-align: center;
  color: var(--gray);
  font-size: 14px;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);
  color: var(--dark-gray);

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }

  &::placeholder {
    color: var(--gray);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  font-size: 14px;
`;

const UserSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);
  color: var(--dark-gray);

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }
`;

const PermissionsTable = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #f8f9fa;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
`;

const TableRow = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ScreenName = styled.div`
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
`;

const PermissionCell = styled.div`
  display: flex;
  justify-content: center;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: var(--primary-green);
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &.primary {
    background: var(--primary-green);
    color: var(--white);

    &:hover {
      background: var(--dark-green);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: var(--light-gray);
    color: var(--dark-gray);

    &:hover {
      background: #d0d0d0;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  &.danger {
    background: var(--error-red);
    color: var(--white);

    &:hover {
      background: #c82333;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--gray);
  font-size: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--gray);
  font-size: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-green);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  color: var(--dark-gray);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const UserEmail = styled.p`
  color: var(--gray);
  font-size: 14px;
  margin: 0;
`;

const AccessBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.type === 'administrador' ? 'var(--error-red)' : 
                props.type === 'coordenador' ? 'var(--orange)' :
                props.type === 'gerente' ? 'var(--blue)' :
                props.type === 'supervisor' ? 'var(--success-green)' : 'var(--gray)'};
  color: white;
`;

// Estilos do Modal de Auditoria
const AuditModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const AuditModalContent = styled.div`
  background: var(--white);
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const AuditModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
`;

const AuditModalTitle = styled.h2`
  color: var(--dark-gray);
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const AuditModalClose = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: var(--gray);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #e0e0e0;
    color: var(--dark-gray);
  }
`;

const AuditFiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
`;

const AuditFilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AuditFilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-gray);
`;

const AuditFilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: var(--white);
  color: var(--dark-gray);

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }
`;

const AuditFilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: var(--white);
  color: var(--dark-gray);

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }

  &:disabled {
    background: #f5f5f5;
    color: var(--gray);
    cursor: not-allowed;
  }
`;

const AuditFilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--primary-green);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: end;

  &:hover {
    background: var(--dark-green);
  }
`;

const AuditContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
`;

const AuditLoading = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--gray);
  font-size: 16px;
`;

const AuditEmpty = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--gray);
  font-size: 16px;
`;

const AuditLogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AuditLogCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const AuditLogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const AuditLogAction = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: ${props => {
    switch (props.action) {
      case 'create': return 'var(--success-green)';
      case 'update': return 'var(--blue)';
      case 'delete': return 'var(--error-red)';
      case 'login': return 'var(--orange)';
      case 'logout': return 'var(--gray)';
      default: return 'var(--gray)';
    }
  }};
`;

const AuditLogDate = styled.span`
  color: var(--gray);
  font-size: 14px;
`;

const AuditLogUser = styled.div`
  margin-bottom: 8px;
  color: var(--dark-gray);
  font-size: 14px;
`;

const AuditLogResource = styled.div`
  margin-bottom: 8px;
  color: var(--dark-gray);
  font-size: 14px;
`;

const AuditLogDetails = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
`;

const AuditLogDetailsTitle = styled.div`
  font-weight: 600;
  color: var(--dark-gray);
  margin-bottom: 8px;
  font-size: 14px;
`;

const AuditLogDetailsContent = styled.div`
  background: var(--white);
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
`;

const AuditChangesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AuditChangesTitle = styled.div`
  font-weight: 600;
  color: var(--dark-gray);
  margin-bottom: 8px;
  font-size: 14px;
`;

const AuditChangeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const AuditChangeField = styled.span`
  font-weight: 600;
  color: var(--dark-gray);
  min-width: 120px;
  font-size: 14px;
`;

const AuditChangeValues = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const AuditChangeValue = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.type === 'from' ? '#fff3cd' : '#d1ecf1'};
  color: ${props => props.type === 'from' ? '#856404' : '#0c5460'};
`;

const AuditChangeArrow = styled.span`
  color: var(--gray);
  font-weight: bold;
`;

const AuditLogText = styled.pre`
  margin: 0;
  font-size: 12px;
  color: var(--dark-gray);
  white-space: pre-wrap;
  word-break: break-word;
`;

const AuditLogIP = styled.div`
  margin-top: 8px;
  color: var(--gray);
  font-size: 12px;
`;

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

  useEffect(() => {
    loadUsuarios();
  }, []);

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      
      const params = new URLSearchParams();
      
      // Aplicar filtro de período se selecionado
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        // Usar filtros manuais se período não estiver selecionado
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para permissões
      params.append('recurso', 'permissoes');
      
      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  // Abrir modal de auditoria
  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    loadAuditLogs();
  };

  // Fechar modal de auditoria
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

  // Aplicar filtros de auditoria
  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Data não disponível';
    }
    
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Obter label da ação
  const getActionLabel = (action) => {
    if (!action || typeof action !== 'string') {
      return 'Desconhecida';
    }
    
    const actions = {
      'create': 'Criar',
      'update': 'Editar',
      'delete': 'Excluir',
      'login': 'Login',
      'logout': 'Logout',
      'view': 'Visualizar'
    };
    return actions[action] || action;
  };

  // Obter label do campo
  const getFieldLabel = (field) => {
    const labels = {
      'tela': 'Tela',
      'pode_visualizar': 'Visualizar',
      'pode_criar': 'Criar',
      'pode_editar': 'Editar',
      'pode_excluir': 'Excluir',
      'tipo_acesso': 'Tipo de Acesso',
      'nivel_acesso': 'Nível de Acesso',
      'id': 'ID'
    };
    return labels[field] || field;
  };

  // Formatar valor do campo
  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return 'Não informado';
    }

    switch (field) {
      case 'pode_visualizar':
      case 'pode_criar':
      case 'pode_editar':
      case 'pode_excluir':
        return value === 1 || value === true ? 'Sim' : 'Não';
      case 'tipo_acesso':
        return getAccessTypeLabel(value);
      case 'nivel_acesso':
        return getAccessLevelLabel(value);
      default:
        return value;
    }
  };

  // Removido recarregamento automático para melhorar a experiência do usuário
  // Os dados são carregados apenas uma vez ao montar o componente

  useEffect(() => {
    // Filtrar usuários baseado no termo de busca
    if (searchTerm.trim() === '') {
      setFilteredUsuarios(usuarios);
    } else {
      const filtered = usuarios.filter(user => 
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAccessTypeLabel(user.tipo_de_acesso).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAccessLevelLabel(user.nivel_de_acesso).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsuarios(filtered);
    }
  }, [searchTerm, usuarios]);

  // Detectar mudanças no usuário selecionado e recarregar permissões
  useEffect(() => {
    if (selectedUser && selectedUserId) {
      // Verificar se os dados do usuário mudaram (tipo ou nível de acesso)
      const currentUser = usuarios.find(u => u.id === selectedUser.id);
      
      if (currentUser && (
        currentUser.tipo_de_acesso !== selectedUser.tipo_de_acesso ||
        currentUser.nivel_de_acesso !== selectedUser.nivel_de_acesso
      )) {
        
        // Atualizar o usuário selecionado com os novos dados
        setSelectedUser(currentUser);
        // Recarregar permissões com os novos dados
        loadUserPermissions(selectedUserId);
        toast.success('Dados do usuário atualizados! As permissões foram recarregadas.');
      }
    }
  }, [usuarios, selectedUser, selectedUserId]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
      setFilteredUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId) => {
    try {
      const response = await api.get(`/permissoes/usuario/${userId}`);
      setUserPermissions(response.data);
      setEditingPermissions({});
      
      // Inicializar permissões de edição
      const initialPermissions = {};
      response.data.permissoes.forEach(perm => {
        initialPermissions[perm.tela] = {
          pode_visualizar: perm.pode_visualizar === 1,
          pode_criar: perm.pode_criar === 1,
          pode_editar: perm.pode_editar === 1,
          pode_excluir: perm.pode_excluir === 1
        };
      });
      setEditingPermissions(initialPermissions);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      toast.error('Erro ao carregar permissões do usuário');
    }
  };

  const reloadUserPermissions = async () => {
    if (selectedUserId) {
      await loadUserPermissions(selectedUserId);
    }
  };

  const handleUserSelect = (userId) => {
    const user = usuarios.find(u => u.id === parseInt(userId));
    setSelectedUserId(userId);
    setSelectedUser(user);
    setSearchTerm(user ? `${user.nome} - ${getAccessTypeLabel(user.tipo_de_acesso)} (${getAccessLevelLabel(user.nivel_de_acesso)})` : '');
    setIsSelectOpen(false);
    if (userId) {
      // Sempre recarregar permissões para garantir dados atualizados
      loadUserPermissions(userId);
    } else {
      setUserPermissions({});
      setEditingPermissions({});
    }
  };

  const handleSelectClick = () => {
    setIsSelectOpen(!isSelectOpen);
    if (!isSelectOpen) {
      setSearchTerm('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsSelectOpen(true);
  };

  const handleSelectBlur = () => {
    // Pequeno delay para permitir cliques nas opções
    setTimeout(() => {
      setIsSelectOpen(false);
    }, 200);
  };

  const handlePermissionChange = (tela, acao, value) => {
    setEditingPermissions(prev => ({
      ...prev,
      [tela]: {
        ...prev[tela],
        [acao]: value
      }
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      
      const permissoesArray = Object.keys(editingPermissions).map(tela => ({
        tela,
        ...editingPermissions[tela]
      }));

      await api.put(`/permissoes/usuario/${selectedUser.id}`, {
        permissoes: permissoesArray
      });

      toast.success('Permissões atualizadas com sucesso!');
      loadUserPermissions(selectedUser.id);
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = async () => {
    try {
      setSaving(true);
      
      // Buscar permissões padrão baseadas no tipo e nível do usuário
      const response = await api.get(`/permissoes/padrao/${selectedUser.tipo_de_acesso}/${selectedUser.nivel_de_acesso}`);
      
      const permissoesArray = response.data.permissoes.map(perm => ({
        tela: perm.tela,
        pode_visualizar: perm.pode_visualizar === 1,
        pode_criar: perm.pode_criar === 1,
        pode_editar: perm.pode_editar === 1,
        pode_excluir: perm.pode_excluir === 1
      }));

      await api.put(`/permissoes/usuario/${selectedUser.id}`, {
        permissoes: permissoesArray
      });

      toast.success('Permissões resetadas para padrão!');
      loadUserPermissions(selectedUser.id);
    } catch (error) {
      console.error('Erro ao resetar permissões:', error);
      toast.error('Erro ao resetar permissões');
    } finally {
      setSaving(false);
    }
  };

  const getAccessTypeLabel = (type) => {
    switch (type) {
      case 'administrador': return 'Administrador';
      case 'coordenador': return 'Coordenador';
      case 'gerente': return 'Gerente';
      case 'supervisor': return 'Supervisor';
      case 'administrativo': return 'Administrativo';
      default: return type;
    }
  };

  const getAccessLevelLabel = (level) => {
    switch (level) {
      case 'I': return 'Nível I';
      case 'II': return 'Nível II';
      case 'III': return 'Nível III';
      default: return level;
    }
  };

  const getScreenLabel = (screen) => {
    switch (screen) {
      case 'usuarios': return 'Usuários';
      case 'fornecedores': return 'Fornecedores';
      case 'produtos': return 'Produtos';
      case 'grupos': return 'Grupos';
      case 'subgrupos': return 'Subgrupos';
      case 'unidades': return 'Unidades';
      case 'permissoes': return 'Permissões';
      default: return screen;
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Carregando usuários...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gerenciar Permissões</Title>
        <Button
          className="primary"
          onClick={handleOpenAuditModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaQuestionCircle />
          Auditoria
        </Button>
      </Header>

      {usuarios.length === 0 ? (
        <EmptyState>Nenhum usuário encontrado</EmptyState>
      ) : (
        <div>
          <UserSelector>
            <SelectContainer>
              <CustomSelect>
                <SelectInput
                  type="text"
                  placeholder="Buscar e selecionar usuário..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSelectOpen(true)}
                  onBlur={handleSelectBlur}
                  onClick={handleSelectClick}
                />
                <SelectIcon isOpen={isSelectOpen}>
                  <FaChevronDown />
                </SelectIcon>
                
                {isSelectOpen && (
                  <SelectDropdown>
                    {filteredUsuarios.length > 0 ? (
                      filteredUsuarios.map(user => (
                        <SelectOption
                          key={user.id}
                          isSelected={selectedUserId === user.id.toString()}
                          onClick={() => handleUserSelect(user.id.toString())}
                        >
                          {user.nome} - {getAccessTypeLabel(user.tipo_de_acesso)} ({getAccessLevelLabel(user.nivel_de_acesso)})
                        </SelectOption>
                      ))
                    ) : (
                      <NoResults>
                        {searchTerm.trim() !== '' 
                          ? `Nenhum usuário encontrado para "${searchTerm}"`
                          : 'Nenhum usuário disponível'
                        }
                      </NoResults>
                    )}
                  </SelectDropdown>
                )}
              </CustomSelect>
            </SelectContainer>

            {selectedUser && (
              <UserInfo>
                <UserAvatar>
                  {selectedUser.nome.charAt(0).toUpperCase()}
                </UserAvatar>
                <UserDetails>
                  <UserName>{selectedUser.nome}</UserName>
                  <UserEmail>{selectedUser.email}</UserEmail>
                </UserDetails>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <AccessBadge type={selectedUser.tipo_de_acesso}>
                    {getAccessTypeLabel(selectedUser.tipo_de_acesso)}
                  </AccessBadge>
                  <AccessBadge type="nivel">
                    {getAccessLevelLabel(selectedUser.nivel_de_acesso)}
                  </AccessBadge>
                </div>
              </UserInfo>
            )}
          </UserSelector>

          {selectedUser && userPermissions.permissoes && (
            <PermissionsTable>
              <TableHeader>
                <div>Tela</div>
                <div style={{ textAlign: 'center' }}>Visualizar</div>
                <div style={{ textAlign: 'center' }}>Criar</div>
                <div style={{ textAlign: 'center' }}>Editar</div>
                <div style={{ textAlign: 'center' }}>Excluir</div>
              </TableHeader>

              {userPermissions.permissoes.map(perm => (
                <TableRow key={perm.tela}>
                  <ScreenName>{getScreenLabel(perm.tela)}</ScreenName>
                  <PermissionCell>
                    <Checkbox
                      type="checkbox"
                      checked={editingPermissions[perm.tela]?.pode_visualizar || false}
                      onChange={(e) => handlePermissionChange(perm.tela, 'pode_visualizar', e.target.checked)}
                    />
                  </PermissionCell>
                  <PermissionCell>
                    <Checkbox
                      type="checkbox"
                      checked={editingPermissions[perm.tela]?.pode_criar || false}
                      onChange={(e) => handlePermissionChange(perm.tela, 'pode_criar', e.target.checked)}
                    />
                  </PermissionCell>
                  <PermissionCell>
                    <Checkbox
                      type="checkbox"
                      checked={editingPermissions[perm.tela]?.pode_editar || false}
                      onChange={(e) => handlePermissionChange(perm.tela, 'pode_editar', e.target.checked)}
                    />
                  </PermissionCell>
                  <PermissionCell>
                    <Checkbox
                      type="checkbox"
                      checked={editingPermissions[perm.tela]?.pode_excluir || false}
                      onChange={(e) => handlePermissionChange(perm.tela, 'pode_excluir', e.target.checked)}
                    />
                  </PermissionCell>
                </TableRow>
              ))}
            </PermissionsTable>
          )}

          {selectedUser && userPermissions.permissoes && (
            <ButtonGroup>
              <Button
                className="primary"
                onClick={handleSavePermissions}
                disabled={saving}
              >
                <FaSave />
                {saving ? 'Salvando...' : 'Salvar Permissões'}
              </Button>
              <Button
                className="secondary"
                onClick={handleResetPermissions}
                disabled={saving}
              >
                <FaTimes />
                Resetar para Padrão
              </Button>
              <Button
                className="secondary"
                onClick={reloadUserPermissions}
                disabled={loading}
              >
                <FaSync />
                Recarregar Permissões
              </Button>
            </ButtonGroup>
          )}
        </div>
      )}

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <AuditModal>
          <AuditModalContent>
            <AuditModalHeader>
              <AuditModalTitle>Auditoria de Permissões</AuditModalTitle>
              <AuditModalClose onClick={handleCloseAuditModal}>
                <FaTimes />
              </AuditModalClose>
            </AuditModalHeader>

            <AuditFiltersContainer>
              <AuditFilterGroup>
                <AuditFilterLabel>Período:</AuditFilterLabel>
                <AuditFilterSelect
                  value={auditFilters.periodo}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, periodo: e.target.value }))}
                >
                  <option value="">Selecionar período</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                  <option value="todos">Todos</option>
                </AuditFilterSelect>
              </AuditFilterGroup>

              <AuditFilterGroup>
                <AuditFilterLabel>Data Início:</AuditFilterLabel>
                <AuditFilterInput
                  type="date"
                  value={auditFilters.dataInicio}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                  disabled={auditFilters.periodo !== ''}
                />
              </AuditFilterGroup>

              <AuditFilterGroup>
                <AuditFilterLabel>Data Fim:</AuditFilterLabel>
                <AuditFilterInput
                  type="date"
                  value={auditFilters.dataFim}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                  disabled={auditFilters.periodo !== ''}
                />
              </AuditFilterGroup>

              <AuditFilterGroup>
                <AuditFilterLabel>Ação:</AuditFilterLabel>
                <AuditFilterSelect
                  value={auditFilters.acao}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, acao: e.target.value }))}
                >
                  <option value="">Todas as ações</option>
                  <option value="create">Criar</option>
                  <option value="update">Editar</option>
                  <option value="delete">Excluir</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="view">Visualizar</option>
                </AuditFilterSelect>
              </AuditFilterGroup>

              <AuditFilterGroup>
                <AuditFilterLabel>Usuário:</AuditFilterLabel>
                <AuditFilterSelect
                  value={auditFilters.usuario_id}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, usuario_id: e.target.value }))}
                >
                  <option value="">Todos os usuários</option>
                  {usuarios.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nome} ({user.email})
                    </option>
                  ))}
                </AuditFilterSelect>
              </AuditFilterGroup>

              <AuditFilterButton onClick={handleApplyAuditFilters}>
                <FaSearch />
                Filtrar
              </AuditFilterButton>
            </AuditFiltersContainer>

            <AuditContent>
              {auditLoading ? (
                <AuditLoading>Carregando logs de auditoria...</AuditLoading>
              ) : auditLogs.length === 0 ? (
                <AuditEmpty>Nenhum log de auditoria encontrado</AuditEmpty>
              ) : (
                <AuditLogsContainer>
                  {auditLogs.map((log, index) => (
                    <AuditLogCard key={index}>
                      <AuditLogHeader>
                        <AuditLogAction action={log.acao}>
                          {getActionLabel(log.acao)}
                        </AuditLogAction>
                        <AuditLogDate>{formatDate(log.data_hora)}</AuditLogDate>
                      </AuditLogHeader>
                      
                      <AuditLogUser>
                        <strong>Usuário:</strong> {log.nome_usuario || 'Usuário não encontrado'}
                      </AuditLogUser>
                      
                      <AuditLogResource>
                        <strong>Recurso:</strong> {log.recurso || 'Permissões'}
                      </AuditLogResource>
                      
                      {log.detalhes && (
                        <AuditLogDetails>
                          <AuditLogDetailsTitle>Detalhes:</AuditLogDetailsTitle>
                          <AuditLogDetailsContent>
                            {log.detalhes.changes && Object.keys(log.detalhes.changes).length > 0 ? (
                              <AuditChangesContainer>
                                <AuditChangesTitle>Mudanças Realizadas:</AuditChangesTitle>
                                {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                  <AuditChangeItem key={field}>
                                    <AuditChangeField>{getFieldLabel(field)}:</AuditChangeField>
                                    <AuditChangeValues>
                                      <AuditChangeValue type="from">
                                        {formatFieldValue(field, change.from)}
                                      </AuditChangeValue>
                                      <AuditChangeArrow>→</AuditChangeArrow>
                                      <AuditChangeValue type="to">
                                        {formatFieldValue(field, change.to)}
                                      </AuditChangeValue>
                                    </AuditChangeValues>
                                  </AuditChangeItem>
                                ))}
                              </AuditChangesContainer>
                            ) : (
                              <AuditLogText>
                                {typeof log.detalhes === 'object' 
                                  ? JSON.stringify(log.detalhes, null, 2)
                                  : log.detalhes
                                }
                              </AuditLogText>
                            )}
                          </AuditLogDetailsContent>
                        </AuditLogDetails>
                      )}
                      
                      {log.ip && (
                        <AuditLogIP>
                          <strong>IP:</strong> {log.ip}
                        </AuditLogIP>
                      )}
                    </AuditLogCard>
                  ))}
                </AuditLogsContainer>
              )}
            </AuditContent>
          </AuditModalContent>
        </AuditModal>
      )}
    </Container>
  );
};

export default Permissoes; 