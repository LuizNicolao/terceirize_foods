import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import LoadingSpinner from '../components/LoadingSpinner';
import CadastroFilterBar from '../components/CadastroFilterBar';
import { extractApiData, extractErrorMessage } from '../utils/apiResponseHandler';

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
  width: 1000px;
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
  const [showItensModal, setShowItensModal] = useState(false);
  const [selectedAlmoxarifado, setSelectedAlmoxarifado] = useState(null);
  const [itensAlmoxarifado, setItensAlmoxarifado] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [searchProduto, setSearchProduto] = useState('');
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [quantidadeProduto, setQuantidadeProduto] = useState('');

  const { canCreate, canEdit, canDelete } = usePermissions();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      setLoading(true);
      const response = await api.get('/filiais');
      const data = extractApiData(response);
      setFiliais(data || []);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Carregar almoxarifados da filial selecionada
  const loadAlmoxarifados = async (filialId) => {
    setLoadingAlmoxarifados(true);
    try {
      const res = await api.get(`/filiais/${filialId}/almoxarifados`);
      const data = extractApiData(res);
      setAlmoxarifados(data || []);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoadingAlmoxarifados(false);
    }
  };

  // Carregar produtos para autocomplete
  const loadProdutos = async (search = '') => {
    try {
      const res = await api.get(`/produtos?search=${search}`);
      const data = extractApiData(res);
      setProdutos(data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  // Carregar itens do almoxarifado
  const loadItensAlmoxarifado = async (almoxarifadoId) => {
    setLoadingItens(true);
    try {
      const res = await api.get(`/filiais/almoxarifados/${almoxarifadoId}/itens`);
      const data = extractApiData(res);
      setItensAlmoxarifado(data || []);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoadingItens(false);
    }
  };

  // Abrir modal de itens
  const handleOpenItensModal = (almoxarifado) => {
    setSelectedAlmoxarifado(almoxarifado);
    setShowItensModal(true);
    loadItensAlmoxarifado(almoxarifado.id);
    loadProdutos();
  };

  // Adicionar produto ao almoxarifado
  const handleAddProduto = async () => {
    if (!selectedProduto || !quantidadeProduto) {
      toast.error('Selecione um produto e informe a quantidade');
      return;
    }

    try {
      await api.post(`/filiais/almoxarifados/${selectedAlmoxarifado.id}/itens`, {
        produto_id: selectedProduto.id,
        quantidade: parseFloat(quantidadeProduto)
      });
      toast.success('Produto adicionado ao almoxarifado!');
      setSelectedProduto(null);
      setQuantidadeProduto('');
      loadItensAlmoxarifado(selectedAlmoxarifado.id);
    } catch (err) {
      toast.error('Erro ao adicionar produto');
    }
  };

  // Remover produto do almoxarifado
  const handleRemoveProduto = async (itemId) => {
    if (window.confirm('Deseja remover este produto do almoxarifado?')) {
      try {
        await api.delete(`/filiais/almoxarifados/${selectedAlmoxarifado.id}/itens/${itemId}`);
        toast.success('Produto removido do almoxarifado!');
        loadItensAlmoxarifado(selectedAlmoxarifado.id);
      } catch (err) {
        toast.error('Erro ao remover produto');
      }
    }
  };

  // Salvar almoxarifado
  const handleSaveAlmoxarifado = async (data) => {
    try {
      const payload = {
        ...data,
        status: data.status.toString()
      };
      if (editingAlmoxarifado) {
        await api.put(`/filiais/almoxarifados/${editingAlmoxarifado.id}`, payload);
        toast.success('Almoxarifado atualizado!');
      } else {
        await api.post(`/filiais/${editingFilial.id}/almoxarifados`, payload);
        toast.success('Almoxarifado criado!');
      }
      setShowAlmoxarifadoModal(false);
      setEditingAlmoxarifado(null);
      loadAlmoxarifados(editingFilial.id);
    } catch (err) {
      toast.error('Erro ao salvar almoxarifado');
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
    const matchesSearch = filial.filial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         filial.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         filial.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
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
      const data = extractApiData(response);
      setAuditLogs(data?.logs || []);
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

  // Funções auxiliares para auditoria
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action) => {
    const labels = {
      'create': 'Criar',
      'update': 'Editar',
      'delete': 'Excluir',
      'login': 'Login'
    };
    return labels[action] || action;
  };

  const getFieldLabel = (field) => {
    const labels = {
      'codigo_filial': 'Código da Filial',
      'cnpj': 'CNPJ',
      'filial': 'Filial',
      'razao_social': 'Razão Social',
      'logradouro': 'Logradouro',
      'numero': 'Número',
      'bairro': 'Bairro',
      'cidade': 'Cidade',
      'estado': 'Estado',
      'cep': 'CEP',
      'telefone': 'Telefone',
      'email': 'E-mail',
      'status': 'Status'
    };
    return labels[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') return '-';
    
    if (field === 'status') {
      return value === 'ativo' ? 'Ativo' : 'Inativo';
    }
    
    if (field === 'cnpj') {
      return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return String(value);
  };

  // Exportar auditoria para XLSX
  const handleExportXLSX = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.dataInicio) params.append('dataInicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('dataFim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      if (auditFilters.periodo) params.append('periodo', auditFilters.periodo);
      params.append('tabela', 'filiais');

      const response = await api.get(`/auditoria/export/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_filiais_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Exportar auditoria para PDF
  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.dataInicio) params.append('dataInicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('dataFim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      if (auditFilters.periodo) params.append('periodo', auditFilters.periodo);
      params.append('tabela', 'filiais');

      const response = await api.get(`/auditoria/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_filiais_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Consultar CNPJ
  const handleConsultarCNPJ = async () => {
    const cnpj = watch('cnpj');
    if (!cnpj) {
      toast.error('Digite um CNPJ para consultar');
      return;
    }

    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const response = await api.get(`/filiais/consulta-cnpj/${cnpjLimpo}`);
      
      if (response.data.success) {
        const dados = response.data.data;
        
        // Preencher automaticamente os campos com os dados do CNPJ
        setValue('razao_social', dados.razao_social || '');
        setValue('filial', dados.nome_fantasia || dados.razao_social || '');
        setValue('logradouro', dados.logradouro || '');
        setValue('numero', dados.numero || '');
        setValue('bairro', dados.bairro || '');
        setValue('cidade', dados.municipio || '');
        setValue('estado', dados.uf || '');
        setValue('cep', dados.cep || '');
        
        toast.success('Dados do CNPJ carregados com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao consultar CNPJ';
      toast.error(errorMessage);
    }
  };

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

      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={() => { setSearchTerm(''); setStatusFilter('todos'); }}
        placeholder="Buscar por nome, cidade ou código..."
      />

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
                <Th>Código</Th>
                <Th>CNPJ</Th>
                <Th>Filial</Th>
                <Th>Razão Social</Th>
                <Th>Cidade</Th>
                <Th>Estado</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredFiliais.map(filial => (
                <tr key={filial.id}>
                  <Td>{filial.codigo_filial || '-'}</Td>
                  <Td>{filial.cnpj || '-'}</Td>
                  <Td>{filial.filial}</Td>
                  <Td>{filial.razao_social}</Td>
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
              <HeaderActions>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  {viewMode ? 'Fechar' : 'Cancelar'}
                </Button>
                {!viewMode && (
                  <Button type="submit" className="primary" form="filial-form">
                    {editingFilial ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                )}
                <CloseButton onClick={handleCloseModal} className="close-button">&times;</CloseButton>
              </HeaderActions>
            </ModalHeader>
            <Tabs>
              <Tab active={activeTab === 'dados'} onClick={() => setActiveTab('dados')}>Dados</Tab>
              {editingFilial && editingFilial.id && (
                <Tab active={activeTab === 'almoxarifados'} onClick={() => setActiveTab('almoxarifados')}>Almoxarifados</Tab>
              )}
            </Tabs>
            {activeTab === 'dados' && (
              <Form onSubmit={handleSubmit(onSubmit)} id="filial-form">
                <FormFields>
                  <FormGroup>
                    <Label>Código da Filial</Label>
                    <Input type="text" placeholder="Código da filial" {...register('codigo_filial')} disabled={viewMode} />
                  </FormGroup>
                  <FormGroup>
                    <Label>CNPJ</Label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Input 
                        type="text" 
                        placeholder="00.000.000/0000-00" 
                        {...register('cnpj')} 
                        disabled={viewMode}
                        style={{ flex: 1 }}
                      />
                      {!viewMode && (
                        <Button 
                          type="button" 
                          onClick={handleConsultarCNPJ}
                          style={{ 
                            background: 'var(--blue)', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 12px', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Consultar
                        </Button>
                      )}
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Filial *</Label>
                    <Input type="text" placeholder="Nome da filial" {...register('filial', { required: 'Nome da filial é obrigatório' })} disabled={viewMode} />
                    {errors.filial && <span style={{ color: 'red', fontSize: '12px' }}>{errors.filial.message}</span>}
                  </FormGroup>
                  <FormGroup>
                    <Label>Razão Social *</Label>
                    <Input type="text" placeholder="Razão social da empresa" {...register('razao_social', { required: 'Razão social é obrigatória' })} disabled={viewMode} />
                    {errors.razao_social && <span style={{ color: 'red', fontSize: '12px' }}>{errors.razao_social.message}</span>}
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
                    <Label>Status</Label>
                    <Select {...register('status', { required: 'Status é obrigatório' })} disabled={viewMode}>
                      <option value="1">Ativo</option>
                      <option value="0">Inativo</option>
                    </Select>
                    {errors.status && <span style={{ color: 'red', fontSize: '12px' }}>{errors.status.message}</span>}
                  </FormGroup>
                </FormFields>
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
                      <Th>Status</Th>
                      <Th>Ações</Th>
                    </tr>
                      </thead>
                      <tbody>
                        {almoxarifados.map(almox => (
                                                  <tr key={almox.id}>
                          <Td>{almox.nome}</Td>
                          <Td>
                            <StatusBadge $status={almox.status === 1 ? 'ativo' : 'inativo'}>
                              {almox.status === 1 ? 'Ativo' : 'Inativo'}
                            </StatusBadge>
                          </Td>
                            <Td>
                              <ActionButton className="view" title="Itens" onClick={() => handleOpenItensModal(almox)}>
                                <FaEye /> Itens
                              </ActionButton>
                              {!viewMode && (
                                <>
                                  <ActionButton className="edit" title="Editar" onClick={() => { setEditingAlmoxarifado(almox); setShowAlmoxarifadoModal(true); }}>
                                    <FaEdit />
                                  </ActionButton>
                                  <ActionButton className="delete" title="Excluir" onClick={async () => {
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
                    <HeaderActions>
                      <Button type="button" className="secondary" onClick={() => setShowAlmoxarifadoModal(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="primary" form="almoxarifado-form">
                        {editingAlmoxarifado ? 'Atualizar' : 'Cadastrar'}
                      </Button>
                      <CloseButton onClick={() => setShowAlmoxarifadoModal(false)} className="close-button">&times;</CloseButton>
                    </HeaderActions>
                  </ModalHeader>
                  <Form onSubmit={handleSubmit(handleSaveAlmoxarifado)} id="almoxarifado-form">
                    <FormGroup>
                      <Label>Nome *</Label>
                      <Input 
                        type="text" 
                        placeholder="Nome do almoxarifado" 
                        defaultValue={editingAlmoxarifado?.nome || ''}
                        {...register('nome', { required: 'Nome é obrigatório' })} 
                      />
                      {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
                    </FormGroup>
                    <FormGroup>
                      <Label>Status</Label>
                      <Select 
                        defaultValue={editingAlmoxarifado?.status?.toString() || '1'}
                        {...register('status', { required: 'Status é obrigatório' })}
                      >
                        <option value="1">Ativo</option>
                        <option value="0">Inativo</option>
                      </Select>
                      {errors.status && <span style={{ color: 'red', fontSize: '12px' }}>{errors.status.message}</span>}
                    </FormGroup>
                  </Form>
                </ModalContent>
              </Modal>
            )}
          </ModalContent>
        </Modal>
      )}
      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', maxHeight: '90vh', width: '1200px' }}>
            <ModalHeader>
              <ModalTitle>Relatório de Auditoria - Filiais</ModalTitle>
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
                    Período
                  </label>
                  <select
                    value={auditFilters.periodo}
                    onChange={(e) => setAuditFilters({...auditFilters, periodo: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Período personalizado</option>
                    <option value="7dias">Últimos 7 dias</option>
                    <option value="30dias">Últimos 30 dias</option>
                    <option value="90dias">Últimos 90 dias</option>
                    <option value="todos">Todos os registros</option>
                  </select>
                </div>
                <div>
                  <button
                    onClick={handleApplyAuditFilters}
                    style={{
                      marginTop: '20px',
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
                              <strong>Dados da Filial:</strong>
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
                              <strong>ID da Filial:</strong> 
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

      {/* Modal de itens do almoxarifado */}
      {showItensModal && selectedAlmoxarifado && (
        <Modal onClick={() => setShowItensModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <ModalHeader>
              <ModalTitle>Itens do Almoxarifado: {selectedAlmoxarifado.nome}</ModalTitle>
              <CloseButton onClick={() => setShowItensModal(false)}>&times;</CloseButton>
            </ModalHeader>
            
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 16px 0' }}>Adicionar Produto</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 12, alignItems: 'end' }}>
                <FormGroup>
                  <Label>Produto</Label>
                  <Select 
                    value={selectedProduto?.id || ''} 
                    onChange={(e) => {
                      const produto = produtos.find(p => p.id === parseInt(e.target.value));
                      setSelectedProduto(produto);
                    }}
                  >
                    <option value="">Selecione um produto...</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Quantidade</Label>
                  <Input 
                    type="number" 
                    step="0.001"
                    placeholder="0.000" 
                    value={quantidadeProduto}
                    onChange={(e) => setQuantidadeProduto(e.target.value)}
                  />
                </FormGroup>
                <Button 
                  type="button" 
                  className="primary" 
                  onClick={handleAddProduto}
                  disabled={!selectedProduto || !quantidadeProduto}
                >
                  Adicionar
                </Button>
                <Button 
                  type="button" 
                  className="secondary" 
                  onClick={() => {
                    setSearchProduto('');
                    loadProdutos();
                  }}
                >
                  Buscar
                </Button>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 16px 0' }}>Produtos no Almoxarifado</h4>
              {loadingItens ? (
                <LoadingSpinner inline={true} text="Carregando itens..." />
              ) : itensAlmoxarifado.length === 0 ? (
                <EmptyState>Nenhum produto cadastrado neste almoxarifado</EmptyState>
              ) : (
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Produto</Th>
                        <Th>Quantidade</Th>
                        <Th>Ações</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensAlmoxarifado.map(item => (
                        <tr key={item.id}>
                          <Td>{item.produto_nome}</Td>
                          <Td>{item.quantidade}</Td>
                          <Td>
                            <ActionButton 
                              title="Remover" 
                              onClick={() => handleRemoveProduto(item.id)}
                            >
                              <FaTrash />
                            </ActionButton>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableContainer>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Filiais; 