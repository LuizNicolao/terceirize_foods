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
  const [loadingAudit, setLoadingAudit] = useState(false);
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
      veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.tipo_veiculo.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Função para mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const response = await fetch('/api/auditoria?entidade=veiculos&limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.data || []);
      } else {
        toast.error('Erro ao carregar logs de auditoria');
      }
    } catch (error) {
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoadingAudit(false);
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
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action) => {
    const actions = {
      CREATE: 'Criar',
      UPDATE: 'Atualizar',
      DELETE: 'Excluir'
    };
    return actions[action] || action;
  };

  const getFieldLabel = (field) => {
    const fields = {
      placa: 'Placa',
      modelo: 'Modelo',
      marca: 'Marca',
      ano: 'Ano',
      tipo_veiculo: 'Tipo de Veículo',
      categoria: 'Categoria',
      status: 'Status',
      motorista_id: 'Motorista',
      capacidade: 'Capacidade',
      combustivel: 'Combustível',
      km_atual: 'KM Atual',
      ultima_manutencao: 'Última Manutenção',
      proxima_manutencao: 'Próxima Manutenção',
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
    if (field === 'ultima_manutencao' || field === 'proxima_manutencao') {
      return value ? formatDate(value) : 'N/A';
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
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
      {filteredVeiculos.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm 
            ? 'Nenhum veículo encontrado com os filtros aplicados'
            : 'Nenhum veículo cadastrado'
          }
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Placa
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo/Marca
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo/Categoria
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KM Atual
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVeiculos.map((veiculo) => (
                  <tr key={veiculo.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {veiculo.placa}
                      </div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{veiculo.modelo}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{veiculo.marca}</div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{getTipoVeiculoLabel(veiculo.tipo_veiculo)}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{getCategoriaLabel(veiculo.categoria)}</div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
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
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {veiculo.km_atual ? `${veiculo.km_atual.toLocaleString()} km` : 'N/A'}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex gap-1 sm:gap-2">
                        {canView('veiculos') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleViewVeiculo(veiculo)}
                            title="Visualizar"
                          >
                            <FaEye className="text-green-600 text-xs sm:text-sm" />
                          </Button>
                        )}
                        {canEdit('veiculos') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEditVeiculo(veiculo)}
                            title="Editar"
                          >
                            <FaEdit className="text-blue-600 text-xs sm:text-sm" />
                          </Button>
                        )}
                        {canDelete('veiculos') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteVeiculo(veiculo.id)}
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

      {/* Modal de Veículo */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Veículo' : editingVeiculo ? 'Editar Veículo' : 'Adicionar Veículo'}
        size="xl"
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
                  {...register('ano')}
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
                  {...register('capacidade')}
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
                  {...register('km_atual')}
                  disabled={viewMode}
                />
              </div>
            </div>

            {/* Card 4: Manutenção */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Manutenção</h3>
              <div className="space-y-3">
                <Input
                  label="Última Manutenção"
                  type="date"
                  {...register('ultima_manutencao')}
                  disabled={viewMode}
                />
                <Input
                  label="Próxima Manutenção"
                  type="date"
                  {...register('proxima_manutencao')}
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
      <Modal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Logs de Auditoria - Veículos"
        size="xl"
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Histórico de Alterações
            </h3>
            <Button onClick={handleApplyAuditFilters} variant="outline" size="sm">
              <span className="hidden sm:inline">Atualizar</span>
              <span className="sm:hidden">Atualizar</span>
            </Button>
          </div>

          {loadingAudit ? (
            <div className="flex justify-center items-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="max-h-64 sm:max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Campo</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Anterior</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Novo Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {log.usuario_nome || 'Sistema'}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {getActionLabel(log.action)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {getFieldLabel(log.field_name)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-500">
                        {formatFieldValue(log.field_name, log.old_value)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-500">
                        {formatFieldValue(log.field_name, log.new_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

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