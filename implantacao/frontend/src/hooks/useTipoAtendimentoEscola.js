import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import TipoAtendimentoEscolaService from '../services/tipoAtendimentoEscolaService';
import escolasService from '../services/escolasService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook customizado para Tipo de Atendimento por Escola
 * Segue padrão de excelência do sistema
 */
export const useTipoAtendimentoEscola = () => {
  const { user } = useAuth();
  const [vinculos, setVinculos] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [escolaFilter, setEscolaFilter] = useState('');
  const [tipoAtendimentoFilter, setTipoAtendimentoFilter] = useState('');
  const [ativoFilter, setAtivoFilter] = useState('todos');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Tipos de atendimento disponíveis
  const tiposAtendimento = [
    { value: 'lanche_manha', label: '🌅 Lanche da Manhã', icon: '🌅' },
    { value: 'almoco', label: '🍽️ Almoço', icon: '🍽️' },
    { value: 'lanche_tarde', label: '🌆 Lanche da Tarde', icon: '🌆' },
    { value: 'parcial_manha', label: '🥗 Parcial Manhã', icon: '🥗' },
    { value: 'eja', label: '🌙 EJA', icon: '🌙' },
    { value: 'parcial_tarde', label: '🌆 Parcial Tarde', icon: '🌆' }
  ];

  /**
   * Carregar escolas disponíveis
   */
  const carregarEscolas = useCallback(async () => {
    try {
      const response = await escolasService.listar({}, user);
      if (response.success) {
        setEscolas(response.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar escolas:', err);
    }
  }, [user]);

  /**
   * Carregar vínculos
   */
  const carregarVinculos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filtros = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        escola_id: escolaFilter,
        tipo_atendimento: tipoAtendimentoFilter,
        ativo: ativoFilter === 'todos' ? undefined : (ativoFilter === 'ativo' ? 1 : 0)
      };

      const result = await TipoAtendimentoEscolaService.listar(filtros);
      if (result.success) {
        setVinculos(result.data || []);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.totalItems);
        }
      } else {
        setError(result.error);
        toast.error(result.error || 'Erro ao carregar vínculos');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar vínculos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, escolaFilter, tipoAtendimentoFilter, ativoFilter]);

  /**
   * Criar novo vínculo (ou múltiplos vínculos)
   */
  const criar = useCallback(async (dados) => {
    try {
      // Se recebeu array de vínculos (novo formato do modal matriz)
      if (dados.vinculos && Array.isArray(dados.vinculos) && dados.vinculos.length > 0) {
        const vinculos = dados.vinculos;
        let sucessos = 0;
        let erros = 0;
        const errosDetalhes = [];

        // Criar cada vínculo
        for (const vinculo of vinculos) {
          try {
            const result = await TipoAtendimentoEscolaService.criar(vinculo);
            if (result.success) {
              sucessos++;
            } else {
              erros++;
              errosDetalhes.push(`Escola ${vinculo.escola_id} - ${vinculo.tipo_atendimento}: ${result.error || 'Erro desconhecido'}`);
            }
          } catch (err) {
            erros++;
            const errorMessage = err.response?.data?.message || 'Erro ao criar vínculo';
            errosDetalhes.push(`Escola ${vinculo.escola_id} - ${vinculo.tipo_atendimento}: ${errorMessage}`);
          }
        }

        // Mensagem consolidada
        if (sucessos > 0 && erros === 0) {
          toast.success(`${sucessos} vínculo(s) criado(s) com sucesso!`);
        } else if (sucessos > 0 && erros > 0) {
          toast.success(`${sucessos} vínculo(s) criado(s) com sucesso. ${erros} erro(s).`);
          console.error('Erros ao criar vínculos:', errosDetalhes);
        } else {
          toast.error(`Erro ao criar vínculos: ${errosDetalhes.join('; ')}`);
        }

        await carregarVinculos();
        setShowModal(false);
        return { success: sucessos > 0, data: { sucessos, erros } };
      }
      // Se recebeu array de tipos (formato antigo)
      else if (dados.tipos_atendimento && Array.isArray(dados.tipos_atendimento) && dados.tipos_atendimento.length > 0) {
        const tipos = dados.tipos_atendimento;
        let sucessos = 0;
        let erros = 0;
        const errosDetalhes = [];

        // Criar cada vínculo
        for (const tipo of tipos) {
          try {
            const result = await TipoAtendimentoEscolaService.criar({
              escola_id: dados.escola_id,
              tipo_atendimento: tipo,
              ativo: dados.ativo !== undefined ? dados.ativo : true
            });
            if (result.success) {
              sucessos++;
            } else {
              erros++;
              errosDetalhes.push(`${tipo}: ${result.error || 'Erro desconhecido'}`);
            }
          } catch (err) {
            erros++;
            const errorMessage = err.response?.data?.message || 'Erro ao criar vínculo';
            errosDetalhes.push(`${tipo}: ${errorMessage}`);
          }
        }

        // Mensagem consolidada
        if (sucessos > 0 && erros === 0) {
          toast.success(`${sucessos} vínculo(s) criado(s) com sucesso!`);
        } else if (sucessos > 0 && erros > 0) {
          toast.success(`${sucessos} vínculo(s) criado(s) com sucesso. ${erros} erro(s).`);
          console.error('Erros ao criar vínculos:', errosDetalhes);
        } else {
          toast.error(`Erro ao criar vínculos: ${errosDetalhes.join('; ')}`);
        }

        await carregarVinculos();
        setShowModal(false);
        return { success: sucessos > 0, data: { sucessos, erros } };
      } else {
        // Formato antigo (um único vínculo)
        const result = await TipoAtendimentoEscolaService.criar(dados);
        if (result.success) {
          toast.success('Vínculo criado com sucesso!');
          await carregarVinculos();
          setShowModal(false);
          return { success: true, data: result.data };
        } else {
          toast.error(result.error || 'Erro ao criar vínculo');
          return { success: false, error: result.error };
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar vínculo';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [carregarVinculos]);

  /**
   * Atualizar vínculo
   */
  const atualizar = useCallback(async (id, dados) => {
    try {
      const result = await TipoAtendimentoEscolaService.atualizar(id, dados);
      if (result.success) {
        toast.success('Vínculo atualizado com sucesso!');
        await carregarVinculos();
        setShowModal(false);
        setEditingItem(null);
        return { success: true, data: result.data };
      } else {
        toast.error(result.error || 'Erro ao atualizar vínculo');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar vínculo';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [carregarVinculos]);

  /**
   * Deletar vínculo
   */
  const deletar = useCallback(async (id) => {
    try {
      const result = await TipoAtendimentoEscolaService.deletar(id);
      if (result.success) {
        toast.success('Vínculo deletado com sucesso!');
        await carregarVinculos();
        setShowDeleteConfirmModal(false);
        setItemToDelete(null);
        return { success: true };
      } else {
        toast.error(result.error || 'Erro ao deletar vínculo');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao deletar vínculo';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [carregarVinculos]);

  /**
   * Buscar tipos de atendimento por escola
   */
  const buscarPorEscola = useCallback(async (escola_id) => {
    try {
      const result = await TipoAtendimentoEscolaService.buscarPorEscola(escola_id);
      if (result.success) {
        return result.data || [];
      }
      return [];
    } catch (err) {
      console.error('Erro ao buscar tipos de atendimento por escola:', err);
      return [];
    }
  }, []);

  /**
   * Formatar tipo de atendimento para exibição
   */
  const formatarTipoAtendimento = useCallback((tipo) => {
    const tipoObj = tiposAtendimento.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }, [tiposAtendimento]);

  /**
   * Handlers de UI
   */
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setViewMode(false);
    setShowModal(true);
  }, []);

  const handleView = useCallback((item) => {
    setEditingItem(item);
    setViewMode(true);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setViewMode(false);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setViewMode(false);
  }, []);

  const handleDelete = useCallback((item) => {
    setItemToDelete(item);
    setShowDeleteConfirmModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (itemToDelete) {
      await deletar(itemToDelete.id);
    }
  }, [itemToDelete, deletar]);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    carregarEscolas();
  }, [carregarEscolas]);

  useEffect(() => {
    carregarVinculos();
  }, [carregarVinculos]);

  return {
    // Estados
    vinculos,
    escolas,
    loading,
    error,
    showModal,
    viewMode,
    editingItem,
    showDeleteConfirmModal,
    itemToDelete,
    searchTerm,
    escolaFilter,
    tipoAtendimentoFilter,
    ativoFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    tiposAtendimento,

    // Ações
    carregarVinculos,
    criar,
    atualizar,
    deletar,
    buscarPorEscola,
    formatarTipoAtendimento,
    handleAdd,
    handleView,
    handleEdit,
    handleCloseModal,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setEscolaFilter,
    setTipoAtendimentoFilter,
    setAtivoFilter
  };
};

