import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle, FaFileExcel, FaFilePdf, FaBuilding, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Button, Table, Modal, StatCard, Input } from '../components/ui';
import LoadingSpinner from '../components/LoadingSpinner';
import CadastroFilterBar from '../components/CadastroFilterBar';
import FilialForm from '../components/FilialForm';
import AlmoxarifadoModal from '../components/AlmoxarifadoModal';
import filiaisService from '../services/filiais';
import { usePermissions } from '../contexts/PermissionsContext';
import toast from 'react-hot-toast';

const Filiais = () => {
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFilial, setEditingFilial] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
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
  const [showAlmoxarifadoModal, setShowAlmoxarifadoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dados');
  const [estatisticas, setEstatisticas] = useState({
    total_filiais: 0,
    filiais_ativas: 0,
    filiais_inativas: 0,
    com_cnpj: 0
  });

  const { canCreate, canEdit, canDelete } = usePermissions();

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      setLoading(true);
      const response = await filiaisService.listar();
      if (response.success) {
        const data = response.data || [];
        setFiliais(data);
        
        // Calcular estatísticas
        setEstatisticas({
          total_filiais: data.length,
          filiais_ativas: data.filter(f => f.status === 1).length,
          filiais_inativas: data.filter(f => f.status === 0).length,
          com_cnpj: data.filter(f => f.cnpj && f.cnpj.trim() !== '').length
        });
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoading(false);
    }
  };

  // Consultar CNPJ
  const handleConsultarCNPJ = async (cnpj) => {
    if (!cnpj) {
      toast.error('Digite um CNPJ para consultar');
      return;
    }

    try {
      const response = await filiaisService.consultarCNPJ(cnpj);
      if (response.success) {
        const dados = response.data;
        // Retornar os dados para o formulário preencher
        return {
          razao_social: dados.razao_social || '',
          filial: dados.nome_fantasia || dados.razao_social || '',
          logradouro: dados.logradouro || '',
          numero: dados.numero || '',
          bairro: dados.bairro || '',
          cidade: dados.municipio || '',
          estado: dados.uf || '',
          cep: dados.cep || ''
        };
      } else {
        toast.error(response.error);
        return null;
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      toast.error('Erro ao consultar CNPJ');
      return null;
    }
  };

  // Salvar filial
  const handleSaveFilial = async (data) => {
    try {
      if (editingFilial) {
        const response = await filiaisService.atualizar(editingFilial.id, data);
        if (response.success) {
        toast.success('Filial atualizada com sucesso!');
      } else {
          toast.error(response.error);
          return false;
        }
      } else {
        const response = await filiaisService.criar(data);
        if (response.success) {
        toast.success('Filial criada com sucesso!');
        } else {
          toast.error(response.error);
          return false;
        }
      }
      handleCloseModal();
      loadFiliais();
      return true;
    } catch (error) {
      console.error('Erro ao salvar filial:', error);
      toast.error('Erro ao salvar filial');
      return false;
    }
  };

  // Excluir filial
  const handleDeleteFilial = async (filialId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta filial?')) return;

      try {
      const response = await filiaisService.excluir(filialId);
      if (response.success) {
        toast.success('Filial excluída com sucesso!');
        loadFiliais();
      } else {
        toast.error(response.error);
      }
      } catch (error) {
        console.error('Erro ao excluir filial:', error);
      toast.error('Erro ao excluir filial');
    }
  };

  // Exportar para XLSX
  const handleExportXLSX = async () => {
    try {
      const response = await filiaisService.exportarXLSX();
      if (response.success) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `filiais_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Exportar para PDF
  const handleExportPDF = async () => {
    try {
      const response = await filiaisService.exportarPDF();
      if (response.success) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `filiais_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

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
      params.append('recurso', 'filiais');
      
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

  // Exportar auditoria para XLSX
  const handleExportAuditXLSX = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.dataInicio) params.append('dataInicio', auditFilters.dataInicio);
      if (auditFilters.dataFim) params.append('dataFim', auditFilters.dataFim);
      if (auditFilters.acao) params.append('acao', auditFilters.acao);
      if (auditFilters.usuario_id) params.append('usuario_id', auditFilters.usuario_id);
      if (auditFilters.periodo) params.append('periodo', auditFilters.periodo);
      params.append('tabela', 'filiais');

      const response = await fetch(`/api/auditoria/export/xlsx?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_filiais_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      params.append('tabela', 'filiais');

      const response = await fetch(`/api/auditoria/export/pdf?${params.toString()}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_filiais_${new Date().toISOString().split('T')[0]}.pdf`);
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

  // Modal handlers
  const handleAddFilial = () => {
    setEditingFilial(null);
    setViewMode(false);
    setActiveTab('dados');
    setShowModal(true);
  };

  const handleEditFilial = (filial) => {
    setEditingFilial(filial);
    setViewMode(false);
    setActiveTab('dados');
    setShowModal(true);
  };

  const handleViewFilial = (filial) => {
    setEditingFilial(filial);
    setViewMode(true);
    setActiveTab('dados');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFilial(null);
    setViewMode(false);
    setActiveTab('dados');
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
      'codigo_filial': 'Código da Filial',
      'cnpj': 'CNPJ',
      'filial': 'Filial',
      'razao_social': 'Razão Social',
      'logradouro': 'Logradouro',
      'numero': 'Número',
      'bairro': 'Bairro',
      'cidade': 'Cidade',
      'estado': 'Estado',
      'cep': 'CEP',
      'telefone': 'Telefone',
      'email': 'E-mail',
      'status': 'Status'
    };
    return labels[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') return '-';
    
    if (field === 'status') {
      return value === 'ativo' ? 'Ativo' : 'Inativo';
    }
    
    if (field === 'cnpj') {
      return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return String(value);
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadFiliais();
  }, []);

  // Filtros
  const filteredFiliais = filiais.filter(filial => {
    const matchesSearch = filial.filial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         filial.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         filial.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || filial.status === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner inline={true} text="Carregando filiais..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Filiais</h1>
        <div className="flex gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
          {canCreate('filiais') && (
            <Button
              variant="primary"
              onClick={handleAddFilial}
            >
              <FaPlus className="mr-2" />
              Adicionar Filial
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Filiais"
          value={estatisticas.total_filiais}
          icon={FaBuilding}
          color="blue"
        />
        <StatCard
          title="Filiais Ativas"
          value={estatisticas.filiais_ativas}
          icon={FaCheckCircle}
          color="green"
        />
        <StatCard
          title="Filiais Inativas"
          value={estatisticas.filiais_inativas}
          icon={FaTimesCircle}
          color="red"
        />
        <StatCard
          title="Com CNPJ"
          value={estatisticas.com_cnpj}
          icon={FaMapMarkerAlt}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={() => { setSearchTerm(''); setStatusFilter('todos'); }}
        placeholder="Buscar por nome, cidade ou código..."
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
      {filteredFiliais.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm || statusFilter !== 'todos' ? 
            'Nenhuma filial encontrada com os filtros aplicados' : 
            'Nenhuma filial cadastrada'
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
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Razão Social
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cidade/Estado
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
                  {filteredFiliais.map(filial => (
                    <tr key={filial.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {filial.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {filial.codigo_filial || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {filial.cnpj || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {filial.filial}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {filial.razao_social}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{filial.cidade}</div>
                        <div className="text-sm text-gray-500">{filial.estado}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                          filial.status === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {filial.status === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleViewFilial(filial)}
                            title="Visualizar"
                          >
                            <FaEye className="text-green-600 text-sm" />
                          </Button>
                          {canEdit('filiais') && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleEditFilial(filial)}
                              title="Editar"
                            >
                              <FaEdit className="text-blue-600 text-sm" />
                            </Button>
                          )}
                          {canDelete('filiais') && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleDeleteFilial(filial.id)}
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
            {filteredFiliais.map(filial => (
              <div key={filial.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{filial.filial}</h3>
                    <p className="text-gray-600 text-xs">ID: {filial.id} | Código: {filial.codigo_filial || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleViewFilial(filial)}
                      title="Visualizar"
                      className="p-2"
                    >
                      <FaEye className="text-green-600 text-sm" />
                    </Button>
                    {canEdit('filiais') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEditFilial(filial)}
                        title="Editar"
                        className="p-2"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('filiais') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteFilial(filial.id)}
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
                    <span className="text-gray-500">CNPJ:</span>
                    <p className="font-medium">{filial.cnpj || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Razão Social:</span>
                    <p className="font-medium">{filial.razao_social}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cidade:</span>
                    <p className="font-medium">{filial.cidade}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <p className="font-medium">{filial.estado}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Status:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                      filial.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {filial.status === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Cadastro/Edição/Visualização */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Filial' : editingFilial ? 'Editar Filial' : 'Adicionar Filial'}
        size="full"
      >
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'dados'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('dados')}
            >
              Dados
            </button>
              {editingFilial && editingFilial.id && (
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'almoxarifados'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('almoxarifados')}
              >
                Almoxarifados
              </button>
            )}
          </div>
        </div>

            {activeTab === 'dados' && (
          <FilialForm
            onSubmit={handleSaveFilial}
            initialData={editingFilial}
            viewMode={viewMode}
            onConsultarCNPJ={handleConsultarCNPJ}
          />
        )}

        {activeTab === 'almoxarifados' && editingFilial && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Almoxarifados da Filial</h3>
                      {!viewMode && (
                        <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAlmoxarifadoModal(true)}
                >
                  <FaPlus className="mr-1" />
                  Novo Almoxarifado
                        </Button>
                      )}
                    </div>
            <div className="text-center py-8 text-gray-500">
              Clique em "Novo Almoxarifado" para gerenciar os almoxarifados desta filial
                </div>
              </div>
            )}
              </Modal>

      {/* Modal de Almoxarifados */}
      <AlmoxarifadoModal
        filialId={editingFilial?.id}
        isOpen={showAlmoxarifadoModal}
        onClose={() => setShowAlmoxarifadoModal(false)}
        viewMode={viewMode}
      />

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal
          isOpen={showAuditModal}
          onClose={handleCloseAuditModal}
          title="Relatório de Auditoria - Filiais"
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
                              <strong>Dados da Filial:</strong>
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
                              <strong>ID da Filial:</strong> 
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
    </div>
  );
};

export default Filiais; 