import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle, FaFileExcel, FaFilePdf, FaTags, FaCheckCircle, FaTimesCircle, FaBox } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import { Button, Input, Modal, Table, StatCard } from '../components/ui';
import SubgruposService from '../services/subgrupos';
import GruposService from '../services/grupos';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const Subgrupos = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [subgrupos, setSubgrupos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubgrupo, setEditingSubgrupo] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [grupoFilter, setGrupoFilter] = useState('todos');
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
    total_subgrupos: 0,
    subgrupos_ativos: 0,
    subgrupos_inativos: 0
  });
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  
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

  // Carregar subgrupos
  const loadSubgrupos = async () => {
    try {
      setLoading(true);
      
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage
      };

      const result = await SubgruposService.listar(paginationParams);
      
      if (result.success) {
        // Garantir que data seja um array
        const data = Array.isArray(result.data) ? result.data : [];
        setSubgrupos(data);
        
        // Extrair informações de paginação
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          // Fallback se não houver paginação no backend
          setTotalItems(data.length);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        }
      } else {
        toast.error(result.error || 'Erro ao carregar subgrupos');
        setSubgrupos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar subgrupos:', error);
      toast.error('Erro ao carregar subgrupos');
      setSubgrupos([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar grupos
  const loadGrupos = async () => {
    try {
      setLoadingGrupos(true);
      const result = await GruposService.buscarAtivos();
      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        setGrupos(data);
      } else {
        console.error('Erro ao carregar grupos:', result.error);
        setGrupos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      setGrupos([]);
    } finally {
      setLoadingGrupos(false);
    }
  };

  // Carregar estatísticas
  const loadEstatisticas = async () => {
    try {
      const result = await SubgruposService.listar({ limit: 1000 });
      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        const total = data.length;
        const ativos = data.filter(s => s.status === 1).length;
        const inativos = data.filter(s => s.status === 0).length;
        
        setEstatisticas({
          total_subgrupos: total,
          subgrupos_ativos: ativos,
          subgrupos_inativos: inativos
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = {
        entity: 'subgrupos',
        ...auditFilters
      };

      const response = await fetch('/api/audit?' + new URLSearchParams(params));
      const data = await response.json();

      if (data.success) {
        setAuditLogs(data.data || []);
      } else {
        toast.error('Erro ao carregar logs de auditoria');
      }
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  // Handlers
  const handleAddSubgrupo = () => {
    setEditingSubgrupo(null);
    setViewMode(false);
    reset();
    setShowModal(true);
  };

  const handleViewSubgrupo = (subgrupo) => {
    setEditingSubgrupo(subgrupo);
    setViewMode(true);
    setValue('nome', subgrupo.nome);
    setValue('grupo_id', subgrupo.grupo_id);
    setValue('status', subgrupo.status);
    setShowModal(true);
  };

  const handleEditSubgrupo = (subgrupo) => {
    setEditingSubgrupo(subgrupo);
    setViewMode(false);
    setValue('nome', subgrupo.nome);
    setValue('grupo_id', subgrupo.grupo_id);
    setValue('status', subgrupo.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubgrupo(null);
    setViewMode(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingSubgrupo) {
        const result = await SubgruposService.atualizar(editingSubgrupo.id, data);
        if (result.success) {
          toast.success('Subgrupo atualizado com sucesso!');
          handleCloseModal();
          loadSubgrupos();
          loadEstatisticas();
        } else {
          toast.error(result.error || 'Erro ao atualizar subgrupo');
        }
      } else {
        const result = await SubgruposService.criar(data);
        if (result.success) {
          toast.success('Subgrupo criado com sucesso!');
          handleCloseModal();
          loadSubgrupos();
          loadEstatisticas();
        } else {
          toast.error(result.error || 'Erro ao criar subgrupo');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar subgrupo:', error);
      toast.error('Erro ao salvar subgrupo');
    }
  };

  const handleDeleteSubgrupo = async (subgrupoId) => {
    if (window.confirm('Tem certeza que deseja excluir este subgrupo?')) {
      try {
        const result = await SubgruposService.excluir(subgrupoId);
        if (result.success) {
          toast.success('Subgrupo excluído com sucesso!');
          loadSubgrupos();
          loadEstatisticas();
      } else {
          toast.error(result.error || 'Erro ao excluir subgrupo');
        }
      } catch (error) {
        console.error('Erro ao excluir subgrupo:', error);
        toast.error('Erro ao excluir subgrupo');
      }
    }
  };

  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    loadAuditLogs();
  };

  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
    setAuditLogs([]);
    setAuditFilters({
      dataInicio: '',
      dataFim: '',
      acao: '',
      usuario_id: '',
      periodo: ''
    });
  };

  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action) => {
    const labels = {
      create: 'Criar',
      update: 'Editar',
      delete: 'Excluir'
    };
    return labels[action] || action;
  };

  const getFieldLabel = (field) => {
    const labels = {
      nome: 'Nome',
      grupo_id: 'Grupo',
      status: 'Status'
    };
    return labels[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined) return '-';

    if (field === 'status') {
        return value === 1 ? 'Ativo' : 'Inativo';
    }
    
    if (field === 'grupo_id') {
      const grupo = grupos.find(g => g.id === value);
      return grupo ? grupo.nome : value;
    }
    
    return value.toString();
  };

  const handleExportXLSX = async () => {
    try {
      const params = {
        search: searchTerm,
        status: statusFilter !== 'todos' ? statusFilter : '',
        grupo_id: grupoFilter !== 'todos' ? grupoFilter : ''
      };

      const result = await SubgruposService.exportarXLSX(params);
      if (result.success) {
        const blob = result.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subgrupos_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar relatório');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = {
        search: searchTerm,
        status: statusFilter !== 'todos' ? statusFilter : '',
        grupo_id: grupoFilter !== 'todos' ? grupoFilter : ''
      };

      const result = await SubgruposService.exportarPDF(params);
      if (result.success) {
        const blob = result.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subgrupos_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar relatório');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const getGrupoName = (grupoId) => {
    if (loadingGrupos) return 'Carregando...';
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : 'Grupo não encontrado';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Filtros
  const filteredSubgrupos = Array.isArray(subgrupos) ? subgrupos.filter(subgrupo => {
    const matchesSearch = !searchTerm || 
      subgrupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGrupoName(subgrupo.grupo_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && subgrupo.status === 1) ||
      (statusFilter === 'inativo' && subgrupo.status === 0);
    
    const matchesGrupo = grupoFilter === 'todos' || 
      subgrupo.grupo_id.toString() === grupoFilter;
    
    return matchesSearch && matchesStatus && matchesGrupo;
  }) : [];

  // Effects
  useEffect(() => {
    loadSubgrupos();
    loadGrupos();
    loadEstatisticas();
  }, [currentPage, itemsPerPage]);

  // Loading state
  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando subgrupos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Subgrupos</h1>
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
          {canCreate('subgrupos') && (
            <Button onClick={handleAddSubgrupo} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Subgrupo</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard
          title="Total de Subgrupos"
          value={estatisticas.total_subgrupos}
          icon={FaTags}
          color="blue"
        />
        <StatCard
          title="Subgrupos Ativos"
          value={estatisticas.subgrupos_ativos}
          icon={FaCheckCircle}
          color="green"
        />
        <StatCard
          title="Subgrupos Inativos"
          value={estatisticas.subgrupos_inativos}
          icon={FaTimesCircle}
          color="red"
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
            label: 'Grupo',
            value: grupoFilter,
            onChange: setGrupoFilter,
            options: [
              { value: 'todos', label: loadingGrupos ? 'Carregando...' : 'Todos os grupos' },
              ...grupos.map(grupo => ({
                value: grupo.id.toString(),
                label: grupo.nome
              }))
            ]
          }
        ]}
      />

      {/* Tabela */}
      {filteredSubgrupos.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm || statusFilter !== 'todos' || grupoFilter !== 'todos' 
            ? 'Nenhum subgrupo encontrado com os filtros aplicados'
            : 'Nenhum subgrupo cadastrado'
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubgrupos.map((subgrupo) => (
                  <tr key={subgrupo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subgrupo.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subgrupo.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loadingGrupos ? (
                        <span className="text-gray-400">Carregando...</span>
                      ) : (
                        getGrupoName(subgrupo.grupo_id)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        subgrupo.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {subgrupo.status === 1 ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleViewSubgrupo(subgrupo)}
                      title="Visualizar"
                    >
                          <FaEye className="text-green-600 text-sm" />
                        </Button>
                    {canEdit('subgrupos') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEditSubgrupo(subgrupo)}
                        title="Editar"
                      >
                            <FaEdit className="text-blue-600 text-sm" />
                          </Button>
                    )}
                    {canDelete('subgrupos') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteSubgrupo(subgrupo.id)}
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
            {filteredSubgrupos.map((subgrupo) => (
              <div key={subgrupo.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{subgrupo.nome}</h3>
                    <p className="text-gray-600 text-xs">ID: {subgrupo.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleViewSubgrupo(subgrupo)}
                      title="Visualizar"
                      className="p-2"
                    >
                      <FaEye className="text-green-600 text-sm" />
                    </Button>
                    {canEdit('subgrupos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEditSubgrupo(subgrupo)}
                        title="Editar"
                        className="p-2"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('subgrupos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteSubgrupo(subgrupo.id)}
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
                    <span className="text-gray-500">Grupo:</span>
                    <p className="font-medium">
                      {loadingGrupos ? 'Carregando...' : getGrupoName(subgrupo.grupo_id)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      subgrupo.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subgrupo.status === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
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
          title={viewMode ? 'Visualizar Subgrupo' : editingSubgrupo ? 'Editar Subgrupo' : 'Adicionar Subgrupo'}
          size="full"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <Input
                label="Nome *"
                  type="text"
                {...register('nome', { required: 'Nome é obrigatório' })}
                error={errors.nome?.message}
                  disabled={viewMode}
              />
              <Input
                label="Grupo *"
                type="select"
                {...register('grupo_id', { required: 'Grupo é obrigatório' })}
                error={errors.grupo_id?.message}
                disabled={viewMode || loadingGrupos}
              >
                <option value="">
                  {loadingGrupos ? 'Carregando grupos...' : 'Selecione um grupo'}
                </option>
                  {grupos.map(grupo => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nome}
                    </option>
                  ))}
              </Input>
              {!viewMode && (
                <Input
                  label="Status"
                  type="select"
                  {...register('status')}
                  error={errors.status?.message}
                >
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </Input>
              )}
            </div>

                {!viewMode && (
              <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                <Button type="button" variant="secondary" size="sm" onClick={handleCloseModal}>
                  Cancelar
                  </Button>
                <Button type="submit" size="sm">
                  {editingSubgrupo ? 'Atualizar' : 'Cadastrar'}
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
          title="Relatório de Auditoria - Subgrupos"
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
            <div className="flex gap-2 sm:gap-3">
              <Button onClick={handleExportXLSX} variant="outline" size="sm">
                <FaFileExcel className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <FaFilePdf className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>

            {/* Resultados da Auditoria */}
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
                              <strong>Dados do Subgrupo:</strong>
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
                              <strong>ID do Subgrupo:</strong> 
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

export default Subgrupos; 