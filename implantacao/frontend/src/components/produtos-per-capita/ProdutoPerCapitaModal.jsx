import React, { useState, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import { Modal, Button, Input, SearchableSelect, ConfirmModal } from '../ui';
import { formatDate } from '../../utils/formatters';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';

/**
 * Modal para Produto Per Capita
 * Segue padrão de excelência do sistema
 */
const ProdutoPerCapitaModal = ({
  isOpen,
  onClose,
  onSave,
  produto,
  isViewMode = false,
  produtosDisponiveis = [],
  loading = false,
  onCarregarProdutosDisponiveis
}) => {
  const [formData, setFormData] = useState({
    produto_id: '',
    per_capita_lanche_manha: '',
    per_capita_almoco: '',
    per_capita_lanche_tarde: '',
    per_capita_parcial_manha: '',
    per_capita_parcial_tarde: '',
    per_capita_eja: '',
    ativo: true
  });

  const [errors, setErrors] = useState({});
  const {
    isDirty,
    markDirty,
    resetDirty,
    requestClose,
    showConfirm,
    confirmClose,
    cancelClose,
    confirmTitle,
    confirmMessage
  } = useUnsavedChangesPrompt();

  // Limpar dados quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      // Limpar dados imediatamente quando modal é fechado
      setFormData({
        produto_id: '',
        per_capita_lanche_manha: '',
        per_capita_almoco: '',
        per_capita_lanche_tarde: '',
        per_capita_parcial_manha: '',
        per_capita_parcial_tarde: '',
        per_capita_eja: '',
        ativo: true
      });
      setErrors({});
      resetDirty();
    }
  }, [isOpen, resetDirty]);

  // Carregar produtos disponíveis quando modal abrir
  useEffect(() => {
    if (isOpen && onCarregarProdutosDisponiveis) {
      // Se está editando, passar o ID do produto para incluí-lo na lista
      const produtoIdForEdit = produto?.produto_id || null;
      onCarregarProdutosDisponiveis({ produtoIdForEdit });
    }
  }, [isOpen, onCarregarProdutosDisponiveis, produto]);

  // Preencher dados quando produto é fornecido
  useEffect(() => {
    if (isOpen && produto) {
      setFormData({
        produto_id: produto.produto_id || '',
        produto_origem_id: produto.produto_origem_id || '',
        produto_nome: produto.produto_nome || produto.nome_produto || '',
        produto_codigo: produto.produto_codigo || produto.codigo || '',
        unidade_medida: produto.unidade_medida || '',
        grupo: produto.grupo || '',
        subgrupo: produto.subgrupo || '',
        classe: produto.classe || '',
        per_capita_lanche_manha: produto.per_capita_lanche_manha || '',
        per_capita_almoco: produto.per_capita_almoco || '',
        per_capita_lanche_tarde: produto.per_capita_lanche_tarde || '',
        per_capita_parcial_manha: produto.per_capita_parcial_manha ?? produto.per_capita_parcial ?? '',
        per_capita_parcial_tarde: produto.per_capita_parcial_tarde ?? '',
        per_capita_eja: produto.per_capita_eja || '',
        descricao: produto.descricao || '',
        ativo: produto.ativo !== undefined ? produto.ativo : true
      });
      resetDirty();
    }
  }, [isOpen, produto, resetDirty]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (!isViewMode) {
      markDirty();
    }
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Se mudou o produto, preencher automaticamente os campos do produto
    if (field === 'produto_id' && value) {
      const produtoSelecionado = produtosDisponiveis.find(prod => prod.id === value);
      if (produtoSelecionado) {
        setFormData(prev => ({
          ...prev,
          produto_origem_id: produtoSelecionado.id,
          produto_nome: produtoSelecionado.nome,
          produto_codigo: produtoSelecionado.codigo,
          unidade_medida: produtoSelecionado.unidade_medida_sigla || produtoSelecionado.unidade_medida_nome || produtoSelecionado.unidade_medida,
          grupo: produtoSelecionado.grupo_nome,
          subgrupo: produtoSelecionado.subgrupo_nome,
          classe: produtoSelecionado.classe_nome
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    const newErrors = {};
    
    if (!formData.produto_id) {
      newErrors.produto_id = 'Produto é obrigatório';
    }
    
    // Verificar se pelo menos um per capita foi definido
    const temPerCapita = formData.per_capita_lanche_manha > 0 ||
                        formData.per_capita_almoco > 0 ||
                        formData.per_capita_lanche_tarde > 0 ||
                        formData.per_capita_parcial_manha > 0 ||
                        formData.per_capita_parcial_tarde > 0 ||
                        formData.per_capita_eja > 0;
    
    if (!temPerCapita) {
      newErrors.per_capita = 'Pelo menos um per capita deve ser definido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Limpar valores vazios e converter para null/valores apropriados
      const dadosLimpos = {
        ...formData,
        produto_id: formData.produto_id || null,
        per_capita_parcial_manha: formData.per_capita_parcial_manha || 0,
        per_capita_parcial_tarde: formData.per_capita_parcial_tarde || 0,
        per_capita_lanche_manha: formData.per_capita_lanche_manha || 0,
        per_capita_lanche_tarde: formData.per_capita_lanche_tarde || 0,
        per_capita_almoco: formData.per_capita_almoco || 0,
        per_capita_eja: formData.per_capita_eja || 0,
        ativo: formData.ativo !== undefined ? formData.ativo : true
      };
      
      const resultado = await onSave(dadosLimpos);
      
      // Limpar dados apenas se o salvamento foi bem-sucedido
      if (resultado && resultado.success) {
        setFormData({
          produto_id: '',
          per_capita_lanche_manha: '',
          per_capita_almoco: '',
          per_capita_lanche_tarde: '',
          per_capita_parcial_manha: '',
          per_capita_parcial_tarde: '',
          per_capita_eja: '',
          ativo: true
        });
        resetDirty();
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto per capita:', error);
    }
  };

  const handleLimparDados = () => {
    setFormData({
      produto_id: '',
      per_capita_lanche_manha: '',
      per_capita_almoco: '',
      per_capita_lanche_tarde: '',
      per_capita_parcial_manha: '',
      per_capita_parcial_tarde: '',
      per_capita_eja: '',
      ativo: true
    });
    setErrors({});
    if (!isViewMode) {
      markDirty();
    }
  };

  const periodos = [
    { key: 'per_capita_lanche_manha', label: 'Lanche Manhã', placeholder: 'Ex: 0.200' },
    { key: 'per_capita_almoco', label: 'Almoço', placeholder: 'Ex: 0.150' },
    { key: 'per_capita_lanche_tarde', label: 'Lanche Tarde', placeholder: 'Ex: 0.150' },
    { key: 'per_capita_parcial_manha', label: 'Parcial Manhã', placeholder: 'Ex: 0.200' },
    { key: 'per_capita_parcial_tarde', label: 'Parcial Tarde', placeholder: 'Ex: 0.150' },
    { key: 'per_capita_eja', label: 'EJA', placeholder: 'Ex: 0.100' }
  ];

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={() => requestClose(onClose)}
      title={isViewMode ? 'Visualizar Produto Per Capita' : produto ? 'Editar Produto Per Capita' : 'Adicionar Produto Per Capita'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SearchableSelect
              label="Produto"
              value={formData.produto_id}
              onChange={(value) => handleInputChange('produto_id', value)}
              options={produtosDisponiveis.map(prod => ({
                value: prod.id,
                label: `${prod.nome} (${prod.codigo})`,
                description: `${prod.unidade_medida_sigla || prod.unidade_medida_nome || prod.unidade_medida || '-'} - ${prod.grupo_nome || '-'}`
              }))}
              placeholder="Digite para buscar um produto..."
              disabled={isViewMode || loading}
              required
              error={errors.produto_id}
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
          </div>
        </div>

        {/* Informações do Produto Selecionado */}
        {formData.produto_id && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Informações do Produto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <Input
                  value={formData.produto_nome || '-'}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <Input
                  value={formData.produto_codigo || '-'}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida</label>
                <Input
                  value={formData.unidade_medida || '-'}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                <Input
                  value={formData.grupo || '-'}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subgrupo</label>
                <Input
                  value={formData.subgrupo || '-'}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                <Input
                  value={formData.classe || '-'}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.ativo ? 'ativo' : 'inativo'}
              onChange={(e) => handleInputChange('ativo', e.target.value === 'ativo')}
              disabled={isViewMode || loading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isViewMode || loading ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>

        {/* Per Capita por Período */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Per Capita por Período (em kg)</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {periodos.map((periodo) => (
                <div key={periodo.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {periodo.label}
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="999.999"
                    value={formData[periodo.key]}
                    onChange={(e) => handleInputChange(periodo.key, parseFloat(e.target.value) || 0)}
                    placeholder={periodo.placeholder}
                    disabled={isViewMode || loading}
                  />
                </div>
              ))}
            </div>
            
            {errors.per_capita && (
              <p className="mt-2 text-sm text-red-600">{errors.per_capita}</p>
            )}
          </div>
        </div>

        {/* Informações de Auditoria (apenas em modo visualização) */}
        {isViewMode && produto && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Informações de Auditoria</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Criado em:</span> {formatDate(produto.data_cadastro)}
                </div>
                <div>
                  <span className="font-medium">Atualizado em:</span> {formatDate(produto.data_atualizacao)}
                </div>
                {produto.created_by_nome && (
                  <div>
                    <span className="font-medium">Criado por:</span> {produto.created_by_nome}
                  </div>
                )}
                {produto.updated_by_nome && (
                  <div>
                    <span className="font-medium">Atualizado por:</span> {produto.updated_by_nome}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação - apenas quando não estiver em modo visualização */}
        {!isViewMode && (
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={handleLimparDados}
              disabled={loading}
              className="px-6 text-gray-600 hover:text-gray-800"
            >
              Limpar Dados
            </Button>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="ghost"
              onClick={() => requestClose(onClose)}
                disabled={loading}
                className="px-8"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !formData.produto_id}
                loading={loading}
                className="px-8"
              >
                <FaSave className="mr-2" />
                {produto ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        )}

        {/* Botão de Fechar - apenas em modo visualização */}
        {isViewMode && (
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => requestClose(onClose)}
              className="px-8"
            >
              Fechar
            </Button>
          </div>
        )}
      </form>
    </Modal>
    <ConfirmModal
      isOpen={showConfirm}
      onClose={cancelClose}
      onConfirm={confirmClose}
      title={confirmTitle}
      message={confirmMessage}
      confirmText="Descartar"
      cancelText="Continuar editando"
      variant="danger"
    />
    </>
  );
};

export default ProdutoPerCapitaModal;
