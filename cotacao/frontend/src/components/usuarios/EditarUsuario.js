import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { 
  FaSave, 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { colors, typography, shadows, cardStyles } from '../../design-system';
import { Button, Card } from '../../design-system/components';

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

const Form = styled.form`
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
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    outline: none;
  }
`;

const ErrorMessage = styled.span`
  color: ${colors.status.error};
  font-size: 12px;
  margin-top: 4px;
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
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
`;

const SaveButton = styled(Button)`
  background: ${colors.primary.green};
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
    background: ${colors.primary.darkGreen};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
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

const EditarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'comprador',
    status: 'ativo'
  });

  const [permissions, setPermissions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

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
    { key: 'aprovacoes', label: 'Aprovações' },
    { key: 'aprovacoes_supervisor', label: 'Aprovações Supervisor' },
    { key: 'saving', label: 'Saving' },
    { key: 'nova-cotacao', label: 'Nova Cotação' },
    { key: 'visualizar-cotacao', label: 'Visualizar Cotação' },
    { key: 'editar-cotacao', label: 'Editar Cotação' }
  ];

  useEffect(() => {
    fetchUsuario();
  }, [id]);

  const fetchUsuario = async () => {
    // Se for um novo usuário, não precisa buscar dados
    if (id === 'new') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://foods.terceirizemais.com.br/cotacao/api'}/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('📥 Resposta completa:', responseData);
        const data = responseData.data;
        console.log('📊 Dados do usuário:', data);
        
        setFormData({
          name: data.name || '',
          email: data.email || '',
          password: '',
          role: data.role || 'comprador',
          status: data.status || 'ativo'
        });
        
        setPermissions(data.permissions || []);
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePermissionChange = (screen, permission, value) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.screen === screen);
      
      if (existing) {
        return prev.map(p => 
          p.screen === screen ? { ...p, [permission]: value ? 1 : 0 } : p
        );
      } else {
        return [...prev, { 
          screen, 
          [permission]: value ? 1 : 0,
          can_view: permission === 'can_view' ? (value ? 1 : 0) : 0,
          can_create: permission === 'can_create' ? (value ? 1 : 0) : 0,
          can_edit: permission === 'can_edit' ? (value ? 1 : 0) : 0,
          can_delete: permission === 'can_delete' ? (value ? 1 : 0) : 0
        }];
      }
    });
  };

  const getPermissionValue = (screen, permission) => {
    const perm = permissions.find(p => p.screen === screen);
    return perm ? perm[permission] === 1 : false;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (id === 'new' && !formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória para novos usuários';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSaving(true);
      
      const userData = {
        ...formData,
        permissions: permissions
      };

      // Remover senha vazia se não foi alterada
      if (!userData.password.trim()) {
        delete userData.password;
      }

      try {
        const url = id === 'new' 
                  ? `${process.env.REACT_APP_API_URL || 'https://foods.terceirizemais.com.br/cotacao/api'}/users`
        : `${process.env.REACT_APP_API_URL || 'https://foods.terceirizemais.com.br/cotacao/api'}/users/${id}`;
        
        const method = id === 'new' ? 'POST' : 'PUT';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(userData)
        });

        if (response.ok) {
          toast.success(id === 'new' ? 'Usuário criado com sucesso!' : 'Usuário atualizado com sucesso!');
          navigate('/usuarios');
        } else {
          const errorData = await response.json();
          console.error('Erro ao salvar usuário:', errorData);
          
          // Mostrar mensagem de erro mais amigável
          let errorMessage = errorData.message || 'Erro desconhecido';
          if (errorMessage.includes('Email já cadastrado')) {
            errorMessage = 'Este e-mail já está sendo usado por outro usuário. Por favor, escolha um e-mail diferente.';
          }
          
          toast.error(`Erro ao salvar usuário: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        toast.error('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/usuarios');
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <FaCheckCircle size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
          <h3>Carregando usuário...</h3>
          <p>Aguarde um momento</p>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <Container>
        <Header>
          <Title>{id === 'new' ? 'Novo Usuário' : `Editar Usuário #${id}`}</Title>
          <Subtitle>{id === 'new' ? 'Crie um novo usuário' : 'Modifique os dados do usuário'}</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
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
                    Nome *
                  </Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'error' : ''}
                    placeholder="Nome completo"
                  />
                  {errors.name && (
                    <ErrorMessage>{errors.name}</ErrorMessage>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <Label>
                    <FaEnvelope />
                    Email *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'error' : ''}
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && (
                    <ErrorMessage>{errors.email}</ErrorMessage>
                  )}
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>
                    <FaLock />
                    Senha {id === 'new' ? '*' : '(deixe em branco para não alterar)'}
                  </Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'error' : ''}
                    placeholder={id === 'new' ? 'Senha' : 'Nova senha (opcional)'}
                  />
                  {errors.password && (
                    <ErrorMessage>{errors.password}</ErrorMessage>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <Label>
                    <FaShieldAlt />
                    Tipo de Usuário *
                  </Label>
                  <Select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Status *</Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
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
                Configure as permissões que este usuário terá em cada tela do sistema
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
                            onChange={(e) => handlePermissionChange(screen.key, 'can_view', e.target.checked)}
                          />
                        </Td>
                        <Td>
                          <Checkbox
                            type="checkbox"
                            checked={getPermissionValue(screen.key, 'can_create')}
                            onChange={(e) => handlePermissionChange(screen.key, 'can_create', e.target.checked)}
                          />
                        </Td>
                        <Td>
                          <Checkbox
                            type="checkbox"
                            checked={getPermissionValue(screen.key, 'can_edit')}
                            onChange={(e) => handlePermissionChange(screen.key, 'can_edit', e.target.checked)}
                          />
                        </Td>
                        <Td>
                          <Checkbox
                            type="checkbox"
                            checked={getPermissionValue(screen.key, 'can_delete')}
                            onChange={(e) => handlePermissionChange(screen.key, 'can_delete', e.target.checked)}
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
            <CancelButton onClick={handleCancel}>
              <FaTimes />
              Cancelar
            </CancelButton>
            <SaveButton type="submit" disabled={saving}>
              <FaSave />
              {saving ? 'Salvando...' : (id === 'new' ? 'Criar Usuário' : 'Salvar Alterações')}
            </SaveButton>
          </ButtonGroup>
        </Form>
      </Container>
  );
};

export default EditarUsuario; 