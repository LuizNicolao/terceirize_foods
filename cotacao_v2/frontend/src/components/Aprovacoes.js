import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import PermissionGuard from './PermissionGuard';
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
  FaCalculator,
  FaFileInvoice,
  FaUserShield,
  FaCalendar,
  FaTimes
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

// Dashboard Cards
const DashboardCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const DashboardCard = styled(Card)`
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

  &.active {
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

const CardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.neutral.white};
  font-size: 20px;
  box-shadow: 0 4px 12px ${props => props.bgColor}40;
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const CardNumber = styled.span`
  color: ${colors.neutral.darkGray};
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
`;

// Filtros
const FiltrosSection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

const FiltrosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
`;

const FiltroGrupo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FiltroLabel = styled.label`
  color: ${colors.neutral.darkGray};
  font-weight: 600;
  font-size: 14px;
`;

const FiltroSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: ${colors.neutral.white};
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }
`;

const FiltroInput = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const FiltroBotoes = styled.div`
  display: flex;
  gap: 12px;
  align-items: end;
`;

const FiltroButton = styled(Button)`
  background: ${props => props.variant === 'secondary' ? colors.neutral.gray : colors.primary.green};
  color: ${colors.neutral.white};
  padding: 12px 20px;
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
    background: ${props => props.variant === 'secondary' ? colors.neutral.darkGray : colors.primary.darkGreen};
    transform: translateY(-1px);
  }
`;

// Tabela
const TableContainer = styled(Card)`
  background: ${colors.neutral.white};
  border-radius: 12px;
  box-shadow: ${shadows.md};
  overflow: hidden;
  padding: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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
  z-index: 1;
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: ${colors.neutral.darkGray};
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'aguardando_aprovacao':
        return colors.status.warning;
      case 'aguardando_aprovacao_supervisor':
        return colors.status.warning;
      case 'aprovado':
        return colors.status.success;
      case 'rejeitado':
        return colors.status.error;
      case 'renegociacao':
        return colors.secondary.orange;
      case 'pendente':
        return colors.neutral.gray;
      default:
        return colors.neutral.gray;
    }
  }};
  color: ${colors.neutral.white};
  text-transform: capitalize;
`;

const TipoBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => props.tipo === 'emergencial' ? colors.status.error : colors.secondary.blue};
  color: ${colors.neutral.white};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: ${colors.primary.green};

  &:hover {
    background-color: ${colors.neutral.lightGray};
  }
`;

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

