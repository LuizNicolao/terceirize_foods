/**
 * Página de Análise do Supervisor
 * Interface para análise detalhada de cotações
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
import HeaderSupervisor from '../../components/supervisor/HeaderSupervisor';
import InformacoesSupervisor from '../../components/supervisor/InformacoesSupervisor';
import ResumoSupervisor from '../../components/supervisor/ResumoSupervisor';
import BotoesVisualizacaoSupervisor from '../../components/supervisor/BotoesVisualizacaoSupervisor';
import BotoesAcaoSupervisor from '../../components/supervisor/BotoesAcaoSupervisor';
import BotoesExportacaoSupervisor from '../../components/supervisor/BotoesExportacaoSupervisor';
import { supervisorService } from '../../services/supervisor';
import { useSupervisorExport } from '../../hooks/useSupervisorExport';
import {
  VisualizacaoPadrao,
  AnaliseComparativa,
  MelhorPreco,
  MelhorPrazoEntrega,
  MelhorPrazoPagamento,
  ComparativoProdutos
} from './components/visualizacoes';

const AnalisarCotacaoSupervisor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exporting, handleExportPDF, handleExportExcel } = useSupervisorExport();
  
  const [cotacao, setCotacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('padrao');
  const [showModalRenegociacao, setShowModalRenegociacao] = useState(false);
  const [saving, setSaving] = useState(false);
  const [produtoDestacado, setProdutoDestacado] = useState(null);

  useEffect(() => {
    fetchCotacao();
  }, [id]);

  const fetchCotacao = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await supervisorService.fetchCotacao(id);
      
      // Verificar se a resposta tem a estrutura esperada
      const cotacaoData = response.data || response;
      
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

  const handleEnviarGestor = async () => {
    if (window.confirm('Tem certeza que deseja enviar esta cotação para análise da gerência?')) {
      setSaving(true);
      
      try {
        const data = await supervisorService.enviarParaGestor(id, {
          id: cotacao.id,
          status: 'aguardando_aprovacao'
        });
        
        alert(data.message || 'Cotação enviada para gerência com sucesso!');
        navigate('/aprovacoes');
      } catch (error) {
        console.error('Erro ao enviar para gerência:', error);
        alert(error.message || 'Erro ao conectar com o servidor');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSolicitarRenegociacao = () => {
    setShowModalRenegociacao(true);
  };

  const handleRenegociacaoConfirmada = () => {
    setShowModalRenegociacao(false);
    // Recarregar a cotação para mostrar as mudanças
    fetchCotacao();
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
      <HeaderSupervisor cotacao={cotacao} />
      
      <InformacoesSupervisor cotacao={cotacao} />
      
      <ResumoSupervisor estatisticas={estatisticas} formatarValor={formatarValor} />
      
      <BotoesVisualizacaoSupervisor viewMode={viewMode} setViewMode={setViewMode} />

      {/* Botões de Exportação */}
      <BotoesExportacaoSupervisor
        viewMode={viewMode}
        cotacao={cotacao}
        formatarValor={formatarValor}
        onExportPDF={(viewMode, cotacao) => handleExportPDF(id, viewMode, cotacao)}
        onExportExcel={(viewMode, cotacao) => handleExportExcel(id, viewMode, cotacao)}
      />

      {/* Conteúdo das Visualizações */}
      <VisualizacaoPadrao 
        cotacao={cotacao} 
        active={viewMode === 'padrao'} 
        formatarValor={formatarValor}
        produtoDestacado={produtoDestacado}
      />
      <AnaliseComparativa 
        cotacao={cotacao} 
        active={viewMode === 'resumo'} 
        formatarValor={formatarValor}
      />
      <MelhorPreco 
        cotacao={cotacao}
        active={viewMode === 'melhor-preco'} 
        formatarValor={formatarValor}
        onProdutoClick={handleProdutoClick}
      />
      <MelhorPrazoEntrega 
        cotacao={cotacao}
        active={viewMode === 'melhor-entrega'} 
        formatarValor={formatarValor} 
      />
      <MelhorPrazoPagamento 
        cotacao={cotacao}
        active={viewMode === 'melhor-pagamento'} 
        formatarValor={formatarValor}
      />
      <ComparativoProdutos 
        cotacao={cotacao} 
        active={viewMode === 'comparativo'} 
        formatarValor={formatarValor} 
      />

      <BotoesAcaoSupervisor 
        onEnviarGestor={handleEnviarGestor}
        onSolicitarRenegociacao={handleSolicitarRenegociacao}
        saving={saving}
        cotacao={cotacao}
      />

      {/* Modal de Renegociação */}
      {showModalRenegociacao && (
        <ModalRenegociacao
          cotacao={cotacao}
          onClose={() => setShowModalRenegociacao(false)}
          onConfirm={handleRenegociacaoConfirmada}
        />
      )}
    </div>
  );
};

export default AnalisarCotacaoSupervisor;
