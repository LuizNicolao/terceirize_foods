import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';

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
  background: var(--primary-green);
  color: var(--white);
  padding: 12px;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--white);
  background: ${props => props.$status === 'ativo' ? 'var(--primary-green)' : 'var(--gray)'};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-green);
  font-size: 18px;
  margin-right: 8px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--dark-green);
  }

  &.delete {
    color: var(--red);
    &:hover {
      color: var(--dark-red);
    }
  }
`;

// Adicionar styled-components para Modal, Form, etc. (copiado de Unidades/Clientes)
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
    color: var(--red);
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
  font-weight: 600;
  color: var(--dark-gray);
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
  cursor: pointer;
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
  margin-top: 8px;
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

const Filiais = () => {
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFilial, setEditingFilial] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
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

  const { canCreate, canEdit, canDelete } = usePermissions();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      setLoading(true);
      const response = await api.get('/filiais');
      setFiliais(response.data);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiliais();
  }, []);

  // Filtros
  const filteredFiliais = filiais.filter(filial => {
    const matchesSearch = filial.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || filial.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || filial.status === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container>
        <div>Carregando filiais...</div>
      </Container>
    );
  }

  // Modal handlers
  const handleAddFilial = () => {
    setEditingFilial(null);
    reset();
    setShowModal(true);
    setViewMode(false);
  };
  const handleEditFilial = (filial) => {
    setEditingFilial(filial);
    setValue('nome', filial.nome);
    setValue('logradouro', filial.logradouro);
    setValue('numero', filial.numero);
    setValue('bairro', filial.bairro);
    setValue('cep', filial.cep);
    setValue('cidade', filial.cidade);
    setValue('estado', filial.estado);
    setValue('supervisao', filial.supervisao);
    setValue('coordenacao', filial.coordenacao);
    setValue('centro_distribuicao', filial.centro_distribuicao);
    setValue('regional', filial.regional);
    setValue('rota_id', filial.rota_id);
    setValue('lote', filial.lote);
    setValue('abastecimento', filial.abastecimento);
    setValue('status', filial.status);
    setShowModal(true);
    setViewMode(false);
  };
  const handleViewFilial = (filial) => {
    setEditingFilial(filial);
    setValue('nome', filial.nome);
    setValue('logradouro', filial.logradouro);
    setValue('numero', filial.numero);
    setValue('bairro', filial.bairro);
    setValue('cep', filial.cep);
    setValue('cidade', filial.cidade);
    setValue('estado', filial.estado);
    setValue('supervisao', filial.supervisao);
    setValue('coordenacao', filial.coordenacao);
    setValue('centro_distribuicao', filial.centro_distribuicao);
    setValue('regional', filial.regional);
    setValue('rota_id', filial.rota_id);
    setValue('lote', filial.lote);
    setValue('abastecimento', filial.abastecimento);
    setValue('status', filial.status);
    setShowModal(true);
    setViewMode(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFilial(null);
    reset();
    setViewMode(false);
  };
  // CRUD
  const onSubmit = async (data) => {
    try {
      if (editingFilial) {
        // Atualizar
        const updateData = {};
        Object.keys(data).forEach((key) => {
          if (data[key] !== editingFilial[key]) {
            updateData[key] = data[key];
          }
        });
        if (Object.keys(updateData).length === 0) {
          toast.error('Nenhum campo foi alterado');
          return;
        }
        await api.put(`/filiais/${editingFilial.id}`, updateData);
        toast.success('Filial atualizada com sucesso!');
      } else {
        // Criar
        const createData = { ...data };
        if (createData.status) createData.status = parseInt(createData.status);
        await api.post('/filiais', createData);
        toast.success('Filial criada com sucesso!');
      }
      handleCloseModal();
      loadFiliais();
    } catch (error) {
      console.error('Erro ao salvar filial:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar filial');
    }
  };
  const handleDeleteFilial = async (filialId) => {
    if (window.confirm('Tem certeza que deseja excluir esta filial?')) {
      try {
        await api.delete(`/filiais/${filialId}`);
        toast.success('Filial excluída com sucesso!');
        loadFiliais();
      } catch (error) {
        console.error('Erro ao excluir filial:', error);
        toast.error(error.response?.data?.error || 'Erro ao excluir filial');
      }
    }
  };
  // Auditoria
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
      params.append('recurso', 'filiais');
      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };
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

  return (
    <Container>
      <Header>
        <Title>Filiais</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={() => setShowAuditModal(true)}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          {canCreate('filiais') && (
            <AddButton onClick={() => { setShowModal(true); setEditingFilial(null); setViewMode(false); }}>
              <FaPlus />
              Adicionar Filial
            </AddButton>
          )}
        </div>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar por nome ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </FilterSelect>
      </SearchContainer>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Cidade</Th>
              <Th>Estado</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredFiliais.map(filial => (
              <tr key={filial.id}>
                <Td>{filial.nome}</Td>
                <Td>{filial.cidade}</Td>
                <Td>{filial.estado}</Td>
                <Td>
                  <StatusBadge $status={filial.status === 1 ? 'ativo' : 'inativo'}>
                    {filial.status === 1 ? 'Ativo' : 'Inativo'}
                  </StatusBadge>
                </Td>
                <Td>
                  <ActionButton
                    className="view"
                    title="Visualizar"
                    onClick={() => { setEditingFilial(filial); setViewMode(true); setShowModal(true); }}
                  >
                    <FaEye />
                  </ActionButton>
                  {canEdit('filiais') && (
                    <ActionButton
                      className="edit"
                      title="Editar"
                      onClick={() => { setEditingFilial(filial); setViewMode(false); setShowModal(true); }}
                    >
                      <FaEdit />
                    </ActionButton>
                  )}
                  {canDelete('filiais') && (
                    <ActionButton
                      className="delete"
                      title="Excluir"
                      onClick={() => {/* handleDeleteFilial(filial.id) */}}
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

      {/* Modal de Cadastro/Edição/Visualização */}
      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{viewMode ? 'Visualizar Filial' : editingFilial ? 'Editar Filial' : 'Adicionar Filial'}</ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome *</Label>
                <Input type="text" placeholder="Nome da filial" {...register('nome', { required: 'Nome é obrigatório' })} disabled={viewMode} />
                {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
              </FormGroup>
              <FormGroup>
                <Label>Logradouro</Label>
                <Input type="text" placeholder="Rua, avenida, etc." {...register('logradouro')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Número</Label>
                <Input type="text" placeholder="Número" {...register('numero')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Bairro</Label>
                <Input type="text" placeholder="Bairro" {...register('bairro')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>CEP</Label>
                <Input type="text" placeholder="00000-000" {...register('cep')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Cidade</Label>
                <Input type="text" placeholder="Cidade" {...register('cidade')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Estado</Label>
                <Select {...register('estado')} disabled={viewMode}>
                  <option value="">Selecione...</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Supervisão</Label>
                <Input type="text" placeholder="Supervisão" {...register('supervisao')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Coordenação</Label>
                <Input type="text" placeholder="Coordenação" {...register('coordenacao')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Centro de Distribuição</Label>
                <Input type="text" placeholder="Centro de Distribuição" {...register('centro_distribuicao')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Regional</Label>
                <Input type="text" placeholder="Regional" {...register('regional')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Rota ID</Label>
                <Input type="text" placeholder="Rota ID" {...register('rota_id')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Lote</Label>
                <Input type="text" placeholder="Lote" {...register('lote')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Abastecimento</Label>
                <Input type="text" placeholder="Abastecimento" {...register('abastecimento')} disabled={viewMode} />
              </FormGroup>
              <FormGroup>
                <Label>Status</Label>
                <Select {...register('status', { required: 'Status é obrigatório' })} disabled={viewMode}>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </Select>
                {errors.status && <span style={{ color: 'red', fontSize: '12px' }}>{errors.status.message}</span>}
              </FormGroup>
              <ButtonGroup>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  {viewMode ? 'Fechar' : 'Cancelar'}
                </Button>
                {!viewMode && (
                  <Button type="submit" className="primary">
                    {editingFilial ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                )}
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95%', maxHeight: '90vh', padding: '24px' }}>
            <ModalHeader>
              <ModalTitle>Auditoria - Filiais</ModalTitle>
              <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
            </ModalHeader>
            {/* Filtros de Auditoria */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Período Rápido</Label>
                <Select value={auditFilters.periodo} onChange={e => setAuditFilters(prev => ({ ...prev, periodo: e.target.value }))} style={{ fontSize: '12px', padding: '8px' }}>
                  <option value="">Selecione...</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                  <option value="todos">Todos</option>
                </Select>
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Data Início</Label>
                <Input type="date" value={auditFilters.dataInicio} onChange={e => setAuditFilters(prev => ({ ...prev, dataInicio: e.target.value, periodo: '' }))} style={{ fontSize: '12px', padding: '8px' }} />
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Data Fim</Label>
                <Input type="date" value={auditFilters.dataFim} onChange={e => setAuditFilters(prev => ({ ...prev, dataFim: e.target.value, periodo: '' }))} style={{ fontSize: '12px', padding: '8px' }} />
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Ação</Label>
                <Select value={auditFilters.acao} onChange={e => setAuditFilters(prev => ({ ...prev, acao: e.target.value }))} style={{ fontSize: '12px', padding: '8px' }}>
                  <option value="">Todas</option>
                  <option value="create">Criar</option>
                  <option value="update">Editar</option>
                  <option value="delete">Excluir</option>
                </Select>
              </div>
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <Button onClick={handleApplyAuditFilters} style={{ fontSize: '12px', padding: '8px 16px', background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
            {/* Lista de Logs */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {auditLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Carregando logs...</div>
              ) : auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)' }}>
                  Nenhum log encontrado com os filtros aplicados
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--gray)' }}>
                    {auditLogs.length} log(s) encontrado(s)
                  </div>
                  {auditLogs.map((log, index) => (
                    <div key={index} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: '12px', background: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: log.acao === 'create' ? '#e8f5e8' : log.acao === 'update' ? '#fff3cd' : log.acao === 'delete' ? '#f8d7da' : '#e3f2fd', color: log.acao === 'create' ? '#2e7d32' : log.acao === 'update' ? '#856404' : log.acao === 'delete' ? '#721c24' : '#1976d2' }}>
                            {log.acao === 'create' ? 'Criar' : log.acao === 'update' ? 'Editar' : log.acao === 'delete' ? 'Excluir' : log.acao}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                            por {log.usuario_nome || 'Usuário desconhecido'}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {log.detalhes && (
                        <div style={{ fontSize: '12px', color: 'var(--dark-gray)' }}>
                          {log.detalhes.changes && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Mudanças Realizadas:</strong>
                              <div style={{ marginLeft: '12px', marginTop: '8px' }}>
                                {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                  <div key={field} style={{ marginBottom: '6px', padding: '8px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '4px' }}>{field}:</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                                      <span style={{ color: '#721c24' }}><strong>Antes:</strong> {change.from ?? 'Não informado'}</span>
                                      <span style={{ color: '#6c757d' }}>→</span>
                                      <span style={{ color: '#2e7d32' }}><strong>Depois:</strong> {change.to ?? 'Não informado'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.detalhes.requestBody && !log.detalhes.changes && (
                            <div>
                              <strong>Dados da Filial:</strong>
                              <div style={{ marginLeft: '12px', marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {Object.entries(log.detalhes.requestBody).map(([field, value]) => (
                                  <div key={field} style={{ padding: '6px 8px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef', fontSize: '11px' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '2px' }}>{field}:</div>
                                    <div style={{ color: '#2e7d32' }}>{value ?? 'Não informado'}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.detalhes.resourceId && (
                            <div style={{ marginTop: '8px', padding: '6px 8px', background: '#e3f2fd', borderRadius: '4px', fontSize: '11px' }}>
                              <strong>ID da Filial:</strong> <span style={{ color: '#1976d2', marginLeft: '4px' }}>#{log.detalhes.resourceId}</span>
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

export default Filiais; 