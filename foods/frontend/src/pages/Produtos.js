import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaQuestionCircle,
  FaFileExcel,
  FaFilePdf,
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
  FaTags,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import ProdutosService from '../services/produtos';
import { Button, Input, StatCard, Modal } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';
import ProdutoModal from '../components/ProdutoModal';

import api from '../services/api';

const Produtos = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [produtos, setProdutos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
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
    total_produtos: 0,
    produtos_ativos: 0,
    produtos_inativos: 0,
    grupos_diferentes: 0
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
      
      // Carregar produtos com paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined
      };

      const [produtosRes, gruposRes, unidadesRes] = await Promise.all([
        ProdutosService.listar(paginationParams),
        api.get('/grupos?limit=1000'),
        api.get('/unidades?limit=1000')
      ]);

      if (produtosRes.success) {
        setProdutos(produtosRes.data);
        
        // Extrair informações de paginação
        if (produtosRes.pagination) {
          setTotalPages(produtosRes.pagination.totalPages || 1);
          setTotalItems(produtosRes.pagination.totalItems || produtosRes.data.length);
          setCurrentPage(produtosRes.pagination.currentPage || 1);
        } else {
          setTotalItems(produtosRes.data.length);
          setTotalPages(Math.ceil(produtosRes.data.length / itemsPerPage));
        }
        
        // Calcular estatísticas
        const total = produtosRes.pagination?.totalItems || produtosRes.data.length;
        const ativos = produtosRes.data.filter(p => p.status === 1).length;
        const inativos = produtosRes.data.filter(p => p.status === 0).length;
        const gruposUnicos = new Set(produtosRes.data.map(p => p.grupo_id)).size;
        
        setEstatisticas({
          total_produtos: total,
          produtos_ativos: ativos,
          produtos_inativos: inativos,
          grupos_diferentes: gruposUnicos
        });
      } else {
        toast.error(produtosRes.error);
      }

      // Carregar dados auxiliares
      if (gruposRes.data?.data?.items) {
        setGrupos(gruposRes.data.data.items);
      } else if (gruposRes.data?.data) {
        setGrupos(gruposRes.data.data);
      } else {
        setGrupos(gruposRes.data || []);
      }

      if (unidadesRes.data?.data) {
        setUnidades(unidadesRes.data.data);
      } else {
        setUnidades(unidadesRes.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };



  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      
      const params = new URLSearchParams();
      
      // Aplicar filtro de período se selecionado
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        // Usar filtros manuais se período não estiver selecionado
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para produtos
      params.append('recurso', 'produtos');
      
      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
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
  const handleExportAuditXLSX = async () => {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros atuais
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para produtos
      params.append('recurso', 'produtos');
      
      // Fazer download do arquivo
      const response = await api.get(`/auditoria/export/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
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
  const handleExportAuditPDF = async () => {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros atuais
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para produtos
      params.append('recurso', 'produtos');
      
      // Fazer download do arquivo
      const response = await api.get(`/auditoria/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
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

  // Exportar produtos para XLSX
  const handleExportXLSX = async () => {
    try {
      const result = await ProdutosService.exportarXLSX();
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `produtos_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Produtos exportados com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar produtos');
    }
  };

  // Exportar produtos para PDF
  const handleExportPDF = async () => {
    try {
      const result = await ProdutosService.exportarPDF();
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `produtos_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Produtos exportados com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar produtos');
    }
  };

  // Abrir modal para adicionar produto
  const handleAddProduto = () => {
    setEditingProduto(null);
    setViewMode(false);
    setShowModal(true);
  };

  // Abrir modal para visualizar produto
  const handleViewProduto = (produto) => {
    setEditingProduto(produto);
    setViewMode(true);
    setShowModal(true);
  };

  // Abrir modal para editar produto
  const handleEditProduto = (produto) => {
    setEditingProduto(produto);
    setViewMode(false);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduto(null);
    setViewMode(false);
  };

  // Salvar produto
  const handleSubmitProduto = async (data) => {
    try {
      if (editingProduto) {
        // Para edição, enviar apenas os campos que foram alterados
        const updateData = {};
        
        if (data.nome !== editingProduto.nome) {
          updateData.nome = data.nome;
        }
        
        if (data.codigo_barras !== editingProduto.codigo_barras) {
          updateData.codigo_barras = data.codigo_barras;
        }
        
        if (data.fator_conversao !== editingProduto.fator_conversao) {
          updateData.fator_conversao = data.fator_conversao;
        }
        
        if (data.descricao !== editingProduto.descricao) {
          updateData.descricao = data.descricao;
        }
        
        if (data.grupo_id !== editingProduto.grupo_id) {
          updateData.grupo_id = data.grupo_id;
        }
        
        if (data.unidade_id !== editingProduto.unidade_id) {
          updateData.unidade_id = data.unidade_id;
        }
        
        if (data.status !== editingProduto.status) {
          updateData.status = parseInt(data.status);
        }
        
        // Se não há campos para atualizar, mostrar erro
        if (Object.keys(updateData).length === 0) {
          toast.error('Nenhum campo foi alterado');
          return;
        }
        
        const result = await ProdutosService.atualizar(editingProduto.id, updateData);
        if (result.success) {
          toast.success(result.message);
          handleCloseModal();
          loadData();
      } else {
          toast.error(result.error);
        }
      } else {
        // Para criação, enviar todos os campos
        const createData = { ...data };
        if (createData.status) {
          createData.status = parseInt(createData.status);
        }
        
        const result = await ProdutosService.criar(createData);
        if (result.success) {
          toast.success(result.message);
      handleCloseModal();
      loadData();
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  // Excluir produto
  const handleDeleteProduto = async (produtoId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
    try {
        const result = await ProdutosService.excluir(produtoId);
        if (result.success) {
          toast.success(result.message);
      loadData();
        } else {
          toast.error(result.error);
        }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
      }
    }
  };

  // Imprimir produto em PDF
  const handlePrintProduto = async () => {
    if (!editingProduto) {
      toast.error('Nenhum produto selecionado para impressão');
      return;
    }

    try {
      const result = await ProdutosService.imprimirPDF(editingProduto.id);
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `produto_${editingProduto.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Produto impresso com sucesso!');
    } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao imprimir produto:', error);
      toast.error('Erro ao imprimir produto');
    }
  };

  // Buscar nome do grupo
  const getGrupoName = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : 'N/A';
  };

  // Buscar nome da unidade
  const getUnidadeName = (unidadeId) => {
    const unidade = unidades.find(u => u.id === unidadeId);
    return unidade ? unidade.nome : 'N/A';
  };

  // Função para limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setCurrentPage(1);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produtos</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={handleOpenAuditModal} variant="ghost" size="sm">
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Auditoria</span>
          </Button>
          
          {canCreate('produtos') && (
            <Button onClick={handleAddProduto} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Produto</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
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
          title="Grupos Diferentes"
          value={estatisticas.grupos_diferentes}
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
        placeholder="Buscar por nome, código ou grupo..."
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
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
              {produtos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'todos'
                    ? 'Nenhum produto encontrado com os filtros aplicados'
                    : 'Nenhum produto cadastrado'
                  }
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {produto.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produto.codigo_barras}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getGrupoName(produto.grupo_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      produto.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {produto.status === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {canView('produtos') && (
                      <Button
                        variant="ghost"
                            size="xs"
                        onClick={() => handleViewProduto(produto)}
                            title="Visualizar"
                            className="text-green-600 hover:text-green-800"
                      >
                            <FaEye className="w-4 h-4" />
                      </Button>
                        )}
                      {canEdit('produtos') && (
                        <Button
                          variant="ghost"
                            size="xs"
                          onClick={() => handleEditProduto(produto)}
                            title="Editar"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <FaEdit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete('produtos') && (
                        <Button
                          variant="ghost"
                            size="xs"
                          onClick={() => handleDeleteProduto(produto.id)}
                            title="Excluir"
                          className="text-red-600 hover:text-red-800"
                        >
                            <FaTrash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    </td>
                  </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Modal de Produto */}
      <ProdutoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProduto}
        produto={editingProduto}
        isViewMode={viewMode}
        grupos={grupos}
        unidades={unidades}
        onPrint={handlePrintProduto}
      />

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal isOpen={showAuditModal} onClose={handleCloseAuditModal} size="full">
          <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Relatório de Auditoria - Produtos
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

export default Produtos; 