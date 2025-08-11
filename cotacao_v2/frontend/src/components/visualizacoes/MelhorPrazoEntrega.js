import React from 'react';
import styled from 'styled-components';
import { 
  FaTruck, 
  FaDollarSign, 
  FaChartLine, 
  FaHistory, 
  FaCalculator 
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

  .melhor-entrega {
    background-color: #d1ecf1;
    font-weight: bold;
    text-align: center;
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

const ViewContainer = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

const MelhorPrazoEntrega = ({ cotacao, active, formatarValor }) => {
  if (!cotacao || !cotacao.fornecedores) return null;

  // Agrupar produtos pelo ID, mas salvar nome e fornecedor
  const produtosMelhorEntrega = {};
  let valorTotalMelhorEntrega = 0;
  let economiaTotal = 0;
  let economiaUltimoAprovado = 0;
  let valorSawing = 0;
  let totalProdutos = 0;

  cotacao.fornecedores.forEach(fornecedor => {
    if (fornecedor.produtos) {
      fornecedor.produtos.forEach(produto => {
        const produtoId = produto.produto_id || produto.nome;
        const prazoEntrega = parseFloat(produto.prazo_entrega) || 0;
        const quantidade = parseFloat(produto.qtde) || 0;
        const valorUnitario = parseFloat(produto.valor_unitario) || 0;
        const ultimoValorAprovado = parseFloat(produto.ult_valor_aprovado) || 0;
        const primeiroValor = parseFloat(produto.primeiro_valor) || valorUnitario;

        if (!produtosMelhorEntrega[produtoId]) {
          produtosMelhorEntrega[produtoId] = {
            nome: produto.nome,
            fornecedor: fornecedor.nome,
            melhorEntrega: prazoEntrega,
            quantidade: quantidade,
            valorUnitario: valorUnitario,
            ultimoValorAprovado: ultimoValorAprovado,
            primeiroValor: primeiroValor,
            prazoPagamento: produto.prazo_pagamento,
            un: produto.un,
            count: 1
          };
        } else {
          produtosMelhorEntrega[produtoId].quantidade += quantidade;
          if (prazoEntrega < produtosMelhorEntrega[produtoId].melhorEntrega) {
            produtosMelhorEntrega[produtoId].melhorEntrega = prazoEntrega;
            produtosMelhorEntrega[produtoId].fornecedor = fornecedor.nome;
            produtosMelhorEntrega[produtoId].valorUnitario = valorUnitario;
            produtosMelhorEntrega[produtoId].prazoPagamento = produto.prazo_pagamento;
          }
          // Manter o maior valor aprovado e primeiro valor
          if (ultimoValorAprovado > produtosMelhorEntrega[produtoId].ultimoValorAprovado) {
            produtosMelhorEntrega[produtoId].ultimoValorAprovado = ultimoValorAprovado;
          }
          if (primeiroValor > produtosMelhorEntrega[produtoId].primeiroValor) {
            produtosMelhorEntrega[produtoId].primeiroValor = primeiroValor;
          }
        }
        totalProdutos++;
      });
    }
  });

  // Calcular totais
  Object.values(produtosMelhorEntrega).forEach(produto => {
    const valorTotal = produto.valorUnitario * produto.quantidade;
    valorTotalMelhorEntrega += valorTotal;
    
    if (produto.ultimoValorAprovado > 0) {
      economiaUltimoAprovado += (produto.ultimoValorAprovado - produto.valorUnitario) * produto.quantidade;
    }
    
    valorSawing += (produto.primeiroValor - produto.valorUnitario) * produto.quantidade;
  });

  const economiaPercentual = valorTotalMelhorEntrega > 0 ? (economiaUltimoAprovado / valorTotalMelhorEntrega * 100) : 0;
  const valorSawingPercentual = valorTotalMelhorEntrega > 0 ? (valorSawing / valorTotalMelhorEntrega * 100) : 0;

  return (
    <ViewContainer active={active}>
      <AnaliseComparativa>
        <AnaliseTitle>
          <FaTruck />
          Melhor Prazo de Entrega por Produto
        </AnaliseTitle>
        <AnaliseGrid>
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaDollarSign />
              Valor Total
            </AnaliseCardTitle>
            <AnaliseCardValue>{formatarValor(valorTotalMelhorEntrega)}</AnaliseCardValue>
            <AnaliseCardPercent>{totalProdutos} itens</AnaliseCardPercent>
          </AnaliseCard>
          
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaChartLine />
              Economia vs Média dos Preços
            </AnaliseCardTitle>
            <AnaliseCardValue color={economiaTotal > 0 ? '#28a745' : '#dc3545'}>
              {formatarValor(economiaTotal)}
            </AnaliseCardValue>
            <AnaliseCardPercent>0%</AnaliseCardPercent>
          </AnaliseCard>
          
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaHistory />
              Diferença vs Último Aprovado
            </AnaliseCardTitle>
            <AnaliseCardValue color={economiaUltimoAprovado < 0 ? '#28a745' : '#dc3545'}>
              {formatarValor(economiaUltimoAprovado)}
            </AnaliseCardValue>
            <AnaliseCardPercent>{economiaPercentual.toFixed(2)}%</AnaliseCardPercent>
          </AnaliseCard>
          
          <AnaliseCard>
            <AnaliseCardTitle>
              <FaCalculator />
              Valor Sawing
            </AnaliseCardTitle>
            <AnaliseCardValue color={valorSawing > 0 ? '#28a745' : '#dc3545'}>
              {formatarValor(valorSawing)}
            </AnaliseCardValue>
            <AnaliseCardPercent>{valorSawingPercentual.toFixed(2)}%</AnaliseCardPercent>
          </AnaliseCard>
        </AnaliseGrid>
      </AnaliseComparativa>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th>Fornecedor</Th>
              <Th>Qtd</Th>
              <Th>Un</Th>
              <Th>Valor Unitário</Th>
              <Th>Valor Total</Th>
              <Th>Últ. Vlr. Aprovado</Th>
              <Th>Economia</Th>
              <Th>Prazo Entrega</Th>
              <Th>Prazo Pagamento</Th>
            </tr>
          </thead>
          <tbody>
            {Object.values(produtosMelhorEntrega).map((produto, idx) => {
              const valorTotal = produto.valorUnitario * produto.quantidade;
              const economia = produto.ultimoValorAprovado > 0 ? 
                (produto.ultimoValorAprovado - produto.valorUnitario) * produto.quantidade : 0;
              
              return (
                <tr key={idx}>
                  <Td>{produto.nome}</Td>
                  <Td>{produto.fornecedor}</Td>
                  <Td>{produto.quantidade}</Td>
                  <Td>{produto.un || 'UN'}</Td>
                  <Td>{formatarValor(produto.valorUnitario)}</Td>
                  <Td>{formatarValor(valorTotal)}</Td>
                  <Td>{produto.ultimoValorAprovado > 0 ? formatarValor(produto.ultimoValorAprovado) : '-'}</Td>
                  <Td className={economia > 0 ? 'economia-positiva' : 'economia-negativa'}>
                    {formatarValor(economia)}
                  </Td>
                  <Td className="melhor-entrega">{produto.melhorEntrega} dias</Td>
                  <Td>{produto.prazoPagamento || '-'}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
    </ViewContainer>
  );
};

export default MelhorPrazoEntrega; 