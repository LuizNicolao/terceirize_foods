import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaFilter, FaSync, FaFilePdf } from 'react-icons/fa';
import { SearchableSelect } from '../ui';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';
import useEscolas from '../../hooks/useEscolas';
import { useAuth } from '../../contexts/AuthContext';
import recebimentosEscolasService from '../../services/recebimentosEscolasService';
import necessidadesService from '../../services/necessidadesService';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const StatusEntregaTab = () => {
  const { user } = useAuth();
  const [escolasRecebidas, setEscolasRecebidas] = useState([]);
  const [escolasNaoRecebidas, setEscolasNaoRecebidas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo_entrega: '',
    tipo_recebimento: '',
    semana_abastecimento: '' // Será inicializado com a semana atual
  });

  // Verificar se é nutricionista
  const isNutricionista = user?.tipo_usuario === 'Nutricionista';

  // Hooks
  const { escolas, carregarEscolas, carregarTodasEscolas } = useEscolas();
  const { opcoes: opcoesSemanas, obterValorPadrao } = useSemanasAbastecimento();
  
  
  // Estado para controle de atualização automática
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    if (isNutricionista) {
      carregarTodasEscolas(); // Filtra apenas escolas da nutricionista (sem limitação de paginação)
    } else {
      carregarTodasEscolas(); // Carrega todas as escolas para coordenação/supervisão
    }
  }, [isNutricionista]);

  // Inicializar filtro de semana com a semana atual (apenas na primeira carga)
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


  // Carregar status de entrega quando filtros mudarem
  useEffect(() => {
    if (escolas && escolas.length > 0) {
      carregarStatusEntrega();
    }
  }, [escolas, filtros]);

  // Atualização automática a cada 5 minutos
  useEffect(() => {
    if (!autoUpdateEnabled || !escolas || escolas.length === 0) return;

    const interval = setInterval(() => {
      carregarStatusEntrega();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [autoUpdateEnabled, escolas, filtros]);

  // Atualizar timestamp da última atualização a cada minuto para exibição
  useEffect(() => {
    if (!ultimaAtualizacao) return;

    const interval = setInterval(() => {
      // Força re-render para atualizar o texto "Há X minutos"
      setUltimaAtualizacao(prev => prev ? new Date(prev.getTime()) : null);
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [ultimaAtualizacao]);

  const carregarStatusEntrega = async () => {
    setLoading(true);
    try {
      // Sempre buscar recebimentos, mesmo sem filtros
      const params = {};
      
      // Aplicar filtros apenas se estiverem selecionados
      if (filtros.tipo_entrega) {
        params.tipo_entrega = filtros.tipo_entrega;
      }
      if (filtros.tipo_recebimento) {
        params.tipo_recebimento = filtros.tipo_recebimento;
      }
      if (filtros.semana_abastecimento) {
        params.semana_abastecimento = filtros.semana_abastecimento;
      }

      const response = await recebimentosEscolasService.listarTodas(params);
      
      if (response.success) {
        const recebimentos = response.data;
        
        // Criar mapa de recebimentos por escola para mostrar detalhes
        const recebimentosPorEscola = new Map();
        recebimentos.forEach(recebimento => {
          if (!recebimentosPorEscola.has(recebimento.escola_id)) {
            recebimentosPorEscola.set(recebimento.escola_id, []);
          }
          recebimentosPorEscola.get(recebimento.escola_id).push(recebimento);
        });
        
        // Separar escolas recebidas e não recebidas
        const recebidas = (escolas || []).filter(escola => recebimentosPorEscola.has(escola.id));
        const naoRecebidas = (escolas || []).filter(escola => !recebimentosPorEscola.has(escola.id));
        
        
        // Adicionar dados de recebimentos às escolas recebidas
        const recebidasComDetalhes = recebidas.map(escola => ({
          ...escola,
          recebimentos: recebimentosPorEscola.get(escola.id)
        }));
        
        setEscolasRecebidas(recebidasComDetalhes);
        setEscolasNaoRecebidas(naoRecebidas);
        setUltimaAtualizacao(new Date());
      } else {
        toast.error('Erro ao carregar status de entrega');
      }
    } catch (error) {
      console.error('Erro ao carregar status de entrega:', error);
      toast.error('Erro ao carregar status de entrega');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      tipo_entrega: '',
      tipo_recebimento: '',
      semana_abastecimento: ''
    });
    // Marcar como inicializado para evitar que a semana padrão seja reaplicada
    setInicializado(true);
  };

  const temFiltrosAtivos = Boolean(filtros.tipo_entrega) || Boolean(filtros.tipo_recebimento) || Boolean(filtros.semana_abastecimento);

  // Função para formatar data
  const formatarData = (data) => {
    if (!data) return '';
    try {
      // Se a data contém 'T' (formato ISO), extrair apenas a parte da data
      let dataPart = data;
      if (data.includes('T')) {
        dataPart = data.split('T')[0];
      }
      
      const [ano, mes, dia] = dataPart.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return data;
    }
  };

  // Função para mapear tipos de produtos para tipos de entrega
  const mapearTipoProdutoParaEntrega = (tipoProduto) => {
    const mapeamento = {
      'Horti': 'HORTI',
      'Pao': 'PAO',
      'Pereciveis': 'PERECIVEL',
      'Base Seca': 'BASE SECA',
      'Limpeza': 'LIMPEZA'
    };
    return mapeamento[tipoProduto] || tipoProduto;
  };

  // Função para obter label do tipo de entrega
  const getTipoEntregaLabel = (tipo) => {
    const tipos = {
      'HORTI': 'Hortifruti',
      'PAO': 'Pão',
      'PERECIVEL': 'Perecível',
      'BASE SECA': 'Base Seca',
      'LIMPEZA': 'Limpeza'
    };
    return tipos[tipo] || tipo;
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

  // Função para gerar PDF das escolas não recebidas
  const gerarPDFEscolasNaoRecebidas = () => {
    if (escolasNaoRecebidas.length === 0) {
      toast.error('Não há escolas não recebidas para exportar');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Escolas Não Recebidas', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Data e hora de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Filtros aplicados
    const filtrosAplicados = [];
    if (filtros.tipo_entrega) {
      const tipoLabel = getTipoEntregaLabel(filtros.tipo_entrega);
      filtrosAplicados.push(`Tipo de Entrega: ${tipoLabel}`);
    }
    if (filtros.tipo_recebimento) {
      filtrosAplicados.push(`Tipo do Recebimento: ${filtros.tipo_recebimento}`);
    }
    if (filtros.semana_abastecimento) {
      filtrosAplicados.push(`Semana de Abastecimento: ${filtros.semana_abastecimento}`);
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
    doc.text(`Total de Escolas Não Recebidas: ${escolasNaoRecebidas.length}`, 20, yPosition);
    yPosition += 15;

    // Tabela de escolas
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Cabeçalho da tabela
    doc.text('Escola', 20, yPosition);
    doc.text('Rota', 120, yPosition);
    doc.text('Cidade', 160, yPosition);
    yPosition += 8;

    // Linha separadora
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;

    // Dados das escolas
    doc.setFont('helvetica', 'normal');
    escolasNaoRecebidas.forEach((escola, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      // Nome da escola (pode quebrar linha se muito longo)
      const nomeEscola = escola.nome_escola || 'N/A';
      const rota = escola.rota || 'N/A';
      const cidade = escola.cidade || 'N/A';

      doc.text(nomeEscola, 20, yPosition);
      doc.text(rota, 120, yPosition);
      doc.text(cidade, 160, yPosition);
      yPosition += 7;

      // Linha separadora entre escolas
      if (index < escolasNaoRecebidas.length - 1) {
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
    const nomeArquivo = `escolas_nao_recebidas_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
    
    toast.success('PDF gerado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaCheckCircle className="mr-2 text-green-600" />
              Status de Entrega por Grupo
            </h2>
            <p className="text-gray-600 mt-1">
              Acompanhe o status de recebimento das escolas por grupo de produto ou tipo de entrega
            </p>
            {ultimaAtualizacao && (
              <p className="text-sm text-gray-500 mt-1">
                Última atualização: {formatarUltimaAtualizacao()}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Toggle para atualização automática */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={autoUpdateEnabled}
                  onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                Auto (5min)
              </label>
            </div>
            
            {/* Botão de atualização manual */}
            <button
              onClick={carregarStatusEntrega}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaFilter className="mr-2 text-green-600" />
              Filtros
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Filtros opcionais para refinar a visualização do status de entrega
            </p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Tipo de Entrega */}
          <div>
            <SearchableSelect
              label="Tipo de Entrega"
              value={filtros.tipo_entrega}
              onChange={(value) => handleFiltroChange('tipo_entrega', value)}
              options={[
                { value: '', label: 'Selecione um tipo...' },
                { value: 'HORTI', label: 'Hortifruti' },
                { value: 'PAO', label: 'Pão' },
                { value: 'PERECIVEL', label: 'Perecível' },
                { value: 'BASE SECA', label: 'Base Seca' },
                { value: 'LIMPEZA', label: 'Limpeza' }
              ]}
              placeholder="Buscar tipo..."
              disabled={loading}
            />
          </div>

          {/* Filtro por Tipo do Recebimento */}
          <div>
            <SearchableSelect
              label="Tipo do Recebimento"
              value={filtros.tipo_recebimento}
              onChange={(value) => handleFiltroChange('tipo_recebimento', value)}
              options={[
                { value: '', label: 'Selecione um tipo...' },
                { value: 'Completo', label: 'Completo' },
                { value: 'Parcial', label: 'Parcial' }
              ]}
              placeholder="Buscar tipo..."
              disabled={loading}
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
        </div>
      </div>

      {/* Status de Entrega */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Recebido */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-green-50 border-b border-gray-200 p-4 rounded-t-lg">
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              <FaCheckCircle className="mr-2" />
              Recebido ({escolasRecebidas.length})
            </h3>
            <p className="text-green-600 text-sm mt-1">
              Escolas que já tiveram a entrega confirmada
            </p>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Carregando...</span>
              </div>
            ) : escolasRecebidas.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {escolasRecebidas.map((escola) => (
                  <div
                    key={escola.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{escola.nome_escola}</div>
                      <div className="text-sm text-gray-600">{escola.rota}</div>
                      
                      {/* Mostrar detalhes dos recebimentos */}
                      {escola.recebimentos && escola.recebimentos.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {escola.recebimentos.map((recebimento, index) => (
                            <div key={index} className="text-xs text-gray-500 flex items-center gap-2">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                {getTipoEntregaLabel(recebimento.tipo_entrega)}
                              </span>
                              <span>{formatarData(recebimento.data_recebimento)}</span>
                              {recebimento.tipo_recebimento && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {recebimento.tipo_recebimento}
                                </span>
                              )}
                            </div>
                          ))}
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
                <p>Nenhuma escola recebeu ainda</p>
                {!temFiltrosAtivos && (
                  <p className="text-sm mt-1">Mostrando todos os recebimentos. Use os filtros para refinar a busca.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Não Recebido */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-red-50 border-b border-gray-200 p-4 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-red-800 flex items-center">
                  <FaTimesCircle className="mr-2" />
                  Não Recebido ({escolasNaoRecebidas.length})
                </h3>
                <p className="text-red-600 text-sm mt-1">
                  Escolas que ainda não receberam a entrega
                </p>
              </div>
              
              {escolasNaoRecebidas.length > 0 && (
                <button
                  onClick={gerarPDFEscolasNaoRecebidas}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  title="Exportar escolas não recebidas em PDF"
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
            ) : escolasNaoRecebidas.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {escolasNaoRecebidas.map((escola) => (
                  <div
                    key={escola.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{escola.nome_escola}</div>
                      <div className="text-sm text-gray-600">{escola.rota}</div>
                    </div>
                    <FaTimesCircle className="text-red-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaTimesCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Todas as escolas receberam</p>
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
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{escolas?.length || 0}</div>
            <div className="text-sm text-gray-600">Total de Escolas</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{escolasRecebidas.length}</div>
            <div className="text-sm text-green-600">Recebidas</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{escolasNaoRecebidas.length}</div>
            <div className="text-sm text-red-600">Não Recebidas</div>
          </div>
        </div>
        
        {(escolas?.length || 0) > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progresso de Entrega</span>
              <span>{Math.round((escolasRecebidas.length / (escolas?.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(escolasRecebidas.length / (escolas?.length || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusEntregaTab;
