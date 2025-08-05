import React, { useState, useEffect } from 'react';
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
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total_fornecedores: 0,
    fornecedores_ativos: 0,
    com_email: 0,
    com_telefone: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadFornecedores();
  }, [currentPage, itemsPerPage]);

  const loadFornecedores = async (params = {}) => {
      setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
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
    }
  };

  // Filtrar fornecedores (client-side)
  const filteredFornecedores = (Array.isArray(fornecedores) ? fornecedores : []).filter(fornecedor => {
    const matchesSearch = !searchTerm || 
      (fornecedor.razao_social && fornecedor.razao_social.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fornecedor.nome_fantasia && fornecedor.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fornecedor.cnpj && fornecedor.cnpj.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fornecedor.municipio && fornecedor.municipio.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Função para mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const response = await fetch('/api/auditoria?entidade=fornecedores&limit=100', {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 px-1">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
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
        placeholder="Buscar por razão social, nome fantasia, CNPJ ou município..."
      />

      {/* Ações */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Button onClick={handleExportXLSX} variant="outline" size="sm" className="text-xs sm:text-sm">
          <FaFileExcel className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Exportar XLSX</span>
          <span className="sm:hidden">XLSX</span>
        </Button>
        <Button onClick={handleExportPDF} variant="outline" size="sm" className="text-xs sm:text-sm">
          <FaFilePdf className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>

      {/* Tabela */}
      {filteredFornecedores.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base px-4">
          {searchTerm 
            ? 'Nenhum fornecedor encontrado com os filtros aplicados'
            : 'Nenhum fornecedor cadastrado'
          }
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razão Social
                  </th>
                  <th className="hidden md:table-cell px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome Fantasia
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
                  <th className="hidden lg:table-cell px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {fornecedor.cnpj}
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {fornecedor.razao_social}
                    </td>
                    <td className="hidden md:table-cell px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {fornecedor.nome_fantasia || '-'}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {fornecedor.municipio && fornecedor.uf ? `${fornecedor.municipio}/${fornecedor.uf}` : '-'}
                    </td>
                    <td className="hidden lg:table-cell px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <div>
                        {fornecedor.email && <div>{fornecedor.email}</div>}
                        {fornecedor.telefone && <div>{fornecedor.telefone}</div>}
                        {!fornecedor.email && !fornecedor.telefone && '-'}
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        fornecedor.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getStatusLabel(fornecedor.status)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {fornecedor.criado_em ? formatDate(fornecedor.criado_em) : 'N/A'}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex gap-1 sm:gap-2 justify-center sm:justify-start">
                        {canView('fornecedores') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleViewFornecedor(fornecedor)}
                            title="Visualizar"
                          >
                            <FaEye className="text-green-600 text-xs sm:text-sm" />
                          </Button>
                        )}
                        {canEdit('fornecedores') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEditFornecedor(fornecedor)}
                            title="Editar"
                          >
                            <FaEdit className="text-blue-600 text-xs sm:text-sm" />
                          </Button>
                        )}
                        {canDelete('fornecedores') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteFornecedor(fornecedor.id)}
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

      {/* Modal de Fornecedor */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Fornecedor' : editingFornecedor ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 max-h-[75vh] overflow-y-auto">
                      {/* Primeira Linha - 2 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Card 1: Informações Principais */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Informações Principais</h3>
              <div className="space-y-3 sm:space-y-4">
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
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Contato</h3>
              <div className="space-y-3 sm:space-y-4">
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
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Endereço</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
            <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
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
      <Modal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Logs de Auditoria - Fornecedores"
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

export default Fornecedores; 