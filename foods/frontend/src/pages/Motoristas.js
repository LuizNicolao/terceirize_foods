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
  const [loadingAudit, setLoadingAudit] = useState(false);
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
      motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.cnh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.telefone.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Função para mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const response = await fetch('/api/auditoria?entidade=motoristas&limit=100', {
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
        size="xl"
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
      <Modal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Logs de Auditoria - Motoristas"
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

export default Motoristas; 