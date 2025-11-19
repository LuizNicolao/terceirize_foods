import React, { useState, useEffect } from 'react';
import { useSemanasAbastecimento } from '../../../hooks/useSemanasAbastecimento';
import { useAuth } from '../../../contexts/AuthContext';
import consultaStatusNecessidadeService from '../../../services/consultaStatusNecessidade';
import RotasNutricionistasService from '../../../services/rotasNutricionistas';
import toast from 'react-hot-toast';
import { getStatusNecessidadeLabel, getStatusSubstituicaoLabel } from '../utils/getStatusLabels';
import { useStatusNecessidadesData } from '../hooks/useStatusNecessidadesData';
import { useExportStatusNecessidades } from '../hooks/useExportStatusNecessidades';
import FiltrosStatusNecessidades from './status-necessidades/FiltrosStatusNecessidades';
import TabelaProcessadas from './status-necessidades/TabelaProcessadas';
import TabelaNaoProcessadas from './status-necessidades/TabelaNaoProcessadas';
import ResumoStatusNecessidades from './status-necessidades/ResumoStatusNecessidades';

const StatusNecessidadesTab = () => {
  const { user } = useAuth();
  const [necessidadesProcessadas, setNecessidadesProcessadas] = useState([]);
  const [necessidadesNaoProcessadas, setNecessidadesNaoProcessadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    status_necessidade: '',
    grupo: '',
    semana_abastecimento: '',
    semana_consumo: '',
    escola_id: '',
    produto_id: '',
    status_substituicao: '',
    filial: '',
    nutricionista_email: ''
  });
  
  // Estado para opções de filtros
  const [opcoesStatusNecessidade, setOpcoesStatusNecessidade] = useState([{ value: '', label: 'Todos os status' }]);
  const [opcoesStatusSubstituicao, setOpcoesStatusSubstituicao] = useState([{ value: '', label: 'Todos os status' }]);
  const [grupos, setGrupos] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [semanasAbastecimento, setSemanasAbastecimento] = useState([]);
  const [semanasConsumo, setSemanasConsumo] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [nutricionistas, setNutricionistas] = useState([]);
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);

  // Verificar se é nutricionista
  const isNutricionista = user?.tipo_de_acesso === 'nutricionista';

  // Hooks
  const { obterValorPadrao } = useSemanasAbastecimento();
  const { 
    gerarPDFNecessidadesProcessadas, 
    exportarExcelNecessidadesProcessadas,
    gerarPDFNecessidadesNaoProcessadas,
    exportarExcelNecessidadesNaoProcessadas
  } = useExportStatusNecessidades();
  
  // Estado para controle de atualização automática
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  // Estados para paginação e busca local
  const [buscaProcessadas, setBuscaProcessadas] = useState('');
  const [buscaNaoProcessadas, setBuscaNaoProcessadas] = useState('');
  const [pageProcessadas, setPageProcessadas] = useState(1);
  const [pageNaoProcessadas, setPageNaoProcessadas] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Estado para modo de visualização (individual ou consolidado)
  const [modoVisualizacaoProcessadas, setModoVisualizacaoProcessadas] = useState('individual');
  const [modoVisualizacaoNaoProcessadas, setModoVisualizacaoNaoProcessadas] = useState('individual');

  // Carregar opções de filtros dinâmicas do backend
  const carregarOpcoesFiltros = async () => {
    try {
      setLoadingOpcoes(true);
      
      const opcoesResponse = await consultaStatusNecessidadeService.obterOpcoesFiltros();
      
      if (opcoesResponse.success && opcoesResponse.data) {
        const { data } = opcoesResponse;
        
        // Status de necessidades
        const statusNecessidadeOptions = [
          { value: '', label: 'Todos os status' },
          ...data.status_necessidade.map(status => ({
            value: status,
            label: getStatusNecessidadeLabel(status)
          }))
        ];
        setOpcoesStatusNecessidade(statusNecessidadeOptions);
        
        // Status de substituições
        const statusSubstituicaoOptions = [
          { value: '', label: 'Todos os status' },
          ...data.status_substituicao.map(status => ({
            value: status,
            label: getStatusSubstituicaoLabel(status)
          }))
        ];
        setOpcoesStatusSubstituicao(statusSubstituicaoOptions);
        
        // Grupos
        const gruposOptions = [
          { value: '', label: 'Todos os grupos' },
          ...data.grupos.map(grupo => ({
            value: grupo,
            label: grupo
          }))
        ];
        setGrupos(gruposOptions);
        
        // Semanas de abastecimento
        const semanasAbastecimentoOptions = data.semanas_abastecimento.map(semana => ({
          value: semana,
          label: semana
        }));
        setSemanasAbastecimento(semanasAbastecimentoOptions);
        
        // Semanas de consumo
        const semanasConsumoOptions = data.semanas_consumo.map(semana => ({
          value: semana,
          label: semana
        }));
        setSemanasConsumo(semanasConsumoOptions);
        
        // Escolas
        const escolasOptions = data.escolas.map(escola => ({
          value: escola.id.toString(),
          label: escola.nome
        }));
        setEscolas(escolasOptions);
        
        // Produtos
        const produtosOptions = [
          { value: '', label: 'Todos os produtos' },
          ...data.produtos.map(produto => ({
            value: produto.id.toString(),
            label: `${produto.nome} (${produto.unidade})`
          }))
        ];
        setProdutos(produtosOptions);
        
        // Filiais
        const filiaisOptions = [
          { value: '', label: 'Todas as filiais' },
          ...data.filiais.map(filial => ({
            value: filial.id.toString(),
            label: filial.nome
          }))
        ];
        setFiliais(filiaisOptions);
        
        // Nutricionistas
        const nutricionistasOptions = [
          { value: '', label: 'Todos os nutricionistas' },
          ...(data.nutricionistas || []).map(nutri => ({
            value: nutri.email,
            label: nutri.nome || nutri.email
          }))
        ];
        setNutricionistas(nutricionistasOptions);
      }
    } catch (error) {
      toast.error('Erro ao carregar opções de filtros');
    } finally {
      setLoadingOpcoes(false);
    }
  };

  // Carregar opções quando o componente montar
  useEffect(() => {
    carregarOpcoesFiltros();
  }, []);

  const carregarStatusNecessidades = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (filtros.status_necessidade) {
        params.status_necessidade = filtros.status_necessidade;
      }
      if (filtros.status_substituicao) {
        params.status_substituicao = filtros.status_substituicao;
      }
      if (filtros.grupo) {
        params.grupo = filtros.grupo;
      }
      if (filtros.semana_abastecimento) {
        params.semana_abastecimento = filtros.semana_abastecimento;
      }
      if (filtros.semana_consumo) {
        params.semana_consumo = filtros.semana_consumo;
      }
      if (filtros.escola_id) {
        params.escola_id = filtros.escola_id;
      }
      if (filtros.produto_id) {
        params.produto_id = filtros.produto_id;
      }
      if (filtros.nutricionista_email) {
        params.nutricionista_email = filtros.nutricionista_email;
      }

      const response = await consultaStatusNecessidadeService.listar({
        ...params,
        limit: 10000,
        page: 1
      });
      
      if (response.success) {
        let necessidadesData = response.data || [];
        
        // Aplicar filtro de filial se selecionado
        if (filtros.filial) {
          try {
            // Buscar escolas da filial selecionada
            const escolasFilialResponse = await RotasNutricionistasService.buscarUnidadesEscolaresPorFilial(filtros.filial);
            if (escolasFilialResponse.success && escolasFilialResponse.data) {
              const escolasIdsFilial = new Set(escolasFilialResponse.data.map(e => e.id?.toString()));
          necessidadesData = necessidadesData.filter(necessidade => {
                return escolasIdsFilial.has(necessidade.escola_id?.toString());
              });
            }
          } catch (error) {
            console.error('Erro ao filtrar por filial:', error);
            toast.error('Erro ao aplicar filtro de filial');
          }
        }
        
        // Remover duplicatas
        const necessidadesUnicas = necessidadesData.reduce((acc, current) => {
          const key = `${current.id}-${current.escola_id}-${current.produto_id}`;
          if (!acc.has(key)) {
            acc.set(key, current);
          }
          return acc;
        }, new Map());
        
        const necessidadesSemDuplicatas = Array.from(necessidadesUnicas.values());
        
        // Separar necessidades processadas e não processadas
        const processadas = necessidadesSemDuplicatas.filter(n => 
          n.status_substituicao && 
          (n.status_substituicao === 'conf log' || n.status_substituicao === 'impressao')
        );
        const naoProcessadas = necessidadesSemDuplicatas.filter(n => 
          !n.status_substituicao || 
          n.status_substituicao === '' || 
          n.status_substituicao === 'conf'
        );
        
        setNecessidadesProcessadas(processadas);
        setNecessidadesNaoProcessadas(naoProcessadas);
        setUltimaAtualizacao(new Date());
        setPageProcessadas(1);
        setPageNaoProcessadas(1);
      } else {
        toast.error('Erro ao carregar dados');
      }
    } catch (error) {
      toast.error('Erro ao carregar status das necessidades');
    } finally {
      setLoading(false);
    }
  };

  // Função de ordenação
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Usar hooks para processar dados
  const {
    necessidadesFiltradas: necessidadesProcessadasFiltradas,
    necessidadesPaginadas: necessidadesProcessadasPaginadas
  } = useStatusNecessidadesData(
    necessidadesProcessadas,
    modoVisualizacaoProcessadas,
    buscaProcessadas,
    sortConfig,
    pageProcessadas,
    itemsPerPage,
    true
  );

  const {
    necessidadesFiltradas: necessidadesNaoProcessadasFiltradas,
    necessidadesPaginadas: necessidadesNaoProcessadasPaginadas
  } = useStatusNecessidadesData(
    necessidadesNaoProcessadas,
    modoVisualizacaoNaoProcessadas,
    buscaNaoProcessadas,
    sortConfig,
    pageNaoProcessadas,
    itemsPerPage,
    false
  );

  // Handlers
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const limparFiltros = () => {
    setNecessidadesProcessadas([]);
    setNecessidadesNaoProcessadas([]);
    setUltimaAtualizacao(null);
    
    setFiltros({
      status_necessidade: '',
      status_substituicao: '',
      grupo: '',
      semana_abastecimento: '',
      semana_consumo: '',
      escola_id: '',
      produto_id: '',
      filial: '',
      nutricionista_email: ''
    });
  };

  const aplicarFiltros = () => {
    carregarStatusNecessidades();
  };

  const handleSemanaAtual = () => {
    if (semanasAbastecimento.length > 0) {
      setFiltros(prev => ({
        ...prev,
        semana_abastecimento: semanasAbastecimento[0].value
      }));
    } else {
      const semanaPadrao = obterValorPadrao();
      if (semanaPadrao) {
        setFiltros(prev => ({
          ...prev,
          semana_abastecimento: semanaPadrao
        }));
      }
    }
  };

  // Verificar se há filtros ativos
  const temFiltrosAtivos = Object.values(filtros).some(valor => valor !== '');

  // Handlers de exportação
  const handleExportPDFProcessadas = () => {
    gerarPDFNecessidadesProcessadas(necessidadesProcessadasFiltradas, modoVisualizacaoProcessadas);
  };

  const handleExportExcelProcessadas = () => {
    exportarExcelNecessidadesProcessadas(necessidadesProcessadasFiltradas, modoVisualizacaoProcessadas);
  };

  const handleExportPDFNaoProcessadas = () => {
    gerarPDFNecessidadesNaoProcessadas(necessidadesNaoProcessadasFiltradas, modoVisualizacaoNaoProcessadas);
  };

  const handleExportExcelNaoProcessadas = () => {
    exportarExcelNecessidadesNaoProcessadas(necessidadesNaoProcessadasFiltradas, modoVisualizacaoNaoProcessadas);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <FiltrosStatusNecessidades
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onAplicarFiltros={aplicarFiltros}
        onLimparFiltros={limparFiltros}
        onSemanaAtual={handleSemanaAtual}
        temFiltrosAtivos={temFiltrosAtivos}
        loading={loading}
        loadingOpcoes={loadingOpcoes}
        isNutricionista={isNutricionista}
        opcoesStatusNecessidade={opcoesStatusNecessidade}
        opcoesStatusSubstituicao={opcoesStatusSubstituicao}
        grupos={grupos}
        semanasAbastecimento={semanasAbastecimento}
        semanasConsumo={semanasConsumo}
        escolas={escolas}
        produtos={produtos}
        filiais={filiais}
        nutricionistas={nutricionistas}
      />

      {/* Status das Necessidades - Layout em Tabelas */}
      <div className="space-y-6">
        {/* Tabela Processadas */}
        <TabelaProcessadas
          necessidades={necessidadesProcessadas}
          necessidadesFiltradas={necessidadesProcessadasFiltradas}
          necessidadesPaginadas={necessidadesProcessadasPaginadas}
          loading={loading}
          modoVisualizacao={modoVisualizacaoProcessadas}
          onModoVisualizacaoChange={setModoVisualizacaoProcessadas}
          busca={buscaProcessadas}
          onBuscaChange={setBuscaProcessadas}
          sortConfig={sortConfig}
          onSort={handleSort}
          page={pageProcessadas}
          onPageChange={setPageProcessadas}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          onExportPDF={handleExportPDFProcessadas}
          onExportExcel={handleExportExcelProcessadas}
          temFiltrosAtivos={temFiltrosAtivos}
        />

        {/* Tabela Não Processadas */}
        <TabelaNaoProcessadas
          necessidades={necessidadesNaoProcessadas}
          necessidadesFiltradas={necessidadesNaoProcessadasFiltradas}
          necessidadesPaginadas={necessidadesNaoProcessadasPaginadas}
          loading={loading}
          modoVisualizacao={modoVisualizacaoNaoProcessadas}
          onModoVisualizacaoChange={setModoVisualizacaoNaoProcessadas}
          busca={buscaNaoProcessadas}
          onBuscaChange={setBuscaNaoProcessadas}
          sortConfig={sortConfig}
          onSort={handleSort}
          page={pageNaoProcessadas}
          onPageChange={setPageNaoProcessadas}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          onExportPDF={handleExportPDFNaoProcessadas}
          onExportExcel={handleExportExcelNaoProcessadas}
          temFiltrosAtivos={temFiltrosAtivos}
        />
      </div>

      {/* Resumo */}
      <ResumoStatusNecessidades
        totalProcessadas={necessidadesProcessadas.length}
        totalNaoProcessadas={necessidadesNaoProcessadas.length}
        ultimaAtualizacao={ultimaAtualizacao}
      />
    </div>
  );
};

export default StatusNecessidadesTab;
