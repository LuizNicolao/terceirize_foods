import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaHistory, FaQuestionCircle, FaFileExcel, FaFilePdf } from 'react-icons/fa';
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
  background: var(--light-gray);
  color: var(--dark-gray);
  font-weight: 600;
  padding: 16px;
  text-align: left;
  border-bottom: 2px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  color: var(--dark-gray);
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.status === 'ativo' ? 'var(--success-light)' : 'var(--error-light)'};
  color: ${props => props.status === 'ativo' ? 'var(--success)' : 'var(--error)'};
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
  padding: 0;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
`;

const ModalTitle = styled.h2`
  color: var(--dark-gray);
  font-size: 20px;
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
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: var(--light-gray);
  }
`;

const Form = styled.form`
  padding: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--dark-gray);
  font-weight: 600;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
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
  width: 100%;
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
    background: var(--light-gray);
    color: var(--dark-gray);

    &:hover {
      background: var(--gray);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: var(--gray);
`;

const NomeGenericoProduto = () => {
  const [nomesGenericos, setNomesGenericos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNomeGenerico, setEditingNomeGenerico] = useState(null);
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
    setValue,
    watch
  } = useForm();

  // Carregar nomes genéricos
  const loadNomesGenericos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/nome-generico-produto');
      setNomesGenericos(response.data);
    } catch (error) {
      console.error('Erro ao carregar nomes genéricos:', error);
      toast.error('Erro ao carregar nomes genéricos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar grupos
  const loadGrupos = async () => {
    try {
      const response = await api.get('/grupos');
      setGrupos(response.data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  // Carregar subgrupos
  const loadSubgrupos = async () => {
    try {
      const response = await api.get('/subgrupos');
      setSubgrupos(response.data);
    } catch (error) {
      console.error('Erro ao carregar subgrupos:', error);
    }
  };

  // Carregar classes
  const loadClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Erro ao carregar classes:', error);
    }
  };

  useEffect(() => {
    loadNomesGenericos();
    loadGrupos();
    loadSubgrupos();
    loadClasses();
  }, []);

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const params = new URLSearchParams();
      
      if (auditFilters.dataInicio) params.append('dataInicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('dataFim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      if (auditFilters.periodo) params.append('periodo', auditFilters.periodo);
      
      params.append('recurso', 'nome_generico_produto');
      
      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data);
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

  // Exportar XLSX
  const handleExportXLSX = async () => {
    try {
      const params = new URLSearchParams();
      
      if (auditFilters.dataInicio) params.append('dataInicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('dataFim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      if (auditFilters.periodo) params.append('periodo', auditFilters.periodo);
      
      params.append('recurso', 'nome_generico_produto');
      params.append('formato', 'xlsx');
      
      const response = await api.get(`/auditoria/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_nome_generico_produto_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Exportar PDF
  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      
      if (auditFilters.dataInicio) params.append('dataInicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('dataFim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      if (auditFilters.periodo) params.append('periodo', auditFilters.periodo);
      
      params.append('recurso', 'nome_generico_produto');
      params.append('formato', 'pdf');
      
      const response = await api.get(`/auditoria/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_nome_generico_produto_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório');
    }
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
      'grupo_id': 'Grupo',
      'subgrupo_id': 'Subgrupo',
      'classe_id': 'Classe',
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
      case 'grupo_id':
        const grupo = grupos.find(g => g.id === value);
        return grupo ? grupo.nome : 'Não informado';
      case 'subgrupo_id':
        const subgrupo = subgrupos.find(sg => sg.id === value);
        return subgrupo ? subgrupo.nome : 'Não informado';
      case 'classe_id':
        const classe = classes.find(c => c.id === value);
        return classe ? classe.nome : 'Não informado';
      default:
        return value;
    }
  };

  // Abrir modal para adicionar nome genérico
  const handleAddNomeGenerico = () => {
    setEditingNomeGenerico(null);
    reset();
    setValue('status', '1'); // Define status como "Ativo" por padrão
    setShowModal(true);
  };

  // Abrir modal para editar nome genérico
  const handleEditNomeGenerico = (nomeGenerico) => {
    setEditingNomeGenerico(nomeGenerico);
    setValue('nome', nomeGenerico.nome);
    setValue('grupo_id', nomeGenerico.grupo_id || '');
    setValue('subgrupo_id', nomeGenerico.subgrupo_id || '');
    setValue('classe_id', nomeGenerico.classe_id || '');
    setValue('status', nomeGenerico.status);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNomeGenerico(null);
    reset();
  };

  // Salvar nome genérico
  const onSubmit = async (data) => {
    try {
      if (editingNomeGenerico) {
        // Para edição, enviar apenas os campos que foram alterados
        const updateData = {};
        
        if (data.nome !== editingNomeGenerico.nome) {
          updateData.nome = data.nome;
        }
        
        if (data.grupo_id !== editingNomeGenerico.grupo_id) {
          updateData.grupo_id = data.grupo_id || null;
        }
        
        if (data.subgrupo_id !== editingNomeGenerico.subgrupo_id) {
          updateData.subgrupo_id = data.subgrupo_id || null;
        }
        
        if (data.classe_id !== editingNomeGenerico.classe_id) {
          updateData.classe_id = data.classe_id || null;
        }
        
        if (data.status !== editingNomeGenerico.status) {
          updateData.status = parseInt(data.status);
        }
        
        // Se não há campos para atualizar, mostrar erro
        if (Object.keys(updateData).length === 0) {
          toast.error('Nenhum campo foi alterado');
          return;
        }
        
        await api.put(`/nome-generico-produto/${editingNomeGenerico.id}`, updateData);
        toast.success('Nome genérico atualizado com sucesso!');
      } else {
        // Para criação, enviar todos os campos
        const createData = { ...data };
        if (createData.status) {
          createData.status = parseInt(createData.status);
        }
        if (createData.grupo_id === '') createData.grupo_id = null;
        if (createData.subgrupo_id === '') createData.subgrupo_id = null;
        if (createData.classe_id === '') createData.classe_id = null;
        
        await api.post('/nome-generico-produto', createData);
        toast.success('Nome genérico criado com sucesso!');
      }
      
      handleCloseModal();
      loadNomesGenericos();
    } catch (error) {
      console.error('Erro ao salvar nome genérico:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar nome genérico');
    }
  };

  // Excluir nome genérico
  const handleDeleteNomeGenerico = async (nomeGenericoId) => {
    if (window.confirm('Tem certeza que deseja excluir este nome genérico?')) {
      try {
        await api.delete(`/nome-generico-produto/${nomeGenericoId}`);
        toast.success('Nome genérico excluído com sucesso!');
        loadNomesGenericos();
      } catch (error) {
        console.error('Erro ao excluir nome genérico:', error);
        toast.error(error.response?.data?.error || 'Erro ao excluir nome genérico');
      }
    }
  };

  // Filtrar nomes genéricos
  const filteredNomesGenericos = nomesGenericos.filter(nomeGenerico => {
    const matchesSearch = nomeGenerico.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nomeGenerico.grupo_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nomeGenerico.subgrupo_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nomeGenerico.classe_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || nomeGenerico.status === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container>
        <div>Carregando nomes genéricos...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Nomes Genéricos de Produtos</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          <AddButton onClick={handleAddNomeGenerico}>
            <FaPlus />
            Adicionar Nome Genérico
          </AddButton>
        </div>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar por nome, grupo, subgrupo ou classe..."
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
              <Th>Grupo</Th>
              <Th>Subgrupo</Th>
              <Th>Classe</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredNomesGenericos.length === 0 ? (
              <tr>
                <Td colSpan="6">
                  <EmptyState>
                    {searchTerm || statusFilter !== 'todos'
                      ? 'Nenhum nome genérico encontrado com os filtros aplicados'
                      : 'Nenhum nome genérico cadastrado'
                    }
                  </EmptyState>
                </Td>
              </tr>
            ) : (
              filteredNomesGenericos.map((nomeGenerico) => (
                <tr key={nomeGenerico.id}>
                  <Td>{nomeGenerico.nome}</Td>
                  <Td>{nomeGenerico.grupo_nome || 'Não informado'}</Td>
                  <Td>{nomeGenerico.subgrupo_nome || 'Não informado'}</Td>
                  <Td>{nomeGenerico.classe_nome || 'Não informado'}</Td>
                  <Td>
                    <StatusBadge status={nomeGenerico.status === 1 ? 'ativo' : 'inativo'}>
                      {nomeGenerico.status === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleEditNomeGenerico(nomeGenerico)}
                    >
                      <FaEye />
                    </ActionButton>
                    <ActionButton
                      className="edit"
                      title="Editar"
                      onClick={() => handleEditNomeGenerico(nomeGenerico)}
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      title="Excluir"
                      onClick={() => handleDeleteNomeGenerico(nomeGenerico.id)}
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
                {editingNomeGenerico ? 'Editar Nome Genérico' : 'Adicionar Nome Genérico'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome *</Label>
                <Input
                  type="text"
                  placeholder="Ex: PATINHO BOVINO EM CUBOS 1KG"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                />
                {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Grupo</Label>
                  <Select {...register('grupo_id')}>
                    <option value="">Selecione um grupo</option>
                    {grupos.map((grupo) => (
                      <option key={grupo.id} value={grupo.id}>
                        {grupo.nome}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Subgrupo</Label>
                  <Select {...register('subgrupo_id')}>
                    <option value="">Selecione um subgrupo</option>
                    {subgrupos.map((subgrupo) => (
                      <option key={subgrupo.id} value={subgrupo.id}>
                        {subgrupo.nome}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Classe</Label>
                <Select {...register('classe_id')}>
                  <option value="">Selecione uma classe</option>
                  {classes.map((classe) => (
                    <option key={classe.id} value={classe.id}>
                      {classe.nome}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select {...register('status', { required: 'Status é obrigatório' })}>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </Select>
                {errors.status && <span style={{ color: 'red', fontSize: '12px' }}>{errors.status.message}</span>}
              </FormGroup>

              <ButtonGroup>
                <Button
                  type="button"
                  className="secondary"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="primary"
                >
                  {editingNomeGenerico ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95%' }}>
            <ModalHeader>
              <ModalTitle>Auditoria - Nomes Genéricos de Produtos</ModalTitle>
              <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
            </ModalHeader>

            <div style={{ padding: '24px' }}>
              {/* Filtros */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={auditFilters.dataInicio}
                    onChange={(e) => setAuditFilters({...auditFilters, dataInicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={auditFilters.dataFim}
                    onChange={(e) => setAuditFilters({...auditFilters, dataFim: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Ação</Label>
                  <Select
                    value={auditFilters.acao}
                    onChange={(e) => setAuditFilters({...auditFilters, acao: e.target.value})}
                  >
                    <option value="">Todas as ações</option>
                    <option value="create">Criar</option>
                    <option value="update">Editar</option>
                    <option value="delete">Excluir</option>
                    <option value="view">Visualizar</option>
                  </Select>
                </div>
                <div>
                  <Label>Período</Label>
                  <Select
                    value={auditFilters.periodo}
                    onChange={(e) => setAuditFilters({...auditFilters, periodo: e.target.value})}
                  >
                    <option value="">Selecionar período</option>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Última semana</option>
                    <option value="mes">Último mês</option>
                    <option value="trimestre">Último trimestre</option>
                  </Select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <Button
                  type="button"
                  className="primary"
                  onClick={handleApplyAuditFilters}
                  disabled={auditLoading}
                >
                  {auditLoading ? 'Carregando...' : 'Aplicar Filtros'}
                </Button>
                <Button
                  type="button"
                  className="secondary"
                  onClick={handleExportXLSX}
                >
                  <FaFileExcel /> Exportar XLSX
                </Button>
                <Button
                  type="button"
                  className="secondary"
                  onClick={handleExportPDF}
                >
                  <FaFilePdf /> Exportar PDF
                </Button>
              </div>

              {/* Tabela de Logs */}
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th>Data/Hora</Th>
                      <Th>Usuário</Th>
                      <Th>Ação</Th>
                      <Th>Detalhes</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <Td colSpan="4">
                          <EmptyState>
                            Nenhum log de auditoria encontrado
                          </EmptyState>
                        </Td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id}>
                          <Td>{formatDate(log.timestamp)}</Td>
                          <Td>{log.usuario_nome || 'Usuário não encontrado'}</Td>
                          <Td>{getActionLabel(log.acao)}</Td>
                          <Td>
                            {log.detalhes ? (
                              <div style={{ fontSize: '12px' }}>
                                {Object.entries(JSON.parse(log.detalhes)).map(([key, value]) => (
                                  <div key={key}>
                                    <strong>{getFieldLabel(key)}:</strong> {formatFieldValue(key, value)}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              'Sem detalhes'
                            )}
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default NomeGenericoProduto; 