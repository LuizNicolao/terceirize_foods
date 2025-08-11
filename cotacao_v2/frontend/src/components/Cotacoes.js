import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import styled from 'styled-components';
import { 
  FaEye, 
  FaEdit, 
  FaPaperPlane, 
  FaPlus, 
  FaFilter,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaUserCheck,
  FaSearch,
  FaThumbsUp,
  FaThumbsDown,
  FaExchangeAlt
} from 'react-icons/fa';
import { colors } from '../design-system';
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

const FilterSection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
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
  min-width: 220px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }
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

// Conteúdo Principal
const ContentSection = styled(Card)`
  overflow: hidden;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
`;

const ContentTitle = styled.h2`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const NewButton = styled(Button)`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #005a2e;
    transform: translateY(-1px);
  }
`;

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

const Cotacoes = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('todas');
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    pendentes: 0,
    'aguardando-aprovacao': 0,
    'analise-supervisor': 0,
    aprovadas: 0,
    rejeitadas: 0,
    renegociacao: 0
  });

  const statusCards = [
    {
      id: 'pendentes',
      title: 'Cotações Pendentes',
      count: 0,
      color: colors.secondary.orange,
      icon: <FaClock />,
      bgColor: colors.secondary.orange
    },
    {
      id: 'aguardando-aprovacao',
      title: 'Aguardando Aprovação',
      count: 0,
      color: colors.secondary.blue,
      icon: <FaUserCheck />,
      bgColor: colors.secondary.blue
    },
    {
      id: 'analise-supervisor',
      title: 'Análise do Supervisor',
      count: 0,
      color: '#9C27B0',
      icon: <FaSearch />,
      bgColor: '#9C27B0'
    },
    {
      id: 'aprovadas',
      title: 'Cotações Aprovadas',
      count: 0,
      color: colors.primary.green,
      icon: <FaThumbsUp />,
      bgColor: colors.primary.green
    },
    {
      id: 'rejeitadas',
      title: 'Cotações Rejeitadas',
      count: 0,
      color: colors.status.error,
      icon: <FaThumbsDown />,
      bgColor: colors.status.error
    },
    {
      id: 'renegociacao',
      title: 'Em Renegociação',
      count: 0,
      color: '#FF5722',
      icon: <FaExchangeAlt />,
      bgColor: '#FF5722'
    }
  ];

  const fetchCotacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/cotacoes');
      setCotacoes(response.data);
      updateStatusCounts(response.data);
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      setError(error.response?.data?.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar cotações da API
  useEffect(() => {
    fetchCotacoes();
  }, [fetchCotacoes]);

  // Atualizar contadores dos cards de status
  const updateStatusCounts = (cotacoes) => {
    const counts = {
      pendentes: 0,
      'aguardando-aprovacao': 0,
      'analise-supervisor': 0,
      aprovadas: 0,
      rejeitadas: 0,
      renegociacao: 0
    };

    cotacoes.forEach(cotacao => {
      switch (cotacao.status) {
        case 'pendente':
          counts.pendentes++;
          break;
        case 'aguardando_aprovacao':
          counts['aguardando-aprovacao']++;
          break;
        case 'em_analise':
          counts['analise-supervisor']++;
          break;
        case 'aprovada':
          counts.aprovadas++;
          break;
        case 'rejeitada':
          counts.rejeitadas++;
          break;
        case 'renegociacao':
          counts.renegociacao++;
          break;
        default:
          break;
      }
    });
    
    // Atualizar os cards com os contadores
    setStatusCounts(counts);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const handleCardClick = (statusId) => {
    setSelectedStatus(statusId);
  };

  // Filtrar cotações baseado no status selecionado
  const getFilteredCotacoes = () => {
    if (selectedStatus === 'todas') {
      return cotacoes;
    }

    return cotacoes.filter(cotacao => {
      switch (selectedStatus) {
        case 'pendentes':
          return cotacao.status === 'pendente';
        case 'aguardando-aprovacao':
          return cotacao.status === 'aguardando_aprovacao';
        case 'analise-supervisor':
          return cotacao.status === 'em_analise';
        case 'aprovadas':
          return cotacao.status === 'aprovada';
        case 'rejeitadas':
          return cotacao.status === 'rejeitada';
        case 'renegociacao':
          return cotacao.status === 'renegociacao';
        default:
          return true;
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return colors.secondary.orange;
      case 'aguardando_aprovacao':
        return colors.status.warning;
      case 'aguardando_aprovacao_supervisor':
        return '#9C27B0';
      case 'em_analise':
        return '#9C27B0';
      case 'aprovada':
        return colors.primary.green;
      case 'rejeitada':
        return colors.status.error;
      case 'renegociacao':
        return '#FF5722';
      default:
        return colors.neutral.gray;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'aguardando_aprovacao':
        return 'Aguardando Aprovação';
      case 'aguardando_aprovacao_supervisor':
        return 'Aguardando Análise do Supervisor';
      case 'em_analise':
        return 'Em Análise';
      case 'aprovada':
        return 'Aprovada';
      case 'rejeitada':
        return 'Rejeitada';
      case 'renegociacao':
        return 'Renegociação';
      default:
        return status;
    }
  };

  const handleEnviarParaSupervisor = async (cotacaoId) => {
    try {
      const response = await axios.post(`/api/cotacoes/${cotacaoId}/enviar-supervisor`);

      if (response.status === 200) {
        alert('Cotação enviada para análise do supervisor com sucesso!');
        fetchCotacoes(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao enviar para supervisor:', error);
      alert(error.response?.data?.message || 'Erro ao enviar para supervisor');
    }
  };

  const filteredCotacoes = getFilteredCotacoes();

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Gestão de Cotações</Title>
          <Subtitle>Gerencie todas as cotações do sistema</Subtitle>
        </Header>

        <FilterSection>
          <FilterContainer>
            <FilterLabel>
              <FaFilter />
              Filtrar por Status:
            </FilterLabel>
            <FilterSelect 
              value={selectedStatus} 
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="todas">Todas as Cotações</option>
              <option value="pendentes">Pendentes</option>
              <option value="aguardando-aprovacao">Aguardando Aprovação</option>
              <option value="analise-supervisor">Aguardando Análise do Supervisor</option>
              <option value="aprovadas">Aprovadas</option>
              <option value="rejeitadas">Rejeitadas</option>
              <option value="renegociacao">Em Renegociação</option>
            </FilterSelect>
          </FilterContainer>
        </FilterSection>

        <StatusCardsGrid>
          {statusCards.map((card) => (
            <StatusCard 
              key={card.id}
              color={card.color}
              className={selectedStatus === card.id ? 'selected' : ''}
              onClick={() => handleCardClick(card.id)}
            >
              <CardHeader>
                <CardIcon $bgColor={card.bgColor}>
                  {card.icon}
                </CardIcon>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardCount>{statusCounts[card.id] || 0}</CardCount>
                <CardLabel>cotações</CardLabel>
              </CardContent>
            </StatusCard>
          ))}
        </StatusCardsGrid>

        <ContentSection>
          <ContentHeader>
            <ContentTitle>
              {selectedStatus === 'todas' ? 'Todas as Cotações' : 
               statusCards.find(card => card.id === selectedStatus)?.title || 'Cotações'}
            </ContentTitle>
            <NewButton onClick={() => navigate('/nova-cotacao')}>
              <FaPlus />
              Nova Cotação
            </NewButton>
          </ContentHeader>

          <TableContainer>
            {loading ? (
              <LoadingState>
                <FaClock size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
                <h3>Carregando cotações...</h3>
                <p>Aguarde um momento</p>
              </LoadingState>
            ) : error ? (
              <ErrorState>
                <FaExclamationTriangle size={48} style={{ marginBottom: '16px', color: colors.status.error }} />
                <h3>Erro ao carregar cotações</h3>
                <p>{error}</p>
                <RetryButton onClick={fetchCotacoes}>
                  Tentar Novamente
                </RetryButton>
              </ErrorState>
            ) : filteredCotacoes.length === 0 ? (
              <EmptyState>
                <FaFileAlt size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
                <h3>Nenhuma cotação encontrada</h3>
                <p>Clique em "Nova Cotação" para começar</p>
              </EmptyState>
            ) : (
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
                  {filteredCotacoes.map((cotacao) => (
                    <tr key={cotacao.id}>
                      <Td>#{cotacao.id}</Td>
                      <Td>{cotacao.comprador}</Td>
                      <Td>{cotacao.local_entrega}</Td>
                      <Td>
                        {cotacao.tipo_compra === 'programada' ? 'Programada' : 
                         cotacao.tipo_compra === 'emergencial' ? 'Emergencial' :
                         cotacao.tipo_compra === 'tag' ? 'TAG' : cotacao.tipo_compra}
                      </Td>
                      <Td>
                        <StatusBadge color={getStatusColor(cotacao.status)}>
                          {getStatusLabel(cotacao.status)}
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
                          className={cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao' ? 'disabled' : 'edit'}
                          title={cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao' ? 'Apenas cotações pendentes ou em renegociação podem ser editadas' : 'Editar'}
                          onClick={() => {
                            if (cotacao.status === 'pendente' || cotacao.status === 'renegociacao') {
                              navigate(`/editar-cotacao/${cotacao.id}`);
                            } else {
                              alert(`Não é possível editar uma cotação com status "${cotacao.status}". Apenas cotações pendentes ou em renegociação podem ser editadas.`);
                            }
                          }}
                          disabled={cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao'}
                        >
                          <FaEdit />
                        </ActionButton>
                        {(cotacao.status === 'pendente' || cotacao.status === 'renegociacao') && (
                          <ActionButton 
                            className="send"
                            title={cotacao.status === 'renegociacao' ? "Reenviar para Supervisor" : "Enviar para Supervisor"}
                            onClick={() => handleEnviarParaSupervisor(cotacao.id)}
                          >
                            <FaPaperPlane />
                          </ActionButton>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TableContainer>
        </ContentSection>
      </Container>
    </Layout>
  );
};

export default Cotacoes;
