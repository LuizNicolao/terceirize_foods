import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { Button, Input, Card, Modal, Table } from '../../components/ui';
import { 
  FaSave, 
  FaTimes, 
  FaUser, 
  FaMapMarkerAlt, 
  FaShoppingCart,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaEdit,
  FaTag
} from 'react-icons/fa';

const EditarCotacao = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: authUser } = useAuth();
  
  const [formData, setFormData] = useState({
    comprador: '',
    localEntrega: '',
    tipoCompra: 'programada',
    motivoEmergencial: '',
    justificativa: ''
  });

  const [errors, setErrors] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const locaisEntrega = [
    'CD CHAPECO',
    'CD CURITIBANOS',
    'COZINHA TOLEDO',
    'MANUTENCAO CHAPECO',
    'MANUTENCAO CURITIBANOS'
  ];

  const tiposFrete = [
    'CIF',
    'FOB',
    'FAS',
    'EXW',
    'CPT',
    'CIP',
    'DAP',
    'DPU',
    'DDP'
  ];

  const motivosEmergenciais = [
    'Atraso fornecedor',
    'Aumento de consumo',
    'Substituição/Reposição de produtos (ponto a ponto)',
    'Troca de cardápio',
    'Implantação',
    'Substituição de equipamento/utensílio por dano',
    'Notificação',
    'Outro(s)'
  ];

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
        
        setFormData({
          comprador: data.comprador || '',
          localEntrega: data.local_entrega || '',
          tipoCompra: data.tipo_compra || 'programada',
          motivoEmergencial: data.motivo_emergencial || '',
          justificativa: data.justificativa || ''
        });
        
        setProdutos(data.produtos || []);
        setFornecedores(data.fornecedores || []);
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const cotacaoData = {
        ...formData,
        produtos: produtos.map(produto => ({
          nome: produto.nome,
          qtde: produto.qtde,
          un: produto.un,
          prazo_entrega: produto.prazoEntrega,
          ult_valor_aprovado: produto.ultValorAprovado,
          ult_fornecedor_aprovado: produto.ultFornecedorAprovado,
          valor_anterior: produto.valorAnterior,
          valor_unitario: produto.valorUnitario,
          difal: produto.difal,
          ipi: produto.ipi,
          data_entrega_fn: produto.dataEntregaFn,
          total: produto.total
        })),
        fornecedores: fornecedores.map(fornecedor => ({
          nome: fornecedor.nome,
          prazo_pagamento: fornecedor.prazoPagamento,
          tipo_frete: fornecedor.tipoFrete,
          valor_frete: fornecedor.valorFrete,
          produtos: fornecedor.produtos.map(produto => ({
            produto_id: produto.id,
            valor_unitario: produto.valorUnitario,
            primeiro_valor: produto.primeiroValor,
            valor_anterior: produto.valorAnterior,
            total: produto.total,
            difal: produto.difal,
            ipi: produto.ipi,
            prazo_entrega: produto.prazoEntrega,
            data_entrega_fn: produto.dataEntregaFn
          }))
        }))
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cotacaoData)
      });

      if (response.ok) {
        alert('Cotação atualizada com sucesso!');
        navigate('/cotacoes');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao atualizar cotação');
      }
    } catch (error) {
      console.error('Erro ao atualizar cotação:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setSaving(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.localEntrega) {
      newErrors.localEntrega = 'Local de entrega é obrigatório';
    }

    if (formData.tipoCompra === 'emergencial') {
      if (!formData.motivoEmergencial) {
        newErrors.motivoEmergencial = 'Motivo da compra emergencial é obrigatório';
      }
      if (!formData.justificativa) {
        newErrors.justificativa = 'Justificativa é obrigatória';
      }
    }

    if (produtos.length === 0) {
      newErrors.produtos = 'É necessário ter produtos na cotação';
    }

    if (fornecedores.length === 0) {
      newErrors.fornecedores = 'É necessário adicionar pelo menos um fornecedor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.')) {
      navigate('/cotacoes');
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Cotação #{id}</h1>
                <p className="mt-2 text-gray-600">Modifique os dados da cotação</p>
              </div>
              <Button onClick={() => navigate('/cotacoes')} variant="outline">
                <FaArrowLeft /> Voltar
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Seção 1: Informações Básicas */}
            <Card>
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaUser />
                  Informações Básicas
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Comprador"
                    value={formData.comprador}
                    disabled
                    leftIcon={<FaUser />}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaMapMarkerAlt className="inline mr-2" />
                      Local de Entrega
                    </label>
                    <select
                      value={formData.localEntrega}
                      onChange={(e) => handleInputChange('localEntrega', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">Selecione o local</option>
                      {locaisEntrega.map(local => (
                        <option key={local} value={local}>{local}</option>
                      ))}
                    </select>
                    {errors.localEntrega && (
                      <p className="mt-1 text-sm text-danger-600">{errors.localEntrega}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaShoppingCart className="inline mr-2" />
                      Tipo de Compra
                    </label>
                    <select
                      value={formData.tipoCompra}
                      onChange={(e) => handleInputChange('tipoCompra', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="programada">Programada</option>
                      <option value="emergencial">Emergencial</option>
                      <option value="tag">TAG</option>
                    </select>
                  </div>
                </div>

                {formData.tipoCompra === 'emergencial' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaExclamationTriangle className="inline mr-2" />
                        Motivo da Compra Emergencial
                      </label>
                      <select
                        value={formData.motivoEmergencial}
                        onChange={(e) => handleInputChange('motivoEmergencial', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Selecione o motivo</option>
                        {motivosEmergenciais.map(motivo => (
                          <option key={motivo} value={motivo}>{motivo}</option>
                        ))}
                      </select>
                      {errors.motivoEmergencial && (
                        <p className="mt-1 text-sm text-danger-600">{errors.motivoEmergencial}</p>
                      )}
                    </div>

                    <Input
                      label="Justificativa"
                      value={formData.justificativa}
                      onChange={(e) => handleInputChange('justificativa', e.target.value)}
                      placeholder="Descreva a justificativa para a compra emergencial"
                      error={errors.justificativa}
                      multiline
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Produtos */}
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaShoppingCart />
                    Produtos ({produtos.length})
                  </h2>
                  <Button variant="outline" size="sm">
                    <FaPlus /> Adicionar Produto
                  </Button>
                </div>
                
                {produtos.length > 0 ? (
                  <Table>
                    <Table.Header>
                      <Table.HeaderCell>Produto</Table.HeaderCell>
                      <Table.HeaderCell>Quantidade</Table.HeaderCell>
                      <Table.HeaderCell>Unidade</Table.HeaderCell>
                      <Table.HeaderCell>Prazo Entrega</Table.HeaderCell>
                      <Table.HeaderCell>Último Valor</Table.HeaderCell>
                      <Table.HeaderCell>Ações</Table.HeaderCell>
                    </Table.Header>
                    <Table.Body>
                      {produtos.map((produto) => (
                        <Table.Row key={produto.id}>
                          <Table.Cell>{produto.nome}</Table.Cell>
                          <Table.Cell>{produto.qtde}</Table.Cell>
                          <Table.Cell>{produto.un}</Table.Cell>
                          <Table.Cell>{produto.prazo_entrega || '-'}</Table.Cell>
                          <Table.Cell>{formatarValor(produto.ult_valor_aprovado)}</Table.Cell>
                          <Table.Cell>
                            <Button variant="outline" size="sm">
                              <FaEdit />
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum produto adicionado</p>
                  </div>
                )}
                
                {errors.produtos && (
                  <p className="text-sm text-danger-600">{errors.produtos}</p>
                )}
              </div>
            </Card>

            {/* Fornecedores */}
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaTag />
                    Fornecedores ({fornecedores.length})
                  </h2>
                  <Button variant="outline" size="sm">
                    <FaPlus /> Adicionar Fornecedor
                  </Button>
                </div>
                
                {fornecedores.length > 0 ? (
                  <div className="space-y-4">
                    {fornecedores.map((fornecedor) => (
                      <div key={fornecedor.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{fornecedor.nome}</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <FaEdit />
                            </Button>
                            <Button variant="outline" size="sm">
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <span>Prazo: {fornecedor.prazo_pagamento}</span>
                          <span>Frete: {fornecedor.tipo_frete}</span>
                          <span>Valor Frete: {formatarValor(fornecedor.valor_frete)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum fornecedor adicionado</p>
                  </div>
                )}
                
                {errors.fornecedores && (
                  <p className="text-sm text-danger-600">{errors.fornecedores}</p>
                )}
              </div>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                type="button"
              >
                <FaTimes />
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={saving}
              >
                <FaSave />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditarCotacao;
