import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaUser, FaEnvelope, FaShieldAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Layout from '../../components/Layout';
import { useUsuarios } from '../../hooks';
import { colors } from '../../design-system';

// Componentes estilizados
const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${colors.neutral.darkGray};
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const BackButton = styled.button`
  background: ${colors.neutral.lightGray};
  color: ${colors.neutral.darkGray};
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.neutral.gray};
    color: ${colors.neutral.white};
  }
`;

const EditButton = styled.button`
  background: ${colors.secondary.blue};
  color: ${colors.neutral.white};
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #1976D2;
    transform: translateY(-1px);
  }
`;

const Card = styled.div`
  background: ${colors.neutral.white};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-bottom: 24px;
`;

const Section = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: ${colors.neutral.gray};
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Value = styled.div`
  color: ${colors.neutral.darkGray};
  font-size: 16px;
  padding: 12px 16px;
  background: ${colors.neutral.lightGray};
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const Badge = styled.span`
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

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${colors.neutral.lightGray};
  border-radius: 6px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.neutral.gray};
  font-size: 16px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.status.error};
  font-size: 16px;
`;

const VisualizarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedUsuario, loading, error, fetchUsuario } = useUsuarios();

  useEffect(() => {
    if (id && id !== 'new') {
      fetchUsuario(id);
    }
  }, [id, fetchUsuario]);

  const handleBack = () => {
    navigate('/usuarios');
  };

  const handleEdit = () => {
    navigate(`/editar-usuario/${id}`);
  };

  const getRoleLabel = (role) => {
    const roles = {
      'administrador': 'Administrador',
      'gestor': 'Gestor',
      'supervisor': 'Supervisor',
      'comprador': 'Comprador'
    };
    return roles[role] || role;
  };

  const getStatusLabel = (status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  };

  const getPermissionValue = (screen, permission) => {
    if (!selectedUsuario?.permissions) return false;
    return selectedUsuario.permissions[screen]?.[permission] || false;
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <LoadingState>Carregando dados do usuário...</LoadingState>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <ErrorState>
            Erro ao carregar dados do usuário: {error}
          </ErrorState>
        </Container>
      </Layout>
    );
  }

  if (!selectedUsuario) {
    return (
      <Layout>
        <Container>
          <ErrorState>Usuário não encontrado</ErrorState>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Visualizar Usuário</Title>
          <div style={{ display: 'flex', gap: '12px' }}>
            <BackButton onClick={handleBack}>
              <FaArrowLeft />
              Voltar
            </BackButton>
            <EditButton onClick={handleEdit}>
              <FaEdit />
              Editar
            </EditButton>
          </div>
        </Header>

        <Card>
          <Section>
            <SectionTitle>
              <FaUser />
              Informações Básicas
            </SectionTitle>
            <Grid>
              <Field>
                <Label>
                  <FaUser />
                  Nome
                </Label>
                <Value>{selectedUsuario.name}</Value>
              </Field>
              <Field>
                <Label>
                  <FaEnvelope />
                  Email
                </Label>
                <Value>{selectedUsuario.email}</Value>
              </Field>
              <Field>
                <Label>
                  <FaShieldAlt />
                  Tipo de Usuário
                </Label>
                <Value>
                  <RoleBadge>
                    {getRoleLabel(selectedUsuario.role)}
                  </RoleBadge>
                </Value>
              </Field>
              <Field>
                <Label>
                  {selectedUsuario.status === 'ativo' ? <FaCheckCircle /> : <FaTimesCircle />}
                  Status
                </Label>
                <Value>
                  <Badge status={selectedUsuario.status}>
                    {getStatusLabel(selectedUsuario.status)}
                  </Badge>
                </Value>
              </Field>
            </Grid>
          </Section>

          {selectedUsuario.permissions && (
            <Section>
              <SectionTitle>
                <FaShieldAlt />
                Permissões
              </SectionTitle>
              <PermissionsGrid>
                {Object.entries(selectedUsuario.permissions).map(([screen, permissions]) => (
                  <div key={screen}>
                    <h4 style={{ margin: '0 0 8px 0', color: colors.neutral.darkGray }}>
                      {screen.charAt(0).toUpperCase() + screen.slice(1)}
                    </h4>
                    {Object.entries(permissions).map(([permission, value]) => (
                      <PermissionItem key={permission}>
                        {value ? <FaCheckCircle color={colors.status.success} /> : <FaTimesCircle color={colors.status.error} />}
                        <span>{permission}</span>
                      </PermissionItem>
                    ))}
                  </div>
                ))}
              </PermissionsGrid>
            </Section>
          )}
        </Card>
      </Container>
    </Layout>
  );
};

export default VisualizarUsuario;
