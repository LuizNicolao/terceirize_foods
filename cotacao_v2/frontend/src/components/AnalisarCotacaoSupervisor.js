import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FaCalculator,
  FaFileInvoice,
  FaUserShield,
  FaCalendar,
  FaTimes,
  FaArrowLeft,
  FaSave,
  FaBan,
  FaSync,
  FaShieldAlt,
  FaClipboardList,
  FaBalanceScale,
  FaPercentage
} from 'react-icons/fa';
import { colors, typography, shadows } from '../design-system';
import { Button, Card } from '../design-system/components';
import {
  VisualizacaoPadrao,
  AnaliseComparativa,
  MelhorPreco,
  MelhorPrazoEntrega,
  MelhorPrazoPagamento,
  ComparativoProdutos
} from './visualizacoes';

// Componentes estilizados
const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const BackButton = styled(Button)`
  background: ${colors.neutral.gray};
  color: ${colors.neutral.white};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${colors.neutral.darkGray};
  }
`;

const Title = styled.h1`
  color: ${colors.neutral.darkGray};
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${colors.neutral.gray};
  font-size: 16px;
  margin: 0;
`;

// Informações da cotação
const InfoCotacao = styled(Card)`
  padding: 20px;
  margin-bottom: 24px;
  background: ${colors.neutral.lightGray};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: ${colors.neutral.darkGray};
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: ${colors.neutral.darkGray};
  font-size: 16px;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'em_analise': return colors.status.warning;
      case 'aprovado': return colors.status.success;
      case 'rejeitado': return colors.status.error;
      case 'renegociacao': return colors.secondary.orange;
      default: return colors.neutral.gray;
    }
  }};
  color: ${colors.neutral.white};
`;

// Resumo do orçamento
const ResumoOrcamento = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

const ResumoTitle = styled.h4`
  color: ${colors.neutral.darkGray};
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResumoCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const ResumoCard = styled.div`
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: ${colors.neutral.white};
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
`;

const ResumoValor = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${colors.primary.green};
  margin-bottom: 8px;
`;

const ResumoLabel = styled.div`
  font-size: 14px;
  color: ${colors.neutral.gray};
  font-weight: 500;
`;

// Botões de visualização
const VisualizacoesToggle = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const ViewButton = styled.button`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  background: ${props => props.active ? colors.primary.green : colors.neutral.white};
  color: ${props => props.active ? colors.neutral.white : colors.neutral.darkGray};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.active ? colors.primary.darkGreen : colors.neutral.lightGray};
    border-color: ${colors.primary.green};
  }

  &:first-child {
    border-radius: 8px 0 0 8px;
  }

  &:last-child {
    border-radius: 0 8px 8px 0;
  }
`;

// Container de visualização
const ViewContainer = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

// Análise comparativa
const AnaliseComparativaContainer = styled(Card)`
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

// Tabelas
const TableContainer = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

// Estilos adicionais para destacar células
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

  .melhor-preco {
    background-color: #d4edda;
    font-weight: bold;
    text-align: center;
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

const MelhorPrecoTableCell = styled(Td)`
  background-color: #d4edda;
  font-weight: 600;
  color: #155724;
`;

const VariacaoCell = styled(Td)`
  color: ${props => {
    if (props.variacao > 0) return '#dc3545';
    if (props.variacao < 0) return '#28a745';
    return colors.neutral.gray;
  }};
  font-weight: 600;
`;

// Botões de ação
const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
`;

const SendButton = styled(Button)`
  background: ${colors.secondary.blue};
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
    background: #1976D2;
    transform: translateY(-1px);
  }
`;

const RenegotiateButton = styled(Button)`
  background: ${colors.secondary.orange};
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
    background: #e68900;
    transform: translateY(-1px);
  }
`;

// Modal de análise
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(Card)`
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${colors.neutral.gray};
  
  &:hover {
    color: ${colors.neutral.darkGray};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 20px;

  &:focus {
    border-color: ${colors.primary.green};
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;

  &:focus {
    border-color: ${colors.primary.green};
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.neutral.gray};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.status.error};
`;

