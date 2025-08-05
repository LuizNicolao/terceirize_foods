import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaHistory, FaQuestionCircle, FaFileExcel, FaFilePdf, FaTimes } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import produtosService from '../services/produtos';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import CadastroFilterBar from '../components/CadastroFilterBar';
import { Button, Input, Modal, Table, StatCard } from '../components/ui';
import LoadingSpinner from '../components/LoadingSpinner';
import ProdutoForm from '../components/ProdutoForm';

const Produtos = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  
  // Estados principais
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  
  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [grupoFilter, setGrupoFilter] = useState('todos');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados de auditoria
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilters, setAuditFilters] = useState({
    dataInicio: '',
    dataFim: '',
    acao: '',
    usuario_id: '',
    periodo: ''
  });
  
  // Estados de dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  
  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    estoqueBaixo: 0
  });

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      const [produtosRes, gruposRes, unidadesRes, estatisticasRes] = await Promise.all([
        produtosService.listar({ limit: 1000 }),
        produtosService.listar({ limit: 1000 }), // Substituir por service de grupos
        produtosService.listar({ limit: 1000 }), // Substituir por service de unidades
        produtosService.obterEstatisticas()
      ]);

      setProdutos(produtosRes.data?.items || produtosRes || []);
      setGrupos(gruposRes.data?.items || gruposRes || []);
      setUnidades(unidadesRes.data?.items || unidadesRes || []);
      setEstatisticas(estatisticasRes || {
        total: produtosRes.data?.items?.length || produtosRes?.length || 0,
        ativos: 0,
        inativos: 0,
        estoqueBaixo: 0
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchField, statusFilter, grupoFilter, itemsPerPage]);

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
      params.append('recurso', 'produtos');
      
      const response = await fetch(`/api/auditoria?${params.toString()}`);
      const data = await response.json();
      setAuditLogs(data.data?.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  // Abrir modal de auditoria
  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    loadAuditLogs();
  };

  // Fechar modal de auditoria
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

  // Aplicar filtros de auditoria
  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  // Exportar auditoria para XLSX
  const handleExportXLSX = async () => {
    try {
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
      params.append('recurso', 'produtos');
      
      const response = await fetch(`/api/auditoria/export/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_produtos_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Exportar auditoria para PDF
  const handleExportPDF = async () => {
    try {
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
      params.append('recurso', 'produtos');
      
      const response = await fetch(`/api/auditoria/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_produtos_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Obter label da ação
  const getActionLabel = (action) => {
    const actions = {
      'create': 'Criar',
      'update': 'Editar',
      'delete': 'Excluir',
      'login': 'Login',
      'logout': 'Logout',
      'view': 'Visualizar'
    };
    return actions[action] || action;
  };

  // Obter label do campo
  const getFieldLabel = (field) => {
    const labels = {
      'nome': 'Nome',
      'codigo_produto': 'Código do Produto',
      'descricao': 'Descrição',
      'codigo_barras': 'Código de Barras',
      'fator_conversao': 'Fator de Conversão',
      'preco_custo': 'Preço de Custo',
      'preco_venda': 'Preço de Venda',
      'estoque_atual': 'Estoque Atual',
      'estoque_minimo': 'Estoque Mínimo',
      'id_fornecedor': 'Fornecedor',
      'grupo_id': 'Grupo',
      'unidade_id': 'Unidade',
      'status': 'Status'
    };
    return labels[field] || field;
  };

  // Formatar valor do campo
  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return 'Não informado';
    }

    switch (field) {
      case 'preco_custo':
      case 'preco_venda':
        return formatPrice(value);
      case 'estoque_atual':
      case 'estoque_minimo':
        return value.toString();

      case 'grupo_id':
        return getGrupoName(value);
      case 'unidade_id':
        return getUnidadeName(value);
      case 'status':
        return value === 1 ? 'Ativo' : 'Inativo';
      default:
        return value;
    }
  };

  // Adicionar produto
  const handleAddProduto = () => {
    setEditingProduto(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  // Visualizar produto
  const handleViewProduto = (produto) => {
    setEditingProduto(produto);
    setIsViewMode(true);
    setShowModal(true);
  };

  // Editar produto
  const handleEditProduto = (produto) => {
    setEditingProduto(produto);
    setIsViewMode(false);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduto(null);
    setIsViewMode(false);
  };

  // Submeter formulário
  const onSubmit = async (data) => {
    try {
      if (editingProduto) {
        await produtosService.atualizar(editingProduto.id, data);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await produtosService.criar(data);
        toast.success('Produto criado com sucesso!');
      }
      
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  // Excluir produto
  const handleDeleteProduto = async (produtoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await produtosService.excluir(produtoId);
      toast.success('Produto excluído com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchField('todos');
    setStatusFilter('todos');
    setGrupoFilter('todos');
    setCurrentPage(1);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Filtrar produtos
  const filteredProdutos = useMemo(() => {
    return produtos.filter(produto => {
      const matchesSearch = !searchTerm || 
        produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.codigo_produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getGrupoName(produto.grupo_id)?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || 
        (statusFilter === 'ativo' && produto.status === 1) ||
        (statusFilter === 'inativo' && produto.status === 0);
      
      const matchesGrupo = grupoFilter === 'todos' || produto.grupo_id == grupoFilter;
      
      return matchesSearch && matchesStatus && matchesGrupo;
    });
  }, [produtos, searchTerm, statusFilter, grupoFilter]);

  // Dados de paginação
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredProdutos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredProdutos.slice(startIndex, endIndex);
    
    return {
      totalPages,
      startIndex,
      endIndex,
      currentItems
    };
  }, [filteredProdutos, currentPage, itemsPerPage]);

  const { totalPages, startIndex, endIndex, currentItems } = paginationData;

  // Gerar array de páginas para exibir
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [totalPages, currentPage]);

  // Formatar preço
  const formatPrice = (price) => {
    if (!price) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Obter nome do grupo
  const getGrupoName = (grupoId) => {
    if (!grupoId) return '-';
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : '-';
  };

  // Obter nome da unidade
  const getUnidadeName = (unidadeId) => {
    if (!unidadeId) return '-';
    const unidade = unidades.find(u => u.id === unidadeId);
    return unidade ? unidade.nome : '-';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <div className="flex gap-3">
          <Button onClick={handleOpenAuditModal} variant="ghost" size="sm">
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Auditoria</span>
          </Button>
          {canCreate('produtos') && (
            <Button onClick={handleAddProduto}>
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Produto</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

             {/* StatCards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         <StatCard
           title="Total de Produtos"
           value={estatisticas.total}
           color="blue"
         />
         <StatCard
           title="Produtos Ativos"
           value={estatisticas.ativos}
           color="green"
         />
         <StatCard
           title="Produtos Inativos"
           value={estatisticas.inativos}
           color="red"
         />
         <StatCard
           title="Estoque Baixo"
           value={estatisticas.estoqueBaixo}
           color="yellow"
         />
       </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={handleClearFilters}
        placeholder="Buscar por nome, código ou grupo..."
      />

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Nome</Table.HeaderCell>
              <Table.HeaderCell>Código</Table.HeaderCell>
              <Table.HeaderCell>Grupo</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Ações</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {currentItems.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== 'todos' || grupoFilter !== 'todos'
                    ? 'Nenhum produto encontrado com os filtros aplicados'
                    : 'Nenhum produto cadastrado'
                  }
                </Table.Cell>
              </Table.Row>
            ) : (
              currentItems.map((produto) => (
                <Table.Row key={produto.id}>
                  <Table.Cell className="font-medium">{produto.nome}</Table.Cell>
                  <Table.Cell>{produto.codigo_produto || '-'}</Table.Cell>
                  <Table.Cell>{getGrupoName(produto.grupo_id)}</Table.Cell>
                  <Table.Cell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      produto.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {produto.status === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProduto(produto)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEye />
                      </Button>
                      {canEdit('produtos') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduto(produto)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaEdit />
                        </Button>
                      )}
                      {canDelete('produtos') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduto(produto.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Paginação */}
      {totalItems > 0 && (
        <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} produtos 
            {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
            
            <Button 
              onClick={handleFirstPage} 
              disabled={currentPage === 1}
              variant="ghost"
              size="sm"
              title="Primeira página"
            >
              «
            </Button>
            
            <Button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              variant="ghost"
              size="sm"
              title="Página anterior"
            >
              ‹
            </Button>

            {pageNumbers.map((page, index) => (
              <Button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                variant={page === currentPage ? 'default' : 'ghost'}
                size="sm"
                disabled={page === '...'}
                className={page === '...' ? 'cursor-default border-none bg-transparent' : ''}
              >
                {page}
              </Button>
            ))}

            <Button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              variant="ghost"
              size="sm"
              title="Próxima página"
            >
              ›
            </Button>
            
            <Button 
              onClick={handleLastPage} 
              disabled={currentPage === totalPages}
              variant="ghost"
              size="sm"
              title="Última página"
            >
              »
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Produto */}
      <ProdutoForm
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        produto={editingProduto}
        viewMode={isViewMode}
        grupos={grupos}
        subgrupos={subgrupos}
        classes={classes}
        marcas={marcas}
        unidades={unidades}
        fornecedores={fornecedores}
      />

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal
          isOpen={showAuditModal}
          onClose={handleCloseAuditModal}
          title="Relatório de Auditoria - Produtos"
          size="xl"
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
              <Button onClick={handleExportXLSX} variant="secondary" size="sm">
                <FaFileExcel className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
              <Button onClick={handleExportPDF} variant="secondary" size="sm">
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
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.acao === 'create' ? 'bg-green-100 text-green-800' :
                            log.acao === 'update' ? 'bg-yellow-100 text-yellow-800' :
                            log.acao === 'delete' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {getActionLabel(log.acao)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600">
                            por {log.usuario_nome || 'Usuário desconhecido'}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      
                      {log.detalhes && (
                        <div className="text-xs sm:text-sm text-gray-700">
                          {log.detalhes.changes && (
                            <div className="mb-2">
                              <strong>Mudanças Realizadas:</strong>
                              <div className="ml-3 mt-2 space-y-2">
                                {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                  <div key={field} className="p-2 bg-gray-50 rounded border text-xs">
                                    <div className="font-medium text-gray-800 mb-1">
                                      {getFieldLabel(field)}:
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-red-600">
                                        <strong>Antes:</strong> {formatFieldValue(field, change.from)}
                                      </span>
                                      <span className="text-gray-500">→</span>
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
                              <strong>Dados do Produto:</strong>
                              <div className="ml-3 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(log.detalhes.requestBody).map(([field, value]) => (
                                  <div key={field} className="p-2 bg-gray-50 rounded border text-xs">
                                    <div className="font-medium text-gray-800 mb-1">
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
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <strong>ID do Produto:</strong> 
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

export default Produtos; 