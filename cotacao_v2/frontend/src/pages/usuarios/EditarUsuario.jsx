import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaSave, FaTimes, FaUser, FaEnvelope, FaLock, FaShieldAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const SaveButton = styled.button`
  background: ${colors.primary.green};
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
    background: ${colors.primary.darkGreen};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${colors.neutral.gray};
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
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
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  font-weight: 600;
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

  &:focus {
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }

  &.error {
    border-color: ${colors.status.error};
  }
`;

const Select = styled.select`
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

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const PermissionSection = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
`;

const PermissionSectionTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: capitalize;
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  color: ${colors.status.error};
  font-size: 14px;
  margin-top: 4px;
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

const EditarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedUsuario, loading, error, fetchUsuario, createUsuario, updateUsuario } = useUsuarios();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'comprador',
    status: 'ativo',
    password: '',
    confirmPassword: ''
  });
  
  const [permissions, setPermissions] = useState({
    usuarios: { can_view: false, can_create: false, can_edit: false, can_delete: false },
    cotacoes: { can_view: false, can_create: false, can_edit: false, can_delete: false },
    saving: { can_view: false, can_create: false, can_edit: false, can_delete: false },
    dashboard: { can_view: false }
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNewUser = id === 'new';

  useEffect(() => {
    if (!isNewUser && id) {
      fetchUsuario(id);
    }
  }, [id, isNewUser, fetchUsuario]);

  useEffect(() => {
    if (selectedUsuario && !isNewUser) {
      setFormData({
        name: selectedUsuario.name || '',
        email: selectedUsuario.email || '',
        role: selectedUsuario.role || 'comprador',
        status: selectedUsuario.status || 'ativo',
        password: '',
        confirmPassword: ''
      });
      
      if (selectedUsuario.permissions) {
        setPermissions(selectedUsuario.permissions);
      }
    }
  }, [selectedUsuario, isNewUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começa a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePermissionChange = (screen, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [screen]: {
        ...prev[screen],
        [permission]: value
      }
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (isNewUser && !formData.password) {
      errors.password = 'Senha é obrigatória para novos usuários';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        permissions
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      if (isNewUser) {
        await createUsuario(userData);
      } else {
        await updateUsuario(id, userData);
      }

      navigate('/usuarios');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/usuarios');
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

  if (error && !isNewUser) {
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

  return (
    <Layout>
      <Container>
        <Header>
          <Title>{isNewUser ? 'Novo Usuário' : 'Editar Usuário'}</Title>
          <ButtonGroup>
            <CancelButton onClick={handleCancel}>
              <FaTimes />
              Cancelar
            </CancelButton>
            <SaveButton onClick={handleSubmit} disabled={isSubmitting}>
              <FaSave />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </SaveButton>
          </ButtonGroup>
        </Header>

        <form onSubmit={handleSubmit}>
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
                    Nome *
                  </Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={formErrors.name ? 'error' : ''}
                    placeholder="Digite o nome completo"
                  />
                  {formErrors.name && <ErrorMessage>{formErrors.name}</ErrorMessage>}
                </Field>
                
                <Field>
                  <Label>
                    <FaEnvelope />
                    Email *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={formErrors.email ? 'error' : ''}
                    placeholder="Digite o email"
                  />
                  {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
                </Field>
                
                <Field>
                  <Label>
                    <FaShieldAlt />
                    Tipo de Usuário
                  </Label>
                  <Select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <option value="comprador">Comprador</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="gestor">Gestor</option>
                    <option value="administrador">Administrador</option>
                  </Select>
                </Field>
                
                <Field>
                  <Label>
                    {formData.status === 'ativo' ? <FaCheckCircle /> : <FaTimesCircle />}
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </Select>
                </Field>
              </Grid>
            </Section>

            <Section>
              <SectionTitle>
                <FaLock />
                Senha {!isNewUser && '(deixe em branco para manter a atual)'}
              </SectionTitle>
              <Grid>
                <Field>
                  <Label>
                    <FaLock />
                    Senha {isNewUser && '*'}
                  </Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={formErrors.password ? 'error' : ''}
                    placeholder={isNewUser ? "Digite a senha" : "Digite a nova senha (opcional)"}
                  />
                  {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
                </Field>
                
                <Field>
                  <Label>
                    <FaLock />
                    Confirmar Senha {isNewUser && '*'}
                  </Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={formErrors.confirmPassword ? 'error' : ''}
                    placeholder="Confirme a senha"
                  />
                  {formErrors.confirmPassword && <ErrorMessage>{formErrors.confirmPassword}</ErrorMessage>}
                </Field>
              </Grid>
            </Section>

            <Section>
              <SectionTitle>
                <FaShieldAlt />
                Permissões
              </SectionTitle>
              <PermissionsGrid>
                {Object.entries(permissions).map(([screen, screenPermissions]) => (
                  <PermissionSection key={screen}>
                    <PermissionSectionTitle>{screen}</PermissionSectionTitle>
                    {Object.entries(screenPermissions).map(([permission, value]) => (
                      <PermissionItem key={permission}>
                        <Checkbox
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handlePermissionChange(screen, permission, e.target.checked)}
                        />
                        <span>{permission.replace('can_', '').replace(/_/g, ' ')}</span>
                      </PermissionItem>
                    ))}
                  </PermissionSection>
                ))}
              </PermissionsGrid>
            </Section>
          </Card>
        </form>
      </Container>
    </Layout>
  );
};

export default EditarUsuario;