const AnalisarCotacaoSupervisor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cotacao, setCotacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('padrao');
  const [showModal, setShowModal] = useState(false);
  const [analiseData, setAnaliseData] = useState({
    observacoes: '',
    decisao: 'enviar_gestor',
    justificativa: '',
    produtosSelecionados: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCotacao();
  }, [id]);

  const fetchCotacao = async () => {
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
      'em_analise': 'Em Análise',
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aguardando_aprovacao_supervisor': 'Aguardando Análise do Supervisor',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'renegociacao': 'Em Renegociação'
    };
    return statusMap[status] || status;
  };

  const calcularTotalCotacao = () => {
    if (!cotacao || !cotacao.fornecedores) return 0;
    
    let total = 0;
    cotacao.fornecedores.forEach(fornecedor => {
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          const valorUnitario = parseFloat(produto.valor_unitario) || 0;
          const quantidade = parseFloat(produto.qtde) || 0;
          total += valorUnitario * quantidade;
        });
      }
    });
    return total;
  };

  const calcularEstatisticas = () => {
    if (!cotacao || !cotacao.fornecedores) {
      return {
        totalProdutos: 0,
        totalFornecedores: 0,
        totalQuantidade: 0,
        valorTotal: 0
      };
    }

    const produtosUnicos = new Set();
    let totalQuantidade = 0;
    let valorTotal = 0;

    cotacao.fornecedores.forEach(fornecedor => {
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          produtosUnicos.add(produto.produto_id || produto.nome);
          totalQuantidade += parseFloat(produto.qtde) || 0;
          valorTotal += (parseFloat(produto.valor_unitario) || 0) * (parseFloat(produto.qtde) || 0);
        });
      }
    });

    return {
      totalProdutos: produtosUnicos.size,
      totalFornecedores: cotacao.fornecedores.length,
      totalQuantidade,
      valorTotal
    };
  };

  const calcularAnaliseComparativa = () => {
    if (!cotacao || !cotacao.fornecedores) return null;

    const estatisticas = calcularEstatisticas();
    
    // Calcular melhor preço por produto
    const produtosMelhorPreco = {};
    let valorTotalMelhorPreco = 0;
    let valorTotalMedio = 0;
    let valorTotalUltimoAprovado = 0;
    let valorTotalPrimeiroValor = 0;
    let valorTotalAtual = 0;

    cotacao.fornecedores.forEach(fornecedor => {
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          const produtoId = produto.produto_id || produto.nome;
          const valorUnitario = parseFloat(produto.valor_unitario) || 0;
          const quantidade = parseFloat(produto.qtde) || 0;
          const ultimoValorAprovado = parseFloat(produto.ult_valor_aprovado) || 0;
          const primeiroValor = parseFloat(produto.primeiro_valor) || valorUnitario;

          if (!produtosMelhorPreco[produtoId]) {
            produtosMelhorPreco[produtoId] = {
              melhorPreco: valorUnitario,
              precoMedio: valorUnitario,
              quantidade: quantidade,
              count: 1,
              ultimoValorAprovado: ultimoValorAprovado,
              primeiroValor: primeiroValor
            };
          } else {
            produtosMelhorPreco[produtoId].precoMedio += valorUnitario;
            produtosMelhorPreco[produtoId].count += 1;
            if (valorUnitario < produtosMelhorPreco[produtoId].melhorPreco) {
              produtosMelhorPreco[produtoId].melhorPreco = valorUnitario;
            }
            // Manter o maior valor aprovado e primeiro valor
            if (ultimoValorAprovado > produtosMelhorPreco[produtoId].ultimoValorAprovado) {
              produtosMelhorPreco[produtoId].ultimoValorAprovado = ultimoValorAprovado;
            }
            if (primeiroValor > produtosMelhorPreco[produtoId].primeiroValor) {
              produtosMelhorPreco[produtoId].primeiroValor = primeiroValor;
            }
          }
        });
      }
    });

    // Calcular totais
    Object.values(produtosMelhorPreco).forEach(produto => {
      produto.precoMedio = produto.precoMedio / produto.count;
      valorTotalMelhorPreco += produto.melhorPreco * produto.quantidade;
      valorTotalMedio += produto.precoMedio * produto.quantidade;
      valorTotalUltimoAprovado += produto.ultimoValorAprovado * produto.quantidade;
      valorTotalPrimeiroValor += produto.primeiroValor * produto.quantidade;
      valorTotalAtual += produto.melhorPreco * produto.quantidade;
    });

    const economia = valorTotalMedio - valorTotalMelhorPreco;
    const economiaPercentual = valorTotalMedio > 0 ? (economia / valorTotalMedio * 100) : 0;
    
    const economiaUltimoAprovado = valorTotalUltimoAprovado - valorTotalMelhorPreco;
    const economiaUltimoAprovadoPercentual = valorTotalUltimoAprovado > 0 ? 
      (economiaUltimoAprovado / valorTotalUltimoAprovado * 100) : 0;
    
    const valorSawing = valorTotalPrimeiroValor - valorTotalAtual;
    const valorSawingPercentual = valorTotalPrimeiroValor > 0 ? 
      (valorSawing / valorTotalPrimeiroValor * 100) : 0;

    return {
      valorTotalMelhorPreco,
      valorTotalMedio,
      economia,
      economiaPercentual,
      economiaUltimoAprovado,
      economiaUltimoAprovadoPercentual,
      valorSawing,
      valorSawingPercentual,
      estatisticas
    };
  };

  const handleEnviarGestor = () => {
    setAnaliseData({
      observacoes: '',
      decisao: 'enviar_gestor',
      justificativa: '',
      produtosSelecionados: []
    });
    setShowModal(true);
  };

  const handleRenegociar = () => {
    setAnaliseData({
      observacoes: '',
      decisao: 'renegociacao',
      justificativa: '',
      produtosSelecionados: []
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!analiseData.justificativa.trim()) {
      alert('Por favor, informe a justificativa da análise.');
      return;
    }

    // Validar se produtos foram selecionados para renegociação
    if (analiseData.decisao === 'renegociacao' && analiseData.produtosSelecionados.length === 0) {
      alert('Por favor, selecione pelo menos um produto para renegociação.');
      return;
    }

    setSaving(true);
    
    try {
      const payload = {
        observacoes: analiseData.observacoes,
        decisao: analiseData.decisao,
        justificativa: analiseData.justificativa,
        supervisorId: user.id,
        dataAnalise: new Date().toISOString(),
        produtosSelecionados: analiseData.produtosSelecionados
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes/${id}/analise-supervisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Análise enviada com sucesso!');
        navigate('/supervisor');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao processar análise');
      }
    } catch (error) {
      console.error('Erro ao processar análise:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setSaving(false);
      setShowModal(false);
      setAnaliseData({
        observacoes: '',
        decisao: 'enviar_gestor',
        justificativa: '',
        produtosSelecionados: []
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <LoadingState>
            <FaClock size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
            <h3>Carregando cotação...</h3>
            <p>Aguarde um momento</p>
          </LoadingState>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <ErrorState>
            <FaExclamationTriangle size={48} style={{ marginBottom: '16px', color: colors.status.error }} />
            <h3>Erro ao carregar cotação</h3>
            <p>{error}</p>
            <Button onClick={fetchCotacao} variant="primary" style={{ marginTop: '16px' }}>
              Tentar Novamente
            </Button>
          </ErrorState>
        </Container>
      </Layout>
    );
  }

  if (!cotacao) {
    return (
      <Layout>
        <Container>
          <ErrorState>
            <FaExclamationTriangle size={48} style={{ marginBottom: '16px', color: colors.status.error }} />
            <h3>Cotacao não encontrada</h3>
            <p>A cotação solicitada não foi encontrada</p>
          </ErrorState>
        </Container>
      </Layout>
    );
  }

  const estatisticas = calcularEstatisticas();

  return (
    <Layout>
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/supervisor')}>
            <FaArrowLeft />
            Voltar
          </BackButton>
          <div>
            <Title>Análise Supervisor - Cotação #{cotacao.id}</Title>
            <Subtitle>Análise técnica e encaminhamento para aprovação</Subtitle>
          </div>
        </Header>

        {/* Informações da Cotação */}
        <InfoCotacao>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Comprador</InfoLabel>
              <InfoValue>{cotacao.comprador}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Data de Criação</InfoLabel>
              <InfoValue>{formatarData(cotacao.data_criacao)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Status</InfoLabel>
              <StatusBadge status={cotacao.status}>
                {getStatusLabel(cotacao.status)}
              </StatusBadge>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Tipo</InfoLabel>
              <InfoValue>
                {cotacao.tipo_compra === 'emergencial' ? 
                  'Emergencial' : 'Programada'
                }
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Local de Entrega</InfoLabel>
              <InfoValue>{cotacao.local_entrega || 'CD CHAPECO'}</InfoValue>
            </InfoItem>
            {cotacao.motivo_emergencial && (
              <InfoItem>
                <InfoLabel>Motivo Emergencial</InfoLabel>
                <InfoValue>{cotacao.motivo_emergencial}</InfoValue>
              </InfoItem>
            )}
          </InfoGrid>
        </InfoCotacao>

        {/* Resumo do Orçamento */}
        <ResumoOrcamento>
          <ResumoTitle>
            <FaChartPie />
            Resumo do Orçamento
          </ResumoTitle>
          <ResumoCards>
            <ResumoCard>
              <ResumoValor>{estatisticas.totalProdutos}</ResumoValor>
              <ResumoLabel>Produtos</ResumoLabel>
            </ResumoCard>
            <ResumoCard>
              <ResumoValor>{estatisticas.totalFornecedores}</ResumoValor>
              <ResumoLabel>Fornecedores</ResumoLabel>
            </ResumoCard>
            <ResumoCard>
              <ResumoValor>{estatisticas.totalQuantidade.toFixed(2)}</ResumoValor>
              <ResumoLabel>Quantidade Total</ResumoLabel>
            </ResumoCard>
            <ResumoCard>
              <ResumoValor>{formatarValor(estatisticas.valorTotal)}</ResumoValor>
              <ResumoLabel>Valor Total</ResumoLabel>
            </ResumoCard>
          </ResumoCards>
        </ResumoOrcamento>

        {/* Botões de Visualização */}
        <VisualizacoesToggle>
          <ViewButton 
            active={viewMode === 'padrao'} 
            onClick={() => setViewMode('padrao')}
          >
            <FaList />
            Visualização Padrão
          </ViewButton>
          <ViewButton 
            active={viewMode === 'analise'} 
            onClick={() => setViewMode('analise')}
          >
            <FaChartBar />
            Análise Comparativa
          </ViewButton>
          <ViewButton 
            active={viewMode === 'melhor-preco'} 
            onClick={() => setViewMode('melhor-preco')}
          >
            <FaTag />
            Melhor Preço
          </ViewButton>
          <ViewButton 
            active={viewMode === 'melhor-entrega'} 
            onClick={() => setViewMode('melhor-entrega')}
          >
            <FaTruck />
            Melhor Prazo de Entrega
          </ViewButton>
          <ViewButton 
            active={viewMode === 'melhor-pagamento'} 
            onClick={() => setViewMode('melhor-pagamento')}
          >
            <FaCreditCard />
            Melhor Prazo de Pagamento
          </ViewButton>
          <ViewButton 
            active={viewMode === 'comparativo'} 
            onClick={() => setViewMode('comparativo')}
          >
            <FaChartBar />
            Comparativo de Produtos
          </ViewButton>
        </VisualizacoesToggle>

        {/* Conteúdo das Visualizações */}
        <VisualizacaoPadrao 
          cotacao={cotacao} 
          active={viewMode === 'padrao'} 
          formatarValor={formatarValor} 
        />
        <AnaliseComparativa 
          cotacao={cotacao} 
          active={viewMode === 'analise'} 
          formatarValor={formatarValor}
          analise={calcularAnaliseComparativa()}
        />
        <MelhorPreco 
          cotacao={cotacao} 
          active={viewMode === 'melhor-preco'} 
          formatarValor={formatarValor} 
        />
        <MelhorPrazoEntrega 
          cotacao={cotacao} 
          active={viewMode === 'melhor-entrega'} 
          formatarValor={formatarValor} 
        />
        <MelhorPrazoPagamento 
          cotacao={cotacao} 
          active={viewMode === 'melhor-pagamento'} 
        />
        <ComparativoProdutos 
          cotacao={cotacao} 
          active={viewMode === 'comparativo'} 
          formatarValor={formatarValor} 
        />

        {/* Botões de Ação */}
        {cotacao.status === 'em_analise' && (
          <ActionButtons>
            <SendButton onClick={handleEnviarGestor}>
              <FaUserCheck />
              Enviar para Gestor
            </SendButton>
            <RenegotiateButton onClick={handleRenegociar}>
              <FaSync />
              Solicitar Renegociação
            </RenegotiateButton>
          </ActionButtons>
        )}

        {/* Modal de Análise */}
        {showModal && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>
                  {analiseData.decisao === 'enviar_gestor' ? 'Enviar para Gestor' : 'Solicitar Renegociação'}
                </ModalTitle>
                <CloseButton onClick={() => setShowModal(false)}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Observações (opcional):
                </label>
                <TextArea
                  placeholder="Observações técnicas sobre a cotação..."
                  value={analiseData.observacoes}
                  onChange={(e) => setAnaliseData({...analiseData, observacoes: e.target.value})}
                />
              </div>
              
              {/* Seção de Seleção de Produtos para Renegociação */}
              {analiseData.decisao === 'renegociacao' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Produtos para Renegociação:
                  </label>
                  <div style={{ marginBottom: '10px' }}>
                    <Button 
                      onClick={() => {
                        // Selecionar todos os produtos
                        const todosProdutos = [];
                        cotacao.fornecedores?.forEach(fornecedor => {
                          fornecedor.produtos?.forEach(produto => {
                            todosProdutos.push({
                              produto_id: produto.produto_id,
                              produto_nome: produto.nome,
                              fornecedor_nome: fornecedor.nome
                            });
                          });
                        });
                        setAnaliseData({...analiseData, produtosSelecionados: todosProdutos});
                      }}
                      variant="secondary"
                      style={{ marginRight: '10px' }}
                    >
                      Selecionar Todos
                    </Button>
                    <Button 
                      onClick={() => setAnaliseData({...analiseData, produtosSelecionados: []})}
                      variant="secondary"
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                  
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    padding: '10px'
                  }}>
                    {cotacao.fornecedores?.map((fornecedor, fornecedorIndex) => (
                      <div key={fornecedorIndex} style={{ marginBottom: '15px' }}>
                        <h4 style={{ 
                          margin: '0 0 8px 0', 
                          color: colors.primary.green,
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {fornecedor.nome}
                        </h4>
                        {fornecedor.produtos?.map((produto, produtoIndex) => {
                          const isSelected = analiseData.produtosSelecionados.some(
                            p => p.produto_id === produto.produto_id && p.fornecedor_nome === fornecedor.nome
                          );
                          
                          return (
                            <div key={produtoIndex} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '8px',
                              backgroundColor: isSelected ? '#f0f8f0' : 'transparent',
                              borderRadius: '4px',
                              marginBottom: '4px'
                            }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    // Adicionar produto à seleção
                                    setAnaliseData({
                                      ...analiseData, 
                                      produtosSelecionados: [
                                        ...analiseData.produtosSelecionados,
                                        {
                                          produto_id: produto.produto_id,
                                          produto_nome: produto.nome,
                                          fornecedor_nome: fornecedor.nome
                                        }
                                      ]
                                    });
                                  } else {
                                    // Remover produto da seleção
                                    setAnaliseData({
                                      ...analiseData,
                                      produtosSelecionados: analiseData.produtosSelecionados.filter(
                                        p => !(p.produto_id === produto.produto_id && p.fornecedor_nome === fornecedor.nome)
                                      )
                                    });
                                  }
                                }}
                                style={{ marginRight: '10px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '500', fontSize: '13px' }}>
                                  {produto.nome}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  Qtd: {produto.qtde} {produto.un} | Valor: {formatarValor(produto.valor_unitario)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  
                  {analiseData.produtosSelecionados.length > 0 && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '8px', 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      <strong>{analiseData.produtosSelecionados.length}</strong> produto(s) selecionado(s) para renegociação
                    </div>
                  )}
                </div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Justificativa *
                </label>
                <TextArea
                  placeholder={
                    analiseData.decisao === 'enviar_gestor' 
                      ? 'Justificativa para envio ao gestor...' 
                      : 'Justificativa para renegociação...'
                  }
                  value={analiseData.justificativa}
                  onChange={(e) => setAnaliseData({...analiseData, justificativa: e.target.value})}
                />
              </div>
              
              <ActionButtons>
                <Button 
                  onClick={() => setShowModal(false)}
                  variant="secondary"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={saving || (analiseData.decisao === 'renegociacao' && analiseData.produtosSelecionados.length === 0)}
                  variant="primary"
                >
                  {saving ? 'Processando...' : 'Confirmar'}
                </Button>
              </ActionButtons>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </Layout>
  );
};

export default AnalisarCotacaoSupervisor; 