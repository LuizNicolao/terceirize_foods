import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaUser, 
  FaEnvelope, 
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye
} from 'react-icons/fa';
import { colors, typography, shadows } from '../design-system';
import { Button, Card } from '../design-system/components';

// Componentes estilizados
const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${colors.neutral.darkGray};
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: ${colors.neutral.gray};
  font-size: 16px;
  margin: 0;
`;

const FormContainer = styled(Card)`
  padding: 32px;
  margin-bottom: 24px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h2`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionDescription = styled.p`
  color: ${colors.neutral.gray};
  font-size: 14px;
  margin: 0;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: ${colors.neutral.darkGray};
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: ${colors.neutral.lightGray};
  color: ${colors.neutral.darkGray};
  cursor: not-allowed;

  &:disabled {
    background-color: ${colors.neutral.lightGray};
    color: ${colors.neutral.darkGray};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: ${colors.neutral.lightGray};
  transition: all 0.3s ease;
  color: ${colors.neutral.darkGray};
  cursor: not-allowed;

  &:disabled {
    background-color: ${colors.neutral.lightGray};
    color: ${colors.neutral.darkGray};
    cursor: not-allowed;
  }
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

const PermissionsTable = styled.div`
  background: ${colors.neutral.white};
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
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

const ScreenName = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: ${colors.neutral.darkGray};
  font-weight: 500;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${colors.primary.green};
  cursor: not-allowed;
  pointer-events: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
`;

const BackButton = styled(Button)`
  background: ${colors.neutral.gray};
  color: ${colors.neutral.white};
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

  &:hover {
    background: ${colors.neutral.darkGray};
  }
`;

const EditButton = styled(Button)`
  background: ${colors.secondary.blue};
  color: ${colors.neutral.white};
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

  &:hover {
    background: #1976D2;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${colors.neutral.gray};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${colors.status.error};
`;

const VisualizarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const screens = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'usuarios', label: 'Usuários' },
    { key: 'cotacoes', label: 'Cotações' },
    { key: 'supervisor', label: 'Supervisor' },
    { key: 'nova-cotacao', label: 'Nova Cotação' },
    { key: 'visualizar-cotacao', label: 'Visualizar Cotação' },
    { key: 'editar-cotacao', label: 'Editar Cotação' }
  ];

  useEffect(() => {
    fetchUsuario();
  }, [id]);

  const fetchUsuario = async () => {
    try {
      setLoading(true);
      setError(null);
      
              const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/usuarios');
  };

  const handleEdit = () => {
    navigate(`/editar-usuario/${id}`);
  };

  const getRoleLabel = (role) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getStatusLabel = (status) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  const getPermissionValue = (screen, permission) => {
    if (!usuario.permissions) return false;
    const perm = usuario.permissions.find(p => p.screen === screen);
    return perm ? perm[permission] === 1 : false;
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <LoadingState>
            <FaCheckCircle size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
            <h3>Carregando usuário...</h3>
            <p>Aguarde um momento</p>
          </LoadingState>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <ErrorState>
            <FaExclamationTriangle size={48} style={{ marginBottom: '16px', color: colors.status.error }} />
            <h3>Erro ao carregar usuário</h3>
            <p>{error}</p>
            <Button onClick={fetchUsuario} variant="primary" style={{ marginTop: '16px' }}>
              Tentar Novamente
            </Button>
          </ErrorState>
        </Container>
      </Layout>
    );
  }

  if (!usuario) {
    return (
      <Layout>
        <Container>
          <ErrorState>
            <h3>Usuário não encontrado</h3>
            <p>O usuário solicitado não foi encontrado.</p>
            <Button onClick={handleBack} variant="primary" style={{ marginTop: '16px' }}>
              Voltar
            </Button>
          </ErrorState>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Visualizar Usuário #{id}</Title>
          <Subtitle>Visualize os dados do usuário</Subtitle>
        </Header>

        <Form>
          {/* Seção 1: Informações Básicas */}
          <FormContainer>
            <FormSection>
              <SectionTitle>
                <FaUser />
                Informações Básicas
              </SectionTitle>
              
              <FormRow>
                <FormGroup>
                  <Label>
                    <FaUser />
                    Nome
                  </Label>
                  <Input
                    type="text"
                    value={usuario.name}
                    disabled
                    readOnly
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>
                    <FaEnvelope />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={usuario.email}
                    disabled
                    readOnly
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>
                    <FaShieldAlt />
                    Tipo de Usuário
                  </Label>
                  <Select
                    value={usuario.role}
                    disabled
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Status</Label>
                  <Select
                    value={usuario.status}
                    disabled
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </FormRow>
            </FormSection>
          </FormContainer>

          {/* Seção 2: Permissões */}
          <FormContainer>
            <FormSection>
              <SectionTitle>
                <FaShieldAlt />
                Permissões por Tela
              </SectionTitle>
              <SectionDescription>
                Visualize as permissões que este usuário tem em cada tela do sistema
              </SectionDescription>
              
              <PermissionsTable>
                <Table>
                  <thead>
                    <tr>
                      <Th>Tela</Th>
                      <Th>Visualizar</Th>
                      <Th>Criar</Th>
                      <Th>Editar</Th>
                      <Th>Excluir</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {screens.map((screen) => (
                      <tr key={screen.key}>
                        <ScreenName>{screen.label}</ScreenName>
                        <Td>
                          <Checkbox
                            type="checkbox"
                            checked={getPermissionValue(screen.key, 'can_view')}
                            disabled
                            readOnly
                          />
                        </Td>
                        <Td>
                          <Checkbox
                            type="checkbox"
                            checked={getPermissionValue(screen.key, 'can_create')}
                            disabled
                            readOnly
                          />
                        </Td>
                        <Td>
                          <Checkbox
                            type="checkbox"
                            checked={getPermissionValue(screen.key, 'can_edit')}
                            disabled
                            readOnly
                          />
                        </Td>
                        <Td>
                          <Checkbox
                            type="checkbox"
                            checked={getPermissionValue(screen.key, 'can_delete')}
                            disabled
                            readOnly
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </PermissionsTable>
            </FormSection>
          </FormContainer>

          {/* Botões de Ação */}
          <ButtonGroup>
            <BackButton onClick={handleBack}>
              <FaArrowLeft />
              Voltar
            </BackButton>
            <EditButton onClick={handleEdit}>
              <FaEdit />
              Editar Usuário
            </EditButton>
          </ButtonGroup>
        </Form>
      </Container>
    </Layout>
  );
};

export default VisualizarUsuario; 