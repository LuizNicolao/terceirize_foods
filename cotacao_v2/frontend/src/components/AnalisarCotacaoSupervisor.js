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
  max-width: 1350px;
  width: 98%;
  max-height: 95vh;
  overflow-y: auto;
  padding: 40px;
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
  
  // Estados para busca e filtros
  const [searchFornecedor, setSearchFornecedor] = useState('');
  const [searchProduto, setSearchProduto] = useState('');

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

  // Função para filtrar produtos baseado nos termos de busca
  const getProdutosFiltrados = () => {
    if (!cotacao || !cotacao.fornecedores) return [];
    
    const produtosFiltrados = [];
    
    cotacao.fornecedores.forEach(fornecedor => {
      // Filtrar por fornecedor
      const fornecedorMatch = !searchFornecedor || 
        fornecedor.nome?.toLowerCase().includes(searchFornecedor.toLowerCase());
      
      if (fornecedorMatch && fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          // Filtrar por produto
          const produtoMatch = !searchProduto || 
            produto.nome?.toLowerCase().includes(searchProduto.toLowerCase());
          
          if (produtoMatch) {
            produtosFiltrados.push({
              ...produto,
              fornecedor_nome: fornecedor.nome,
              fornecedor_id: fornecedor.id
            });
          }
        });
      }
    });
    
    return produtosFiltrados;
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
      // Limpar campos de busca
      setSearchFornecedor('');
      setSearchProduto('');
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
              {analiseData.decisao === 'enviar_gestor' ? '📤 Enviar para Gestor' : '🔄 Solicitar Renegociação'}
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
                <div style={{ 
                  marginBottom: '30px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '25px',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: colors.primary.green,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      📦
                    </div>
                    <div>
                      <h3 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '18px', 
                        fontWeight: '700',
                        color: colors.neutral.darkGray
                      }}>
                        Seleção de Produtos para Renegociação
                      </h3>
                      <p style={{ 
                        margin: '0', 
                        fontSize: '14px', 
                        color: colors.neutral.gray
                      }}>
                        Selecione os produtos que precisam ser renegociados com os fornecedores
                      </p>
                    </div>
                  </div>
                  
                  {/* Campos de Busca */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '20px', 
                    marginBottom: '25px'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '6px', 
                        fontSize: '13px', 
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        🔍 Buscar Fornecedor:
                      </label>
                      <input
                        type="text"
                        placeholder="Digite o nome do fornecedor..."
                        value={searchFornecedor}
                        onChange={(e) => setSearchFornecedor(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = colors.primary.green}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '6px', 
                        fontSize: '13px', 
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        🔍 Buscar Produto:
                      </label>
                                              <input
                          type="text"
                          placeholder="Digite o nome do produto..."
                          value={searchProduto}
                          onChange={(e) => setSearchProduto(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            transition: 'border-color 0.3s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = colors.primary.green}
                          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                      </div>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '6px', 
                          fontSize: '13px', 
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          📊 Estatísticas:
                        </label>
                        <div style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#f8f9fa',
                          color: '#666',
                          textAlign: 'center',
                          fontWeight: '500'
                        }}>
                          {(() => {
                            const produtosFiltrados = getProdutosFiltrados();
                            const totalProdutos = cotacao.fornecedores?.reduce((total, f) => 
                              total + (f.produtos?.length || 0), 0) || 0;
                            
                            if (searchFornecedor || searchProduto) {
                              return `${produtosFiltrados.length} de ${totalProdutos} produtos`;
                            }
                            return `${totalProdutos} produtos disponíveis`;
                          })()}
                        </div>
                      </div>
                    </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px', 
                    marginBottom: '20px'
                  }}>
                    <Button 
                      onClick={() => {
                        // Selecionar todos os produtos filtrados
                        const produtosFiltrados = getProdutosFiltrados();
                        const todosProdutos = produtosFiltrados.map(produto => ({
                          produto_id: produto.produto_id,
                          produto_nome: produto.nome,
                          fornecedor_nome: produto.fornecedor_nome
                        }));
                        setAnaliseData({...analiseData, produtosSelecionados: todosProdutos});
                      }}
                      variant="secondary"
                      style={{ 
                        fontSize: '14px',
                        padding: '12px 20px',
                        height: 'auto',
                        minHeight: '45px'
                      }}
                    >
                      ✅ Selecionar Filtrados
                    </Button>
                    <Button 
                      onClick={() => {
                        // Selecionar todos os produtos (sem filtro)
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
                      style={{ 
                        fontSize: '14px',
                        padding: '12px 20px',
                        height: 'auto',
                        minHeight: '45px'
                      }}
                    >
                      ✅ Selecionar Todos
                    </Button>
                    <Button 
                      onClick={() => setAnaliseData({...analiseData, produtosSelecionados: []})}
                      variant="secondary"
                      style={{ 
                        fontSize: '14px',
                        padding: '12px 20px',
                        height: 'auto',
                        minHeight: '45px'
                      }}
                    >
                      🗑️ Limpar Seleção
                    </Button>
                  </div>
                  
                  <div style={{ 
                    maxHeight: '500px', 
                    overflowY: 'auto', 
                    border: '2px solid #e0e0e0', 
                    borderRadius: '8px',
                    padding: '0',
                    backgroundColor: 'white'
                  }}>
                    {(() => {
                      const produtosFiltrados = getProdutosFiltrados();
                      
                      if (produtosFiltrados.length === 0) {
                        return (
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '40px 20px', 
                            color: '#5a6c7d',
                            fontSize: '16px'
                          }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                            {searchFornecedor || searchProduto ? 
                              'Nenhum produto encontrado com os filtros aplicados.' : 
                              'Nenhum produto disponível para seleção.'
                            }
                          </div>
                        );
                      }
                      
                      // Agrupar produtos por fornecedor
                      const produtosPorFornecedor = {};
                      produtosFiltrados.forEach(produto => {
                        if (!produtosPorFornecedor[produto.fornecedor_nome]) {
                          produtosPorFornecedor[produto.fornecedor_nome] = [];
                        }
                        produtosPorFornecedor[produto.fornecedor_nome].push(produto);
                      });
                      
                      return Object.entries(produtosPorFornecedor).map(([fornecedorNome, produtos], fornecedorIndex) => {
                        // Calcular estatísticas do fornecedor
                        const totalProdutos = produtos.length;
                        const produtosSelecionados = produtos.filter(produto => 
                          analiseData.produtosSelecionados.some(
                            p => p.produto_id === produto.produto_id && p.fornecedor_nome === produto.fornecedor_nome
                          )
                        ).length;
                        const valorTotal = produtos.reduce((total, p) => total + (parseFloat(p.total) || 0), 0);
                        
                        return (
                          <div key={fornecedorIndex} style={{ 
                            borderBottom: fornecedorIndex < Object.keys(produtosPorFornecedor).length - 1 ? '2px solid #f0f0f0' : 'none'
                          }}>
                            {/* Header do Fornecedor */}
                            <div style={{ 
                              padding: '15px 20px',
                              backgroundColor: '#f8f9fa',
                              borderBottom: '1px solid #e0e0e0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: colors.primary.green,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '14px',
                                  fontWeight: 'bold'
                                }}>
                                  🏢
                                </div>
                                <div>
                                  <h4 style={{ 
                                    margin: '0 0 2px 0', 
                                    color: colors.primary.green,
                                    fontSize: '16px',
                                    fontWeight: '700'
                                  }}>
                                    {fornecedorNome}
                                  </h4>
                                  <div style={{ 
                                    fontSize: '12px', 
                                    color: '#5a6c7d',
                                    display: 'flex',
                                    gap: '15px'
                                  }}>
                                    <span>📦 {totalProdutos} produtos</span>
                                    <span>✅ {produtosSelecionados} selecionados</span>
                                    <span>💰 {formatarValor(valorTotal)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Checkbox para selecionar todos do fornecedor */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="checkbox"
                                  checked={produtosSelecionados === totalProdutos && totalProdutos > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // Selecionar todos os produtos do fornecedor
                                      const novosProdutos = produtos.map(produto => ({
                                        produto_id: produto.produto_id,
                                        produto_nome: produto.nome,
                                        fornecedor_nome: produto.fornecedor_nome
                                      }));
                                      setAnaliseData({
                                        ...analiseData,
                                        produtosSelecionados: [
                                          ...analiseData.produtosSelecionados.filter(p => p.fornecedor_nome !== fornecedorNome),
                                          ...novosProdutos
                                        ]
                                      });
                                    } else {
                                      // Desmarcar todos os produtos do fornecedor
                                      setAnaliseData({
                                        ...analiseData,
                                        produtosSelecionados: analiseData.produtosSelecionados.filter(p => p.fornecedor_nome !== fornecedorNome)
                                      });
                                    }
                                  }}
                                  style={{ marginRight: '4px' }}
                                />
                                <span style={{ fontSize: '12px', color: '#5a6c7d', fontWeight: '500' }}>
                                  Selecionar todos
                                </span>
                              </div>
                            </div>
                            
                            {/* Lista de Produtos */}
                            <div style={{ padding: '0 20px' }}>
                              {produtos.map((produto, produtoIndex) => {
                                const isSelected = analiseData.produtosSelecionados.some(
                                  p => p.produto_id === produto.produto_id && p.fornecedor_nome === produto.fornecedor_nome
                                );
                                
                                return (
                                  <div key={produtoIndex} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    padding: '12px 0',
                                    borderBottom: produtoIndex < produtos.length - 1 ? '1px solid #f5f5f5' : 'none',
                                    backgroundColor: isSelected ? '#f0f8f0' : 'transparent',
                                    borderRadius: '6px',
                                    margin: '4px 0',
                                    transition: 'all 0.2s ease'
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
                                                fornecedor_nome: produto.fornecedor_nome
                                              }
                                            ]
                                          });
                                        } else {
                                          // Remover produto da seleção
                                          setAnaliseData({
                                            ...analiseData,
                                            produtosSelecionados: analiseData.produtosSelecionados.filter(
                                              p => !(p.produto_id === produto.produto_id && p.fornecedor_nome === produto.fornecedor_nome)
                                            )
                                          });
                                        }
                                      }}
                                      style={{ marginRight: '15px' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ 
                                        fontWeight: '600', 
                                        fontSize: '14px',
                                        color: isSelected ? colors.primary.green : '#2c3e50',
                                        marginBottom: '4px'
                                      }}>
                                        {produto.nome}
                                        {isSelected && (
                                          <span style={{
                                            marginLeft: '8px',
                                            backgroundColor: colors.primary.green,
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                          }}>
                                            SELECIONADO
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ 
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                        gap: '8px',
                                        fontSize: '12px', 
                                        color: '#5a6c7d'
                                      }}>
                                        <span>📦 Qtd: {produto.qtde} {produto.un}</span>
                                        <span>💰 Valor: {formatarValor(produto.valor_unitario)}</span>
                                        <span>📊 Total: {formatarValor(produto.total)}</span>
                                        {produto.prazo_entrega && (
                                          <span>🚚 Prazo: {produto.prazo_entrega}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div style={{ 
                    marginTop: '25px', 
                    padding: '20px', 
                    backgroundColor: analiseData.produtosSelecionados.length > 0 ? '#e8f5e8' : '#f8f9fa', 
                    borderRadius: '12px',
                    fontSize: '14px',
                    border: analiseData.produtosSelecionados.length > 0 ? '2px solid #4caf50' : '1px solid #e0e0e0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: analiseData.produtosSelecionados.length > 0 ? '15px' : '0'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        fontWeight: '600',
                        color: analiseData.produtosSelecionados.length > 0 ? '#2e7d32' : '#666'
                      }}>
                        <span style={{ fontSize: '20px' }}>
                          {analiseData.produtosSelecionados.length > 0 ? '✅' : '📋'}
                        </span>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '700' }}>
                            <strong>{analiseData.produtosSelecionados.length}</strong> produto(s) selecionado(s)
                          </div>
                          <div style={{ fontSize: '12px', color: '#5a6c7d' }}>
                            Pronto para renegociação
                          </div>
                        </div>
                      </div>
                                              <div style={{ 
                          color: '#5a6c7d',
                          fontSize: '12px',
                          backgroundColor: '#fff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e0e0e0',
                          fontWeight: '500'
                        }}>
                        {(() => {
                          const produtosFiltrados = getProdutosFiltrados();
                          const totalProdutos = cotacao.fornecedores?.reduce((total, f) => 
                            total + (f.produtos?.length || 0), 0) || 0;
                          
                          if (searchFornecedor || searchProduto) {
                            return `Exibindo ${produtosFiltrados.length} de ${totalProdutos} produtos`;
                          }
                          return `${totalProdutos} produtos disponíveis`;
                        })()}
                      </div>
                    </div>
                    
                    {/* Estatísticas detalhadas quando há produtos selecionados */}
                    {analiseData.produtosSelecionados.length > 0 && (
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '15px',
                        padding: '15px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: colors.primary.green }}>
                            {(() => {
                              const fornecedoresUnicos = new Set(analiseData.produtosSelecionados.map(p => p.fornecedor_nome));
                              return fornecedoresUnicos.size;
                            })()}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5a6c7d' }}>Fornecedores</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: colors.primary.green }}>
                            {analiseData.produtosSelecionados.length}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5a6c7d' }}>Produtos</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: colors.primary.green }}>
                            {(() => {
                              const produtosSelecionados = analiseData.produtosSelecionados;
                              // Buscar os produtos completos da cotação
                              const produtosCompletos = [];
                              cotacao.fornecedores?.forEach(fornecedor => {
                                fornecedor.produtos?.forEach(produto => {
                                  if (produtosSelecionados.some(ps => 
                                    ps.produto_id === produto.produto_id && ps.fornecedor_nome === fornecedor.nome
                                  )) {
                                    produtosCompletos.push(produto);
                                  }
                                });
                              });
                              const valorTotal = produtosCompletos.reduce((total, p) => total + (parseFloat(p.total) || 0), 0);
                              return formatarValor(valorTotal);
                            })()}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5a6c7d' }}>Valor Total</div>
                        </div>
                      </div>
                    )}
                  </div>
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
                  onClick={() => {
                    setShowModal(false);
                    // Limpar campos de busca
                    setSearchFornecedor('');
                    setSearchProduto('');
                  }}
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