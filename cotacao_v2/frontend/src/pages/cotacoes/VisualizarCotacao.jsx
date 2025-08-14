import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { Button, Card, Badge, Table, Input } from '../../components/ui';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaUser,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaCalendar,
  FaTag
} from 'react-icons/fa';

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
    const statusMap = {
      'pendente': 'Pendente',
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aguardando_aprovacao_supervisor': 'Aguardando Supervisor',
      'em_analise': 'Em Análise',
      'aprovada': 'Aprovada',
      'rejeitada': 'Rejeitada',
      'renegociacao': 'Em Renegociação'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pendente': 'warning',
      'aguardando_aprovacao': 'info',
      'aguardando_aprovacao_supervisor': 'secondary',
      'em_analise': 'secondary',
      'aprovada': 'success',
      'rejeitada': 'danger',
      'renegociacao': 'warning'
    };
    return colorMap[status] || 'secondary';
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
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleVoltar = () => {
    navigate('/cotacoes');
  };

  const handleEditar = () => {
    navigate(`/editar-cotacao/${id}`);
  };

  const filteredFornecedores = cotacao?.fornecedores?.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchFornecedor.toLowerCase())
  ) || [];

  const filteredProdutos = cotacao?.produtos?.filter(produto =>
    produto.nome.toLowerCase().includes(searchProduto.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando cotação...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-danger-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar cotação</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchCotacao} variant="primary">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cotacao) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cotação não encontrada</h2>
            <p className="text-gray-600">A cotação solicitada não foi encontrada</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Visualizar Cotação #{cotacao.id}</h1>
                <p className="mt-2 text-gray-600">Detalhes da cotação e seus fornecedores</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleVoltar} variant="outline">
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
                  variant={cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao' ? 'outline' : 'primary'}
                  disabled={cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao'}
                >
                  <FaEdit /> Editar
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <Badge variant={getStatusColor(cotacao.status)}>
                {getStatusLabel(cotacao.status)}
              </Badge>
              <span className="text-gray-500 text-sm">
                Criada em {formatarData(cotacao.data_criacao)}
              </span>
            </div>
          </div>

          {/* Informações Básicas */}
          <Card className="mb-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FaUser />
                Informações Básicas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Comprador</label>
                  <p className="text-gray-900">{cotacao.comprador}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Local de Entrega</label>
                  <p className="text-gray-900">{cotacao.local_entrega}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tipo de Compra</label>
                  <p className="text-gray-900 capitalize">{cotacao.tipo_compra}</p>
                </div>
                
                {cotacao.motivo_emergencial && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Motivo Emergencial</label>
                    <p className="text-gray-900">{cotacao.motivo_emergencial}</p>
                  </div>
                )}
                
                {cotacao.justificativa && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Justificativa</label>
                    <p className="text-gray-900">{cotacao.justificativa}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Produtos */}
          <Card className="mb-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaShoppingCart />
                  Produtos ({cotacao.produtos?.length || 0})
                </h2>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar produto..."
                    value={searchProduto}
                    onChange={(e) => setSearchProduto(e.target.value)}
                    leftIcon={<FaEye />}
                    className="w-64"
                  />
                </div>
              </div>
              
              {cotacao.produtos && cotacao.produtos.length > 0 ? (
                <Table>
                  <Table.Header>
                    <Table.HeaderCell>Produto</Table.HeaderCell>
                    <Table.HeaderCell>Quantidade</Table.HeaderCell>
                    <Table.HeaderCell>Unidade</Table.HeaderCell>
                    <Table.HeaderCell>Prazo Entrega</Table.HeaderCell>
                    <Table.HeaderCell>Último Valor</Table.HeaderCell>
                    <Table.HeaderCell>Último Fornecedor</Table.HeaderCell>
                  </Table.Header>
                  <Table.Body>
                    {filteredProdutos.map((produto) => (
                      <Table.Row key={produto.id}>
                        <Table.Cell>{produto.nome}</Table.Cell>
                        <Table.Cell>{produto.qtde}</Table.Cell>
                        <Table.Cell>{produto.un}</Table.Cell>
                        <Table.Cell>{produto.prazo_entrega || '-'}</Table.Cell>
                        <Table.Cell>{formatarValor(produto.ult_valor_aprovado)}</Table.Cell>
                        <Table.Cell>{produto.ult_fornecedor_aprovado || '-'}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          </Card>

          {/* Fornecedores */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaTag />
                  Fornecedores ({cotacao.fornecedores?.length || 0})
                </h2>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar fornecedor..."
                    value={searchFornecedor}
                    onChange={(e) => setSearchFornecedor(e.target.value)}
                    leftIcon={<FaEye />}
                    className="w-64"
                  />
                </div>
              </div>
              
              {cotacao.fornecedores && cotacao.fornecedores.length > 0 ? (
                <div className="space-y-6">
                  {filteredFornecedores.map((fornecedor) => (
                    <div key={fornecedor.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{fornecedor.nome}</h3>
                        <div className="flex gap-2 text-sm text-gray-500">
                          <span>Prazo: {fornecedor.prazo_pagamento}</span>
                          <span>Frete: {fornecedor.tipo_frete}</span>
                          <span>Valor Frete: {formatarValor(fornecedor.valor_frete)}</span>
                        </div>
                      </div>
                      
                      {fornecedor.produtos && fornecedor.produtos.length > 0 && (
                        <Table>
                          <Table.Header>
                            <Table.HeaderCell>Produto</Table.HeaderCell>
                            <Table.HeaderCell>Valor Unitário</Table.HeaderCell>
                            <Table.HeaderCell>Total</Table.HeaderCell>
                            <Table.HeaderCell>Prazo Entrega</Table.HeaderCell>
                          </Table.Header>
                          <Table.Body>
                            {fornecedor.produtos.map((produto) => (
                              <Table.Row key={produto.id}>
                                <Table.Cell>{produto.nome}</Table.Cell>
                                <Table.Cell>{formatarValor(produto.valor_unitario)}</Table.Cell>
                                <Table.Cell>{formatarValor(produto.total)}</Table.Cell>
                                <Table.Cell>{produto.prazo_entrega || '-'}</Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum fornecedor encontrado</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VisualizarCotacao;
