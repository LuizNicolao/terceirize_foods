import React from 'react';
import styled from 'styled-components';
import { 
  FaBalanceScale, 
  FaDollarSign, 
  FaPercentage, 
  FaHistory, 
  FaCalculator, 
  FaTruck 
} from 'react-icons/fa';
import { colors } from '../../design-system';
import { Card } from '../../design-system/components';

// Componentes estilizados
const AnaliseComparativa = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

const AnaliseTitle = styled.h4`
  color: ${colors.neutral.darkGray};
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AnaliseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const AnaliseCard = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: ${colors.neutral.white};
  border: 1px solid #e0e0e0;
  text-align: center;
`;

const AnaliseCardTitle = styled.h5`
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const AnaliseCardValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.color || colors.neutral.darkGray};
  margin-bottom: 4px;
`;

const AnaliseCardPercent = styled.div`
  font-size: 14px;
  color: ${colors.neutral.gray};
`;

const TableContainer = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

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
`;

const Th = styled.th`
  background-color: ${colors.neutral.lightGray};
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: ${colors.neutral.darkGray};
`;

const VariacaoCell = styled(Td)`
  color: ${props => {
    if (props.variacao > 0) return '#dc3545';
    if (props.variacao < 0) return '#28a745';
    return colors.neutral.gray;
  }};
  font-weight: 600;
`;

const ViewContainer = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

const AnaliseComparativaComponent = ({ cotacao, active, formatarValor, analise }) => {
  if (!cotacao || !cotacao.fornecedores || !analise || !analise.estatisticas) return null;

  return (
    <ViewContainer active={active}>
      <AnaliseComparativa>
        <AnaliseTitle>
          <FaBalanceScale />
          Análise Comparativa
        </AnaliseTitle>
        <AnaliseGrid>
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaDollarSign />
              Valor Total Melhor Preço
            </AnaliseCardTitle>
            <AnaliseCardValue>{formatarValor(analise.valorTotalMelhorPreco || 0)}</AnaliseCardValue>
            <AnaliseCardPercent>{analise.estatisticas?.totalProdutos || 0} produtos</AnaliseCardPercent>
          </AnaliseCard>
          
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaPercentage />
              Economia vs Média
            </AnaliseCardTitle>
            <AnaliseCardValue color={(analise.economia || 0) > 0 ? '#28a745' : '#dc3545'}>
              {formatarValor(analise.economia || 0)}
            </AnaliseCardValue>
            <AnaliseCardPercent>{(analise.economiaPercentual || 0).toFixed(2)}%</AnaliseCardPercent>
          </AnaliseCard>
          
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaHistory />
              Diferença vs Último Aprovado
            </AnaliseCardTitle>
            <AnaliseCardValue color={(analise.economiaUltimoAprovado || 0) < 0 ? '#28a745' : '#dc3545'}>
              {formatarValor(analise.economiaUltimoAprovado || 0)}
            </AnaliseCardValue>
            <AnaliseCardPercent>{(analise.economiaUltimoAprovadoPercentual || 0).toFixed(2)}%</AnaliseCardPercent>
          </AnaliseCard>
          
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaCalculator />
              Valor Sawing
            </AnaliseCardTitle>
            <AnaliseCardValue color={(analise.valorSawing || 0) > 0 ? '#28a745' : '#dc3545'}>
              {formatarValor(analise.valorSawing || 0)}
            </AnaliseCardValue>
            <AnaliseCardPercent>{(analise.valorSawingPercentual || 0).toFixed(2)}%</AnaliseCardPercent>
          </AnaliseCard>
          
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaTruck />
              Total Fornecedores
            </AnaliseCardTitle>
            <AnaliseCardValue>{analise.estatisticas?.totalFornecedores || 0}</AnaliseCardValue>
            <AnaliseCardPercent>Participantes</AnaliseCardPercent>
          </AnaliseCard>
          
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaCalculator />
              Quantidade Total
            </AnaliseCardTitle>
            <AnaliseCardValue>{(analise.estatisticas?.totalQuantidade || 0).toFixed(2)}</AnaliseCardValue>
            <AnaliseCardPercent>Unidades</AnaliseCardPercent>
          </AnaliseCard>
        </AnaliseGrid>
      </AnaliseComparativa>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th>Fornecedor</Th>
              <Th>Valor Unitário</Th>
              <Th>Valor Total</Th>
              <Th>Últ. Valor Aprovado</Th>
              <Th>Variação</Th>
              <Th>Prazo Entrega</Th>
              <Th>Prazo Pagamento</Th>
            </tr>
          </thead>
          <tbody>
            {cotacao.fornecedores.map((fornecedor, index) => (
              fornecedor.produtos && fornecedor.produtos.map((produto, prodIndex) => {
                const valorUnitario = parseFloat(produto.valor_unitario) || 0;
                const quantidade = parseFloat(produto.qtde) || 0;
                const valorTotal = valorUnitario * quantidade;
                const ultimoValor = parseFloat(produto.ult_valor_aprovado) || 0;
                const variacao = ultimoValor > 0 ? ((valorUnitario - ultimoValor) / ultimoValor * 100) : 0;

                return (
                  <tr key={`${index}-${prodIndex}`}>
                    <Td>{produto.nome}</Td>
                    <Td>{fornecedor.nome}</Td>
                    <Td>{formatarValor(valorUnitario)}</Td>
                    <Td>{formatarValor(valorTotal)}</Td>
                    <Td>{ultimoValor > 0 ? formatarValor(ultimoValor) : '-'}</Td>
                    <VariacaoCell variacao={variacao}>
                      {ultimoValor > 0 ? `${variacao > 0 ? '+' : ''}${variacao.toFixed(2)}%` : '-'}
                    </VariacaoCell>
                    <Td>{produto.prazo_entrega || '-'}</Td>
                    <Td>{produto.prazo_pagamento || '-'}</Td>
                  </tr>
                );
              })
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </ViewContainer>
  );
};

export default AnaliseComparativaComponent; 