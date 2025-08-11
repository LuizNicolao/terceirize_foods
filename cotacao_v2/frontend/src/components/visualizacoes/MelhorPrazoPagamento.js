import React from 'react';
import styled from 'styled-components';
import { 
  FaCreditCard, 
  FaCalendar 
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

const ViewContainer = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

const MelhorPrazoPagamento = ({ cotacao, active }) => {
  if (!cotacao || !cotacao.fornecedores) return null;

  // Agrupar produtos pelo ID, mas salvar nome e fornecedor
  const produtosMelhorPagamento = {};
  let totalProdutos = 0;
  let totalQuantidade = 0;
  let totalValor = 0;

  cotacao.fornecedores.forEach(fornecedor => {
    if (fornecedor.produtos) {
      fornecedor.produtos.forEach(produto => {
        const produtoId = produto.produto_id || produto.nome;
        const prazoPagamento = parseFloat(produto.prazo_pagamento) || 0;
        const quantidade = parseFloat(produto.qtde) || 0;

        if (!produtosMelhorPagamento[produtoId]) {
          produtosMelhorPagamento[produtoId] = {
            nome: produto.nome,
            fornecedor: fornecedor.nome,
            melhorPagamento: prazoPagamento,
            quantidade: quantidade,
            count: 1
          };
        } else {
          produtosMelhorPagamento[produtoId].quantidade += quantidade;
          if (prazoPagamento < produtosMelhorPagamento[produtoId].melhorPagamento) {
            produtosMelhorPagamento[produtoId].melhorPagamento = prazoPagamento;
            produtosMelhorPagamento[produtoId].fornecedor = fornecedor.nome;
          }
        }
        totalProdutos++;
        totalQuantidade += quantidade;
        totalValor += prazoPagamento * quantidade;
      });
    }
  });

  return (
    <ViewContainer active={active}>
      <AnaliseComparativa>
        <AnaliseTitle>
          <FaCreditCard />
          Melhor Prazo de Pagamento por Produto
        </AnaliseTitle>
        <AnaliseGrid>
          {Object.values(produtosMelhorPagamento).map((produto, idx) => (
            <AnaliseCard key={idx}>
              <AnaliseCardTitle>
                <FaCalendar />
                {produto.nome}
              </AnaliseCardTitle>
              <AnaliseCardValue>{produto.melhorPagamento} dias</AnaliseCardValue>
              <AnaliseCardPercent>{produto.quantidade} unidades</AnaliseCardPercent>
              <AnaliseCardPercent>Fornecedor: {produto.fornecedor}</AnaliseCardPercent>
            </AnaliseCard>
          ))}
        </AnaliseGrid>
      </AnaliseComparativa>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th>Fornecedor</Th>
              <Th>Prazo Pagamento</Th>
              <Th>Qtd</Th>
              <Th>Prazo Total</Th>
            </tr>
          </thead>
          <tbody>
            {Object.values(produtosMelhorPagamento).map((produto, idx) => (
              <tr key={idx}>
                <Td>{produto.nome}</Td>
                <Td>{produto.fornecedor}</Td>
                <Td>{produto.melhorPagamento} dias</Td>
                <Td>{produto.quantidade}</Td>
                <Td>{produto.melhorPagamento * produto.quantidade} dias</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </ViewContainer>
  );
};

export default MelhorPrazoPagamento; 