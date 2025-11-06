import { useState, useEffect, useCallback } from 'react';
import consultaStatusNecessidadeService from '../../services/consultaStatusNecessidade';
import { useSemanasAbastecimento } from '../useSemanasAbastecimento';
import { useSemanasConsumo } from '../useSemanasConsumo';
import { useUnidadesEscolaresConsulta } from '../useUnidadesEscolaresConsulta';
import useGruposConsulta from '../useGruposConsulta';
import { useProdutosPerCapita } from '../useProdutosPerCapita';
import toast from 'react-hot-toast';

export const useConsultaStatusNecessidade = () => {
  // Estados principais
  const [necessidades, setNecessidades] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    status: '',
    status_necessidade: '',
    status_substituicao: '',
    grupo: '',
    semana_abastecimento: '',
    semana_consumo: '',
    escola_id: '',
    produto_id: '',
    data_inicio: '',
    data_fim: ''
  });

  // Hooks para dados de filtros
  const { opcoes: opcoesSemanasAbastecimento, obterValorPadrao: obterSemanaAbastecimentoPadrao } = useSemanasAbastecimento();
  const { opcoes: opcoesSemanasConsumo, carregarPorSemanaAbastecimento } = useSemanasConsumo();
  const { unidadesEscolares, carregarUnidadesEscolares } = useUnidadesEscolaresConsulta();
  const { grupos, carregarGrupos } = useGruposConsulta();
  const { produtos, carregarProdutos } = useProdutosPerCapita();

  // Carregar dados iniciais
  useEffect(() => {
    carregarGrupos();
    carregarUnidadesEscolares();
  }, []);

  // Carregar necessidades quando filtros mudarem
  useEffect(() => {
    carregarNecessidades();
  }, [filtros, pagination.currentPage, pagination.itemsPerPage]);

  // Carregar estatísticas quando filtros mudarem
  useEffect(() => {
    carregarEstatisticas();
  }, [filtros]);

  // Carregar semana de consumo quando semana de abastecimento mudar
  useEffect(() => {
    if (filtros.semana_abastecimento) {
      // Auto-preencher semana de consumo se não estiver definida
      if (!filtros.semana_consumo) {
        const semanaConsumo = obterSemanaAbastecimentoPadrao(filtros.semana_abastecimento);
        if (semanaConsumo) {
          setFiltros(prev => ({ ...prev, semana_consumo: semanaConsumo }));
        }
      }
    }
  }, [filtros.semana_abastecimento, obterSemanaAbastecimentoPadrao]);

  // Carregar produtos quando grupo mudar
  useEffect(() => {
    if (filtros.grupo) {
      carregarProdutos({ grupo: filtros.grupo });
    } else {
      carregarProdutos();
    }
  }, [filtros.grupo, carregarProdutos]);

  /**
   * Carregar necessidades com filtros e paginação
   */
  const carregarNecessidades = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        ...filtros,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };

      const response = await consultaStatusNecessidadeService.listar(params);
      
      if (response.success) {
        setNecessidades(response.data || []);
        setPagination(response.pagination || pagination);
      } else {
        setError(response.message || 'Erro ao carregar necessidades');
        toast.error(response.message || 'Erro ao carregar necessidades');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar necessidades';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filtros, pagination.currentPage, pagination.itemsPerPage]);

  /**
   * Carregar estatísticas
   */
  const carregarEstatisticas = useCallback(async () => {
    try {
      const response = await consultaStatusNecessidadeService.obterEstatisticas(filtros);
      
      if (response.success) {
        setEstatisticas(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, [filtros]);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset para primeira página
  }, []);

  /**
   * Limpar filtros
   */
  const limparFiltros = useCallback(() => {
    setFiltros({
      status: '',
      status_necessidade: '',
      status_substituicao: '',
      grupo: '',
      semana_abastecimento: '',
      semana_consumo: '',
      escola_id: '',
      produto_id: '',
      data_inicio: '',
      data_fim: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => ({ ...prev, ...novaPaginacao }));
  }, []);

  /**
   * Exportar para XLSX
   */
  const exportarXLSX = useCallback(async () => {
    try {
      setLoading(true);
      const response = await consultaStatusNecessidadeService.exportarXLSX(filtros);
      
      if (response.success) {
        // Aqui você implementaria a lógica de download do arquivo XLSX
        toast.success('Exportação XLSX iniciada');
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao exportar XLSX');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao exportar XLSX';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  /**
   * Exportar para PDF
   */
  const exportarPDF = useCallback(async () => {
    try {
      setLoading(true);
      const response = await consultaStatusNecessidadeService.exportarPDF(filtros);
      
      if (response.success) {
        // Aqui você implementaria a lógica de download do arquivo PDF
        toast.success('Exportação PDF iniciada');
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao exportar PDF');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao exportar PDF';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  /**
   * Obter opções de status
   */
  const obterOpcoesStatus = useCallback(() => {
    return [
      { value: '', label: 'Todos os status' },
      { value: 'CONF', label: 'Confirmado' },
      { value: 'PEND', label: 'Pendente' },
      { value: 'CANC', label: 'Cancelado' },
      { value: 'REJE', label: 'Rejeitado' }
    ];
  }, []);

  /**
   * Obter opções de status de substituição
   */
  const obterOpcoesStatusSubstituicao = useCallback(() => {
    return [
      { value: '', label: 'Todos os status' },
      { value: 'conf', label: 'Confirmado' },
      { value: 'conf log', label: 'Confirmado (Log)' },
      { value: 'aprovado', label: 'Aprovado' },
      { value: 'rejeitado', label: 'Rejeitado' },
      { value: 'cancelado', label: 'Cancelado' },
      { value: 'sem_substituicao', label: 'Sem Substituição' }
    ];
  }, []);

  return {
    // Estados
    necessidades,
    estatisticas,
    loading,
    error,
    pagination,
    filtros,
    
    // Dados para filtros
    opcoesSemanasAbastecimento,
    opcoesSemanasConsumo,
    unidadesEscolares,
    grupos,
    produtos,
    
    // Funções
    carregarNecessidades,
    carregarEstatisticas,
    atualizarFiltros,
    limparFiltros,
    atualizarPaginacao,
    exportarXLSX,
    exportarPDF,
    obterOpcoesStatus,
    obterOpcoesStatusSubstituicao
  };
};
