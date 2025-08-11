import React from 'react';
import styled from 'styled-components';
import { 
  FaChartBar, 
  FaDollarSign, 
  FaTruck, 
  FaCreditCard,
  FaCrown,
  FaMedal,
  FaAward
} from 'react-icons/fa';
import { colors } from '../../design-system';
import { Card } from '../../design-system/components';

// Componentes estilizados
const ComparativoContainer = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

const ComparativoTitle = styled.h4`
  color: ${colors.neutral.darkGray};
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProdutosComparativo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProdutoComparativoItem = styled.div`
  background: ${colors.neutral.white};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const ProdutoComparativoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid ${colors.primary.green};
`;

const ProdutoComparativoTitle = styled.h5`
  margin: 0;
  color: ${colors.neutral.darkGray};
  font-size: 16px;
  font-weight: 600;
`;

const ProdutoInfo = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const ProdutoQtdInfo = styled.span`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const ProdutoFornecedoresCount = styled.span`
  color: ${colors.neutral.gray};
  font-size: 12px;
  font-weight: 500;
`;

const FornecedoresComparativo = styled.div`
  overflow-x: auto;
`;

const ComparativoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: ${colors.neutral.white};
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ComparativoTh = styled.th`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const ComparativoTd = styled.td`
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
`;

const FornecedorComparativoRow = styled.tr`
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.melhor-preco {
    background: #f8fff8;
    border-left: 4px solid ${colors.primary.green};
  }
`;

const Rank = styled.span`
  text-align: center;
`;

const RankBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.rank-1 {
    background: #ffd700;
    color: #000;
  }
  
  &.rank-2 {
    background: #c0c0c0;
    color: #000;
  }
  
  &.rank-3 {
    background: #cd7f32;
    color: #fff;
  }
  
  &.rank-outros {
    background: #f0f0f0;
    color: ${colors.neutral.gray};
  }
`;

const FornecedorNome = styled.span`
  font-weight: 500;
  color: ${colors.neutral.darkGray};
`;

const ValorUnitario = styled.span`
  font-weight: 500;
  text-align: right;
`;

const ValorComDifal = styled.span`
  color: ${colors.primary.green};
  font-weight: 600;
`;

const PrazoEntrega = styled.span`
  color: ${colors.neutral.gray};
  font-size: 11px;
  text-align: center;
`;

const DataEntrega = styled.span`
  color: ${colors.neutral.gray};
  font-size: 11px;
  text-align: center;
`;

const PrazoPagamento = styled.span`
  color: ${colors.neutral.gray};
  font-size: 11px;
  text-align: center;
`;

const Economia = styled.span`
  font-weight: 600;
  text-align: right;
  font-size: 11px;
  
  &.melhor {
    color: #2e7d32;
    font-weight: 700;
  }
  
  &.mais-caro {
    color: #c62828;
  }
  
  &.igual {
    color: ${colors.neutral.gray};
  }
`;

const ViewContainer = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

