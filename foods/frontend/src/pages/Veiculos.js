import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaHistory, FaQuestionCircle, FaFileExcel, FaFilePdf, FaTruck, FaCar, FaMotorcycle, FaTools } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import VeiculosService from '../services/veiculos';
import { Button, Input, Modal, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const Veiculos = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState(null);
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
    total_veiculos: 0,
    veiculos_ativos: 0,
    em_manutencao: 0,
    total_tipos: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadVeiculos();
  }, [currentPage, itemsPerPage]);

  const loadVeiculos = async (params = {}) => {
      setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await VeiculosService.listar(paginationParams);
      if (result.success) {
        setVeiculos(result.data);
        
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
        const ativos = result.data.filter(v => v.status === 'ativo').length;
        const manutencao = result.data.filter(v => v.status === 'manutencao').length;
        const tipos = new Set(result.data.map(v => v.tipo_veiculo)).size;
        
        setEstatisticas({
          total_veiculos: total,
          veiculos_ativos: ativos,
          em_manutencao: manutencao,
          total_tipos: tipos
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar veículos (client-side)
  const filteredVeiculos = veiculos.filter(veiculo => {
    const matchesSearch = !searchTerm || 
      (veiculo.placa && veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (veiculo.modelo && veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (veiculo.marca && veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (veiculo.tipo_veiculo && veiculo.tipo_veiculo.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
      params.append('recurso', 'veiculos');
      
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
      params.append('tabela', 'veiculos');

      const response = await fetch(`/api/auditoria/export/xlsx?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_veiculos_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      params.append('tabela', 'veiculos');

      const response = await fetch(`/api/auditoria/export/pdf?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_veiculos_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const result = await VeiculosService.exportarXLSX();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'veiculos.xlsx';
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
      const result = await VeiculosService.exportarPDF();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'veiculos.pdf';
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
      placa: 'Placa',
      modelo: 'Modelo',
      marca: 'Marca',
      ano_fabricacao: 'Ano',
      tipo_veiculo: 'Tipo de Veículo',
      categoria: 'Categoria',
      status: 'Status',
      motorista_id: 'Motorista',
      capacidade_carga: 'Capacidade',
      combustivel: 'Combustível',
      quilometragem_atual: 'KM Atual',
      data_ultima_revisao: 'Última Revisão',
      quilometragem_proxima_revisao: 'Próxima Revisão',
      observacoes: 'Observações'
    };
    return fields[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (field === 'status') {
      return getStatusLabel(value);
    }
    if (field === 'tipo_veiculo') {
      return getTipoVeiculoLabel(value);
    }
    if (field === 'categoria') {
      return getCategoriaLabel(value);
    }
    if (field === 'data_ultima_revisao') {
      return value ? formatDate(value) : 'N/A';
    }
    if (field === 'quilometragem_atual' || field === 'quilometragem_proxima_revisao') {
      return value ? `${value.toLocaleString()} km` : 'N/A';
    }
    return value;
  };

  const handleAddVeiculo = () => {
    setViewMode(false);
    setEditingVeiculo(null);
    reset();
    setShowModal(true);
  };

  const handleViewVeiculo = (veiculo) => {
    setViewMode(true);
    setEditingVeiculo(veiculo);
    reset(veiculo);
    setShowModal(true);
  };

  const handleEditVeiculo = (veiculo) => {
    setViewMode(false);
    setEditingVeiculo(veiculo);
    reset(veiculo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingVeiculo(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      let result;
      if (editingVeiculo) {
        result = await VeiculosService.atualizar(editingVeiculo.id, data);
      } else {
        result = await VeiculosService.criar(data);
      }
      
      if (result.success) {
        toast.success(editingVeiculo ? 'Veículo atualizado com sucesso!' : 'Veículo criado com sucesso!');
      handleCloseModal();
      loadVeiculos();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleDeleteVeiculo = async (veiculoId) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
    try {
        const result = await VeiculosService.excluir(veiculoId);
        if (result.success) {
      toast.success('Veículo excluído com sucesso!');
      loadVeiculos();
        } else {
          toast.error(result.error);
        }
    } catch (error) {
      toast.error('Erro ao excluir veículo');
      }
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      manutencao: 'Em Manutenção'
    };
    return statusMap[status] || status;
  };

  const getTipoVeiculoLabel = (tipo) => {
    const tiposMap = {
      caminhao: 'Caminhão',
      van: 'Van',
      carro: 'Carro',
      moto: 'Moto',
      onibus: 'Ônibus'
    };
    return tiposMap[tipo] || tipo;
  };

  const getCategoriaLabel = (categoria) => {
    const categoriasMap = {
      carga: 'Carga',
      passageiros: 'Passageiros',
      utilitario: 'Utilitário',
      especial: 'Especial'
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Veículos</h1>
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
          {canCreate('veiculos') && (
            <Button onClick={handleAddVeiculo} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard
          title="Total de Veículos"
          value={estatisticas.total_veiculos}
          icon={FaTruck}
          color="blue"
        />
        <StatCard
          title="Veículos Ativos"
          value={estatisticas.veiculos_ativos}
          icon={FaCar}
          color="green"
        />
        <StatCard
          title="Em Manutenção"
          value={estatisticas.em_manutencao}
          icon={FaTools}
          color="orange"
        />
        <StatCard
          title="Tipos de Veículos"
          value={estatisticas.total_tipos}
          icon={FaMotorcycle}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por placa, modelo, marca ou tipo..."
      />

      {/* Ações */}
      <div className="flex gap-2 sm:gap-3 mb-4">
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
      {filteredVeiculos.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm 
            ? 'Nenhum veículo encontrado com os filtros aplicados'
            : 'Nenhum veículo cadastrado'
          }
        </div>
      ) : (
        <>
          {/* Versão Desktop - Tabela completa */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modelo/Marca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo/Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KM Atual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVeiculos.map((veiculo) => (
                    <tr key={veiculo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {veiculo.placa}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{veiculo.modelo}</div>
                        <div className="text-sm text-gray-500">{veiculo.marca}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getTipoVeiculoLabel(veiculo.tipo_veiculo)}</div>
                        <div className="text-sm text-gray-500">{getCategoriaLabel(veiculo.categoria)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                          veiculo.status === 'ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : veiculo.status === 'manutencao'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getStatusLabel(veiculo.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {veiculo.quilometragem_atual ? `${veiculo.quilometragem_atual.toLocaleString()} km` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {canView('veiculos') && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleViewVeiculo(veiculo)}
                              title="Visualizar"
                            >
                              <FaEye className="text-green-600 text-sm" />
                            </Button>
                          )}
                          {canEdit('veiculos') && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleEditVeiculo(veiculo)}
                              title="Editar"
                            >
                              <FaEdit className="text-blue-600 text-sm" />
                            </Button>
                          )}
                          {canDelete('veiculos') && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleDeleteVeiculo(veiculo.id)}
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

          {/* Versão Mobile - Cards */}
          <div className="lg:hidden space-y-3">
            {filteredVeiculos.map((veiculo) => (
              <div key={veiculo.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{veiculo.placa}</h3>
                    <p className="text-gray-600 text-xs">ID: {veiculo.id}</p>
                  </div>
                  <div className="flex gap-2">
                    {canView('veiculos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleViewVeiculo(veiculo)}
                        title="Visualizar"
                        className="p-2"
                      >
                        <FaEye className="text-green-600 text-sm" />
                      </Button>
                    )}
                    {canEdit('veiculos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEditVeiculo(veiculo)}
                        title="Editar"
                        className="p-2"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('veiculos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteVeiculo(veiculo.id)}
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
                    <span className="text-gray-500">Modelo:</span>
                    <p className="font-medium">{veiculo.modelo}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Marca:</span>
                    <p className="font-medium">{veiculo.marca}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-medium">{getTipoVeiculoLabel(veiculo.tipo_veiculo)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Categoria:</span>
                    <p className="font-medium">{getCategoriaLabel(veiculo.categoria)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">KM Atual:</span>
                    <p className="font-medium">{veiculo.quilometragem_atual ? `${veiculo.quilometragem_atual.toLocaleString()} km` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                      veiculo.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : veiculo.status === 'manutencao'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(veiculo.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Veículo */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Veículo' : editingVeiculo ? 'Editar Veículo' : 'Adicionar Veículo'}
        size="full"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Primeira Linha - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Card 1: Informações Básicas */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Informações Básicas</h3>
              <div className="space-y-3">
                      <Input
                  label="Placa *"
                        {...register('placa', { required: 'Placa é obrigatória' })}
                  error={errors.placa?.message}
                  disabled={viewMode}
                />
                        <Input
                  label="Modelo *"
                  {...register('modelo', { required: 'Modelo é obrigatório' })}
                  error={errors.modelo?.message}
                  disabled={viewMode}
                />
                        <Input
                  label="Marca *"
                  {...register('marca', { required: 'Marca é obrigatória' })}
                  error={errors.marca?.message}
                  disabled={viewMode}
                />
                        <Input
                  label="Ano"
                          type="number"
                          {...register('ano_fabricacao')}
                  disabled={viewMode}
                />
              </div>
            </div>

            {/* Card 2: Classificação */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Classificação</h3>
              <div className="space-y-3">
                <Input
                  label="Tipo de Veículo *"
                  type="select"
                  {...register('tipo_veiculo', { required: 'Tipo de veículo é obrigatório' })}
                  error={errors.tipo_veiculo?.message}
                  disabled={viewMode}
                >
                  <option value="">Selecione o tipo</option>
                          <option value="caminhao">Caminhão</option>
                  <option value="van">Van</option>
                  <option value="carro">Carro</option>
                          <option value="moto">Moto</option>
                  <option value="onibus">Ônibus</option>
                </Input>
                <Input
                  label="Categoria *"
                  type="select"
                  {...register('categoria', { required: 'Categoria é obrigatória' })}
                  error={errors.categoria?.message}
                  disabled={viewMode}
                >
                  <option value="">Selecione a categoria</option>
                  <option value="carga">Carga</option>
                  <option value="passageiros">Passageiros</option>
                          <option value="utilitario">Utilitário</option>
                  <option value="especial">Especial</option>
                </Input>
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
                  <option value="manutencao">Em Manutenção</option>
                </Input>
              </div>
            </div>
          </div>

          {/* Segunda Linha - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 3: Especificações */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Especificações</h3>
              <div className="space-y-3">
                        <Input
                  label="Capacidade"
                          {...register('capacidade_carga')}
                  disabled={viewMode}
                        />
                        <Input
                  label="Combustível"
                  {...register('combustivel')}
                  disabled={viewMode}
                />
                        <Input
                  label="KM Atual"
                          type="number"
                          {...register('quilometragem_atual')}
                  disabled={viewMode}
                />
              </div>
            </div>

            {/* Card 4: Manutenção */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Manutenção</h3>
              <div className="space-y-3">
                      <Input
                  label="Última Revisão"
                          type="date"
                          {...register('data_ultima_revisao')}
                  disabled={viewMode}
                        />
                        <Input
                  label="Próxima Revisão"
                        type="number"
                  placeholder="KM para próxima revisão"
                        {...register('quilometragem_proxima_revisao')}
                  disabled={viewMode}
                />
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
                {editingVeiculo ? 'Atualizar' : 'Criar'}
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
          title="Relatório de Auditoria - Veículos"
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
                              <strong>Dados do Veículo:</strong>
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
                              <strong>ID do Veículo:</strong> 
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

export default Veiculos; 