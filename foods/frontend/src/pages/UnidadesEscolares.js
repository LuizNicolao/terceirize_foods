import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle, FaFileExcel, FaFilePdf, FaSchool, FaMapMarkerAlt, FaRoute, FaUsers } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import UnidadesEscolaresService from '../services/unidadesEscolares';
import RotasService from '../services/rotas';
import { Button, Input, Modal, StatCard } from '../components/ui';
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
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
    
    return matchesSearch;
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Unidades Escolares</h1>
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
          {canCreate('unidades_escolares') && (
            <Button onClick={handleAddUnidade} size="sm">
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
          title="Total de Unidades"
          value={estatisticas.total_unidades}
          icon={FaSchool}
          color="blue"
        />
        <StatCard
          title="Unidades Ativas"
          value={estatisticas.unidades_ativas}
          icon={FaMapMarkerAlt}
          color="green"
        />
        <StatCard
          title="Estados"
          value={estatisticas.total_estados}
          icon={FaRoute}
          color="purple"
        />
        <StatCard
          title="Cidades"
          value={estatisticas.total_cidades}
          icon={FaUsers}
          color="orange"
        />
      </div>

                    {/* Filtros */}
       <CadastroFilterBar
         searchTerm={searchTerm}
         onSearchChange={setSearchTerm}
         onClear={() => setSearchTerm('')}
         placeholder="Buscar por nome, cidade ou código..."
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

               {/* Tabela Desktop e Cards Mobile */}
       {filteredUnidades.length === 0 ? (
         <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
           {searchTerm 
             ? 'Nenhuma unidade escolar encontrada com os filtros aplicados'
             : 'Nenhuma unidade escolar cadastrada'
           }
         </div>
       ) : (
         <>
           {/* Tabela Desktop */}
           <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full">
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
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                               <FaEye className="text-green-600" />
                             </Button>
                           )}
                           {canEdit('unidades_escolares') && (
                             <Button
                               variant="ghost"
                               size="xs"
                               onClick={() => handleEditUnidade(unidade)}
                               title="Editar"
                             >
                               <FaEdit className="text-blue-600" />
                             </Button>
                           )}
                           {canDelete('unidades_escolares') && (
                             <Button
                               variant="ghost"
                               size="xs"
                               onClick={() => handleDeleteUnidade(unidade.id)}
                               title="Excluir"
                             >
                               <FaTrash className="text-red-600" />
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

           {/* Cards Mobile */}
           <div className="lg:hidden space-y-3">
             {filteredUnidades.map((unidade) => (
               <div key={unidade.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                 <div className="flex justify-between items-start mb-3">
                   <div className="flex-1">
                     <h3 className="text-sm font-semibold text-gray-900 mb-1">
                       {unidade.nome_escola}
                     </h3>
                     <p className="text-xs text-gray-500 mb-1">
                       Código: {unidade.codigo_teknisa}
                     </p>
                   </div>
                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                     unidade.status === 'ativo' 
                       ? 'bg-green-100 text-green-800' 
                       : 'bg-red-100 text-red-800'
                   }`}>
                     {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                   </span>
                 </div>
                 
                 <div className="space-y-2 mb-3">
                   <div className="flex items-center text-xs text-gray-600">
                     <FaMapMarkerAlt className="mr-2 text-gray-400" />
                     <span>{unidade.cidade}, {unidade.estado}</span>
                   </div>
                   <div className="flex items-center text-xs text-gray-600">
                     <FaSchool className="mr-2 text-gray-400" />
                     <span>{unidade.centro_distribuicao}</span>
                   </div>
                   <div className="flex items-center text-xs text-gray-600">
                     <FaRoute className="mr-2 text-gray-400" />
                     <span>{loadingRotas ? 'Carregando...' : getRotaName(unidade.rota_id)}</span>
                   </div>
                 </div>
                 
                 <div className="flex gap-2 pt-2 border-t border-gray-100">
                   {canView('unidades_escolares') && (
                     <Button
                       variant="ghost"
                       size="xs"
                       onClick={() => handleViewUnidade(unidade)}
                       className="flex-1"
                     >
                       <FaEye className="mr-1" />
                       Visualizar
                     </Button>
                   )}
                   {canEdit('unidades_escolares') && (
                     <Button
                       variant="ghost"
                       size="xs"
                       onClick={() => handleEditUnidade(unidade)}
                       className="flex-1"
                     >
                       <FaEdit className="mr-1" />
                       Editar
                     </Button>
                   )}
                   {canDelete('unidades_escolares') && (
                     <Button
                       variant="ghost"
                       size="xs"
                       onClick={() => handleDeleteUnidade(unidade.id)}
                       className="flex-1"
                     >
                       <FaTrash className="mr-1" />
                       Excluir
                     </Button>
                   )}
                 </div>
               </div>
             ))}
           </div>
         </>
       )}

                    {/* Modal de Unidade Escolar */}
               <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={viewMode ? 'Visualizar Unidade Escolar' : editingUnidade ? 'Editar Unidade Escolar' : 'Adicionar Unidade Escolar'}
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
                </div>
              </div>

              {/* Card 2: Endereço */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Endereço</h3>
                <div className="space-y-3">
                  {/* Cidade e Estado lado a lado */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </div>
                  <Input
                    label="Endereço"
                    {...register('endereco')}
                    disabled={viewMode}
                  />
                  {/* Número e CEP lado a lado */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Número"
                      {...register('numero')}
                      disabled={viewMode}
                    />
                    <Input
                      label="CEP"
                      {...register('cep')}
                      disabled={viewMode}
                    />
                  </div>
                  <Input
                    label="Bairro"
                    {...register('bairro')}
                    disabled={viewMode}
                  />
                  <Input
                    label="País"
                    {...register('pais')}
                    disabled={viewMode}
                  />
                </div>
              </div>
            </div>

            {/* Segunda Linha - 3 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card 3: Configurações */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Configurações</h3>
                <div className="space-y-3">
                  <Input
                    label="Centro de Distribuição"
                    {...register('centro_distribuicao')}
                    disabled={viewMode}
                  />
                  <Input
                    label="Regional"
                    {...register('regional')}
                    disabled={viewMode}
                  />
                  {/* LOT e CC Senior lado a lado */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="LOT"
                      {...register('lot')}
                      disabled={viewMode}
                    />
                    <Input
                      label="CC Senior"
                      {...register('cc_senior')}
                      disabled={viewMode}
                    />
                  </div>
                  <Input
                    label="Código Senior"
                    {...register('codigo_senior')}
                    disabled={viewMode}
                  />
                  <Input
                    label="Abastecimento"
                    {...register('abastecimento')}
                    disabled={viewMode}
                  />
                </div>
              </div>

              {/* Card 4: Rota e Status */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Rota e Status</h3>
                <div className="space-y-3">
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
                  {/* Ordem de Entrega e Status lado a lado */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Ordem de Entrega"
                      type="number"
                      {...register('ordem_entrega')}
                      disabled={viewMode}
                    />
                    <Input
                      label="Status *"
                      type="select"
                      {...register('status', { required: 'Status é obrigatório' })}
                      error={errors.status?.message}
                      disabled={viewMode}
                    >
                      <option value="">Selecione</option>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </Input>
                  </div>
                </div>
              </div>

              {/* Card 5: Observações */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Observações</h3>
                <Input
                  label="Observações"
                  type="textarea"
                  {...register('observacoes')}
                  disabled={viewMode}
                  rows={5}
                />
              </div>
            </div>

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