const ComparativoProdutos = ({ cotacao, active, formatarValor }) => {
  if (!cotacao || !cotacao.fornecedores) return null;

  // Agrupar produtos por ID e coletar dados de todos os fornecedores
  const produtosComparativo = {};
  
  cotacao.fornecedores.forEach(fornecedor => {
    if (fornecedor.produtos) {
      fornecedor.produtos.forEach(produto => {
        const produtoId = produto.produto_id || produto.nome;
        const produtoNome = produto.nome;
        
        if (!produtosComparativo[produtoId]) {
          produtosComparativo[produtoId] = {
            nome: produtoNome,
            quantidade: parseFloat(produto.qtde) || 0,
            un: produto.un || 'UN',
            fornecedores: []
          };
        }
        
        produtosComparativo[produtoId].fornecedores.push({
          nome: fornecedor.nome,
          valorUnitario: parseFloat(produto.valor_unitario) || 0,
          prazoEntrega: produto.prazo_entrega || '-',
          prazoPagamento: produto.prazo_pagamento || '-',
          ultimoValorAprovado: parseFloat(produto.ult_valor_aprovado) || 0
        });
      });
    }
  });

  // Ordenar fornecedores por valor unitário para cada produto
  Object.values(produtosComparativo).forEach(produto => {
    produto.fornecedores.sort((a, b) => a.valorUnitario - b.valorUnitario);
  });

  const getRankBadge = (index) => {
    if (index === 0) return <RankBadge className="rank-1">🥇</RankBadge>;
    if (index === 1) return <RankBadge className="rank-2">🥈</RankBadge>;
    if (index === 2) return <RankBadge className="rank-3">🥉</RankBadge>;
    return <RankBadge className="rank-outros">{index + 1}</RankBadge>;
  };

  const getEconomiaClass = (valorAtual, valorAnterior) => {
    if (!valorAnterior || valorAnterior === 0) return 'igual';
    if (valorAtual < valorAnterior) return 'melhor';
    if (valorAtual > valorAnterior) return 'mais-caro';
    return 'igual';
  };

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return dataString;
    }
  };

  return (
    <ViewContainer active={active}>
      <ComparativoContainer>
        <ComparativoTitle>
          <FaChartBar />
          Comparativo de Valores por Produto
        </ComparativoTitle>
        
        <ProdutosComparativo>
          {Object.values(produtosComparativo).map((produto, produtoIndex) => (
            <ProdutoComparativoItem key={produtoIndex}>
              <ProdutoComparativoHeader>
                <ProdutoComparativoTitle>{produto.nome}</ProdutoComparativoTitle>
                <ProdutoInfo>
                  <ProdutoQtdInfo>
                    {produto.quantidade} {produto.un}
                  </ProdutoQtdInfo>
                  <ProdutoFornecedoresCount>
                    {produto.fornecedores.length} fornecedor{produto.fornecedores.length > 1 ? 'es' : ''}
                  </ProdutoFornecedoresCount>
                </ProdutoInfo>
              </ProdutoComparativoHeader>
              
              <FornecedoresComparativo>
                <ComparativoTable>
                  <thead>
                    <tr>
                      <ComparativoTh>Rank</ComparativoTh>
                      <ComparativoTh>Fornecedor</ComparativoTh>
                      <ComparativoTh>Valor Unitário</ComparativoTh>
                      <ComparativoTh>Valor Total</ComparativoTh>
                      <ComparativoTh>Últ. Vlr. Aprovado</ComparativoTh>
                      <ComparativoTh>Economia</ComparativoTh>
                      <ComparativoTh>Prazo Entrega</ComparativoTh>
                      <ComparativoTh>Prazo Pagamento</ComparativoTh>
                    </tr>
                  </thead>
                  <tbody>
                    {produto.fornecedores.map((fornecedor, fornecedorIndex) => {
                      const valorTotal = fornecedor.valorUnitario * produto.quantidade;
                      const economia = fornecedor.ultimoValorAprovado > 0 ? 
                        (fornecedor.ultimoValorAprovado - fornecedor.valorUnitario) * produto.quantidade : 0;
                      const isMelhorPreco = fornecedorIndex === 0;
                      
                      return (
                        <FornecedorComparativoRow 
                          key={fornecedorIndex}
                          className={isMelhorPreco ? 'melhor-preco' : ''}
                        >
                          <ComparativoTd>
                            <Rank>{getRankBadge(fornecedorIndex)}</Rank>
                          </ComparativoTd>
                          <ComparativoTd>
                            <FornecedorNome>{fornecedor.nome}</FornecedorNome>
                          </ComparativoTd>
                          <ComparativoTd>
                            <ValorUnitario>
                              {isMelhorPreco ? (
                                <ValorComDifal>{formatarValor(fornecedor.valorUnitario)}</ValorComDifal>
                              ) : (
                                formatarValor(fornecedor.valorUnitario)
                              )}
                            </ValorUnitario>
                          </ComparativoTd>
                          <ComparativoTd>
                            <ValorUnitario>{formatarValor(valorTotal)}</ValorUnitario>
                          </ComparativoTd>
                          <ComparativoTd>
                            <ValorUnitario>
                              {fornecedor.ultimoValorAprovado > 0 ? 
                                formatarValor(fornecedor.ultimoValorAprovado) : '-'
                              }
                            </ValorUnitario>
                          </ComparativoTd>
                          <ComparativoTd>
                            <Economia className={getEconomiaClass(fornecedor.valorUnitario, fornecedor.ultimoValorAprovado)}>
                              {fornecedor.ultimoValorAprovado > 0 ? formatarValor(economia) : '-'}
                            </Economia>
                          </ComparativoTd>
                          <ComparativoTd>
                            <PrazoEntrega>{fornecedor.prazoEntrega}</PrazoEntrega>
                          </ComparativoTd>
                          <ComparativoTd>
                            <PrazoPagamento>{fornecedor.prazoPagamento}</PrazoPagamento>
                          </ComparativoTd>
                        </FornecedorComparativoRow>
                      );
                    })}
                  </tbody>
                </ComparativoTable>
              </FornecedoresComparativo>
            </ProdutoComparativoItem>
          ))}
        </ProdutosComparativo>
      </ComparativoContainer>
    </ViewContainer>
  );
};

export default ComparativoProdutos; 