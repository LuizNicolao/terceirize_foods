import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaHistory, FaQuestionCircle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import CadastroFilterBar from '../components/CadastroFilterBar';

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
  background: ${props =>
    props.status === 'ativo' ? 'var(--success-green)' :
    props.status === 'inativo' ? '#ffebee' :
    props.status === 'ferias' ? 'var(--warning-yellow)' :
    props.status === 'licenca' ? '#e3f2fd' : '#ffebee'};
  color: ${props =>
    props.status === 'ativo' ? 'white' :
    props.status === 'inativo' ? 'var(--error-red)' :
    props.status === 'ferias' ? 'var(--dark-gray)' :
    props.status === 'licenca' ? '#1976d2' : 'var(--error-red)'};
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
    background: var(--light-gray);
    color: var(--dark-gray);
  }

  &.edit {
    color: var(--primary-blue);
    &:hover {
      background: #e3f2fd;
    }
  }

  &.delete {
    color: var(--error-red);
    &:hover {
      background: #ffebee;
    }
  }

  &.view {
    color: var(--primary-green);
    &:hover {
      background: #e8f5e8;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
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
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--gray);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: var(--light-gray);
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }

  &.error {
    border-color: var(--error-red);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }

  &.error {
    border-color: var(--error-red);
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }

  &.error {
    border-color: var(--error-red);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  grid-column: 1 / -1;
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
    color: white;

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
`;

const ErrorMessage = styled.span`
  color: var(--error-red);
  font-size: 12px;
  margin-top: 4px;
`;

const AuditModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const AuditModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
`;

const AuditTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const AuditTh = styled.th`
  background-color: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
`;

const AuditTd = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: var(--dark-gray);
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }
`;

const Ajudantes = () => {
  const [ajudantes, setAjudantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedAjudante, setSelectedAjudante] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filiais, setFiliais] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [auditFilters, setAuditFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    field: ''
  });

  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    loadAjudantes();
    loadFiliais();
  }, []);

  const loadAjudantes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ajudantes');
      setAjudantes(response.data);
    } catch (error) {
      console.error('Erro ao carregar ajudantes:', error);
      toast.error('Erro ao carregar ajudantes');
    } finally {
      setLoading(false);
    }
  };

  const loadFiliais = async () => {
    try {
      const response = await api.get('/ajudantes/filiais/options');
      setFiliais(response.data);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.startDate) params.append('data_inicio', auditFilters.startDate);
      if (auditFilters.endDate) params.append('data_fim', auditFilters.endDate);
      if (auditFilters.action) params.append('acao', auditFilters.action);
      if (auditFilters.field) params.append('campo', auditFilters.field);
      params.append('recurso', 'ajudantes');

      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
      setAuditLogs([]);
    }
  };

  const handleOpenAuditModal = () => {
    setAuditModalOpen(true);
    loadAuditLogs();
  };

  const handleCloseAuditModal = () => {
    setAuditModalOpen(false);
    setAuditFilters({
      startDate: '',
      endDate: '',
      action: '',
      field: ''
    });
  };

  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };



  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getActionLabel = (action) => {
    const actions = {
      'CREATE': 'Criar',
      'UPDATE': 'Atualizar',
      'DELETE': 'Excluir'
    };
    return actions[action] || action;
  };

  const getFieldLabel = (field) => {
    const fields = {
      'nome': 'Nome',
      'cpf': 'CPF',
      'telefone': 'Telefone',
      'email': 'Email',
      'endereco': 'Endereço',
      'status': 'Status',
      'data_admissao': 'Data de Admissão',
      'observacoes': 'Observações',
      'filial_id': 'Filial'
    };
    return fields[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined) return '-';
    
    switch (field) {
      case 'status':
        const statusLabels = {
          'ativo': 'Ativo',
          'inativo': 'Inativo',
          'ferias': 'Férias',
          'licenca': 'Licença'
        };
        return statusLabels[value] || value;
      case 'data_admissao':
        return formatDate(value);
      default:
        return value;
    }
  };

  const handleAddAjudante = () => {
    setSelectedAjudante(null);
    setIsEditing(false);
    reset();
    setModalOpen(true);
  };

  const handleViewAjudante = (ajudante) => {
    setSelectedAjudante(ajudante);
    setIsEditing(false);
    setValue('nome', ajudante.nome);
    setValue('cpf', ajudante.cpf);
    setValue('telefone', ajudante.telefone);
    setValue('email', ajudante.email);
    setValue('endereco', ajudante.endereco);
    setValue('status', ajudante.status);
    setValue('data_admissao', ajudante.data_admissao ? ajudante.data_admissao.split('T')[0] : '');
    setValue('observacoes', ajudante.observacoes);
    setValue('filial_id', ajudante.filial_id);
    setModalOpen(true);
  };

  const handleEditAjudante = (ajudante) => {
    setSelectedAjudante(ajudante);
    setIsEditing(true);
    setValue('nome', ajudante.nome);
    setValue('cpf', ajudante.cpf);
    setValue('telefone', ajudante.telefone);
    setValue('email', ajudante.email);
    setValue('endereco', ajudante.endereco);
    setValue('status', ajudante.status);
    setValue('data_admissao', ajudante.data_admissao ? ajudante.data_admissao.split('T')[0] : '');
    setValue('observacoes', ajudante.observacoes);
    setValue('filial_id', ajudante.filial_id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAjudante(null);
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await api.put(`/ajudantes/${selectedAjudante.id}`, data);
        toast.success('Ajudante atualizado com sucesso!');
      } else {
        await api.post('/ajudantes', data);
        toast.success('Ajudante criado com sucesso!');
      }
      
      handleCloseModal();
      loadAjudantes();
    } catch (error) {
      console.error('Erro ao salvar ajudante:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erro ao salvar ajudante');
      }
    }
  };

  const handleDeleteAjudante = async (ajudanteId) => {
    if (!window.confirm('Tem certeza que deseja excluir este ajudante?')) {
      return;
    }

    try {
      await api.delete(`/ajudantes/${ajudanteId}`);
      toast.success('Ajudante excluído com sucesso!');
      loadAjudantes();
    } catch (error) {
      console.error('Erro ao excluir ajudante:', error);
      toast.error('Erro ao excluir ajudante');
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'ferias': 'Férias',
      'licenca': 'Licença'
    };
    return statusLabels[status] || status;
  };

  // Filtrar ajudantes
  const filteredAjudantes = ajudantes.filter(ajudante => {
    const matchesSearch = !searchTerm || 
      ajudante.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ajudante.cpf?.includes(searchTerm) ||
      ajudante.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || ajudante.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!canView('ajudantes')) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para visualizar esta página.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gestão de Ajudantes</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          {canCreate('ajudantes') && (
            <AddButton onClick={handleAddAjudante}>
              <FaPlus />
              Adicionar Ajudante
            </AddButton>
          )}
        </div>
      </Header>

      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={() => { setSearchTerm(''); setStatusFilter('todos'); }}
        placeholder="Buscar por nome, CPF ou email..."
        statusOptions={[
          { value: 'todos', label: 'Todos' },
          { value: 'ativo', label: 'Ativo' },
          { value: 'inativo', label: 'Inativo' },
          { value: 'ferias', label: 'Férias' },
          { value: 'licenca', label: 'Licença' }
        ]}
      />

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>CPF</Th>
              <Th>Telefone</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Data Admissão</Th>
              <Th>Filial</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredAjudantes.length === 0 ? (
              <tr>
                <Td colSpan="8">
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)' }}>
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Nenhum ajudante encontrado com os filtros aplicados'
                      : 'Nenhum ajudante cadastrado'
                    }
                  </div>
                </Td>
              </tr>
            ) : (
              filteredAjudantes.map((ajudante) => (
              <tr key={ajudante.id}>
                <Td>{ajudante.nome}</Td>
                <Td>{ajudante.cpf || '-'}</Td>
                <Td>{ajudante.telefone || '-'}</Td>
                <Td>{ajudante.email || '-'}</Td>
                <Td>
                  <StatusBadge status={ajudante.status}>
                    {getStatusLabel(ajudante.status)}
                  </StatusBadge>
                </Td>
                <Td>{formatDate(ajudante.data_admissao)}</Td>
                <Td>{ajudante.filial_nome || '-'}</Td>
                <Td>
                  <ActionButton
                    className="view"
                    onClick={() => handleViewAjudante(ajudante)}
                    title="Visualizar"
                  >
                    <FaEye />
                  </ActionButton>
                  {canEdit('ajudantes') && (
                    <ActionButton
                      className="edit"
                      onClick={() => handleEditAjudante(ajudante)}
                      title="Editar"
                    >
                      <FaEdit />
                    </ActionButton>
                  )}
                  {canDelete('ajudantes') && (
                    <ActionButton
                      className="delete"
                      onClick={() => handleDeleteAjudante(ajudante.id)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </ActionButton>
                  )}
                </Td>
              </tr>
            ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* Modal de Ajudante */}
      {modalOpen && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {isEditing ? 'Editar Ajudante' : selectedAjudante ? 'Visualizar Ajudante' : 'Novo Ajudante'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome *</Label>
                <Input
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  className={errors.nome ? 'error' : ''}
                  disabled={selectedAjudante && !isEditing}
                />
                {errors.nome && <ErrorMessage>{errors.nome.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>CPF</Label>
                <Input
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  disabled={selectedAjudante && !isEditing}
                />
              </FormGroup>

              <FormGroup>
                <Label>Telefone</Label>
                <Input
                  {...register('telefone')}
                  placeholder="(00) 00000-0000"
                  disabled={selectedAjudante && !isEditing}
                />
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="email@exemplo.com"
                  disabled={selectedAjudante && !isEditing}
                />
              </FormGroup>

              <FormGroup>
                <Label>Status *</Label>
                <Select
                  {...register('status', { required: 'Status é obrigatório' })}
                  className={errors.status ? 'error' : ''}
                  disabled={selectedAjudante && !isEditing}
                >
                  <option value="">Selecione...</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="ferias">Férias</option>
                  <option value="licenca">Licença</option>
                </Select>
                {errors.status && <ErrorMessage>{errors.status.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Data de Admissão</Label>
                <Input
                  {...register('data_admissao')}
                  type="date"
                  disabled={selectedAjudante && !isEditing}
                />
              </FormGroup>

              <FormGroup>
                <Label>Filial</Label>
                <Select
                  {...register('filial_id')}
                  disabled={selectedAjudante && !isEditing}
                >
                  <option value="">Selecione uma filial...</option>
                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.nome}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup className="full-width">
                <Label>Endereço</Label>
                <TextArea
                  {...register('endereco')}
                  placeholder="Digite o endereço completo"
                  disabled={selectedAjudante && !isEditing}
                />
              </FormGroup>

              <FormGroup className="full-width">
                <Label>Observações</Label>
                <TextArea
                  {...register('observacoes')}
                  placeholder="Digite observações adicionais"
                  disabled={selectedAjudante && !isEditing}
                />
              </FormGroup>

              {!selectedAjudante || isEditing ? (
                <ButtonGroup>
                  <Button type="button" className="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="primary">
                    {isEditing ? 'Atualizar' : 'Criar'}
                  </Button>
                </ButtonGroup>
              ) : (
                <ButtonGroup>
                  <Button type="button" className="secondary" onClick={handleCloseModal}>
                    Fechar
                  </Button>
                </ButtonGroup>
              )}
            </Form>
          </ModalContent>
        </Modal>
      )}

             {/* Modal de Auditoria */}
       {auditModalOpen && (
         <Modal onClick={handleCloseAuditModal}>
           <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', maxHeight: '90vh', width: '1200px' }}>
             <ModalHeader>
               <ModalTitle>Relatório de Auditoria - Ajudantes</ModalTitle>
               <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
             </ModalHeader>

             {/* Filtros de Auditoria */}
             <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
               <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>Filtros</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '12px' }}>
                 <div>
                   <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                     Data Início
                   </label>
                   <input
                     type="date"
                     value={auditFilters.startDate}
                     onChange={(e) => setAuditFilters({...auditFilters, startDate: e.target.value})}
                     style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                   />
                 </div>
                 <div>
                   <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                     Data Fim
                   </label>
                   <input
                     type="date"
                     value={auditFilters.endDate}
                     onChange={(e) => setAuditFilters({...auditFilters, endDate: e.target.value})}
                     style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                   />
                 </div>
                 <div>
                   <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                     Ação
                   </label>
                   <select
                     value={auditFilters.action}
                     onChange={(e) => setAuditFilters({...auditFilters, action: e.target.value})}
                     style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                   >
                     <option value="">Todas as ações</option>
                     <option value="create">Criar</option>
                     <option value="update">Editar</option>
                     <option value="delete">Excluir</option>
                   </select>
                 </div>
                 <div>
                   <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                     Campo
                   </label>
                   <select
                     value={auditFilters.field}
                     onChange={(e) => setAuditFilters({...auditFilters, field: e.target.value})}
                     style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                   >
                     <option value="">Todos os campos</option>
                     <option value="nome">Nome</option>
                     <option value="cpf">CPF</option>
                     <option value="telefone">Telefone</option>
                     <option value="email">Email</option>
                     <option value="endereco">Endereço</option>
                     <option value="status">Status</option>
                     <option value="data_admissao">Data de Admissão</option>
                     <option value="observacoes">Observações</option>
                     <option value="filial_id">Filial</option>
                   </select>
                 </div>
                 <div>
                   <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                     &nbsp;
                   </label>
                   <button
                     onClick={handleApplyAuditFilters}
                     style={{
                       width: '100%',
                       padding: '8px 16px',
                       background: 'var(--primary-green)',
                       color: 'white',
                       border: 'none',
                       borderRadius: '4px',
                       cursor: 'pointer'
                     }}
                   >
                     Aplicar Filtros
                   </button>
                 </div>
               </div>
             </div>

             {/* Lista de Logs */}
             <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
               {auditLogs.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)' }}>
                   Nenhum log encontrado com os filtros aplicados
                 </div>
               ) : (
                 <div>
                   <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--gray)' }}>
                     {auditLogs.length} log(s) encontrado(s)
                   </div>
                   {auditLogs.map((log, index) => (
                     <div
                       key={index}
                       style={{
                         border: '1px solid #e0e0e0',
                         borderRadius: '8px',
                         padding: '16px',
                         marginBottom: '12px',
                         background: 'white'
                       }}
                     >
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <span style={{
                             padding: '4px 8px',
                             borderRadius: '4px',
                             fontSize: '12px',
                             fontWeight: 'bold',
                             background: log.acao === 'create' ? '#e8f5e8' : 
                                        log.acao === 'update' ? '#fff3cd' : 
                                        log.acao === 'delete' ? '#f8d7da' : '#e3f2fd',
                             color: log.acao === 'create' ? '#2e7d32' : 
                                    log.acao === 'update' ? '#856404' : 
                                    log.acao === 'delete' ? '#721c24' : '#1976d2'
                           }}>
                             {getActionLabel(log.acao)}
                           </span>
                           <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                             por {log.usuario_nome || 'Usuário desconhecido'}
                           </span>
                         </div>
                         <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                           {formatDate(log.timestamp)}
                         </span>
                       </div>
                       
                       {log.detalhes && (
                         <div style={{ fontSize: '12px', color: 'var(--dark-gray)' }}>
                           {log.detalhes.changes && (
                             <div style={{ marginBottom: '8px' }}>
                               <strong>Mudanças Realizadas:</strong>
                               <div style={{ marginLeft: '12px', marginTop: '8px' }}>
                                 {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                   <div key={field} style={{ 
                                     marginBottom: '6px', 
                                     padding: '8px', 
                                     background: '#f8f9fa', 
                                     borderRadius: '4px',
                                     border: '1px solid #e9ecef'
                                   }}>
                                     <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '4px' }}>
                                       {getFieldLabel(field)}:
                                     </div>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                                       <span style={{ color: '#721c24' }}>
                                         <strong>Antes:</strong> {formatFieldValue(field, change.from)}
                                       </span>
                                       <span style={{ color: '#6c757d' }}>→</span>
                                       <span style={{ color: '#2e7d32' }}>
                                         <strong>Depois:</strong> {formatFieldValue(field, change.to)}
                                       </span>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}
                           {log.detalhes.requestBody && !log.detalhes.changes && (
                             <div>
                               <strong>Dados do Ajudante:</strong>
                               <div style={{ 
                                 marginLeft: '12px', 
                                 marginTop: '8px',
                                 display: 'grid',
                                 gridTemplateColumns: '1fr 1fr',
                                 gap: '8px'
                               }}>
                                 {Object.entries(log.detalhes.requestBody).map(([field, value]) => (
                                   <div key={field} style={{ 
                                     padding: '6px 8px', 
                                     background: '#f8f9fa', 
                                     borderRadius: '4px',
                                     border: '1px solid #e9ecef',
                                     fontSize: '11px'
                                   }}>
                                     <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '2px' }}>
                                       {getFieldLabel(field)}:
                                     </div>
                                     <div style={{ color: '#2e7d32' }}>
                                       {formatFieldValue(field, value)}
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}
                           {log.resource_id && (
                             <div style={{ 
                               marginTop: '8px', 
                               padding: '6px 8px', 
                               background: '#e3f2fd', 
                               borderRadius: '4px',
                               border: '1px solid #bbdefb',
                               fontSize: '11px'
                             }}>
                               <strong>ID do Ajudante:</strong> {log.resource_id}
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

export default Ajudantes; 