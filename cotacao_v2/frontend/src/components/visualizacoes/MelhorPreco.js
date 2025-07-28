import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaDollarSign, FaChartLine, FaSort, FaFilter, FaDownload } from 'react-icons/fa';
import { colors, typography, shadows } from '../../design-system';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  color: ${colors.neutral.darkGray};
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${colors.neutral.white};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${shadows.card};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.primary.green};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.neutral.gray};
  font-weight: 500;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid ${colors.neutral.lightGray};
  border-radius: 8px;
  font-size: 14px;
  background: ${colors.neutral.white};
  color: ${colors.neutral.darkGray};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary.green};
  }
`;

const TableContainer = styled.div`
  background: ${colors.neutral.white};
  border-radius: 12px;
  box-shadow: ${shadows.card};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: ${colors.neutral.lightGray};
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: ${colors.neutral.darkGray};
  border-bottom: 2px solid ${colors.neutral.lightGray};
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid ${colors.neutral.lightGray};
  font-size: 14px;
  color: ${colors.neutral.darkGray};
`;

const EconomiaBadge = styled.span`
  background: ${props => props.economia > 20 ? colors.success : props.economia > 10 ? colors.warning : colors.info};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const FornecedorBadge = styled.span`
  background: ${colors.primary.green};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${colors.neutral.gray};
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.neutral.gray};
  font-size: 16px;
`;

const MelhorPreco = ({ cotacaoId }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordenacao, setOrdenacao] = useState('economia_percentual');
  const [filtroEconomia, setFiltroEconomia] = useState('todos');

  useEffect(() => {
    if (cotacaoId) {
      carregarMelhoresPrecos();
    }
  }, [cotacaoId]);

  const carregarMelhoresPrecos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes/${cotacaoId}/melhor-preco`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDados(data);
      } else {
        console.error('Erro ao carregar melhores preços');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const filtrarEOrdenarProdutos = () => {
    if (!dados?.produtos) return [];

    let produtosFiltrados = [...dados.produtos];

    // Aplicar filtro de economia
    if (filtroEconomia !== 'todos') {
      const percentualMinimo = parseInt(filtroEconomia);
      produtosFiltrados = produtosFiltrados.filter(p => p.economia_percentual >= percentualMinimo);
    }

    // Aplicar ordenação
    produtosFiltrados.sort((a, b) => {
      switch (ordenacao) {
        case 'economia_percentual':
          return b.economia_percentual - a.economia_percentual;
        case 'economia_total':
          return b.economia_total - a.economia_total;
        case 'menor_valor':
          return a.menor_valor - b.menor_valor;
        case 'produto':
          return a.produto.localeCompare(b.produto);
        default:
          return 0;
      }
    });

    return produtosFiltrados;
  };

  const exportarDados = () => {
    const produtos = filtrarEOrdenarProdutos();
    const csvContent = [
      ['Produto', 'Quantidade', 'UN', 'Menor Valor', 'Fornecedor', 'Valor Médio', 'Maior Valor', 'Economia %', 'Economia Total'],
      ...produtos.map(p => [
        p.produto,
        p.qtde,
        p.un,
        formatarMoeda(p.menor_valor),
        p.fornecedor_menor_preco,
        formatarMoeda(p.valor_medio),
        formatarMoeda(p.maior_valor),
        `${p.economia_percentual}%`,
        formatarMoeda(p.economia_total)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `melhor-preco-cotacao-${cotacaoId}.csv`;
    link.click();
  };

  if (loading) {
    return <LoadingSpinner>Carregando análise de preços...</LoadingSpinner>;
  }

  if (!dados || dados.produtos.length === 0) {
    return (
      <Container>
        <NoDataMessage>
          <FaChartLine size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <div>Nenhum produto com múltiplos fornecedores encontrado para análise de preços.</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Adicione mais fornecedores para ver a análise de melhores preços.</div>
        </NoDataMessage>
      </Container>
    );
  }

  const produtosFiltrados = filtrarEOrdenarProdutos();

  return (
    <Container>
      <Header>
        <Title>
          <FaDollarSign color={colors.primary.green} />
          Melhor Preço
        </Title>
        <button onClick={exportarDados} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          padding: '8px 16px', 
          background: colors.primary.green, 
          color: 'white', 
          border: 'none', 
          borderRadius: 8, 
          cursor: 'pointer',
          fontSize: 14
        }}>
          <FaDownload />
          Exportar
        </button>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue>{formatarMoeda(dados.estatisticas.economiaTotal)}</StatValue>
          <StatLabel>Economia Total</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{dados.estatisticas.economiaPercentual}%</StatValue>
          <StatLabel>Economia Média</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{dados.estatisticas.produtosComEconomia}</StatValue>
          <StatLabel>Produtos com Economia</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{dados.estatisticas.totalProdutos}</StatValue>
          <StatLabel>Total de Produtos</StatLabel>
        </StatCard>
      </StatsGrid>

      <FiltersContainer>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaSort />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Ordenar por:</span>
          <FilterSelect value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
            <option value="economia_percentual">Maior Economia %</option>
            <option value="economia_total">Maior Economia R$</option>
            <option value="menor_valor">Menor Valor</option>
            <option value="produto">Nome do Produto</option>
          </FilterSelect>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaFilter />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Filtrar economia:</span>
          <FilterSelect value={filtroEconomia} onChange={(e) => setFiltroEconomia(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="5">≥ 5%</option>
            <option value="10">≥ 10%</option>
            <option value="20">≥ 20%</option>
            <option value="30">≥ 30%</option>
          </FilterSelect>
        </div>
      </FiltersContainer>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th>Qtd</Th>
              <Th>UN</Th>
              <Th>Menor Valor</Th>
              <Th>Fornecedor</Th>
              <Th>Valor Médio</Th>
              <Th>Maior Valor</Th>
              <Th>Economia %</Th>
              <Th>Economia Total</Th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map((produto, index) => (
              <tr key={index}>
                <Td style={{ fontWeight: 600 }}>{produto.produto}</Td>
                <Td>{produto.qtde}</Td>
                <Td>{produto.un}</Td>
                <Td style={{ fontWeight: 600, color: colors.primary.green }}>
                  {formatarMoeda(produto.menor_valor)}
                </Td>
                <Td>
                  <FornecedorBadge>{produto.fornecedor_menor_preco}</FornecedorBadge>
                </Td>
                <Td>{formatarMoeda(produto.valor_medio)}</Td>
                <Td>{formatarMoeda(produto.maior_valor)}</Td>
                <Td>
                  <EconomiaBadge economia={produto.economia_percentual}>
                    {produto.economia_percentual}%
                  </EconomiaBadge>
                </Td>
                <Td style={{ fontWeight: 600, color: colors.primary.green }}>
                  {formatarMoeda(produto.economia_total)}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default MelhorPreco; 