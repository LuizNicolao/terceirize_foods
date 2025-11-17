import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, SearchableSelect } from '../ui';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useProdutosOrigem } from '../../hooks/useProdutosOrigem';

const RecebimentoModal = ({ 
  isOpen, 
  onClose, 
  recebimento = null,
  onSave,
  escolas = [],
  loading = false,
  isViewMode = false
}) => {
  const [formData, setFormData] = useState({
    escola_id: '',
    data_recebimento: new Date().toISOString().split('T')[0],
    tipo_recebimento: 'Completo',
    tipo_entrega: 'HORTI',
    pendencia_anterior: 'Não',
    precisa_reentrega: 'Não',
    observacoes: '',
    produtos: []
  });
  
  // Hook para produtos origem
  const { 
    produtos, 
    grupos, 
    loading: produtosLoading, 
    carregarProdutosPorGrupo 
  } = useProdutosOrigem();


  const tiposEntrega = [
    { value: 'HORTI', label: 'HORTI' },
    { value: 'PAO', label: 'PADARIA E CONFEITARIA' },
    { value: 'PERECIVEL', label: 'FRIOS' },
    { value: 'BASE SECA', label: 'SECOS' },
    { value: 'LIMPEZA', label: 'USO E CONSUMO' }
  ];


  // Carregar produtos quando tipo de entrega mudar
  useEffect(() => {
    if (formData.tipo_entrega && grupos.length > 0) {
      // Mapear tipos de entrega para nomes de grupos
      const mapeamentoGrupos = {
        'HORTI': 'HORTI',
        'PAO': 'PADARIA', 
        'PERECIVEL': 'FRIOS',
        'BASE SECA': 'SECOS',
        'LIMPEZA': 'USO E CONSUMO'
      };
      
      const nomeGrupo = mapeamentoGrupos[formData.tipo_entrega];
      
      if (nomeGrupo) {
        // Buscar grupo pelo nome (case insensitive e parcial)
        const grupo = grupos.find(g => 
          g.nome && g.nome.toUpperCase().includes(nomeGrupo.toUpperCase())
        );
        
        if (grupo) {
          carregarProdutosPorGrupo(grupo.id);
        }
      }
    }
  }, [formData.tipo_entrega, grupos, carregarProdutosPorGrupo]);

  // Limpar dados quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        escola_id: '',
        data_recebimento: new Date().toISOString().split('T')[0],
        tipo_recebimento: 'Completo',
        tipo_entrega: 'HORTI',
        pendencia_anterior: 'Não',
        precisa_reentrega: 'Não',
        observacoes: '',
        produtos: []
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (recebimento) {
      // Formatar data para o input type="date" (YYYY-MM-DD)
      let dataFormatada = new Date().toISOString().split('T')[0]; // padrão
      
      if (recebimento.data_recebimento) {
        try {
          // Se a data contém 'T' (formato ISO), extrair apenas a parte da data
          if (recebimento.data_recebimento.includes('T')) {
            dataFormatada = recebimento.data_recebimento.split('T')[0];
          } else if (recebimento.data_recebimento.includes('/')) {
            // Se está no formato DD/MM/YYYY, converter para YYYY-MM-DD
            const [dia, mes, ano] = recebimento.data_recebimento.split('/');
            dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
          } else {
            // Assumir que já está no formato YYYY-MM-DD
            dataFormatada = recebimento.data_recebimento;
          }
        } catch (error) {
          console.error('Erro ao formatar data:', error);
          dataFormatada = new Date().toISOString().split('T')[0];
        }
      }

      setFormData({
        escola_id: recebimento.escola_id || '',
        data_recebimento: dataFormatada,
        tipo_recebimento: recebimento.tipo_recebimento || 'Completo',
        tipo_entrega: recebimento.tipo_entrega || 'HORTI',
        pendencia_anterior: recebimento.pendencia_anterior || 'Não',
        precisa_reentrega: recebimento.precisa_reentrega || 'Não',
        observacoes: recebimento.observacoes || '',
        produtos: recebimento.produtos || []
      });
    }
  }, [recebimento, escolas]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelecionarProduto = (produto) => {
    // Verificar se o produto já foi adicionado
    const jaExiste = formData.produtos.some(p => p.produto_id === produto.id);
    if (!jaExiste) {
      setFormData(prev => ({
        ...prev,
        produtos: [...prev.produtos, {
          produto_id: produto.id,
          nome_produto: produto.nome,
          unidade_medida: produto.unidade_medida_nome || produto.unidade_medida,
          quantidade: 0,
          precisa_reentrega: 'Não'
        }]
      }));
    }
  };


  const handleQuantidadeChange = (index, quantidade) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.map((produto, i) => 
        i === index ? { ...produto, quantidade: parseFloat(quantidade) || 0 } : produto
      )
    }));
  };

  const handleRemoverProduto = (index) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };

  const handleReentregaChange = (index, precisa_reentrega) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.map((produto, i) => 
        i === index ? { ...produto, precisa_reentrega } : produto
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.escola_id || !formData.data_recebimento) {
      alert('Por favor, selecione uma escola e uma data');
      return;
    }

    // Se for recebimento parcial, validar produtos
    if (formData.tipo_recebimento === 'Parcial') {
      if (formData.produtos.length === 0) {
        alert('Para recebimento parcial, é necessário adicionar pelo menos um produto');
        return;
      }

      const produtosComQuantidade = formData.produtos.filter(p => p.quantidade > 0);
      if (produtosComQuantidade.length === 0) {
        alert('É necessário informar a quantidade para pelo menos um produto');
        return;
      }
    }

    await onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewMode 
          ? 'Visualizar Recebimento' 
          : recebimento 
            ? 'Editar Recebimento' 
            : 'Novo Recebimento'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Escola */}
        <SearchableSelect
          label="Escola"
          value={formData.escola_id}
          onChange={(value) => handleInputChange('escola_id', value)}
          options={escolas.map(escola => ({
            value: escola.id,
            label: `${escola.nome_escola} - ${escola.rota}`,
            description: escola.cidade
          }))}
          placeholder="Digite para buscar uma escola..."
          disabled={isViewMode}
          required
          usePortal={false}
          filterBy={(option, searchTerm) => {
            const label = option.label.toLowerCase();
            const description = option.description?.toLowerCase() || '';
            const term = searchTerm.toLowerCase();
            return label.includes(term) || description.includes(term);
          }}
          renderOption={(option) => (
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <span className="text-xs text-gray-500 mt-1">{option.description}</span>
              )}
            </div>
          )}
        />

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data do Recebimento *
          </label>
          <input
            type="date"
            value={formData.data_recebimento}
            onChange={(e) => handleInputChange('data_recebimento', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={isViewMode}
            required
          />
        </div>

        {/* Tipo do Recebimento */}
        <Input
          label="Tipo do Recebimento"
          type="select"
          value={formData.tipo_recebimento}
          onChange={(e) => handleInputChange('tipo_recebimento', e.target.value)}
          disabled={isViewMode}
          required
        >
          <option value="Completo">Completo</option>
          <option value="Parcial">Parcial</option>
        </Input>

        {/* Tipo da Entrega */}
        <Input
          label="Tipo da Entrega"
          type="select"
          value={formData.tipo_entrega}
          onChange={(e) => handleInputChange('tipo_entrega', e.target.value)}
          disabled={isViewMode}
          required
        >
          {tiposEntrega.map(tipo => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </Input>

        {/* Pendência Anterior */}
        <Input
          label="Foi Entregue Pendência do Abastecimento anterior?"
          type="select"
          value={formData.pendencia_anterior}
          onChange={(e) => handleInputChange('pendencia_anterior', e.target.value)}
          disabled={isViewMode}
          required
        >
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </Input>

        {/* Produtos (apenas para recebimento parcial) */}
        {formData.tipo_recebimento === 'Parcial' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Produtos</h3>
            
            {/* Adicionar Produto */}
            {!isViewMode && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchableSelect
                    label="Adicionar Produto"
                    value=""
                    onChange={(value) => {
                      if (value) {
                        const produto = produtos.find(p => p.id === parseInt(value));
                        if (produto) {
                          handleSelecionarProduto(produto);
                        }
                      }
                    }}
                    options={produtos.map(produto => ({
                      value: produto.id,
                      label: `${produto.nome}${produto.unidade_medida_nome ? ` (${produto.unidade_medida_nome})` : ''}`,
                      description: produto.grupo_nome ? `Grupo: ${produto.grupo_nome}` : ''
                    }))}
                    placeholder="Digite para buscar um produto..."
                    usePortal={false}
                    filterBy={(option, searchTerm) => {
                      return option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()));
                    }}
                  />
                </div>
              </div>
            )}

            {/* Lista de Produtos */}
            {formData.produtos.length > 0 && (
              <div className="space-y-2">
                {formData.produtos.map((produto, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{produto.produto_nome || produto.nome_produto}</div>
                      <div className="text-xs text-gray-500">{produto.produto_unidade_medida || produto.unidade_medida}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700">Qtd:</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={produto.quantidade}
                        onChange={(e) => handleQuantidadeChange(index, e.target.value)}
                        className={`w-20 px-2 py-1 border border-gray-300 rounded text-sm ${
                          isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        disabled={isViewMode}
                      />
                      <label className="text-sm text-gray-700">Reentrega:</label>
                      <select
                        value={produto.precisa_reentrega || 'Não'}
                        onChange={(e) => handleReentregaChange(index, e.target.value)}
                        className={`w-16 px-2 py-1 border border-gray-300 rounded text-sm ${
                          isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        disabled={isViewMode}
                      >
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoverProduto(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={isViewMode}
            rows={3}
            placeholder="Observações adicionais..."
          />
        </div>

        {/* Botões */}
        {!isViewMode && (
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (recebimento ? 'Atualizar' : 'Salvar')}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default RecebimentoModal;
