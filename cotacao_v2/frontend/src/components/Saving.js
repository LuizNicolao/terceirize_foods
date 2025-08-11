import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import styled from 'styled-components';
import { 
  FaEye, 
  FaFileExport, 
  FaFilter,
  FaSearch,
  FaChartLine,
  FaDollarSign,
  FaPercentage,
  FaCalendarAlt,
  FaSpinner,
  FaInfoCircle
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  color: ${colors.neutral.darkGray};
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterInput = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: ${colors.neutral.white};
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }
`;

const FilterSelect = styled.select`
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

const FilterButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: end;
`;

const ApplyButton = styled(Button)`
  background: ${colors.primary.green};
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
    background: ${colors.primary.darkGreen};
    transform: translateY(-1px);
  }
`;

const ClearButton = styled(Button)`
  background: ${colors.neutral.gray};
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
    background: ${colors.neutral.darkGray};
    transform: translateY(-1px);
  }
`;



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

const TableContainer = styled.div`
  overflow-x: auto;
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
  background: ${props => props.variant === 'emergencial' ? colors.secondary.orange : colors.secondary.blue};
  color: ${colors.neutral.white};
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  width: fit-content;
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

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.neutral.gray};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.neutral.gray};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  gap: 8px;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  background: ${colors.neutral.white};
  color: ${colors.neutral.darkGray};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${colors.neutral.lightGray};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: ${colors.primary.green};
    color: ${colors.neutral.white};
    border-color: ${colors.primary.green};
  }
