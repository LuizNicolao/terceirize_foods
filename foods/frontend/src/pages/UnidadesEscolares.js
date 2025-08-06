import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle, FaFileExcel, FaFilePdf, FaSchool, FaMapMarkerAlt, FaRoute, FaUsers } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import UnidadesEscolaresService from '../services/unidadesEscolares';
import RotasService from '../services/rotas';
import { Button, Input, Modal, Table, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const UnidadesEscolares = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [unidades, setUnidades] = useState([]);
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRotas, setLoadingRotas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState(null);
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
    total_unidades: 0,
    unidades_ativas: 0,
    total_estados: 0,
    total_cidades: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    isSubmitting
  } = useForm();

  useEffect(() => {
    loadUnidades();
    loadRotas();
  }, [currentPage, itemsPerPage]);

  const loadUnidades = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await UnidadesEscolaresService.listar(paginationParams);
      if (result.success) {
        setUnidades(result.data);
        
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
        const ativas = result.data.filter(u => u.status === 'ativo').length;
        const estados = new Set(result.data.map(u => u.estado)).size;
        const cidades = new Set(result.data.map(u => u.cidade)).size;
        
        setEstatisticas({
          total_unidades: total,
          unidades_ativas: ativas,
          total_estados: estados,
          total_cidades: cidades
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar unidades escolares');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar unidades escolares (client-side como na tela Rotas)
  const filteredUnidades = unidades.filter(unidade => {
    const matchesSearch = !searchTerm || 
      (unidade.nome_escola && unidade.nome_escola.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unidade.codigo_teknisa && unidade.codigo_teknisa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unidade.cidade && unidade.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unidade.estado && unidade.estado.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && unidade.status === 'ativo') ||
      (statusFilter === 'inativo' && unidade.status === 'inativo');
    
    return matchesSearch && matchesStatus;
  });

  // Função para mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Função para mudar itens por página
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Voltar para primeira página
  };

  const loadRotas = async () => {
    setLoadingRotas(true);
    try {
      const result = await RotasService.buscarAtivas();
      if (result.success) {
        setRotas(result.data);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar rotas');
    } finally {
      setLoadingRotas(false);
    }
  };

  const handleAddUnidade = () => {
    setViewMode(false);
    setEditingUnidade(null);
    reset();
    setShowModal(true);
  };

  const handleEditUnidade = (unidade) => {
    setViewMode(false);
    setEditingUnidade(unidade);
    reset(unidade);
    setShowModal(true);
  };

  const handleViewUnidade = (unidade) => {
    setViewMode(true);
    setEditingUnidade(unidade);
    reset(unidade);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingUnidade(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      let result;
      if (editingUnidade) {
        result = await UnidadesEscolaresService.atualizar(editingUnidade.id, data);
      } else {
        result = await UnidadesEscolaresService.criar(data);
      }

      if (result.success) {
        toast.success(editingUnidade ? 'Unidade escolar atualizada com sucesso!' : 'Unidade escolar criada com sucesso!');
        handleCloseModal();
        loadUnidades();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar unidade escolar');
    }
  };

  const handleDeleteUnidade = async (unidadeId) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade escolar?')) {
      try {
        const result = await UnidadesEscolaresService.excluir(unidadeId);
        if (result.success) {
          toast.success('Unidade escolar excluída com sucesso!');
          loadUnidades();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir unidade escolar');
      }
    }
  };

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
      
      const response = await fetch(`/api/auditoria?${params.toString()}`);
      const data = await response.json();
      setAuditLogs(data.logs || []);
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
      params.append('tabela', 'unidades_escolares');

      const response = await fetch(`/api/auditoria/export/xlsx?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_unidades_escolares_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      params.append('tabela', 'unidades_escolares');

      const response = await fetch(`/api/auditoria/export/pdf?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_unidades_escolares_${new Date().toISOString().split('T')[0]}.pdf`);
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
      'nome_escola': 'Nome da Escola',
      'codigo_teknisa': 'Código Teknisa',
      'cidade': 'Cidade',
      'estado': 'Estado',
      'endereco': 'Endereço',
      'centro_distribuicao': 'Centro de Distribuição',
      'rota_id': 'Rota',
      'status': 'Status'
    };
    return labels[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') return '-';
    
    if (field === 'status') {
      return value === 'ativo' ? 'Ativo' : 'Inativo';
    }
    
    if (field === 'rota_id') {
      const rota = rotas.find(r => r.id === parseInt(value));
      return rota ? rota.nome : value;
    }
    
    return String(value);
  };

  const handleExportXLSX = async () => {
    try {
      const response = await fetch('/api/unidades-escolares/export/xlsx', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'unidades-escolares.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Exportação XLSX realizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/unidades-escolares/export/pdf', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'unidades-escolares.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Exportação PDF realizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  };

  const getRotaName = (rotaId) => {
    if (!rotaId) return 'N/A';
    const rota = rotas.find(r => r.id === rotaId);
    return rota ? rota.nome : 'Rota não encontrada';
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando unidades escolares...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <FaQuestionCircle className="text-gray-400 text-xl" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Unidades Escolares</h1>
        </div>
        {canCreate('unidades_escolares') && (
          <Button
            onClick={handleAddUnidade}
            className="w-full sm:w-auto"
          >
            <FaPlus className="mr-2" />
            <span className="hidden sm:inline">Adicionar Unidade</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={FaSchool}
          value={unidades.length}
          title="Total de Unidades"
          color="blue"
        />
        <StatCard
          icon={FaMapMarkerAlt}
          value={unidades.filter(u => u.status === 'ativo').length}
          title="Unidades Ativas"
          color="green"
        />
        <StatCard
          icon={FaRoute}
          value={new Set(unidades.map(u => u.estado)).size}
          title="Estados"
          color="purple"
        />
        <StatCard
          icon={FaUsers}
          value={new Set(unidades.map(u => u.cidade)).size}
          title="Cidades"
          color="orange"
        />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={() => {
          setSearchTerm('');
          setStatusFilter('todos');
        }}
        placeholder="Buscar por nome, cidade ou código..."
      />

      {/* Botões de Exportação */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleExportXLSX}>
          <FaFileExcel className="text-green-600" />
          <span className="hidden sm:inline">Exportar XLSX</span>
          <span className="sm:hidden">XLSX</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleExportPDF}>
          <FaFilePdf className="text-red-600" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>

      {/* Tabela */}
      {filteredUnidades.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
          {searchTerm || statusFilter !== 'todos'
            ? 'Nenhuma unidade escolar encontrada com os filtros aplicados'
            : 'Nenhuma unidade escolar cadastrada'
          }
        </div>
      ) : (
        <>
          {/* Versão Desktop - Tabela completa */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Escola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cidade/Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Centro Distribuição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rota
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
                {filteredUnidades.map((unidade) => (
                  <tr key={unidade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {unidade.nome_escola}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unidade.codigo_teknisa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{unidade.cidade}</div>
                      <div className="text-sm text-gray-500">{unidade.estado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unidade.centro_distribuicao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loadingRotas ? 'Carregando...' : getRotaName(unidade.rota_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        unidade.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {canView('unidades_escolares') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleViewUnidade(unidade)}
                            title="Visualizar"
                          >
                            <FaEye className="text-green-600 text-sm" />
                          </Button>
                        )}
                        {canEdit('unidades_escolares') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEditUnidade(unidade)}
                            title="Editar"
                          >
                            <FaEdit className="text-blue-600 text-sm" />
                          </Button>
                        )}
                        {canDelete('unidades_escolares') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteUnidade(unidade.id)}
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
            </Table>
          </div>

          {/* Versão Mobile - Cards */}
          <div className="lg:hidden space-y-3">
            {filteredUnidades.map((unidade) => (
              <div key={unidade.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{unidade.nome_escola}</h3>
                    <p className="text-gray-600 text-xs">Código: {unidade.codigo_teknisa}</p>
                  </div>
                  <div className="flex gap-2">
                    {canView('unidades_escolares') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleViewUnidade(unidade)}
                        title="Visualizar"
                        className="p-2"
                      >
                        <FaEye className="text-green-600 text-sm" />
                      </Button>
                    )}
                    {canEdit('unidades_escolares') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEditUnidade(unidade)}
                        title="Editar"
                        className="p-2"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('unidades_escolares') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteUnidade(unidade.id)}
                        title="Excluir"
                        className="p-2"
                      >
                        <FaTrash className="text-red-600 text-sm" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500">Cidade:</span>
                    <p className="font-medium text-gray-900">{unidade.cidade}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <p className="font-medium text-gray-900">{unidade.estado}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Centro Distribuição:</span>
                    <p className="font-medium text-gray-900">{unidade.centro_distribuicao || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rota:</span>
                    <p className="font-medium text-gray-900">
                      {loadingRotas ? 'Carregando...' : getRotaName(unidade.rota_id)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      unidade.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Unidade Escolar' : editingUnidade ? 'Editar Unidade Escolar' : 'Adicionar Unidade Escolar'}
        size="full"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Nome da Escola *"
              {...register('nome_escola', { required: 'Nome da escola é obrigatório' })}
              error={errors.nome_escola?.message}
              disabled={viewMode}
            />
            <Input
              label="Código Teknisa *"
              {...register('codigo_teknisa', { required: 'Código Teknisa é obrigatório' })}
              error={errors.codigo_teknisa?.message}
              disabled={viewMode}
            />
            <Input
              label="Cidade *"
              {...register('cidade', { required: 'Cidade é obrigatória' })}
              error={errors.cidade?.message}
              disabled={viewMode}
            />
            <Input
              label="Estado *"
              {...register('estado', { required: 'Estado é obrigatório' })}
              error={errors.estado?.message}
              disabled={viewMode}
            />
            <Input
              label="Centro de Distribuição"
              {...register('centro_distribuicao')}
              disabled={viewMode}
            />
            <Input
              label="Rota"
              type="select"
              {...register('rota_id')}
              disabled={viewMode}
            >
              <option value="">Selecione uma rota</option>
              {rotas.map((rota) => (
                <option key={rota.id} value={rota.id}>
                  {rota.nome}
                </option>
              ))}
            </Input>
          </div>
          
          {!viewMode && (
            <Input
              label="Status *"
              type="select"
              {...register('status', { required: 'Status é obrigatório' })}
              error={errors.status?.message}
            >
              <option value="">Selecione o status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Input>
          )}

          {!viewMode && (
            <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
              <Button type="button" variant="secondary" size="sm" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                {editingUnidade ? 'Atualizar' : 'Criar'}
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
          title="Relatório de Auditoria - Unidades Escolares"
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
                              <strong>Dados da Unidade Escolar:</strong>
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
                              <strong>ID da Unidade Escolar:</strong> 
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

export default UnidadesEscolares; 