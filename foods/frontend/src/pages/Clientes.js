import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaHistory,
  FaQuestionCircle,
  FaFileExcel,
  FaFilePdf,
  FaBuilding,
  FaIndustry,
  FaTruck,
  FaStore,
  FaUsers
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import ClientesService from '../services/clientes';
import { Button, Input, Modal, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const Clientes = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
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
  const [searching, setSearching] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total_clientes: 0,
    clientes_ativos: 0,
    com_email: 0,
    com_telefone: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Resetar para primeira página quando buscar
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Mostrar loading quando buscar
  useEffect(() => {
    if (searchTerm && searchTerm !== debouncedSearchTerm) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    loadClientes();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const loadClientes = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação e busca
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm, // Usar termo de busca com debounce
        ...params
      };

      const result = await ClientesService.listar(paginationParams);
      if (result.success) {
        setClientes(result.data);
        
        // Extrair informações de paginação
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          // Fallback se não houver paginação no backend
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }
        
        // Calcular estatísticas básicas
        const total = result.pagination?.totalItems || result.data.length;
        const ativos = result.data.filter(c => c.status === 1).length;
        const comEmail = result.data.filter(c => c.email && c.email.trim() !== '').length;
        const comTelefone = result.data.filter(c => c.telefone && c.telefone.trim() !== '').length;
        
        setEstatisticas({
          total_clientes: total,
          clientes_ativos: ativos,
          com_email: comEmail,
          com_telefone: comTelefone
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
      setSearching(false); // Parar loading de busca
    }
  };

  // Filtrar clientes (client-side) - apenas para casos especiais
  const filteredClientes = Array.isArray(clientes) ? clientes : [];

  // Função para mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const loadAuditLogs = async () => {
          setAuditLoading(true);
    try {
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
      params.append('recurso', 'clientes');
      
      const response = await fetch(`/api/auditoria?${params.toString()}`);
      const data = await response.json();
      setAuditLogs(data.logs || []);
    } catch (error) {
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

  const handleApplyAuditFilters = () => { 
    loadAuditLogs(); 
  };

  // Exportar auditoria para XLSX
  const handleExportAuditXLSX = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.dataInicio) params.append('dataInicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('dataFim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      if (auditFilters.periodo) params.append('periodo', auditFilters.periodo);
      params.append('tabela', 'clientes');

      const response = await fetch(`/api/auditoria/export/xlsx?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
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
  const handleExportAuditPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.dataInicio) params.append('dataInicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('dataFim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      if (auditFilters.periodo) params.append('periodo', auditFilters.periodo);
      params.append('tabela', 'clientes');

      const response = await fetch(`/api/auditoria/export/pdf?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_clientes_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const handleExportXLSX = async () => {
    try {
      const result = await ClientesService.exportarXLSX();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clientes.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Exportação XLSX realizada com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao exportar XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      const result = await ClientesService.exportarPDF();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clientes.pdf';
        a.click();
      window.URL.revokeObjectURL(url);
        toast.success('Exportação PDF realizada com sucesso!');
              } else {
        toast.error(result.error);
      }
            } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  };

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
    const fields = {
      razao_social: 'Razão Social',
      nome_fantasia: 'Nome Fantasia',
      cnpj: 'CNPJ',
      email: 'Email',
      telefone: 'Telefone',
      logradouro: 'Logradouro',
      numero: 'Número',
      bairro: 'Bairro',
      municipio: 'Município',
      uf: 'UF',
      cep: 'CEP',
      status: 'Status'
    };
    return fields[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (field === 'status') {
        return value === 1 ? 'Ativo' : 'Inativo';
    }
    if (field === 'cnpj') {
      return value ? value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';
    }
    return value || '-';
  };

  const handleAddCliente = () => {
    setEditingCliente(null);
    setViewMode(false);
    setShowModal(true);
    reset();
  };

  const handleViewCliente = (cliente) => {
    setEditingCliente(cliente);
    setViewMode(true);
    setShowModal(true);
    reset(cliente);
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setViewMode(false);
    setShowModal(true);
    reset(cliente);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    setViewMode(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      // Limpar dados antes de enviar
      const cleanData = {
        razao_social: data.razao_social && data.razao_social.trim() !== '' ? data.razao_social.trim() : null,
        nome_fantasia: data.nome_fantasia && data.nome_fantasia.trim() !== '' ? data.nome_fantasia.trim() : null,
        cnpj: data.cnpj && data.cnpj.trim() !== '' ? data.cnpj.replace(/\D/g, '') : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        telefone: data.telefone && data.telefone.trim() !== '' ? data.telefone.trim() : null,
        logradouro: data.logradouro && data.logradouro.trim() !== '' ? data.logradouro.trim() : null,
        numero: data.numero && data.numero.trim() !== '' ? data.numero.trim() : null,
        bairro: data.bairro && data.bairro.trim() !== '' ? data.bairro.trim() : null,
        municipio: data.municipio && data.municipio.trim() !== '' ? data.municipio.trim() : null,
        uf: data.uf && data.uf.trim() !== '' ? data.uf.trim().toUpperCase() : null,
        cep: data.cep && data.cep.trim() !== '' ? data.cep.replace(/\D/g, '') : null,
        status: data.status || 1
      };

      let result;
      if (editingCliente) {
        result = await ClientesService.atualizar(editingCliente.id, cleanData);
      } else {
        result = await ClientesService.criar(cleanData);
      }

      if (result.success) {
        toast.success(result.message);
      handleCloseModal();
      loadClientes();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleDeleteCliente = async (clienteId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const result = await ClientesService.excluir(clienteId);
        if (result.success) {
          toast.success(result.message);
        loadClientes();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  const getStatusLabel = (status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  };

  // Função para buscar dados do CNPJ
  const buscarDadosCNPJ = async (cnpj) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length === 14) {
        const result = await ClientesService.buscarCNPJ(cnpjLimpo);
        
        if (result.success && result.data) {
          const dados = result.data;
          
          // Verificar se os dados têm a estrutura esperada
          if (!dados.razao_social) {
            toast.error('Dados do CNPJ incompletos ou inválidos');
            return;
          }
          
          // Usar reset para atualizar todos os campos de uma vez
          const formData = {
            razao_social: dados.razao_social || '',
            nome_fantasia: dados.nome_fantasia || '',
            logradouro: dados.logradouro || '',
            numero: dados.numero || '',
            bairro: dados.bairro || '',
            municipio: dados.municipio || '',
            uf: dados.uf || '',
            cep: dados.cep ? formatCEP(dados.cep) : '',
            cnpj: cnpj // Manter o CNPJ formatado
          };
          
          reset(formData);
          
          toast.success('Dados do CNPJ carregados automaticamente!');
    } else {
          toast.error(result.error || 'Erro ao buscar dados do CNPJ');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do CNPJ:', error);
      toast.error('Erro ao buscar dados do CNPJ');
    }
  };

  // Função para formatar CNPJ
  const formatCNPJ = (value) => {
    const cnpj = value.replace(/\D/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Função para validar CNPJ
  const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    let peso = 2;
    
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    
    soma = 0;
    peso = 2;
    
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    
    return parseInt(cnpj.charAt(12)) === digito1 && parseInt(cnpj.charAt(13)) === digito2;
  };

  // Função para formatar telefone
  const formatTelefone = (value) => {
    const telefone = value.replace(/\D/g, '');
    if (telefone.length <= 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Função para lidar com mudança no CNPJ
  const handleCNPJChange = (e) => {
    const value = e.target.value;
    const formatted = formatCNPJ(value);
    e.target.value = formatted;
    
    // Buscar dados automaticamente se CNPJ estiver completo e válido
    const cnpjLimpo = formatted.replace(/\D/g, '');
    if (cnpjLimpo.length === 14 && validarCNPJ(formatted)) {
          buscarDadosCNPJ(formatted);
    }
  };

  // Função para formatar CEP
  const formatCEP = (value) => {
    const cep = value.replace(/\D/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para lidar com mudança no telefone
  const handleTelefoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatTelefone(value);
    e.target.value = formatted;
  };

  // Função para lidar com mudança no CEP
  const handleCEPChange = (e) => {
    const value = e.target.value;
    const formatted = formatCEP(value);
    e.target.value = formatted;
  };



  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Clientes</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {canCreate('clientes') && (
            <Button onClick={handleAddCliente} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Cliente</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
          
          <Button onClick={handleOpenAuditModal} variant="ghost" size="sm">
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Auditoria</span>
          </Button>
          

          

        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Clientes"
          value={estatisticas.total_clientes}
          icon={FaUsers}
          color="blue"
        />
        <StatCard
          title="Clientes Ativos"
          value={estatisticas.clientes_ativos}
          icon={FaBuilding}
          color="green"
        />
        <StatCard
          title="Com Email"
          value={estatisticas.com_email}
          icon={FaStore}
          color="purple"
        />
        <StatCard
          title="Com Telefone"
          value={estatisticas.com_telefone}
          icon={FaTruck}
          color="orange"
        />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por razão social, nome fantasia, CNPJ ou município..."
      />
      
      {/* Indicador de busca */}
      {searching && (
        <div className="flex items-center justify-center py-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Buscando...
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mb-4">
        <Button onClick={handleExportXLSX} variant="outline" size="sm">
          <FaFileExcel className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Exportar XLSX</span>
          <span className="sm:hidden">XLSX</span>
        </Button>
        <Button onClick={handleExportPDF} variant="outline" size="sm">
          <FaFilePdf className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando clientes...</p>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {debouncedSearchTerm 
                      ? 'Nenhum cliente encontrado com os filtros aplicados'
                      : 'Nenhum cliente cadastrado'
                    }
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razão Social
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Município/UF
                  </th>
                  <th className="hidden lg:table-cell px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {cliente.cnpj ? cliente.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '-'}
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {cliente.razao_social}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {cliente.municipio && cliente.uf ? `${cliente.municipio}/${cliente.uf}` : '-'}
                    </td>
                    <td className="hidden lg:table-cell px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <div>
                        {cliente.email && <div>{cliente.email}</div>}
                        {cliente.telefone && <div>{cliente.telefone}</div>}
                        {!cliente.email && !cliente.telefone && '-'}
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        cliente.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getStatusLabel(cliente.status)}
                      </span>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex gap-1 sm:gap-2">
                        {canView('clientes') && (
                          <Button
                            variant="ghost"
                            size="xs"
                      onClick={() => handleViewCliente(cliente)}
                            title="Visualizar"
                    >
                            <FaEye className="text-green-600 text-xs sm:text-sm" />
                          </Button>
                        )}
                    {canEdit('clientes') && (
                          <Button
                            variant="ghost"
                            size="xs"
                        onClick={() => handleEditCliente(cliente)}
                            title="Editar"
                      >
                            <FaEdit className="text-blue-600 text-xs sm:text-sm" />
                          </Button>
                    )}
                    {canDelete('clientes') && (
                          <Button
                            variant="ghost"
                            size="xs"
                        onClick={() => handleDeleteCliente(cliente.id)}
                            title="Excluir"
                      >
                            <FaTrash className="text-red-600 text-xs sm:text-sm" />
                          </Button>
                    )}
                      </div>
                    </td>
                </tr>
                ))}
          </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {!loading && filteredClientes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Modal de Cliente */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Cliente' : editingCliente ? 'Editar Cliente' : 'Adicionar Cliente'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className={`grid grid-cols-1 ${viewMode ? 'lg:grid-cols-3 md:grid-cols-2' : 'lg:grid-cols-3 md:grid-cols-2'} gap-3 sm:gap-4`}>
            {/* Primeira linha - Informações básicas */}
            <div className="lg:col-span-2">
              <Input
                label="Razão Social"
                {...register('razao_social', { required: 'Razão social é obrigatória' })}
                error={errors.razao_social?.message}
                disabled={viewMode}
              />
            </div>
            
            <div>
                <Input
                label="CNPJ"
                {...register('cnpj')}
                error={errors.cnpj?.message}
                disabled={viewMode}
                placeholder="00.000.000/0000-00"
                onChange={handleCNPJChange}
              />
            </div>

            <div>
                <Input
                label="Nome Fantasia"
                  {...register('nome_fantasia')}
                error={errors.nome_fantasia?.message}
                disabled={viewMode}
                />
            </div>

            <div>
                  <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                disabled={viewMode}
              />
                    </div>

            <div>
                <Input
                label="Telefone"
                  {...register('telefone')}
                error={errors.telefone?.message}
                disabled={viewMode}
                placeholder="(00) 00000-0000"
                onChange={handleTelefoneChange}
              />
                </div>

            {/* Segunda linha - Endereço */}
            <div className="lg:col-span-2">
                <Input
                label="Logradouro"
                  {...register('logradouro')}
                error={errors.logradouro?.message}
                disabled={viewMode}
                />
            </div>

            <div>
                <Input
                label="Número"
                  {...register('numero')}
                error={errors.numero?.message}
                disabled={viewMode}
                />
            </div>

            <div>
                <Input
                label="Bairro"
                  {...register('bairro')}
                error={errors.bairro?.message}
                disabled={viewMode}
                />
            </div>

            <div>
                  <Input
                label="CEP"
                    {...register('cep')}
                error={errors.cep?.message}
                disabled={viewMode}
                placeholder="00000-000"
                onChange={handleCEPChange}
                  />
              </div>

                <div>
              <Input
                label="Município"
                {...register('municipio')}
                error={errors.municipio?.message}
                disabled={viewMode}
                  />
                </div>

                <div>
              <Input
                label="UF"
                {...register('uf')}
                error={errors.uf?.message}
                disabled={viewMode}
                maxLength={2}
                placeholder="SP"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
                  </label>
                  <select
                {...register('status')}
                disabled={viewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              >
                <option value={1}>Ativo</option>
                <option value={0}>Inativo</option>
                  </select>
                </div>
                </div>

          {!viewMode && (
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingCliente ? 'Atualizar' : 'Criar'} Cliente
              </Button>
                </div>
          )}
        </form>
      </Modal>

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal
          isOpen={showAuditModal}
          onClose={handleCloseAuditModal}
          title="Relatório de Auditoria - Clientes"
          size="xl"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Filtros de Auditoria */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Filtros</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <Input
                  label="Data Início"
                  type="date"
                  value={auditFilters.dataInicio}
                  onChange={(e) => setAuditFilters({...auditFilters, dataInicio: e.target.value})}
                />
                <Input
                  label="Data Fim"
                  type="date"
                  value={auditFilters.dataFim}
                  onChange={(e) => setAuditFilters({...auditFilters, dataFim: e.target.value})}
                />
                <Input
                  label="Ação"
                  type="select"
                  value={auditFilters.acao}
                  onChange={(e) => setAuditFilters({...auditFilters, acao: e.target.value})}
                >
                  <option value="">Todas as ações</option>
                  <option value="create">Criar</option>
                  <option value="update">Editar</option>
                  <option value="delete">Excluir</option>
                </Input>
                <Input
                  label="Período"
                  type="select"
                  value={auditFilters.periodo}
                  onChange={(e) => setAuditFilters({...auditFilters, periodo: e.target.value})}
                >
                  <option value="">Período personalizado</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                  <option value="todos">Todos os registros</option>
                </Input>
                <div className="flex items-end">
                  <Button onClick={handleApplyAuditFilters} size="sm" className="w-full">
                    <span className="hidden sm:inline">Aplicar Filtros</span>
                    <span className="sm:hidden">Aplicar</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Botões de Exportação */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button onClick={handleExportAuditXLSX} variant="secondary" size="sm">
                <FaFileExcel className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
              <Button onClick={handleExportAuditPDF} variant="secondary" size="sm">
                <FaFilePdf className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
            
            {/* Lista de Logs */}
            <div className="max-h-64 sm:max-h-96 overflow-y-auto">
              {auditLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Carregando logs...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                  Nenhum log encontrado com os filtros aplicados
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {auditLogs.length} log(s) encontrado(s)
                  </div>
                  {auditLogs.map((log, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-3 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            log.acao === 'create' ? 'bg-green-100 text-green-800' : 
                            log.acao === 'update' ? 'bg-yellow-100 text-yellow-800' : 
                            log.acao === 'delete' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getActionLabel(log.acao)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600">
                            por {log.usuario_nome || 'Usuário desconhecido'}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      
                      {log.detalhes && (
                        <div className="text-xs sm:text-sm text-gray-800">
                          {log.detalhes.changes && (
                            <div className="mb-2 sm:mb-3">
                              <strong>Mudanças Realizadas:</strong>
                              <div className="mt-1 sm:mt-2 space-y-1 sm:space-y-2">
                                {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                  <div key={field} className="p-2 sm:p-3 bg-gray-50 rounded-lg border">
                                    <div className="font-semibold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm">
                                      {getFieldLabel(field)}:
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs">
                                      <span className="text-red-600">
                                        <strong>Antes:</strong> {formatFieldValue(field, change.from)}
                                      </span>
                                      <span className="text-gray-500 hidden sm:inline">→</span>
                                      <span className="text-green-600">
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
                              <strong>Dados do Cliente:</strong>
                              <div className="mt-1 sm:mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                                {Object.entries(log.detalhes.requestBody).map(([field, value]) => (
                                  <div key={field} className="p-1.5 sm:p-2 bg-gray-50 rounded border text-xs">
                                    <div className="font-semibold text-gray-800 mb-0.5 sm:mb-1">
                                      {getFieldLabel(field)}:
                                    </div>
                                    <div className="text-green-600">
                                      {formatFieldValue(field, value)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.detalhes.resourceId && (
                            <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-blue-50 rounded border text-xs">
                              <strong>ID do Cliente:</strong> 
                              <span className="text-blue-600 ml-1">
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
          </div>
        </Modal>
      )}
                </div>
  );
};

export default Clientes; 
