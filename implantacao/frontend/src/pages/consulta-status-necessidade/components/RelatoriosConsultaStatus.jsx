import React, { useState, useEffect } from 'react';
import { FaChartBar } from 'react-icons/fa';
import consultaStatusNecessidadeService from '../../../services/consultaStatusNecessidade';
import toast from 'react-hot-toast';
import ModalProdutosGrupo from './ModalProdutosGrupo';
import RelatoriosFiltros from './relatorios/RelatoriosFiltros';
import RelatoriosEstatisticasCards from './relatorios/RelatoriosEstatisticasCards';
import RelatoriosStatusChart from './relatorios/RelatoriosStatusChart';
import RelatoriosSubstituicaoChart from './relatorios/RelatoriosSubstituicaoChart';
import RelatoriosGruposTable from './relatorios/RelatoriosGruposTable';

const RelatoriosConsultaStatus = () => {
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);
  const [semanasAbastecimento, setSemanasAbastecimento] = useState([]);
  const [modalProdutosAberto, setModalProdutosAberto] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [filtros, setFiltros] = useState({
    grupo: '',
    semana_abastecimento: '',
    data_inicio: '',
    data_fim: ''
  });

  // Carregar estatísticas
  const carregarEstatisticas = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (filtros.grupo) {
        params.grupo = filtros.grupo;
      }
      if (filtros.semana_abastecimento) {
        params.semana_abastecimento = filtros.semana_abastecimento;
      }
      if (filtros.data_inicio) {
        params.data_inicio = filtros.data_inicio;
      }
      if (filtros.data_fim) {
        params.data_fim = filtros.data_fim;
      }

      const response = await consultaStatusNecessidadeService.obterEstatisticas(params);
      
      if (response.success) {
        setEstatisticas(response.data);
      } else {
        toast.error('Erro ao carregar estatísticas');
      }
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar opções de filtros dinâmicas
  const carregarOpcoesFiltros = async () => {
    try {
      setLoadingOpcoes(true);
      const opcoesResponse = await consultaStatusNecessidadeService.obterOpcoesFiltros();
      
      if (opcoesResponse.success && opcoesResponse.data) {
        // Semanas de abastecimento disponíveis
        const semanasAbastecimentoOptions = opcoesResponse.data.semanas_abastecimento.map(semana => ({
          value: semana,
          label: semana
        }));
        setSemanasAbastecimento(semanasAbastecimentoOptions);
      }
    } catch (error) {
      toast.error('Erro ao carregar opções de filtros');
    } finally {
      setLoadingOpcoes(false);
    }
  };

  useEffect(() => {
    carregarOpcoesFiltros();
    carregarEstatisticas();
  }, []);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleAplicarFiltros = () => {
    carregarEstatisticas();
  };

  const handleLimparFiltros = () => {
    setFiltros({
      grupo: '',
      semana_abastecimento: '',
      data_inicio: '',
      data_fim: ''
    });
    setTimeout(() => {
      carregarEstatisticas();
    }, 100);
  };

  const handleVisualizarGrupo = (grupo) => {
    setGrupoSelecionado(grupo);
    setModalProdutosAberto(true);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <RelatoriosFiltros
        filtros={filtros}
        semanasAbastecimento={semanasAbastecimento}
        loading={loading}
        loadingOpcoes={loadingOpcoes}
        onFiltroChange={handleFiltroChange}
        onAplicarFiltros={handleAplicarFiltros}
        onLimparFiltros={handleLimparFiltros}
      />

      {/* Cards de Estatísticas Gerais */}
      <RelatoriosEstatisticasCards estatisticas={estatisticas} />

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RelatoriosStatusChart estatisticas={estatisticas} loading={loading} />
        <RelatoriosSubstituicaoChart estatisticas={estatisticas} loading={loading} />
      </div>

      {/* Tabela de Análise por Grupo */}
      <RelatoriosGruposTable
        estatisticas={estatisticas}
        loading={loading}
        onVisualizarGrupo={handleVisualizarGrupo}
      />

      {/* Mensagem quando não há dados */}
      {!loading && estatisticas && 
       (!estatisticas.geral || 
        (estatisticas.geral.total_necessidades === 0 && 
         (!estatisticas.status || estatisticas.status.length === 0))) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaChartBar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum dado encontrado
          </h3>
          <p className="text-gray-600">
            Ajuste os filtros e clique em "Aplicar Filtros" para visualizar os relatórios.
          </p>
        </div>
      )}

      {/* Modal de Produtos por Grupo */}
      <ModalProdutosGrupo
        isOpen={modalProdutosAberto}
        onClose={() => {
          setModalProdutosAberto(false);
          setGrupoSelecionado(null);
        }}
        grupo={grupoSelecionado}
        filtros={filtros}
      />
    </div>
  );
};

export default RelatoriosConsultaStatus;
