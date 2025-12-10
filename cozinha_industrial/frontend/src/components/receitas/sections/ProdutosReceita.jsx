import React from 'react';
import { FaPlus, FaTrash, FaList } from 'react-icons/fa';
import { Button, Input, SearchableSelect } from '../../ui';

/**
 * Seção de Produtos da Receita
 */
const ProdutosReceita = ({
  formData,
  produtoForm,
  isViewMode,
  grupos,
  produtosOrigem,
  loadingGrupos,
  loadingProdutosOrigem,
  onProdutoFormChange,
  onAddProduto,
  onRemoveProduto,
  onUpdateProdutoPercapta,
  onCarregarProdutosOrigem,
  errors = {}
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-green-500">
        <h3 className="text-sm font-semibold text-gray-700">
          Produtos que compõem a receita
        </h3>
        {formData.produtos.length > 0 && (
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-300">
            {formData.produtos.length} {formData.produtos.length === 1 ? 'produto' : 'produtos'}
          </span>
        )}
      </div>

      {/* Formulário para adicionar produto */}
      {!isViewMode && (
        <div className="mb-4 p-3 bg-white rounded-md border border-gray-200">
          {/* Filtro de Grupo */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Grupo
            </label>
            <select
              value={produtoForm.grupo_id || ''}
              onChange={(e) => {
                const grupoId = e.target.value ? parseInt(e.target.value) : null;
                onProdutoFormChange('grupo_id', grupoId);
                // Limpar produto selecionado quando mudar o grupo
                onProdutoFormChange('produto_origem_id', null);
                // Recarregar produtos filtrados pelo grupo
                onCarregarProdutosOrigem(grupoId);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loadingGrupos}
            >
              <option value="">Todos os grupos</option>
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-7">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto Origem
              </label>
              <SearchableSelect
                value={produtoForm.produto_origem_id ? produtosOrigem.find(p => p.id === produtoForm.produto_origem_id)?.nome || '' : ''}
                onChange={(value) => {
                  const produtoSelecionado = produtosOrigem.find(p => p.nome === value);
                  onProdutoFormChange('produto_origem_id', produtoSelecionado ? produtoSelecionado.id : null);
                  // Limpar erro ao selecionar
                  if (errors.produto_origem) {
                    // O erro será limpo no componente pai
                  }
                }}
                options={produtosOrigem
                  .filter(produto => {
                    return !formData.produtos.some(p => p.produto_origem_id === produto.id);
                  })
                  .map(produto => {
                    const descParts = [];
                    if (produto.grupo_nome) {
                      descParts.push(`Grupo: ${produto.grupo_nome}`);
                    }
                    if (produto.unidade_medida_sigla) {
                      descParts.push(`Unidade: ${produto.unidade_medida_sigla}`);
                    }
                    return {
                      value: produto.nome || '',
                      label: `${produto.nome || ''}${produto.codigo ? ` (${produto.codigo})` : ''}`,
                      description: descParts.length > 0 ? descParts.join(' | ') : ''
                    };
                  })}
                placeholder="Selecione um produto origem..."
                loading={loadingProdutosOrigem}
                filterBy={(option, searchTerm) => {
                  const label = option.label?.toLowerCase() || '';
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
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Percapta
              </label>
              <Input
                type="number"
                step="0.000001"
                min="0"
                max="999.999999"
                value={produtoForm.percapta_sugerida}
                onChange={(e) => {
                  let valor = e.target.value;
                  // Validar e limitar a 4 casas decimais durante a digitação
                  if (valor === '' || valor === '0') {
                    onProdutoFormChange('percapta_sugerida', valor);
                    return;
                  }
                  
                  // Verificar se é um número válido
                  if (!isNaN(parseFloat(valor)) && parseFloat(valor) >= 0) {
                    // Limitar valor máximo (999.999999)
                    const valorNumerico = parseFloat(valor);
                    if (valorNumerico > 999.999999) {
                      onProdutoFormChange('percapta_sugerida', '999.999999');
                      return;
                    }
                    
                    // Limitar a 6 casas decimais
                    if (valor.includes('.')) {
                      const partes = valor.split('.');
                      // Limitar parte inteira a 3 dígitos (999)
                      if (partes[0].length > 3) {
                        partes[0] = partes[0].substring(0, 3);
                      }
                      // Limitar parte decimal a 6 dígitos
                      if (partes[1] && partes[1].length > 6) {
                        partes[1] = partes[1].substring(0, 6);
                      }
                      valor = `${partes[0]}.${partes[1] || ''}`;
                    } else {
                      // Limitar parte inteira a 3 dígitos (999)
                      if (valor.length > 3) {
                        valor = valor.substring(0, 3);
                      }
                    }
                    
                    // Também verificar vírgula (formato brasileiro)
                    if (valor.includes(',')) {
                      const partes = valor.split(',');
                      if (partes[1] && partes[1].length > 6) {
                        valor = `${partes[0]}.${partes[1].substring(0, 6)}`;
                      } else {
                        valor = valor.replace(',', '.');
                      }
                    }
                    
                    // Verificar novamente o valor máximo após limitação
                    const valorFinal = parseFloat(valor);
                    if (!isNaN(valorFinal) && valorFinal <= 999.999999) {
                      onProdutoFormChange('percapta_sugerida', valor);
                    }
                  }
                }}
                placeholder="Percapta"
                className="w-full"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button
                type="button"
                onClick={onAddProduto}
                variant="primary"
                size="sm"
                className="w-full"
                disabled={!produtoForm.produto_origem_id}
              >
                <FaPlus className="mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
          {errors.produtos && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.produtos}</p>
            </div>
          )}
        </div>
      )}

      {/* Lista de produtos */}
      {formData.produtos.length > 0 ? (
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Produto Origem
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Unidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Percapta Sugerida <span className="text-red-500">*</span>
                </th>
                {!isViewMode && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.produtos.map((produto, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {produto.produto_origem}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {produto.unidade_medida_sigla || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {isViewMode ? (
                      produto.percapta_sugerida 
                        ? `${Number(produto.percapta_sugerida).toFixed(6).replace('.', ',')}` 
                        : '-'
                    ) : (
                      <div>
                        <input
                          type="number"
                          step="0.000001"
                          min="0"
                          max="999.9999"
                          value={produto.percapta_sugerida !== null && produto.percapta_sugerida !== undefined 
                            ? (typeof produto.percapta_sugerida === 'number' 
                                ? parseFloat(produto.percapta_sugerida.toFixed(6)) 
                                : parseFloat(parseFloat(produto.percapta_sugerida).toFixed(6))
                              )
                            : ''}
                          onChange={(e) => {
                            const valor = e.target.value;
                            // Validar e limitar a 4 casas decimais durante a digitação
                            if (valor === '' || valor === '0') {
                              onUpdateProdutoPercapta(index, valor);
                              return;
                            }
                            
                            // Verificar se é um número válido
                            if (!isNaN(parseFloat(valor)) && parseFloat(valor) >= 0) {
                              // Limitar valor máximo (999.999999)
                              const valorNumerico = parseFloat(valor);
                              if (valorNumerico > 999.999999) {
                                onUpdateProdutoPercapta(index, '999.999999');
                                return;
                              }
                              
                              // Limitar a 6 casas decimais e parte inteira a 3 dígitos
                              let valorLimitado = valor;
                              if (valorLimitado.includes('.')) {
                                const partes = valorLimitado.split('.');
                                // Limitar parte inteira a 3 dígitos (999)
                                if (partes[0].length > 3) {
                                  partes[0] = partes[0].substring(0, 3);
                                }
                                // Limitar parte decimal a 6 dígitos
                                if (partes[1] && partes[1].length > 6) {
                                  partes[1] = partes[1].substring(0, 6);
                                }
                                valorLimitado = `${partes[0]}.${partes[1] || ''}`;
                              } else {
                                // Limitar parte inteira a 3 dígitos (999)
                                if (valorLimitado.length > 3) {
                                  valorLimitado = valorLimitado.substring(0, 3);
                                }
                              }
                              
                              // Verificar novamente o valor máximo após limitação
                              const valorFinal = parseFloat(valorLimitado);
                              if (!isNaN(valorFinal) && valorFinal <= 999.999999) {
                                onUpdateProdutoPercapta(index, valorLimitado);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Garantir que tenha no máximo 4 casas decimais ao perder o foco
                            const valor = e.target.value;
                            if (valor && valor !== '0' && valor.includes('.')) {
                              const partes = valor.split('.');
                              if (partes[1] && partes[1].length > 4) {
                                const novoValor = `${partes[0]}.${partes[1].substring(0, 4)}`;
                                onUpdateProdutoPercapta(index, novoValor);
                              }
                            }
                          }}
                          className={`w-24 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            errors.produtos && (!produto.percapta_sugerida || produto.percapta_sugerida === '' || produto.percapta_sugerida === null)
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          placeholder="0"
                          required
                        />
                      </div>
                    )}
                  </td>
                  {!isViewMode && (
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveProduto(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
                        title="Remover produto"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-white rounded-md border border-gray-200 border-dashed">
          <FaList className="mx-auto text-3xl mb-2 text-gray-300" />
          <p className="text-sm">
            {isViewMode ? 'Nenhum produto adicionado a esta receita' : 'Nenhum produto adicionado. Use o formulário acima para adicionar produtos.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProdutosReceita;

