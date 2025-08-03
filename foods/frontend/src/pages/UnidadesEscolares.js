import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle, FaFileExcel, FaFilePdf, FaSchool, FaMapMarkerAlt, FaRoute, FaUsers } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import UnidadesEscolaresService from '../services/unidadesEscolares';
import RotasService from '../services/rotas';
import { Button, Input, Modal, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';

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
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total_unidades: 0,
    unidades_ativas: 0,
    total_estados: 0,
    total_cidades: 0
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadUnidades();
    loadRotas();
  }, []);

  const loadUnidades = async (params = {}) => {
    setLoading(true);
    try {
      const result = await UnidadesEscolaresService.listar(params);
      if (result.success) {
        setUnidades(result.data);
        // Calcular estatísticas básicas
        const total = result.data.length;
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
    setLoadingAudit(true);
    try {
      const response = await fetch('/api/auditoria?entidade=unidades_escolares&limit=100', {
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
      nome_escola: 'Nome da Escola',
      codigo_teknisa: 'Código Teknisa',
      cidade: 'Cidade',
      estado: 'Estado',
      endereco: 'Endereço',
      centro_distribuicao: 'Centro de Distribuição',
      rota_id: 'Rota',
      status: 'Status'
    };
    return fields[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (field === 'status') {
      return value === 'ativo' ? 'Ativo' : 'Inativo';
    }
    if (field === 'rota_id') {
      const rota = rotas.find(r => r.id === parseInt(value));
      return rota ? rota.nome : value;
    }
    return value;
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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Unidades Escolares</h1>
        <div className="flex gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            className="text-xs px-3 py-2"
          >
            <FaQuestionCircle className="mr-2" />
            Auditoria
          </Button>
          {canCreate('unidades_escolares') && (
            <Button onClick={handleAddUnidade}>
              <FaPlus className="mr-2" />
              Adicionar
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
        onSearch={(search) => loadUnidades({ search })}
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              {unidades.map((unidade) => (
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
                     <div className="flex space-x-2">
                       {canView('unidades_escolares') && (
                         <button
                           onClick={() => handleViewUnidade(unidade)}
                           className="text-green-600 hover:text-green-900"
                         >
                           <FaEye />
                         </button>
                       )}
                       {canEdit('unidades_escolares') && (
                         <button
                           onClick={() => handleEditUnidade(unidade)}
                           className="text-blue-600 hover:text-blue-900"
                         >
                           <FaEdit />
                         </button>
                       )}
                       {canDelete('unidades_escolares') && (
                         <button
                           onClick={() => handleDeleteUnidade(unidade.id)}
                           className="text-red-600 hover:text-red-900"
                         >
                           <FaTrash />
                         </button>
                       )}
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

             {/* Modal de Unidade Escolar */}
       <Modal
         isOpen={showModal}
         onClose={handleCloseModal}
         title={viewMode ? 'Visualizar Unidade Escolar' : editingUnidade ? 'Editar Unidade Escolar' : 'Adicionar Unidade Escolar'}
         size={viewMode ? "xl" : "lg"}
       >
                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
           <div className={`grid grid-cols-1 ${viewMode ? 'lg:grid-cols-3 md:grid-cols-2' : 'md:grid-cols-2'} gap-6`}>
            <Input
              label="Nome da Escola"
              {...register('nome_escola', { required: 'Nome da escola é obrigatório' })}
              error={errors.nome_escola?.message}
              disabled={viewMode}
            />
            <Input
              label="Código Teknisa"
              {...register('codigo_teknisa', { required: 'Código Teknisa é obrigatório' })}
              error={errors.codigo_teknisa?.message}
              disabled={viewMode}
            />
            <Input
              label="Cidade"
              {...register('cidade', { required: 'Cidade é obrigatória' })}
              error={errors.cidade?.message}
              disabled={viewMode}
            />
            <Input
              label="Estado"
              {...register('estado', { required: 'Estado é obrigatório' })}
              error={errors.estado?.message}
              disabled={viewMode}
            />
            <Input
              label="País"
              {...register('pais')}
              disabled={viewMode}
            />
            <Input
              label="CEP"
              {...register('cep')}
              disabled={viewMode}
            />
            <Input
              label="Endereço"
              {...register('endereco')}
              disabled={viewMode}
            />
            <Input
              label="Número"
              {...register('numero')}
              disabled={viewMode}
            />
            <Input
              label="Bairro"
              {...register('bairro')}
              disabled={viewMode}
            />
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
            <Input
              label="Ordem de Entrega"
              type="number"
              {...register('ordem_entrega')}
              disabled={viewMode}
            />
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
            <Input
              label="Status"
              type="select"
              {...register('status', { required: 'Status é obrigatório' })}
              error={errors.status?.message}
              disabled={viewMode}
            >
              <option value="">Selecione o status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Input>
          </div>
          
          <Input
            label="Observações"
            type="textarea"
            {...register('observacoes')}
            disabled={viewMode}
          />

          {!viewMode && (
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUnidade ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal de Auditoria */}
      <Modal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Logs de Auditoria - Unidades Escolares"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Histórico de Alterações
            </h3>
            <Button onClick={handleApplyAuditFilters} variant="outline" size="sm">
              Atualizar
            </Button>
          </div>

          {loadingAudit ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Campo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Anterior</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Novo Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {log.usuario_nome || 'Sistema'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {getActionLabel(log.action)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {getFieldLabel(log.field_name)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {formatFieldValue(log.field_name, log.old_value)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
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
    </div>
  );
};

export default UnidadesEscolares; 