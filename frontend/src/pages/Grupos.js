import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaLayerGroup, FaQuestionCircle } from 'react-icons/fa';
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



const Grupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  // Carregar grupos
  const loadGrupos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/grupos');
      setGrupos(response.data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrupos();
  }, []);

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      
      const params = new URLSearchParams();
      
      // Aplicar filtro de período se selecionado
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        // Usar filtros manuais se período não estiver selecionado
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para grupos
      params.append('recurso', 'grupos');
      
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
      usuario_id: '',
      periodo: ''
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

  // Obter label do campo
  const getFieldLabel = (field) => {
    const labels = {
      'nome': 'Nome',
      'status': 'Status'
    };
    return labels[field] || field;
  };

  // Formatar valor do campo
  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return 'Não informado';
    }

    switch (field) {
      case 'status':
        return value === 1 ? 'Ativo' : 'Inativo';
      default:
        return value;
    }
  };

  // Abrir modal para adicionar grupo
  const handleAddGrupo = () => {
    setEditingGrupo(null);
    reset();
    setShowModal(true);
  };

  // Abrir modal para editar grupo
  const handleEditGrupo = (grupo) => {
    setEditingGrupo(grupo);
    setValue('nome', grupo.nome);
    setValue('status', grupo.status.toString());
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGrupo(null);
    reset();
  };

  // Salvar grupo
  const onSubmit = async (data) => {
    try {
      if (editingGrupo) {
        // Para edição, enviar apenas os campos que foram alterados
        const updateData = {};
        
        if (data.nome !== editingGrupo.nome) {
          updateData.nome = data.nome;
        }
        
        if (parseInt(data.status) !== editingGrupo.status) {
          updateData.status = parseInt(data.status);
        }
        
        // Se não há campos para atualizar, mostrar erro
        if (Object.keys(updateData).length === 0) {
          toast.error('Nenhum campo foi alterado');
          return;
        }
        
        await api.put(`/grupos/${editingGrupo.id}`, updateData);
        toast.success('Grupo atualizado com sucesso!');
      } else {
        // Para criação, enviar todos os campos
        const formData = {
          ...data,
          status: parseInt(data.status)
        };
        
        await api.post('/grupos', formData);
        toast.success('Grupo criado com sucesso!');
      }
      
      handleCloseModal();
      loadGrupos();
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar grupo');
    }
  };

  // Excluir grupo
  const handleDeleteGrupo = async (grupoId) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      try {
        await api.delete(`/grupos/${grupoId}`);
        toast.success('Grupo excluído com sucesso!');
        loadGrupos();
      } catch (error) {
        console.error('Erro ao excluir grupo:', error);
        toast.error(error.response?.data?.error || 'Erro ao excluir grupo');
      }
    }
  };

  // Filtrar grupos
  const filteredGrupos = grupos.filter(grupo => {
    const matchesSearch = grupo.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || grupo.status === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });



  if (loading) {
    return (
      <Container>
        <div>Carregando grupos...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Grupos</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          <AddButton onClick={handleAddGrupo}>
            <FaPlus />
            Adicionar Grupo
          </AddButton>
        </div>
      </Header>



      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar por nome..."
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
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredGrupos.length === 0 ? (
                <tr>
                  <Td colSpan="3">
                    <EmptyState>
                      {searchTerm || statusFilter !== 'todos' 
                        ? 'Nenhum grupo encontrado com os filtros aplicados'
                        : 'Nenhum grupo cadastrado'
                      }
                    </EmptyState>
                  </Td>
                </tr>
              ) : (
                filteredGrupos.map((grupo) => (
                  <tr key={grupo.id}>
                    <Td>{grupo.nome}</Td>
                    <Td>
                      <StatusBadge status={grupo.status === 1 ? 'ativo' : 'inativo'}>
                        {grupo.status === 1 ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionButton
                        className="view"
                        title="Visualizar"
                        onClick={() => handleEditGrupo(grupo)}
                      >
                        <FaEye />
                      </ActionButton>
                      <ActionButton
                        className="edit"
                        title="Editar"
                        onClick={() => handleEditGrupo(grupo)}
                      >
                        <FaEdit />
                      </ActionButton>
                      <ActionButton
                        className="delete"
                        title="Excluir"
                        onClick={() => handleDeleteGrupo(grupo.id)}
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
                {editingGrupo ? 'Editar Grupo' : 'Adicionar Grupo'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome do Grupo *</Label>
                <Input
                  type="text"
                  placeholder="Nome do grupo"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                />
                {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select {...register('status', { required: 'Status é obrigatório' })}>
                  <option value="">Selecione...</option>
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </Select>
                {errors.status && <span style={{ color: 'red', fontSize: '12px' }}>{errors.status.message}</span>}
              </FormGroup>

              <ButtonGroup>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="primary">
                  {editingGrupo ? 'Atualizar' : 'Criar'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '1200px', 
              width: '95%', 
              maxHeight: '90vh',
              padding: '24px'
            }}
          >
            <ModalHeader>
              <ModalTitle>Auditoria - Grupos</ModalTitle>
              <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
            </ModalHeader>

            {/* Filtros de Auditoria */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px', 
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Período Rápido</Label>
                <Select
                  value={auditFilters.periodo}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, periodo: e.target.value }))}
                  style={{ fontSize: '12px', padding: '8px' }}
                >
                  <option value="">Selecione...</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                  <option value="todos">Todos</option>
                </Select>
              </div>

              <div>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Data Início</Label>
                <Input
                  type="date"
                  value={auditFilters.dataInicio}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, dataInicio: e.target.value, periodo: '' }))}
                  style={{ fontSize: '12px', padding: '8px' }}
                />
              </div>

              <div>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Data Fim</Label>
                <Input
                  type="date"
                  value={auditFilters.dataFim}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, dataFim: e.target.value, periodo: '' }))}
                  style={{ fontSize: '12px', padding: '8px' }}
                />
              </div>

              <div>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Ação</Label>
                <Select
                  value={auditFilters.acao}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, acao: e.target.value }))}
                  style={{ fontSize: '12px', padding: '8px' }}
                >
                  <option value="">Todas</option>
                  <option value="create">Criar</option>
                  <option value="update">Editar</option>
                  <option value="delete">Excluir</option>
                </Select>
              </div>

              <div style={{ display: 'flex', alignItems: 'end' }}>
                <Button 
                  onClick={handleApplyAuditFilters}
                  style={{ 
                    fontSize: '12px', 
                    padding: '8px 16px',
                    background: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>

            {/* Tabela de Logs */}
            <div style={{ 
              maxHeight: '500px', 
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: '8px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e0e0e0' }}>
                      Data/Hora
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e0e0e0' }}>
                      Usuário
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e0e0e0' }}>
                      Ação
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #e0e0e0' }}>
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLoading ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '20px', textAlign: 'center', fontSize: '14px' }}>
                        Carregando logs...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        Nenhum log encontrado
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                          {formatDate(log.data_hora)}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          {log.nome_usuario || 'Usuário não encontrado'}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '600',
                            backgroundColor: 
                              log.acao === 'create' ? '#e8f5e8' :
                              log.acao === 'update' ? '#fff3e0' :
                              log.acao === 'delete' ? '#ffebee' : '#f5f5f5',
                            color: 
                              log.acao === 'create' ? '#2e7d32' :
                              log.acao === 'update' ? '#f57c00' :
                              log.acao === 'delete' ? '#d32f2f' : '#666'
                          }}>
                            {getActionLabel(log.acao)}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          <div style={{ maxWidth: '300px' }}>
                            {log.detalhes && (
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Mudanças:</strong>
                                <div style={{ 
                                  backgroundColor: '#f8f9fa', 
                                  padding: '8px', 
                                  borderRadius: '4px',
                                  marginTop: '4px',
                                  fontSize: '11px',
                                  fontFamily: 'monospace'
                                }}>
                                  {log.detalhes}
                                </div>
                              </div>
                            )}
                            {log.ip_address && (
                              <div style={{ fontSize: '11px', color: '#666' }}>
                                IP: {log.ip_address}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Grupos; 