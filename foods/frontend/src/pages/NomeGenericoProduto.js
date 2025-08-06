import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle, FaFileExcel, FaFilePdf, FaTag, FaCheckCircle, FaTimesCircle, FaBox } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import { Button, Input, Modal, Table, StatCard } from '../components/ui';
import NomeGenericoProdutoService from '../services/nomeGenericoProduto';
import GruposService from '../services/grupos';
import SubgruposService from '../services/subgrupos';
import ClassesService from '../services/classes';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const NomeGenericoProduto = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [nomesGenericos, setNomesGenericos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNomeGenerico, setEditingNomeGenerico] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [grupoFilter, setGrupoFilter] = useState('todos');
  const [subgrupoFilter, setSubgrupoFilter] = useState('todos');
  const [classeFilter, setClasseFilter] = useState('todos');
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
    total_nomes_genericos: 0,
    nomes_genericos_ativos: 0,
    nomes_genericos_inativos: 0
  });
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingSubgrupos, setLoadingSubgrupos] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  
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
    watch
  } = useForm();

  // Observar mudanças nos campos para carregar dados dependentes
  const selectedGrupo = watch('grupo_id');
  const selectedSubgrupo = watch('subgrupo_id');

  // Carregar nomes genéricos
  const loadNomesGenericos = async () => {
    try {
      setLoading(true);
      
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage
      };

      const result = await NomeGenericoProdutoService.listar(paginationParams);
      
      if (result.success) {
        // Garantir que data seja um array
        const data = Array.isArray(result.data) ? result.data : [];
        setNomesGenericos(data);
        
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
        toast.error(result.error || 'Erro ao carregar nomes genéricos');
        setNomesGenericos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar nomes genéricos:', error);
      toast.error('Erro ao carregar nomes genéricos');
      setNomesGenericos([]);
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

  // Carregar subgrupos
  const loadSubgrupos = async () => {
    try {
      setLoadingSubgrupos(true);
      const result = await SubgruposService.buscarAtivos();
      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        setSubgrupos(data);
      } else {
        console.error('Erro ao carregar subgrupos:', result.error);
        setSubgrupos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar subgrupos:', error);
      setSubgrupos([]);
    } finally {
      setLoadingSubgrupos(false);
    }
  };

  // Carregar classes
  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const result = await ClassesService.buscarAtivas();
      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        setClasses(data);
      } else {
        console.error('Erro ao carregar classes:', result.error);
        setClasses([]);
      }
    } catch (error) {
      console.error('Erro ao carregar classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Carregar estatísticas
  const loadEstatisticas = async () => {
    try {
      const result = await NomeGenericoProdutoService.listar({ limit: 1000 });
      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        const total = data.length;
        const ativos = data.filter(n => n.status === 1).length;
        const inativos = data.filter(n => n.status === 0).length;
        
        setEstatisticas({
          total_nomes_genericos: total,
          nomes_genericos_ativos: ativos,
          nomes_genericos_inativos: inativos
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
        entity: 'nome_generico_produto',
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
  const handleAddNomeGenerico = () => {
    setEditingNomeGenerico(null);
    setViewMode(false);
    reset();
    setShowModal(true);
  };

  const handleViewNomeGenerico = (nomeGenerico) => {
    setEditingNomeGenerico(nomeGenerico);
    setViewMode(true);
    setValue('nome', nomeGenerico.nome);
    setValue('grupo_id', nomeGenerico.grupo_id);
    setValue('subgrupo_id', nomeGenerico.subgrupo_id);
    setValue('classe_id', nomeGenerico.classe_id);
    setValue('status', nomeGenerico.status);
    setShowModal(true);
  };

  const handleEditNomeGenerico = (nomeGenerico) => {
    setEditingNomeGenerico(nomeGenerico);
    setViewMode(false);
    setValue('nome', nomeGenerico.nome);
    setValue('grupo_id', nomeGenerico.grupo_id);
    setValue('subgrupo_id', nomeGenerico.subgrupo_id);
    setValue('classe_id', nomeGenerico.classe_id);
    setValue('status', nomeGenerico.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNomeGenerico(null);
    setViewMode(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingNomeGenerico) {
        const result = await NomeGenericoProdutoService.atualizar(editingNomeGenerico.id, data);
        if (result.success) {
          toast.success('Nome genérico atualizado com sucesso!');
          handleCloseModal();
          loadNomesGenericos();
          loadEstatisticas();
        } else {
          toast.error(result.error || 'Erro ao atualizar nome genérico');
        }
      } else {
        const result = await NomeGenericoProdutoService.criar(data);
        if (result.success) {
          toast.success('Nome genérico criado com sucesso!');
          handleCloseModal();
          loadNomesGenericos();
          loadEstatisticas();
        } else {
          toast.error(result.error || 'Erro ao criar nome genérico');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar nome genérico:', error);
      toast.error('Erro ao salvar nome genérico');
    }
  };

  const handleDeleteNomeGenerico = async (nomeGenericoId) => {
    if (window.confirm('Tem certeza que deseja excluir este nome genérico?')) {
      try {
        const result = await NomeGenericoProdutoService.excluir(nomeGenericoId);
        if (result.success) {
          toast.success('Nome genérico excluído com sucesso!');
          loadNomesGenericos();
          loadEstatisticas();
        } else {
          toast.error(result.error || 'Erro ao excluir nome genérico');
        }
    } catch (error) {
        console.error('Erro ao excluir nome genérico:', error);
        toast.error('Erro ao excluir nome genérico');
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
      subgrupo_id: 'Subgrupo',
      classe_id: 'Classe',
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
    
    if (field === 'subgrupo_id') {
      const subgrupo = subgrupos.find(s => s.id === value);
      return subgrupo ? subgrupo.nome : value;
    }
    
    if (field === 'classe_id') {
      const classe = classes.find(c => c.id === value);
      return classe ? classe.nome : value;
    }
    
    return value.toString();
  };

  const handleExportXLSX = async () => {
    try {
      const params = {
        search: searchTerm,
        status: statusFilter !== 'todos' ? statusFilter : '',
        grupo_id: grupoFilter !== 'todos' ? grupoFilter : '',
        subgrupo_id: subgrupoFilter !== 'todos' ? subgrupoFilter : '',
        classe_id: classeFilter !== 'todos' ? classeFilter : ''
      };

      const result = await NomeGenericoProdutoService.exportarXLSX(params);
      if (result.success) {
        const blob = result.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nomes_genericos_${new Date().toISOString().split('T')[0]}.xlsx`;
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
        grupo_id: grupoFilter !== 'todos' ? grupoFilter : '',
        subgrupo_id: subgrupoFilter !== 'todos' ? subgrupoFilter : '',
        classe_id: classeFilter !== 'todos' ? classeFilter : ''
      };

      const result = await NomeGenericoProdutoService.exportarPDF(params);
      if (result.success) {
        const blob = result.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nomes_genericos_${new Date().toISOString().split('T')[0]}.pdf`;
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

  const getSubgrupoName = (subgrupoId) => {
    if (loadingSubgrupos) return 'Carregando...';
    const subgrupo = subgrupos.find(s => s.id === subgrupoId);
    return subgrupo ? subgrupo.nome : 'Subgrupo não encontrado';
  };

  const getClasseName = (classeId) => {
    if (loadingClasses) return 'Carregando...';
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nome : 'Classe não encontrada';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Filtros
  const filteredNomesGenericos = Array.isArray(nomesGenericos) ? nomesGenericos.filter(nomeGenerico => {
    const matchesSearch = !searchTerm || 
      nomeGenerico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGrupoName(nomeGenerico.grupo_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSubgrupoName(nomeGenerico.subgrupo_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClasseName(nomeGenerico.classe_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && nomeGenerico.status === 1) ||
      (statusFilter === 'inativo' && nomeGenerico.status === 0);
    
    const matchesGrupo = grupoFilter === 'todos' || 
      nomeGenerico.grupo_id.toString() === grupoFilter;
    
    const matchesSubgrupo = subgrupoFilter === 'todos' || 
      nomeGenerico.subgrupo_id.toString() === subgrupoFilter;
    
    const matchesClasse = classeFilter === 'todos' || 
      nomeGenerico.classe_id.toString() === classeFilter;
    
    return matchesSearch && matchesStatus && matchesGrupo && matchesSubgrupo && matchesClasse;
  }) : [];

  // Effects
  useEffect(() => {
      loadNomesGenericos();
    loadGrupos();
    loadSubgrupos();
    loadClasses();
    loadEstatisticas();
  }, [currentPage, itemsPerPage]);

  // Loading state
  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando nomes genéricos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Nomes Genéricos</h1>
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
          {canCreate('nome_generico_produto') && (
            <Button onClick={handleAddNomeGenerico} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Nome Genérico</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard
          title="Total de Nomes Genéricos"
          value={estatisticas.total_nomes_genericos}
          icon={FaTag}
          color="blue"
        />
        <StatCard
          title="Nomes Genéricos Ativos"
          value={estatisticas.nomes_genericos_ativos}
          icon={FaCheckCircle}
          color="green"
        />
        <StatCard
          title="Nomes Genéricos Inativos"
          value={estatisticas.nomes_genericos_inativos}
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
          },
          {
            label: 'Subgrupo',
            value: subgrupoFilter,
            onChange: setSubgrupoFilter,
            options: [
              { value: 'todos', label: loadingSubgrupos ? 'Carregando...' : 'Todos os subgrupos' },
              ...subgrupos.map(subgrupo => ({
                value: subgrupo.id.toString(),
                label: subgrupo.nome
              }))
            ]
          },
          {
            label: 'Classe',
            value: classeFilter,
            onChange: setClasseFilter,
            options: [
              { value: 'todos', label: loadingClasses ? 'Carregando...' : 'Todas as classes' },
              ...classes.map(classe => ({
                value: classe.id.toString(),
                label: classe.nome
              }))
            ]
          }
        ]}
      />

      {/* Tabela */}
            {filteredNomesGenericos.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm || statusFilter !== 'todos' || grupoFilter !== 'todos' || subgrupoFilter !== 'todos' || classeFilter !== 'todos'
                      ? 'Nenhum nome genérico encontrado com os filtros aplicados'
                      : 'Nenhum nome genérico cadastrado'
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subgrupo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNomesGenericos.map((nomeGenerico) => (
                  <tr key={nomeGenerico.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nomeGenerico.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nomeGenerico.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loadingGrupos ? (
                        <span className="text-gray-400">Carregando...</span>
                      ) : (
                        getGrupoName(nomeGenerico.grupo_id)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loadingSubgrupos ? (
                        <span className="text-gray-400">Carregando...</span>
                      ) : (
                        getSubgrupoName(nomeGenerico.subgrupo_id)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loadingClasses ? (
                        <span className="text-gray-400">Carregando...</span>
                      ) : (
                        getClasseName(nomeGenerico.classe_id)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        nomeGenerico.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {nomeGenerico.status === 1 ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                      onClick={() => handleViewNomeGenerico(nomeGenerico)}
                          title="Visualizar"
                    >
                          <FaEye className="text-green-600 text-sm" />
                        </Button>
                    {canEdit('nome_generico_produto') && (
                          <Button
                            variant="ghost"
                            size="xs"
                        onClick={() => handleEditNomeGenerico(nomeGenerico)}
                            title="Editar"
                      >
                            <FaEdit className="text-blue-600 text-sm" />
                          </Button>
                    )}
                    {canDelete('nome_generico_produto') && (
                          <Button
                            variant="ghost"
                            size="xs"
                        onClick={() => handleDeleteNomeGenerico(nomeGenerico.id)}
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
            {filteredNomesGenericos.map((nomeGenerico) => (
              <div key={nomeGenerico.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{nomeGenerico.nome}</h3>
                    <p className="text-gray-600 text-xs">ID: {nomeGenerico.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleViewNomeGenerico(nomeGenerico)}
                      title="Visualizar"
                      className="p-2"
                    >
                      <FaEye className="text-green-600 text-sm" />
                    </Button>
                    {canEdit('nome_generico_produto') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEditNomeGenerico(nomeGenerico)}
                        title="Editar"
                        className="p-2"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('nome_generico_produto') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteNomeGenerico(nomeGenerico.id)}
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
                      {loadingGrupos ? 'Carregando...' : getGrupoName(nomeGenerico.grupo_id)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Subgrupo:</span>
                    <p className="font-medium">
                      {loadingSubgrupos ? 'Carregando...' : getSubgrupoName(nomeGenerico.subgrupo_id)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Classe:</span>
                    <p className="font-medium">
                      {loadingClasses ? 'Carregando...' : getClasseName(nomeGenerico.classe_id)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      nomeGenerico.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {nomeGenerico.status === 1 ? 'Ativo' : 'Inativo'}
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
          title={viewMode ? 'Visualizar Nome Genérico' : editingNomeGenerico ? 'Editar Nome Genérico' : 'Adicionar Nome Genérico'}
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
              <Input
                label="Subgrupo *"
                type="select"
                {...register('subgrupo_id', { required: 'Subgrupo é obrigatório' })}
                error={errors.subgrupo_id?.message}
                disabled={viewMode || loadingSubgrupos}
              >
                <option value="">
                  {loadingSubgrupos ? 'Carregando subgrupos...' : 'Selecione um subgrupo'}
                </option>
                {subgrupos.map(subgrupo => (
                      <option key={subgrupo.id} value={subgrupo.id}>
                        {subgrupo.nome}
                      </option>
                    ))}
              </Input>
              <Input
                label="Classe *"
                type="select"
                {...register('classe_id', { required: 'Classe é obrigatória' })}
                error={errors.classe_id?.message}
                disabled={viewMode || loadingClasses}
              >
                <option value="">
                  {loadingClasses ? 'Carregando classes...' : 'Selecione uma classe'}
                </option>
                {classes.map(classe => (
                    <option key={classe.id} value={classe.id}>
                      {classe.nome}
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
                    {editingNomeGenerico ? 'Atualizar' : 'Cadastrar'}
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
          title="Relatório de Auditoria - Nomes Genéricos"
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
                              <strong>Dados do Nome Genérico:</strong>
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
                              <strong>ID do Nome Genérico:</strong> 
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

export default NomeGenericoProduto; 