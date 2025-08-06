import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaHistory,
  FaQuestionCircle,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCar,
  FaCalendarAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import MotoristasService from '../services/motoristas';
import FiliaisService from '../services/filiais';
import { Button, Input, Modal, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const Motoristas = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [motoristas, setMotoristas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState(null);
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
  const [estatisticas, setEstatisticas] = useState({
    total_motoristas: 0,
    motoristas_ativos: 0,
    em_ferias: 0,
    em_licenca: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadMotoristas();
    loadFiliais();
  }, [currentPage, itemsPerPage]);

  const loadFiliais = async () => {
    try {
      const result = await FiliaisService.buscarAtivas();
      if (result.success) {
        setFiliais(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  };

  const loadMotoristas = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await MotoristasService.listar(paginationParams);
      if (result.success) {
        setMotoristas(result.data);
        
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
        const ativos = result.data.filter(m => m.status === 'ativo').length;
        const ferias = result.data.filter(m => m.status === 'ferias').length;
        const licenca = result.data.filter(m => m.status === 'licenca').length;
        
        setEstatisticas({
          total_motoristas: total,
          motoristas_ativos: ativos,
          em_ferias: ferias,
          em_licenca: licenca
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar motoristas');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar motoristas (client-side)
  const filteredMotoristas = motoristas.filter(motorista => {
    const matchesSearch = !searchTerm || 
      (motorista.nome && motorista.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (motorista.cpf && motorista.cpf.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (motorista.cnh && motorista.cnh.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (motorista.telefone && motorista.telefone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

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
      params.append('recurso', 'motoristas');
      
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
      params.append('tabela', 'motoristas');

      const response = await fetch(`/api/auditoria/export/xlsx?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_motoristas_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      params.append('tabela', 'motoristas');

      const response = await fetch(`/api/auditoria/export/pdf?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_motoristas_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const result = await MotoristasService.exportarXLSX();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'motoristas.xlsx';
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
      const result = await MotoristasService.exportarPDF();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'motoristas.pdf';
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
      nome: 'Nome',
      cpf: 'CPF',
      cnh: 'CNH',
      categoria_cnh: 'Categoria CNH',
      telefone: 'Telefone',
      email: 'Email',
      endereco: 'Endereço',
      status: 'Status',
      data_admissao: 'Data de Admissão',
      cnh_validade: 'Validade da CNH',
      filial_id: 'Filial',
      observacoes: 'Observações'
    };
    return fields[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (field === 'status') {
      return getStatusLabel(value);
    }
    if (field === 'data_admissao' || field === 'cnh_validade') {
      return value ? formatDate(value) : 'N/A';
    }
    if (field === 'filial_id') {
      const filial = filiais.find(f => f.id === value);
      return filial ? filial.filial : 'N/A';
    }
    return value;
  };

  const handleAddMotorista = () => {
    setViewMode(false);
    setEditingMotorista(null);
    reset();
    setShowModal(true);
  };

  const handleViewMotorista = (motorista) => {
    setViewMode(true);
    setEditingMotorista(motorista);
    reset(motorista);
    setShowModal(true);
  };

  const handleEditMotorista = (motorista) => {
    setViewMode(false);
    setEditingMotorista(motorista);
    reset(motorista);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingMotorista(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        filial_id: data.filial_id && data.filial_id !== '' ? parseInt(data.filial_id) : null,
        cpf: data.cpf && data.cpf.trim() !== '' ? data.cpf.trim() : null,
        telefone: data.telefone && data.telefone.trim() !== '' ? data.telefone.trim() : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        endereco: data.endereco && data.endereco.trim() !== '' ? data.endereco.trim() : null,
        observacoes: data.observacoes && data.observacoes.trim() !== '' ? data.observacoes.trim() : null,
        cnh: data.cnh && data.cnh.trim() !== '' ? data.cnh.trim() : null,
        categoria_cnh: data.categoria_cnh && data.categoria_cnh.trim() !== '' ? data.categoria_cnh.trim() : null
      };

      let result;
      if (editingMotorista) {
        result = await MotoristasService.atualizar(editingMotorista.id, cleanData);
      } else {
        result = await MotoristasService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingMotorista ? 'Motorista atualizado com sucesso!' : 'Motorista criado com sucesso!');
      handleCloseModal();
      loadMotoristas();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar motorista');
    }
  };

  const handleDeleteMotorista = async (motoristaId) => {
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
    try {
        const result = await MotoristasService.excluir(motoristaId);
        if (result.success) {
      toast.success('Motorista excluído com sucesso!');
      loadMotoristas();
        } else {
          toast.error(result.error);
        }
    } catch (error) {
      toast.error('Erro ao excluir motorista');
      }
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      ferias: 'Em Férias',
      licenca: 'Em Licença'
    };
    return statusMap[status] || status;
  };

  const getCategoriaCNHLabel = (categoria) => {
    const categoriasMap = {
      A: 'A - Motocicletas',
      B: 'B - Automóveis',
      C: 'C - Caminhões',
      D: 'D - Ônibus',
      E: 'E - Reboques'
    };
    return categoriasMap[categoria] || categoria;
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Motoristas</h1>
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
          {canCreate('motoristas') && (
            <Button onClick={handleAddMotorista} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard
          title="Total de Motoristas"
          value={estatisticas.total_motoristas}
          icon={FaUser}
          color="blue"
        />
        <StatCard
          title="Motoristas Ativos"
          value={estatisticas.motoristas_ativos}
          icon={FaCar}
          color="green"
        />
        <StatCard
          title="Em Férias"
          value={estatisticas.em_ferias}
          icon={FaCalendarAlt}
          color="orange"
        />
        <StatCard
          title="Em Licença"
          value={estatisticas.em_licenca}
          icon={FaIdCard}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por nome, CPF, CNH ou telefone..."
      />

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
            {filteredMotoristas.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm 
                      ? 'Nenhum motorista encontrado com os filtros aplicados'
                      : 'Nenhum motorista cadastrado'
                    }
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF/CNH
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filial
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admissão
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMotoristas.map((motorista) => (
                  <tr key={motorista.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {motorista.nome}
                      </div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{motorista.cpf}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{motorista.cnh}</div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{motorista.telefone}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{motorista.email}</div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        motorista.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : motorista.status === 'ferias'
                          ? 'bg-yellow-100 text-yellow-800'
                          : motorista.status === 'licenca'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getStatusLabel(motorista.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {motorista.filial_nome || 'N/A'}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {motorista.data_admissao ? formatDate(motorista.data_admissao) : 'N/A'}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex gap-1 sm:gap-2">
                        {canView('motoristas') && (
                          <Button
                            variant="ghost"
                            size="xs"
                      onClick={() => handleViewMotorista(motorista)}
                            title="Visualizar"
                    >
                            <FaEye className="text-green-600 text-xs sm:text-sm" />
                          </Button>
                        )}
                    {canEdit('motoristas') && (
                          <Button
                            variant="ghost"
                            size="xs"
                        onClick={() => handleEditMotorista(motorista)}
                            title="Editar"
                      >
                            <FaEdit className="text-blue-600 text-xs sm:text-sm" />
                          </Button>
                    )}
                    {canDelete('motoristas') && (
                          <Button
                            variant="ghost"
                            size="xs"
                        onClick={() => handleDeleteMotorista(motorista.id)}
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

      {/* Modal de Motorista */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Motorista' : editingMotorista ? 'Editar Motorista' : 'Adicionar Motorista'}
        size="full"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Primeira Linha - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Informações Pessoais */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Informações Pessoais</h3>
              <div className="space-y-3">
                <Input
                  label="Nome Completo *"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  error={errors.nome?.message}
                  disabled={viewMode}
                />
                <Input
                  label="CPF *"
                  {...register('cpf', { required: 'CPF é obrigatório' })}
                  error={errors.cpf?.message}
                  disabled={viewMode}
                />
                <Input
                  label="Email"
                  type="email"
                  {...register('email')}
                  disabled={viewMode}
                />
                <Input
                  label="Telefone *"
                  {...register('telefone', { required: 'Telefone é obrigatório' })}
                  error={errors.telefone?.message}
                  disabled={viewMode}
                />
              </div>
            </div>

            {/* Card 2: Documentação */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Documentação</h3>
              <div className="space-y-3">
                <Input
                  label="CNH *"
                  {...register('cnh', { required: 'CNH é obrigatória' })}
                  error={errors.cnh?.message}
                  disabled={viewMode}
                />
                <Input
                  label="Categoria CNH *"
                  type="select"
                  {...register('categoria_cnh', { required: 'Categoria CNH é obrigatória' })}
                  error={errors.categoria_cnh?.message}
                  disabled={viewMode}
                >
                  <option value="">Selecione a categoria</option>
                  <option value="A">A - Motocicletas</option>
                  <option value="B">B - Automóveis</option>
                  <option value="C">C - Caminhões</option>
                  <option value="D">D - Ônibus</option>
                  <option value="E">E - Reboques</option>
                </Input>
                <Input
                  label="Validade da CNH"
                  type="date"
                  {...register('cnh_validade')}
                  disabled={viewMode}
                />
              </div>
            </div>
          </div>

          {/* Segunda Linha - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 3: Endereço */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Endereço</h3>
              <div className="space-y-3">
                <Input
                  label="Endereço"
                  type="textarea"
                  {...register('endereco')}
                  disabled={viewMode}
                  rows={3}
                />
              </div>
            </div>

            {/* Card 4: Informações Profissionais */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Informações Profissionais</h3>
              <div className="space-y-3">
                <Input
                  label="Data de Admissão"
                  type="date"
                  {...register('data_admissao')}
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
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="ferias">Em Férias</option>
                  <option value="licenca">Em Licença</option>
                </Input>
                <Input
                  label="Filial"
                  type="select"
                  {...register('filial_id')}
                  disabled={viewMode}
                >
                  <option value="">Selecione a filial</option>
                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.filial}
                    </option>
                  ))}
                </Input>
              </div>
            </div>
          </div>

          {/* Terceira Linha - 1 Card */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Observações</h3>
            <Input
              label="Observações"
              type="textarea"
                  {...register('observacoes')}
              disabled={viewMode}
              rows={4}
            />
          </div>

          {!viewMode && (
            <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
              <Button type="button" variant="secondary" size="sm" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
              <Button type="submit" size="sm">
                    {editingMotorista ? 'Atualizar' : 'Criar'}
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
          title="Relatório de Auditoria - Motoristas"
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
                              <strong>Dados do Motorista:</strong>
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
                              <strong>ID do Motorista:</strong> 
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

export default Motoristas; 