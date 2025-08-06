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
import FornecedoresService from '../services/fornecedores';
import { Button, Input, Modal, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const Fornecedores = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
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
    total_fornecedores: 0,
    fornecedores_ativos: 0,
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
    loadFornecedores();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const loadFornecedores = async (params = {}) => {
      setLoading(true);
    try {
      // Parâmetros de paginação e busca
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm, // Usar termo de busca com debounce
        ...params
      };

      const result = await FornecedoresService.listar(paginationParams);
      if (result.success) {
        setFornecedores(result.data);
        
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
        const ativos = result.data.filter(f => f.status === 1).length;
        const comEmail = result.data.filter(f => f.email && f.email.trim() !== '').length;
        const comTelefone = result.data.filter(f => f.telefone && f.telefone.trim() !== '').length;
        
        setEstatisticas({
          total_fornecedores: total,
          fornecedores_ativos: ativos,
          com_email: comEmail,
          com_telefone: comTelefone
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
      setSearching(false); // Parar loading de busca
    }
  };

  // Filtrar fornecedores (client-side) - apenas para casos especiais
  const filteredFornecedores = Array.isArray(fornecedores) ? fornecedores : [];

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
      params.append('recurso', 'fornecedores');
      
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
      params.append('tabela', 'fornecedores');

      const response = await fetch(`/api/auditoria/export/xlsx?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_fornecedores_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      params.append('tabela', 'fornecedores');

      const response = await fetch(`/api/auditoria/export/pdf?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_fornecedores_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const result = await FornecedoresService.exportarXLSX();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fornecedores.xlsx';
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
      const result = await FornecedoresService.exportarPDF();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fornecedores.pdf';
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
      cnpj: 'CNPJ',
      razao_social: 'Razão Social',
      nome_fantasia: 'Nome Fantasia',
      logradouro: 'Logradouro',
      numero: 'Número',
      cep: 'CEP',
      bairro: 'Bairro',
      municipio: 'Município',
      uf: 'UF',
      email: 'Email',
      telefone: 'Telefone',
      status: 'Status'
    };
    return fields[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (field === 'status') {
        return value === 1 ? 'Ativo' : 'Inativo';
    }
    return value;
  };

  const handleAddFornecedor = () => {
    setViewMode(false);
    setEditingFornecedor(null);
    reset();
    setShowModal(true);
  };

  const handleViewFornecedor = (fornecedor) => {
    setViewMode(true);
    setEditingFornecedor(fornecedor);
    reset(fornecedor);
    setShowModal(true);
  };

  const handleEditFornecedor = (fornecedor) => {
    setViewMode(false);
    setEditingFornecedor(fornecedor);
    reset(fornecedor);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingFornecedor(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        cnpj: data.cnpj && data.cnpj.trim() !== '' ? data.cnpj.trim() : null,
        razao_social: data.razao_social && data.razao_social.trim() !== '' ? data.razao_social.trim() : null,
        nome_fantasia: data.nome_fantasia && data.nome_fantasia.trim() !== '' ? data.nome_fantasia.trim() : null,
        logradouro: data.logradouro && data.logradouro.trim() !== '' ? data.logradouro.trim() : null,
        numero: data.numero && data.numero.trim() !== '' ? data.numero.trim() : null,
        cep: data.cep && data.cep.trim() !== '' ? data.cep.trim() : null,
        bairro: data.bairro && data.bairro.trim() !== '' ? data.bairro.trim() : null,
        municipio: data.municipio && data.municipio.trim() !== '' ? data.municipio.trim() : null,
        uf: data.uf && data.uf.trim() !== '' ? data.uf.trim() : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        telefone: data.telefone && data.telefone.trim() !== '' ? data.telefone.trim() : null,
        status: data.status === '1' ? 1 : 0
      };

      let result;
      if (editingFornecedor) {
        result = await FornecedoresService.atualizar(editingFornecedor.id, cleanData);
      } else {
        result = await FornecedoresService.criar(cleanData);
      }

      if (result.success) {
        toast.success(editingFornecedor ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!');
      handleCloseModal();
      loadFornecedores();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar fornecedor');
    }
  };

  const handleDeleteFornecedor = async (fornecedorId) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        const result = await FornecedoresService.excluir(fornecedorId);
        if (result.success) {
        toast.success('Fornecedor excluído com sucesso!');
        loadFornecedores();
        } else {
          toast.error(result.error);
      }
    } catch (error) {
        toast.error('Erro ao excluir fornecedor');
      }
    }
  };

  const getStatusLabel = (status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Fornecedores</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
          {canCreate('fornecedores') && (
            <Button onClick={handleAddFornecedor} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard
          title="Total de Fornecedores"
          value={estatisticas.total_fornecedores}
          icon={FaBuilding}
          color="blue"
        />
        <StatCard
          title="Fornecedores Ativos"
          value={estatisticas.fornecedores_ativos}
          icon={FaIndustry}
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
        placeholder="Buscar por razão social, CNPJ ou município..."
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

      {/* Tabela */}
      {filteredFornecedores.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {debouncedSearchTerm 
            ? 'Nenhum fornecedor encontrado com os filtros aplicados'
            : 'Nenhum fornecedor cadastrado'
          }
        </div>
      ) : (
                <>
          {console.log('🚀 Fornecedores - Iniciando renderização responsiva', {
            windowWidth: window.innerWidth,
            shouldShowDesktop: window.innerWidth >= 1024,
            shouldShowMobile: window.innerWidth < 1024,
            timestamp: new Date().toISOString()
          })}
          
          {/* Versão Desktop - Tabela completa */}
          {window.innerWidth >= 1024 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {console.log('🔍 Fornecedores - Desktop view renderizando', {
                totalItems: filteredFornecedores.length,
                windowWidth: window.innerWidth,
                breakpoint: window.innerWidth >= 1024 ? 'lg+' : 'sm-md',
                timestamp: new Date().toISOString()
              })}
              <div className="overflow-x-auto">
                <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razão Social
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Município/UF
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                        {fornecedor.cnpj}
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fornecedor.razao_social}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fornecedor.municipio && fornecedor.uf ? `${fornecedor.municipio}/${fornecedor.uf}` : '-'}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {fornecedor.email && <div>{fornecedor.email}</div>}
                        {fornecedor.telefone && <div>{fornecedor.telefone}</div>}
                        {!fornecedor.email && !fornecedor.telefone && '-'}
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        fornecedor.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getStatusLabel(fornecedor.status)}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                        {canView('fornecedores') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleViewFornecedor(fornecedor)}
                            title="Visualizar"
                          >
                              <FaEye className="text-green-600 text-sm" />
                          </Button>
                        )}
                        {canEdit('fornecedores') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEditFornecedor(fornecedor)}
                            title="Editar"
                          >
                              <FaEdit className="text-blue-600 text-sm" />
                          </Button>
                        )}
                        {canDelete('fornecedores') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteFornecedor(fornecedor.id)}
                            title="Excluir"
                          >
                              <FaTrash className="text-red-600 text-sm" />
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

          {/* Versão Mobile - Cards */}
          {window.innerWidth < 1024 && (
            <div className="space-y-3">
            {console.log('📱 Fornecedores - Mobile view renderizando', {
              totalItems: filteredFornecedores.length,
              windowWidth: window.innerWidth,
              breakpoint: window.innerWidth >= 1024 ? 'lg+' : 'sm-md',
              timestamp: new Date().toISOString()
            })}
            {filteredFornecedores.map((fornecedor) => (
              <div key={fornecedor.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{fornecedor.razao_social}</h3>
                    <p className="text-gray-600 text-xs">CNPJ: {fornecedor.cnpj}</p>
                  </div>
                  <div className="flex gap-2">
                    {canView('fornecedores') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleViewFornecedor(fornecedor)}
                        title="Visualizar"
                        className="p-2"
                      >
                        <FaEye className="text-green-600 text-sm" />
                      </Button>
                    )}
                    {canEdit('fornecedores') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEditFornecedor(fornecedor)}
                        title="Editar"
                        className="p-2"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('fornecedores') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteFornecedor(fornecedor.id)}
                        title="Excluir"
                        className="p-2"
                      >
                        <FaTrash className="text-red-600 text-sm" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Localização:</span>
                    <p className="font-medium">
                      {fornecedor.municipio && fornecedor.uf ? `${fornecedor.municipio}/${fornecedor.uf}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      fornecedor.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(fornecedor.status)}
                    </span>
                  </div>
                  {(fornecedor.email || fornecedor.telefone) && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Contato:</span>
                      <div className="mt-1">
                        {fornecedor.email && <p className="font-medium text-xs">{fornecedor.email}</p>}
                        {fornecedor.telefone && <p className="font-medium text-xs">{fornecedor.telefone}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </>
      )}

      {/* Modal de Fornecedor */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Fornecedor' : editingFornecedor ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
        size="full"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Primeira Linha - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Informações Principais */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Informações Principais</h3>
              <div className="space-y-3">
                <Input
                  label="CNPJ *"
                  {...register('cnpj', { required: 'CNPJ é obrigatório' })}
                  error={errors.cnpj?.message}
                  disabled={viewMode}
                />
                <Input
                  label="Razão Social *"
                  {...register('razao_social', { required: 'Razão social é obrigatória' })}
                  error={errors.razao_social?.message}
                  disabled={viewMode}
                />
                <Input
                  label="Nome Fantasia"
                  {...register('nome_fantasia')}
                  error={errors.nome_fantasia?.message}
                  disabled={viewMode}
                />
                  <Input
                  label="Status *"
                  type="select"
                  {...register('status', { required: 'Status é obrigatório' })}
                  error={errors.status?.message}
                  disabled={viewMode}
                >
                  <option value="">Selecione o status</option>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </Input>
                  </div>
                </div>

            {/* Card 2: Contato */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Contato</h3>
              <div className="space-y-3">
                <Input
                  label="Email"
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email inválido'
                    }
                  })}
                  error={errors.email?.message}
                  disabled={viewMode}
                />
                <Input
                  label="Telefone"
                  {...register('telefone')}
                  error={errors.telefone?.message}
                  disabled={viewMode}
                />
              </div>
            </div>
          </div>

          {/* Segunda Linha - 1 Card */}
          <div className="grid grid-cols-1 gap-4">
            {/* Card 3: Endereço */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Endereço</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Logradouro"
                  {...register('logradouro')}
                  error={errors.logradouro?.message}
                  disabled={viewMode}
                />
                <Input
                  label="Número"
                  {...register('numero')}
                  error={errors.numero?.message}
                  disabled={viewMode}
                />
                <Input
                  label="CEP"
                  {...register('cep')}
                  error={errors.cep?.message}
                  disabled={viewMode}
                />
                <Input
                  label="Bairro"
                  {...register('bairro')}
                  error={errors.bairro?.message}
                  disabled={viewMode}
                />
                  <Input
                  label="Município"
                    {...register('municipio')}
                  error={errors.municipio?.message}
                  disabled={viewMode}
                />
                  <Input
                  label="UF"
                  {...register('uf')}
                  error={errors.uf?.message}
                  disabled={viewMode}
                />
              </div>
            </div>
              </div>

          {!viewMode && (
            <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
              <Button type="button" variant="secondary" size="sm" onClick={handleCloseModal}>
                Cancelar
                </Button>
              <Button type="submit" size="sm">
                    {editingFornecedor ? 'Atualizar' : 'Criar'}
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
          title="Relatório de Auditoria - Fornecedores"
        size="full"
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
                              <strong>Dados do Fornecedor:</strong>
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
                              <strong>ID do Fornecedor:</strong> 
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

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
                  </div>
  );
};

export default Fornecedores; 