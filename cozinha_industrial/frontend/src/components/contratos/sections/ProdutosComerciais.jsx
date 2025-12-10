import React, { useMemo, useState, useEffect } from 'react';
import { Button, Input, SearchableSelect } from '../../ui';
import { FaPlus, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Seção de Produtos Comerciais e Valores Unitários
 * Similar à tela de solicitação de compra do foods
 */
const ProdutosComerciais = ({
  produtosComerciais,
  produtosSelecionados,
  buscaProduto,
  loadingProdutos,
  isViewMode,
  saving,
  onBuscaProdutoChange,
  onBuscaProdutoSubmit,
  onAdicionarProduto,
  onRemoverProduto,
  onProdutoChange,
  onValorUnitarioChange
}) => {
  // Filtrar produtos já adicionados (exceto o atual)
  const produtosDisponiveis = useMemo(() => {
    const produtosIdsAdicionados = new Set(
      produtosSelecionados.map(p => p.produto_comercial_id).filter(Boolean)
    );
    
    return produtosComerciais.filter(p => 
      !produtosIdsAdicionados.has(p.id)
    );
  }, [produtosComerciais, produtosSelecionados]);

  // Filtrar produtos adicionados baseado na busca
  const produtosFiltrados = useMemo(() => {
    if (!buscaProduto.trim()) {
      return produtosSelecionados;
    }

    const termoBusca = buscaProduto.toLowerCase().trim();
    return produtosSelecionados.filter(item => {
      const produto = produtosComerciais.find(p => p.id === item.produto_comercial_id);
      if (!produto) return false;
      
      const nomeProduto = (produto.nome_comercial || produto.nome || '').toLowerCase();
      const codigoProduto = (produto.codigo || String(produto.id)).toLowerCase();
      
      return nomeProduto.includes(termoBusca) || codigoProduto.includes(termoBusca);
    });
  }, [produtosSelecionados, produtosComerciais, buscaProduto]);

  // Componente para input de valor unitário formatado como moeda brasileira
  const ValorUnitarioInput = ({ value, onChange, disabled }) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Converter número para string com vírgula (ex: 4.5 -> "4,50")
    const formatForInput = (num) => {
      if (!num || num === 0) return '';
      return num.toFixed(2).replace('.', ',');
    };

    // Converter string com vírgula para número (ex: "4,50" -> 4.5)
    const parseFromInput = (str) => {
      if (!str || str.trim() === '') return 0;
      const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    // Atualizar display quando valor externo mudar (apenas se não estiver focado)
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatForInput(value || 0));
      }
    }, [value, isFocused]);

    const handleChange = (e) => {
      let inputValue = e.target.value;
      
      // Permitir apenas números e uma vírgula
      inputValue = inputValue.replace(/[^\d,]/g, '');
      
      // Garantir apenas uma vírgula
      const commaCount = (inputValue.match(/,/g) || []).length;
      if (commaCount > 1) {
        const firstCommaIndex = inputValue.indexOf(',');
        inputValue = inputValue.substring(0, firstCommaIndex + 1) + inputValue.substring(firstCommaIndex + 1).replace(/,/g, '');
      }
      
      // Limitar a 2 casas decimais após a vírgula
      if (inputValue.includes(',')) {
        const parts = inputValue.split(',');
        if (parts[1] && parts[1].length > 2) {
          inputValue = parts[0] + ',' + parts[1].substring(0, 2);
        }
      }
      
      // Apenas atualizar o display durante a digitação, não o valor externo
      setDisplayValue(inputValue);
    };

    const handleFocus = () => {
      setIsFocused(true);
      // Mostrar valor sem formatação (apenas números e vírgula)
      setDisplayValue(formatForInput(value || 0));
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Garantir formato correto ao perder foco
      const numValue = parseFromInput(displayValue);
      setDisplayValue(formatForInput(numValue));
      onChange(numValue);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="0,00"
          className="w-32 pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 text-right"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Botão para adicionar produto */}
      {!isViewMode && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onAdicionarProduto}
            disabled={saving}
            size="sm"
          >
            <FaPlus className="mr-2" />
            Adicionar Produto
          </Button>
        </div>
      )}

      {/* Campo de Busca */}
      {produtosSelecionados.length > 0 && (
        <div className="border-b border-gray-200 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produto por nome ou código..."
              value={buscaProduto}
              onChange={(e) => onBuscaProdutoChange(e.target.value)}
              className="w-full pl-10 pr-10 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              disabled={isViewMode || saving}
            />
            {buscaProduto && (
              <button
                type="button"
                onClick={() => onBuscaProdutoChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </div>
          {buscaProduto && (
            <p className="mt-2 text-sm text-gray-600">
              {produtosFiltrados.length} produto(s) encontrado(s)
            </p>
          )}
        </div>
      )}

      {/* Lista de produtos adicionados */}
      {produtosSelecionados.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
          <p>Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.</p>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
          <p>Nenhum produto encontrado com o termo "{buscaProduto}".</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto Comercial <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Unitário <span className="text-red-500">*</span>
                  </th>
                  {!isViewMode && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosFiltrados.map((item, index) => {
                  const produto = produtosComerciais.find(p => p.id === item.produto_comercial_id);
                  
                  return (
                    <tr key={`${item.produto_comercial_id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {isViewMode ? (
                          <span className="text-sm text-gray-900">
                            {produto ? `${produto.codigo || ''} - ${produto.nome_comercial || produto.nome || '-'}` : '-'}
                          </span>
                        ) : (
                          <div className="relative z-50">
                            <SearchableSelect
                              value={String(item.produto_comercial_id || '')}
                              onChange={(value) => onProdutoChange(index, parseInt(value))}
                              options={[
                                ...produtosDisponiveis.map(p => ({
                                  value: String(p.id),
                                  label: `${p.codigo || ''} - ${p.nome_comercial || p.nome}`
                                })),
                                // Incluir o produto atual mesmo se já estiver na lista
                                ...(produto ? [{
                                  value: String(produto.id),
                                  label: `${produto.codigo || ''} - ${produto.nome_comercial || produto.nome}`
                                }] : [])
                              ]}
                              placeholder="Selecione um produto..."
                              className="w-full"
                              usePortal={true}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isViewMode ? (
                          <span className="text-sm text-gray-900">
                            {formatCurrency(item.valor_unitario || 0)}
                          </span>
                        ) : (
                          <ValorUnitarioInput
                            value={item.valor_unitario || 0}
                            onChange={(value) => onValorUnitarioChange(index, value)}
                            disabled={saving || !item.produto_comercial_id}
                          />
                        )}
                      </td>
                      {!isViewMode && (
                        <td className="px-4 py-3 text-center">
                          <Button
                            type="button"
                            onClick={() => onRemoverProduto(index)}
                            variant="ghost"
                            size="sm"
                            disabled={saving}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutosComerciais;

