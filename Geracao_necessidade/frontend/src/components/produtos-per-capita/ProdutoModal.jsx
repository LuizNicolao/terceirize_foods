import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { SearchableSelect } from '../ui';

const ProdutoModal = ({ 
  isOpen, 
  onClose, 
  produto = null,
  onSave,
  loading = false,
  isViewMode = false,
  produtosDisponiveis = []
}) => {
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [perCapitas, setPerCapitas] = useState({
    per_capita_lanche_manha: '',
    per_capita_almoco: '',
    per_capita_lanche_tarde: '',
    per_capita_parcial: '',
    per_capita_eja: ''
  });
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (produto) {
      setProdutoSelecionado(produto.produto_id ? produto.produto_id.toString() : '');
      setPerCapitas({
        per_capita_lanche_manha: parseFloat(produto.per_capita_lanche_manha) || '',
        per_capita_almoco: parseFloat(produto.per_capita_almoco) || '',
        per_capita_lanche_tarde: parseFloat(produto.per_capita_lanche_tarde) || '',
        per_capita_parcial: parseFloat(produto.per_capita_parcial) || '',
        per_capita_eja: parseFloat(produto.per_capita_eja) || ''
      });
      setAtivo(produto.ativo !== undefined ? Boolean(produto.ativo) : true);
    } else {
      setProdutoSelecionado('');
      setPerCapitas({
        per_capita_lanche_manha: '',
        per_capita_almoco: '',
        per_capita_lanche_tarde: '',
        per_capita_parcial: '',
        per_capita_eja: ''
      });
      setAtivo(true);
    }
  }, [produto, isOpen, produtosDisponiveis]);

  const handlePerCapitasChange = (periodo, value) => {
    const fieldName = `per_capita_${periodo}`;
    // Se o valor estiver vazio, manter vazio
    if (value === '' || value === null || value === undefined) {
      setPerCapitas(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    } else {
      setPerCapitas(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  };

  const handleProdutoChange = (value) => {
    setProdutoSelecionado(value);
  };

  const handleSave = async () => {
    // Validações básicas
    if (!produtoSelecionado) {
      alert('Por favor, selecione um produto');
      return;
    }

    // Verificar se pelo menos um per capita foi definido (apenas se estiver ativo)
    if (ativo) {
      const temPerCapita = Object.values(perCapitas).some(valor => valor > 0 && valor !== '');
      if (!temPerCapita) {
        alert('Por favor, defina pelo menos um valor de per capita ou marque como inativo');
        return;
      }
    }

    const produtoData = {
      produto_id: parseInt(produtoSelecionado),
      ...perCapitas,
      ativo: ativo ? 1 : 0
    };

    await onSave(produtoData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={produto ? (isViewMode ? 'Visualizar Produto Per Capita' : 'Editar Produto Per Capita') : 'Novo Produto Per Capita'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Seleção de Produto */}
        <SearchableSelect
          label="Produto"
          value={produtoSelecionado}
          onChange={handleProdutoChange}
          options={produtosDisponiveis.map(produto => ({
            value: produto.id.toString(),
            label: `${produto.nome}${produto.unidade_medida ? ` (${produto.unidade_medida})` : ''}`,
            description: produto.grupo ? `Grupo: ${produto.grupo}` : ''
          }))}
          placeholder="Digite para buscar um produto..."
          disabled={isViewMode}
          required
          loading={loading}
          filterBy={(option, searchTerm) => {
            return option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()));
          }}
        />

        {/* Per Capitas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌅 Per Capita Lanche da Manhã
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={perCapitas.per_capita_lanche_manha}
              onChange={(e) => handlePerCapitasChange('lanche_manha', e.target.value)}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🍽️ Per Capita Almoço
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={perCapitas.per_capita_almoco}
              onChange={(e) => handlePerCapitasChange('almoco', e.target.value)}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌆 Per Capita Lanche da Tarde
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={perCapitas.per_capita_lanche_tarde}
              onChange={(e) => handlePerCapitasChange('lanche_tarde', e.target.value)}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🥗 Per Capita Parcial
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={perCapitas.per_capita_parcial}
              onChange={(e) => handlePerCapitasChange('parcial', e.target.value)}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌙 Per Capita EJA
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={perCapitas.per_capita_eja}
              onChange={(e) => handlePerCapitasChange('eja', e.target.value)}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Status - apenas para edição */}
        {!isViewMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="ativo"
                  checked={ativo}
                  onChange={() => setAtivo(true)}
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Ativo</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="inativo"
                  checked={!ativo}
                  onChange={() => setAtivo(false)}
                  className="mr-2 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Inativo</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {ativo ? 'Produto ativo e visível na lista' : 'Produto inativo e oculto da lista'}
            </p>
          </div>
        )}

        {/* Status - apenas para visualização */}
        {isViewMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={loading}
          >
            Cancelar
          </Button>
          {!isViewMode && (
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProdutoModal;