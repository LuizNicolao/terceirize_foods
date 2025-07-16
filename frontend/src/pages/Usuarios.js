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
  gap: 20px;
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
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    dataInicio: '',
    dataFim: '',
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

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const params = new URLSearchParams();
      
      if (auditFilters.dataInicio) params.append('data_inicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('data_fim', auditFilters.dataFim);
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
      dataInicio: '',
      dataFim: '',
      acao: '',
      usuario_id: ''
    });
  };

  // Aplicar filtros de auditoria
  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  // Formatar data
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
      'logout': 'Logout',
      'view': 'Visualizar'
    };
    return actions[action] || action;
  };

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
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
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
      )}

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', maxHeight: '85vh' }}>
            <ModalHeader>
              <ModalTitle>📊 Relatório de Auditoria - Usuários</ModalTitle>
              <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
            </ModalHeader>

            {/* Filtros de Auditoria */}
            <div style={{ 
              marginBottom: '24px', 
              padding: '20px', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '18px', 
                color: 'var(--dark-gray)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔍 Filtros de Pesquisa
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '13px', 
                    color: 'var(--gray)',
                    fontWeight: '500'
                  }}>
                    📅 Data Início
                  </label>
                  <input
                    type="date"
                    value={auditFilters.dataInicio}
                    onChange={(e) => setAuditFilters({...auditFilters, dataInicio: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '2px solid #e9ecef', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '13px', 
                    color: 'var(--gray)',
                    fontWeight: '500'
                  }}>
                    📅 Data Fim
                  </label>
                  <input
                    type="date"
                    value={auditFilters.dataFim}
                    onChange={(e) => setAuditFilters({...auditFilters, dataFim: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '2px solid #e9ecef', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '13px', 
                    color: 'var(--gray)',
                    fontWeight: '500'
                  }}>
                    ⚡ Ação
                  </label>
                  <select
                    value={auditFilters.acao}
                    onChange={(e) => setAuditFilters({...auditFilters, acao: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '2px solid #e9ecef', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <option value="">Todas as ações</option>
                    <option value="create">Criar</option>
                    <option value="update">Editar</option>
                    <option value="delete">Excluir</option>
                    <option value="login">Login</option>
                  </select>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '13px', 
                    color: 'var(--gray)',
                    fontWeight: '500'
                  }}>
                    👤 Usuário
                  </label>
                  <select
                    value={auditFilters.usuario_id}
                    onChange={(e) => setAuditFilters({...auditFilters, usuario_id: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '2px solid #e9ecef', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <option value="">Todos os usuários</option>
                    {usuarios.map(user => (
                      <option key={user.id} value={user.id}>{user.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleApplyAuditFilters}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--dark-green) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🔍 Aplicar Filtros
              </button>
            </div>

            {/* Lista de Logs */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {auditLoading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: 'var(--gray)',
                  fontSize: '16px'
                }}>
                  ⏳ Carregando logs...
                </div>
              ) : auditLogs.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: 'var(--gray)',
                  fontSize: '16px'
                }}>
                  📭 Nenhum log encontrado com os filtros aplicados
                </div>
              ) : (
                <div>
                  <div style={{ 
                    marginBottom: '20px', 
                    fontSize: '14px', 
                    color: 'var(--gray)',
                    padding: '12px 16px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    📈 {auditLogs.length} log(s) encontrado(s)
                  </div>
                  {auditLogs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '16px',
                        background: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                      onMouseOut={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '12px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: log.acao === 'create' ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' : 
                                       log.acao === 'update' ? 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)' : 
                                       log.acao === 'delete' ? 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)' : 
                                       'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            color: log.acao === 'create' ? '#2e7d32' : 
                                   log.acao === 'update' ? '#856404' : 
                                   log.acao === 'delete' ? '#721c24' : '#1976d2',
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}>
                            {log.acao === 'create' ? '➕' : 
                             log.acao === 'update' ? '✏️' : 
                             log.acao === 'delete' ? '🗑️' : '🔐'} {getActionLabel(log.acao)}
                          </span>
                          <span style={{ 
                            fontSize: '13px', 
                            color: 'var(--gray)',
                            fontWeight: '500'
                          }}>
                            por <strong>{log.usuario_nome || 'Usuário desconhecido'}</strong>
                          </span>
                        </div>
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--gray)',
                          background: '#f8f9fa',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          🕒 {formatDate(log.timestamp)}
                        </span>
                      </div>
                      
                      {log.detalhes && (
                        <div style={{ 
                          fontSize: '13px', 
                          color: 'var(--dark-gray)',
                          background: '#f8f9fa',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}>
                          {log.detalhes.changes && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong style={{ color: 'var(--dark-gray)' }}>🔄 Mudanças:</strong>
                              {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                <div key={field} style={{ 
                                  marginLeft: '16px', 
                                  marginTop: '6px',
                                  padding: '4px 8px',
                                  background: 'white',
                                  borderRadius: '4px',
                                  border: '1px solid #e9ecef'
                                }}>
                                  <span style={{ fontWeight: 'bold', color: 'var(--dark-gray)' }}>{field}:</span> 
                                  <span style={{ color: '#721c24', fontWeight: '500' }}> {change.from}</span> 
                                  <span style={{ margin: '0 4px', color: 'var(--gray)' }}>→</span>
                                  <span style={{ color: '#2e7d32', fontWeight: '500' }}> {change.to}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {log.detalhes.requestBody && !log.detalhes.changes && (
                            <div>
                              <strong style={{ color: 'var(--dark-gray)' }}>📄 Dados:</strong>
                              <pre style={{ 
                                marginTop: '4px',
                                fontSize: '11px',
                                background: 'white',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #e9ecef',
                                overflow: 'auto'
                              }}>
                                {JSON.stringify(log.detalhes.requestBody, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.detalhes.resourceId && (
                            <div style={{ marginTop: '8px' }}>
                              <strong style={{ color: 'var(--dark-gray)' }}>🆔 ID do Recurso:</strong> 
                              <span style={{ 
                                background: '#e3f2fd', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                marginLeft: '4px'
                              }}>
                                {log.detalhes.resourceId}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Usuarios; 