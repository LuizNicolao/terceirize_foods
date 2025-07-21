import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import styled from 'styled-components';
import { 
  FaArrowLeft,
  FaChartLine,
  FaDollarSign,
  FaPercentage,
  FaCalendarAlt,
  FaSpinner,
  FaInfoCircle,
  FaDownload
} from 'react-icons/fa';
import { colors, typography, shadows } from '../design-system';
import { Button, Card } from '../design-system/components';
import { formatCurrency, formatDate } from '../utils/formatters';

// Componentes estilizados
const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled(Button)`
  background: ${colors.neutral.gray};
  color: ${colors.neutral.white};
  padding: 12px 16px;
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
    background: ${colors.neutral.darkGray};
    transform: translateY(-1px);
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

const ContentSection = styled(Card)`
  overflow: hidden;
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

const ResumoCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const ResumoCard = styled.div`
  background: ${colors.neutral.white};
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ResumoValor = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.neutral.darkGray};
  margin-bottom: 8px;
`;

const ResumoLabel = styled.div`
  font-size: 14px;
  color: ${colors.neutral.gray};
  font-weight: 500;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const InfoItem = styled.div`
  background: ${colors.neutral.white};
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: ${colors.neutral.gray};
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: ${colors.neutral.darkGray};
  font-weight: 500;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.variant === 'emergencial' ? colors.secondary.orange : colors.secondary.blue};
  color: ${colors.neutral.white};
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  width: fit-content;
`;

const SectionTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 18px;
  font-weight: 600;
  margin: 32px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${colors.primary.green};
`;

const ProdutosTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const ProdutosTh = styled.th`
  background: ${colors.neutral.lightGray};
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: ${colors.neutral.darkGray};
  border-bottom: 2px solid #e0e0e0;
`;

const ProdutosTd = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  color: ${colors.neutral.darkGray};
`;

const ExportButton = styled(Button)`
  background: ${colors.secondary.blue};
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
    background: #1976D2;
    transform: translateY(-1px);
  }
