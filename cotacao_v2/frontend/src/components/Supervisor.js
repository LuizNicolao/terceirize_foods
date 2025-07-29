import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import styled from 'styled-components';
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
  FaCalculator
} from 'react-icons/fa';
import { colors, typography, shadows } from '../design-system';
import { Button, Card } from '../design-system/components';

// Componentes estilizados
const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${colors.neutral.darkGray};
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: ${colors.neutral.gray};
  font-size: 16px;
  margin: 0;
`;

// Cards de Status
const StatusCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatusCard = styled(Card)`
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid ${props => props.color};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &.selected {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    transform: translateY(-4px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color};
    opacity: 0.3;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.neutral.white};
  font-size: 20px;
  box-shadow: 0 4px 12px ${props => props.$bgColor}40;
`;

const CardTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardCount = styled.span`
  color: ${colors.neutral.darkGray};
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
`;

const CardLabel = styled.span`
  color: ${colors.neutral.gray};
  font-size: 14px;
  font-weight: 500;
`;

const CardValue = styled.span`
  color: ${colors.neutral.darkGray};
  font-size: 18px;
  font-weight: 600;
`;

// Filtros
const FilterSection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const FilterLabel = styled.label`
  color: ${colors.neutral.darkGray};
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: ${colors.neutral.white};
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 250px;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

// Grid de Cotações
const CotacoesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const CotacaoCard = styled(Card)`
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: ${colors.primary.green};
  }
`;

const CotacaoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const CotacaoInfo = styled.div`
  flex: 1;
`;

const CotacaoTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const CotacaoSubtitle = styled.p`
  color: ${colors.neutral.gray};
  font-size: 14px;
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'aguardando_aprovacao_supervisor':
        return colors.status.warning;
      case 'renegociacao':
        return colors.secondary.orange;
      case 'em_analise':
        return colors.secondary.blue;
      case 'pendente':
        return colors.neutral.gray;
      case 'aprovada':
        return colors.status.success;
      case 'rejeitada':
        return colors.status.error;
      default:
        return colors.neutral.gray;
    }
  }};
  color: ${colors.neutral.white};
  text-transform: capitalize;
`;

const CotacaoDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: ${colors.neutral.gray};
  font-size: 14px;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  font-weight: 600;
`;

const TotalValue = styled.span`
  color: ${colors.primary.green};
  font-size: 16px;
  font-weight: 700;
`;

const CotacaoActions = styled.div`
  display: flex;
  gap: 12px;
`;

const AnalyzeButton = styled(Button)`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: translateY(-1px);
  }
`;

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(Card)`
  background: ${colors.neutral.white};
  border-radius: 12px;
  width: 95vw;
  max-width: 1400px;
  height: 90vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${colors.neutral.gray};
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.neutral.lightGray};
    color: ${colors.neutral.darkGray};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

// Estados vazios
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${colors.neutral.gray};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${colors.neutral.lightGray};
`;

const EmptyTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  color: ${colors.neutral.gray};
  font-size: 16px;
  margin: 0;
`;

const RetryButton = styled(Button)`
  margin-top: 16px;
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: translateY(-1px);
  }
`;

