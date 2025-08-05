import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaHistory, FaQuestionCircle, FaFileExcel, FaFilePdf, FaTimes, FaBox, FaCheckCircle, FaTimesCircle, FaDollarSign } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import { Button, Table, Modal, Input, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';
import ProdutoForm from '../components/ProdutoForm';
import produtosService from '../services/produtos';

const Produtos = () => {
  const { hasPermission } = usePermissions();
  
  // Estados principais
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  // Estados dos modais
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [viewingProduto, setViewingProduto] = useState(null);
  
  // Estados de auditoria
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    dataInicio: '',
    dataFim: '',
    acao: '',
    usuario: '',
    campo: ''
  });
  
  // Estados dos dados relacionados
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [nomesGenericos, setNomesGenericos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  
  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_produtos: 0,
    produtos_ativos: 0,
    produtos_inativos: 0,
    com_preco: 0
  });

  // Carregar dados principais
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        ...filters
      };
      
      const response = await produtosService.listar(params);
      setProdutos(response.data || []);
      setTotalItems(response.total || 0);
      
      // Carregar estatísticas
      const statsResponse = await produtosService.listar({ limit: 1000 });
      const todosProdutos = statsResponse.data || [];
      setEstatisticas({
        total_produtos: todosProdutos.length,
        produtos_ativos: todosProdutos.filter(p => p.status === 'ativo').length,
        produtos_inativos: todosProdutos.filter(p => p.status === 'inativo').length,
        com_preco: todosProdutos.filter(p => p.preco_unitario && p.preco_unitario > 0).length
      });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados relacionados
  const loadRelatedData = async () => {
    try {
      const [
        gruposRes,
        subgruposRes,
        classesRes,
        marcasRes,
        nomesGenericosRes,
        unidadesRes,
        fornecedoresRes
      ] = await Promise.all([
        produtosService.listarGrupos(),
        produtosService.listarSubgrupos(),
        produtosService.listarClasses(),
        produtosService.listarMarcas(),
        produtosService.listarNomesGenericos(),
        produtosService.listarUnidades(),
        produtosService.listarFornecedores()
      ]);

      setGrupos(gruposRes.data || []);
      setSubgrupos(subgruposRes.data || []);
      setClasses(classesRes.data || []);
      setMarcas(marcasRes.data || []);
      setNomesGenericos(nomesGenericosRes.data || []);
      setUnidades(unidadesRes.data || []);
      setFornecedores(fornecedoresRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const response = await produtosService.listarAuditoria(auditFilters);
      setAuditLogs(response.data || []);
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
      const blob = await produtosService.exportarAuditoriaXLSX(auditFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria_produtos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Auditoria exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar auditoria:', error);
      toast.error('Erro ao exportar auditoria');
    }
  };

  // Exportar auditoria para PDF
  const handleExportAuditPDF = async () => {
    try {
      const blob = await produtosService.exportarAuditoriaPDF(auditFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria_produtos_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Auditoria exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar auditoria:', error);
      toast.error('Erro ao exportar auditoria');
    }
  };

  // Exportar produtos para XLSX
  const handleExportXLSX = async () => {
    try {
      const blob = await produtosService.exportarXLSX({ search: searchTerm, ...filters });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `produtos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Produtos exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
      toast.error('Erro ao exportar produtos');
    }
  };

  // Exportar produtos para PDF
  const handleExportPDF = async () => {
    try {
      const blob = await produtosService.exportarPDF({ search: searchTerm, ...filters });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `produtos_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Produtos exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
      toast.error('Erro ao exportar produtos');
    }
  };

  // Handlers dos modais
  const handleAddProduto = () => {
    setEditingProduto(null);
    setShowModal(true);
  };

  const handleEditProduto = (produto) => {
    setEditingProduto(produto);
    setShowModal(true);
  };

  const handleViewProduto = (produto) => {
    setViewingProduto(produto);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduto(null);
    setViewingProduto(null);
  };

  const handleSuccess = () => {
    loadData();
    toast.success(editingProduto ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
  };

  // Handler de exclusão
  const handleDeleteProduto = async (produtoId) => {
    if (!hasPermission('produtos', 'delete')) {
      toast.error('Você não tem permissão para excluir produtos');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await produtosService.excluir(produtoId);
        toast.success('Produto excluído com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast.error('Erro ao excluir produto');
      }
    }
  };

  // Handlers de filtros e paginação
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Funções auxiliares
  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getGrupoName = (grupoId) => {
    const grupo = (grupos || []).find(g => g.id === grupoId);
    return grupo ? grupo.nome_grupo : '-';
  };

  const getUnidadeName = (unidadeId) => {
    const unidade = (unidades || []).find(u => u.id === unidadeId);
    return unidade ? unidade.nome_unidade : '-';
  };

  const getStatusBadge = (status) => {
    return status === 'ativo' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheckCircle className="w-3 h-3 mr-1" />
        Ativo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimesCircle className="w-3 h-3 mr-1" />
        Inativo
      </span>
    );
  };

  // Configuração da tabela
  const columns = [
    {
      key: 'codigo_produto',
      label: 'Código',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (value) => <span className="text-gray-700">{value}</span>
    },
    {
      key: 'grupo_id',
      label: 'Grupo',
      render: (value) => <span className="text-gray-600">{getGrupoName(value)}</span>
    },
    {
      key: 'unidade_id',
      label: 'Unidade',
      render: (value) => <span className="text-gray-600">{getUnidadeName(value)}</span>
    },
    {
      key: 'preco_unitario',
      label: 'Preço Unitário',
      render: (value) => <span className="font-medium text-green-600">{formatPrice(value)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, produto) => (
        <div className="flex items-center space-x-2">
          {hasPermission('produtos', 'read') && (
            <button
              onClick={() => handleViewProduto(produto)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Visualizar"
            >
              <FaEye className="w-4 h-4" />
            </button>
          )}
          {hasPermission('produtos', 'update') && (
            <button
              onClick={() => handleEditProduto(produto)}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
              title="Editar"
            >
              <FaEdit className="w-4 h-4" />
            </button>
          )}
          {hasPermission('produtos', 'delete') && (
            <button
              onClick={() => handleDeleteProduto(produto.id)}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Excluir"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Carregar dados na montagem do componente
  useEffect(() => {
    loadData();
    loadRelatedData();
  }, [currentPage, pageSize, searchTerm, filters]);

  // Carregar auditoria quando modal abrir
  useEffect(() => {
    if (showAuditModal) {
      loadAuditLogs();
    }
  }, [showAuditModal, auditFilters]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <div className="flex items-center space-x-3">
          {hasPermission('produtos', 'read') && (
            <Button
              variant="ghost"
              onClick={() => setShowAuditModal(true)}
              className="flex items-center space-x-2"
            >
              <FaQuestionCircle />
              <span>Auditoria</span>
            </Button>
          )}
          {hasPermission('produtos', 'create') && (
            <Button
              onClick={handleAddProduto}
              className="flex items-center space-x-2"
            >
              <FaPlus />
              <span>Adicionar Produto</span>
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total de Produtos"
          value={estatisticas.total_produtos}
          icon={FaBox}
          color="blue"
        />
        <StatCard
          title="Produtos Ativos"
          value={estatisticas.produtos_ativos}
          icon={FaCheckCircle}
          color="green"
        />
        <StatCard
          title="Produtos Inativos"
          value={estatisticas.produtos_inativos}
          icon={FaTimesCircle}
          color="red"
        />
        <StatCard
          title="Com Preço"
          value={estatisticas.com_preco}
          icon={FaDollarSign}
          color="yellow"
        />
      </div>

      {/* Barra de Filtros */}
      <CadastroFilterBar
        onSearch={handleSearch}
        onFilters={handleFilters}
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: [
            { value: 'ativo', label: 'Ativo' },
            { value: 'inativo', label: 'Inativo' }
          ]},
          { key: 'grupo_id', label: 'Grupo', type: 'select', options: (grupos || []).map(g => ({ value: g.id, label: g.nome_grupo })) },
          { key: 'unidade_id', label: 'Unidade', type: 'select', options: (unidades || []).map(u => ({ value: u.id, label: u.nome_unidade })) }
        ]}
      />

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          data={produtos}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum produto encontrado"
        />
        
        {/* Paginação */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Modal de Formulário */}
      <ProdutoForm
        isOpen={showModal}
        onClose={handleCloseModal}
        produto={editingProduto}
        onSuccess={handleSuccess}
        grupos={grupos}
        subgrupos={subgrupos}
        classes={classes}
        marcas={marcas}
        nomesGenericos={nomesGenericos}
        unidades={unidades}
        fornecedores={fornecedores}
      />

      {/* Modal de Visualização */}
      {viewingProduto && (
        <Modal
          isOpen={!!viewingProduto}
          onClose={() => setViewingProduto(null)}
          title="Detalhes do Produto"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Código</label>
                <p className="mt-1 text-sm text-gray-900">{viewingProduto.codigo_produto}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <p className="mt-1 text-sm text-gray-900">{viewingProduto.descricao}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Grupo</label>
                <p className="mt-1 text-sm text-gray-900">{getGrupoName(viewingProduto.grupo_id)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unidade</label>
                <p className="mt-1 text-sm text-gray-900">{getUnidadeName(viewingProduto.unidade_id)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preço Unitário</label>
                <p className="mt-1 text-sm text-gray-900">{formatPrice(viewingProduto.preco_unitario)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(viewingProduto.status)}</div>
              </div>
            </div>
            {viewingProduto.observacoes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <p className="mt-1 text-sm text-gray-900">{viewingProduto.observacoes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal de Auditoria */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Auditoria de Produtos"
        size="xl"
      >
        <div className="space-y-4">
          {/* Filtros de Auditoria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={auditFilters.dataInicio}
                onChange={(e) => setAuditFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={auditFilters.dataFim}
                onChange={(e) => setAuditFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ação</label>
              <select
                value={auditFilters.acao}
                onChange={(e) => setAuditFilters(prev => ({ ...prev, acao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="CREATE">Criação</option>
                <option value="UPDATE">Atualização</option>
                <option value="DELETE">Exclusão</option>
              </select>
            </div>
          </div>

          {/* Botões de Exportação */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleExportAuditXLSX}
              className="flex items-center space-x-2"
            >
              <FaFileExcel />
              <span>Exportar XLSX</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportAuditPDF}
              className="flex items-center space-x-2"
            >
              <FaFilePdf />
              <span>Exportar PDF</span>
            </Button>
          </div>

          {/* Tabela de Auditoria */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Anterior</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Novo Valor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Carregando...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Nenhum log de auditoria encontrado
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.usuario_nome || log.usuario_email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                          log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {log.action === 'CREATE' ? 'Criação' :
                           log.action === 'UPDATE' ? 'Atualização' : 'Exclusão'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.field_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.old_value || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.new_value || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Produtos; 