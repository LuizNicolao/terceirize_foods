import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, SearchableSelect } from '../ui';
import api from '../../services/api';

const NotaFiscalItemModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  item,
  numeroItem
}) => {
  const [produtos, setProdutos] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [formData, setFormData] = useState({
    produto_id: '',
    codigo_produto: '',
    descricao: '',
    ncm: '',
    cfop: '',
    unidade_comercial: '',
    quantidade: '',
    valor_unitario: '',
    valor_desconto: '0.00',
    valor_frete: '0.00',
    valor_seguro: '0.00',
    valor_outras_despesas: '0.00',
    valor_ipi: '0.00',
    aliquota_ipi: '0.00',
    valor_icms: '0.00',
    aliquota_icms: '0.00',
    valor_icms_st: '0.00',
    aliquota_icms_st: '0.00',
    valor_pis: '0.00',
    aliquota_pis: '0.00',
    valor_cofins: '0.00',
    aliquota_cofins: '0.00',
    informacoes_adicionais: ''
  });

  // Carregar produtos
  useEffect(() => {
    const carregarProdutos = async () => {
      if (isOpen) {
        setCarregandoProdutos(true);
        try {
          const response = await api.get('/produtos?limit=1000&status=1');
          const produtosData = response.data?.data?.items || response.data?.data || [];
          setProdutos(produtosData);
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
        } finally {
          setCarregandoProdutos(false);
        }
      }
    };

    carregarProdutos();
  }, [isOpen]);

  // Preencher formulário quando item for fornecido (edição)
  useEffect(() => {
    if (item) {
      setFormData({
        produto_id: item.produto_id || '',
        codigo_produto: item.codigo_produto || '',
        descricao: item.descricao || '',
        ncm: item.ncm || '',
        cfop: item.cfop || '',
        unidade_comercial: item.unidade_comercial || '',
        quantidade: item.quantidade || '',
        valor_unitario: item.valor_unitario || '',
        valor_desconto: item.valor_desconto || '0.00',
        valor_frete: item.valor_frete || '0.00',
        valor_seguro: item.valor_seguro || '0.00',
        valor_outras_despesas: item.valor_outras_despesas || '0.00',
        valor_ipi: item.valor_ipi || '0.00',
        aliquota_ipi: item.aliquota_ipi || '0.00',
        valor_icms: item.valor_icms || '0.00',
        aliquota_icms: item.aliquota_icms || '0.00',
        valor_icms_st: item.valor_icms_st || '0.00',
        aliquota_icms_st: item.aliquota_icms_st || '0.00',
        valor_pis: item.valor_pis || '0.00',
        aliquota_pis: item.aliquota_pis || '0.00',
        valor_cofins: item.valor_cofins || '0.00',
        aliquota_cofins: item.aliquota_cofins || '0.00',
        informacoes_adicionais: item.informacoes_adicionais || ''
      });
    } else {
      // Limpar formulário para novo item
      setFormData({
        produto_id: '',
        codigo_produto: '',
        descricao: '',
        ncm: '',
        cfop: '',
        unidade_comercial: '',
        quantidade: '',
        valor_unitario: '',
        valor_desconto: '0.00',
        valor_frete: '0.00',
        valor_seguro: '0.00',
        valor_outras_despesas: '0.00',
        valor_ipi: '0.00',
        aliquota_ipi: '0.00',
        valor_icms: '0.00',
        aliquota_icms: '0.00',
        valor_icms_st: '0.00',
        aliquota_icms_st: '0.00',
        valor_pis: '0.00',
        aliquota_pis: '0.00',
        valor_cofins: '0.00',
        aliquota_cofins: '0.00',
        informacoes_adicionais: ''
      });
    }
  }, [item, isOpen]);

  // Preencher dados quando produto for selecionado
  const handleProdutoChange = (produtoId) => {
    const produto = produtos.find(p => String(p.id) === String(produtoId));
    if (produto) {
      setFormData(prev => ({
        ...prev,
        produto_id: produto.id,
        codigo_produto: produto.codigo_produto || '',
        descricao: produto.nome || prev.descricao,
        ncm: produto.ncm || prev.ncm,
        cfop: produto.cfop || prev.cfop,
        unidade_comercial: produto.unidade_id ? produto.unidade_nome : prev.unidade_comercial
      }));
    }
  };

  // Calcular valor total do item
  const calcularValorTotal = () => {
    const quantidade = parseFloat(formData.quantidade) || 0;
    const valorUnitario = parseFloat(formData.valor_unitario) || 0;
    const desconto = parseFloat(formData.valor_desconto) || 0;
    return (quantidade * valorUnitario) - desconto;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.codigo_produto || !formData.descricao || !formData.quantidade || !formData.valor_unitario) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const itemData = {
      ...formData,
      quantidade: parseFloat(formData.quantidade),
      valor_unitario: parseFloat(formData.valor_unitario),
      valor_desconto: parseFloat(formData.valor_desconto) || 0,
      valor_frete: parseFloat(formData.valor_frete) || 0,
      valor_seguro: parseFloat(formData.valor_seguro) || 0,
      valor_outras_despesas: parseFloat(formData.valor_outras_despesas) || 0,
      valor_ipi: parseFloat(formData.valor_ipi) || 0,
      aliquota_ipi: parseFloat(formData.aliquota_ipi) || 0,
      valor_icms: parseFloat(formData.valor_icms) || 0,
      aliquota_icms: parseFloat(formData.aliquota_icms) || 0,
      valor_icms_st: parseFloat(formData.valor_icms_st) || 0,
      aliquota_icms_st: parseFloat(formData.aliquota_icms_st) || 0,
      valor_pis: parseFloat(formData.valor_pis) || 0,
      aliquota_pis: parseFloat(formData.aliquota_pis) || 0,
      valor_cofins: parseFloat(formData.valor_cofins) || 0,
      aliquota_cofins: parseFloat(formData.aliquota_cofins) || 0,
      valor_total: calcularValorTotal()
    };

    onSubmit(itemData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? `Editar Item ${numeroItem}` : `Adicionar Item ${numeroItem}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seleção de Produto */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <SearchableSelect
            label="Produto (Opcional)"
            value={formData.produto_id}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, produto_id: value }));
              handleProdutoChange(value);
            }}
            options={produtos.map(produto => ({
              value: String(produto.id),
              label: `${produto.codigo_produto || ''} - ${produto.nome}`,
              description: produto.grupo_nome || ''
            }))}
            placeholder={carregandoProdutos ? 'Carregando produtos...' : 'Buscar produto...'}
            loading={carregandoProdutos}
          />
          <p className="text-xs text-gray-600 mt-2">
            Selecione um produto cadastrado ou preencha manualmente os dados abaixo
          </p>
        </div>

        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código do Produto *"
            name="codigo_produto"
            value={formData.codigo_produto}
            onChange={(e) => setFormData(prev => ({ ...prev, codigo_produto: e.target.value }))}
            required
          />
          <Input
            label="Unidade Comercial"
            name="unidade_comercial"
            value={formData.unidade_comercial}
            onChange={(e) => setFormData(prev => ({ ...prev, unidade_comercial: e.target.value }))}
            placeholder="Ex: UN, KG, PCT"
          />
        </div>

        <Input
          label="Descrição *"
          name="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="NCM"
            name="ncm"
            value={formData.ncm}
            onChange={(e) => setFormData(prev => ({ ...prev, ncm: e.target.value }))}
          />
          <Input
            label="CFOP"
            name="cfop"
            value={formData.cfop}
            onChange={(e) => setFormData(prev => ({ ...prev, cfop: e.target.value }))}
          />
        </div>

        {/* Quantidades e Valores */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quantidades e Valores</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Quantidade *"
              name="quantidade"
              type="number"
              step="0.0001"
              value={formData.quantidade}
              onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
              required
            />
            <Input
              label="Valor Unitário *"
              name="valor_unitario"
              type="number"
              step="0.0001"
              value={formData.valor_unitario}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_unitario: e.target.value }))}
              required
            />
            <Input
              label="Valor Desconto"
              name="valor_desconto"
              type="number"
              step="0.01"
              value={formData.valor_desconto}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_desconto: e.target.value }))}
            />
          </div>
          <div className="mt-3 p-3 bg-white rounded border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Valor Total do Item:</span>
              <span className="text-lg font-bold text-green-600">
                R$ {calcularValorTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>

        {/* Impostos (Opcional) */}
        <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
            Impostos (Opcional)
          </summary>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Alíquota IPI (%)"
                  name="aliquota_ipi"
                  type="number"
                  step="0.01"
                  value={formData.aliquota_ipi}
                  onChange={(e) => setFormData(prev => ({ ...prev, aliquota_ipi: e.target.value }))}
                />
                <Input
                  label="Valor IPI"
                  name="valor_ipi"
                  type="number"
                  step="0.01"
                  value={formData.valor_ipi}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_ipi: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  label="Alíquota ICMS (%)"
                  name="aliquota_icms"
                  type="number"
                  step="0.01"
                  value={formData.aliquota_icms}
                  onChange={(e) => setFormData(prev => ({ ...prev, aliquota_icms: e.target.value }))}
                />
                <Input
                  label="Valor ICMS"
                  name="valor_icms"
                  type="number"
                  step="0.01"
                  value={formData.valor_icms}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_icms: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Alíquota ICMS ST (%)"
                  name="aliquota_icms_st"
                  type="number"
                  step="0.01"
                  value={formData.aliquota_icms_st}
                  onChange={(e) => setFormData(prev => ({ ...prev, aliquota_icms_st: e.target.value }))}
                />
                <Input
                  label="Valor ICMS ST"
                  name="valor_icms_st"
                  type="number"
                  step="0.01"
                  value={formData.valor_icms_st}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_icms_st: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  label="Alíquota PIS (%)"
                  name="aliquota_pis"
                  type="number"
                  step="0.01"
                  value={formData.aliquota_pis}
                  onChange={(e) => setFormData(prev => ({ ...prev, aliquota_pis: e.target.value }))}
                />
                <Input
                  label="Valor PIS"
                  name="valor_pis"
                  type="number"
                  step="0.01"
                  value={formData.valor_pis}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_pis: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Input
                label="Alíquota COFINS (%)"
                name="aliquota_cofins"
                type="number"
                step="0.01"
                value={formData.aliquota_cofins}
                onChange={(e) => setFormData(prev => ({ ...prev, aliquota_cofins: e.target.value }))}
              />
              <Input
                label="Valor COFINS"
                name="valor_cofins"
                type="number"
                step="0.01"
                value={formData.valor_cofins}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_cofins: e.target.value }))}
              />
            </div>
          </div>
        </details>

        {/* Informações Adicionais */}
        <Input
          label="Informações Adicionais"
          name="informacoes_adicionais"
          type="textarea"
          value={formData.informacoes_adicionais}
          onChange={(e) => setFormData(prev => ({ ...prev, informacoes_adicionais: e.target.value }))}
          rows={3}
        />

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="lg">
            {item ? 'Atualizar Item' : 'Adicionar Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NotaFiscalItemModal;

