import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cotacoesService } from '../services/cotacoes';
import { useAuditoria } from './useAuditoria';
import { useExport } from './useExport';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ModalProdutosZerados from '../components/modals/ModalProdutosZerados';

export const useCotacoes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [compradorFilter, setCompradorFilter] = useState('todos');
  const [compradores, setCompradores] = useState([]);
  
  // Hook de auditoria
  const auditoria = useAuditoria('cotacoes');
  
  // Hook de exportação
  const { handleExportXLSX, handleExportPDF } = useExport({
    entityName: 'cotacoes',
    exportXLSXEndpoint: '/cotacoes/export/xlsx',
    exportPDFEndpoint: '/cotacoes/export/pdf'
  });

  const fetchCotacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await cotacoesService.getCotacoes();
      setCotacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      setError(error.message || 'Erro ao carregar cotações');
      toast.error('Erro ao carregar cotações');
      setCotacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompradores = async () => {
    try {
      // Só buscar compradores se for administrador
      if (user?.role === 'administrador') {
        const data = await cotacoesService.getCompradores();
        setCompradores(Array.isArray(data) ? data : []);
      } else {
        setCompradores([]);
      }
    } catch (error) {
      console.error('Erro ao buscar compradores:', error);
      setCompradores([]);
    }
  };

  const handleView = (cotacao) => {
    navigate(`/visualizar-cotacao/${cotacao.numero || cotacao.id}`);
  };

  const handleEdit = (cotacao) => {
    // Verificar se a cotação pode ser editada
    if (cotacao.status === 'pendente' || cotacao.status === 'renegociacao') {
      navigate(`/editar-cotacao/${cotacao.numero || cotacao.id}`);
    } else {
      // Se não pode ser editada, redirecionar para visualização
      toast.info(`Cotação com status "${cotacao.status}" não pode ser editada. Redirecionando para visualização.`);
      navigate(`/visualizar-cotacao/${cotacao.numero || cotacao.id}`);
    }
  };

  const handleCreate = () => {
    navigate('/nova-cotacao');
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cotacaoToDelete, setCotacaoToDelete] = useState(null);
  const [showModalProdutosZerados, setShowModalProdutosZerados] = useState(false);
  const [produtosZerados, setProdutosZerados] = useState([]);

  const handleDeleteClick = (cotacao) => {
    // Verificar se a cotação pode ser excluída
    if (cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao') {
      toast.error(`Cotação com status "${cotacao.status}" não pode ser excluída.`);
      return;
    }

    setCotacaoToDelete(cotacao);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cotacaoToDelete) return;

    try {
      const cotacaoId = cotacaoToDelete.numero || cotacaoToDelete.id;
      await cotacoesService.deleteCotacao(cotacaoId);
      await fetchCotacoes();
      toast.success('Cotação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cotação:', error);
      toast.error(error.message || 'Erro ao excluir cotação');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCotacaoToDelete(null);
  };

  const handleSendToSupervisor = async (cotacao) => {
    try {
      const cotacaoId = cotacao.numero || cotacao.id;
      await cotacoesService.sendToSupervisor(cotacaoId);
      await fetchCotacoes();
      toast.success('Cotação enviada para análise do supervisor com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar para supervisor:', error);
      
      // Verificar se é erro de produtos zerados
      if (error.response?.status === 400 && error.response?.data?.produtosZerados) {
        setProdutosZerados(error.response.data.produtosZerados);
        setShowModalProdutosZerados(true);
      } else if (error.response?.status === 400) {
        // Se é erro 400 mas não tem produtosZerados, mostrar mensagem genérica
        const errorMessage = error.response?.data?.message || 'Erro ao enviar para supervisor';
        toast.error(errorMessage);
      } else {
        toast.error(error.message || 'Erro ao enviar para supervisor');
      }
    }
  };

  const refetch = () => {
    fetchCotacoes();
  };

  useEffect(() => {
    fetchCotacoes();
    fetchCompradores();
  }, []);

  return {
    cotacoes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    compradorFilter,
    setCompradorFilter,
    compradores,
    handleView,
    handleEdit,
    handleCreate,
    handleDelete: handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    showDeleteModal,
    handleSendToSupervisor,
    refetch,
    handleExportXLSX,
    handleExportPDF,
    showModalProdutosZerados,
    setShowModalProdutosZerados,
    produtosZerados,
    ...auditoria
  };
};
