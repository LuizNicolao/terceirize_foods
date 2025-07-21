import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { calcularMelhoresPrecos, temMelhorPreco } from '../utils/priceUtils';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { colors, shadows } from '../design-system';
import { Button, Card } from '../design-system/components';
import {
  VisualizacaoPadrao,
  AnaliseComparativa,
  MelhorPreco,
  MelhorPrazoEntrega,
  MelhorPrazoPagamento
} from './visualizacoes';

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

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  color: ${colors.neutral.white};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'pendente': return colors.secondary.orange;
      case 'aguardando_aprovacao': return colors.status.warning;
      case 'aguardando_aprovacao_supervisor': return '#9C27B0';
      case 'em_analise': return '#9C27B0';
      case 'aprovada': return colors.primary.green;
      case 'rejeitada': return colors.status.error;
      case 'renegociacao': return colors.secondary.orange;
      default: return colors.neutral.gray;
    }
  }};
`;

const DataCriacao = styled.span`
  color: ${colors.neutral.gray};
  font-size: 14px;
`;

const InfoSection = styled(Card)`
  padding: 32px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid ${colors.primary.green};
  padding-bottom: 12px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full-width {
    grid-column: 1 / -1;
  }
`;

const InfoLabel = styled.label`
  font-weight: 600;
  color: ${colors.neutral.darkGray};
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: ${colors.neutral.gray};
  font-size: 16px;
  padding: 12px 16px;
  background: ${colors.neutral.lightGray};
  border-radius: 8px;
  border-left: 3px solid ${colors.primary.green};
`;

const JustificativaSection = styled(InfoSection)`
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 1px solid #ffcc02;
  border-left: 4px solid ${colors.secondary.orange};
`;

const JustificativaContent = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  margin-top: 16px;
`;

const JustificativaIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: ${colors.secondary.orange};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.neutral.white};
  font-size: 18px;
`;

const JustificativaText = styled.div`
  flex: 1;
  color: ${colors.neutral.darkGray};
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-style: italic;
`;

const RenegociacaoSection = styled(InfoSection)`
  border-left: 4px solid ${colors.secondary.orange};
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
`;

const RenegociacaoContent = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  margin-top: 16px;
`;

const RenegociacaoIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: ${colors.secondary.orange};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.neutral.white};
  font-size: 18px;
  animation: spin 2s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const RenegociacaoInfo = styled.div`
  flex: 1;
`;

const RenegociacaoMessage = styled.div`
  color: #e65100;
  font-weight: 600;
  margin-bottom: 12px;

  strong {
    color: #d84315;
  }

  p {
    margin: 8px 0 0 0;
    font-weight: normal;
  }
`;

const ProdutosRenegociar = styled.div`
  margin-top: 16px;
`;

const ProdutosRenegociarTitle = styled.h4`
  color: #e65100;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const ProdutosLista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProdutoRenegociarItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: ${colors.neutral.white};
  border-radius: 8px;
  box-shadow: ${shadows.sm};
  border-left: 3px solid ${colors.secondary.orange};
`;

const ProdutoNome = styled.span`
  font-weight: 600;
  color: #D84315;
`;

const ProdutoFornecedor = styled.span`
  font-size: 12px;
  color: #D84315;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ToggleButton = styled.button`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: ${shadows.sm};

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: ${colors.neutral.white};
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }

  &::placeholder {
    color: ${colors.neutral.gray};
  }
`;

const SearchClear = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: ${colors.neutral.gray};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.neutral.lightGray};
    color: ${colors.neutral.darkGray};
  }
`;

const SearchInfo = styled.div`
  margin-top: 8px;
  color: ${colors.neutral.gray};
  font-size: 12px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: ${shadows.sm};
`;

const ProdutosTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colors.neutral.white};
  font-size: 14px;
