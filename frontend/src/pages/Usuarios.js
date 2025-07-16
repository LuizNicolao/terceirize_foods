import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaHistory, FaQuestionCircle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
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

const AddButton = styled.button`
  background: var(--primary-green);
  color: var(--white);
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
    background: var(--dark-green);
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
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const TableContainer = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f5f5f5;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: var(--dark-gray);
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.status === 'ativo' ? 'var(--success-green)' : '#ffebee'};
  color: ${props => props.status === 'ativo' ? 'white' : 'var(--error-red)'};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-right: 8px;
  color: var(--gray);

  &:hover {
    background-color: var(--light-gray);
  }

  &.edit {
    color: var(--blue);
  }

  &.delete {
    color: var(--error-red);
  }

  &.view {
    color: var(--primary-green);
  }

  &.audit {
    color: var(--orange);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  color: var(--dark-gray);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--gray);
  padding: 4px;

  &:hover {
    color: var(--error-red);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const AuditModal = styled(Modal)`
  z-index: 1001;
`;

const AuditModalContent = styled(ModalContent)`
  max-width: 800px;
  max-height: 80vh;
`;

const AuditFilters = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-gray);
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const AuditFilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
`;

const AuditTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
`;

const AuditTh = styled.th`
  background-color: #f5f5f5;
  padding: 8px;
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 12px;
  border-bottom: 1px solid #e0e0e0;
`;

const AuditTd = styled.td`
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  color: var(--dark-gray);
  word-break: break-word;
`;

const ChangesBadge = styled.span`
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  background: var(--primary-green);
  color: white;
