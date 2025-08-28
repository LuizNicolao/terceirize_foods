/**
 * Página de Visualização de Cotação para Aprovações
 * Versão independente do supervisor com componentes específicos para aprovações
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaEye, 
  FaSearch, 
  FaFilter,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaUserCheck,
  FaThumbsUp,
  FaThumbsDown,
  FaExchangeAlt,
  FaChartLine,
  FaTruck,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaList,
  FaChartBar,
  FaTag,
  FaChartPie,
  FaDollarSign,
  FaHistory,
  FaCalculator,
  FaFileInvoice,
  FaUserShield,
  FaCalendar,
  FaTimes,
  FaArrowLeft,
  FaSave,
  FaBan,
  FaSync,
  FaShieldAlt,
  FaClipboardList,
  FaBalanceScale,
  FaPercentage,
  FaUsers,
  FaPaperPlane
} from 'react-icons/fa';
import { Button, Card } from '../../design-system/components';
import ModalRenegociacao from '../../components/cotacoes/ModalRenegociacao';
import ModalAprovacao from '../../components/aprovacoes/ModalAprovacao';
import ModalRejeicao from '../../components/aprovacoes/ModalRejeicao';
import HeaderAprovacoes from '../../components/aprovacoes/HeaderAprovacoes';
import InformacoesAprovacao from '../../components/aprovacoes/InformacoesAprovacao';
import ResumoAprovacao from '../../components/aprovacoes/ResumoAprovacao';
import BotoesVisualizacaoAprovacao from '../../components/aprovacoes/BotoesVisualizacaoAprovacao';
import BotoesExportacaoAprovacao from '../../components/aprovacoes/BotoesExportacaoAprovacao';
import { aprovacoesService } from '../../services/aprovacoes';
import { useAprovacaoExport } from '../../hooks/useAprovacaoExport';
import { useItensMelhoresCriterios } from '../../hooks/useItensMelhoresCriterios';
import {
  VisualizacaoPadraoAprovacao,
  AnaliseComparativaAprovacao,
  MelhorPrecoAprovacao,
  MelhorPrazoEntregaAprovacao,
  MelhorPrazoPagamentoAprovacao,
  ComparativoProdutosAprovacao
} from './components/visualizacoes';
import toast from 'react-hot-toast';

const VisualizarAprovacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exporting, handleExportPDF, handleExportExcel } = useAprovacaoExport();
  
  const [cotacao, setCotacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('padrao');
  const [showModalRenegociacao, setShowModalRenegociacao] = useState(false);
  const [showModalAprovacao, setShowModalAprovacao] = useState(false);
  const [showModalRejeicao, setShowModalRejeicao] = useState(false);
  const [saving, setSaving] = useState(false);
  const [produtoDestacado, setProdutoDestacado] = useState(null);
  const [aprovacoesResumo, setAprovacoesResumo] = useState({
    melhorPreco: [],
    melhorEntrega: [],
    melhorPagamento: []
  });

  // Hook para calcular itens com melhores critérios
  const { itensMelhorPreco, itensMelhorEntrega, itensMelhorPagamento } = useItensMelhoresCriterios(cotacao);

  useEffect(() => {
    fetchCotacao();
  }, [id]);

  const fetchCotacao = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aprovacoesService.getAprovacao(id);
      
      // Verificar se a resposta tem a estrutura esperada
      const cotacaoData = response.data || response;
      
      // Transformar a estrutura para ser compatível com o modal de renegociação
      if (cotacaoData.itens && Array.isArray(cotacaoData.itens)) {
        // Agrupar itens por fornecedor para criar a estrutura esperada pelo modal
        const fornecedoresMap = {};
        
        cotacaoData.itens.forEach(item => {
          const fornecedorId = item.fornecedor_id;
          const fornecedorNome = item.fornecedor_nome;
          
          if (!fornecedoresMap[fornecedorId]) {
            fornecedoresMap[fornecedorId] = {
              id: fornecedorId,
              nome: fornecedorNome,
              fornecedor_id: item.fornecedor_codigo,
              prazo_pagamento: item.prazo_pagamento,
              tipo_frete: item.tipo_frete,
              valor_frete: item.valor_frete,
              frete: item.frete,
              difal: item.difal,
              produtos: []
            };
          }
          
          // Adicionar produto ao fornecedor
          fornecedoresMap[fornecedorId].produtos.push({
            id: item.item_id,
            produto_id: item.produto_id,
            nome: item.produto_nome,
            qtde: item.quantidade,
            un: item.unidade,
            valor_unitario: item.valor_unitario,
            primeiro_valor: item.primeiro_valor,
            valor_anterior: item.valor_anterior,
            total: item.total,
            difal: item.difal,
            ipi: item.ipi,
            prazo_entrega: item.prazo_entrega,
            data_entrega_fn: item.data_entrega_fn,
            ult_valor_aprovado: item.ult_valor_aprovado,
            ult_fornecedor_aprovado: item.ult_fornecedor_aprovado
          });
        });
        
        // Converter o map para array
        cotacaoData.fornecedores = Object.values(fornecedoresMap);
      }
      
      setCotacao(cotacaoData);
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      setError(error.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor) => {
    if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico === 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorNumerico);
  };

  const formatarData = (data) => {
    if (!data) return 'Data não informada';
    
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) {
        return 'Data inválida';
      }
      return dataObj.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'em_analise': 'Aguardando Análise do Supervisor',
      'aguardando_aprovacao': 'Aguardando Aprovação da Gestão',
      'aguardando_aprovacao_supervisor': 'Aguardando Análise do Supervisor',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'renegociacao': 'Em Renegociação'
    };
    return statusMap[status] || status;
  };

  const calcularEstatisticas = () => {
    if (!cotacao || !cotacao.itens) {
      return {
        totalProdutos: 0,
        totalFornecedores: 0,
        totalQuantidade: 0,
        valorTotal: 0
      };
    }

    const produtosUnicos = new Set();
    const fornecedoresUnicos = new Set();
    let totalQuantidade = 0;
    let valorTotal = 0;

    cotacao.itens.forEach(item => {
      produtosUnicos.add(item.produto_id || item.produto_nome);
      fornecedoresUnicos.add(item.fornecedor_nome);
      totalQuantidade += parseFloat(item.quantidade) || 0;
      valorTotal += (parseFloat(item.valor_unitario) || 0) * (parseFloat(item.quantidade) || 0);
    });

    return {
      totalProdutos: produtosUnicos.size,
      totalFornecedores: fornecedoresUnicos.size,
      totalQuantidade,
      valorTotal
    };
  };

  const calcularAnaliseComparativa = () => {
    if (!cotacao || !cotacao.itens) {
      return {
        valorTotalMelhorPreco: 0,
        valorTotalMedio: 0,
        economia: 0,
        economiaPercentual: 0,
        economiaUltimoAprovado: 0,
        economiaUltimoAprovadoPercentual: 0,
        valorSawing: 0,
        valorSawingPercentual: 0,
        estatisticas: {
          totalProdutos: 0,
          totalFornecedores: 0,
          totalQuantidade: 0,
          valorTotal: 0
        }
      };
    }

    const estatisticas = calcularEstatisticas();
    
    // Calcular melhor preço por produto
    const produtosMelhorPreco = {};
    let valorTotalMelhorPreco = 0;
    let valorTotalMedio = 0;
    let valorTotalUltimoAprovado = 0;
    let valorTotalPrimeiroValor = 0;
    let valorTotalAtual = 0;

    cotacao.itens.forEach(item => {
      const produtoId = item.produto_id || item.produto_nome;
      const valorUnitario = parseFloat(item.valor_unitario) || 0;
      const quantidade = parseFloat(item.quantidade) || 0;
      const ultimoValorAprovado = parseFloat(item.ult_valor_aprovado) || 0;
      const primeiroValor = parseFloat(item.primeiro_valor) || parseFloat(item.valor_anterior) || valorUnitario;

      if (!produtosMelhorPreco[produtoId]) {
        produtosMelhorPreco[produtoId] = {
          melhorPreco: valorUnitario,
          precoMedio: valorUnitario,
          quantidade: quantidade,
          count: 1,
          ultimoValorAprovado: ultimoValorAprovado,
          primeiroValor: primeiroValor
        };
      } else {
        produtosMelhorPreco[produtoId].precoMedio += valorUnitario;
        produtosMelhorPreco[produtoId].count += 1;
        if (valorUnitario < produtosMelhorPreco[produtoId].melhorPreco) {
          produtosMelhorPreco[produtoId].melhorPreco = valorUnitario;
        }
        // Manter o maior valor aprovado e primeiro valor
        if (ultimoValorAprovado > produtosMelhorPreco[produtoId].ultimoValorAprovado) {
          produtosMelhorPreco[produtoId].ultimoValorAprovado = ultimoValorAprovado;
        }
        if (primeiroValor > produtosMelhorPreco[produtoId].primeiroValor) {
          produtosMelhorPreco[produtoId].primeiroValor = primeiroValor;
        }
      }
    });

    // Calcular totais
    Object.values(produtosMelhorPreco).forEach(produto => {
      produto.precoMedio = produto.precoMedio / produto.count;
      valorTotalMelhorPreco += produto.melhorPreco * produto.quantidade;
      valorTotalMedio += produto.precoMedio * produto.quantidade;
      valorTotalUltimoAprovado += produto.ultimoValorAprovado * produto.quantidade;
      valorTotalPrimeiroValor += produto.primeiroValor * produto.quantidade;
      valorTotalAtual += produto.melhorPreco * produto.quantidade;
    });

    const economia = valorTotalMedio - valorTotalMelhorPreco;
    const economiaPercentual = valorTotalMedio > 0 ? (economia / valorTotalMedio * 100) : 0;
    
    const economiaUltimoAprovado = valorTotalUltimoAprovado - valorTotalMelhorPreco;
    const economiaUltimoAprovadoPercentual = valorTotalUltimoAprovado > 0 ? 
      (economiaUltimoAprovado / valorTotalUltimoAprovado * 100) : 0;
    
    const valorSawing = valorTotalPrimeiroValor - valorTotalAtual;
    const valorSawingPercentual = valorTotalPrimeiroValor > 0 ? 
      (valorSawing / valorTotalPrimeiroValor * 100) : 0;

    return {
      valorTotalMelhorPreco,
      valorTotalMedio,
      economia,
      economiaPercentual,
      economiaUltimoAprovado,
      economiaUltimoAprovadoPercentual,
      valorSawing,
      valorSawingPercentual,
      estatisticas
    };
  };

  // Funções de aprovação (substituindo as do supervisor)
  const handleAprovar = () => {
    setShowModalAprovacao(true);
  };

  const handleRejeitar = () => {
    setShowModalRejeicao(true);
  };

  const handleRenegociar = () => {
    setShowModalRenegociacao(true);
  };

  const handleRenegociacaoConfirmada = () => {
    setShowModalRenegociacao(false);
    // Recarregar a cotação para mostrar as mudanças
    fetchCotacao();
  };

  const handleAprovacaoSuccess = () => {
    setShowModalAprovacao(false);
    navigate('/aprovacoes');
  };

  const handleRejeicaoSuccess = () => {
    setShowModalRejeicao(false);
    navigate('/aprovacoes');
  };

  const handleProdutoClick = (produtoNome, fornecedorNome) => {
    // Mudar para visualização padrão quando clicar em um produto
    setViewMode('padrao');
    
    // Destacar o produto e fornecedor por 3 segundos
    setProdutoDestacado({ produto: produtoNome, fornecedor: fornecedorNome });
    setTimeout(() => {
      setProdutoDestacado(null);
    }, 3000);
  };



  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        <FaClock size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Carregando cotação...</h3>
        <p>Aguarde um momento</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <FaExclamationTriangle size={48} className="mx-auto mb-4 text-red-400" />
        <h3 className="text-xl font-semibold mb-2">Erro ao carregar cotação</h3>
        <p className="mb-4">{error}</p>
        <Button onClick={fetchCotacao} variant="primary" className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!cotacao) {
    return (
      <div className="text-center py-10 text-red-500">
        <FaExclamationTriangle size={48} className="mx-auto mb-4 text-red-400" />
        <h3 className="text-xl font-semibold mb-2">Cotação não encontrada</h3>
        <p>A cotação solicitada não foi encontrada</p>
      </div>
    );
  }

  const estatisticas = calcularEstatisticas();

  return (
    <div className="p-6">
      <HeaderAprovacoes cotacao={cotacao} />
      
      <InformacoesAprovacao cotacao={cotacao} />
      
      <ResumoAprovacao estatisticas={estatisticas} formatarValor={formatarValor} />
      
      <BotoesVisualizacaoAprovacao viewMode={viewMode} setViewMode={setViewMode} />

      {/* Botões de Exportação */}
      <BotoesExportacaoAprovacao
        viewMode={viewMode}
        cotacao={cotacao}
        formatarValor={formatarValor}
        onExportPDF={(viewMode, cotacao) => handleExportPDF(id, viewMode, cotacao)}
        onExportExcel={(viewMode, cotacao) => handleExportExcel(id, viewMode, cotacao)}
      />

      {/* Conteúdo das Visualizações */}
      <VisualizacaoPadraoAprovacao 
        cotacao={cotacao} 
        active={viewMode === 'padrao'} 
        formatarValor={formatarValor}
        produtoDestacado={produtoDestacado}
      />
      <AnaliseComparativaAprovacao 
        cotacao={cotacao} 
        active={viewMode === 'resumo'} 
        formatarValor={formatarValor}
        onAprovacaoChange={setAprovacoesResumo}
      />
      <MelhorPrecoAprovacao 
        cotacao={cotacao}
        active={viewMode === 'melhor-preco'} 
        formatarValor={formatarValor}
        onProdutoClick={handleProdutoClick}
      />
      <MelhorPrazoEntregaAprovacao 
        cotacao={cotacao}
        active={viewMode === 'melhor-entrega'} 
        formatarValor={formatarValor} 
      />
      <MelhorPrazoPagamentoAprovacao 
        cotacao={cotacao}
        active={viewMode === 'melhor-pagamento'} 
        formatarValor={formatarValor}
      />
      <ComparativoProdutosAprovacao 
        cotacao={cotacao} 
        active={viewMode === 'comparativo'} 
        formatarValor={formatarValor} 
      />

      {/* Resumo das Aprovações Selecionadas */}
      {viewMode === 'resumo' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">📋 Resumo das Aprovações Selecionadas</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded border">
              <h5 className="font-medium text-green-700 mb-2">💰 Melhor Preço</h5>
              <p className="text-sm text-gray-600">
                {aprovacoesResumo.melhorPreco.length} produto(s) selecionado(s)
              </p>
            </div>
            <div className="bg-white p-3 rounded border">
              <h5 className="font-medium text-blue-700 mb-2">🚚 Melhor Entrega</h5>
              <p className="text-sm text-gray-600">
                {aprovacoesResumo.melhorEntrega.length} produto(s) selecionado(s)
              </p>
            </div>
            <div className="bg-white p-3 rounded border">
              <h5 className="font-medium text-purple-700 mb-2">💳 Melhor Pagamento</h5>
              <p className="text-sm text-gray-600">
                {aprovacoesResumo.melhorPagamento.length} produto(s) selecionado(s)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação de Aprovação (substituindo os do supervisor) */}
      <div className="flex gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleAprovar}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-green-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaCheckCircle size={16} />
          {saving ? 'Aprovando...' : 'Aprovar Cotação'}
        </button>
        <button
          onClick={handleRejeitar}
          disabled={saving}
          className="bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-red-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaTimesCircle size={16} />
          {saving ? 'Rejeitando...' : 'Rejeitar Cotação'}
        </button>
        <button
          onClick={handleRenegociar}
          disabled={saving}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-orange-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSync size={16} />
          {saving ? 'Renegociando...' : 'Renegociar Cotação'}
        </button>
      </div>

      {/* Modal de Renegociação */}
      {showModalRenegociacao && (
        <ModalRenegociacao
          cotacao={cotacao}
          onClose={() => setShowModalRenegociacao(false)}
          onConfirm={handleRenegociacaoConfirmada}
        />
      )}

      {/* Modal de Aprovação */}
      {showModalAprovacao && (
        <ModalAprovacao
          cotacao={cotacao}
          onClose={() => setShowModalAprovacao(false)}
          onSuccess={handleAprovacaoSuccess}
          itensMelhorPreco={itensMelhorPreco}
          itensMelhorEntrega={itensMelhorEntrega}
          itensMelhorPagamento={itensMelhorPagamento}
        />
      )}

      {/* Modal de Rejeição */}
      {showModalRejeicao && (
        <ModalRejeicao
          cotacao={cotacao}
          onClose={() => setShowModalRejeicao(false)}
          onSuccess={handleRejeicaoSuccess}
        />
      )}
    </div>
  );
};

export default VisualizarAprovacao;