`;

const TableHeader = styled.th`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid ${colors.primary.darkGreen};
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
`;

const TableRow = styled.tr`
  transition: background-color 0.3s ease;

  &:hover {
    background: ${colors.neutral.lightGray};
  }

  &.produto-renegociacao-row {
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  }

  &.produto-renegociacao-row:hover {
    background: linear-gradient(135deg, #ffe0b2 0%, #ffcc02 100%);
  }
`;

const TotalCell = styled(TableCell)`
  font-weight: 600;
  color: ${colors.primary.green};
`;

const BestPriceCell = styled(TableCell)`
  &.best-price {
    background: ${colors.primary.green};
    color: ${colors.neutral.white};
    font-weight: 600;
  }
`;

const FornecedoresList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FornecedorCard = styled(Card)`
  padding: 24px;
`;

const FornecedorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${colors.primary.green};
`;

const FornecedorTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const FornecedorInfo = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
`;

const FornecedorInfoItem = styled.span`
  color: ${colors.neutral.gray};
  font-size: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: ${colors.neutral.lightGray};
  border-radius: 6px;
  border-left: 3px solid ${colors.primary.green};
`;

const StatLabel = styled.label`
  font-weight: 600;
  color: ${colors.neutral.darkGray};
  font-size: 12px;
`;

const StatValue = styled.span`
  color: ${colors.primary.green};
  font-size: 16px;
  font-weight: 600;
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const LoadingIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  animation: spin 2s linear infinite;
`;

const LoadingTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const LoadingText = styled.p`
  color: ${colors.neutral.gray};
  font-size: 16px;
  margin: 0;
`;

const ErrorPlaceholder = styled(LoadingPlaceholder)``;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${colors.status.error};
`;

const RetryButton = styled(Button)`
  margin-top: 16px;
`;

const NotFoundPlaceholder = styled(LoadingPlaceholder)``;

const NotFoundIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${colors.neutral.gray};
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${colors.neutral.gray};
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: ${props => props.color || colors.neutral.gray};
`;

const BadgeRenegociacao = styled.span`
  background: linear-gradient(45deg, ${colors.secondary.orange}, #FF8A65);
  color: ${colors.neutral.white};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  animation: pulseRenegociacao 2s infinite;
  margin-left: 8px;

  @keyframes pulseRenegociacao {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const ProdutoRenegociacaoRow = styled(TableRow)`
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
`;

const VisualizarCotacao = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: authUser } = useAuth();
  
  const [cotacao, setCotacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produtosExpanded, setProdutosExpanded] = useState(false);
  const [searchFornecedor, setSearchFornecedor] = useState('');
  const [searchProduto, setSearchProduto] = useState('');

  const fetchCotacao = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCotacao(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar cotação');
      }
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCotacao();
  }, [fetchCotacao]);

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

  const formatarValor = (valor) => {
    if (valor === 0 || valor === '') return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Mapear dados para usar os mesmos nomes de campos que a função temMelhorPreco espera
  const fornecedoresMapeados = cotacao?.fornecedores?.map(f => ({
    ...f,
    produtos: f.produtos?.map(p => ({
      ...p,
      prazoEntrega: p.prazo_entrega || '',
      valorUnitario: parseFloat(p.valor_unitario) || 0,
      primeiroValor: parseFloat(p.primeiro_valor) || 0,
      valorAnterior: parseFloat(p.valor_anterior) || 0,
      dataEntregaFn: p.data_entrega_fn || '',
      difal: parseFloat(p.difal) || 0,
      ipi: parseFloat(p.ipi) || 0,
      total: parseFloat(p.total) || 0
    }))
  })) || [];

  // Calcular melhores preços entre fornecedores
  const melhoresPrecos = cotacao ? calcularMelhoresPrecos(fornecedoresMapeados) : {};

  // Funções de filtro
  const filteredFornecedores = fornecedoresMapeados.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchFornecedor.toLowerCase())
  );

  const filteredProdutos = (fornecedorId) => {
    const fornecedor = fornecedoresMapeados.find(f => f.id === fornecedorId);
    if (!fornecedor) return [];
    
    return fornecedor.produtos?.filter(produto =>
      produto.nome.toLowerCase().includes(searchProduto.toLowerCase())
    ) || [];
  };

  // Função auxiliar para verificar se um produto está em renegociação
  const isProdutoEmRenegociacao = (produto) => {
    if (!cotacao.produtos_renegociar || cotacao.produtos_renegociar.length === 0) {
      return false;
    }
    
    return cotacao.produtos_renegociar.some(
      p => p.produto_id === produto.id.toString() || p.produto_id === produto.produto_id?.toString()
    );
  };

  const handleVoltar = () => {
    navigate('/cotacoes');
  };

  const handleEditar = () => {
    navigate(`/editar-cotacao/${id}`);
  };

  if (loading) {
    return (
      <Layout>
        <LoadingPlaceholder>
          <LoadingIcon>⏱</LoadingIcon>
          <LoadingTitle>Carregando cotação...</LoadingTitle>
          <LoadingText>Aguarde um momento</LoadingText>
        </LoadingPlaceholder>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorPlaceholder>
          <ErrorIcon>✗</ErrorIcon>
          <LoadingTitle>Erro ao carregar cotação</LoadingTitle>
          <LoadingText>{error}</LoadingText>
          <RetryButton onClick={fetchCotacao}>
              Tentar Novamente
          </RetryButton>
        </ErrorPlaceholder>
      </Layout>
    );
  }

  if (!cotacao) {
    return (
      <Layout>
        <NotFoundPlaceholder>
          <NotFoundIcon>📋</NotFoundIcon>
          <LoadingTitle>Cotação não encontrada</LoadingTitle>
          <LoadingText>A cotação solicitada não foi encontrada</LoadingText>
        </NotFoundPlaceholder>
      </Layout>
    );
  }

  return (
    <Layout>
              <Container>
          <Header>
            <Title>Visualizar Cotação #{cotacao.id}</Title>
            <Subtitle>Detalhes da cotação e seus fornecedores</Subtitle>
            <HeaderActions>
              <Button onClick={handleVoltar} variant="secondary">
                <FaArrowLeft /> Voltar
              </Button>
              <Button 
                onClick={() => {
                  if (cotacao.status === 'pendente' || cotacao.status === 'renegociacao') {
                    handleEditar();
                  } else {
                    alert(`Não é possível editar uma cotação com status "${cotacao.status}". Apenas cotações pendentes ou em renegociação podem ser editadas.`);
                  }
                }}
                variant={cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao' ? 'disabled' : 'primary'}
                title={cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao' ? 'Apenas cotações pendentes ou em renegociação podem ser editadas' : 'Editar cotação'}
                disabled={cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao'}
              >
                <FaEdit /> Editar
              </Button>
            </HeaderActions>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '16px' }}>
              <StatusBadge status={cotacao.status}>
                {getStatusLabel(cotacao.status)}
              </StatusBadge>
              <DataCriacao>
                Criada em: {formatDate(cotacao.data_criacao)}
              </DataCriacao>
            </div>
          </Header>

        {/* Seção 1: Informações Básicas */}
        <InfoSection>
          <SectionTitle>Informações Básicas</SectionTitle>
          
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Comprador</InfoLabel>
              <InfoValue>{cotacao.comprador}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Local de Entrega</InfoLabel>
              <InfoValue>{cotacao.local_entrega}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Tipo de Compra</InfoLabel>
              <InfoValue>{cotacao.tipo_compra === 'programada' ? 'Compra Programada' : 'Compra Emergencial'}</InfoValue>
            </InfoItem>
            
            {cotacao.tipo_compra === 'emergencial' && (
              <InfoItem className="full-width">
                <InfoLabel>Motivo Emergencial</InfoLabel>
                <InfoValue>{cotacao.motivo_final}</InfoValue>
              </InfoItem>
            )}
          </InfoGrid>
        </InfoSection>

        {/* Seção 1.5: Justificativa do Supervisor */}
        {cotacao.justificativa && (
          <JustificativaSection>
            <SectionTitle>Justificativa e Observações do Supervisor</SectionTitle>
            <JustificativaContent>
              <JustificativaIcon>
                <FaExclamationTriangle />
              </JustificativaIcon>
              <JustificativaText>
                {cotacao.justificativa}
              </JustificativaText>
            </JustificativaContent>
          </JustificativaSection>
        )}

        {/* Seção 1.6: Renegociação */}
        {cotacao.produtos_renegociar && cotacao.produtos_renegociar.length > 0 && (
          <RenegociacaoSection>
            <SectionTitle>Produtos em Renegociação</SectionTitle>
            <RenegociacaoContent>
              <RenegociacaoIcon>
                <FaExclamationTriangle />
              </RenegociacaoIcon>
              <RenegociacaoInfo>
                <RenegociacaoMessage>
                  <strong>Renegociação em andamento</strong>
                  <p>Os seguintes produtos estão sendo renegociados com os fornecedores:</p>
                </RenegociacaoMessage>
                <ProdutosRenegociar>
                  <ProdutosRenegociarTitle>Produtos em renegociação:</ProdutosRenegociarTitle>
                  <ProdutosLista>
                    {cotacao.produtos_renegociar.map((item, index) => (
                      <ProdutoRenegociarItem key={index}>
                        <ProdutoNome>{item.nome_produto}</ProdutoNome>
                        <ProdutoFornecedor>Fornecedor: {item.nome_fornecedor}</ProdutoFornecedor>
                      </ProdutoRenegociarItem>
                    ))}
                  </ProdutosLista>
                </ProdutosRenegociar>
              </RenegociacaoInfo>
            </RenegociacaoContent>
          </RenegociacaoSection>
        )}

        {/* Seção 2: Produtos */}
        <InfoSection>
          <SectionHeader>
            <SectionTitle>Produtos ({cotacao.produtos?.length || 0})</SectionTitle>
            <ToggleButton
              type="button"
              onClick={() => setProdutosExpanded(!produtosExpanded)}
              title={produtosExpanded ? 'Recolher produtos' : 'Expandir produtos'}
            >
              {produtosExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </ToggleButton>
          </SectionHeader>
          
          {produtosExpanded && cotacao.produtos && cotacao.produtos.length > 0 && (
            <TableWrapper>
              <ProdutosTable>
                <thead>
                  <tr>
                    <TableHeader>Produto</TableHeader>
                    <TableHeader>Qtd</TableHeader>
                    <TableHeader>UN</TableHeader>
                    <TableHeader>Prazo Entrega</TableHeader>
                    <TableHeader>Ult. Vlr. Aprovado</TableHeader>
                    <TableHeader>Ult. Fornecedor Aprovado</TableHeader>
                    <TableHeader>Valor Anterior</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {cotacao.produtos.map((produto, index) => (
                    <TableRow key={produto.id || index}>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell>{produto.qtde}</TableCell>
                      <TableCell>{produto.un}</TableCell>
                      <TableCell>{produto.prazo_entrega || '-'}</TableCell>
                      <TableCell>{produto.ult_valor_aprovado || '-'}</TableCell>
                      <TableCell>{produto.ult_fornecedor_aprovado || '-'}</TableCell>
                      <TableCell>{produto.valor_anterior || '-'}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </ProdutosTable>
            </TableWrapper>
          )}
        </InfoSection>

        {/* Seção 3: Fornecedores */}
        <InfoSection>
          <SectionHeader>
            <SectionTitle>Fornecedores ({cotacao.fornecedores?.length || 0})</SectionTitle>
            <Legend>
              <LegendItem>
                <LegendColor color={colors.primary.green}></LegendColor>
                Melhor preço
              </LegendItem>
            </Legend>
          </SectionHeader>
          
          {/* Barra de pesquisa de fornecedores */}
          {cotacao.fornecedores && cotacao.fornecedores.length > 0 && (
            <SearchContainer>
              <SearchBox>
                <SearchInput
                  type="text"
                  placeholder="🔍 Pesquisar fornecedor..."
                  value={searchFornecedor}
                  onChange={(e) => setSearchFornecedor(e.target.value)}
                />
                {searchFornecedor && (
                  <SearchClear
                    type="button"
                    onClick={() => setSearchFornecedor('')}
                    title="Limpar pesquisa"
                  >
                    ✕
                  </SearchClear>
                )}
              </SearchBox>
              {searchFornecedor && (
                <SearchInfo>
                  {filteredFornecedores.length} de {cotacao.fornecedores.length} fornecedores encontrados
                </SearchInfo>
              )}
            </SearchContainer>
          )}
          
          {cotacao.fornecedores && cotacao.fornecedores.length > 0 && (
            <FornecedoresList>
              {filteredFornecedores.map((fornecedor, index) => (
                <FornecedorCard key={fornecedor.id}>
                  <FornecedorHeader>
                    <FornecedorTitle>Fornecedor {index + 1}: {fornecedor.nome}</FornecedorTitle>
                    <FornecedorInfo>
                      <FornecedorInfoItem>Prazo: {fornecedor.prazo_pagamento || '-'}</FornecedorInfoItem>
                      <FornecedorInfoItem>Frete: {fornecedor.tipo_frete || '-'}</FornecedorInfoItem>
                      <FornecedorInfoItem>Valor Frete: {formatarValor(fornecedor.valor_frete)}</FornecedorInfoItem>
                    </FornecedorInfo>
                  </FornecedorHeader>
                  
                  {fornecedor.produtos && fornecedor.produtos.length > 0 && (
                    <div>
                      <h4 style={{ color: colors.neutral.darkGray, fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0' }}>Produtos do Fornecedor</h4>
                      
                      {/* Barra de pesquisa de produtos */}
                      {fornecedor.produtos.length > 0 && (
                        <SearchContainer>
                          <SearchBox>
                            <SearchInput
                              type="text"
                              placeholder="🔍 Pesquisar produto..."
                              value={searchProduto}
                              onChange={(e) => setSearchProduto(e.target.value)}
                            />
                            {searchProduto && (
                              <SearchClear
                                type="button"
                                onClick={() => setSearchProduto('')}
                                title="Limpar pesquisa"
                              >
                                ✕
                              </SearchClear>
                            )}
                          </SearchBox>
                          {searchProduto && (
                            <SearchInfo>
                              {filteredProdutos(fornecedor.id).length} de {fornecedor.produtos.length} produtos encontrados
                            </SearchInfo>
                          )}
                        </SearchContainer>
                      )}
                      
                      <TableWrapper>
                        <ProdutosTable>
                          <thead>
                            <tr>
                              <TableHeader>Produto</TableHeader>
                              <TableHeader>Qtd</TableHeader>
                              <TableHeader>UN</TableHeader>
                              <TableHeader>Prazo Entrega</TableHeader>
                              <TableHeader>Valor Unit.</TableHeader>
                              <TableHeader>Difal</TableHeader>
                              <TableHeader>IPI</TableHeader>
                              <TableHeader>Data Entrega Fn</TableHeader>
                              <TableHeader>Total</TableHeader>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProdutos(fornecedor.id).map((produto, prodIndex) => {
                              // Verifica se o produto está em renegociação
                              const emRenegociacao = isProdutoEmRenegociacao(produto);
                              return (
                                <TableRow key={produto.id || prodIndex} className={emRenegociacao ? 'produto-renegociacao-row' : ''}>
                                  <TableCell>
                                    <ProdutoNome className={emRenegociacao ? 'produto-renegociacao-nome' : ''}>
                                      {produto.nome}
                                      {emRenegociacao && (
                                        <BadgeRenegociacao>Renegociação</BadgeRenegociacao>
                                      )}
                                    </ProdutoNome>
                                  </TableCell>
                                  <TableCell>{produto.qtde}</TableCell>
                                  <TableCell>{produto.un}</TableCell>
                                  <TableCell>{produto.prazo_entrega || '-'}</TableCell>
                                  <BestPriceCell className={temMelhorPreco(produto, fornecedor, melhoresPrecos) ? 'best-price' : ''}>
                                    {formatarValor(produto.valorUnitario)}
                                  </BestPriceCell>
                                  <TableCell>{formatarValor(produto.difal)}</TableCell>
                                  <TableCell>{formatarValor(produto.ipi)}</TableCell>
                                  <TableCell>{produto.data_entrega_fn || '-'}</TableCell>
                                  <TotalCell>{formatarValor(produto.total)}</TotalCell>
                                </TableRow>
                              );
                            })}
                          </tbody>
                        </ProdutosTable>
                      </TableWrapper>
                    </div>
                  )}
                </FornecedorCard>
              ))}
            </FornecedoresList>
          )}
        </InfoSection>

        {/* Seção 4: Estatísticas */}
        {cotacao.metadata && (
          <InfoSection>
            <SectionTitle>Estatísticas</SectionTitle>
            
            <StatsGrid>
              <StatItem>
                <StatLabel>Total de Produtos Únicos</StatLabel>
                <StatValue>{cotacao.metadata.total_produtos_unicos || 0}</StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>Produtos Duplicados Consolidados</StatLabel>
                <StatValue>{cotacao.metadata.produtos_duplicados_consolidados || 0}</StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>Total de Quantidade</StatLabel>
                <StatValue>{cotacao.metadata.total_quantidade || 0}</StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>Total de Fornecedores</StatLabel>
                <StatValue>{cotacao.metadata.total_fornecedores || 0}</StatValue>
              </StatItem>
            </StatsGrid>
          </InfoSection>
        )}
      </Container>
    </Layout>
  );
};

export default VisualizarCotacao; 