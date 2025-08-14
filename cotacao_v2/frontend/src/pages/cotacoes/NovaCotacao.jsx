import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'xlsx';
import Layout from '../../components/Layout';
import { Button, Input, Card, Modal } from '../../components/ui';
import { 
  FaSave, 
  FaTimes, 
  FaUser, 
  FaMapMarkerAlt, 
  FaShoppingCart,
  FaExclamationTriangle,
  FaFileUpload,
  FaPlus,
  FaTrash,
  FaDownload,
  FaUpload,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const NovaCotacao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    comprador: user.name || '',
    localEntrega: '',
    tipoCompra: 'programada',
    motivoEmergencial: '',
    justificativa: ''
  });

  const [errors, setErrors] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [planilhaCarregada, setPlanilhaCarregada] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

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

  // Função para gerar ID único baseado nos dados do produto
  const gerarIdUnico = (dados) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${dados.nome || 'produto'}_${timestamp}_${random}`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começa a digitar
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

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cotacaoData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Cotação criada com sucesso!');
        navigate('/cotacoes');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao criar cotação');
      }
    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      alert('Erro ao conectar com o servidor');
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
    if (window.confirm('Tem certeza que deseja cancelar? Todos os dados serão perdidos.')) {
      navigate('/cotacoes');
    }
  };

  const handleScrollClick = () => {
    if (isAtBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setShowScrollButton(scrollTop > 300);
      setIsAtBottom(scrollTop + windowHeight >= documentHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Nova Cotação</h1>
            <p className="mt-2 text-gray-600">Preencha os dados para criar uma nova cotação</p>
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
              >
                <FaSave />
                Criar Cotação
              </Button>
            </div>
          </form>
          
          {/* Botão de scroll dinâmico */}
          {showScrollButton && (
            <button
              type="button"
              onClick={handleScrollClick}
              title={isAtBottom ? "Ir para o topo" : "Ir para o final"}
              className="fixed bottom-6 right-6 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 z-50 flex items-center justify-center"
            >
              {isAtBottom ? <FaArrowUp /> : <FaArrowDown />}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NovaCotacao;
