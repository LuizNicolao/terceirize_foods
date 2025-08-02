import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaHistory,
  FaQuestionCircle,
  FaDownload,
  FaFileExcel,
  FaFilePdf
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
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

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props =>
    props.status === 'ativo' ? 'var(--success-green)' :
    props.status === 'inativo' ? '#ffebee' :
    props.status === 'ferias' ? 'var(--warning-yellow)' :
    props.status === 'licenca' ? '#f3e5f5' : '#f5f5f5'};
  color: ${props =>
    props.status === 'ativo' ? 'white' :
    props.status === 'inativo' ? 'var(--error-red)' :
    props.status === 'ferias' ? 'var(--dark-gray)' :
    props.status === 'licenca' ? '#7b1fa2' : '#757575'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 16px;
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
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 90vw;
  width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  grid-column: 1 / -1;
`;

const ModalTitle = styled.h2`
  color: var(--dark-gray);
  font-size: 20px;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-height: calc(95vh - 120px);
  overflow-y: auto;
  padding-right: 8px;

  /* Estilizar scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary-green);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--dark-green);
  }
`;



const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  color: var(--dark-gray);
  font-weight: 600;
  font-size: 13px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: var(--white);
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
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
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &.primary {
    background: var(--primary-green);
    color: white;

    &:hover {
      background: var(--dark-green);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #5a6268;
    }
  }

  &.danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
    }
  }
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
  padding: 20px;
`;

const AuditModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const AuditModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AuditModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const AuditFilters = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const AuditTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const AuditTh = styled.th`
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
  font-size: 13px;
`;

const AuditTd = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  font-size: 13px;
  color: #495057;
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const ExportButton = styled.button`
  background: var(--primary-green);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: var(--dark-green);
  }

  &.xlsx {
    background: #217346;
    &:hover { background: #1e6b3d; }
  }

  &.pdf {
    background: #dc3545;
    &:hover { background: #c82333; }
  }
`;

const Motoristas = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState(null);
  const [viewingMotorista, setViewingMotorista] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilters, setAuditFilters] = useState({
    dataInicio: '',
    dataFim: '',
    acao: '',
    usuario: ''
  });

  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  // Carregar motoristas
  const loadMotoristas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/motoristas');
      setMotoristas(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      toast.error('Erro ao carregar motoristas');
      setMotoristas([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.dataInicio) params.append('data_inicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('data_fim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario) params.append('usuario_id', auditFilters.usuario);
      params.append('recurso', 'motoristas');

      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    }
  };

  useEffect(() => {
    loadMotoristas();
  }, []);

  useEffect(() => {
    if (auditModalOpen) {
      loadAuditLogs();
    }
  }, [auditModalOpen, auditFilters]);

  // Abrir modal de auditoria
  const handleOpenAuditModal = () => {
    setAuditModalOpen(true);
  };

  // Fechar modal de auditoria
  const handleCloseAuditModal = () => {
    setAuditModalOpen(false);
    setAuditFilters({
      dataInicio: '',
      dataFim: '',
      acao: '',
      usuario: ''
    });
  };

  // Aplicar filtros de auditoria
  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  // Exportar auditoria para XLSX
  const handleExportXLSX = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.dataInicio) params.append('data_inicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('data_fim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario) params.append('usuario_id', auditFilters.usuario);
      params.append('recurso', 'motoristas');

      const response = await api.get(`/auditoria/export/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_motoristas_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar auditoria:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Exportar auditoria para PDF
  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.dataInicio) params.append('data_inicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('data_fim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario) params.append('usuario_id', auditFilters.usuario);
      params.append('recurso', 'motoristas');

      const response = await api.get(`/auditoria/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_motoristas_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar auditoria:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Funções utilitárias
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'CREATE': return 'Criação';
      case 'UPDATE': return 'Atualização';
      case 'DELETE': return 'Exclusão';
      default: return action;
    }
  };

  const getFieldLabel = (field) => {
    const labels = {
      nome: 'Nome',
      cpf: 'CPF',
      cnh: 'CNH',
      categoria_cnh: 'Categoria CNH',
      telefone: 'Telefone',
      email: 'Email',
      endereco: 'Endereço',
      status: 'Status',
      data_admissao: 'Data de Admissão',
      observacoes: 'Observações',
      filial_id: 'Filial'
    };
    return labels[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined) return '-';
    
    switch (field) {
      case 'data_admissao':
        return formatDate(value);
      case 'status':
        return value === 'ativo' ? 'Ativo' : 
               value === 'inativo' ? 'Inativo' : 
               value === 'ferias' ? 'Férias' : 
               value === 'licenca' ? 'Licença' : value;
      default:
        return value.toString();
    }
  };

  // Handlers
  const handleAddMotorista = () => {
    setEditingMotorista(null);
    setViewingMotorista(null);
    reset();
    setModalOpen(true);
  };

  const handleViewMotorista = (motorista) => {
    setViewingMotorista(motorista);
    setEditingMotorista(null);
    setValue('nome', motorista.nome);
    setValue('cpf', motorista.cpf);
    setValue('cnh', motorista.cnh);
    setValue('categoria_cnh', motorista.categoria_cnh);
    setValue('telefone', motorista.telefone);
    setValue('email', motorista.email);
    setValue('endereco', motorista.endereco);
    setValue('status', motorista.status);
    setValue('data_admissao', motorista.data_admissao);
    setValue('observacoes', motorista.observacoes);
    setValue('filial_id', motorista.filial_id);
    setModalOpen(true);
  };

  const handleEditMotorista = (motorista) => {
    setEditingMotorista(motorista);
    setViewingMotorista(null);
    setValue('nome', motorista.nome);
    setValue('cpf', motorista.cpf);
    setValue('cnh', motorista.cnh);
    setValue('categoria_cnh', motorista.categoria_cnh);
    setValue('telefone', motorista.telefone);
    setValue('email', motorista.email);
    setValue('endereco', motorista.endereco);
    setValue('status', motorista.status);
    setValue('data_admissao', motorista.data_admissao);
    setValue('observacoes', motorista.observacoes);
    setValue('filial_id', motorista.filial_id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingMotorista(null);
    setViewingMotorista(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingMotorista) {
        await api.put(`/motoristas/${editingMotorista.id}`, data);
        toast.success('Motorista atualizado com sucesso!');
      } else {
        await api.post('/motoristas', data);
        toast.success('Motorista criado com sucesso!');
      }
      
      handleCloseModal();
      loadMotoristas();
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao salvar motorista';
      toast.error(errorMessage);
    }
  };

  const handleDeleteMotorista = async (motoristaId) => {
    if (!window.confirm('Tem certeza que deseja excluir este motorista?')) {
      return;
    }

    try {
      await api.delete(`/motoristas/${motoristaId}`);
      toast.success('Motorista excluído com sucesso!');
      loadMotoristas();
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
      toast.error('Erro ao excluir motorista');
    }
  };

  // Filtrar motoristas
  const filteredMotoristas = motoristas.filter(motorista => {
    const matchesSearch = !searchTerm || 
      motorista.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.cpf?.includes(searchTerm) ||
      motorista.cnh?.includes(searchTerm) ||
      motorista.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || motorista.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container>
        <div>Carregando motoristas...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gestão de Motoristas</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          {canCreate('motoristas') && (
            <AddButton onClick={handleAddMotorista}>
              <FaPlus />
              Adicionar Motorista
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
        placeholder="Buscar por nome, CPF, CNH ou email..."
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
              <Th>CNH</Th>
              <Th>Categoria</Th>
              <Th>Telefone</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredMotoristas.length === 0 ? (
              <tr>
                <Td colSpan="8">
                  <EmptyState>
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Nenhum motorista encontrado com os filtros aplicados'
                      : 'Nenhum motorista cadastrado'
                    }
                  </EmptyState>
                </Td>
              </tr>
            ) : (
              filteredMotoristas.map((motorista) => (
                <tr key={motorista.id}>
                  <Td>{motorista.nome}</Td>
                  <Td>{motorista.cpf || '-'}</Td>
                  <Td>{motorista.cnh || '-'}</Td>
                  <Td>{motorista.categoria_cnh || '-'}</Td>
                  <Td>{motorista.telefone || '-'}</Td>
                  <Td>{motorista.email || '-'}</Td>
                  <Td>
                    <StatusBadge status={motorista.status}>
                      {motorista.status === 'ativo' ? 'Ativo' : 
                       motorista.status === 'inativo' ? 'Inativo' : 
                       motorista.status === 'ferias' ? 'Férias' : 
                       motorista.status === 'licenca' ? 'Licença' : motorista.status}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleViewMotorista(motorista)}
                    >
                      <FaEye />
                    </ActionButton>
                    {canEdit('motoristas') && (
                      <ActionButton
                        className="edit"
                        title="Editar"
                        onClick={() => handleEditMotorista(motorista)}
                      >
                        <FaEdit />
                      </ActionButton>
                    )}
                    {canDelete('motoristas') && (
                      <ActionButton
                        className="delete"
                        title="Excluir"
                        onClick={() => handleDeleteMotorista(motorista.id)}
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

      {/* Modal de Motorista */}
      {modalOpen && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {viewingMotorista ? 'Visualizar Motorista' : 
                 editingMotorista ? 'Editar Motorista' : 'Novo Motorista'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome *</Label>
                <Input
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  disabled={!!viewingMotorista}
                  placeholder="Nome completo"
                />
                {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>CPF</Label>
                <Input
                  {...register('cpf')}
                  disabled={!!viewingMotorista}
                  placeholder="000.000.000-00"
                />
              </FormGroup>

              <FormGroup>
                <Label>CNH</Label>
                <Input
                  {...register('cnh')}
                  disabled={!!viewingMotorista}
                  placeholder="Número da CNH"
                />
              </FormGroup>

              <FormGroup>
                <Label>Categoria CNH</Label>
                <Select {...register('categoria_cnh')} disabled={!!viewingMotorista}>
                  <option value="">Selecione</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="AB">AB</option>
                  <option value="AC">AC</option>
                  <option value="AD">AD</option>
                  <option value="AE">AE</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Telefone</Label>
                <Input
                  {...register('telefone')}
                  disabled={!!viewingMotorista}
                  placeholder="(00) 00000-0000"
                />
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  {...register('email')}
                  type="email"
                  disabled={!!viewingMotorista}
                  placeholder="email@exemplo.com"
                />
              </FormGroup>

              <FormGroup>
                <Label>Endereço</Label>
                <TextArea
                  {...register('endereco')}
                  disabled={!!viewingMotorista}
                  placeholder="Endereço completo"
                />
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select {...register('status')} disabled={!!viewingMotorista}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="ferias">Férias</option>
                  <option value="licenca">Licença</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Data de Admissão</Label>
                <Input
                  {...register('data_admissao')}
                  type="date"
                  disabled={!!viewingMotorista}
                />
              </FormGroup>

              <FormGroup>
                <Label>Observações</Label>
                <TextArea
                  {...register('observacoes')}
                  disabled={!!viewingMotorista}
                  placeholder="Observações adicionais"
                />
              </FormGroup>

              {!viewingMotorista && (
                <ButtonGroup>
                  <Button type="button" className="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="primary">
                    {editingMotorista ? 'Atualizar' : 'Criar'}
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
              <ModalTitle>Relatório de Auditoria - Motoristas</ModalTitle>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleExportXLSX}
                  title="Exportar para Excel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'var(--dark-green)'}
                  onMouseOut={(e) => e.target.style.background = 'var(--primary-green)'}
                >
                  <FaFileExcel />
                  Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  title="Exportar para PDF"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'var(--dark-green)'}
                  onMouseOut={(e) => e.target.style.background = 'var(--primary-green)'}
                >
                  <FaFilePdf />
                  PDF
                </button>
                <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
              </div>
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
                    value={auditFilters.dataInicio}
                    onChange={(e) => setAuditFilters({...auditFilters, dataInicio: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={auditFilters.dataFim}
                    onChange={(e) => setAuditFilters({...auditFilters, dataFim: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Ação
                  </label>
                  <select
                    value={auditFilters.acao}
                    onChange={(e) => setAuditFilters({...auditFilters, acao: e.target.value})}
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
                    Usuário
                  </label>
                  <input
                    type="text"
                    value={auditFilters.usuario}
                    onChange={(e) => setAuditFilters({...auditFilters, usuario: e.target.value})}
                    placeholder="Nome do usuário"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
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
                              <strong>Dados do Motorista:</strong>
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
                              <strong>ID do Motorista:</strong> {log.resource_id}
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

export default Motoristas; 