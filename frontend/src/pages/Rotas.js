import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import LoadingSpinner from '../components/LoadingSpinner';
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

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== '$status'
})`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$status === 'ativo' ? 'var(--success-green)' : '#ffebee'};
  color: ${props => props.$status === 'ativo' ? 'white' : 'var(--error-red)'};
`;

const TipoRotaBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== '$tipo'
})`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => {
    switch (props.$tipo) {
      case 'semanal': return '#e3f2fd';
      case 'quinzenal': return '#f3e5f5';
      case 'mensal': return '#e8f5e8';
      case 'transferencia': return '#fff3e0';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.$tipo) {
      case 'semanal': return '#1976d2';
      case 'quinzenal': return '#7b1fa2';
      case 'mensal': return '#388e3c';
      case 'transferencia': return '#f57c00';
      default: return '#666';
    }
  }};
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
    color: var(--primary-green);
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
  padding: 24px;
  width: 100%;
  max-width: 90vw;
  width: 800px;
  max-height: 95vh;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  grid-column: 1 / -1;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  
  .close-button {
    margin-left: 8px;
  }
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
  display: flex;
  flex-direction: column;
  max-height: calc(95vh - 120px);
  overflow: hidden;
  padding-right: 8px;
`;

const FormFields = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  
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

  &:disabled {
    background-color: #f5f5f5;
    color: var(--gray);
    cursor: not-allowed;
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

  &:disabled {
    background-color: #f5f5f5;
    color: var(--gray);
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }

  &:disabled {
    background-color: #f5f5f5;
    color: var(--gray);
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
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
    background: var(--light-gray);
    color: var(--dark-gray);

    &:hover {
      background: #d0d0d0;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--gray);
  font-size: 16px;
`;

const Rotas = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [rotas, setRotas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRota, setEditingRota] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [filialFilter, setFilialFilter] = useState('todos');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    dataInicio: '',
    dataFim: '',
    acao: '',
    usuario_id: '',
    periodo: ''
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues
  } = useForm();

  // Carregar rotas
  const loadRotas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rotas');
      setRotas(response.data);
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
      toast.error('Erro ao carregar rotas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      const response = await api.get('/filiais');
      setFiliais(response.data);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  };

  useEffect(() => {
    loadRotas();
    loadFiliais();
  }, []);

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const params = new URLSearchParams();
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        switch (auditFilters.periodo) {
          case '7dias': dataInicio.setDate(hoje.getDate() - 7); break;
          case '30dias': dataInicio.setDate(hoje.getDate() - 30); break;
          case '90dias': dataInicio.setDate(hoje.getDate() - 90); break;
          default: break;
        }
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        if (auditFilters.dataInicio) params.append('data_inicio', auditFilters.dataInicio);
        if (auditFilters.dataFim) params.append('data_fim', auditFilters.dataFim);
      }
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      params.append('recurso', 'rotas');
      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  // Abrir modal para adicionar rota
  const handleAddRota = () => {
    setEditingRota(null);
    reset();
    setValue('status', 'ativo');
    setValue('tipo_rota', 'semanal');
    setShowModal(true);
  };

  // Abrir modal para visualizar rota
  const handleViewRota = (rota) => {
    setEditingRota(rota);
    setValue('filial_id', rota.filial_id);
    setValue('codigo', rota.codigo);
    setValue('nome', rota.nome);
    setValue('distancia_km', rota.distancia_km);
    setValue('status', rota.status);
    setValue('tipo_rota', rota.tipo_rota);
    setValue('custo_estimado', rota.custo_estimado);
    setValue('observacoes', rota.observacoes);
    setViewMode(true);
    setShowModal(true);
  };

  // Abrir modal para editar rota
  const handleEditRota = (rota) => {
    setEditingRota(rota);
    setValue('filial_id', rota.filial_id);
    setValue('codigo', rota.codigo);
    setValue('nome', rota.nome);
    setValue('distancia_km', rota.distancia_km);
    setValue('status', rota.status);
    setValue('tipo_rota', rota.tipo_rota);
    setValue('custo_estimado', rota.custo_estimado);
    setValue('observacoes', rota.observacoes);
    setViewMode(false);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRota(null);
    setViewMode(false);
    reset();
  };

  // Salvar rota
  const onSubmit = async (data) => {
    try {
      if (editingRota) {
        await api.put(`/rotas/${editingRota.id}`, data);
        toast.success('Rota atualizada com sucesso!');
      } else {
        await api.post('/rotas', data);
        toast.success('Rota criada com sucesso!');
      }
      
      handleCloseModal();
      loadRotas();
    } catch (error) {
      console.error('Erro ao salvar rota:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar rota');
    }
  };

  // Excluir rota
  const handleDeleteRota = async (rotaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta rota?')) {
      try {
        await api.delete(`/rotas/${rotaId}`);
        toast.success('Rota excluída com sucesso!');
        loadRotas();
      } catch (error) {
        console.error('Erro ao excluir rota:', error);
        toast.error(error.response?.data?.error || 'Erro ao excluir rota');
      }
    }
  };

  // Abrir modal de auditoria
  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    loadAuditLogs();
  };

  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
    setAuditLogs([]);
    setAuditFilters({ dataInicio: '', dataFim: '', acao: '', usuario_id: '', periodo: '' });
  };
  const handleApplyAuditFilters = () => { loadAuditLogs(); };

  // Filtrar rotas
  const filteredRotas = rotas.filter(rota => {
    const matchesSearch = !searchTerm || 
      rota.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rota.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rota.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'todos' || rota.status === statusFilter;
    const matchesFilial = filialFilter === 'todos' || rota.filial_id.toString() === filialFilter;
    
    return matchesSearch && matchesStatus && matchesFilial;
  });

  // Obter nome da filial
  const getFilialName = (filialId) => {
    const filial = filiais.find(f => f.id === filialId);
    return filial ? filial.filial : 'N/A';
  };

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Rotas</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          {canCreate('rotas') && (
            <AddButton onClick={handleAddRota}>
              <FaPlus />
              Adicionar Rota
            </AddButton>
          )}
        </div>
      </Header>

      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        additionalFilters={[
          {
            label: 'Filial',
            value: filialFilter,
            onChange: setFilialFilter,
            options: [
              { value: 'todos', label: 'Todas as filiais' },
              ...filiais.map(filial => ({
                value: filial.id.toString(),
                label: filial.filial
              }))
            ]
          }
        ]}
      />

      {filteredRotas.length === 0 ? (
        <EmptyState>
          {searchTerm || statusFilter !== 'todos' || filialFilter !== 'todos' 
            ? 'Nenhuma rota encontrada com os filtros aplicados'
            : 'Nenhuma rota cadastrada'
          }
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Filial</Th>
                <Th>Código</Th>
                <Th>Nome</Th>
                <Th>Distância (km)</Th>
                <Th>Tipo</Th>
                <Th>Custo Estimado</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRotas.map((rota) => (
                <tr key={rota.id}>
                  <Td>{rota.id}</Td>
                  <Td>{getFilialName(rota.filial_id)}</Td>
                  <Td>{rota.codigo}</Td>
                  <Td>{rota.nome}</Td>
                  <Td>{rota.distancia_km}</Td>
                  <Td>
                    <TipoRotaBadge $tipo={rota.tipo_rota}>
                      {rota.tipo_rota}
                    </TipoRotaBadge>
                  </Td>
                  <Td>{formatCurrency(rota.custo_estimado)}</Td>
                  <Td>
                    <StatusBadge $status={rota.status}>
                      {rota.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton 
                      className="view" 
                      title="Visualizar" 
                      onClick={() => handleViewRota(rota)}
                    >
                      <FaEye />
                    </ActionButton>
                    {canEdit('rotas') && (
                      <ActionButton 
                        className="edit" 
                        title="Editar" 
                        onClick={() => handleEditRota(rota)}
                      >
                        <FaEdit />
                      </ActionButton>
                    )}
                    {canDelete('rotas') && (
                      <ActionButton 
                        className="delete" 
                        title="Excluir" 
                        onClick={() => handleDeleteRota(rota.id)}
                      >
                        <FaTrash />
                      </ActionButton>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Cadastro/Edição/Visualização */}
      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{viewMode ? 'Visualizar Rota' : editingRota ? 'Editar Rota' : 'Adicionar Rota'}</ModalTitle>
              <HeaderActions>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  {viewMode ? 'Fechar' : 'Cancelar'}
                </Button>
                {!viewMode && (
                  <Button type="submit" className="primary" form="rota-form">
                    {editingRota ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                )}
                <CloseButton onClick={handleCloseModal} className="close-button">&times;</CloseButton>
              </HeaderActions>
            </ModalHeader>
            
            <Form onSubmit={handleSubmit(onSubmit)} id="rota-form">
              <FormFields>
                <FormGroup>
                  <Label>Filial *</Label>
                  <Select {...register('filial_id', { required: 'Filial é obrigatória' })} disabled={viewMode}>
                    <option value="">Selecione uma filial</option>
                    {filiais.map(filial => (
                      <option key={filial.id} value={filial.id}>
                        {filial.filial}
                      </option>
                    ))}
                  </Select>
                  {errors.filial_id && <span style={{ color: 'red', fontSize: '12px' }}>{errors.filial_id.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>Código *</Label>
                  <Input 
                    type="text" 
                    placeholder="Código da rota" 
                    {...register('codigo', { required: 'Código é obrigatório' })} 
                    disabled={viewMode} 
                  />
                  {errors.codigo && <span style={{ color: 'red', fontSize: '12px' }}>{errors.codigo.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>Nome *</Label>
                  <Input 
                    type="text" 
                    placeholder="Nome da rota" 
                    {...register('nome', { required: 'Nome é obrigatório' })} 
                    disabled={viewMode} 
                  />
                  {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>Distância (km)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    {...register('distancia_km')} 
                    disabled={viewMode} 
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Tipo de Rota</Label>
                  <Select {...register('tipo_rota')} disabled={viewMode}>
                    <option value="semanal">Semanal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="mensal">Mensal</option>
                    <option value="transferencia">Transferência</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Custo Estimado</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    {...register('custo_estimado')} 
                    disabled={viewMode} 
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Status</Label>
                  <Select {...register('status')} disabled={viewMode}>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </Select>
                </FormGroup>

                <FormGroup style={{ gridColumn: '1 / -1' }}>
                  <Label>Observações</Label>
                  <TextArea 
                    placeholder="Observações sobre a rota..." 
                    {...register('observacoes')} 
                    disabled={viewMode} 
                  />
                </FormGroup>
              </FormFields>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Auditoria - Rotas</ModalTitle>
              <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
            </ModalHeader>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px', 
              marginBottom: '24px', 
              padding: '16px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px' 
            }}>
              <FormGroup>
                <Label>Período</Label>
                <Select 
                  value={auditFilters.periodo} 
                  onChange={e => setAuditFilters(prev => ({ ...prev, periodo: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                  <option value="todos">Todos</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Data Início</Label>
                <Input 
                  type="date" 
                  value={auditFilters.dataInicio} 
                  onChange={e => setAuditFilters(prev => ({ ...prev, dataInicio: e.target.value, periodo: '' }))} 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Data Fim</Label>
                <Input 
                  type="date" 
                  value={auditFilters.dataFim} 
                  onChange={e => setAuditFilters(prev => ({ ...prev, dataFim: e.target.value, periodo: '' }))} 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Ação</Label>
                <Select 
                  value={auditFilters.acao} 
                  onChange={e => setAuditFilters(prev => ({ ...prev, acao: e.target.value }))}
                >
                  <option value="">Todas</option>
                  <option value="create">Criar</option>
                  <option value="update">Editar</option>
                  <option value="delete">Excluir</option>
                </Select>
              </FormGroup>
              
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <Button className="primary" onClick={handleApplyAuditFilters}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {auditLoading ? (
                <LoadingSpinner inline={true} text="Carregando logs..." />
              ) : auditLogs.length === 0 ? (
                <EmptyState>
                  Nenhum log encontrado com os filtros aplicados
                </EmptyState>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--gray)' }}>
                    {auditLogs.length} log(s) encontrado(s)
                  </div>
                  {auditLogs.map((log, index) => (
                    <div key={index} style={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px', 
                      padding: '16px', 
                      marginBottom: '12px', 
                      background: 'white' 
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '8px' 
                      }}>
                        <div>
                          <StatusBadge $status={log.acao === 'create' ? 'ativo' : 'inativo'}>
                            {log.acao === 'create' ? 'Criar' : log.acao === 'update' ? 'Editar' : 'Excluir'}
                          </StatusBadge>
                          <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--gray)' }}>
                            por {log.usuario_nome || 'Usuário desconhecido'}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      {log.detalhes && (
                        <div style={{ fontSize: '12px', color: 'var(--dark-gray)', marginTop: '8px' }}>
                          <strong>Detalhes da operação</strong>
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

export default Rotas; 