`;

const AuditEmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--gray);
  font-size: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: var(--dark-gray);
  font-weight: 600;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: var(--primary-green);
    color: var(--white);

    &:hover {
      background: var(--dark-green);
    }
  }

  &.secondary {
    background: var(--gray);
    color: var(--white);

    &:hover {
      background: var(--dark-gray);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: var(--gray);
`;

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  // Estados para auditoria
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    data_inicio: '',
    data_fim: '',
    acao: '',
    usuario_id: ''
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  // Carregar usuários
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

  useEffect(() => {
    loadUsuarios();
  }, []);

  // Abrir modal para adicionar usuário
  const handleAddUser = () => {
    setEditingUser(null);
    reset();
    setShowModal(true);
  };

  // Abrir modal para editar usuário
  const handleEditUser = (user) => {
    setEditingUser(user);
    setValue('nome', user.nome);
    setValue('email', user.email);
    setValue('nivel_de_acesso', user.nivel_de_acesso);
    setValue('tipo_de_acesso', user.tipo_de_acesso);
    setValue('status', user.status);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    reset();
  };

  // Salvar usuário
  const onSubmit = async (data) => {
    try {
      // Se estiver editando e a senha estiver vazia, remove o campo
      if (editingUser && (!data.senha || data.senha.trim() === '')) {
        delete data.senha;
      }

      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id}`, data);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await api.post('/usuarios', data);
        toast.success('Usuário criado com sucesso!');
      }
      
      handleCloseModal();
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  // Excluir usuário
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/usuarios/${userId}`);
        toast.success('Usuário excluído com sucesso!');
        loadUsuarios();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const params = new URLSearchParams();
      
      if (auditFilters.data_inicio) params.append('data_inicio', auditFilters.data_inicio);
      if (auditFilters.data_fim) params.append('data_fim', auditFilters.data_fim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      
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
      data_inicio: '',
      data_fim: '',
      acao: '',
      usuario_id: ''
    });
  };

  // Aplicar filtros de auditoria
  const handleAuditFilterChange = (field, value) => {
    setAuditFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Formatar data para exibição
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Obter label da ação
  const getActionLabel = (action) => {
    const actions = {
      'create': 'Criar',
      'update': 'Editar',
      'delete': 'Excluir',
      'login': 'Login',
      'logout': 'Logout'
    };
    return actions[action] || action;
  };

  // Filtrar usuários
  const filteredUsuarios = usuarios.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getNivelAcessoLabel = (nivel) => {
    const niveis = {
      'I': 'Nível I - Visualizar',
      'II': 'Nível II - Criar/Editar',
      'III': 'Nível III - Completo'
    };
    return niveis[nivel] || nivel;
  };

  const getTipoAcessoLabel = (tipo) => {
    const tipos = {
      'administrador': 'Administrador',
      'coordenador': 'Coordenador',
      'administrativo': 'Administrativo',
      'gerente': 'Gerente',
      'supervisor': 'Supervisor'
    };
    return tipos[tipo] || tipo;
  };

  if (loading) {
    return (
      <Container>
        <div>Carregando usuários...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Usuários</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ActionButton
            className="audit"
            title="Histórico de Auditoria"
            onClick={handleOpenAuditModal}
            style={{ 
              background: 'var(--orange)', 
              color: 'white', 
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none'
            }}
          >
            <FaHistory />
            Auditoria
          </ActionButton>
          <AddButton onClick={handleAddUser}>
            <FaPlus />
            Adicionar Usuário
          </AddButton>
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
              <Th>Nível de Acesso</Th>
              <Th>Tipo de Acesso</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length === 0 ? (
              <tr>
                <Td colSpan="6">
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
                  <Td>{user.nome}</Td>
                  <Td>{user.email}</Td>
                  <Td>{getNivelAcessoLabel(user.nivel_de_acesso)}</Td>
                  <Td>{getTipoAcessoLabel(user.tipo_de_acesso)}</Td>
                  <Td>
                    <StatusBadge status={user.status}>
                      {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleEditUser(user)}
                    >
                      <FaEye />
                    </ActionButton>
                    <ActionButton
                      className="edit"
                      title="Editar"
                      onClick={() => handleEditUser(user)}
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      title="Excluir"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <FaTrash />
                    </ActionButton>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome</Label>
                <Input
                  type="text"
                  placeholder="Nome completo"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                />
                {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  {...register('email', { 
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                />
                {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Senha {editingUser && '(deixe em branco para manter a atual)'}</Label>
                <Input
                  type="password"
                  placeholder={editingUser ? "Nova senha (opcional)" : "Senha"}
                  {...register('senha', { 
                    required: !editingUser ? 'Senha é obrigatória' : false,
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                />
                {errors.senha && <span style={{ color: 'red', fontSize: '12px' }}>{errors.senha.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Nível de Acesso</Label>
                <Select {...register('nivel_de_acesso', { required: 'Nível de acesso é obrigatório' })}>
                  <option value="">Selecione...</option>
                  <option value="I">Nível I - Visualizar</option>
                  <option value="II">Nível II - Criar/Editar</option>
                  <option value="III">Nível III - Completo</option>
                </Select>
                {errors.nivel_de_acesso && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nivel_de_acesso.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Tipo de Acesso</Label>
                <Select {...register('tipo_de_acesso', { required: 'Tipo de acesso é obrigatório' })}>
                  <option value="">Selecione...</option>
                  <option value="administrador">Administrador</option>
                  <option value="coordenador">Coordenador</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="gerente">Gerente</option>
                  <option value="supervisor">Supervisor</option>
                </Select>
                {errors.tipo_de_acesso && <span style={{ color: 'red', fontSize: '12px' }}>{errors.tipo_de_acesso.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select {...register('status', { required: 'Status é obrigatório' })}>
                  <option value="">Selecione...</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </Select>
                {errors.status && <span style={{ color: 'red', fontSize: '12px' }}>{errors.status.message}</span>}
              </FormGroup>

              <ButtonGroup>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="primary">
                  {editingUser ? 'Atualizar' : 'Criar'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <AuditModal>
          <AuditModalContent>
            <ModalHeader>
              <ModalTitle>Histórico de Auditoria - Usuários</ModalTitle>
              <CloseButton onClick={handleCloseAuditModal}>×</CloseButton>
            </ModalHeader>

            <AuditFilters>
              <FilterGroup>
                <FilterLabel>Data Início</FilterLabel>
                <FilterInput
                  type="date"
                  value={auditFilters.data_inicio}
                  onChange={(e) => handleAuditFilterChange('data_inicio', e.target.value)}
                />
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>Data Fim</FilterLabel>
                <FilterInput
                  type="date"
                  value={auditFilters.data_fim}
                  onChange={(e) => handleAuditFilterChange('data_fim', e.target.value)}
                />
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>Ação</FilterLabel>
                <AuditFilterSelect
                  value={auditFilters.acao}
                  onChange={(e) => handleAuditFilterChange('acao', e.target.value)}
                >
                  <option value="">Todas as ações</option>
                  <option value="create">Criar</option>
                  <option value="update">Editar</option>
                  <option value="delete">Excluir</option>
                  <option value="login">Login</option>
                </AuditFilterSelect>
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>Usuário</FilterLabel>
                <AuditFilterSelect
                  value={auditFilters.usuario_id}
                  onChange={(e) => handleAuditFilterChange('usuario_id', e.target.value)}
                >
                  <option value="">Todos os usuários</option>
                  {usuarios.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nome} ({user.email})
                    </option>
                  ))}
                </AuditFilterSelect>
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>&nbsp;</FilterLabel>
                <Button 
                  className="primary" 
                  onClick={loadAuditLogs}
                  disabled={auditLoading}
                >
                  {auditLoading ? 'Carregando...' : 'Filtrar'}
                </Button>
              </FilterGroup>
            </AuditFilters>

            {auditLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                Carregando logs de auditoria...
              </div>
            ) : auditLogs.length === 0 ? (
              <AuditEmptyState>
                Nenhum log de auditoria encontrado para os filtros aplicados
              </AuditEmptyState>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <AuditTable>
                  <thead>
                    <tr>
                      <AuditTh>Data/Hora</AuditTh>
                      <AuditTh>Usuário</AuditTh>
                      <AuditTh>Ação</AuditTh>
                      <AuditTh>Recurso</AuditTh>
                      <AuditTh>IP</AuditTh>
                      <AuditTh>Detalhes</AuditTh>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <AuditTd>{formatDate(log.timestamp)}</AuditTd>
                        <AuditTd>{log.usuario_nome || 'N/A'}</AuditTd>
                        <AuditTd>
                          <ChangesBadge>{getActionLabel(log.acao)}</ChangesBadge>
                        </AuditTd>
                        <AuditTd>{log.recurso}</AuditTd>
                        <AuditTd>{log.ip_address}</AuditTd>
                        <AuditTd>
                          {log.detalhes && (
                            <details>
                              <summary style={{ cursor: 'pointer', color: 'var(--primary-green)' }}>
                                Ver detalhes
                              </summary>
                              <pre style={{ 
                                fontSize: '10px', 
                                marginTop: '8px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                              }}>
                                {JSON.stringify(log.detalhes, null, 2)}
                              </pre>
                            </details>
                          )}
                        </AuditTd>
                      </tr>
                    ))}
                  </tbody>
                </AuditTable>
              </div>
            )}
          </AuditModalContent>
        </AuditModal>
      )}
    </Container>
  );
};

export default Usuarios; 