`;

const VisualizarSaving = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [detalhes, setDetalhes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        carregarDetalhes();
    }, [id]);

    const carregarDetalhes = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(`/api/saving/${id}`);
            setDetalhes(response.data);
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            setError('Erro ao carregar os detalhes do saving. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/saving');
    };

    const exportarDetalhes = async (formato = 'excel') => {
        try {
            const response = await axios.get(`/api/saving/${id}/exportar?formato=${formato}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `saving_${id}_${new Date().toISOString().split('T')[0]}.${formato}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Erro ao exportar detalhes:', error);
        }
    };

    if (loading) {
        return (
            <Layout>
                <Container>
                    <LoadingState>
                        <FaSpinner size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
                        <h3>Carregando detalhes...</h3>
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
                        <FaInfoCircle size={48} style={{ marginBottom: '16px', color: colors.status.error }} />
                        <h3>Erro ao carregar dados</h3>
                        <p>{error}</p>
                        <BackButton onClick={handleBack}>
                            <FaArrowLeft />
                            Voltar
                        </BackButton>
                    </ErrorState>
                </Container>
            </Layout>
        );
    }

    if (!detalhes) {
        return (
            <Layout>
                <Container>
                    <ErrorState>
                        <FaInfoCircle size={48} style={{ marginBottom: '16px', color: colors.status.error }} />
                        <h3>Saving não encontrado</h3>
                        <p>O saving solicitado não foi encontrado.</p>
                        <BackButton onClick={handleBack}>
                            <FaArrowLeft />
                            Voltar
                        </BackButton>
                    </ErrorState>
                </Container>
            </Layout>
        );
    }

    return (
        <Layout>
            <Container>
                <Header>
                    <BackButton onClick={handleBack}>
                        <FaArrowLeft />
                        Voltar
                    </BackButton>
                    <div>
                        <Title>Detalhes do Saving #{detalhes.id}</Title>
                        <Subtitle>Análise completa da economia obtida</Subtitle>
                    </div>
                    <ExportButton onClick={() => exportarDetalhes('excel')}>
                        <FaDownload />
                        Exportar
                    </ExportButton>
                </Header>

                <ContentSection>
                    {/* Cards de Resumo */}
                    <ResumoCards>
                        <ResumoCard>
                            <ResumoValor>
                                {formatCurrency(detalhes.valor_total_inicial)}
                            </ResumoValor>
                            <ResumoLabel>Valor Inicial</ResumoLabel>
                        </ResumoCard>
                        
                        <ResumoCard>
                            <ResumoValor>
                                {formatCurrency(detalhes.valor_total_final)}
                            </ResumoValor>
                            <ResumoLabel>Valor Final</ResumoLabel>
                        </ResumoCard>
                        
                        <ResumoCard>
                            <ResumoValor style={{ 
                                color: detalhes.economia >= 0 ? colors.status.success : colors.status.error 
                            }}>
                                {formatCurrency(detalhes.economia)}
                            </ResumoValor>
                            <ResumoLabel>Economia</ResumoLabel>
                        </ResumoCard>
                        
                        <ResumoCard>
                            <ResumoValor style={{ 
                                color: detalhes.economia_percentual >= 0 ? colors.status.success : colors.status.error 
                            }}>
                                {parseFloat(detalhes.economia_percentual || 0).toFixed(2)}%
                            </ResumoValor>
                            <ResumoLabel>Economia (%)</ResumoLabel>
                        </ResumoCard>
                    </ResumoCards>

                    {/* Informações Detalhadas */}
                    <InfoGrid>
                        <InfoItem>
                            <InfoLabel>ID</InfoLabel>
                            <InfoValue>{detalhes.id}</InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                            <InfoLabel>Data de Criação</InfoLabel>
                            <InfoValue>{formatDate(detalhes.data_registro)}</InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                            <InfoLabel>Data de Aprovação</InfoLabel>
                            <InfoValue>
                                {detalhes.data_aprovacao ? 
                                    formatDate(detalhes.data_aprovacao) : 
                                    'Data não informada'
                                }
                            </InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                            <InfoLabel>Rodadas</InfoLabel>
                            <InfoValue>{detalhes.rodadas || '1'}</InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                            <InfoLabel>Status</InfoLabel>
                            <InfoValue>
                                <StatusBadge variant={detalhes.status}>
                                    {detalhes.status === 'concluido' ? 'Concluído' :
                                     detalhes.status === 'em_andamento' ? 'Em Andamento' :
                                     detalhes.status === 'pendente' ? 'Pendente' :
                                     detalhes.status === 'cancelado' ? 'Cancelado' :
                                     detalhes.status}
                                </StatusBadge>
                            </InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                            <InfoLabel>Tipo de Compra</InfoLabel>
                            <InfoValue>
                                <StatusBadge variant={detalhes.tipo}>
                                    {detalhes.tipo === 'emergencial' ? 'Emergencial' : 'Programada'}
                                </StatusBadge>
                            </InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                            <InfoLabel>Local de Entrega</InfoLabel>
                            <InfoValue>{detalhes.centro_distribuicao || 'CD CHAPECO'}</InfoValue>
                        </InfoItem>
                        
                        <InfoItem>
                            <InfoLabel>Comprador</InfoLabel>
                            <InfoValue>{detalhes.comprador_nome || 'N/A'}</InfoValue>
                        </InfoItem>
                    </InfoGrid>

                    {/* Justificativa Emergencial */}
                    {detalhes.tipo === 'emergencial' && detalhes.motivo_emergencial && (
                        <InfoItem style={{ gridColumn: '1 / -1' }}>
                            <InfoLabel>Justificativa da Compra Emergencial</InfoLabel>
                            <InfoValue>{detalhes.motivo_emergencial}</InfoValue>
                        </InfoItem>
                    )}

                    {/* Observações */}
                    <InfoItem style={{ gridColumn: '1 / -1' }}>
                        <InfoLabel>Observações</InfoLabel>
                        <InfoValue>{detalhes.observacoes || 'Nenhuma observação'}</InfoValue>
                    </InfoItem>

                    {/* Produtos */}
                    <SectionTitle>Produtos Negociados</SectionTitle>
                    {detalhes.produtos && detalhes.produtos.length > 0 ? (
                        <ProdutosTable>
                            <thead>
                                <tr>
                                    <ProdutosTh>Produto</ProdutosTh>
                                    <ProdutosTh>Quantidade</ProdutosTh>
                                    <ProdutosTh>Valor Inicial</ProdutosTh>
                                    <ProdutosTh>Valor Final</ProdutosTh>
                                    <ProdutosTh>Economia</ProdutosTh>
                                    <ProdutosTh>Economia Total</ProdutosTh>
                                    <ProdutosTh>Fornecedor</ProdutosTh>
                                    <ProdutosTh>Prazo Pagamento</ProdutosTh>
                                </tr>
                            </thead>
                            <tbody>
                                {detalhes.produtos.map((produto, index) => {
                                    const valorInicial = parseFloat(produto.valor_unitario_inicial || 0);
                                    const valorFinal = parseFloat(produto.valor_unitario_final || 0);
                                    const quantidade = parseFloat(produto.quantidade || 0);
                                    const economia = valorInicial - valorFinal;
                                    const economiaTotal = economia * quantidade;
                                    const economiaPercentual = valorInicial > 0 ? 
                                        (economia / valorInicial * 100) : 0;
                                    
                                    return (
                                        <tr key={index}>
                                            <ProdutosTd>{produto.descricao}</ProdutosTd>
                                            <ProdutosTd>{quantidade}</ProdutosTd>
                                            <ProdutosTd>{formatCurrency(valorInicial)}</ProdutosTd>
                                            <ProdutosTd>{formatCurrency(valorFinal)}</ProdutosTd>
                                            <ProdutosTd style={{ 
                                                color: economia > 0 ? colors.status.success : 
                                                       economia < 0 ? colors.status.error : colors.neutral.gray 
                                            }}>
                                                {formatCurrency(economia)}
                                                <br />
                                                <small>({economiaPercentual.toFixed(2)}%)</small>
                                            </ProdutosTd>
                                            <ProdutosTd style={{ 
                                                color: economiaTotal > 0 ? colors.status.success : 
                                                       economiaTotal < 0 ? colors.status.error : colors.neutral.gray 
                                            }}>
                                                {formatCurrency(economiaTotal)}
                                            </ProdutosTd>
                                            <ProdutosTd>{produto.fornecedor}</ProdutosTd>
                                            <ProdutosTd>{produto.prazo_pagamento || 'N/A'}</ProdutosTd>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </ProdutosTable>
                    ) : (
                        <p>Nenhum produto encontrado para este saving.</p>
                    )}
                </ContentSection>
            </Container>
        </Layout>
    );
};

export default VisualizarSaving; 