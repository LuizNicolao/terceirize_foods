import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaHistory, FaQuestionCircle, FaFileExcel, FaFilePdf } from 'react-icons/fa';
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
    props.status === 'manutencao' ? 'var(--warning-yellow)' : '#ffebee'};
  color: ${props =>
    props.status === 'ativo' ? 'white' :
    props.status === 'manutencao' ? 'var(--dark-gray)' : 'var(--error-red)'};
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
  width: 95%;
  max-width: 1400px;
  max-height: 95vh;
  overflow-y: auto;
  
  /* Personalizar scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-green);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--dark-green);
  }
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
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: var(--dark-gray);
  font-weight: 600;
  font-size: 12px;
`;

const Input = styled.input`
  padding: 8px 12px;
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
  padding: 8px 12px;
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

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 6px;
  flex: 1;
`;

const FormGrid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 6px;
`;

const FormGrid3 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
`;

const FormSection = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
  min-height: 350px;
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  color: var(--dark-gray);
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--primary-green);
`;

const FirstRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: start;
  margin-bottom: 12px;
`;

const SecondRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  align-items: start;
`;

const Veiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true); // Voltado para true como nas outras páginas
  const [showModal, setShowModal] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadVeiculos();
  }, []);

  const loadVeiculos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/veiculos');
      setVeiculos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      toast.error('Erro ao carregar veículos');
      setVeiculos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const response = await api.get('/audit-logs', {
        params: {
          table: 'veiculos',
          limit: 100
        }
      });
      setAuditLogs(response.data);
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
  };

  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  const handleExportXLSX = async () => {
    try {
      const response = await api.get('/veiculos/export/xlsx', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'veiculos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Exportação XLSX realizada com sucesso!');
    } catch (error) {
      console.error('Erro na exportação XLSX:', error);
      toast.error('Erro na exportação XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/veiculos/export/pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'veiculos.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Exportação PDF realizada com sucesso!');
    } catch (error) {
      console.error('Erro na exportação PDF:', error);
      toast.error('Erro na exportação PDF');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getActionLabel = (action) => {
    const actions = {
      'CREATE': 'Criação',
      'UPDATE': 'Atualização',
      'DELETE': 'Exclusão'
    };
    return actions[action] || action;
  };

  const getFieldLabel = (field) => {
    const fields = {
      'placa': 'Placa',
      'renavam': 'RENAVAM',
      'chassi': 'Chassi',
      'modelo': 'Modelo',
      'marca': 'Marca',
      'fabricante': 'Fabricante',
      'ano_fabricacao': 'Ano de Fabricação',
      'tipo_veiculo': 'Tipo de Veículo',
      'carroceria': 'Carroceria',
      'combustivel': 'Combustível',
      'categoria': 'Categoria',
      'capacidade_carga': 'Capacidade de Carga',
      'capacidade_volume': 'Capacidade de Volume',
      'numero_eixos': 'Número de Eixos',
      'tara': 'Tara',
      'peso_bruto_total': 'Peso Bruto Total',
      'potencia_motor': 'Potência do Motor',
      'tipo_tracao': 'Tipo de Tração',
      'quilometragem_atual': 'Quilometragem Atual',
      'data_emplacamento': 'Data de Emplacamento',
      'vencimento_licenciamento': 'Vencimento do Licenciamento',
      'vencimento_ipva': 'Vencimento do IPVA',
      'vencimento_dpvat': 'Vencimento do DPVAT',
      'numero_apolice_seguro': 'Número da Apólice de Seguro',
      'situacao_documental': 'Situação Documental',
      'data_ultima_revisao': 'Data da Última Revisão',
      'quilometragem_proxima_revisao': 'Quilometragem da Próxima Revisão',
      'data_ultima_troca_oleo': 'Data da Última Troca de Óleo',
      'vencimento_alinhamento_balanceamento': 'Vencimento do Alinhamento/Balanceamento',
      'proxima_inspecao_veicular': 'Próxima Inspeção Veicular',
      'status': 'Status',
      'status_detalhado': 'Status Detalhado',
      'data_aquisicao': 'Data de Aquisição',
      'valor_compra': 'Valor de Compra',
      'fornecedor': 'Fornecedor',
      'numero_frota': 'Número da Frota',
      'situacao_financeira': 'Situação Financeira',
      'observacoes': 'Observações'
    };
    return fields[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined) return 'Não informado';
    
    if (field.includes('data') || field.includes('vencimento')) {
      return formatDate(value);
    }
    
    if (field === 'status') {
      return value === 'ativo' ? 'Ativo' : value === 'manutencao' ? 'Em Manutenção' : 'Inativo';
    }
    
    if (field === 'tipo_veiculo') {
      const tipos = {
        'passeio': 'Passeio',
        'caminhao': 'Caminhão',
        'moto': 'Moto',
        'utilitario': 'Utilitário'
      };
      return tipos[value] || value;
    }
    
    if (field === 'categoria') {
      const categorias = {
        'Frota': 'Frota',
        'Agregado': 'Agregado',
        'Terceiro': 'Terceiro'
      };
      return categorias[value] || value;
    }
    
    if (field === 'situacao_financeira') {
      const situacoes = {
        'Proprio': 'Próprio',
        'Financiado': 'Financiado',
        'leasing': 'Leasing'
      };
      return situacoes[value] || value;
    }
    
    return value;
  };

  const handleAddVeiculo = () => {
    setEditingVeiculo(null);
    setIsViewMode(false);
    reset();
    setShowModal(true);
  };

  const handleViewVeiculo = (veiculo) => {
    setEditingVeiculo(veiculo);
    setIsViewMode(true);
    reset(veiculo);
    setShowModal(true);
  };

  const handleEditVeiculo = (veiculo) => {
    setEditingVeiculo(veiculo);
    setIsViewMode(false);
    reset(veiculo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVeiculo(null);
    setIsViewMode(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingVeiculo) {
        await api.put(`/veiculos/${editingVeiculo.id}`, data);
        toast.success('Veículo atualizado com sucesso!');
      } else {
        await api.post('/veiculos', data);
        toast.success('Veículo criado com sucesso!');
      }
      
      handleCloseModal();
      loadVeiculos();
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleDeleteVeiculo = async (veiculoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo?')) {
      return;
    }

    try {
      await api.delete(`/veiculos/${veiculoId}`);
      toast.success('Veículo excluído com sucesso!');
      loadVeiculos();
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      toast.error('Erro ao excluir veículo');
    }
  };

  const getStatusLabel = (status) => {
    const statuses = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'manutencao': 'Em Manutenção'
    };
    return statuses[status] || status;
  };

  const getTipoVeiculoLabel = (tipo) => {
    const tipos = {
      'passeio': 'Passeio',
      'caminhao': 'Caminhão',
      'moto': 'Moto',
      'utilitario': 'Utilitário'
    };
    return tipos[tipo] || tipo;
  };

  const getCategoriaLabel = (categoria) => {
    const categorias = {
      'Frota': 'Frota',
      'Agregado': 'Agregado',
      'Terceiro': 'Terceiro'
    };
    return categorias[categoria] || categoria;
  };

  const filteredVeiculos = veiculos.filter(veiculo => {
    const matchesSearch = searchTerm === '' || 
      veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.numero_frota?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || veiculo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container>
        <div>Carregando veículos...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gestão de Veículos</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton onClick={handleOpenAuditModal}>
            <FaHistory />
            Auditoria
          </AddButton>
          {canCreate('veiculos') && (
            <AddButton onClick={handleAddVeiculo}>
              <FaPlus />
              Adicionar Veículo
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
        placeholder="Buscar por placa, modelo, marca ou número da frota..."
      />

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Placa</Th>
              <Th>Modelo</Th>
              <Th>Marca</Th>
              <Th>Tipo</Th>
              <Th>Categoria</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredVeiculos.length === 0 ? (
              <tr>
                <Td colSpan="7">
                  <EmptyState>
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Nenhum veículo encontrado com os filtros aplicados'
                      : 'Nenhum veículo cadastrado'
                    }
                  </EmptyState>
                </Td>
              </tr>
            ) : (
              filteredVeiculos.map((veiculo) => (
                <tr key={veiculo.id}>
                  <Td>{veiculo.placa}</Td>
                  <Td>{veiculo.modelo || '-'}</Td>
                  <Td>{veiculo.marca || '-'}</Td>
                  <Td>{getTipoVeiculoLabel(veiculo.tipo_veiculo)}</Td>
                  <Td>{getCategoriaLabel(veiculo.categoria)}</Td>
                  <Td>
                    <StatusBadge status={veiculo.status}>
                      {getStatusLabel(veiculo.status)}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleViewVeiculo(veiculo)}
                    >
                      <FaEye />
                    </ActionButton>
                    {canEdit('veiculos') && (
                      <ActionButton
                        className="edit"
                        title="Editar"
                        onClick={() => handleEditVeiculo(veiculo)}
                      >
                        <FaEdit />
                      </ActionButton>
                    )}
                    {canDelete('veiculos') && (
                      <ActionButton
                        className="delete"
                        title="Excluir"
                        onClick={() => handleDeleteVeiculo(veiculo.id)}
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

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {isViewMode ? 'Visualizar Veículo' : editingVeiculo ? 'Editar Veículo' : 'Adicionar Veículo'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Primeira Linha - 3 Cards */}
              <FirstRow>
                {/* Card 1: Informações Básicas */}
                <FormSection>
                  <SectionTitle>Informações Básicas</SectionTitle>
                  <FormGrid>
                    <FormGroup>
                      <Label>Placa *</Label>
                      <Input
                        type="text"
                        placeholder="Ex: ABC-1234"
                        disabled={isViewMode}
                        {...register('placa', { required: 'Placa é obrigatória' })}
                      />
                      {errors.placa && <span style={{ color: 'red', fontSize: '11px' }}>{errors.placa.message}</span>}
                    </FormGroup>

                    <FormGrid2>
                      <FormGroup>
                        <Label>RENAVAM</Label>
                        <Input
                          type="text"
                          placeholder="RENAVAM"
                          disabled={isViewMode}
                          {...register('renavam')}
                        />
                        {errors.renavam && <span style={{ color: 'red', fontSize: '11px' }}>{errors.renavam.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Chassi</Label>
                        <Input
                          type="text"
                          placeholder="Chassi"
                          disabled={isViewMode}
                          {...register('chassi')}
                        />
                        {errors.chassi && <span style={{ color: 'red', fontSize: '11px' }}>{errors.chassi.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGrid2>
                      <FormGroup>
                        <Label>Marca</Label>
                        <Input
                          type="text"
                          placeholder="Ex: Ford"
                          disabled={isViewMode}
                          {...register('marca')}
                        />
                        {errors.marca && <span style={{ color: 'red', fontSize: '11px' }}>{errors.marca.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Modelo</Label>
                        <Input
                          type="text"
                          placeholder="Ex: Fiesta"
                          disabled={isViewMode}
                          {...register('modelo')}
                        />
                        {errors.modelo && <span style={{ color: 'red', fontSize: '11px' }}>{errors.modelo.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGroup>
                      <Label>Fabricante</Label>
                      <Input
                        type="text"
                        placeholder="Fabricante"
                        disabled={isViewMode}
                        {...register('fabricante')}
                      />
                      {errors.fabricante && <span style={{ color: 'red', fontSize: '11px' }}>{errors.fabricante.message}</span>}
                    </FormGroup>

                    <FormGrid2>
                      <FormGroup>
                        <Label>Ano de Fabricação</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 2020"
                          disabled={isViewMode}
                          {...register('ano_fabricacao')}
                        />
                        {errors.ano_fabricacao && <span style={{ color: 'red', fontSize: '11px' }}>{errors.ano_fabricacao.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Tipo de Veículo</Label>
                        <Select disabled={isViewMode} {...register('tipo_veiculo')}>
                          <option value="">Selecione...</option>
                          <option value="passeio">Passeio</option>
                          <option value="caminhao">Caminhão</option>
                          <option value="moto">Moto</option>
                          <option value="utilitario">Utilitário</option>
                        </Select>
                        {errors.tipo_veiculo && <span style={{ color: 'red', fontSize: '11px' }}>{errors.tipo_veiculo.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGrid2>
                      <FormGroup>
                        <Label>Carroceria</Label>
                        <Select disabled={isViewMode} {...register('carroceria')}>
                          <option value="">Selecione...</option>
                          <option value="Bau">Baú</option>
                          <option value="Refrigerado">Refrigerado</option>
                          <option value="Bipartido">Bipartido</option>
                          <option value="Grade Baixa">Grade Baixa</option>
                          <option value="Sider">Sider</option>
                          <option value="Graneleiro">Graneleiro</option>
                          <option value="Tanque">Tanque</option>
                          <option value="Cacamba">Caçamba</option>
                        </Select>
                        {errors.carroceria && <span style={{ color: 'red', fontSize: '11px' }}>{errors.carroceria.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Combustível</Label>
                        <Select disabled={isViewMode} {...register('combustivel')}>
                          <option value="">Selecione...</option>
                          <option value="gasolina">Gasolina</option>
                          <option value="diesel">Diesel</option>
                          <option value="etanol">Etanol</option>
                          <option value="flex">Flex</option>
                          <option value="GNV">GNV</option>
                          <option value="eletrico">Elétrico</option>
                        </Select>
                        {errors.combustivel && <span style={{ color: 'red', fontSize: '11px' }}>{errors.combustivel.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGroup>
                      <Label>Categoria</Label>
                      <Select disabled={isViewMode} {...register('categoria')}>
                        <option value="">Selecione...</option>
                        <option value="Frota">Frota</option>
                        <option value="Agregado">Agregado</option>
                        <option value="Terceiro">Terceiro</option>
                      </Select>
                      {errors.categoria && <span style={{ color: 'red', fontSize: '11px' }}>{errors.categoria.message}</span>}
                    </FormGroup>
                  </FormGrid>
                </FormSection>

                {/* Card 2: Capacidades e Especificações */}
                <FormSection>
                  <SectionTitle>Capacidades e Especificações</SectionTitle>
                  <FormGrid>
                    <FormGrid2>
                      <FormGroup>
                        <Label>Capacidade de Carga (kg)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 1000.00"
                          disabled={isViewMode}
                          {...register('capacidade_carga')}
                        />
                        {errors.capacidade_carga && <span style={{ color: 'red', fontSize: '11px' }}>{errors.capacidade_carga.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Capacidade de Volume (m³)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 10.00"
                          disabled={isViewMode}
                          {...register('capacidade_volume')}
                        />
                        {errors.capacidade_volume && <span style={{ color: 'red', fontSize: '11px' }}>{errors.capacidade_volume.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGrid2>
                      <FormGroup>
                        <Label>Número de Eixos</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 2"
                          disabled={isViewMode}
                          {...register('numero_eixos')}
                        />
                        {errors.numero_eixos && <span style={{ color: 'red', fontSize: '11px' }}>{errors.numero_eixos.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Tipo de Tração</Label>
                        <Select disabled={isViewMode} {...register('tipo_tracao')}>
                          <option value="">Selecione...</option>
                          <option value="4x2">4x2</option>
                          <option value="4x4">4x4</option>
                          <option value="dianteira">Dianteira</option>
                          <option value="traseira">Traseira</option>
                        </Select>
                        {errors.tipo_tracao && <span style={{ color: 'red', fontSize: '11px' }}>{errors.tipo_tracao.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGrid2>
                      <FormGroup>
                        <Label>Tara (kg)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 2000.00"
                          disabled={isViewMode}
                          {...register('tara')}
                        />
                        {errors.tara && <span style={{ color: 'red', fontSize: '11px' }}>{errors.tara.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Peso Bruto Total (kg)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 5000.00"
                          disabled={isViewMode}
                          {...register('peso_bruto_total')}
                        />
                        {errors.peso_bruto_total && <span style={{ color: 'red', fontSize: '11px' }}>{errors.peso_bruto_total.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGrid2>
                      <FormGroup>
                        <Label>Potência do Motor (cv)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 100.00"
                          disabled={isViewMode}
                          {...register('potencia_motor')}
                        />
                        {errors.potencia_motor && <span style={{ color: 'red', fontSize: '11px' }}>{errors.potencia_motor.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Quilometragem Atual (km)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 50000.00"
                          disabled={isViewMode}
                          {...register('quilometragem_atual')}
                        />
                        {errors.quilometragem_atual && <span style={{ color: 'red', fontSize: '11px' }}>{errors.quilometragem_atual.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGroup>
                      <Label>Número da Frota</Label>
                      <Input
                        type="text"
                        placeholder="Ex: F001"
                        disabled={isViewMode}
                        {...register('numero_frota')}
                      />
                      {errors.numero_frota && <span style={{ color: 'red', fontSize: '11px' }}>{errors.numero_frota.message}</span>}
                    </FormGroup>
                  </FormGrid>
                </FormSection>

                {/* Card 3: Documentação e Vencimentos */}
                <FormSection>
                  <SectionTitle>Documentação e Vencimentos</SectionTitle>
                  <FormGrid>
                    <FormGrid2>
                      <FormGroup>
                        <Label>Data de Emplacamento</Label>
                        <Input
                          type="date"
                          disabled={isViewMode}
                          {...register('data_emplacamento')}
                        />
                        {errors.data_emplacamento && <span style={{ color: 'red', fontSize: '11px' }}>{errors.data_emplacamento.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Vencimento Licenciamento</Label>
                        <Input
                          type="date"
                          disabled={isViewMode}
                          {...register('vencimento_licenciamento')}
                        />
                        {errors.vencimento_licenciamento && <span style={{ color: 'red', fontSize: '11px' }}>{errors.vencimento_licenciamento.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGrid2>
                      <FormGroup>
                        <Label>Vencimento IPVA</Label>
                        <Input
                          type="date"
                          disabled={isViewMode}
                          {...register('vencimento_ipva')}
                        />
                        {errors.vencimento_ipva && <span style={{ color: 'red', fontSize: '11px' }}>{errors.vencimento_ipva.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Vencimento DPVAT</Label>
                        <Input
                          type="date"
                          disabled={isViewMode}
                          {...register('vencimento_dpvat')}
                        />
                        {errors.vencimento_dpvat && <span style={{ color: 'red', fontSize: '11px' }}>{errors.vencimento_dpvat.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGroup>
                      <Label>Número da Apólice de Seguro</Label>
                      <Input
                        type="text"
                        placeholder="Número da apólice"
                        disabled={isViewMode}
                        {...register('numero_apolice_seguro')}
                      />
                      {errors.numero_apolice_seguro && <span style={{ color: 'red', fontSize: '11px' }}>{errors.numero_apolice_seguro.message}</span>}
                    </FormGroup>

                    <FormGroup>
                      <Label>Situação Documental</Label>
                      <Select disabled={isViewMode} {...register('situacao_documental')}>
                        <option value="">Selecione...</option>
                        <option value="regular">Regular</option>
                        <option value="alienado">Alienado</option>
                        <option value="bloqueado">Bloqueado</option>
                      </Select>
                      {errors.situacao_documental && <span style={{ color: 'red', fontSize: '11px' }}>{errors.situacao_documental.message}</span>}
                    </FormGroup>

                    <FormGrid2>
                      <FormGroup>
                        <Label>Próxima Inspeção Veicular</Label>
                        <Input
                          type="date"
                          disabled={isViewMode}
                          {...register('proxima_inspecao_veicular')}
                        />
                        {errors.proxima_inspecao_veicular && <span style={{ color: 'red', fontSize: '11px' }}>{errors.proxima_inspecao_veicular.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Vencimento Alinhamento/Balanceamento</Label>
                        <Input
                          type="date"
                          disabled={isViewMode}
                          {...register('vencimento_alinhamento_balanceamento')}
                        />
                        {errors.vencimento_alinhamento_balanceamento && <span style={{ color: 'red', fontSize: '11px' }}>{errors.vencimento_alinhamento_balanceamento.message}</span>}
                      </FormGroup>
                    </FormGrid2>
                  </FormGrid>
                </FormSection>
              </FirstRow>

              {/* Segunda Linha - 2 Cards */}
              <SecondRow>
                {/* Card 4: Manutenção e Status */}
                <FormSection>
                  <SectionTitle>Manutenção e Status</SectionTitle>
                  <FormGrid>
                    <FormGrid2>
                      <FormGroup>
                        <Label>Data da Última Revisão</Label>
                        <Input
                          type="date"
                          disabled={isViewMode}
                          {...register('data_ultima_revisao')}
                        />
                        {errors.data_ultima_revisao && <span style={{ color: 'red', fontSize: '11px' }}>{errors.data_ultima_revisao.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Data da Última Troca de Óleo</Label>
                        <Input
                          type="date"
                          disabled={isViewMode}
                          {...register('data_ultima_troca_oleo')}
                        />
                        {errors.data_ultima_troca_oleo && <span style={{ color: 'red', fontSize: '11px' }}>{errors.data_ultima_troca_oleo.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGroup>
                      <Label>Quilometragem Próxima Revisão (km)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 60000.00"
                        disabled={isViewMode}
                        {...register('quilometragem_proxima_revisao')}
                      />
                      {errors.quilometragem_proxima_revisao && <span style={{ color: 'red', fontSize: '11px' }}>{errors.quilometragem_proxima_revisao.message}</span>}
                    </FormGroup>

                    <FormGrid2>
                      <FormGroup>
                        <Label>Status</Label>
                        <Select disabled={isViewMode} {...register('status')}>
                          <option value="">Selecione...</option>
                          <option value="ativo">Ativo</option>
                          <option value="inativo">Inativo</option>
                          <option value="manutencao">Em Manutenção</option>
                        </Select>
                        {errors.status && <span style={{ color: 'red', fontSize: '11px' }}>{errors.status.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Status Detalhado</Label>
                        <Select disabled={isViewMode} {...register('status_detalhado')}>
                          <option value="">Selecione...</option>
                          <option value="Ativo">Ativo</option>
                          <option value="Em manutencao">Em Manutenção</option>
                          <option value="Alugado">Alugado</option>
                          <option value="Vendido">Vendido</option>
                        </Select>
                        {errors.status_detalhado && <span style={{ color: 'red', fontSize: '11px' }}>{errors.status_detalhado.message}</span>}
                      </FormGroup>
                    </FormGrid2>
                  </FormGrid>
                </FormSection>

                {/* Card 5: Financeiro e Observações */}
                <FormSection>
                  <SectionTitle>Financeiro e Observações</SectionTitle>
                  <FormGrid>
                    <FormGrid2>
                      <FormGroup>
                        <Label>Data de Aquisição</Label>
                        <Input
                          type="date"
                          disabled={isViewMode}
                          {...register('data_aquisicao')}
                        />
                        {errors.data_aquisicao && <span style={{ color: 'red', fontSize: '11px' }}>{errors.data_aquisicao.message}</span>}
                      </FormGroup>

                      <FormGroup>
                        <Label>Valor de Compra (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 50000.00"
                          disabled={isViewMode}
                          {...register('valor_compra')}
                        />
                        {errors.valor_compra && <span style={{ color: 'red', fontSize: '11px' }}>{errors.valor_compra.message}</span>}
                      </FormGroup>
                    </FormGrid2>

                    <FormGroup>
                      <Label>Fornecedor</Label>
                      <Input
                        type="text"
                        placeholder="Nome do fornecedor"
                        disabled={isViewMode}
                        {...register('fornecedor')}
                      />
                      {errors.fornecedor && <span style={{ color: 'red', fontSize: '11px' }}>{errors.fornecedor.message}</span>}
                    </FormGroup>

                    <FormGroup>
                      <Label>Situação Financeira</Label>
                      <Select disabled={isViewMode} {...register('situacao_financeira')}>
                        <option value="">Selecione...</option>
                        <option value="Proprio">Próprio</option>
                        <option value="Financiado">Financiado</option>
                        <option value="leasing">Leasing</option>
                      </Select>
                      {errors.situacao_financeira && <span style={{ color: 'red', fontSize: '11px' }}>{errors.situacao_financeira.message}</span>}
                    </FormGroup>

                    <FormGroup>
                      <Label>Observações</Label>
                      <TextArea
                        placeholder="Observações sobre o veículo..."
                        disabled={isViewMode}
                        {...register('observacoes')}
                      />
                      {errors.observacoes && <span style={{ color: 'red', fontSize: '11px' }}>{errors.observacoes.message}</span>}
                    </FormGroup>
                  </FormGrid>
                </FormSection>
              </SecondRow>

              {/* Botões */}
              <ButtonGroup>
                {!isViewMode && (
                  <Button type="submit" className="primary">
                    {editingVeiculo ? 'Atualizar' : 'Salvar'}
                  </Button>
                )}
                <Button type="button" onClick={handleCloseModal} className="secondary">
                  {isViewMode ? 'Fechar' : 'Cancelar'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Logs de Auditoria - Veículos</ModalTitle>
              <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
            </ModalHeader>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <Button onClick={handleExportXLSX} className="primary">
                  <FaFileExcel style={{ marginRight: '8px' }} />
                  Exportar XLSX
                </Button>
                <Button onClick={handleExportPDF} className="primary">
                  <FaFilePdf style={{ marginRight: '8px' }} />
                  Exportar PDF
                </Button>
              </div>
            </div>

            <div>
              {auditLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  Carregando logs de auditoria...
                </div>
              ) : auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray)' }}>
                  Nenhum log de auditoria encontrado
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {auditLogs.map((log, index) => (
                    <div key={index} style={{ 
                      padding: '16px', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px', 
                      marginBottom: '12px',
                      background: '#f9f9f9'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            background: log.acao === 'CREATE' ? '#d4edda' : log.acao === 'UPDATE' ? '#fff3cd' : '#f8d7da',
                            color: log.acao === 'CREATE' ? '#155724' : log.acao === 'UPDATE' ? '#856404' : '#721c24'
                          }}>
                            {getActionLabel(log.acao)}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--gray)', marginLeft: '8px' }}>
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
                              <strong>Dados do Veículo:</strong>
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
                          {log.detalhes.resourceId && (
                            <div style={{ 
                              marginTop: '8px', 
                              padding: '6px 8px', 
                              background: '#e3f2fd', 
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              <strong>ID do Veículo:</strong> 
                              <span style={{ color: '#1976d2', marginLeft: '4px' }}>
                                #{log.detalhes.resourceId}
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

export default Veiculos; 