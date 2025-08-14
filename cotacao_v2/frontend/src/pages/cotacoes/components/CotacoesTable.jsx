import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaEye, 
  FaEdit, 
  FaPaperPlane, 
  FaClock,
  FaExclamationTriangle,
  FaFileAlt
} from 'react-icons/fa';
import { colors } from '../../../design-system';
import { Button } from '../../../design-system/components';
import { 
  formatDate, 
  getStatusColor, 
  getStatusLabel,
  getStatusConfig
} from '../../../utils';

const TableContainer = styled.div`
  padding: 24px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${colors.neutral.gray};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${colors.status.error};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${colors.neutral.gray};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colors.neutral.white};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background-color: ${colors.neutral.lightGray};
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: ${colors.neutral.darkGray};
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.color};
  color: ${colors.neutral.white};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-right: 8px;
  color: ${colors.neutral.gray};
  font-size: 16px;

  &:hover {
    background-color: ${colors.neutral.lightGray};
  }

  &.edit {
    color: ${colors.secondary.blue};
  }

  &.delete {
    color: ${colors.status.error};
  }

  &.view {
    color: ${colors.primary.green};
  }

  &.send {
    color: ${colors.secondary.orange};
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: none;
      color: ${colors.neutral.gray};
    }
  }
`;

const RetryButton = styled(Button)`
  background: ${colors.secondary.blue};
  color: ${colors.neutral.white};
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;

  &:hover {
    background: #1976D2;
  }
`;

const CotacoesTable = ({ 
  cotacoes, 
  loading, 
  error, 
  onRetry, 
  onEnviarParaSupervisor 
}) => {
  const navigate = useNavigate();
  const cotacaoStatusConfig = getStatusConfig('cotacao');

  if (loading) {
    return (
      <TableContainer>
        <LoadingState>
          <FaClock size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
          <h3>Carregando cotações...</h3>
          <p>Aguarde um momento</p>
        </LoadingState>
      </TableContainer>
    );
  }

  if (error) {
    return (
      <TableContainer>
        <ErrorState>
          <FaExclamationTriangle size={48} style={{ marginBottom: '16px', color: colors.status.error }} />
          <h3>Erro ao carregar cotações</h3>
          <p>{error}</p>
          <RetryButton onClick={onRetry}>
            Tentar Novamente
          </RetryButton>
        </ErrorState>
      </TableContainer>
    );
  }

  if (cotacoes.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <FaFileAlt size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
          <h3>Nenhuma cotação encontrada</h3>
          <p>Clique em "Nova Cotação" para começar</p>
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Comprador</Th>
            <Th>Local de Entrega</Th>
            <Th>Tipo de Compra</Th>
            <Th>Status</Th>
            <Th>Data de Criação</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {cotacoes.map((cotacao) => (
            <tr key={cotacao.id}>
              <Td>#{cotacao.id}</Td>
              <Td>{cotacao.comprador}</Td>
              <Td>{cotacao.local_entrega}</Td>
                             <Td>{cotacao.tipo_compra}</Td>
                             <Td>
                 <StatusBadge color={getStatusColor(cotacao.status, cotacaoStatusConfig)}>
                   {getStatusLabel(cotacao.status, cotacaoStatusConfig)}
                 </StatusBadge>
               </Td>
              <Td>{formatDate(cotacao.data_criacao)}</Td>
              <Td>
                <ActionButton 
                  className="view"
                  title="Visualizar"
                  onClick={() => navigate(`/visualizar-cotacao/${cotacao.id}`)}
                >
                  <FaEye />
                </ActionButton>
                                 <ActionButton 
                   className={['pendente', 'renegociacao'].includes(cotacao.status) ? 'edit' : 'disabled'}
                   title={['pendente', 'renegociacao'].includes(cotacao.status) ? 'Editar' : 'Apenas cotações pendentes ou em renegociação podem ser editadas'}
                   onClick={() => {
                     if (['pendente', 'renegociacao'].includes(cotacao.status)) {
                       navigate(`/editar-cotacao/${cotacao.id}`);
                     } else {
                       alert(`Não é possível editar uma cotação com status "${cotacao.status}". Apenas cotações pendentes ou em renegociação podem ser editadas.`);
                     }
                   }}
                   disabled={!['pendente', 'renegociacao'].includes(cotacao.status)}
                 >
                  <FaEdit />
                </ActionButton>
                                 {['pendente', 'renegociacao'].includes(cotacao.status) && (
                   <ActionButton 
                     className="send"
                     title={cotacao.status === 'renegociacao' ? "Reenviar para Supervisor" : "Enviar para Supervisor"}
                     onClick={() => onEnviarParaSupervisor(cotacao.id)}
                   >
                     <FaPaperPlane />
                   </ActionButton>
                 )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default CotacoesTable;
