import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle, FaFileExcel, FaFilePdf, FaChevronDown, FaChevronUp, FaRoute, FaMapMarkedAlt, FaTruck, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import { Button, Input, Modal, Table, StatCard } from '../components/ui';
import RotasService from '../services/rotas';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';
import api from '../services/api';

const Rotas = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [rotas, setRotas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRota, setEditingRota] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [filialFilter, setFilialFilter] = useState('todos');
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
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [showUnidades, setShowUnidades] = useState(false);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [estatisticas, setEstatisticas] = useState({
    total_rotas: 0,
    rotas_ativas: 0,
    rotas_inativas: 0,
    rotas_semanais: 0,
    rotas_quinzenais: 0,
    rotas_mensais: 0,
    rotas_transferencia: 0,
    distancia_total: 0,
    custo_total_diario: 0
  });
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues
  } = useForm();

  // Carregar rotas
  const loadRotas = async () => {
    try {
      setLoading(true);
      
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage
      };

      const result = await RotasService.listar(paginationParams);
      if (result.success) {
        setRotas(result.data || []);
        
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
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
      toast.error('Erro ao carregar rotas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      setLoadingFiliais(true);
      const response = await api.get('/filiais');
      setFiliais(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      setFiliais([]);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  };

  // Carregar estatísticas
  const loadEstatisticas = async () => {
    try {
      const result = await RotasService.buscarEstatisticas();
      if (result.success) {
        // Garantir que os valores sejam números
        const stats = result.data || {};
        setEstatisticas({
          total_rotas: parseInt(stats.total_rotas) || 0,
          rotas_ativas: parseInt(stats.rotas_ativas) || 0,
          rotas_inativas: parseInt(stats.rotas_inativas) || 0,
          rotas_semanais: parseInt(stats.rotas_semanais) || 0,
          rotas_quinzenais: parseInt(stats.rotas_quinzenais) || 0,
          rotas_mensais: parseInt(stats.rotas_mensais) || 0,
          rotas_transferencia: parseInt(stats.rotas_transferencia) || 0,
          distancia_total: parseFloat(stats.distancia_total) || 0,
          custo_total_diario: parseFloat(stats.custo_total_diario) || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Definir valores padrão em caso de erro
      setEstatisticas({
        total_rotas: 0,
        rotas_ativas: 0,
        rotas_inativas: 0,
        rotas_semanais: 0,
        rotas_quinzenais: 0,
        rotas_mensais: 0,
        rotas_transferencia: 0,
        distancia_total: 0,
        custo_total_diario: 0
      });
    }
  };

  // Carregar total de unidades escolares vinculadas a uma rota
  const loadTotalUnidades = async (rotaId) => {
    try {
      const result = await RotasService.buscarUnidadesEscolares(rotaId);
      if (result.success) {
        setTotalUnidades(result.data.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar total de unidades escolares:', error);
      setTotalUnidades(0);
    }
  };

  // Carregar unidades escolares vinculadas a uma rota
  const loadUnidadesEscolares = async (rotaId) => {
    try {
      setLoadingUnidades(true);
      const result = await RotasService.buscarUnidadesEscolares(rotaId);
      if (result.success) {
        setUnidadesEscolares(result.data.unidades || []);
        setTotalUnidades(result.data.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      setUnidadesEscolares([]);
      setTotalUnidades(0);
    } finally {
      setLoadingUnidades(false);
    }
  };

  useEffect(() => {
    loadRotas();
    loadFiliais();
    loadEstatisticas();
  }, [currentPage, itemsPerPage]);

  // Carregar logs de auditoria
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
      params.append('recurso', 'rotas');
      
      const response = await fetch(`/api/auditoria?${params.toString()}`);
      const data = await response.json();
      setAuditLogs(data.data?.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  // Abrir modal para adicionar rota
  const handleAddRota = () => {
    setEditingRota(null);
    reset();
    setValue('status', 'ativo');
    setValue('tipo_rota', 'semanal');
    setShowModal(true);
  };

  // Abrir modal para visualizar rota
  const handleViewRota = (rota) => {
    setEditingRota(rota);
    setValue('filial_id', rota.filial_id);
    setValue('codigo', rota.codigo);
    setValue('nome', rota.nome);
    setValue('distancia_km', rota.distancia_km);
    setValue('status', rota.status);
    setValue('tipo_rota', rota.tipo_rota);
    setValue('custo_diario', rota.custo_diario);
    setValue('observacoes', rota.observacoes);
    setViewMode(true);
    setShowModal(true);
    setShowUnidades(false);
    setUnidadesEscolares([]);
    setTotalUnidades(0);
    
    // Carregar total de unidades escolares
    loadTotalUnidades(rota.id);
  };

  // Abrir modal para editar rota
  const handleEditRota = (rota) => {
    setEditingRota(rota);
    setValue('filial_id', rota.filial_id);
    setValue('codigo', rota.codigo);
    setValue('nome', rota.nome);
    setValue('distancia_km', rota.distancia_km);
    setValue('status', rota.status);
    setValue('tipo_rota', rota.tipo_rota);
    setValue('custo_diario', rota.custo_diario);
    setValue('observacoes', rota.observacoes);
    setViewMode(false);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRota(null);
    setViewMode(false);
    setShowUnidades(false);
    setUnidadesEscolares([]);
    setTotalUnidades(0);
    reset();
  };

  // Salvar rota
  const onSubmit = async (data) => {
    try {
      let result;
      if (editingRota) {
        result = await RotasService.atualizar(editingRota.id, data);
      } else {
        result = await RotasService.criar(data);
      }
      
      if (result.success) {
        toast.success(result.message);
        handleCloseModal();
        loadRotas();
        loadEstatisticas();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar rota:', error);
      toast.error('Erro ao salvar rota');
    }
  };

  // Excluir rota
  const handleDeleteRota = async (rotaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta rota?')) {
      try {
        const result = await RotasService.excluir(rotaId);
        if (result.success) {
          toast.success(result.message);
          loadRotas();
          loadEstatisticas();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir rota:', error);
        toast.error('Erro ao excluir rota');
      }
    }
  };

  // Abrir modal de auditoria
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
      'codigo': 'Código',
      'nome': 'Nome',
      'filial_id': 'Filial',
      'status': 'Status',
      'custo_diario': 'Custo Diário',
      'observacoes': 'Observações'
    };
    return labels[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') return '-';
    
    if (field === 'status') {
      return value === 'ativo' ? 'Ativo' : 'Inativo';
    }
    
    if (field === 'filial_id') {
      return getFilialName(parseInt(value));
    }
    
    if (field === 'custo_diario') {
      return formatCurrency(value);
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
      params.append('tabela', 'rotas');

      const response = await fetch(`/api/auditoria/export/xlsx?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_rotas_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      params.append('tabela', 'rotas');

      const response = await fetch(`/api/auditoria/export/pdf?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_rotas_${new Date().toISOString().split('T')[0]}.pdf`);
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

  // Filtrar rotas
  const filteredRotas = rotas.filter(rota => {
    const matchesSearch = !searchTerm || 
      (rota.codigo && rota.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rota.nome && rota.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rota.id && rota.id.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'todos' || rota.status === statusFilter;
    const matchesFilial = filialFilter === 'todos' || rota.filial_id.toString() === filialFilter;
    
    return matchesSearch && matchesStatus && matchesFilial;
  });

  // Obter nome da filial
  const getFilialName = (filialId) => {
    if (!filialId) return 'N/A';
    const filial = filiais.find(f => f.id === parseInt(filialId));
    return filial ? filial.filial : 'Filial não encontrada';
  };

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Formatar tipo de rota
  const formatTipoRota = (tipo) => {
    const tipos = {
      'semanal': 'Semanal',
      'quinzenal': 'Quinzenal',
      'mensal': 'Mensal',
      'transferencia': 'Transferência'
    };
    return tipos[tipo] || tipo;
  };

  // Loading inline simples (sem quadrado verde)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rotas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Rotas</h1>
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
          {canCreate('rotas') && (
            <Button onClick={handleAddRota} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Rota</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard
          title="Total de Rotas"
          value={estatisticas.total_rotas}
          icon={FaRoute}
          color="blue"
        />
        <StatCard
          title="Rotas Ativas"
          value={estatisticas.rotas_ativas}
          icon={FaMapMarkedAlt}
          color="green"
        />
                 <StatCard
           title="Distância Total"
           value={`${(estatisticas.distancia_total || 0).toFixed(1)} km`}
           icon={FaTruck}
           color="purple"
         />
                 <StatCard
           title="Custo Total Diário"
           value={formatCurrency(estatisticas.custo_total_diario || 0)}
           icon={FaMoneyBillWave}
           color="orange"
         />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        additionalFilters={[
          {
            label: 'Filial',
            value: filialFilter,
            onChange: setFilialFilter,
            options: [
              { value: 'todos', label: loadingFiliais ? 'Carregando...' : 'Todas as filiais' },
              ...filiais.map(filial => ({
                value: filial.id.toString(),
                label: filial.filial
              }))
            ]
          }
        ]}
      />

      {/* Tabela */}
      {filteredRotas.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm || statusFilter !== 'todos' || filialFilter !== 'todos' 
            ? 'Nenhuma rota encontrada com os filtros aplicados'
            : 'Nenhuma rota cadastrada'
          }
        </div>
      ) : (
        <>
          {/* Versão Desktop - Tabela completa */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filial</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distância</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRotas.map((rota) => (
                  <tr key={rota.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loadingFiliais ? (
                        <span className="text-gray-400">Carregando...</span>
                      ) : (
                        getFilialName(rota.filial_id)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.codigo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rota.distancia_km}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        rota.tipo_rota === 'semanal' ? 'bg-blue-100 text-blue-800' :
                        rota.tipo_rota === 'quinzenal' ? 'bg-purple-100 text-purple-800' :
                        rota.tipo_rota === 'mensal' ? 'bg-green-100 text-green-800' :
                        rota.tipo_rota === 'transferencia' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formatTipoRota(rota.tipo_rota)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(rota.custo_diario)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        rota.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {rota.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleViewRota(rota)}
                          title="Visualizar"
                        >
                          <FaEye className="text-green-600 text-sm" />
                        </Button>
                        {canEdit('rotas') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEditRota(rota)}
                            title="Editar"
                          >
                            <FaEdit className="text-blue-600 text-sm" />
                          </Button>
                        )}
                        {canDelete('rotas') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteRota(rota.id)}
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
            {filteredRotas.map((rota) => (
              <div key={rota.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{rota.nome}</h3>
                    <p className="text-gray-600 text-xs">ID: {rota.id} | Código: {rota.codigo}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleViewRota(rota)}
                      title="Visualizar"
                      className="p-2"
                    >
                      <FaEye className="text-green-600 text-sm" />
                    </Button>
                    {canEdit('rotas') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEditRota(rota)}
                        title="Editar"
                        className="p-2"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('rotas') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteRota(rota.id)}
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
                    <span className="text-gray-500">Filial:</span>
                    <p className="font-medium">
                      {loadingFiliais ? 'Carregando...' : getFilialName(rota.filial_id)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Distância:</span>
                    <p className="font-medium">{rota.distancia_km} km</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      rota.tipo_rota === 'semanal' ? 'bg-blue-100 text-blue-800' :
                      rota.tipo_rota === 'quinzenal' ? 'bg-purple-100 text-purple-800' :
                      rota.tipo_rota === 'mensal' ? 'bg-green-100 text-green-800' :
                      rota.tipo_rota === 'transferencia' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formatTipoRota(rota.tipo_rota)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Custo:</span>
                    <p className="font-medium">{formatCurrency(rota.custo_diario)}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    rota.status === 'ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rota.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Cadastro/Edição/Visualização */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={viewMode ? 'Visualizar Rota' : editingRota ? 'Editar Rota' : 'Adicionar Rota'}
          size="full"
        >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                             {/* Primeira linha - Informações básicas */}
                             <Input
                               label="Filial *"
                               type="select"
                               {...register('filial_id', { required: 'Filial é obrigatória' })}
                               error={errors.filial_id?.message}
                               disabled={viewMode || loadingFiliais}
                             >
                               <option value="">
                                 {loadingFiliais ? 'Carregando filiais...' : 'Selecione uma filial'}
                               </option>
                               {filiais.map(filial => (
                                 <option key={filial.id} value={filial.id}>
                                   {filial.filial}
                                 </option>
                               ))}
                             </Input>

                             <Input
                               label="Código *"
                               type="text"
                               placeholder="Código da rota"
                               {...register('codigo', { required: 'Código é obrigatório' })}
                               error={errors.codigo?.message}
                               disabled={viewMode}
                             />

                             <Input
                               label="Nome *"
                               type="text"
                               placeholder="Nome da rota"
                               {...register('nome', { required: 'Nome é obrigatório' })}
                               error={errors.nome?.message}
                               disabled={viewMode}
                             />

                             {/* Segunda linha - Configurações */}
                             <Input
                               label="Distância (km)"
                               type="number"
                               step="0.01"
                               placeholder="0.00"
                               {...register('distancia_km')}
                               disabled={viewMode}
                             />

                             <Input
                               label="Tipo de Rota"
                               type="select"
                               {...register('tipo_rota')}
                               disabled={viewMode}
                             >
                               <option value="semanal">Semanal</option>
                               <option value="quinzenal">Quinzenal</option>
                               <option value="mensal">Mensal</option>
                               <option value="transferencia">Transferência</option>
                             </Input>

                             <Input
                               label="Custo Diário"
                               type="number"
                               step="0.01"
                               placeholder="0.00"
                               {...register('custo_diario')}
                               disabled={viewMode}
                             />

                             {/* Terceira linha - Status e Observações */}
                             <Input
                               label="Status"
                               type="select"
                               {...register('status')}
                               disabled={viewMode}
                             >
                               <option value="ativo">Ativo</option>
                               <option value="inativo">Inativo</option>
                             </Input>

                             <Input
                               label="Observações"
                               type="textarea"
                               placeholder="Observações sobre a rota..."
                               {...register('observacoes')}
                               disabled={viewMode}
                               className="md:col-span-2 lg:col-span-2"
                               rows={3}
                             />
                           </div>
            
            {/* Seção de Unidades Escolares Vinculadas */}
            {viewMode && (
              <div className="border-t pt-3 sm:pt-4">
                <div 
                  className="flex justify-between items-center cursor-pointer p-2 sm:p-3 bg-gray-50 rounded-lg mb-2 sm:mb-3"
                  onClick={() => {
                    if (!showUnidades && unidadesEscolares.length === 0) {
                      loadUnidadesEscolares(editingRota.id);
                    }
                    setShowUnidades(!showUnidades);
                  }}
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                    Unidades Escolares Vinculadas
                    {totalUnidades > 0 && (
                      <span className="bg-green-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                        {totalUnidades}
                      </span>
                    )}
                  </h3>
                  {showUnidades ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                
                {showUnidades && (
                  <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                    {loadingUnidades ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Carregando unidades escolares...</p>
                      </div>
                    ) : unidadesEscolares.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500 italic text-sm">
                        Nenhuma unidade escolar vinculada a esta rota
                      </div>
                    ) : (
                      <>
                        {/* Versão Desktop - Tabela completa */}
                        <div className="hidden lg:block bg-white rounded-lg border overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Ordem</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Código</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Escola</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Cidade</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Estado</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Centro Distribuição</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Status</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {unidadesEscolares.map((unidade) => (
                                  <tr key={unidade.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.ordem_entrega || '-'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.codigo_teknisa}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.nome_escola}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.cidade}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.estado}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.centro_distribuicao || '-'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                        unidade.status === 'ativo' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Versão Mobile - Cards */}
                        <div className="lg:hidden space-y-2">
                          {unidadesEscolares.map((unidade) => (
                            <div key={unidade.id} className="bg-white rounded-lg border p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-sm">{unidade.nome_escola}</h4>
                                  <p className="text-gray-600 text-xs">Código: {unidade.codigo_teknisa}</p>
                                </div>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  unidade.status === 'ativo' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Ordem:</span>
                                  <p className="font-medium">{unidade.ordem_entrega || '-'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Cidade:</span>
                                  <p className="font-medium">{unidade.cidade}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Estado:</span>
                                  <p className="font-medium">{unidade.estado}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Centro:</span>
                                  <p className="font-medium">{unidade.centro_distribuicao || '-'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {unidadesEscolares.length > 0 && (
                      <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg text-center text-xs sm:text-sm text-gray-600">
                        Exibindo {unidadesEscolares.length} de {totalUnidades} unidades escolares
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!viewMode && (
              <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                <Button type="button" variant="secondary" size="sm" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  {editingRota ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal
          isOpen={showAuditModal}
          onClose={handleCloseAuditModal}
          title="Relatório de Auditoria - Rotas"
          size="full"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Filtros de Auditoria */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Filtros</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              <Button onClick={handleExportXLSX} variant="secondary" size="sm">
                <FaFileExcel className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
              <Button onClick={handleExportPDF} variant="secondary" size="sm">
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
                              <strong>Dados da Rota:</strong>
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
                              <strong>ID da Rota:</strong> 
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
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};

export default Rotas; 