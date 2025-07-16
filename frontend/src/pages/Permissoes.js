import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaEye, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaUserCog } from 'react-icons/fa';
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
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [editingPermissions, setEditingPermissions] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
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

  const handleUserSelect = (userId) => {
    const user = usuarios.find(u => u.id === parseInt(userId));
    setSelectedUserId(userId);
    setSelectedUser(user);
    if (userId) {
      loadUserPermissions(userId);
    } else {
      setUserPermissions({});
      setEditingPermissions({});
    }
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
            <UserSelect
              value={selectedUserId}
              onChange={(e) => handleUserSelect(e.target.value)}
            >
              <option value="">Selecione um usuário</option>
              {usuarios.map(user => (
                <option key={user.id} value={user.id}>
                  {user.nome} - {getAccessTypeLabel(user.tipo_de_acesso)} ({getAccessLevelLabel(user.nivel_de_acesso)})
                </option>
              ))}
            </UserSelect>

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
            </ButtonGroup>
          )}
        </div>
      )}
    </Container>
  );
};

export default Permissoes; 