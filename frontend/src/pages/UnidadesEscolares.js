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
  width: 1200px;
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

const UnidadesEscolares = () => {
  const [unidades, setUnidades] = useState([]);
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [rotaFilter, setRotaFilter] = useState('todos');
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

  // Carregar unidades escolares
  const loadUnidades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/unidades-escolares');
      setUnidades(response.data);
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      toast.error('Erro ao carregar unidades escolares');
    } finally {
      setLoading(false);
    }
  };

  // Carregar rotas para o dropdown
  const loadRotas = async () => {
    try {
      const response = await api.get('/rotas');
      setRotas(response.data);
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
    }
  };

  useEffect(() => {
    loadUnidades();
    loadRotas();
  }, []);

  // Filtros
  const filteredUnidades = unidades.filter(unidade => {
    const matchesSearch = unidade.nome_escola?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         unidade.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unidade.codigo_teknis?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || unidade.status === statusFilter;
    const matchesRota = rotaFilter === 'todos' || unidade.rota_id?.toString() === rotaFilter;
    return matchesSearch && matchesStatus && matchesRota;
  });

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <LoadingSpinner inline={true} text="Carregando unidades escolares..." />
        </div>
      </Container>
    );
  }

  // Modal handlers
  const handleAddUnidade = () => {
    setEditingUnidade(null);
    setViewMode(false);
    reset();
    setValue('status', 'ativo');
    setValue('pais', 'Brasil');
    setShowModal(true);
  };

  const handleEditUnidade = (unidade) => {
    setEditingUnidade(unidade);
    setViewMode(false);
    // Preencher o formulário com os dados da unidade
    Object.keys(unidade).forEach(key => {
      setValue(key, unidade[key]);
    });
    setShowModal(true);
  };

  const handleViewUnidade = (unidade) => {
    setEditingUnidade(unidade);
    setViewMode(true);
    // Preencher o formulário com os dados da unidade
    Object.keys(unidade).forEach(key => {
      setValue(key, unidade[key]);
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUnidade(null);
    setViewMode(false);
    reset();
  };

  // CRUD
  const onSubmit = async (data) => {
    try {
      if (editingUnidade) {
        // Atualizar
        const updateData = {};
        Object.keys(data).forEach((key) => {
          if (data[key] !== editingUnidade[key]) {
            updateData[key] = data[key];
          }
        });
        if (Object.keys(updateData).length === 0) {
          toast.error('Nenhum campo foi alterado');
          return;
        }
        await api.put(`/unidades-escolares/${editingUnidade.id}`, updateData);
        toast.success('Unidade escolar atualizada com sucesso!');
      } else {
        // Criar
        await api.post('/unidades-escolares', data);
        toast.success('Unidade escolar criada com sucesso!');
      }
      handleCloseModal();
      loadUnidades();
    } catch (error) {
      console.error('Erro ao salvar unidade escolar:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar unidade escolar');
    }
  };

  const handleDeleteUnidade = async (unidadeId) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade escolar?')) {
      try {
        await api.delete(`/unidades-escolares/${unidadeId}`);
        toast.success('Unidade escolar excluída com sucesso!');
        loadUnidades();
      } catch (error) {
        console.error('Erro ao excluir unidade escolar:', error);
        toast.error(error.response?.data?.error || 'Erro ao excluir unidade escolar');
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
      params.append('recurso', 'unidades_escolares');
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

  // Obter nome da rota
  const getRotaName = (rotaId) => {
    const rota = rotas.find(r => r.id === rotaId);
    return rota ? rota.nome : 'N/A';
  };

  return (
    <Container>
      <Header>
        <Title>Unidades Escolares</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          {canCreate('unidades_escolares') && (
            <AddButton onClick={handleAddUnidade}>
              <FaPlus />
              Adicionar Unidade
            </AddButton>
          )}
        </div>
      </Header>

      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        additionalFilters={[
          {
            label: 'Rota',
            value: rotaFilter,
            onChange: setRotaFilter,
            options: [
              { value: 'todos', label: 'Todas as rotas' },
              ...rotas.map(rota => ({
                value: rota.id.toString(),
                label: rota.nome
              }))
            ]
          }
        ]}
        onClear={() => { setSearchTerm(''); setStatusFilter('todos'); setRotaFilter('todos'); }}
        placeholder="Buscar por nome, cidade ou código..."
      />

      {filteredUnidades.length === 0 ? (
        <EmptyState>
          {searchTerm || statusFilter !== 'todos' || rotaFilter !== 'todos' ? 
            'Nenhuma unidade escolar encontrada com os filtros aplicados' : 
            'Nenhuma unidade escolar cadastrada'
          }
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Código Teknis</Th>
                <Th>Nome da Escola</Th>
                <Th>Cidade</Th>
                <Th>Estado</Th>
                <Th>Rota</Th>
                <Th>Centro Distribuição</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredUnidades.map(unidade => (
                <tr key={unidade.id}>
                  <Td>{unidade.codigo_teknis}</Td>
                  <Td>{unidade.nome_escola}</Td>
                  <Td>{unidade.cidade}</Td>
                  <Td>{unidade.estado}</Td>
                  <Td>{getRotaName(unidade.rota_id)}</Td>
                  <Td>{unidade.centro_distribuicao || '-'}</Td>
                  <Td>
                    <StatusBadge $status={unidade.status}>
                      {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleViewUnidade(unidade)}
                    >
                      <FaEye />
                    </ActionButton>
                    {canEdit('unidades_escolares') && (
                      <ActionButton
                        className="edit"
                        title="Editar"
                        onClick={() => handleEditUnidade(unidade)}
                      >
                        <FaEdit />
                      </ActionButton>
                    )}
                    {canDelete('unidades_escolares') && (
                      <ActionButton
                        className="delete"
                        title="Excluir"
                        onClick={() => handleDeleteUnidade(unidade.id)}
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
              <ModalTitle>{viewMode ? 'Visualizar Unidade Escolar' : editingUnidade ? 'Editar Unidade Escolar' : 'Adicionar Unidade Escolar'}</ModalTitle>
              <HeaderActions>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  {viewMode ? 'Fechar' : 'Cancelar'}
                </Button>
                {!viewMode && (
                  <Button type="submit" className="primary" form="unidade-form">
                    {editingUnidade ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                )}
                <CloseButton onClick={handleCloseModal} className="close-button">&times;</CloseButton>
              </HeaderActions>
            </ModalHeader>
            <Form onSubmit={handleSubmit(onSubmit)} id="unidade-form">
              <FormFields>
                <FormGroup>
                  <Label>Código Teknis *</Label>
                  <Input type="text" placeholder="Código técnico da unidade" {...register('codigo_teknis', { required: 'Código Teknis é obrigatório' })} disabled={viewMode} />
                  {errors.codigo_teknis && <span style={{ color: 'red', fontSize: '12px' }}>{errors.codigo_teknis.message}</span>}
                </FormGroup>
                <FormGroup>
                  <Label>Nome da Escola *</Label>
                  <Input type="text" placeholder="Nome da escola/unidade" {...register('nome_escola', { required: 'Nome da escola é obrigatório' })} disabled={viewMode} />
                  {errors.nome_escola && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome_escola.message}</span>}
                </FormGroup>
                <FormGroup>
                  <Label>Cidade *</Label>
                  <Input type="text" placeholder="Cidade da unidade" {...register('cidade', { required: 'Cidade é obrigatória' })} disabled={viewMode} />
                  {errors.cidade && <span style={{ color: 'red', fontSize: '12px' }}>{errors.cidade.message}</span>}
                </FormGroup>
                <FormGroup>
                  <Label>Estado *</Label>
                  <Select {...register('estado', { required: 'Estado é obrigatório' })} disabled={viewMode}>
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
                  {errors.estado && <span style={{ color: 'red', fontSize: '12px' }}>{errors.estado.message}</span>}
                </FormGroup>
                <FormGroup>
                  <Label>País</Label>
                  <Input type="text" placeholder="País da unidade" {...register('pais')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>Endereço *</Label>
                  <Input type="text" placeholder="Endereço completo" {...register('endereco', { required: 'Endereço é obrigatório' })} disabled={viewMode} />
                  {errors.endereco && <span style={{ color: 'red', fontSize: '12px' }}>{errors.endereco.message}</span>}
                </FormGroup>
                <FormGroup>
                  <Label>Número</Label>
                  <Input type="text" placeholder="Número do endereço" {...register('numero')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>Bairro</Label>
                  <Input type="text" placeholder="Bairro da unidade" {...register('bairro')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>CEP</Label>
                  <Input type="text" placeholder="00000-000" {...register('cep')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>Centro de Distribuição</Label>
                  <Input type="text" placeholder="Centro de distribuição responsável" {...register('centro_distribuicao')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>Rota</Label>
                  <Select {...register('rota_id')} disabled={viewMode}>
                    <option value="">Selecione uma rota...</option>
                    {rotas.map(rota => (
                      <option key={rota.id} value={rota.id}>
                        {rota.nome}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Regional</Label>
                  <Input type="text" placeholder="Regional da unidade" {...register('regional')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>Lote</Label>
                  <Input type="text" placeholder="Lote da unidade" {...register('lot')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>C.C. Senic</Label>
                  <Input type="text" placeholder="C.C. Senic" {...register('cc_senic')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>Código Senio</Label>
                  <Input type="text" placeholder="Código Senio" {...register('codigo_senio')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>Abastecimento</Label>
                  <Input type="text" placeholder="Tipo de abastecimento" {...register('abastecimento')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>Statl</Label>
                  <Input type="text" placeholder="Status da unidade" {...register('statl')} disabled={viewMode} />
                </FormGroup>
                <FormGroup>
                  <Label>Ordem de Entrega</Label>
                  <Input type="number" placeholder="0" {...register('ordem_entrega')} disabled={viewMode} />
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
                    placeholder="Observações adicionais..." 
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
              <ModalTitle>Auditoria - Unidades Escolares</ModalTitle>
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

export default UnidadesEscolares; 