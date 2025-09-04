import { useState, useEffect, useCallback } from 'react';
import PatrimoniosService from '../services/patrimonios';
import FiliaisService from '../services/filiais';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const usePatrimonios = () => {
  const { user } = useAuth();
  
  // Estados principais
  const [patrimonios, setPatrimonios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPatrimonio, setSelectedPatrimonio] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [showMovimentacoesModal, setShowMovimentacoesModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'todos',
    escola_id: 'todos',
    produto_id: 'todos',
    data_inicio: '',
    data_fim: ''
  });

  // Estados de paginação
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    manutencao: 0,
    obsoletos: 0,
    escolas: 0
  });

  // Estados para criação/edição
  const [formData, setFormData] = useState({
    produto_id: '',
    numero_patrimonio: '',
    local_atual_id: '',
    status: 'ativo',
    data_aquisicao: '',
    observacoes: '',
    marca: '',
    fabricante: ''
  });

  // Estados para movimentação
  const [movimentacaoData, setMovimentacaoData] = useState({
    local_destino_id: '',
    tipo_local_destino: 'filial',
    responsavel_id: '',
    motivo: 'transferencia',
    observacoes: ''
  });

  // Estados para produtos equipamentos
  const [produtosEquipamentos, setProdutosEquipamentos] = useState([]);
  const [produtosLoading, setProdutosLoading] = useState(false);

  // Estados para movimentações
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [movimentacoesLoading, setMovimentacoesLoading] = useState(false);

  // Estados para filiais
  const [filiais, setFiliais] = useState([]);
  const [filiaisLoading, setFiliaisLoading] = useState(false);

  // Estados para erros de validação
  const [validationErrors, setValidationErrors] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Estados para modal de confirmação de exclusão
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [patrimonioToDelete, setPatrimonioToDelete] = useState(null);

  // Carregar filiais ativas
  const loadFiliais = useCallback(async () => {
    try {
      setFiliaisLoading(true);
      const result = await FiliaisService.buscarAtivas();
      
      if (result.success) {
        setFiliais(result.data);
      } else {
        console.error('Erro ao carregar filiais:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setFiliaisLoading(false);
    }
  }, []);

  // Carregar patrimônios
  const loadPatrimonios = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters,
        ...params
      };

      // Remover filtros vazios
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === 'todos' || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      // Se tiver localId, usar como filtro
      if (params.localId) {
        queryParams.local_atual_id = params.localId;
      }

      // Se tiver tipoLocal, usar como filtro
      if (params.tipoLocal) {
        queryParams.tipo_local = params.tipoLocal;
      }

      const result = await PatrimoniosService.listarPatrimonios(queryParams);
      
      if (result.success) {
        setPatrimonios(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || 0,
          pages: result.pagination?.pages || 0
        }));
      } else {
        console.error(result.error || 'Erro ao carregar patrimônios');
      }
    } catch (error) {
      console.error('Erro ao carregar patrimônios:', error);
      console.error('Erro ao carregar patrimônios');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filters]);

  // Carregar estatísticas
  const loadEstatisticas = useCallback(async () => {
    try {
      const result = await PatrimoniosService.listarPatrimonios({ limit: 1000 });
      
      if (result.success) {
        const patrimonios = result.data;
        
        const stats = {
          total: patrimonios.length,
          ativos: patrimonios.filter(p => p.status === 'ativo').length,
          manutencao: patrimonios.filter(p => p.status === 'manutencao').length,
          obsoletos: patrimonios.filter(p => p.status === 'obsoleto').length,
          escolas: new Set(patrimonios.map(p => p.escola_atual_id)).size
        };
        
        setEstatisticas(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  // Carregar produtos equipamentos
  const loadProdutosEquipamentos = useCallback(async (search = '') => {
    try {
      setProdutosLoading(true);
      
      const result = await PatrimoniosService.listarProdutosEquipamentos({ 
        search, 
        limit: 100 
      });
      
      if (result.success) {
        setProdutosEquipamentos(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos equipamentos:', error);
    } finally {
      setProdutosLoading(false);
    }
  }, []);

  // Carregar movimentações de um patrimônio
  const loadMovimentacoes = useCallback(async (patrimonioId) => {
    try {
      setMovimentacoesLoading(true);
      
      const result = await PatrimoniosService.listarMovimentacoesPatrimonio(patrimonioId);
      
      if (result.success) {
        setMovimentacoes(result.data);
      } else {
        console.error('Erro ao carregar movimentações:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setMovimentacoesLoading(false);
    }
  }, []);

  // Criar patrimônio
  const handleCreatePatrimonio = async () => {
    try {
      setSaving(true);
      
      const result = await PatrimoniosService.criarPatrimonio(formData);
      
      if (result.success) {
        setShowFormModal(false);
        resetFormData();
        loadPatrimonios();
        loadEstatisticas();
      } else {
        // Verificar se são erros de validação
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
          setShowValidationModal(true);
        } else {
          console.error(result.error || result.message);
        }
      }
    } catch (error) {
      console.error('Erro ao criar patrimônio:', error);
    } finally {
      setSaving(false);
    }
  };

  // Atualizar patrimônio
  const handleUpdatePatrimonio = async () => {
    try {
      setSaving(true);
      
      const result = await PatrimoniosService.atualizarPatrimonio(
        selectedPatrimonio.id, 
        formData
      );
      
      if (result.success) {
        setShowFormModal(false);
        resetFormData();
        loadPatrimonios();
        loadEstatisticas();
      } else {
        // Verificar se são erros de validação
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
          setShowValidationModal(true);
        } else {
          console.error(result.error || result.message);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar patrimônio:', error);
    } finally {
      setSaving(false);
    }
  };

  // Excluir patrimônio
  const handleDeletePatrimonio = async (id) => {
    try {
      const result = await PatrimoniosService.excluirPatrimonio(id);
      if (result.success) {
        toast.success('Patrimônio excluído com sucesso!');
        loadPatrimonios();
      } else {
        toast.error(result.error || 'Erro ao excluir patrimônio');
      }
    } catch (error) {
      console.error('Erro ao excluir patrimônio:', error);
      toast.error('Erro ao excluir patrimônio');
    }
  };

  // Abrir modal de confirmação de exclusão
  const openDeleteConfirmModal = (patrimonio) => {
    setPatrimonioToDelete(patrimonio);
    setShowDeleteConfirmModal(true);
  };

  // Fechar modal de confirmação de exclusão
  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setPatrimonioToDelete(null);
  };

  // Movimentar patrimônio
  const handleMovimentarPatrimonio = async () => {
    try {
      setSaving(true);
      
      const result = await PatrimoniosService.movimentarPatrimonio(
        selectedPatrimonio.id, 
        movimentacaoData
      );
      
      if (result.success) {
        setShowMovimentacaoModal(false);
        resetMovimentacaoData();
        loadPatrimonios();
        loadEstatisticas();
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao movimentar patrimônio:', error);
      console.error('Erro ao movimentar patrimônio');
    } finally {
      setSaving(false);
    }
  };

  // Funções de filtros
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'todos',
      escola_id: 'todos',
      produto_id: 'todos',
      data_inicio: '',
      data_fim: ''
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  // Funções de formulário
  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMovimentacaoDataChange = (field, value) => {
    setMovimentacaoData(prev => ({ ...prev, [field]: value }));
  };

  const resetFormData = () => {
    setFormData({
      produto_id: '',
      numero_patrimonio: '',
      local_atual_id: '',
      status: 'ativo',
      data_aquisicao: '',
      observacoes: '',
      marca: '',
      fabricante: ''
    });
  };

  const resetMovimentacaoData = () => {
    setMovimentacaoData({
      local_destino_id: '',
      tipo_local_destino: 'filial',
      responsavel_id: user ? user.id : '',
      motivo: 'transferencia',
      observacoes: ''
    });
  };

  // Funções de modal
  const openCreateModal = () => {
    resetFormData();
    setSelectedPatrimonio(null);
    setViewMode(false);
    setShowFormModal(true);
  };

  const openEditModal = (patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setViewMode(false);
    setFormData({
      produto_id: patrimonio.produto_id,
      numero_patrimonio: patrimonio.numero_patrimonio,
      local_atual_id: patrimonio.filial_atual_id || patrimonio.local_atual_id,
      status: patrimonio.status,
      data_aquisicao: patrimonio.data_aquisicao,
      observacoes: patrimonio.observacoes || '',
      marca: patrimonio.marca || '',
      fabricante: patrimonio.fabricante || ''
    });
    setShowFormModal(true);
  };

  const openViewModal = (patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setViewMode(true);
    // Preencher o formData com os dados do patrimônio para visualização
    setFormData({
      produto_id: patrimonio.produto_id,
      numero_patrimonio: patrimonio.numero_patrimonio,
      local_atual_id: patrimonio.filial_atual_id || patrimonio.local_atual_id,
      status: patrimonio.status,
      data_aquisicao: patrimonio.data_aquisicao,
      observacoes: patrimonio.observacoes || '',
      marca: patrimonio.marca || '',
      fabricante: patrimonio.fabricante || ''
    });
    // Carregar movimentações para a aba de histórico
    loadMovimentacoes(patrimonio.id);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setSelectedPatrimonio(null);
    setViewMode(false);
    resetFormData();
    // Limpar também as movimentações para não interferir em outros modais
    setMovimentacoes([]);
  };

  const openMovimentacaoModal = (patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    resetMovimentacaoData();
    setShowMovimentacaoModal(true);
  };

  const openMovimentacoesModal = (patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    loadMovimentacoes(patrimonio.id);
    setShowMovimentacoesModal(true);
  };

  // Fechar modal de validação
  const closeValidationModal = () => {
    setShowValidationModal(false);
    setValidationErrors(null);
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadPatrimonios();
  }, [loadPatrimonios]);

  useEffect(() => {
    loadEstatisticas();
  }, [loadEstatisticas]);

  useEffect(() => {
    loadFiliais();
  }, [loadFiliais]);

  return {
    // Estados principais
    patrimonios,
    loading,
    saving,
    selectedPatrimonio,
    showFormModal,
    showMovimentacaoModal,
    showMovimentacoesModal,
    viewMode,
    
    // Estados de filtros e busca
    searchTerm,
    filters,
    setSearchTerm,
    setFilters,
    
    // Estados de paginação
    currentPage: pagination.page,
    totalPages: pagination.pages,
    totalItems: pagination.total,
    itemsPerPage: pagination.limit,
    
    // Estados de estatísticas
    estatisticas,
    
    // Estados para criação/edição
    formData,
    setFormData,
    
    // Estados para movimentação
    movimentacaoData,
    setMovimentacaoData,
    
    // Estados para produtos equipamentos
    produtosEquipamentos,
    produtosLoading,
    
    // Estados para movimentações
    movimentacoes,
    movimentacoesLoading,
    
    // Estados para filiais
    filiais,
    filiaisLoading,
    
    // Estados para erros de validação
    validationErrors,
    showValidationModal,
    
    // Estados para modal de confirmação de exclusão
    showDeleteConfirmModal,
    patrimonioToDelete,
    
    // Funções
    loadPatrimonios,
    loadEstatisticas,
    loadProdutosEquipamentos,
    loadMovimentacoes,
    loadFiliais,
    handleCreatePatrimonio,
    handleUpdatePatrimonio,
    handleDeletePatrimonio,
    handleMovimentarPatrimonio,
    handleSearchChange,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleLimitChange,
    handleFormDataChange,
    handleMovimentacaoDataChange,
    openCreateModal,
    openEditModal,
    openViewModal,
    openMovimentacaoModal,
    openMovimentacoesModal,
    closeValidationModal,
    resetMovimentacaoData,
    resetFormData,
    handleCloseModal,
    openDeleteConfirmModal,
    closeDeleteConfirmModal,
    patrimonioToDelete,
    
    // Funções de estado que estavam faltando
    setShowFormModal,
    setShowMovimentacaoModal,
    setShowMovimentacoesModal,
    setSelectedPatrimonio
  };
};
