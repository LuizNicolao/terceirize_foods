import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaFilter, FaSync, FaFilePdf, FaCog } from 'react-icons/fa';
import { SearchableSelect } from '../../../components/ui';
import { useSemanasAbastecimento } from '../../../hooks/useSemanasAbastecimento';
import { useAuth } from '../../../contexts/AuthContext';
import { useConsultaStatusNecessidade } from '../../../hooks/useConsultaStatusNecessidade';
import FoodsApiService from '../../../services/FoodsApiService';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

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
    status_substituicao: ''
  });
  
  // Estado para opções de filtros
  const [grupos, setGrupos] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);

  // Verificar se é nutricionista
  const isNutricionista = user?.tipo_de_acesso === 'nutricionista';

  // Hooks
  const { opcoes: opcoesSemanas, obterValorPadrao } = useSemanasAbastecimento();
  const { carregarNecessidades, necessidades, estatisticas } = useConsultaStatusNecessidade();
  
  // Estado para controle de atualização automática
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  // Opções de status
  const opcoesStatusNecessidade = [
    { value: '', label: 'Todos os status' },
    { value: 'NEC', label: 'NEC - Necessidade Criada' },
    { value: 'APROVADA', label: 'APROVADA - Aprovada pela Coordenação' },
    { value: 'REJEITADA', label: 'REJEITADA - Rejeitada pela Coordenação' },
    { value: 'PROCESSADA', label: 'PROCESSADA - Processada para Substituição' }
  ];

  const opcoesStatusSubstituicao = [
    { value: '', label: 'Todos os status' },
    { value: 'conf', label: 'CONF - Aguardando Confirmação' },
    { value: 'aprovado', label: 'APROVADO - Aprovado' },
    { value: 'conf log', label: 'CONF LOG - Confirmado com Log' }
  ];

  // Carregar opções de filtros
  const carregarOpcoesFiltros = async () => {
    try {
      setLoadingOpcoes(true);
      
      // Carregar grupos de produtos
      const gruposResponse = await FoodsApiService.getGrupos();
      if (gruposResponse.success) {
        setGrupos(gruposResponse.data || []);
      }

      // Carregar escolas baseado no tipo de usuário
      await carregarEscolas();

      // Carregar produtos
      const produtosResponse = await FoodsApiService.getProdutosOrigem();
      if (produtosResponse.success) {
        setProdutos(produtosResponse.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar opções de filtros:', error);
      toast.error('Erro ao carregar opções de filtros');
    } finally {
      setLoadingOpcoes(false);
    }
  };

  // Carregar escolas baseado no tipo de usuário
  const carregarEscolas = async () => {
    try {
      if (isNutricionista && user?.id) {
        // Para nutricionistas, carregar apenas escolas das suas rotas
        const response = await fetch(`/implantacao/api/recebimentos-escolas/escolas-nutricionista/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setEscolas(data.data || []);
          }
        }
      } else {
        // Para outros tipos de usuário, carregar todas as escolas
        const escolasResponse = await FoodsApiService.getUnidadesEscolares();
        if (escolasResponse.success) {
          setEscolas(escolasResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      // Fallback para carregar todas as escolas
      const escolasResponse = await FoodsApiService.getUnidadesEscolares();
      if (escolasResponse.success) {
        setEscolas(escolasResponse.data || []);
      }
    }
  };

  // Inicializar filtro de semana com a semana atual
  const [inicializado, setInicializado] = useState(false);
  useEffect(() => {
    const semanaPadrao = obterValorPadrao();
    if (semanaPadrao && !inicializado) {
      setFiltros(prev => ({
        ...prev,
        semana_abastecimento: semanaPadrao
      }));
      setInicializado(true);
    }
  }, [obterValorPadrao, inicializado]);

  // Carregar opções quando o componente montar
  useEffect(() => {
    carregarOpcoesFiltros();
  }, []);

  // Função para formatar data
  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // Função para obter label do status da necessidade
  const getStatusNecessidadeLabel = (status) => {
    const statusMap = {
      'NEC': 'NEC - Necessidade Criada',
      'APROVADA': 'APROVADA - Aprovada pela Coordenação',
      'REJEITADA': 'REJEITADA - Rejeitada pela Coordenação',
      'PROCESSADA': 'PROCESSADA - Processada para Substituição'
    };
    return statusMap[status] || status;
  };

  // Função para obter label do status da substituição
  const getStatusSubstituicaoLabel = (status) => {
    const statusMap = {
      'conf': 'CONF - Aguardando Confirmação',
      'aprovado': 'APROVADO - Aprovado',
      'conf log': 'CONF LOG - Confirmado com Log'
    };
    return statusMap[status] || status;
  };

  // Função para formatar tempo da última atualização
  const formatarUltimaAtualizacao = () => {
    if (!ultimaAtualizacao) return '';
    const agora = new Date();
    const diff = agora - ultimaAtualizacao;
    const minutos = Math.floor(diff / 60000);
    
    if (minutos < 1) return 'Agora mesmo';
    if (minutos === 1) return 'Há 1 minuto';
    if (minutos < 60) return `Há ${minutos} minutos`;
    
    const horas = Math.floor(minutos / 60);
    if (horas === 1) return 'Há 1 hora';
    return `Há ${horas} horas`;
  };

  const carregarStatusNecessidades = async () => {
    setLoading(true);
    try {
      // Aplicar filtros
      const params = { ...filtros };
      
      // Remover filtros vazios
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      await carregarNecessidades(params);
      
      if (necessidades) {
        // Separar necessidades processadas e não processadas
        const processadas = necessidades.filter(n => n.status_substituicao);
        const naoProcessadas = necessidades.filter(n => !n.status_substituicao);
        
        setNecessidadesProcessadas(processadas);
        setNecessidadesNaoProcessadas(naoProcessadas);
        setUltimaAtualizacao(new Date());
      }
    } catch (error) {
      console.error('Erro ao carregar status das necessidades:', error);
      toast.error('Erro ao carregar status das necessidades');
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar PDF das necessidades não processadas
  const gerarPDFNecessidadesNaoProcessadas = () => {
    if (necessidadesNaoProcessadas.length === 0) {
      toast.error('Não há necessidades não processadas para exportar');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Necessidades Não Processadas', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Data e hora de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Filtros aplicados
    const filtrosAplicados = [];
    if (filtros.status_necessidade) {
      filtrosAplicados.push(`Status: ${getStatusNecessidadeLabel(filtros.status_necessidade)}`);
    }
    if (filtros.grupo) {
      filtrosAplicados.push(`Grupo: ${filtros.grupo}`);
    }
    if (filtros.semana_abastecimento) {
      filtrosAplicados.push(`Semana Abastecimento: ${filtros.semana_abastecimento}`);
    }

    if (filtrosAplicados.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Filtros Aplicados:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      filtrosAplicados.forEach(filtro => {
        doc.text(`• ${filtro}`, 25, yPosition);
        yPosition += 7;
      });
      yPosition += 10;
    }

    // Resumo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de Necessidades Não Processadas: ${necessidadesNaoProcessadas.length}`, 20, yPosition);
    yPosition += 15;

    // Tabela de necessidades
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Cabeçalho da tabela
    doc.text('Escola', 20, yPosition);
    doc.text('Produto', 80, yPosition);
    doc.text('Grupo', 140, yPosition);
    doc.text('Status', 180, yPosition);
    yPosition += 8;

    // Linha separadora
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;

    // Dados das necessidades
    doc.setFont('helvetica', 'normal');
    necessidadesNaoProcessadas.forEach((necessidade, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      const escola = necessidade.escola_nome || 'N/A';
      const produto = necessidade.produto || 'N/A';
      const grupo = necessidade.grupo || 'N/A';
      const status = getStatusNecessidadeLabel(necessidade.status);

      doc.text(escola, 20, yPosition);
      doc.text(produto, 80, yPosition);
      doc.text(grupo, 140, yPosition);
      doc.text(status, 180, yPosition);
      yPosition += 7;

      // Linha separadora entre necessidades
      if (index < necessidadesNaoProcessadas.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        doc.setDrawColor(0, 0, 0);
        yPosition += 3;
      }
    });

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Salvar o PDF
    const nomeArquivo = `necessidades_nao_processadas_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
    
    toast.success('PDF gerado com sucesso!');
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({
      status_necessidade: '',
      grupo: '',
      semana_abastecimento: '',
      semana_consumo: '',
      escola_id: '',
      produto_id: '',
      status_substituicao: ''
    });
  };

  const aplicarFiltros = () => {
    carregarStatusNecessidades();
  };

  // Verificar se há filtros ativos
  const temFiltrosAtivos = Object.values(filtros).some(valor => valor !== '');

  // Carregar dados quando os filtros mudarem
  useEffect(() => {
    if (inicializado) {
      carregarStatusNecessidades();
    }
  }, [filtros, inicializado]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">🔍 Filtros</h3>
            {isNutricionista && (
              <p className="text-sm text-blue-600 mt-1">
                📍 Visualizando apenas suas {escolas.length} escolas
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {temFiltrosAtivos && (
              <button
                onClick={limparFiltros}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Limpar Filtros
              </button>
            )}
            <button
              onClick={() => {
                const semanaPadrao = obterValorPadrao();
                setFiltros(prev => ({
                  ...prev,
                  semana_abastecimento: semanaPadrao
                }));
              }}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Semana Atual
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por Status da Necessidade */}
          <div>
            <SearchableSelect
              label="Status da Necessidade"
              value={filtros.status_necessidade}
              onChange={(value) => handleFiltroChange('status_necessidade', value)}
              options={opcoesStatusNecessidade}
              placeholder="Selecione o status..."
              disabled={loading}
            />
          </div>

          {/* Filtro por Grupo */}
          <div>
            <SearchableSelect
              label="Grupo de Produtos"
              value={filtros.grupo}
              onChange={(value) => handleFiltroChange('grupo', value)}
              options={[
                { value: '', label: 'Todos os grupos' },
                ...grupos.map(grupo => ({ value: grupo.nome, label: grupo.nome }))
              ]}
              placeholder="Selecione o grupo..."
              disabled={loading || loadingOpcoes}
            />
          </div>

          {/* Filtro por Semana AB */}
          <div>
            <SearchableSelect
              label="Semana Abastecimento (AB)"
              value={filtros.semana_abastecimento}
              onChange={(value) => handleFiltroChange('semana_abastecimento', value)}
              options={opcoesSemanas}
              placeholder="Selecione uma semana..."
              disabled={loading}
            />
          </div>

          {/* Filtro por Escola */}
          <div>
            <SearchableSelect
              label={isNutricionista ? "Escola (Suas Rotas)" : "Escola"}
              value={filtros.escola_id}
              onChange={(value) => handleFiltroChange('escola_id', value)}
              options={[
                { value: '', label: isNutricionista ? 'Todas as minhas escolas' : 'Todas as escolas' },
                ...escolas.map(escola => ({ 
                  value: escola.id.toString(), 
                  label: `${escola.nome_escola || escola.escola_nome} (${escola.rota || escola.escola_rota})` 
                }))
              ]}
              placeholder={isNutricionista ? "Selecione uma das suas escolas..." : "Selecione uma escola..."}
              disabled={loading || loadingOpcoes}
            />
          </div>
        </div>
      </div>

      {/* Status das Necessidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Processadas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-green-50 border-b border-gray-200 p-4 rounded-t-lg">
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              <FaCheckCircle className="mr-2" />
              Processadas ({necessidadesProcessadas.length})
            </h3>
            <p className="text-green-600 text-sm mt-1">
              Necessidades que já foram processadas para substituição
            </p>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Carregando...</span>
              </div>
            ) : necessidadesProcessadas.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {necessidadesProcessadas.map((necessidade) => (
                  <div
                    key={necessidade.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{necessidade.escola_nome}</div>
                      <div className="text-sm text-gray-600">{necessidade.produto}</div>
                      
                      {/* Mostrar detalhes da substituição */}
                      {necessidade.status_substituicao && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              {getStatusSubstituicaoLabel(necessidade.status_substituicao)}
                            </span>
                            <span>{necessidade.produto_generico_nome}</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {necessidade.quantidade_generico} {necessidade.produto_generico_unidade}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <FaCheckCircle className="text-green-600 flex-shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaCheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma necessidade processada ainda</p>
                {!temFiltrosAtivos && (
                  <p className="text-sm mt-1">Mostrando todas as necessidades. Use os filtros para refinar a busca.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Não Processadas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-red-50 border-b border-gray-200 p-4 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-red-800 flex items-center">
                  <FaTimesCircle className="mr-2" />
                  Não Processadas ({necessidadesNaoProcessadas.length})
                </h3>
                <p className="text-red-600 text-sm mt-1">
                  Necessidades que ainda não foram processadas para substituição
                </p>
              </div>
              
              {necessidadesNaoProcessadas.length > 0 && (
                <button
                  onClick={gerarPDFNecessidadesNaoProcessadas}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  title="Exportar necessidades não processadas em PDF"
                >
                  <FaFilePdf className="mr-2" />
                  Exportar PDF
                </button>
              )}
            </div>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Carregando...</span>
              </div>
            ) : necessidadesNaoProcessadas.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {necessidadesNaoProcessadas.map((necessidade) => (
                  <div
                    key={necessidade.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{necessidade.escola_nome}</div>
                      <div className="text-sm text-gray-600">{necessidade.produto}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {getStatusNecessidadeLabel(necessidade.status)}
                        </span>
                        {necessidade.grupo && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded ml-1">
                            {necessidade.grupo}
                          </span>
                        )}
                      </div>
                    </div>
                    <FaTimesCircle className="text-red-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaTimesCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Todas as necessidades foram processadas</p>
                <p className="text-sm mt-1">🎉 Parabéns!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">Necessidades Processadas</p>
                <p className="text-2xl font-bold text-green-600">{necessidadesProcessadas.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <FaTimesCircle className="text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">Necessidades Não Processadas</p>
                <p className="text-2xl font-bold text-red-600">{necessidadesNaoProcessadas.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <FaSync className="text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-800">Última Atualização</p>
                <p className="text-sm text-blue-600">{formatarUltimaAtualizacao()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusNecessidadesTab;