const Aprovacoes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    status: 'aguardando_aprovacao',
    tipo: '',
    comprador: '',
    dataInicio: '',
    dataFim: ''
  });
  const [statusStats, setStatusStats] = useState({
    aguardandoAprovacao: 0,
    aguardandoSupervisor: 0,
    aprovadas: 0,
    rejeitadas: 0,
    renegociacao: 0
  });

  useEffect(() => {
    fetchCotacoes();
  }, []);

  useEffect(() => {
    if (cotacoes.length > 0) {
      const stats = {
        aguardandoAprovacao: cotacoes.filter(c => c.status === 'aguardando_aprovacao').length,
        aguardandoSupervisor: cotacoes.filter(c => c.status === 'aguardando_aprovacao_supervisor').length,
        aprovadas: cotacoes.filter(c => c.status === 'aprovado').length,
        rejeitadas: cotacoes.filter(c => c.status === 'rejeitado').length,
        renegociacao: cotacoes.filter(c => c.status === 'renegociacao').length
      };
      setStatusStats(stats);
    }
  }, [cotacoes]);

  const fetchCotacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/cotacoes/aprovacoes`, {
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

  const handleCardClick = (status) => {
    setFiltros(prev => ({ ...prev, status }));
  };

  const handleFiltroChange = (field, value) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const handleFiltrar = () => {
    // Aplicar filtros - por enquanto apenas atualiza o estado
  };

  const handleLimparFiltros = () => {
    setFiltros({
      status: '',
      tipo: '',
      comprador: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  const handleAnalisarCotacao = (cotacao) => {
    navigate(`/analisar-cotacao/${cotacao.id}`);
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
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aguardando_aprovacao_supervisor': 'Aguardando Análise do Supervisor',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'renegociacao': 'Em Renegociação'
    };
    return statusMap[status] || status;
  };

  const getFilteredCotacoes = () => {
    let filtered = cotacoes;

    if (filtros.status) {
      filtered = filtered.filter(cotacao => cotacao.status === filtros.status);
    }

    if (filtros.tipo) {
      filtered = filtered.filter(cotacao => cotacao.tipo === filtros.tipo);
    }

    if (filtros.comprador) {
      filtered = filtered.filter(cotacao => cotacao.usuario_id === filtros.comprador);
    }

    if (filtros.dataInicio) {
      filtered = filtered.filter(cotacao => 
        new Date(cotacao.data_criacao) >= new Date(filtros.dataInicio)
      );
    }

    if (filtros.dataFim) {
      filtered = filtered.filter(cotacao => 
        new Date(cotacao.data_criacao) <= new Date(filtros.dataFim)
      );
    }

    return filtered;
  };

  const getTotalProductsCount = (cotacao) => {
    // Primeiro, verificar se já existe um campo total_itens calculado
    if (cotacao.total_itens !== undefined && cotacao.total_itens !== null) {
      return cotacao.total_itens;
    }
    
    // Se não houver, calcular baseado nos fornecedores e produtos
    let total = 0;
    if (cotacao.fornecedores) {
      cotacao.fornecedores.forEach(fornecedor => {
        if (fornecedor.produtos) {
          total += fornecedor.produtos.length;
        }
      });
    }
    
    // Se ainda não encontrou produtos, verificar se há produtos diretamente na cotação
    if (total === 0 && cotacao.produtos) {
      total = cotacao.produtos.length;
    }
    
    return total;
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
          </EmptyState>
        </Container>
      </Layout>
    );
  }

  const filteredCotacoes = getFilteredCotacoes();

  return (
    <PermissionGuard screen="aprovacoes" action="can_view">
      <Layout>
        <Container>
        <Header>
          <Title>Aprovações de Cotações</Title>
          <Subtitle>Gerencie e aprove cotações do sistema</Subtitle>
        </Header>

        {/* Dashboard Cards */}
        <DashboardCards>
          <DashboardCard 
            color={colors.status.warning}
            className={filtros.status === 'aguardando_aprovacao' ? 'active' : ''}
            onClick={() => handleCardClick('aguardando_aprovacao')}
          >
            <CardContent>
              <CardIcon bgColor={colors.status.warning}>
                <FaFileInvoice />
              </CardIcon>
              <CardInfo>
                <CardTitle>Cotações Aguardando Aprovação</CardTitle>
                <CardNumber>{statusStats.aguardandoAprovacao}</CardNumber>
              </CardInfo>
            </CardContent>
          </DashboardCard>

          <DashboardCard 
            color={colors.secondary.blue}
            className={filtros.status === 'aguardando_aprovacao_supervisor' ? 'active' : ''}
            onClick={() => handleCardClick('aguardando_aprovacao_supervisor')}
          >
            <CardContent>
              <CardIcon bgColor={colors.secondary.blue}>
                <FaUserShield />
              </CardIcon>
              <CardInfo>
                <CardTitle>Aguardando Análise do Supervisor</CardTitle>
                <CardNumber>{statusStats.aguardandoSupervisor}</CardNumber>
              </CardInfo>
            </CardContent>
          </DashboardCard>

          <DashboardCard 
            color={colors.status.success}
            className={filtros.status === 'aprovado' ? 'active' : ''}
            onClick={() => handleCardClick('aprovado')}
          >
            <CardContent>
              <CardIcon bgColor={colors.status.success}>
                <FaCheckCircle />
              </CardIcon>
              <CardInfo>
                <CardTitle>Cotações Aprovadas</CardTitle>
                <CardNumber>{statusStats.aprovadas}</CardNumber>
              </CardInfo>
            </CardContent>
          </DashboardCard>

          <DashboardCard 
            color={colors.status.error}
            className={filtros.status === 'rejeitado' ? 'active' : ''}
            onClick={() => handleCardClick('rejeitado')}
          >
            <CardContent>
              <CardIcon bgColor={colors.status.error}>
                <FaTimesCircle />
              </CardIcon>
              <CardInfo>
                <CardTitle>Cotações Rejeitadas</CardTitle>
                <CardNumber>{statusStats.rejeitadas}</CardNumber>
              </CardInfo>
            </CardContent>
          </DashboardCard>

          <DashboardCard 
            color={colors.secondary.orange}
            className={filtros.status === 'renegociacao' ? 'active' : ''}
            onClick={() => handleCardClick('renegociacao')}
          >
            <CardContent>
              <CardIcon bgColor={colors.secondary.orange}>
                <FaSyncAlt />
              </CardIcon>
              <CardInfo>
                <CardTitle>Cotações em Renegociação</CardTitle>
                <CardNumber>{statusStats.renegociacao}</CardNumber>
              </CardInfo>
            </CardContent>
          </DashboardCard>
        </DashboardCards>

        {/* Filtros */}
        <FiltrosSection>
          <FiltrosGrid>
            <FiltroGrupo>
              <FiltroLabel>Status:</FiltroLabel>
              <FiltroSelect
                value={filtros.status}
                onChange={(e) => handleFiltroChange('status', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="aguardando_aprovacao">Aguardando Aprovação</option>
                <option value="aguardando_aprovacao_supervisor">Aguardando Análise do Supervisor</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="renegociacao">Em Renegociação</option>
              </FiltroSelect>
            </FiltroGrupo>

            <FiltroGrupo>
              <FiltroLabel>Tipo:</FiltroLabel>
              <FiltroSelect
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="programada">Programada</option>
                <option value="emergencial">Emergencial</option>
              </FiltroSelect>
            </FiltroGrupo>

            <FiltroGrupo>
              <FiltroLabel>Comprador:</FiltroLabel>
              <FiltroSelect
                value={filtros.comprador}
                onChange={(e) => handleFiltroChange('comprador', e.target.value)}
              >
                <option value="">Todos</option>
                {Array.from(new Set(cotacoes.map(c => c.usuario_id))).map(usuarioId => (
                  <option key={usuarioId} value={usuarioId}>
                    {cotacoes.find(c => c.usuario_id === usuarioId)?.usuario_nome || usuarioId}
                  </option>
                ))}
              </FiltroSelect>
            </FiltroGrupo>

            <FiltroGrupo>
              <FiltroLabel>Data Início:</FiltroLabel>
              <FiltroInput
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
              />
            </FiltroGrupo>

            <FiltroGrupo>
              <FiltroLabel>Data Fim:</FiltroLabel>
              <FiltroInput
                type="date"
                value={filtros.dataFim}
                onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
              />
            </FiltroGrupo>

            <FiltroBotoes>
              <FiltroButton onClick={handleFiltrar}>
                <FaFilter /> Filtrar
              </FiltroButton>
              <FiltroButton variant="secondary" onClick={handleLimparFiltros}>
                <FaTimes /> Limpar Filtros
              </FiltroButton>
            </FiltroBotoes>
          </FiltrosGrid>
        </FiltrosSection>

        {/* Grid de Cotações */}
        {filteredCotacoes.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyTitle>Nenhuma cotação encontrada</EmptyTitle>
            <EmptyText>
              {filtros.status || filtros.tipo || filtros.comprador || filtros.dataInicio || filtros.dataFim
                ? 'Tente ajustar os filtros de busca'
                : 'Não há cotações para exibir'
              }
            </EmptyText>
          </EmptyState>
        ) : (
          <CotacoesGrid>
            {filteredCotacoes.map((cotacao) => (
              <CotacaoCard key={cotacao.id} onClick={() => handleAnalisarCotacao(cotacao)}>
                <CotacaoHeader>
                  <CotacaoInfo>
                    <CotacaoTitle>Cotação #{cotacao.id}</CotacaoTitle>
                    <CotacaoSubtitle>
                      {formatarData(cotacao.data_criacao)}
                    </CotacaoSubtitle>
                  </CotacaoInfo>
                  <StatusBadge status={cotacao.status}>
                    {getStatusLabel(cotacao.status)}
                  </StatusBadge>
                </CotacaoHeader>

                <CotacaoDetails>
                  <DetailRow>
                    <DetailLabel>Comprador:</DetailLabel>
                    <DetailValue>{cotacao.usuario_nome}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Total Itens:</DetailLabel>
                    <DetailValue>{cotacao.total_itens || 0}</DetailValue>
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
    </PermissionGuard>
  );
};

export default Aprovacoes; 