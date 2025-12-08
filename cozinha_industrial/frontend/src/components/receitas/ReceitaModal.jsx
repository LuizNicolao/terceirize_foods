import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaList } from 'react-icons/fa';
import { Modal, Button, Input, SearchableSelect } from '../ui';
import FoodsApiService from '../../services/FoodsApiService';

/**
 * Modal para Receita
 */
const ReceitaModal = ({
  isOpen,
  onClose,
  onSubmit,
  receita,
  isViewMode = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    filial_id: null,
    filial_nome: '',
    centro_custo_id: null,
    centro_custo_nome: '',
    tipo_receita: '',
    produtos: []
  });

  const [produtoForm, setProdutoForm] = useState({
    produto_origem_id: null,
    percapta_sugerida: ''
  });

  const [errors, setErrors] = useState({});
  
  // Estados para dados do Foods
  const [filiais, setFiliais] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [produtosOrigem, setProdutosOrigem] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingCentrosCusto, setLoadingCentrosCusto] = useState(false);
  const [loadingProdutosOrigem, setLoadingProdutosOrigem] = useState(false);

  // Carregar filiais, centros de custo e produtos origem quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarFiliais();
      carregarCentrosCusto();
      carregarProdutosOrigem();
    }
  }, [isOpen]);

  const carregarFiliais = async () => {
    setLoadingFiliais(true);
    try {
      // Buscar todas as filiais (múltiplas páginas se necessário)
      let allFiliaisData = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getFiliais({
          page,
          limit
        });
        
        if (result.success && result.data) {
          // Verificar se é uma resposta HATEOAS ou direta
          let items = [];
          if (result.data.items) {
            items = result.data.items;
          } else if (Array.isArray(result.data)) {
            items = result.data;
          } else if (result.data.data) {
            items = result.data.data;
          }
          
          allFiliaisData = [...allFiliaisData, ...items];
          
          // Verificar se há mais páginas
          if (items.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }
      
      // Filtrar apenas a filial "CD TOLEDO"
      // O campo que contém o nome da filial é 'filial'
      allFiliaisData = allFiliaisData.filter(filial => {
        if (filial.filial) {
          const filialNome = filial.filial.toLowerCase().trim();
          // Verificar se contém "cd toledo" ou apenas "toledo"
          return filialNome.includes('cd toledo') || 
                 filialNome === 'toledo' ||
                 filialNome.includes('toledo');
        }
        // Se não tiver informação de filial, não incluir
        return false;
      });
      
      setFiliais(allFiliaisData);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  };

  const carregarCentrosCusto = async () => {
    setLoadingCentrosCusto(true);
    try {
      // Buscar todos os centros de custo (múltiplas páginas se necessário)
      let allCentrosCusto = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getCentrosCusto({
          page,
          limit: 100
        });
        
        if (result.success && result.data && result.data.length > 0) {
          allCentrosCusto = [...allCentrosCusto, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      // Aplicar filtro para "CD TOLEDO"
      allCentrosCusto = allCentrosCusto.filter(centroCusto => 
        centroCusto.filial_nome && 
        (centroCusto.filial_nome.toLowerCase().includes('cd toledo') || 
        centroCusto.filial_nome.toLowerCase().includes('toledo'))
      );
      
      setCentrosCusto(allCentrosCusto);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
    } finally {
      setLoadingCentrosCusto(false);
    }
  };

  const carregarProdutosOrigem = async () => {
    setLoadingProdutosOrigem(true);
    try {
      // Buscar todos os produtos origem (múltiplas páginas se necessário)
      let allProdutos = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getProdutosOrigem({
          page,
          limit: 100,
          status: 1 // Apenas ativos
        });
        
        if (result.success && result.data && result.data.length > 0) {
          allProdutos = [...allProdutos, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setProdutosOrigem(allProdutos);
    } catch (error) {
      console.error('Erro ao carregar produtos origem:', error);
    } finally {
      setLoadingProdutosOrigem(false);
    }
  };

  // Limpar dados quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: '',
        descricao: '',
        filial_id: null,
        filial_nome: '',
        centro_custo_id: null,
        centro_custo_nome: '',
        tipo_receita: '',
        produtos: []
      });
      setProdutoForm({
        produto_origem_id: null,
        percapta_sugerida: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Preencher dados quando receita é fornecida
  useEffect(() => {
    if (isOpen && receita) {
      setFormData({
        nome: receita.nome || '',
        descricao: receita.descricao || '',
        filial_id: receita.filial_id || null,
        filial_nome: receita.filial_nome || receita.filial || '',
        centro_custo_id: receita.centro_custo_id || null,
        centro_custo_nome: receita.centro_custo_nome || receita.centro_custo || '',
        tipo_receita: receita.tipo_receita || '',
        produtos: receita.produtos || []
      });
    }
  }, [isOpen, receita]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProdutoFormChange = (field, value) => {
    setProdutoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddProduto = () => {
    if (!produtoForm.produto_origem_id) {
      return;
    }

    // Buscar o produto completo para obter todos os dados
    const produtoSelecionado = produtosOrigem.find(p => p.id === produtoForm.produto_origem_id);
    
    if (!produtoSelecionado) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      produtos: [
        ...prev.produtos,
        {
          produto_origem: produtoSelecionado.nome || '', // Manter para compatibilidade
          produto_origem_id: produtoSelecionado.id,
          grupo_id: produtoSelecionado.grupo_id || null,
          grupo_nome: produtoSelecionado.grupo_nome || null,
          subgrupo_id: produtoSelecionado.subgrupo_id || null,
          subgrupo_nome: produtoSelecionado.subgrupo_nome || null,
          classe_id: produtoSelecionado.classe_id || null,
          classe_nome: produtoSelecionado.classe_nome || null,
          percapta_sugerida: produtoForm.percapta_sugerida || null
        }
      ]
    }));

    setProdutoForm({
      produto_origem_id: null,
      percapta_sugerida: ''
    });
  };

  const handleRemoveProduto = (index) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação
    const newErrors = {};
    if (!formData.nome || formData.nome.trim() === '') {
      newErrors.nome = 'Nome da receita é obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Preparar dados para envio
    const dataToSubmit = {
      ...formData,
      produtos: formData.produtos.map(p => ({
        produto_origem: p.produto_origem || '', // Manter para compatibilidade
        produto_origem_id: p.produto_origem_id || null,
        grupo_id: p.grupo_id || null,
        grupo_nome: p.grupo_nome || null,
        subgrupo_id: p.subgrupo_id || null,
        subgrupo_nome: p.subgrupo_nome || null,
        classe_id: p.classe_id || null,
        classe_nome: p.classe_nome || null,
        percapta_sugerida: p.percapta_sugerida ? parseFloat(p.percapta_sugerida) : null
      }))
    };

    onSubmit(dataToSubmit);
  };

  const tiposReceita = [
    { value: '', label: 'Selecione...' },
    { value: 'Acompanhamento', label: 'Acompanhamento' },
    { value: 'Prato Principal', label: 'Prato Principal' },
    { value: 'Guarnição', label: 'Guarnição' },
    { value: 'Sobremesa', label: 'Sobremesa' },
    { value: 'Bebida', label: 'Bebida' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewMode 
          ? 'Visualizar Receita' 
          : receita 
            ? 'Editar Receita' 
            : 'Nova Receita'
      }
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Seção: Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              {/* Código (somente leitura) */}
              {receita && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código da Receita
                  </label>
                  <Input
                    type="text"
                    value={receita.codigo || ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Receita <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  disabled={isViewMode}
                  error={errors.nome}
                  placeholder="Digite o nome da receita"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição da Receita
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  disabled={isViewMode}
                  rows={3}
                  placeholder="Digite a descrição da receita (opcional)"
                />
              </div>

              {/* Tipo de Receita */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Receita
                </label>
                <select
                  value={formData.tipo_receita}
                  onChange={(e) => handleInputChange('tipo_receita', e.target.value)}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {tiposReceita.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Vinculações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Vinculações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <SearchableSelect
                  label="Filial"
                  value={formData.filial_id ? filiais.find(f => f.id === formData.filial_id)?.filial || filiais.find(f => f.id === formData.filial_id)?.nome || '' : ''}
                  onChange={(value) => {
                    // value é o nome da filial, precisamos encontrar o ID e nome
                    const filialSelecionada = filiais.find(f => 
                      (f.filial || f.nome || f.razao_social) === value
                    );
                    if (filialSelecionada) {
                      handleInputChange('filial_id', filialSelecionada.id);
                      handleInputChange('filial_nome', filialSelecionada.filial || filialSelecionada.nome || filialSelecionada.razao_social || '');
                    } else {
                      handleInputChange('filial_id', null);
                      handleInputChange('filial_nome', '');
                    }
                  }}
                  options={filiais.map(filial => ({
                    value: filial.filial || filial.nome || filial.razao_social || '',
                    label: filial.filial || filial.nome || filial.razao_social || '',
                    description: filial.cidade ? `Cidade: ${filial.cidade}` : ''
                  }))}
                  placeholder="Digite para buscar uma filial..."
                  disabled={isViewMode}
                  loading={loadingFiliais}
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
              <div>
                <SearchableSelect
                  label="Centro de Custo"
                  value={formData.centro_custo_id ? centrosCusto.find(c => c.id === formData.centro_custo_id)?.nome || '' : ''}
                  onChange={(value) => {
                    // value é o nome do centro de custo, precisamos encontrar o ID e nome
                    const centroSelecionado = centrosCusto.find(c => c.nome === value);
                    if (centroSelecionado) {
                      handleInputChange('centro_custo_id', centroSelecionado.id);
                      handleInputChange('centro_custo_nome', centroSelecionado.nome || '');
                    } else {
                      handleInputChange('centro_custo_id', null);
                      handleInputChange('centro_custo_nome', '');
                    }
                  }}
                  options={centrosCusto.map(centro => ({
                    value: centro.nome || '',
                    label: centro.nome || '',
                    description: centro.filial_nome ? `Filial: ${centro.filial_nome}` : ''
                  }))}
                  placeholder="Digite para buscar um centro de custo..."
                  disabled={isViewMode}
                  loading={loadingCentrosCusto}
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
            </div>
          </div>

          {/* Seção: Produtos da Receita */}
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
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-7">
                    <SearchableSelect
                      value={produtoForm.produto_origem_id ? produtosOrigem.find(p => p.id === produtoForm.produto_origem_id)?.nome || '' : ''}
                      onChange={(value) => {
                        // value é o nome do produto, precisamos encontrar o ID
                        const produtoSelecionado = produtosOrigem.find(p => p.nome === value);
                        handleProdutoFormChange('produto_origem_id', produtoSelecionado ? produtoSelecionado.id : null);
                      }}
                      options={produtosOrigem
                        // Filtrar produtos já adicionados
                        .filter(produto => {
                          // Verificar se o produto já está na lista de produtos adicionados
                          return !formData.produtos.some(p => p.produto_origem_id === produto.id);
                        })
                        .map(produto => ({
                          value: produto.nome || '',
                          label: `${produto.nome || ''}${produto.codigo ? ` (${produto.codigo})` : ''}`,
                          description: produto.grupo_nome ? `Grupo: ${produto.grupo_nome}` : produto.unidade_medida_nome ? `Unidade: ${produto.unidade_medida_nome}` : ''
                        }))}
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
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      value={produtoForm.percapta_sugerida}
                      onChange={(e) => handleProdutoFormChange('percapta_sugerida', e.target.value)}
                      placeholder="Percapta (kg/L)"
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      onClick={handleAddProduto}
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
                        Percapta Sugerida (kg/L)
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
                          {produto.percapta_sugerida 
                            ? `${Number(produto.percapta_sugerida).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })} kg/L` 
                            : '-'}
                        </td>
                        {!isViewMode && (
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduto(index)}
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

          {/* Botões */}
          {!isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {receita ? 'Atualizar Receita' : 'Salvar Receita'}
              </Button>
            </div>
          )}

          {isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="primary"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ReceitaModal;

