import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import ChamadosService from '../services/chamados';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useChamados = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('chamados', ChamadosService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para chamados
  const customFilters = useFilters({});

  // Hook de ordenação híbrida
  const {
    sortedData: chamadosOrdenados,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    defaultField: null,
    defaultDirection: null,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Estado de view atual
  const [currentView, setCurrentView] = useState('meus'); // 'meus', 'atribuidos', 'sem_responsavel', 'todos'
  
  // Estados de filtros específicos
  const [sistemaFilter, setSistemaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState('');
  const [criadorFilter, setCriadorFilter] = useState('');
  const [dataInicioFilter, setDataInicioFilter] = useState('');
  const [dataFimFilter, setDataFimFilter] = useState('');

  // Estados de estatísticas específicas dos chamados
  const [estatisticasChamados, setEstatisticasChamados] = useState({
    total_chamados: 0,
    chamados_abertos: 0,
    chamados_em_andamento: 0,
    chamados_concluidos: 0
  });

  /**
   * Calcula estatísticas específicas dos chamados
   */
  const calculateEstatisticas = useCallback((chamados) => {
    if (!chamados || chamados.length === 0) {
      setEstatisticasChamados({
        total_chamados: 0,
        chamados_abertos: 0,
        chamados_em_andamento: 0,
        chamados_concluidos: 0
      });
      return;
    }

    const total = chamados.length;
    const abertos = chamados.filter(c => c.status === 'aberto').length;
    const emAndamento = chamados.filter(c => 
      ['em_analise', 'em_desenvolvimento', 'em_teste'].includes(c.status)
    ).length;
    const concluidos = chamados.filter(c => c.status === 'concluido').length;

    setEstatisticasChamados({
      total_chamados: total,
      chamados_abertos: abertos,
      chamados_em_andamento: emAndamento,
      chamados_concluidos: concluidos
    });
  }, []);

  // Carregar dados quando filtros ou view mudarem
  useEffect(() => {
    const params = {
      search: baseEntity.searchTerm || undefined,
      sistema: sistemaFilter || undefined,
      tipo: tipoFilter || undefined,
      status: statusFilter || undefined,
      prioridade: prioridadeFilter || undefined,
      responsavel_id: responsavelFilter || undefined,
      criador_id: criadorFilter || undefined,
      data_inicio: dataInicioFilter || undefined,
      data_fim: dataFimFilter || undefined,
      view_mode: currentView === 'todos' ? 'todos' : undefined,
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage
    };

    // Aplicar filtros específicos da view
    if (currentView === 'atribuidos') {
      // View "atribuidos" - o backend filtra automaticamente pelo usuario_responsavel_id
      params.view_mode = 'atribuidos';
    } else if (currentView === 'sem_responsavel') {
      params.responsavel_id = 'null'; // Especial: sem responsável
      params.status = 'aberto'; // Apenas abertos
    } else if (currentView === 'todos') {
      params.view_mode = 'todos'; // Admin pode ver todos
    }
    // View "meus" - o backend já filtra automaticamente baseado no tipo
    
    baseEntity.loadData(params);
    // Nota: baseEntity.loadData removido intencionalmente das dependências para evitar loop infinito
  }, [
    baseEntity.searchTerm,
    sistemaFilter,
    tipoFilter,
    statusFilter,
    prioridadeFilter,
    responsavelFilter,
    criadorFilter,
    dataInicioFilter,
    dataFimFilter,
    currentView,
    baseEntity.currentPage,
    baseEntity.itemsPerPage
  ]);

  // Função para recarregar dados manualmente
  const loadChamadosData = useCallback(() => {
    const params = {
      search: baseEntity.searchTerm || undefined,
      sistema: sistemaFilter || undefined,
      tipo: tipoFilter || undefined,
      status: statusFilter || undefined,
      prioridade: prioridadeFilter || undefined,
      responsavel_id: responsavelFilter || undefined,
      criador_id: criadorFilter || undefined,
      data_inicio: dataInicioFilter || undefined,
      data_fim: dataFimFilter || undefined,
      view_mode: currentView === 'todos' ? 'todos' : undefined,
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage
    };

    // Aplicar filtros específicos da view
    if (currentView === 'atribuidos') {
      params.view_mode = 'atribuidos';
    } else if (currentView === 'sem_responsavel') {
      params.responsavel_id = 'null';
      params.status = 'aberto';
    } else if (currentView === 'todos') {
      params.view_mode = 'todos';
    }

    baseEntity.loadData(params);
    // Nota: baseEntity.loadData removido intencionalmente das dependências para evitar loop infinito
  }, [
    baseEntity.searchTerm,
    sistemaFilter,
    tipoFilter,
    statusFilter,
    prioridadeFilter,
    responsavelFilter,
    criadorFilter,
    dataInicioFilter,
    dataFimFilter,
    currentView,
    baseEntity.currentPage,
    baseEntity.itemsPerPage
  ]);

  // Calcular estatísticas quando dados mudarem
  useEffect(() => {
    calculateEstatisticas(baseEntity.items);
    // calculateEstatisticas removido intencionalmente das dependências para evitar loop
  }, [baseEntity.items]);

  /**
   * Submit customizado para chamados
   */
  const onSubmitCustom = useCallback(async (formData, arquivosParaUpload = [], arquivosCorrecaoParaUpload = []) => {
    try {
      let result;
      let chamadoId;
      
      if (baseEntity.editingItem) {
        chamadoId = baseEntity.editingItem.id;
        result = await ChamadosService.atualizar(chamadoId, formData);
        
        // Se atualização for bem-sucedida e houver arquivos de problema, fazer upload
        if (result.success && arquivosParaUpload.length > 0) {
          for (const arquivo of arquivosParaUpload) {
            try {
              const uploadResult = await ChamadosService.uploadAnexo(chamadoId, arquivo, 'problema');
              if (!uploadResult.success) {
                console.error('Erro ao fazer upload do arquivo:', arquivo.name, uploadResult.message);
                toast.error(`Erro ao enviar arquivo ${arquivo.name}`);
              }
            } catch (uploadError) {
              console.error('Erro ao fazer upload:', uploadError);
              toast.error(`Erro ao enviar arquivo ${arquivo.name}`);
            }
          }
        }
        
        // Se atualização for bem-sucedida e houver arquivos de correção, fazer upload
        if (result.success && arquivosCorrecaoParaUpload.length > 0) {
          for (const arquivo of arquivosCorrecaoParaUpload) {
            try {
              const uploadResult = await ChamadosService.uploadAnexo(chamadoId, arquivo, 'correcao');
              if (!uploadResult.success) {
                console.error('Erro ao fazer upload do arquivo de correção:', arquivo.name, uploadResult.message);
                toast.error(`Erro ao enviar arquivo de correção ${arquivo.name}`);
              }
            } catch (uploadError) {
              console.error('Erro ao fazer upload de correção:', uploadError);
              toast.error(`Erro ao enviar arquivo de correção ${arquivo.name}`);
            }
          }
        }
      } else {
        result = await ChamadosService.criar(formData);
        
        // Se for um novo chamado e houver arquivos, fazer upload após criar
        if (result.success && result.data?.id && arquivosParaUpload.length > 0) {
          chamadoId = result.data.id;
          
          // Fazer upload de cada arquivo (sempre problema para novos chamados)
          for (const arquivo of arquivosParaUpload) {
            try {
              const uploadResult = await ChamadosService.uploadAnexo(chamadoId, arquivo, 'problema');
              if (!uploadResult.success) {
                console.error('Erro ao fazer upload do arquivo:', arquivo.name, uploadResult.message);
                toast.error(`Erro ao enviar arquivo ${arquivo.name}`);
              }
            } catch (uploadError) {
              console.error('Erro ao fazer upload:', uploadError);
              toast.error(`Erro ao enviar arquivo ${arquivo.name}`);
            }
          }
        }
      }

      if (result.success) {
        toast.success(result.message || 'Chamado salvo com sucesso!');
        baseEntity.handleCloseModal();
        // Recarregar dados
        const params = {
          search: baseEntity.searchTerm || undefined,
          sistema: sistemaFilter || undefined,
          tipo: tipoFilter || undefined,
          status: statusFilter || undefined,
          prioridade: prioridadeFilter || undefined,
          responsavel_id: responsavelFilter || undefined,
          criador_id: criadorFilter || undefined,
          data_inicio: dataInicioFilter || undefined,
          data_fim: dataFimFilter || undefined,
          page: baseEntity.currentPage,
          limit: baseEntity.itemsPerPage
        };
        baseEntity.loadData(params);
      } else {
        if (result.validationErrors) {
          baseEntity.validationErrors = result.validationErrors;
          baseEntity.showValidationModal = true;
        } else {
          toast.error(result.message || 'Erro ao salvar chamado');
        }
      }
    } catch (error) {
      toast.error('Erro ao salvar chamado');
      console.error(error);
    }
  }, [baseEntity.editingItem, baseEntity.searchTerm, baseEntity.currentPage, baseEntity.itemsPerPage, sistemaFilter, tipoFilter, statusFilter, prioridadeFilter]);

  /**
   * Visualizar chamado customizado
   */
  const handleViewCustom = useCallback(async (chamado) => {
    try {
      const result = await ChamadosService.buscarPorId(chamado.id);
      if (result.success) {
        baseEntity.handleView(result.data);
      } else {
        toast.error(result.error || 'Erro ao buscar chamado');
      }
    } catch (error) {
      toast.error('Erro ao buscar chamado');
      console.error(error);
    }
  }, [baseEntity.handleView]);

  /**
   * Editar chamado customizado
   */
  const handleEditCustom = useCallback(async (chamado) => {
    try {
      const result = await ChamadosService.buscarPorId(chamado.id);
      if (result.success) {
        baseEntity.handleEdit(result.data);
      } else {
        if (result.unauthorized) {
          toast.error(result.error || 'Sessão expirada. Por favor, faça login novamente.');
          // Não redirecionar automaticamente, deixar o usuário decidir
        } else {
          toast.error(result.error || 'Erro ao buscar chamado');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar chamado:', error);
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
      } else {
        toast.error('Erro ao buscar chamado');
      }
    }
  }, [baseEntity.handleEdit]);

  /**
   * Excluir chamado customizado
   */
  const handleDeleteCustom = useCallback(async () => {
    if (!baseEntity.itemToDelete) return;

    try {
      const result = await ChamadosService.excluir(baseEntity.itemToDelete.id);
      if (result.success) {
        toast.success(result.message || 'Chamado excluído com sucesso!');
        baseEntity.handleCloseDeleteModal();
        // Recarregar dados
        const params = {
          search: baseEntity.searchTerm || undefined,
          sistema: sistemaFilter || undefined,
          tipo: tipoFilter || undefined,
          status: statusFilter || undefined,
          prioridade: prioridadeFilter || undefined,
          responsavel_id: responsavelFilter || undefined,
          criador_id: criadorFilter || undefined,
          data_inicio: dataInicioFilter || undefined,
          data_fim: dataFimFilter || undefined,
          page: baseEntity.currentPage,
          limit: baseEntity.itemsPerPage
        };
        baseEntity.loadData(params);
      } else {
        toast.error(result.error || 'Erro ao excluir chamado');
      }
    } catch (error) {
      toast.error('Erro ao excluir chamado');
      console.error(error);
    }
  }, [baseEntity.itemToDelete, baseEntity.searchTerm, baseEntity.currentPage, baseEntity.itemsPerPage, sistemaFilter, tipoFilter, statusFilter, prioridadeFilter, baseEntity.handleCloseDeleteModal, baseEntity.loadData]);

  /**
   * Funções auxiliares para formatação
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      'aberto': 'Aberto',
      'em_analise': 'Em Análise',
      'em_desenvolvimento': 'Em Desenvolvimento',
      'em_teste': 'Em Teste',
      'concluido': 'Concluído',
      'fechado': 'Fechado'
    };
    return labels[status] || status;
  }, []);

  const getTipoLabel = useCallback((tipo) => {
    const labels = {
      'bug': 'Bug',
      'erro': 'Erro',
      'melhoria': 'Melhoria',
      'feature': 'Feature'
    };
    return labels[tipo] || tipo;
  }, []);

  const getPrioridadeLabel = useCallback((prioridade) => {
    const labels = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'critica': 'Crítica'
    };
    return labels[prioridade] || prioridade;
  }, []);

  const getPrioridadeColor = useCallback((prioridade) => {
    const colors = {
      'baixa': 'bg-gray-100 text-gray-800',
      'media': 'bg-blue-100 text-blue-800',
      'alta': 'bg-orange-100 text-orange-800',
      'critica': 'bg-red-100 text-red-800'
    };
    return colors[prioridade] || 'bg-gray-100 text-gray-800';
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      'aberto': 'bg-yellow-100 text-yellow-800',
      'em_analise': 'bg-blue-100 text-blue-800',
      'em_desenvolvimento': 'bg-purple-100 text-purple-800',
      'em_teste': 'bg-indigo-100 text-indigo-800',
      'concluido': 'bg-green-100 text-green-800',
      'fechado': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  return {
    // Estados principais (usa dados ordenados se ordenação local)
    chamados: isSortingLocally ? chamadosOrdenados : baseEntity.items,
    loading: baseEntity.loading,
    
    estatisticas: estatisticasChamados,
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingChamado: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    chamadoToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estado de view
    currentView,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    sistemaFilter,
    tipoFilter,
    statusFilter,
    prioridadeFilter,
    responsavelFilter,
    criadorFilter,
    dataInicioFilter,
    dataFimFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Ações de modal (customizadas)
    handleAddChamado: baseEntity.handleAdd,
    handleViewChamado: handleViewCustom,
    handleEditChamado: handleEditCustom,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de view
    setCurrentView,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    setSistemaFilter,
    setTipoFilter,
    setStatusFilter,
    setPrioridadeFilter,
    setResponsavelFilter,
    setCriadorFilter,
    setDataInicioFilter,
    setDataFimFilter,
    clearFilters: () => {
      setSistemaFilter('');
      setTipoFilter('');
      setStatusFilter('');
      setPrioridadeFilter('');
      setResponsavelFilter('');
      setCriadorFilter('');
      setDataInicioFilter('');
      setDataFimFilter('');
      baseEntity.setSearchTerm('');
    },
    handleKeyPress: baseEntity.handleKeyPress,
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    
    // Ações de ordenação
    handleSort,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteChamado: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    loadChamadosData,
    
    // Ações de validação
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções auxiliares
    formatDate,
    getStatusLabel,
    getTipoLabel,
    getPrioridadeLabel,
    getPrioridadeColor,
    getStatusColor
  };
};