// Componente de conteúdo do modal de análise
const AnalysisModalContent = ({ 
  cotacao, 
  analysisData, 
  setAnalysisData, 
  analysisView, 
  setAnalysisView, 
  onClose, 
  onSubmit 
}) => {
  const formatarValor = (valor) => {
    if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico === 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorNumerico);
  };

  const calcularTotalCotacao = (cotacao) => {
    let total = 0;
    if (cotacao.fornecedores) {
      cotacao.fornecedores.forEach(fornecedor => {
        if (fornecedor.produtos) {
          fornecedor.produtos.forEach(produto => {
            const valorUnitario = parseFloat(produto.valor_unitario) || 0;
            const quantidade = parseFloat(produto.qtde) || 0;
            total += valorUnitario * quantidade;
          });
        }
      });
    }
    return total;
  };

  const calcularAnalisePreco = (cotacao) => {
    if (!cotacao.fornecedores || cotacao.fornecedores.length === 0) {
      return {
        melhorFornecedor: null,
        piorFornecedor: null,
        economiaMedia: 0,
        variacaoMedia: 0,
        totalProdutos: 0
      };
    }

    const analises = [];
    let totalEconomia = 0;
    let totalVariacao = 0;
    let totalProdutos = 0;

    cotacao.fornecedores.forEach(fornecedor => {
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          const valorAtual = parseFloat(produto.valor_unitario) || 0;
          const valorAnterior = parseFloat(produto.valor_anterior) || 0;
          
          if (valorAnterior > 0) {
            const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
            const economia = valorAnterior - valorAtual;
            
            analises.push({
              fornecedor: fornecedor.nome,
              produto: produto.nome,
              valorAtual,
              valorAnterior,
              variacao,
              economia
            });
            
            totalEconomia += economia;
            totalVariacao += variacao;
            totalProdutos++;
          }
        });
      }
    });

    const economiaMedia = totalProdutos > 0 ? totalEconomia / totalProdutos : 0;
    const variacaoMedia = totalProdutos > 0 ? totalVariacao / totalProdutos : 0;

    const fornecedoresRanking = cotacao.fornecedores.map(fornecedor => {
      let totalValor = 0;
      let totalProdutos = 0;
      
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          totalValor += parseFloat(produto.valor_unitario) || 0;
          totalProdutos++;
        });
      }
      
      return {
        nome: fornecedor.nome,
        valorMedio: totalProdutos > 0 ? totalValor / totalProdutos : 0,
        totalValor
      };
    }).sort((a, b) => a.valorMedio - b.valorMedio);

    return {
      melhorFornecedor: fornecedoresRanking[0] || null,
      piorFornecedor: fornecedoresRanking[fornecedoresRanking.length - 1] || null,
      economiaMedia,
      variacaoMedia,
      totalProdutos,
      analises
    };
  };

  const analisePreco = calcularAnalisePreco(cotacao);
  const totalCotacao = calcularTotalCotacao(cotacao);

  // Funções auxiliares para as visualizações
  const getProdutosUnicos = () => {
    const produtos = new Map();
    
    cotacao.fornecedores?.forEach(fornecedor => {
      fornecedor.produtos?.forEach(produto => {
        const key = produto.nome;
        if (!produtos.has(key)) {
          produtos.set(key, {
            nome: produto.nome,
            qtde: produto.qtde,
            un: produto.un,
            melhorPreco: null,
            melhorEntrega: null,
            melhorPagamento: null
          });
        }
        
        const produtoUnico = produtos.get(key);
        const valorUnitario = parseFloat(produto.valor_unitario) || 0;
        const prazoEntrega = parseInt(produto.prazo_entrega) || 0;
        const prazoPagamento = parseInt(fornecedor.prazo_pagamento) || 0;
        
        // Melhor preço
        if (!produtoUnico.melhorPreco || valorUnitario < produtoUnico.melhorPreco.valor) {
          produtoUnico.melhorPreco = {
            valor: valorUnitario,
            fornecedor: fornecedor.nome
          };
        }
        
        // Melhor entrega
        if (prazoEntrega > 0 && (!produtoUnico.melhorEntrega || prazoEntrega < produtoUnico.melhorEntrega.prazo)) {
          produtoUnico.melhorEntrega = {
            prazo: prazoEntrega,
            fornecedor: fornecedor.nome
          };
        }
        
        // Melhor pagamento
        if (prazoPagamento > 0 && (!produtoUnico.melhorPagamento || prazoPagamento > produtoUnico.melhorPagamento.prazo)) {
          produtoUnico.melhorPagamento = {
            prazo: prazoPagamento,
            fornecedor: fornecedor.nome
          };
        }
      });
    });
    
    return Array.from(produtos.values());
  };

  const getItensMelhorPreco = () => {
    const itens = [];
    const produtosUnicos = getProdutosUnicos();
    
    produtosUnicos.forEach(produto => {
      if (produto.melhorPreco) {
        const qtde = parseFloat(produto.qtde) || 0;
        const valorTotal = produto.melhorPreco.valor * qtde;
        const ultimoValorAprovado = parseFloat(produto.ultimoValorAprovado) || 0;
        const economia = ultimoValorAprovado - valorTotal;
        
        itens.push({
          produto: produto.nome,
          fornecedor: produto.melhorPreco.fornecedor,
          qtde: produto.qtde,
          un: produto.un,
          valorUnitario: produto.melhorPreco.valor,
          valorTotal,
          ultimoValorAprovado,
          economia,
          prazoEntrega: produto.melhorEntrega?.prazo || 0,
          prazoPagamento: produto.melhorPagamento?.prazo || 0
        });
      }
    });
    
    return itens.sort((a, b) => b.economia - a.economia);
  };

  const getItensMelhorEntrega = () => {
    const itens = [];
    
    cotacao.fornecedores?.forEach(fornecedor => {
      fornecedor.produtos?.forEach(produto => {
        const prazoEntrega = parseInt(produto.prazo_entrega) || 0;
        if (prazoEntrega > 0) {
          itens.push({
            produto: produto.nome,
            fornecedor: fornecedor.nome,
            qtde: produto.qtde,
            prazoEntrega,
            valorUnitario: parseFloat(produto.valor_unitario) || 0,
            prazoPagamento: parseInt(fornecedor.prazo_pagamento) || 0,
            dataEntregaFn: produto.data_entrega_fn
          });
        }
      });
    });
    
    return itens.sort((a, b) => a.prazoEntrega - b.prazoEntrega);
  };

  const getItensMelhorPagamento = () => {
    const itens = [];
    
    cotacao.fornecedores?.forEach(fornecedor => {
      const prazoPagamento = parseInt(fornecedor.prazo_pagamento) || 0;
      if (prazoPagamento > 0) {
        fornecedor.produtos?.forEach(produto => {
          itens.push({
            produto: produto.nome,
            fornecedor: fornecedor.nome,
            qtde: produto.qtde,
            prazoPagamento,
            valorUnitario: parseFloat(produto.valor_unitario) || 0,
            prazoEntrega: parseInt(produto.prazo_entrega) || 0
          });
        });
      }
    });
    
    return itens.sort((a, b) => b.prazoPagamento - a.prazoPagamento);
  };

  const calcularValorTotalMelhorPreco = () => {
    return getItensMelhorPreco().reduce((total, item) => total + item.valorTotal, 0);
  };

  const calcularEconomiaMedia = () => {
    const itens = getItensMelhorPreco();
    const totalEconomia = itens.reduce((total, item) => total + item.economia, 0);
    return totalEconomia;
  };

  const calcularEconomiaMediaPercentual = () => {
    const itens = getItensMelhorPreco();
    const totalAtual = itens.reduce((total, item) => total + item.valorTotal, 0);
    const totalAnterior = itens.reduce((total, item) => total + item.ultimoValorAprovado, 0);
    
    if (totalAnterior === 0) return 0;
    return ((totalAnterior - totalAtual) / totalAnterior) * 100;
  };

  const calcularEconomiaUltimoAprovado = () => {
    return calcularEconomiaMedia(); // Mesma lógica por enquanto
  };

  const calcularEconomiaUltimoAprovadoPercentual = () => {
    return calcularEconomiaMediaPercentual(); // Mesma lógica por enquanto
  };

  const calcularValorSawing = () => {
    return calcularEconomiaMedia(); // Mesma lógica por enquanto
  };

  const calcularValorSawingPercentual = () => {
    return calcularEconomiaMediaPercentual(); // Mesma lógica por enquanto
  };

  const getTotalProdutos = () => {
    return cotacao.fornecedores?.reduce((total, f) => total + (f.produtos?.length || 0), 0) || 0;
  };

  return (
    <div>
      {/* Resumo do Orçamento */}
      <ResumoOrcamento>
        <h4><FaChartPie /> Resumo Orçamento Melhor Preço</h4>
        <ResumoCards>
          <ResumoCard>
            <ResumoValor>{cotacao.fornecedores?.reduce((total, f) => total + (f.produtos?.length || 0), 0) || 0}</ResumoValor>
            <ResumoLabel>Produtos</ResumoLabel>
          </ResumoCard>
          <ResumoCard>
            <ResumoValor>{cotacao.fornecedores?.length || 0}</ResumoValor>
            <ResumoLabel>Fornecedores</ResumoLabel>
          </ResumoCard>
          <ResumoCard>
            <ResumoValor>{cotacao.fornecedores?.reduce((total, f) => total + (f.produtos?.reduce((sum, p) => sum + (parseFloat(p.qtde) || 0), 0) || 0), 0) || 0}</ResumoValor>
            <ResumoLabel>Quantidade Total</ResumoLabel>
          </ResumoCard>
          <ResumoCard>
            <ResumoValor>{formatarValor(totalCotacao)}</ResumoValor>
            <ResumoLabel>Valor Total</ResumoLabel>
          </ResumoCard>
        </ResumoCards>
      </ResumoOrcamento>

      {/* Botões de visualização */}
      <ViewButtonsContainer>
        <ViewButton 
          active={analysisView === 'padrao'} 
          onClick={() => setAnalysisView('padrao')}
        >
          <FaList /> Visualização Padrão
        </ViewButton>
        <ViewButton 
          active={analysisView === 'resumo'} 
          onClick={() => setAnalysisView('resumo')}
        >
          <FaChartBar /> Resumo Comparativo
        </ViewButton>
        <ViewButton 
          active={analysisView === 'melhor-preco'} 
          onClick={() => setAnalysisView('melhor-preco')}
        >
          <FaTag /> Melhor Preço
        </ViewButton>
        <ViewButton 
          active={analysisView === 'melhor-entrega'} 
          onClick={() => setAnalysisView('melhor-entrega')}
        >
          <FaTruck /> Melhor Prazo de Entrega
        </ViewButton>
        <ViewButton 
          active={analysisView === 'melhor-pagamento'} 
          onClick={() => setAnalysisView('melhor-pagamento')}
        >
          <FaCreditCard /> Melhor Prazo de Pagamento
        </ViewButton>
      </ViewButtonsContainer>

      {/* Conteúdo da análise */}
      <AnalysisContainer>
        {analysisView === 'padrao' && (
          <AnalysisView>
            {/* Resumo da cotação */}
            <CotacaoSummary>
              <h4>Resumo da Cotação</h4>
              <SummaryGrid>
                <SummaryItem>
                  <span className="label">Comprador:</span>
                  <span className="value">{cotacao.comprador}</span>
                </SummaryItem>
                <SummaryItem>
                  <span className="label">Data Criação:</span>
                  <span className="value">{new Date(cotacao.data_criacao).toLocaleDateString('pt-BR')}</span>
                </SummaryItem>
                <SummaryItem>
                  <span className="label">Fornecedores:</span>
                  <span className="value">{cotacao.fornecedores?.length || 0}</span>
                </SummaryItem>
                <SummaryItem>
                  <span className="label">Total Produtos:</span>
                  <span className="value">{cotacao.fornecedores?.reduce((total, f) => total + (f.produtos?.length || 0), 0) || 0}</span>
                </SummaryItem>
                <SummaryItem>
                  <span className="label">Valor Total:</span>
                  <span className="value">{formatarValor(totalCotacao)}</span>
                </SummaryItem>
                <SummaryItem>
                  <span className="label">Economia Estimada:</span>
                  <span className="value">{formatarValor(analisePreco.economiaMedia)}</span>
                </SummaryItem>
              </SummaryGrid>
            </CotacaoSummary>

            {/* Métricas de preço */}
            <PriceMetrics>
              <h4>Métricas de Preço</h4>
              <MetricsCards>
                <MetricCard className={analisePreco.economiaMedia > 0 ? 'positive' : analisePreco.economiaMedia < 0 ? 'negative' : 'neutral'}>
                  <div className="card-header">
                    <i className={analisePreco.economiaMedia > 0 ? 'fas fa-arrow-down' : analisePreco.economiaMedia < 0 ? 'fas fa-arrow-up' : 'fas fa-equals'}></i>
                    <span className="card-title">Economia Média</span>
                  </div>
                  <div className="card-content">
                    <div className="card-value">
                      {formatarValor(analisePreco.economiaMedia)}
                    </div>
                    <div className="card-subtitle">
                      Por produto
                    </div>
                  </div>
                </MetricCard>

                <MetricCard className={analisePreco.variacaoMedia < 0 ? 'positive' : analisePreco.variacaoMedia > 0 ? 'negative' : 'neutral'}>
                  <div className="card-header">
                    <i className={analisePreco.variacaoMedia < 0 ? 'fas fa-arrow-down' : analisePreco.variacaoMedia > 0 ? 'fas fa-arrow-up' : 'fas fa-equals'}></i>
                    <span className="card-title">Variação Média</span>
                  </div>
                  <div className="card-content">
                    <div className="card-value">
                      {analisePreco.variacaoMedia.toFixed(2)}%
                    </div>
                    <div className="card-subtitle">
                      Em relação ao anterior
                    </div>
                  </div>
                </MetricCard>

                <MetricCard>
                  <div className="card-header">
                    <i className="fas fa-store"></i>
                    <span className="card-title">Melhor Fornecedor</span>
                  </div>
                  <div className="card-content">
                    <div className="card-value">
                      {analisePreco.melhorFornecedor?.nome || 'N/A'}
                    </div>
                    <div className="card-subtitle">
                      Menor valor médio
                    </div>
                  </div>
                </MetricCard>
              </MetricsCards>
            </PriceMetrics>

            {/* Produtos em renegociação */}
            {cotacao.produtos_renegociar && cotacao.produtos_renegociar.length > 0 && (
              <ProdutosRenegociacao>
                <h5>
                  <FaExclamationTriangle />
                  Produtos em Renegociação
                </h5>
                <RenegociacaoResumo>
                  <ResumoItem>
                    <i className="fas fa-box"></i>
                    <strong>{cotacao.produtos_renegociar.length}</strong> produtos selecionados
                  </ResumoItem>
                </RenegociacaoResumo>
                <ProdutosList>
                  {cotacao.produtos_renegociar.map((produto, index) => (
                    <ProdutoItem key={index}>
                      <span className="produto-nome">{produto.produto_nome}</span>
                      <span className="produto-fornecedor">Fornecedor: {produto.fornecedor_nome}</span>
                    </ProdutoItem>
                  ))}
                </ProdutosList>
              </ProdutosRenegociacao>
            )}
          </AnalysisView>
        )}

        {analysisView === 'resumo' && (
          <AnalysisView>
            <h4>Resumo Comparativo</h4>
            <TabelaResumo>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Un</th>
                    <th colSpan="2">Melhor Preço</th>
                    <th colSpan="2">Melhor Prazo Entrega</th>
                    <th colSpan="2">Melhor Prazo Pagamento</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th>Valor</th>
                    <th>Fornecedor</th>
                    <th>Prazo</th>
                    <th>Fornecedor</th>
                    <th>Prazo</th>
                    <th>Fornecedor</th>
                  </tr>
                </thead>
                <tbody>
                  {getProdutosUnicos().map((produto, index) => (
                    <tr key={index}>
                      <td>{produto.nome}</td>
                      <td>{produto.qtde}</td>
                      <td>{produto.un}</td>
                      <td className="melhor-preco">{formatarValor(produto.melhorPreco?.valor)}</td>
                      <td>{produto.melhorPreco?.fornecedor}</td>
                      <td className="melhor-entrega">{produto.melhorEntrega?.prazo || '-'}</td>
                      <td>{produto.melhorEntrega?.fornecedor || '-'}</td>
                      <td className="melhor-pagamento">{produto.melhorPagamento?.prazo || '-'}</td>
                      <td>{produto.melhorPagamento?.fornecedor || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabelaResumo>
          </AnalysisView>
        )}

        {analysisView === 'melhor-preco' && (
          <AnalysisView>
            <ResumoEconomia>
              <ResumoCardEconomia>
                <h4><FaDollarSign /> Valor Total</h4>
                <ResumoValorEconomia>{formatarValor(calcularValorTotalMelhorPreco())}</ResumoValorEconomia>
                <ResumoPorcentagem>{getTotalProdutos()} itens</ResumoPorcentagem>
              </ResumoCardEconomia>
              <ResumoCardEconomia>
                <h4><FaChartLine /> Economia vs Média dos Preços</h4>
                <ResumoValorEconomia>{formatarValor(calcularEconomiaMedia())}</ResumoValorEconomia>
                <ResumoPorcentagem>{calcularEconomiaMediaPercentual().toFixed(2)}%</ResumoPorcentagem>
              </ResumoCardEconomia>
              <ResumoCardEconomia>
                <h4><FaHistory /> Diferença vs Último Aprovado</h4>
                <ResumoValorEconomia>{formatarValor(calcularEconomiaUltimoAprovado())}</ResumoValorEconomia>
                <ResumoPorcentagem>{calcularEconomiaUltimoAprovadoPercentual().toFixed(2)}%</ResumoPorcentagem>
              </ResumoCardEconomia>
              <ResumoCardEconomia>
                <h4><FaCalculator /> Valor Sawing</h4>
                <ResumoValorEconomia>{formatarValor(calcularValorSawing())}</ResumoValorEconomia>
                <ResumoPorcentagem>{calcularValorSawingPercentual().toFixed(2)}%</ResumoPorcentagem>
              </ResumoCardEconomia>
            </ResumoEconomia>
            
            <h4>Itens com Melhor Preço</h4>
            <TabelaMelhorPreco>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Fornecedor</th>
                    <th>Qtd</th>
                    <th>Un</th>
                    <th>Valor Unitário</th>
                    <th>Valor Total</th>
                    <th>Últ. Vlr. Aprovado</th>
                    <th>Economia</th>
                    <th>Prazo Entrega</th>
                    <th>Prazo Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {getItensMelhorPreco().map((item, index) => (
                    <tr key={index}>
                      <td>{item.produto}</td>
                      <td>{item.fornecedor}</td>
                      <td>{item.qtde}</td>
                      <td>{item.un}</td>
                      <td className="valor-unitario melhor-preco">{formatarValor(item.valorUnitario)}</td>
                      <td className="valor-total">{formatarValor(item.valorTotal)}</td>
                      <td>{formatarValor(item.ultimoValorAprovado)}</td>
                      <td className={item.economia > 0 ? 'economia-positiva' : 'economia-negativa'}>
                        {formatarValor(item.economia)}
                      </td>
                      <td>{item.prazoEntrega} dias</td>
                      <td>{item.prazoPagamento} dias</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabelaMelhorPreco>
          </AnalysisView>
        )}

        {analysisView === 'melhor-entrega' && (
          <AnalysisView>
            <h4>Itens com Melhor Prazo de Entrega</h4>
            <TabelaMelhorEntrega>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Fornecedor</th>
                    <th>Qtd</th>
                    <th>Prazo Entrega</th>
                    <th>Valor Unitário</th>
                    <th>Prazo Pagamento</th>
                    <th>Data Entrega Fn</th>
                  </tr>
                </thead>
                <tbody>
                  {getItensMelhorEntrega().map((item, index) => (
                    <tr key={index}>
                      <td>{item.produto}</td>
                      <td>{item.fornecedor}</td>
                      <td>{item.qtde}</td>
                      <td className="melhor-entrega">{item.prazoEntrega} dias</td>
                      <td>{formatarValor(item.valorUnitario)}</td>
                      <td>{item.prazoPagamento} dias</td>
                      <td>{item.dataEntregaFn || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabelaMelhorEntrega>
          </AnalysisView>
        )}

        {analysisView === 'melhor-pagamento' && (
          <AnalysisView>
            <h4>Itens com Melhor Prazo de Pagamento</h4>
            <TabelaMelhorPagamento>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Fornecedor</th>
                    <th>Qtd</th>
                    <th>Prazo Pagamento</th>
                    <th>Valor Unitário</th>
                    <th>Prazo Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {getItensMelhorPagamento().map((item, index) => (
                    <tr key={index}>
                      <td>{item.produto}</td>
                      <td>{item.fornecedor}</td>
                      <td>{item.qtde}</td>
                      <td className="melhor-pagamento">{item.prazoPagamento} dias</td>
                      <td>{formatarValor(item.valorUnitario)}</td>
                      <td>{item.prazoEntrega} dias</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabelaMelhorPagamento>
          </AnalysisView>
        )}

        {analysisView === 'entrega' && (
          <AnalysisView>
            <h4>Análise de Prazos de Entrega</h4>
            <DeliveryAnalysis>
              <h5>Ranking de Fornecedores por Prazo</h5>
              <DeliveryRanking>
                {cotacao.fornecedores?.map((fornecedor, index) => {
                  const prazos = fornecedor.produtos?.map(p => parseInt(p.prazo_entrega) || 0).filter(p => p > 0) || [];
                  const prazoMedio = prazos.length > 0 ? prazos.reduce((a, b) => a + b, 0) / prazos.length : 0;
                  
                  return (
                    <div key={fornecedor.id} className="delivery-item">
                      <div className="delivery-header">
                        <div className="delivery-rank">
                          <span className="rank-badge rank-{index + 1}">{index + 1}</span>
                        </div>
                        <div className="delivery-supplier-info">
                          <div className="supplier-name">{fornecedor.nome}</div>
                          <div className="delivery-date">
                            Prazo médio: {prazoMedio > 0 ? `${Math.round(prazoMedio)} dias` : 'Não informado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </DeliveryRanking>
            </DeliveryAnalysis>
          </AnalysisView>
        )}

        {analysisView === 'pagamento' && (
          <AnalysisView>
            <h4>Análise de Condições de Pagamento</h4>
            <PaymentAnalysis>
              <h5>Ranking de Fornecedores por Prazo de Pagamento</h5>
              <PaymentRanking>
                {cotacao.fornecedores?.map((fornecedor, index) => {
                  const prazoPagamento = parseInt(fornecedor.prazo_pagamento) || 0;
                  
                  return (
                    <div key={fornecedor.id} className="payment-item">
                      <div className="payment-header">
                        <div className="payment-rank">
                          <span className="rank-badge rank-{index + 1}">{index + 1}</span>
                        </div>
                        <div className="payment-supplier-info">
                          <div className="supplier-name">{fornecedor.nome}</div>
                          <div className="payment-details">
                            <div className="payment-term">
                              Prazo: {prazoPagamento > 0 ? `${prazoPagamento} dias` : 'Não informado'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </PaymentRanking>
            </PaymentAnalysis>
          </AnalysisView>
        )}
      </AnalysisContainer>

      {/* Formulário de decisão */}
      <AnalysisForm>
        <h4>
          <FaCheckCircle />
          Decisão do Supervisor
        </h4>
        
        <DecisionOptions>
          <h5>
            <FaThumbsUp />
            Opções de Aprovação
          </h5>
          <OptionsGrid>
            <OptionCard>
              <input
                type="radio"
                id="enviar-gestor"
                name="decisao"
                value="enviar-gestor"
                checked={analysisData.decisao === 'enviar-gestor'}
                onChange={(e) => setAnalysisData({...analysisData, decisao: e.target.value})}
              />
              <label htmlFor="enviar-gestor">
                <div className="option-title">Enviar para Gestor</div>
                <div className="option-description">
                  Aprovar e enviar para análise final da gerência
                </div>
              </label>
            </OptionCard>

            <OptionCard>
              <input
                type="radio"
                id="voltar-renegociacao"
                name="decisao"
                value="voltar-renegociacao"
                checked={analysisData.decisao === 'voltar-renegociacao'}
                onChange={(e) => setAnalysisData({...analysisData, decisao: e.target.value})}
              />
              <label htmlFor="voltar-renegociacao">
                <div className="option-title">Solicitar Renegociação</div>
                <div className="option-description">
                  Retornar para renegociação com fornecedores
                </div>
              </label>
            </OptionCard>
          </OptionsGrid>
        </DecisionOptions>

        <FormGroup>
          <label htmlFor="observacoes">
            <FaFileAlt />
            Observações Gerais
          </label>
          <textarea
            id="observacoes"
            value={analysisData.observacoes}
            onChange={(e) => setAnalysisData({...analysisData, observacoes: e.target.value})}
            placeholder="Digite suas observações sobre a cotação..."
            rows="3"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="justificativa">
            <FaExclamationTriangle />
            Justificativa da Decisão *
          </label>
          <textarea
            id="justificativa"
            value={analysisData.justificativa}
            onChange={(e) => setAnalysisData({...analysisData, justificativa: e.target.value})}
            placeholder="Justifique sua decisão..."
            rows="4"
            required
          />
        </FormGroup>
      </AnalysisForm>

      {/* Ações do modal */}
      <ModalActions>
        <Button onClick={onClose} variant="secondary">
          <FaTimesCircle /> Cancelar
        </Button>
        <Button onClick={onSubmit} variant="primary">
          <FaCheckCircle /> Enviar Análise
        </Button>
      </ModalActions>
    </div>
  );
};

// Componentes estilizados adicionais para o modal
const ViewButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
`;

const ViewButton = styled.button`
  background: ${props => props.active ? colors.primary.green : colors.neutral.lightGray};
  color: ${props => props.active ? colors.neutral.white : colors.neutral.darkGray};
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.active ? colors.primary.darkGreen : colors.neutral.gray};
    color: ${colors.neutral.white};
  }
`;

const AnalysisContainer = styled.div`
  margin-bottom: 24px;
`;

const AnalysisView = styled.div`
  animation: slideInUp 0.3s ease;
`;

const CotacaoSummary = styled.div`
  background: ${colors.neutral.lightGray};
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;

  h4 {
    color: ${colors.neutral.darkGray};
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    color: ${colors.neutral.gray};
    font-size: 14px;
    font-weight: 500;
  }

  .value {
    color: ${colors.neutral.darkGray};
    font-size: 14px;
    font-weight: 600;
  }
`;

const PriceMetrics = styled.div`
  margin-bottom: 24px;

  h4 {
    color: ${colors.neutral.darkGray};
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
`;

const MetricsCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const MetricCard = styled.div`
  background: ${colors.neutral.white};
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.positive {
    border-left: 4px solid ${colors.status.success};
  }

  &.negative {
    border-left: 4px solid ${colors.status.error};
  }

  &.neutral {
    border-left: 4px solid ${colors.neutral.gray};
  }
`;

const PriceDetails = styled.div`
  h5 {
    color: ${colors.neutral.darkGray};
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
`;

const ProductPriceAnalysis = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DeliveryAnalysis = styled.div`
  h5 {
    color: ${colors.neutral.darkGray};
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
`;

const DeliveryRanking = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DeliveryItem = styled.div`
  background: ${colors.neutral.white};
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PaymentAnalysis = styled.div`
  h5 {
    color: ${colors.neutral.darkGray};
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
`;

const PaymentRanking = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PaymentItem = styled.div`
  background: ${colors.neutral.white};
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ProdutosRenegociacao = styled.div`
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 1px solid #ffcc02;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;

  h5 {
    color: #e65100;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const RenegociacaoResumo = styled.div`
  margin-bottom: 16px;
`;

const ResumoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e65100;
  font-size: 14px;

  i {
    font-size: 16px;
  }

  strong {
    font-weight: 600;
  }
`;

const ProdutosList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProdutoItem = styled.div`
  background: ${colors.neutral.white};
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .produto-nome {
    font-weight: 600;
    color: #e65100;
  }

  .produto-fornecedor {
    font-size: 12px;
    color: #e65100;
  }
`;

const AnalysisForm = styled.div`
  background: ${colors.neutral.lightGray};
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;

  h4 {
    color: ${colors.neutral.darkGray};
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const DecisionOptions = styled.div`
  margin-bottom: 24px;

  h5 {
    color: ${colors.neutral.darkGray};
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const OptionCard = styled.div`
  input[type="radio"] {
    display: none;
  }

  label {
    display: block;
    background: ${colors.neutral.white};
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: ${colors.primary.green};
      transform: translateY(-1px);
    }
  }

  input[type="radio"]:checked + label {
    border-color: ${colors.primary.green};
    background: ${colors.primary.lightGreen}20;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    color: ${colors.neutral.darkGray};
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${colors.primary.green};
      box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    }

    &::placeholder {
      color: ${colors.neutral.gray};
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
`;

// Componentes estilizados para o modal otimizado
const ResumoOrcamento = styled.div`
  background: ${colors.neutral.lightGray};
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;

  h4 {
    color: ${colors.neutral.darkGray};
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ResumoCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ResumoCard = styled.div`
  background: ${colors.neutral.white};
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ResumoValor = styled.div`
  color: ${colors.primary.green};
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const ResumoLabel = styled.div`
  color: ${colors.neutral.gray};
  font-size: 14px;
  font-weight: 500;
`;

const TabelaResumo = styled.div`
  overflow-x: auto;
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9em;
    background: white;
  }

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #555;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:hover {
    background-color: #f8f9fa;
    transition: background-color 0.2s ease;
  }

  .melhor-preco {
    color: #28a745;
    font-weight: 500;
    position: relative;
  }

  .melhor-preco::before {
    content: '↓';
    position: absolute;
    left: -15px;
    color: #28a745;
  }

  .melhor-entrega {
    color: #007bff;
    font-weight: 500;
    position: relative;
  }

  .melhor-entrega::before {
    content: '⚡';
    position: absolute;
    left: -15px;
    color: #007bff;
  }

  .melhor-pagamento {
    color: #6f42c1;
    font-weight: 500;
    position: relative;
  }

  .melhor-pagamento::before {
    content: '💳';
    position: absolute;
    left: -15px;
    color: #6f42c1;
  }
`;

const ResumoEconomia = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ResumoCardEconomia = styled.div`
  background: ${colors.neutral.white};
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  h4 {
    color: ${colors.neutral.darkGray};
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ResumoValorEconomia = styled.div`
  color: ${colors.primary.green};
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const ResumoPorcentagem = styled.div`
  color: ${colors.neutral.gray};
  font-size: 12px;
  font-weight: 500;
`;

const TabelaMelhorPreco = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9em;
    background: white;
  }

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #555;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:hover {
    background-color: #f8f9fa;
    transition: background-color 0.2s ease;
  }

  .valor-unitario.melhor-preco {
    background-color: #d4edda;
    font-weight: bold;
    text-align: center;
  }

  .valor-total {
    font-weight: 600;
  }

  .economia-positiva {
    color: #28a745;
    font-weight: 600;
  }

  .economia-negativa {
    color: #dc3545;
    font-weight: 600;
  }
`;

const TabelaMelhorEntrega = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9em;
    background: white;
  }

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #555;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:hover {
    background-color: #f8f9fa;
    transition: background-color 0.2s ease;
  }

  .melhor-entrega {
    background-color: #d1ecf1;
    font-weight: bold;
    text-align: center;
  }
`;

const TabelaMelhorPagamento = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9em;
    background: white;
  }

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #555;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:hover {
    background-color: #f8f9fa;
    transition: background-color 0.2s ease;
  }

  .melhor-pagamento {
    background-color: #e2d9f3;
    font-weight: bold;
    text-align: center;
  }
`;

const Supervisor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFornecedor, setSelectedFornecedor] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showComparison, setShowComparison] = useState(false);
  const [showProductsList, setShowProductsList] = useState(false);
  const [statusStats, setStatusStats] = useState({
    total: 0,
    aguardandoAnalise: 0,
    emRenegociacao: 0
  });

  useEffect(() => {
    fetchCotacoes();
  }, []);

  useEffect(() => {
    if (cotacoes.length > 0) {
      const stats = {
        total: cotacoes.length,
        aguardandoAnalise: cotacoes.filter(c => c.status === 'aguardando_aprovacao_supervisor').length,
        emRenegociacao: cotacoes.filter(c => c.status === 'renegociacao').length
      };

      setStatusStats(stats);
    }
  }, [cotacoes]);

  const fetchCotacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes/pendentes-supervisor`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCotacoes(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar cotações');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisClick = (cotacao) => {
    navigate(`/analisar-cotacao-supervisor/${cotacao.id}`);
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
      // Se a data já está no formato brasileiro (dd/mm/yyyy)
      if (typeof data === 'string' && data.includes('/')) {
        const partes = data.split('/');
        if (partes.length === 3) {
          const dia = parseInt(partes[0]);
          const mes = parseInt(partes[1]) - 1;
          const ano = parseInt(partes[2]);
          return new Date(ano, mes, dia).toLocaleDateString('pt-BR');
        }
      }
      
      // Para outros formatos, tentar criar Date normalmente
      const dataObj = new Date(data);
      
      // Verificar se a data é válida
      if (isNaN(dataObj.getTime())) {
        console.warn('Data inválida recebida:', data);
        return 'Data inválida';
      }
      
      return dataObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error, data);
      return 'Data inválida';
    }
  };

  const converterDataBR = (dataString) => {
    if (!dataString) return null;
    
    const partes = dataString.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0]);
      const mes = parseInt(partes[1]) - 1;
      const ano = parseInt(partes[2]);
      return new Date(ano, mes, dia);
    }
    
    return new Date(dataString);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendente': { text: 'Pendente', class: 'status-pendente' },
      'aprovada': { text: 'Aprovada', class: 'status-aprovado' },
      'rejeitada': { text: 'Rejeitada', class: 'status-rejeitado' },
      'em_analise': { text: 'Aguardando Análise Supervisor', class: 'status-analise' }
    };
    
    const config = statusConfig[status] || statusConfig['pendente'];
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const calcularTotalCotacao = (cotacao) => {
    let total = 0;
    if (cotacao.fornecedores) {
      cotacao.fornecedores.forEach(fornecedor => {
        if (fornecedor.produtos) {
          fornecedor.produtos.forEach(produto => {
            const valorUnitario = parseFloat(produto.valor_unitario) || 0;
            const quantidade = parseFloat(produto.qtde) || 0;
            total += valorUnitario * quantidade;
          });
        }
      });
    }
    return total;
  };

  const calcularValorUnitarioComDifalEFrete = (item, fornecedor) => {
    const valorUnitario = parseFloat(item.valor_unitario) || 0;
    const difal = parseFloat(item.difal) || 0;
    const valorFrete = parseFloat(fornecedor.valor_frete) || 0;
    const totalProdutos = fornecedor.produtos ? fornecedor.produtos.length : 1;
    
    return valorUnitario + difal + (valorFrete / totalProdutos);
  };

  const calcularVariacaoPercentual = (valorAtual, valorAnterior) => {
    if (!valorAnterior || valorAnterior === 0) return 0;
    return ((valorAtual - valorAnterior) / valorAnterior) * 100;
  };

  const formatarVariacao = (variacao, tipo = 'percentual') => {
    if (tipo === 'percentual') {
      return `${variacao > 0 ? '+' : ''}${variacao.toFixed(2)}%`;
    }
    return formatarValor(variacao);
  };

  const formatarVariacaoTotal = (valorAtual, valorAnterior, tipo = 'percentual') => {
    const variacao = valorAtual - valorAnterior;
    const variacaoPercentual = calcularVariacaoPercentual(valorAtual, valorAnterior);
    
    if (tipo === 'percentual') {
      return `${variacaoPercentual > 0 ? '+' : ''}${variacaoPercentual.toFixed(2)}%`;
    }
    return formatarValor(variacao);
  };

  const getVariacaoClass = (variacao) => {
    if (variacao > 0) return 'variacao-positiva';
    if (variacao < 0) return 'variacao-negativa';
    return 'variacao-neutra';
  };

  const handleProductDetails = (produto) => {
    // Função para lidar com detalhes do produto
  };

  const getFilteredAndSortedProducts = (fornecedor) => {
    if (!fornecedor.produtos) return [];
    
    let produtos = fornecedor.produtos;
    
    // Filtrar por termo de busca
    if (searchTerm) {
      produtos = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Ordenar
    produtos.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'nome':
          aValue = a.nome.toLowerCase();
          bValue = b.nome.toLowerCase();
          break;
        case 'valor':
          aValue = parseFloat(a.valor_unitario) || 0;
          bValue = parseFloat(b.valor_unitario) || 0;
          break;
        case 'quantidade':
          aValue = parseFloat(a.qtde) || 0;
          bValue = parseFloat(b.qtde) || 0;
          break;
        default:
          aValue = a.nome.toLowerCase();
          bValue = b.nome.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return produtos;
  };

  const getPaginatedProducts = (products, page = 1, itemsPerPage = 20) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  const getTotalProductsCount = (cotacao) => {
    let total = 0;
    if (cotacao.fornecedores) {
      cotacao.fornecedores.forEach(fornecedor => {
        if (fornecedor.produtos) {
          total += fornecedor.produtos.length;
        }
      });
    }
    return total;
  };

  const calcularAnalisePreco = (cotacao) => {
    if (!cotacao.fornecedores || cotacao.fornecedores.length === 0) {
      return {
        melhorFornecedor: null,
        piorFornecedor: null,
      economiaMedia: 0,
        variacaoMedia: 0,
        totalProdutos: 0
      };
    }

    const analises = [];
    let totalEconomia = 0;
    let totalVariacao = 0;
    let totalProdutos = 0;
    
    cotacao.fornecedores.forEach(fornecedor => {
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          const valorAtual = parseFloat(produto.valor_unitario) || 0;
          const valorAnterior = parseFloat(produto.valor_anterior) || 0;
          
          if (valorAnterior > 0) {
            const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
            const economia = valorAnterior - valorAtual;
            
            analises.push({
              fornecedor: fornecedor.nome,
              produto: produto.nome,
              valorAtual,
              valorAnterior,
              variacao,
              economia
            });
            
            totalEconomia += economia;
            totalVariacao += variacao;
            totalProdutos++;
          }
        });
      }
    });

    const economiaMedia = totalProdutos > 0 ? totalEconomia / totalProdutos : 0;
    const variacaoMedia = totalProdutos > 0 ? totalVariacao / totalProdutos : 0;

    // Encontrar melhor e pior fornecedor
    const fornecedoresRanking = cotacao.fornecedores.map(fornecedor => {
      let totalValor = 0;
      let totalProdutos = 0;
      
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          totalValor += parseFloat(produto.valor_unitario) || 0;
          totalProdutos++;
        });
      }
      
      return {
        nome: fornecedor.nome,
        valorMedio: totalProdutos > 0 ? totalValor / totalProdutos : 0,
        totalValor
      };
    }).sort((a, b) => a.valorMedio - b.valorMedio);

    return {
      melhorFornecedor: fornecedoresRanking[0] || null,
      piorFornecedor: fornecedoresRanking[fornecedoresRanking.length - 1] || null,
      economiaMedia,
      variacaoMedia,
      totalProdutos,
      analises
    };
  };

  const calcularAnaliseEntrega = (cotacao) => {
    if (!cotacao.fornecedores || cotacao.fornecedores.length === 0) {
      return {
        melhorPrazo: null,
        piorPrazo: null,
        prazoMedio: 0
      };
    }

    const prazos = [];
    
    cotacao.fornecedores.forEach(fornecedor => {
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          if (produto.prazo_entrega) {
            const prazo = parseInt(produto.prazo_entrega) || 0;
            if (prazo > 0) {
              prazos.push({
                fornecedor: fornecedor.nome,
                produto: produto.nome,
                prazo
              });
            }
          }
        });
      }
    });

    if (prazos.length === 0) {
      return {
        melhorPrazo: null,
        piorPrazo: null,
        prazoMedio: 0
      };
    }

    prazos.sort((a, b) => a.prazo - b.prazo);
    
    const prazoMedio = prazos.reduce((sum, item) => sum + item.prazo, 0) / prazos.length;

    return {
      melhorPrazo: prazos[0],
      piorPrazo: prazos[prazos.length - 1],
      prazoMedio: Math.round(prazoMedio),
      prazos
    };
  };

  const calcularAnalisePagamento = (cotacao) => {
    if (!cotacao.fornecedores || cotacao.fornecedores.length === 0) {
      return {
        melhorPrazo: null,
        piorPrazo: null,
        prazoMedio: 0
      };
    }

    const prazosPagamento = [];
    
    cotacao.fornecedores.forEach(fornecedor => {
      if (fornecedor.prazo_pagamento) {
        const prazo = parseInt(fornecedor.prazo_pagamento) || 0;
        if (prazo > 0) {
          prazosPagamento.push({
          fornecedor: fornecedor.nome,
            prazo
          });
        }
      }
    });

    if (prazosPagamento.length === 0) {
      return {
        melhorPrazo: null,
        piorPrazo: null,
        prazoMedio: 0
      };
    }

    prazosPagamento.sort((a, b) => a.prazo - b.prazo);
    
    const prazoMedio = prazosPagamento.reduce((sum, item) => sum + item.prazo, 0) / prazosPagamento.length;

    return {
      melhorPrazo: prazosPagamento[0],
      piorPrazo: prazosPagamento[prazosPagamento.length - 1],
      prazoMedio: Math.round(prazoMedio),
      prazosPagamento
    };
  };

  const calcularResumoComparativo = (cotacao) => {
    const analisePreco = calcularAnalisePreco(cotacao);
    const analiseEntrega = calcularAnaliseEntrega(cotacao);
    const analisePagamento = calcularAnalisePagamento(cotacao);

    return {
      preco: analisePreco,
      entrega: analiseEntrega,
      pagamento: analisePagamento,
      totalFornecedores: cotacao.fornecedores ? cotacao.fornecedores.length : 0,
      totalProdutos: getTotalProductsCount(cotacao)
    };
  };

  const getFilteredCotacoes = () => {
    let filtered = cotacoes;

                          if (searchTerm) {
      filtered = filtered.filter(cotacao =>
        cotacao.comprador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cotacao.id?.toString().includes(searchTerm)
      );
    }

    if (selectedFornecedor) {
      filtered = filtered.filter(cotacao =>
        cotacao.fornecedores?.some(f => 
          f.nome?.toLowerCase().includes(selectedFornecedor.toLowerCase())
        )
      );
    }

    return filtered;
  };

  if (loading) {
                          return (
      <Layout>
        <Container>
          <EmptyState>
            <EmptyIcon>⏱</EmptyIcon>
            <EmptyTitle>Carregando cotações...</EmptyTitle>
            <EmptyText>Aguarde um momento</EmptyText>
          </EmptyState>
        </Container>
      </Layout>
    );
  }

  if (error) {
                          return (
      <Layout>
        <Container>
          <EmptyState>
            <EmptyIcon>✗</EmptyIcon>
            <EmptyTitle>Erro ao carregar cotações</EmptyTitle>
            <EmptyText>{error}</EmptyText>
            <RetryButton onClick={fetchCotacoes}>
              Tentar Novamente
            </RetryButton>
          </EmptyState>
        </Container>
      </Layout>
    );
  }

  const filteredCotacoes = getFilteredCotacoes();
                          
                          return (
    <Layout>
      <Container>
        <Header>
          <Title>Painel do Supervisor</Title>
          <Subtitle>Analise e aprove cotações pendentes</Subtitle>
        </Header>

        {/* Cards de Status */}
        <StatusCardsGrid>
          <StatusCard color={colors.status.warning}>
            <CardHeader>
              <CardIcon $bgColor={colors.status.warning}>
                <FaClock />
              </CardIcon>
              <CardTitle>Aguardando Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <CardCount>{statusStats.aguardandoAnalise}</CardCount>
              <CardLabel>Cotações para análise</CardLabel>
            </CardContent>
          </StatusCard>

          <StatusCard color={colors.secondary.orange}>
            <CardHeader>
              <CardIcon $bgColor={colors.secondary.orange}>
                <FaSyncAlt />
              </CardIcon>
              <CardTitle>Em Renegociação</CardTitle>
            </CardHeader>
            <CardContent>
              <CardCount>{statusStats.emRenegociacao}</CardCount>
              <CardLabel>Cotações em renegociação</CardLabel>
            </CardContent>
          </StatusCard>


        </StatusCardsGrid>

        {/* Filtros */}
        <FilterSection>
          <FilterContainer>
            <FilterLabel>
              <FaSearch />
              Buscar:
            </FilterLabel>
            <SearchInput
                              type="text"
              placeholder="Buscar por comprador ou ID da cotação..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <FilterLabel>
              <FaFilter />
              Fornecedor:
            </FilterLabel>
            <FilterSelect
              value={selectedFornecedor}
                              onChange={(e) => setSelectedFornecedor(e.target.value)}
            >
              <option value="">Todos os fornecedores</option>
              {Array.from(new Set(cotacoes.flatMap(c => 
                c.fornecedores?.map(f => f.nome) || []
              ))).map(fornecedor => (
                <option key={fornecedor} value={fornecedor}>
                  {fornecedor}
                                </option>
                              ))}
            </FilterSelect>
          </FilterContainer>
        </FilterSection>

        {/* Grid de Cotações */}
        {filteredCotacoes.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyTitle>Nenhuma cotação encontrada</EmptyTitle>
            <EmptyText>
              {searchTerm || selectedFornecedor 
                ? 'Tente ajustar os filtros de busca'
                : 'Não há cotações pendentes para análise'
              }
            </EmptyText>
          </EmptyState>
        ) : (
          <CotacoesGrid>
            {filteredCotacoes.map((cotacao) => (
              <CotacaoCard key={cotacao.id} onClick={() => handleAnalysisClick(cotacao)}>
                <CotacaoHeader>
                  <CotacaoInfo>
                    <CotacaoTitle>Cotação #{cotacao.id}</CotacaoTitle>
                    <CotacaoSubtitle>
                      {formatarData(cotacao.data_criacao)}
                    </CotacaoSubtitle>
                  </CotacaoInfo>
                  <StatusBadge status={cotacao.status}>
                    {cotacao.status === 'aguardando_aprovacao_supervisor' ? 'Aguardando Análise' :
                     cotacao.status === 'renegociacao' ? 'Em Renegociação' :
                     cotacao.status === 'em_analise' ? 'Em Análise' :
                     cotacao.status === 'pendente' ? 'Pendente' :
                     cotacao.status === 'aprovada' ? 'Aprovada' :
                     cotacao.status === 'rejeitada' ? 'Rejeitada' :
                     cotacao.status}
                  </StatusBadge>
                </CotacaoHeader>

                <CotacaoDetails>
                  <DetailRow>
                    <DetailLabel>Comprador:</DetailLabel>
                    <DetailValue>{cotacao.comprador}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Total Itens:</DetailLabel>
                    <DetailValue>{getTotalProductsCount(cotacao)}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Tipo:</DetailLabel>
                    <DetailValue>
                      {cotacao.tipo === 'programada' ? 'Programada' : 
                       cotacao.tipo === 'emergencial' ? 'Emergencial' :
                       cotacao.tipo === 'tag' ? 'TAG' : cotacao.tipo}
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>CD:</DetailLabel>
                    <DetailValue>{cotacao.centro_distribuicao || 'CD CHAPECO'}</DetailValue>
                  </DetailRow>
                </CotacaoDetails>

                <CotacaoActions>
                  <AnalyzeButton>
                    <FaEye />
                    Analisar Cotação
                  </AnalyzeButton>
                </CotacaoActions>
              </CotacaoCard>
            ))}
          </CotacoesGrid>
        )}


      </Container>
    </Layout>
  );
};

export default Supervisor; 