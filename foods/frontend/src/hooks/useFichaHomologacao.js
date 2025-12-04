/**
 * Hook customizado para Ficha Homologação
 * Gerencia estado e operações relacionadas a fichas de homologação
 */

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import toast from 'react-hot-toast';
import fichaHomologacaoService from '../services/fichaHomologacao';
import api from '../services/api';
import PdfTemplatesService from '../services/pdfTemplatesService';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';
import FichaHomologacaoPrint from '../components/ficha-homologacao/FichaHomologacaoPrint';

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
        // Sempre mostrar modal de seleção se houver templates
          setTemplatesDisponiveis(templatesResponse.data);
          setPendingPrintIds(ids);
          setShowTemplateSelectModal(true);
        } else {
        // Se não houver templates, mostrar modal com opção de usar impressão padrão
        setTemplatesDisponiveis([]);
        setPendingPrintIds(ids);
        setShowTemplateSelectModal(true);
      }
    } catch (error) {
      // Em caso de erro, mostrar modal mesmo assim
      setTemplatesDisponiveis([]);
      setPendingPrintIds(ids);
      setShowTemplateSelectModal(true);
    }
  }, []);

  /**
   * Imprimir usando template específico ou componente React padrão
   */
  const imprimirComTemplate = useCallback(async (ids, templateId) => {
    setLoadingPrint(true);
    try {
      // Se templateId for null, usar componente React padrão
      if (templateId === null || templateId === undefined) {
      for (const id of ids) {
          const response = await fichaHomologacaoService.buscarPorId(id);
      if (response && response.success && response.data) {
        const ficha = response.data;
        
        // Criar container para impressão na mesma página
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container-ficha-homologacao';
        printContainer.style.cssText = `
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 210mm;
          min-height: 297mm;
          background: white;
          z-index: 9999;
        `;
        document.body.appendChild(printContainer);
        
        // Criar estilo para esconder o resto da página durante impressão
        const printStyle = document.createElement('style');
        printStyle.id = 'print-style-ficha-homologacao';
        printStyle.textContent = `
          @media print {
            @page {
              size: A4;
              margin: 0mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
            }
            body > *:not(#print-container-ficha-homologacao) {
              display: none !important;
              visibility: hidden !important;
            }
            header, nav, footer, .navbar, .sidebar, .menu, button, .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            #print-container-ficha-homologacao {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 210mm !important;
              margin: 0 !important;
              padding: 10mm !important;
              box-sizing: border-box !important;
              background: white !important;
            }
          }
        `;
        document.head.appendChild(printStyle);
        
        // Renderizar componente
        const root = ReactDOM.createRoot(printContainer);
        root.render(React.createElement(FichaHomologacaoPrint, { ficha }));
        
        // Aguardar renderização e carregamento das imagens antes de imprimir
        const waitForImages = () => {
          const images = printContainer.querySelectorAll('img');
          if (images.length === 0) {
            // Se não houver imagens, imprimir imediatamente
            setTimeout(() => window.print(), 200);
            return;
          }
          
          let loadedCount = 0;
          const totalImages = images.length;
          
          const checkAllLoaded = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              // Todas as imagens carregadas, aguardar um pouco mais e imprimir
              setTimeout(() => window.print(), 300);
            }
          };
          
          images.forEach((img) => {
            if (img.complete) {
              checkAllLoaded();
            } else {
              img.onload = checkAllLoaded;
              img.onerror = checkAllLoaded; // Continuar mesmo se houver erro
            }
          });
          
          // Timeout de segurança: imprimir após 3 segundos mesmo se algumas imagens não carregarem
          setTimeout(() => {
            if (loadedCount < totalImages) {
              window.print();
            }
          }, 3000);
        };
        
        // Aguardar um pouco para o componente renderizar
        setTimeout(() => {
          waitForImages();
          
          // Limpar após impressão
          const cleanup = () => {
            root.unmount();
            if (printContainer.parentNode) {
              printContainer.parentNode.removeChild(printContainer);
            }
            const styleEl = document.getElementById('print-style-ficha-homologacao');
            if (styleEl) {
              styleEl.parentNode.removeChild(styleEl);
            }
            window.removeEventListener('afterprint', cleanup);
          };
          
          window.addEventListener('afterprint', cleanup);
          
          // Fallback: limpar após 10 segundos se afterprint não disparar
          setTimeout(cleanup, 10000);
        }, 200);
          }
        }
        toast.success(`${ids.length} ficha(s) de homologação impressa(s) com sucesso!`);
      } else {
        // Se houver templateId, usar geração de PDF do backend
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
      }
    } catch (error) {
      toast.error('Erro ao gerar PDF das fichas de homologação');
    } finally {
      setLoadingPrint(false);
    }
  }, []);

  /**
   * Imprimir uma ficha individual - busca templates e mostra modal ou imprime direto
   */
  const handleImprimir = useCallback(async (item) => {
    try {
      const fichaId = typeof item === 'object' ? item.id : item;
      // Usar a função que busca templates e decide se mostra modal ou imprime direto
      await buscarTemplatesEImprimir([fichaId]);
    } catch (error) {
      toast.error('Erro ao imprimir ficha de homologação');
    }
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

