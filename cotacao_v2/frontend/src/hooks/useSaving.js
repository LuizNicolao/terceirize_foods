import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import savingService from '../services/saving';
import toast from 'react-hot-toast';

export const useSaving = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);
  const [total, setTotal] = useState(0);
  const [resumo, setResumo] = useState({});
  const [filtros, setFiltros] = useState({
    comprador: '',
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });
  const [compradores, setCompradores] = useState([]);

  const navigate = useNavigate();

  // Carregar dados de saving
  const loadDados = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        pagina,
        limite,
        ...filtros
      });

      const result = await savingService.getSavingData(params);
      
      if (result.success) {
        setDados(result.data.registros);
        setTotal(result.data.total);
        setResumo(result.data.resumo);
      } else {
        toast.error(result.message || 'Erro ao carregar dados');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [pagina, limite, filtros]);

  // Carregar compradores
  const loadCompradores = useCallback(async () => {
    try {
      const result = await savingService.getCompradores();
      
      if (result.success) {
        setCompradores(result.data.compradores);
      } else {
        console.error('Erro ao carregar compradores:', result.message);
      }
    } catch (error) {
      console.error('Erro ao carregar compradores:', error);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadDados();
    loadCompradores();
  }, [loadDados, loadCompradores]);

  // Aplicar filtros
  const aplicarFiltros = () => {
    setPagina(1);
    loadDados();
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      comprador: '',
      tipo: '',
      status: '',
      data_inicio: '',
      data_fim: ''
    });
    setPagina(1);
  };

  // Atualizar filtros
  const updateFiltros = (newFiltros) => {
    setFiltros(prev => ({ ...prev, ...newFiltros }));
  };

  // Navegar para detalhes
  const verDetalhes = (id) => {
    navigate(`/visualizar-saving/${id}`);
  };

  // Mudar página
  const handlePageChange = (newPage) => {
    setPagina(newPage);
  };

  // Exportar dados
  const exportarDados = async (formato = 'xlsx') => {
    try {
      const result = await savingService.exportarSaving(formato);
      
      if (result.success) {
        // Criar link para download
        const link = document.createElement('a');
        link.href = result.data.url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Exportação realizada com sucesso');
      } else {
        toast.error(result.message || 'Erro ao exportar dados');
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  return {
    // Estados
    dados,
    loading,
    pagina,
    limite,
    total,
    resumo,
    filtros,
    compradores,
    
    // Funções
    aplicarFiltros,
    limparFiltros,
    updateFiltros,
    verDetalhes,
    handlePageChange,
    exportarDados,
    loadDados
  };
};