`;



const Saving = () => {
    const navigate = useNavigate();
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [limite] = useState(10);
    const [total, setTotal] = useState(0);
    const [resumo, setResumo] = useState({});
    const [filtros, setFiltros] = useState({
        comprador: '',
        tipo: '',
        status: '',
        data_inicio: '',
        data_fim: ''
    });
    const [compradores, setCompradores] = useState([]);

    // Carregar dados iniciais
    useEffect(() => {
        carregarDados();
        carregarCompradores();
    }, [pagina, filtros]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            console.log('Carregando dados de saving...');
            const params = new URLSearchParams({
                pagina,
                limite,
                ...filtros
            });

            console.log('URL da requisição:', `/api/saving?${params}`);
            const response = await axios.get(`/api/saving?${params}`);
            console.log('Resposta da API:', response.data);
            setDados(response.data.registros);
            setTotal(response.data.total);
            setResumo(response.data.resumo);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            console.error('Detalhes do erro:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const carregarCompradores = async () => {
        try {
            const response = await axios.get('/api/saving/compradores/listar');
            setCompradores(response.data.compradores);
        } catch (error) {
            console.error('Erro ao carregar compradores:', error);
        }
    };

    const aplicarFiltros = () => {
        setPagina(1);
        carregarDados();
    };

    const limparFiltros = () => {
        setFiltros({
            comprador: '',
            tipo: '',
            status: '',
            data_inicio: '',
            data_fim: ''
        });
        setPagina(1);
    };

    const verDetalhes = (id) => {
        navigate(`/visualizar-saving/${id}`);
    };









    return (
        <Layout>
            <Container>
                <Header>
                    <Title>Saving - Análise de Economia</Title>
                    <Subtitle>Monitore o impacto financeiro das negociações e economias obtidas</Subtitle>
                </Header>

                <FilterSection>
                    <FilterContainer>
                        <FilterGroup>
                            <FilterLabel>
                                <FaSearch />
                                Comprador:
                            </FilterLabel>
                            <FilterSelect
                                value={filtros.comprador}
                                onChange={(e) => setFiltros({...filtros, comprador: e.target.value})}
                            >
                                <option value="">Todos</option>
                                {compradores.map(comprador => (
                                    <option key={comprador.id} value={comprador.id}>
                                        {comprador.nome}
                                    </option>
                                ))}
                            </FilterSelect>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>
                                <FaFilter />
                                Tipo:
                            </FilterLabel>
                            <FilterSelect
                                value={filtros.tipo}
                                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                            >
                                <option value="">Todos</option>
                                <option value="programada">Programada</option>
                                <option value="emergencial">Emergencial</option>
                            </FilterSelect>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>
                                <FaCalendarAlt />
                                Data Início:
                            </FilterLabel>
                            <FilterInput
                                type="date"
                                value={filtros.data_inicio}
                                onChange={(e) => setFiltros({...filtros, data_inicio: e.target.value})}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>
                                <FaCalendarAlt />
                                Data Fim:
                            </FilterLabel>
                            <FilterInput
                                type="date"
                                value={filtros.data_fim}
                                onChange={(e) => setFiltros({...filtros, data_fim: e.target.value})}
                            />
                        </FilterGroup>

                        <FilterButtons>
                            <ApplyButton onClick={aplicarFiltros}>
                                <FaSearch />
                                Aplicar
                            </ApplyButton>

                            <ClearButton onClick={limparFiltros}>
                                <FaFilter />
                                Limpar
                            </ClearButton>
                        </FilterButtons>
                    </FilterContainer>
                </FilterSection>

                <ContentSection>
                    <ContentHeader>
                        <ContentTitle>Registros de Saving</ContentTitle>
                    </ContentHeader>

                    <TableContainer>
                        {loading ? (
                            <LoadingState>
                                <FaSpinner size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
                                <h3>Carregando dados...</h3>
                                <p>Aguarde um momento</p>
                            </LoadingState>
                        ) : dados.length === 0 ? (
                            <EmptyState>
                                <FaInfoCircle size={48} style={{ marginBottom: '16px', color: colors.neutral.gray }} />
                                <h3>Nenhum registro encontrado</h3>
                                <p>Não há dados de saving para os filtros aplicados</p>
                            </EmptyState>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>ID</Th>
                                        <Th>Cotação</Th>
                                        <Th>Comprador</Th>
                                        <Th>Data</Th>
                                        <Th>Valor Inicial</Th>
                                        <Th>Valor Final</Th>
                                        <Th>Economia</Th>
                                        <Th>%</Th>
                                        <Th>Rodadas</Th>
                                        <Th>Tipo</Th>
                                        <Th>Local</Th>
                                        <Th>Ações</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dados.map(registro => {
                                        const economia = parseFloat(registro.economia || 0);
                                        const economiaPercentual = parseFloat(registro.economia_percentual || 0);
                                        const tipo = registro.tipo || 'programada';
                                        
                                        return (
                                            <tr key={registro.id}>
                                                <Td>{registro.id}</Td>
                                                <Td>{registro.cotacao_id || 'N/A'}</Td>
                                                <Td>{registro.comprador_nome || 'N/A'}</Td>
                                                <Td>{formatDate(registro.data_registro)}</Td>
                                                <Td>{formatCurrency(registro.valor_total_inicial)}</Td>
                                                <Td>{formatCurrency(registro.valor_total_final)}</Td>
                                                <Td style={{ color: economia >= 0 ? colors.status.success : colors.status.error }}>
                                                    {formatCurrency(economia)}
                                                </Td>
                                                <Td style={{ color: economiaPercentual >= 0 ? colors.status.success : colors.status.error }}>
                                                    {economiaPercentual.toFixed(2)}%
                                                </Td>
                                                <Td>{registro.rodadas || '1'}</Td>
                                                <Td>
                                                    <StatusBadge variant={tipo}>
                                                        {tipo === 'emergencial' ? 'E' : 'P'}
                                                    </StatusBadge>
                                                </Td>
                                                <Td>{registro.centro_distribuicao || 'CD CHAPECO'}</Td>
                                                <Td>
                                                    <ActionButton 
                                                        onClick={() => verDetalhes(registro.id)}
                                                        title="Ver detalhes"
                                                    >
                                                        <FaEye />
                                                    </ActionButton>
                                                </Td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </TableContainer>

                    {!loading && dados.length > 0 && (
                        <PaginationContainer>
                            <span>
                                Mostrando {((pagina - 1) * limite) + 1} a {Math.min(pagina * limite, total)} de {total} registros
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <PaginationButton 
                                    onClick={() => setPagina(pagina - 1)}
                                    disabled={pagina === 1}
                                >
                                    Anterior
                                </PaginationButton>
                                
                                {Array.from({ length: Math.ceil(total / limite) }, (_, i) => i + 1)
                                    .filter(p => p >= Math.max(1, pagina - 2) && p <= Math.min(Math.ceil(total / limite), pagina + 2))
                                    .map(p => (
                                        <PaginationButton 
                                            key={p}
                                            className={p === pagina ? 'active' : ''}
                                            onClick={() => setPagina(p)}
                                        >
                                            {p}
                                        </PaginationButton>
                                    ))
                                }
                                
                                <PaginationButton 
                                    onClick={() => setPagina(pagina + 1)}
                                    disabled={pagina >= Math.ceil(total / limite)}
                                >
                                    Próxima
                                </PaginationButton>
                            </div>
                        </PaginationContainer>
                    )}
                </ContentSection>
            </Container>


        </Layout>
    );
};

export default Saving; 