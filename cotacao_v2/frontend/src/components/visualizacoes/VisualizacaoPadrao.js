import React from 'react';
import styled from 'styled-components';
import { colors } from '../../design-system';
import { Card } from '../../design-system/components';

// Componentes estilizados
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

const VisualizacaoPadrao = ({ cotacao, active, formatarValor }) => {
  if (!cotacao || !cotacao.fornecedores) return null;

  return (
    <ViewContainer active={active}>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Fornecedor</Th>
              <Th>Produto</Th>
              <Th>Qtd</Th>
              <Th>Un</Th>
              <Th>Valor Unitário</Th>
              <Th>Valor Total</Th>
              <Th>Prazo Entrega</Th>
              <Th>Prazo Pagamento</Th>
              <Th>Últ. Valor Aprovado</Th>
              <Th>Variação</Th>
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
                    <Td>{fornecedor.nome}</Td>
                    <Td>{produto.nome}</Td>
                    <Td>{quantidade}</Td>
                    <Td>{produto.un || 'UN'}</Td>
                    <Td>{formatarValor(valorUnitario)}</Td>
                    <Td>{formatarValor(valorTotal)}</Td>
                    <Td>{produto.prazo_entrega || '-'}</Td>
                    <Td>{produto.prazo_pagamento || '-'}</Td>
                    <Td>{ultimoValor > 0 ? formatarValor(ultimoValor) : '-'}</Td>
                    <VariacaoCell variacao={variacao}>
                      {ultimoValor > 0 ? `${variacao > 0 ? '+' : ''}${variacao.toFixed(2)}%` : '-'}
                    </VariacaoCell>
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

export default VisualizacaoPadrao; 