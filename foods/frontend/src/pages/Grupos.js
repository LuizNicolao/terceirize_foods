import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaQuestionCircle,
  FaFileExcel,
  FaFilePdf,
  FaLayerGroup,
  FaCheckCircle,
  FaTimesCircle,
  FaTags,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import GruposService from '../services/grupos';
import { Button, Input, Modal, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const Grupos = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
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
    total_grupos: 0,
    grupos_ativos: 0,
    grupos_inativos: 0,
    subgrupos_total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  const loadData = async () => {
      setLoading(true);
    try {
      // Resetar página se os filtros mudaram
      if (searchTerm !== '' || statusFilter !== 'todos') {
        setCurrentPage(1);
      }
      
      // Carregar grupos com paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined
      };

      const gruposRes = await GruposService.listar(paginationParams);

      if (gruposRes.success) {
        setGrupos(gruposRes.data);
        
        // Extrair informações de paginação
        if (gruposRes.pagination) {
          setTotalPages(gruposRes.pagination.totalPages || 1);
          setTotalItems(gruposRes.pagination.totalItems || gruposRes.data.length);
          setCurrentPage(gruposRes.pagination.currentPage || 1);
        } else {
          setTotalItems(gruposRes.data.length);
          setTotalPages(Math.ceil(gruposRes.data.length / itemsPerPage));
        }
        
        // Calcular estatísticas
        const total = gruposRes.pagination?.totalItems || gruposRes.data.length;
        const ativos = gruposRes.data.filter(g => g.status === 1).length;
        const inativos = gruposRes.data.filter(g => g.status === 0).length;
        const subgrupos = gruposRes.data.reduce((acc, grupo) => acc + (grupo.subgrupos_count || 0), 0);
        
        setEstatisticas({
          total_grupos: total,
          grupos_ativos: ativos,
          grupos_inativos: inativos,
          subgrupos_total: subgrupos
        });
      } else {
        toast.error(gruposRes.error);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = {
        entity: 'grupos',
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

  const handleExportAuditXLSX = async () => {
    try {
      const params = {
        entity: 'grupos',
        format: 'xlsx',
        ...auditFilters
      };

      const response = await fetch('/api/audit/export?' + new URLSearchParams(params));
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria_grupos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Relatório de auditoria exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar auditoria:', error);
      toast.error('Erro ao exportar relatório de auditoria');
    }
  };

  const handleExportAuditPDF = async () => {
    try {
      const params = {
        entity: 'grupos',
        format: 'pdf',
        ...auditFilters
      };

      const response = await fetch('/api/audit/export?' + new URLSearchParams(params));
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria_grupos_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Relatório de auditoria exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar auditoria:', error);
      toast.error('Erro ao exportar relatório de auditoria');
    }
  };

  const handleExportXLSX = async () => {
    try {
      const result = await GruposService.exportarXLSX();
      if (result.success) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grupos_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Grupos exportados com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar grupos');
    }
  };

  const handleExportPDF = async () => {
    try {
      const result = await GruposService.exportarPDF();
      if (result.success) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grupos_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Grupos exportados com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar grupos');
    }
  };

  const handleAddGrupo = () => {
    setEditingGrupo(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewGrupo = (grupo) => {
    setEditingGrupo(grupo);
    setViewMode(true);
    setShowModal(true);
  };

  const handleEditGrupo = (grupo) => {
    setEditingGrupo(grupo);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGrupo(null);
    setViewMode(false);
  };

  const onSubmit = async (data) => {
    try {
      let result;
      
      if (editingGrupo) {
        result = await GruposService.atualizar(editingGrupo.id, data);
      } else {
        result = await GruposService.criar(data);
      }

      if (result.success) {
        toast.success(result.message);
      handleCloseModal();
        loadData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      toast.error('Erro ao salvar grupo');
    }
  };

  const handleDeleteGrupo = async (grupoId) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      try {
        const result = await GruposService.excluir(grupoId);
        if (result.success) {
          toast.success(result.message);
          loadData();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir grupo:', error);
        toast.error('Erro ao excluir grupo');
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filtros aplicados
  const filteredGrupos = useMemo(() => {
    let filtered = grupos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(grupo => 
        grupo.nome?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'todos') {
      const status = statusFilter === 'ativo' ? 1 : 0;
      filtered = filtered.filter(grupo => grupo.status === status);
    }

    return filtered;
  }, [grupos, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando grupos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Grupos</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={handleOpenAuditModal} variant="ghost" size="sm">
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Auditoria</span>
          </Button>
          
          {canCreate('grupos') && (
            <Button onClick={handleAddGrupo} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Grupo</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total de Grupos"
          value={estatisticas.total_grupos}
          icon={FaLayerGroup}
          color="blue"
        />
        <StatCard
          title="Grupos Ativos"
          value={estatisticas.grupos_ativos}
          icon={FaCheckCircle}
          color="green"
        />
        <StatCard
          title="Grupos Inativos"
          value={estatisticas.grupos_inativos}
          icon={FaTimesCircle}
          color="red"
        />
        <StatCard
          title="Total de Subgrupos"
          value={estatisticas.subgrupos_total}
          icon={FaTags}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
                 placeholder="Buscar por nome..."
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
      {filteredGrupos.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm || statusFilter !== 'todos' ? 
            'Nenhum grupo encontrado com os filtros aplicados' : 
            'Nenhum grupo cadastrado'
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
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subgrupos
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
                  {filteredGrupos.map((grupo) => (
                    <tr key={grupo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grupo.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grupo.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grupo.subgrupos_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                          grupo.status === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {grupo.status === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {canView('grupos') && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleViewGrupo(grupo)}
                              title="Visualizar"
                            >
                              <FaEye className="text-green-600 text-sm" />
                            </Button>
                          )}
                          {canEdit('grupos') && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleEditGrupo(grupo)}
                              title="Editar"
                            >
                              <FaEdit className="text-blue-600 text-sm" />
                            </Button>
                          )}
                          {canDelete('grupos') && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleDeleteGrupo(grupo.id)}
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
          <div className="lg:hidden grid grid-cols-1 gap-3">
            {filteredGrupos.map((grupo) => (
              <div key={grupo.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{grupo.nome}</h3>
                    <p className="text-gray-600 text-xs">ID: {grupo.id}</p>
                  </div>
                  <div className="flex gap-2">
                    {canView('grupos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleViewGrupo(grupo)}
                        title="Visualizar"
                        className="p-2"
                      >
                        <FaEye className="text-green-600 text-sm" />
                      </Button>
                    )}
                    {canEdit('grupos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEditGrupo(grupo)}
                        title="Editar"
                        className="p-2"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('grupos') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteGrupo(grupo.id)}
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
                    <span className="text-gray-500">Subgrupos:</span>
                    <p className="font-medium">{grupo.subgrupos_count || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                      grupo.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {grupo.status === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Paginação */}
      {totalItems > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Modal de Grupo */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Grupo' : editingGrupo ? 'Editar Grupo' : 'Adicionar Grupo'}
        size="full"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = {
            nome: formData.get('nome'),
            status: formData.get('status')
          };
          onSubmit(data);
        }} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
              label="Nome do Grupo *"
              name="nome"
              defaultValue={editingGrupo?.nome}
                  disabled={viewMode}
              required
            />
            <Input
              label="Status"
              name="status"
              type="select"
              defaultValue={editingGrupo?.status || '1'}
              disabled={viewMode}
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </Input>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                {!viewMode && (
              <Button type="submit" variant="primary" size="lg">
                {editingGrupo ? 'Atualizar Grupo' : 'Cadastrar Grupo'}
                  </Button>
                )}
            <Button type="button" variant="outline" size="lg" onClick={handleCloseModal}>
              {viewMode ? 'Fechar' : 'Cancelar'}
            </Button>
          </div>
        </form>
        </Modal>

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal isOpen={showAuditModal} onClose={handleCloseAuditModal} size="full">
          <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Relatório de Auditoria - Grupos
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAuditXLSX}
                  className="flex items-center gap-2"
                >
                  <FaFileExcel className="w-4 h-4" />
                  Exportar XLSX
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAuditPDF}
                  className="flex items-center gap-2"
                >
                  <FaFilePdf className="w-4 h-4" />
                  Exportar PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseAuditModal}
                >
                  <FaTimes className="w-4 h-4" />
                </Button>
              </div>
              </div>

            {/* Filtros */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                <Input
                  type="date"
                  value={auditFilters.dataInicio}
                    onChange={(e) => setAuditFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                <Input
                  type="date"
                  value={auditFilters.dataFim}
                    onChange={(e) => setAuditFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ação
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={auditFilters.acao}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, acao: e.target.value }))}
                >
                  <option value="">Todas</option>
                  <option value="create">Criar</option>
                  <option value="update">Editar</option>
                  <option value="delete">Excluir</option>
                    <option value="view">Visualizar</option>
                  </select>
              </div>
                <div className="flex items-end">
                <Button 
                    variant="primary"
                    size="sm"
                  onClick={handleApplyAuditFilters}
                    className="w-full"
                >
                  Aplicar Filtros
                </Button>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {auditLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando logs de auditoria...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum log de auditoria encontrado
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data/Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Anterior
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Novo Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.usuario_nome || 'Sistema'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              log.action === 'create' ? 'bg-green-100 text-green-800' :
                              log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                              log.action === 'delete' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.action === 'create' ? 'Criar' :
                               log.action === 'update' ? 'Editar' :
                               log.action === 'delete' ? 'Excluir' :
                               log.action === 'view' ? 'Visualizar' : log.action}
                          </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.field_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.old_value || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.new_value || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                            </div>
                          )}
                                    </div>
                                    </div>
        </Modal>
      )}
    </div>
  );
};

export default Grupos; 