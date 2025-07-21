import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import LoadingSpinner from '../components/LoadingSpinner';

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
  padding: 24px;
  width: 100%;
  max-width: 90vw;
  width: 1000px;
  max-height: 95vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  grid-column: 1 / -1;
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
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

// Adicionar styled para abas
const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;
const Tab = styled.button`
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.active ? 'var(--primary-green)' : 'var(--dark-gray)'};
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-green)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
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
  const [activeTab, setActiveTab] = useState('dados');
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [loadingAlmoxarifados, setLoadingAlmoxarifados] = useState(false);
  const [showAlmoxarifadoModal, setShowAlmoxarifadoModal] = useState(false);
  const [editingAlmoxarifado, setEditingAlmoxarifado] = useState(null);

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

  // Carregar almoxarifados da filial selecionada
  const loadAlmoxarifados = async (filialId) => {
    setLoadingAlmoxarifados(true);
    try {
      const res = await api.get(`/filiais/${filialId}/almoxarifados`);
      setAlmoxarifados(res.data);
    } catch (err) {
      toast.error('Erro ao carregar almoxarifados');
    } finally {
      setLoadingAlmoxarifados(false);
    }
  };

  useEffect(() => {
    loadFiliais();
  }, []);

  // Ao abrir modal de edição/visualização, carregar almoxarifados
  useEffect(() => {
    if (showModal && editingFilial && editingFilial.id) {
      loadAlmoxarifados(editingFilial.id);
    } else {
      setAlmoxarifados([]);
    }
  }, [showModal, editingFilial]);

  // Filtros
  const filteredFiliais = filiais.filter(filial => {
    const matchesSearch = filial.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || filial.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || filial.status === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <LoadingSpinner inline={true} text="Carregando filiais..." />
        </div>
      </Container>
    );
  }

  // Modal handlers
  const handleAddFilial = () => {
    setEditingFilial(null);
    setViewMode(false);
    reset();
    setShowModal(true);
  };

  const handleEditFilial = (filial) => {
    setEditingFilial(filial);
    setViewMode(false);
    // Preencher o formulário com os dados da filial
    Object.keys(filial).forEach(key => {
      setValue(key, filial[key]);
    });
    setShowModal(true);
  };

  const handleViewFilial = (filial) => {
    setEditingFilial(filial);
    setViewMode(true);
    // Preencher o formulário com os dados da filial
    Object.keys(filial).forEach(key => {
      setValue(key, filial[key]);
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFilial(null);
    setViewMode(false);
    reset();
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
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          {canCreate('filiais') && (
            <AddButton onClick={handleAddFilial}>
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

      {filteredFiliais.length === 0 ? (
        <EmptyState>
          {searchTerm || statusFilter !== 'todos' ? 
            'Nenhuma filial encontrada com os filtros aplicados' : 
            'Nenhuma filial cadastrada'
          }
        </EmptyState>
      ) : (
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
                      onClick={() => handleViewFilial(filial)}
                    >
                      <FaEye />
                    </ActionButton>
                    {canEdit('filiais') && (
                      <ActionButton
                        className="edit"
                        title="Editar"
                        onClick={() => handleEditFilial(filial)}
                      >
                        <FaEdit />
                      </ActionButton>
                    )}
                    {canDelete('filiais') && (
                      <ActionButton
                        className="delete"
                        title="Excluir"
                        onClick={() => handleDeleteFilial(filial.id)}
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
              <ModalTitle>{viewMode ? 'Visualizar Filial' : editingFilial ? 'Editar Filial' : 'Adicionar Filial'}</ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>
            <Tabs>
              <Tab active={activeTab === 'dados'} onClick={() => setActiveTab('dados')}>Dados</Tab>
              {editingFilial && editingFilial.id && (
                <Tab active={activeTab === 'almoxarifados'} onClick={() => setActiveTab('almoxarifados')}>Almoxarifados</Tab>
              )}
            </Tabs>
            {activeTab === 'dados' && (
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
            )}
            {activeTab === 'almoxarifados' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Almoxarifados da Filial</h3>
                  {!viewMode && (
                    <Button className="primary" type="button" onClick={() => { setEditingAlmoxarifado(null); setShowAlmoxarifadoModal(true); }}>
                      <FaPlus /> Novo Almoxarifado
                    </Button>
                  )}
                </div>
                {loadingAlmoxarifados ? (
                  <LoadingSpinner inline={true} text="Carregando almoxarifados..." />
                ) : almoxarifados.length === 0 ? (
                  <EmptyState>Nenhum almoxarifado cadastrado para esta filial</EmptyState>
                ) : (
                  <TableContainer>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Nome</Th>
                          <Th>Setor</Th>
                          <Th>Responsável</Th>
                          <Th>Status</Th>
                          <Th>Ações</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {almoxarifados.map(almox => (
                          <tr key={almox.id}>
                            <Td>{almox.nome}</Td>
                            <Td>{almox.setor || '-'}</Td>
                            <Td>{almox.responsavel || '-'}</Td>
                            <Td>
                              <StatusBadge $status={almox.status === 1 ? 'ativo' : 'inativo'}>
                                {almox.status === 1 ? 'Ativo' : 'Inativo'}
                              </StatusBadge>
                            </Td>
                            <Td>
                              <ActionButton title="Itens" onClick={() => {/* abrir modal de itens */}}>
                                <FaEye /> Itens
                              </ActionButton>
                              {!viewMode && (
                                <>
                                  <ActionButton title="Editar" onClick={() => { setEditingAlmoxarifado(almox); setShowAlmoxarifadoModal(true); }}>
                                    <FaEdit />
                                  </ActionButton>
                                  <ActionButton title="Excluir" onClick={async () => {
                                    if (window.confirm('Deseja excluir este almoxarifado?')) {
                                      try {
                                        await api.delete(`/filiais/almoxarifados/${almox.id}`);
                                        toast.success('Almoxarifado excluído!');
                                        loadAlmoxarifados(editingFilial.id);
                                      } catch {
                                        toast.error('Erro ao excluir almoxarifado');
                                      }
                                    }
                                  }}>
                                    <FaTrash />
                                  </ActionButton>
                                </>
                              )}
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableContainer>
                )}
              </div>
            )}
            {/* Modal de cadastro/edição de almoxarifado */}
            {showAlmoxarifadoModal && (
              <Modal onClick={() => setShowAlmoxarifadoModal(false)}>
                <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                  <ModalHeader>
                    <ModalTitle>{editingAlmoxarifado ? 'Editar Almoxarifado' : 'Novo Almoxarifado'}</ModalTitle>
                    <CloseButton onClick={() => setShowAlmoxarifadoModal(false)}>&times;</CloseButton>
                  </ModalHeader>
                  {/* Formulário de almoxarifado */}
                  {/* ... implementar ... */}
                </ModalContent>
              </Modal>
            )}
          </ModalContent>
        </Modal>
      )}
      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Auditoria - Filiais</ModalTitle>
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

export default Filiais; 