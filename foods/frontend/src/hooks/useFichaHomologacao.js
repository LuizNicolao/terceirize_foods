/**
 * Hook customizado para Ficha Homologação
 * Gerencia estado e operações relacionadas a fichas de homologação
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import fichaHomologacaoService from '../services/fichaHomologacao';
import api from '../services/api';
import PdfTemplatesService from '../services/pdfTemplatesService';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useFichaHomologacao = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('ficha-homologacao', fichaHomologacaoService, {
    initialItemsPerPage: 20,
    initialFilters: { 
      tipoFilter: 'todos',
      nomeGenericoFilter: 'todos',
      fornecedorFilter: 'todos'
    },
    enableStats: true,
    enableDelete: true
  });

  // Hook de ordenação híbrida
  const {
    sortedData: fichasHomologacaoOrdenadas,
    sortField: localSortField,
    sortDirection: localSortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 50,
    totalItems: baseEntity.totalItems,
    onBackendSort: (field, direction) => {
      baseEntity.setSortField(field);
      baseEntity.setSortDirection(direction);
      baseEntity.loadData({ sortField: field, sortDirection: direction });
    }
  });
  
  const sortField = baseEntity.sortField || localSortField;
  const sortDirection = baseEntity.sortDirection || localSortDirection;

  const [loading, setLoading] = useState(false);
  
  // Dados auxiliares
  const [nomeGenericos, setNomeGenericos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // Estatísticas específicas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativas: 0,
    inativas: 0,
    novos_produtos: 0,
    reavaliacoes: 0
  });

  // Estados para impressão
  const [loadingPrint, setLoadingPrint] = useState(false);
  const [showTemplateSelectModal, setShowTemplateSelectModal] = useState(false);
  const [templatesDisponiveis, setTemplatesDisponiveis] = useState([]);
  const [pendingPrintIds, setPendingPrintIds] = useState([]);

  /**
   * Carrega dados auxiliares
   */
  const carregarDadosAuxiliares = useCallback(async () => {
    try {
      const [nomeGenericosRes, fornecedoresRes, usuariosRes] = await Promise.all([
        api.get('/produto-generico?limit=1000'),
        api.get('/fornecedores?limit=1000'),
        api.get('/usuarios?limit=1000')
      ]);

      const processData = (response) => {
        if (response.data?.data?.items) return response.data.data.items;
        if (response.data?.data) return response.data.data;
        return response.data || [];
      };

      setNomeGenericos(processData(nomeGenericosRes));
      setFornecedores(processData(fornecedoresRes));
      setUsuarios(processData(usuariosRes));
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
      toast.error('Erro ao carregar dados auxiliares');
    }
  }, []);

  /**
   * Submissão customizada
   */
  const onSubmit = useCallback(async (data) => {
    // Se for FormData, não fazer spread (isso converteria para objeto)
    if (data instanceof FormData) {
      // Para FormData, apenas limpar os campos de texto se necessário
      // Mas não podemos modificar FormData diretamente, então passamos como está
      // O backend vai processar os campos de texto corretamente
      await baseEntity.onSubmit(data);
    } else {
      // Se for objeto JSON, fazer a limpeza normal
      const cleanData = {
        ...data,
        composicao: data.composicao && data.composicao.trim() !== '' ? data.composicao.trim() : null,
        conclusao: data.conclusao && data.conclusao.trim() !== '' ? data.conclusao.trim() : null
      };
      
      await baseEntity.onSubmit(cleanData);
    }
  }, [baseEntity]);

  /**
   * Exclusão customizada
   */
  const handleDeleteFichaHomologacao = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
  }, [baseEntity]);

  // Carregar dados auxiliares na inicialização
  useEffect(() => {
    carregarDadosAuxiliares();
  }, [carregarDadosAuxiliares]);

  // Atualizar estatísticas quando os dados mudam
  useEffect(() => {
    if (baseEntity.estatisticas) {
      setEstatisticas({
        total: baseEntity.estatisticas.total || 0,
        ativas: baseEntity.estatisticas.ativas || 0,
        inativas: baseEntity.estatisticas.inativas || 0,
        novos_produtos: baseEntity.estatisticas.novos_produtos || 0,
        reavaliacoes: baseEntity.estatisticas.reavaliacoes || 0
      });
    }
  }, [baseEntity.estatisticas]);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    baseEntity.clearSearch();
    baseEntity.setStatusFilter('todos');
    baseEntity.updateFilter('tipoFilter', 'todos');
    baseEntity.updateFilter('nomeGenericoFilter', 'todos');
    baseEntity.updateFilter('fornecedorFilter', 'todos');
    baseEntity.handlePageChange(1);
  }, [baseEntity]);

  /**
   * Visualizar ficha de homologação
   */
  const handleViewFichaHomologacao = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await fichaHomologacaoService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar ficha de homologação');
      }
    } catch (error) {
      console.error('Erro ao buscar ficha de homologação:', error);
      toast.error('Erro ao carregar dados da ficha de homologação');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar ficha de homologação
   */
  const handleEditFichaHomologacao = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await fichaHomologacaoService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar ficha de homologação');
      }
    } catch (error) {
      console.error('Erro ao buscar ficha de homologação:', error);
      toast.error('Erro ao carregar dados da ficha de homologação');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Funções auxiliares de formatação
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }, []);

  const getStatusLabel = useCallback((status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  }, []);

  const getStatusColor = useCallback((status) => {
    return status === 'ativo' ? 'green' : 'gray';
  }, []);

  const getTipoLabel = useCallback((tipo) => {
    return tipo === 'NOVO_PRODUTO' ? 'Novo Produto' : 'Reavaliação';
  }, []);

  const getAvaliacaoLabel = useCallback((avaliacao) => {
    const labels = {
      'BOM': 'Bom',
      'REGULAR': 'Regular',
      'RUIM': 'Ruim'
    };
    return labels[avaliacao] || avaliacao;
  }, []);

  const getAvaliacaoColor = useCallback((avaliacao) => {
    const colors = {
      'BOM': 'green',
      'REGULAR': 'yellow',
      'RUIM': 'red'
    };
    return colors[avaliacao] || 'gray';
  }, []);

  /**
   * Buscar templates e decidir se mostra modal ou imprime direto
   */
  const buscarTemplatesEImprimir = useCallback(async (ids) => {
    try {
      // Buscar templates disponíveis para fichas de homologação
      const templatesResponse = await PdfTemplatesService.listarTemplatesPorTela('ficha-homologacao');
      
      if (templatesResponse.success && templatesResponse.data && templatesResponse.data.length > 0) {
        // Se houver múltiplos templates, mostrar modal de seleção
        if (templatesResponse.data.length > 1) {
          setTemplatesDisponiveis(templatesResponse.data);
          setPendingPrintIds(ids);
          setShowTemplateSelectModal(true);
        } else {
          // Se houver apenas um template, usar ele automaticamente
          const templateId = templatesResponse.data[0].id;
          await imprimirComTemplate(ids, templateId);
        }
      } else {
        // Se não houver templates, usar geração padrão (sem template_id)
        await imprimirComTemplate(ids, null);
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      // Em caso de erro, usar geração padrão
      await imprimirComTemplate(ids, null);
    }
  }, []);

  /**
   * Imprimir usando template específico
   */
  const imprimirComTemplate = useCallback(async (ids, templateId) => {
    setLoadingPrint(true);
    try {
      // Gerar PDF para cada ficha selecionada
      for (const id of ids) {
        const response = await fichaHomologacaoService.gerarPDF(id, templateId);
        if (response) {
          // Abrir PDF em nova aba
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          window.URL.revokeObjectURL(url);
        }
      }
      toast.success(`${ids.length} ficha(s) de homologação impressa(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao imprimir fichas de homologação:', error);
      toast.error('Erro ao gerar PDF das fichas de homologação');
    } finally {
      setLoadingPrint(false);
    }
  }, []);

  /**
   * Imprimir uma ficha individual
   */
  const handleImprimir = useCallback(async (id) => {
    await buscarTemplatesEImprimir([id]);
  }, [buscarTemplatesEImprimir]);

  /**
   * Selecionar template no modal
   */
  const handleSelecionarTemplate = useCallback(async (templateId) => {
    setShowTemplateSelectModal(false);
    await imprimirComTemplate(pendingPrintIds, templateId);
    setPendingPrintIds([]);
  }, [pendingPrintIds, imprimirComTemplate]);

  /**
   * Fechar modal de seleção de template
   */
  const handleCloseTemplateModal = useCallback(() => {
    setShowTemplateSelectModal(false);
    setPendingPrintIds([]);
  }, []);

  return {
    // Dados
    fichasHomologacao: fichasHomologacaoOrdenadas || baseEntity.items,
    loading: loading || baseEntity.loading,
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingFichaHomologacao: baseEntity.editingItem,
    showValidationModal: baseEntity.showValidationModal,
    validationErrors: baseEntity.validationErrors,
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    fichaHomologacaoToDelete: baseEntity.itemToDelete,
    
    // Dados auxiliares
    nomeGenericos,
    fornecedores,
    usuarios,
    
    // Filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: baseEntity.statusFilter,
    tipoFilter: baseEntity.filters?.tipoFilter || 'todos',
    nomeGenericoFilter: baseEntity.filters?.nomeGenericoFilter || 'todos',
    fornecedorFilter: baseEntity.filters?.fornecedorFilter || 'todos',
    
    // Paginação
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estatísticas
    estatisticas,
    
    // Funções
    onSubmit,
    handleDeleteFichaHomologacao,
    handleConfirmDelete: baseEntity.handleConfirmDelete,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    handleAddFichaHomologacao: baseEntity.handleAdd,
    handleViewFichaHomologacao,
    handleEditFichaHomologacao,
    handleCloseModal: baseEntity.handleCloseModal,
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    handlePageChange: baseEntity.handlePageChange,
    handleClearFilters,
    setSearchTerm: baseEntity.setSearchTerm,
    handleKeyPress: baseEntity.handleKeyPress,
    setStatusFilter: baseEntity.setStatusFilter,
    setTipoFilter: (value) => baseEntity.updateFilter('tipoFilter', value),
    setNomeGenericoFilter: (value) => baseEntity.updateFilter('nomeGenericoFilter', value),
    setFornecedorFilter: (value) => baseEntity.updateFilter('fornecedorFilter', value),
    setItemsPerPage: baseEntity.setItemsPerPage,
    
    // Formatação
    formatDate,
    getStatusLabel,
    getStatusColor,
    getTipoLabel,
    getAvaliacaoLabel,
    getAvaliacaoColor,
    
    // Ordenação
    sortField,
    sortDirection,
    handleSort,

    // Impressão
    handleImprimir,
    loadingPrint,
    showTemplateSelectModal,
    templatesDisponiveis,
    handleSelecionarTemplate,
    handleCloseTemplateModal
  };
};

