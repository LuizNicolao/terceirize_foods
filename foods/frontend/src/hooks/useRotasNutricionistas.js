import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import RotasNutricionistasService from '../services/rotasNutricionistas';
import { useAuditoria } from './common/useAuditoria';
import { useExport } from './common/useExport';
import { useBaseEntity } from './common/useBaseEntity';

export const useRotasNutricionistas = () => {
  // Hook de busca com debounce

  // Estados principais
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados de filtro
  const [statusFilter, setStatusFilter] = useState('');
  const [usuarioFilter, setUsuarioFilter] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');
  const [coordenadorFilter, setCoordenadorFilter] = useState('');

  // Estados de modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedRota, setSelectedRota] = useState(null);

  // Estados de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rotaToDelete, setRotaToDelete] = useState(null);

  // Estados para dados relacionados
  const [usuarios, setUsuarios] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_rotas: 0,
    rotas_ativas: 0,
    rotas_inativas: 0,
    total_usuarios: 0,
    total_supervisores: 0,
    total_coordenadores: 0,
    total_escolas: 0
  });

  // Hooks personalizados
  const { showAuditModal, openAuditModal, closeAuditModal } = useAuditoria();
  const { exportToXLSX, exportToPDF, exporting } = useExport();

  // Carregar rotas nutricionistas
  const loadRotas = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: itemsPerPage,
        search: debouncedSearch.debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        usuario_id: usuarioFilter || undefined,
        supervisor_id: supervisorFilter || undefined,
        coordenador_id: coordenadorFilter || undefined
      };

      const result = await RotasNutricionistasService.listar(params);

      if (result.success) {
        setRotas(result.data.rotas || []);
        
        if (result.data.pagination) {
          setCurrentPage(result.data.pagination.currentPage);
          setTotalPages(result.data.pagination.totalPages);
          setTotalItems(result.data.pagination.totalItems);
          setItemsPerPage(result.data.pagination.itemsPerPage);
        }

        // Calcular estatísticas
        const total = result.data.rotas?.length || 0;
        const ativas = result.data.rotas?.filter(r => r.status === 'ativo').length || 0;
        const inativas = result.data.rotas?.filter(r => r.status === 'inativo').length || 0;

        setEstatisticas(prev => ({
          ...prev,
          total_rotas: result.data.pagination?.totalItems || total,
          rotas_ativas: ativas,
          rotas_inativas: inativas
        }));
      } else {
        setError(result.error || 'Erro ao carregar rotas nutricionistas');
        toast.error(result.error || 'Erro ao carregar rotas nutricionistas');
      }
    } catch (error) {
      console.error('Erro ao carregar rotas nutricionistas:', error);
      setError('Erro de conexão');
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch.debouncedSearchTerm, statusFilter, usuarioFilter, supervisorFilter, coordenadorFilter]);

  // Carregar usuários, supervisores e coordenadores
  const loadUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true);
      
      // Buscar usuários por tipo e unidades escolares
      const [usuariosResult, unidadesResult] = await Promise.all([
        RotasNutricionistasService.buscarUsuarios(),
        RotasNutricionistasService.buscarUnidadesEscolares()
      ]);
      
      if (usuariosResult.success) {
        // Garantir que sempre sejam arrays
        const usuarios = Array.isArray(usuariosResult.data.usuarios) ? usuariosResult.data.usuarios : [];
        const supervisores = Array.isArray(usuariosResult.data.supervisores) ? usuariosResult.data.supervisores : usuarios;
        const coordenadores = Array.isArray(usuariosResult.data.coordenadores) ? usuariosResult.data.coordenadores : usuarios;
        
        setUsuarios(usuarios);
        setSupervisores(supervisores);
        setCoordenadores(coordenadores);

        setEstatisticas(prev => ({
          ...prev,
          total_usuarios: usuarios.length,
          total_supervisores: supervisores.length,
          total_coordenadores: coordenadores.length
        }));
      } else {
        // Em caso de erro, garantir arrays vazios
        setUsuarios([]);
        setSupervisores([]);
        setCoordenadores([]);
      }
      
      // Carregar unidades escolares
      if (unidadesResult.success) {
        setUnidadesEscolares(unidadesResult.data);
        setEstatisticas(prev => ({
          ...prev,
          total_escolas: unidadesResult.data.length
        }));
      } else {
        setUnidadesEscolares([]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsuarios([]);
      setSupervisores([]);
      setCoordenadores([]);
      setUnidadesEscolares([]);
    } finally {
      setLoadingUsuarios(false);
    }
  }, []);

  // Filtrar usuários por filial
  const filtrarUsuariosPorFilial = useCallback(async (tipo, filialId) => {
    if (!filialId) return [];
    
    try {
      const result = await RotasNutricionistasService.buscarUsuariosPorTipoEFilial(tipo, filialId);
      return result.success ? result.data : [];
    } catch (error) {
      console.error(`Erro ao filtrar usuários do tipo ${tipo} por filial:`, error);
      return [];
    }
  }, []);

  // Filtrar unidades escolares por filial
  const filtrarUnidadesEscolaresPorFilial = useCallback(async (filialId) => {
    if (!filialId) return [];
    
    try {
      const result = await RotasNutricionistasService.buscarUnidadesEscolaresPorFilial(filialId);
      return result.success ? result.data : [];
    } catch (error) {
      console.error(`Erro ao filtrar unidades escolares por filial:`, error);
      return [];
    }
  }, []);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadRotas();
    loadUsuarios();
  }, [loadRotas, loadUsuarios]);

  // Funções de modal
  const openCreateModal = () => {
    setSelectedRota(null);
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (rota) => {
    setSelectedRota(rota);
    setModalMode('edit');
    setShowModal(true);
  };

  const openViewModal = (rota) => {
    setSelectedRota(rota);
    setModalMode('view');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRota(null);
    setModalMode('create');
  };

  // Função para salvar rota
  const handleSave = async (data) => {
    try {
      setSaving(true);

      let result;
      if (modalMode === 'create') {
        result = await RotasNutricionistasService.criar(data);
        if (result.success) {
          toast.success('Rota nutricionista criada com sucesso!');
        }
      } else if (modalMode === 'edit') {
        result = await RotasNutricionistasService.atualizar(selectedRota.id, data);
        if (result.success) {
          toast.success('Rota nutricionista atualizada com sucesso!');
        }
      }

      if (result.success) {
        closeModal();
        await loadRotas();
      } else {
        toast.error(result.error || 'Erro ao salvar rota nutricionista');
      }
    } catch (error) {
      console.error('Erro ao salvar rota nutricionista:', error);
      toast.error('Erro ao salvar rota nutricionista');
    } finally {
      setSaving(false);
    }
  };

  // Funções de exclusão
  const openDeleteModal = (rota) => {
    setRotaToDelete(rota);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRotaToDelete(null);
  };

  const handleDelete = async () => {
    if (!rotaToDelete) return;

    try {
      setSaving(true);
      const result = await RotasNutricionistasService.excluir(rotaToDelete.id);

      if (result.success) {
        toast.success('Rota nutricionista excluída com sucesso!');
        closeDeleteModal();
        await loadRotas();
      } else {
        toast.error(result.error || 'Erro ao excluir rota nutricionista');
      }
    } catch (error) {
      console.error('Erro ao excluir rota nutricionista:', error);
      toast.error('Erro ao excluir rota nutricionista');
    } finally {
      setSaving(false);
    }
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadRotas(page);
  };

  const handleLimitChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    loadRotas(1);
  };

  // Funções de filtro
  const handleSearch = (term) => {
    debouncedSearch.updateSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleUsuarioFilter = (usuario) => {
    setUsuarioFilter(usuario);
    setCurrentPage(1);
  };

  const handleSupervisorFilter = (supervisor) => {
    setSupervisorFilter(supervisor);
    setCurrentPage(1);
  };

  const handleCoordenadorFilter = (coordenador) => {
    setCoordenadorFilter(coordenador);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    debouncedSearch.clearSearch();
    setStatusFilter('');
    setUsuarioFilter('');
    setSupervisorFilter('');
    setCoordenadorFilter('');
    setCurrentPage(1);
  };

  // Funções de exportação
  const handleExportXLSX = async () => {
    try {
      const params = {
        search: debouncedSearch.debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        usuario_id: usuarioFilter || undefined,
        supervisor_id: supervisorFilter || undefined,
        coordenador_id: coordenadorFilter || undefined
      };

      await exportToXLSX(() => RotasNutricionistasService.exportarXLSX(params), 'rotas-nutricionistas');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar para Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = {
        search: debouncedSearch.debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        usuario_id: usuarioFilter || undefined,
        supervisor_id: supervisorFilter || undefined,
        coordenador_id: coordenadorFilter || undefined
      };

      await exportToPDF(() => RotasNutricionistasService.exportarPDF(params), 'rotas-nutricionistas');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar para PDF');
    }
  };

  return {
    // Estados principais
    rotas,
    loading,
    saving,
    error,

    // Estados de paginação
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    // Estados de filtro
    searchTerm: debouncedSearch.searchTerm,
    isSearching: debouncedSearch.isSearching,
    statusFilter,
    usuarioFilter,
    supervisorFilter,
    coordenadorFilter,

    // Estados de modal
    showModal,
    modalMode,
    selectedRota,

    // Estados de confirmação
    showDeleteModal,
    rotaToDelete,

    // Estados para dados relacionados
    usuarios,
    supervisores,
    coordenadores,
    unidadesEscolares,
    loadingUsuarios,

    // Estados de estatísticas
    estatisticas,

    // Estados de auditoria
    showAuditModal,

    // Estados de exportação
    exporting,

    // Funções principais
    loadRotas,
    loadUsuarios,

    // Funções de modal
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    handleSave,

    // Funções de exclusão
    openDeleteModal,
    closeDeleteModal,
    handleDelete,

    // Funções de paginação
    handlePageChange,
    handleLimitChange,

    // Funções de filtro
    handleSearch,
    setSearchTerm: debouncedSearch.updateSearchTerm,
    clearSearch: debouncedSearch.clearSearch,
    handleStatusFilter,
    handleUsuarioFilter,
    handleSupervisorFilter,
    handleCoordenadorFilter,
    clearFilters,

    // Funções de exportação
    handleExportXLSX,
    handleExportPDF,

    // Funções de auditoria
    openAuditModal,
    closeAuditModal,

    // Filtros inteligentes
    filtrarUsuariosPorFilial,
    filtrarUnidadesEscolaresPorFilial
  };
};
