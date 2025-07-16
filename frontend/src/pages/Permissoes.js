import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaEye, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaUserCog, FaSearch, FaSync, FaChevronDown } from 'react-icons/fa';
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

  useEffect(() => {
    loadUsuarios();
  }, []);

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
    </Container>
  );
};

export default Permissoes; 