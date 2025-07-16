import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaEye, FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
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

const UserCard = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  color: var(--dark-gray);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const UserEmail = styled.p`
  color: var(--gray);
  font-size: 14px;
  margin: 0 0 8px 0;
`;

const UserAccess = styled.div`
  display: flex;
  gap: 16px;
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

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PermissionCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
`;

const PermissionTitle = styled.h4`
  color: var(--dark-gray);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: capitalize;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--dark-gray);
  cursor: pointer;
  padding: 4px 0;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--primary-green);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
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
  }

  &.secondary {
    background: var(--light-gray);
    color: var(--dark-gray);

    &:hover {
      background: #d0d0d0;
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

const Permissoes = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    loadUserPermissions(user.id);
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

  const getAccessTypeColor = (type) => {
    switch (type) {
      case 'administrador': return 'var(--error-red)';
      case 'coordenador': return 'var(--orange)';
      case 'gerente': return 'var(--blue)';
      case 'supervisor': return 'var(--success-green)';
      case 'administrativo': return 'var(--gray)';
      default: return 'var(--gray)';
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
      case 'I': return 'Nível I - Básico';
      case 'II': return 'Nível II - Intermediário';
      case 'III': return 'Nível III - Avançado';
      default: return level;
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
          {usuarios.map(user => (
            <UserCard key={user.id}>
              <UserInfo>
                <UserDetails>
                  <UserName>{user.nome}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                  <UserAccess>
                    <AccessBadge type={user.tipo_de_acesso}>
                      {getAccessTypeLabel(user.tipo_de_acesso)}
                    </AccessBadge>
                    <AccessBadge type="nivel">
                      {getAccessLevelLabel(user.nivel_de_acesso)}
                    </AccessBadge>
                  </UserAccess>
                </UserDetails>
                <Button
                  className={selectedUser?.id === user.id ? 'primary' : 'secondary'}
                  onClick={() => handleUserSelect(user)}
                >
                  {selectedUser?.id === user.id ? <FaEdit /> : <FaEye />}
                  {selectedUser?.id === user.id ? 'Editando' : 'Gerenciar'}
                </Button>
              </UserInfo>

              {selectedUser?.id === user.id && userPermissions.permissoes && (
                <div>
                  <PermissionsGrid>
                    {userPermissions.permissoes.map(perm => (
                      <PermissionCard key={perm.tela}>
                        <PermissionTitle>
                          {perm.tela === 'usuarios' ? 'Usuários' :
                           perm.tela === 'fornecedores' ? 'Fornecedores' :
                           perm.tela === 'produtos' ? 'Produtos' :
                           perm.tela === 'grupos' ? 'Grupos' :
                           perm.tela === 'subgrupos' ? 'Subgrupos' :
                           perm.tela === 'unidades' ? 'Unidades' :
                           perm.tela === 'permissoes' ? 'Permissões' : perm.tela}
                        </PermissionTitle>
                        <CheckboxGrid>
                          <CheckboxItem>
                            <input
                              type="checkbox"
                              checked={editingPermissions[perm.tela]?.pode_visualizar || false}
                              onChange={(e) => handlePermissionChange(perm.tela, 'pode_visualizar', e.target.checked)}
                            />
                            Visualizar
                          </CheckboxItem>
                          <CheckboxItem>
                            <input
                              type="checkbox"
                              checked={editingPermissions[perm.tela]?.pode_criar || false}
                              onChange={(e) => handlePermissionChange(perm.tela, 'pode_criar', e.target.checked)}
                            />
                            Criar
                          </CheckboxItem>
                          <CheckboxItem>
                            <input
                              type="checkbox"
                              checked={editingPermissions[perm.tela]?.pode_editar || false}
                              onChange={(e) => handlePermissionChange(perm.tela, 'pode_editar', e.target.checked)}
                            />
                            Editar
                          </CheckboxItem>
                          <CheckboxItem>
                            <input
                              type="checkbox"
                              checked={editingPermissions[perm.tela]?.pode_excluir || false}
                              onChange={(e) => handlePermissionChange(perm.tela, 'pode_excluir', e.target.checked)}
                            />
                            Excluir
                          </CheckboxItem>
                        </CheckboxGrid>
                      </PermissionCard>
                    ))}
                  </PermissionsGrid>

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
                </div>
              )}
            </UserCard>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Permissoes; 