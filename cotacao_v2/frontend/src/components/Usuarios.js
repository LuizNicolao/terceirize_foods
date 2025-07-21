import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import PermissionGuard from './PermissionGuard';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaEye,
  FaQuestionCircle
} from 'react-icons/fa';
import { colors, typography, shadows } from '../design-system';
import { Button, Card } from '../design-system/components';

// Componentes estilizados
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
  color: ${colors.neutral.darkGray};
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const AddButton = styled(Button)`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: translateY(-1px);
  }
`;

const AuditButton = styled(Button)`
  background: ${colors.secondary.blue};
  color: ${colors.neutral.white};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #1976D2;
    transform: translateY(-1px);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: ${colors.neutral.white};
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    outline: none;
  }
`;

const TableContainer = styled(Card)`
  background: ${colors.neutral.white};
  border-radius: 12px;
  box-shadow: ${shadows.md};
  overflow: hidden;
  padding: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: ${colors.neutral.lightGray};
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: ${colors.neutral.darkGray};
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.status === 'ativo' ? colors.status.success : '#ffebee'};
  color: ${props => props.status === 'ativo' ? colors.neutral.white : colors.status.error};
`;

const RoleBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${colors.secondary.blue};
  color: ${colors.neutral.white};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-right: 8px;
  color: ${colors.neutral.gray};

  &:hover {
    background-color: ${colors.neutral.lightGray};
  }

  &.edit {
    color: ${colors.secondary.blue};
  }

  &.delete {
    color: ${colors.status.error};
  }

  &.view {
    color: ${colors.primary.green};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.neutral.gray};
  font-size: 16px;
`;

const Usuarios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

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

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user) => {
    navigate(`/visualizar-usuario/${user.id}`);
  };

  const handleEdit = (user) => {
    navigate(`/editar-usuario/${user.id}`);
  };

  const handleCreate = () => {
    navigate('/editar-usuario/new');
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          fetchUsuarios();
          alert('Usuário excluído com sucesso!');
        } else {
          const errorData = await response.json();
          alert(`Erro ao excluir usuário: ${errorData.message || 'Erro desconhecido'}`);
        }
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao conectar com o servidor');
      }
    }
  };

  const getRoleLabel = (role) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getStatusLabel = (status) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  // Filtrar usuários baseado na busca e status
  const filteredUsuarios = usuarios.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout>
        <Container>
          <EmptyState>
            <div>Carregando usuários...</div>
          </EmptyState>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <EmptyState>
            <div>Erro ao carregar usuários: {error}</div>
            <Button onClick={fetchUsuarios} variant="primary" style={{ marginTop: '16px' }}>
              Tentar Novamente
            </Button>
          </EmptyState>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Usuários</Title>
          <div style={{ display: 'flex', gap: '12px' }}>
            <AuditButton>
              <FaQuestionCircle />
              Auditoria
            </AuditButton>
            <PermissionGuard screen="usuarios" action="can_create">
              <AddButton onClick={handleCreate}>
                <FaPlus />
                Adicionar Usuário
              </AddButton>
            </PermissionGuard>
          </div>
        </Header>

        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </FilterSelect>
        </SearchContainer>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Tipo</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <Td colSpan="5">
                    <EmptyState>
                      {searchTerm || statusFilter !== 'todos' 
                        ? 'Nenhum usuário encontrado com os filtros aplicados'
                        : 'Nenhum usuário cadastrado'
                      }
                    </EmptyState>
                  </Td>
                </tr>
              ) : (
                filteredUsuarios.map((user) => (
                  <tr key={user.id}>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <RoleBadge>
                        {getRoleLabel(user.role)}
                      </RoleBadge>
                    </Td>
                    <Td>
                      <StatusBadge status={user.status}>
                        {getStatusLabel(user.status)}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionButton
                        className="view"
                        title="Visualizar"
                        onClick={() => handleView(user)}
                      >
                        <FaEye />
                      </ActionButton>
                      <PermissionGuard screen="usuarios" action="can_edit">
                        <ActionButton
                          className="edit"
                          title="Editar"
                          onClick={() => handleEdit(user)}
                        >
                          <FaEdit />
                        </ActionButton>
                      </PermissionGuard>
                      <PermissionGuard screen="usuarios" action="can_delete">
                        <ActionButton
                          className="delete"
                          title="Excluir"
                          onClick={() => handleDelete(user.id)}
                        >
                          <FaTrash />
                        </ActionButton>
                      </PermissionGuard>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Container>
    </Layout>
  );
};

export default Usuarios; 