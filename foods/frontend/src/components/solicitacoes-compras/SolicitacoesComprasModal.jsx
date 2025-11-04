import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { Button, Input, Modal, SearchableSelect } from '../ui';
import SolicitacoesComprasService from '../../services/solicitacoesCompras';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SolicitacoesComprasModal = ({
  isOpen,
  onClose,
  onSubmit,
  solicitacao,
  viewMode,
  filiais,
  produtosGenericos,
  unidadesMedida,
  loading
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  const { user } = useAuth();
  const [itens, setItens] = useState([]);
  const [semanaAbastecimento, setSemanaAbastecimento] = useState('');
  const [carregandoSemana, setCarregandoSemana] = useState(false);
  const [produtosAdicionados, setProdutosAdicionados] = useState(new Set());

  // Observar data de entrega para buscar semana
  const dataEntrega = watch('data_entrega_cd');
  const motivo = watch('motivo');

  // Buscar semana de abastecimento quando data mudar
  useEffect(() => {
    if (dataEntrega && !viewMode) {
      buscarSemanaAbastecimento(dataEntrega);
    }
  }, [dataEntrega, viewMode]);

  const buscarSemanaAbastecimento = async (data) => {
    if (!data) return;
    setCarregandoSemana(true);
    try {
      const response = await SolicitacoesComprasService.buscarSemanaAbastecimento(data);
      if (response.success) {
        setSemanaAbastecimento(response.data.semana_abastecimento || '');
      }
    } catch (error) {
      console.error('Erro ao buscar semana de abastecimento:', error);
    } finally {
      setCarregandoSemana(false);
    }
  };

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (solicitacao && isOpen) {
      // Preencher formulário com dados da solicitação
      Object.keys(solicitacao).forEach(key => {
        if (solicitacao[key] !== null && solicitacao[key] !== undefined && key !== 'itens') {
          setValue(key, solicitacao[key]);
        }
      });
      
      // Carregar itens se existirem
      if (solicitacao.itens && Array.isArray(solicitacao.itens)) {
        setItens(solicitacao.itens);
        const produtosIds = solicitacao.itens.map(item => item.produto_id).filter(Boolean);
        setProdutosAdicionados(new Set(produtosIds));
      }
      
      if (solicitacao.semana_abastecimento) {
        setSemanaAbastecimento(solicitacao.semana_abastecimento);
      }
    } else if (!solicitacao && isOpen) {
      // Resetar formulário para nova solicitação
      reset();
      setValue('data_documento', new Date().toISOString().split('T')[0]);
      setItens([]);
      setProdutosAdicionados(new Set());
      setSemanaAbastecimento('');
    }
  }, [solicitacao, isOpen, setValue, reset, user]);

  // Adicionar novo item
  const handleAddItem = () => {
    setItens([...itens, {
      produto_id: '',
      quantidade: '',
      unidade_medida_id: '',
      observacao: ''
    }]);
  };

  // Remover item
  const handleRemoveItem = (index) => {
    const item = itens[index];
    if (item.produto_id) {
      const novosProdutos = new Set(produtosAdicionados);
      novosProdutos.delete(item.produto_id);
      setProdutosAdicionados(novosProdutos);
    }
    setItens(itens.filter((_, i) => i !== index));
  };

  // Atualizar campo de item
  const handleItemChange = (index, field, value) => {
    const updated = [...itens];
    updated[index] = { ...updated[index], [field]: value };
    
    // Se mudou produto, auto-preenche unidade e símbolo
    if (field === 'produto_id' && value) {
      const produto = produtosGenericos.find(p => p.id === parseInt(value));
      if (produto) {
        if (produto.unidade_medida_id) {
          updated[index].unidade_medida_id = produto.unidade_medida_id;
        }
        // Buscar símbolo da unidade
        const unidade = unidadesMedida.find(u => u.id === produto.unidade_medida_id);
        if (unidade) {
          updated[index].unidade_simbolo = unidade.simbolo || unidade.sigla;
          updated[index].unidade_medida = unidade.nome || unidade.simbolo || unidade.sigla;
        }
      }
      
      // Verificar duplicidade
      const produtoId = parseInt(value);
      if (produtosAdicionados.has(produtoId)) {
        toast.error('Este produto já foi adicionado à solicitação');
        return;
      }
      
      // Adicionar à lista de produtos adicionados
      const novosProdutos = new Set(produtosAdicionados);
      if (updated[index].produto_id) {
        novosProdutos.delete(updated[index].produto_id);
      }
      novosProdutos.add(produtoId);
      setProdutosAdicionados(novosProdutos);
    }
    
    setItens(updated);
  };

  const handleFormSubmit = (data) => {
    // Validar campos obrigatórios
    if (!data.filial_id || isNaN(parseInt(data.filial_id))) {
      toast.error('Filial é obrigatória');
      return;
    }

    if (!data.data_entrega_cd) {
      toast.error('Data de entrega CD é obrigatória');
      return;
    }

    if (!data.motivo) {
      toast.error('Justificativa é obrigatória');
      return;
    }

    // Validar itens
    if (!itens || itens.length === 0) {
      toast.error('A solicitação deve ter pelo menos um item');
      return;
    }

    // Validar cada item (sem validar observacao do produto)
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      if (!item.produto_id || isNaN(parseInt(item.produto_id))) {
        toast.error(`Item ${i + 1}: Produto é obrigatório`);
        return;
      }
      if (!item.quantidade || isNaN(parseFloat(item.quantidade)) || parseFloat(item.quantidade) <= 0) {
        toast.error(`Item ${i + 1}: Quantidade deve ser maior que zero`);
        return;
      }
      if (!item.unidade_medida_id || isNaN(parseInt(item.unidade_medida_id))) {
        toast.error(`Item ${i + 1}: Unidade é obrigatória`);
        return;
      }
    }

    // Validar observações se motivo for "Compra Emergencial"
    if (data.motivo && data.motivo === 'Compra Emergencial') {
      if (!data.observacoes || data.observacoes.trim() === '') {
        toast.error('Observações são obrigatórias para Compra Emergencial');
        return;
      }
    }

    // Preparar dados para envio
    const formData = {
      filial_id: parseInt(data.filial_id),
      data_entrega_cd: data.data_entrega_cd,
      motivo: data.motivo,
      observacoes: data.observacoes || null,
      itens: itens.map(item => ({
        produto_id: parseInt(item.produto_id),
        quantidade: parseFloat(item.quantidade),
        unidade_medida_id: parseInt(item.unidade_medida_id),
        observacao: item.observacao || null // Observação do produto é opcional
      }))
    };

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {viewMode ? <FaEye className="w-5 h-5 text-white" /> : solicitacao ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode ? 'Visualizar Solicitação' : solicitacao ? 'Editar Solicitação' : 'Nova Solicitação de Compras'}
              </h2>
              <p className="text-sm text-gray-600">
                {viewMode ? 'Visualizando informações da solicitação' : solicitacao ? 'Editando informações da solicitação' : 'Preencha as informações da nova solicitação'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Cabeçalho */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cabeçalho da Solicitação</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Filial */}
              <Input
                label="Filial *"
                type="select"
                {...register('filial_id', {
                  required: 'Filial é obrigatória'
                })}
                error={errors.filial_id?.message}
                disabled={viewMode}
              >
                <option value="">Selecione uma filial</option>
                {filiais && filiais.length > 0 ? (
                  filiais.map(filial => (
                    <option key={filial.id} value={filial.id}>
                      {filial.filial || filial.nome || 'Filial'} {filial.codigo_filial ? `(${filial.codigo_filial})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Carregando filiais...</option>
                )}
              </Input>

              {/* Data de Entrega CD */}
              <Input
                label="Data de Entrega CD *"
                type="date"
                {...register('data_entrega_cd', {
                  required: 'Data de entrega CD é obrigatória'
                })}
                error={errors.data_entrega_cd?.message}
                disabled={viewMode}
              />

              {/* Semana de Abastecimento */}
              <Input
                label="Semana de Abastecimento"
                value={semanaAbastecimento}
                disabled={true}
                className="bg-gray-50"
              />

              {/* Justificativa */}
              <Input
                label="Justificativa *"
                type="select"
                {...register('motivo', {
                  required: 'Justificativa é obrigatória'
                })}
                error={errors.motivo?.message}
                disabled={viewMode}
              >
                <option value="">Selecione uma justificativa</option>
                <option value="Compra Emergencial">Compra Emergencial</option>
                <option value="Compra Programada">Compra Programada</option>
              </Input>

              {/* Data do Documento */}
              <Input
                label="Data do Documento"
                type="date"
                {...register('data_documento')}
                disabled={true}
                className="bg-gray-50"
              />

              {/* Número da Solicitação (se editando) */}
              {solicitacao && (
                <Input
                  label="Número da Solicitação"
                  value={solicitacao.numero_solicitacao || ''}
                  disabled={true}
                  className="bg-gray-50"
                />
              )}

              {/* Solicitante */}
              <Input
                label="Solicitante"
                value={solicitacao?.usuario_nome || solicitacao?.solicitante || user?.nome || ''}
                disabled={true}
                className="bg-gray-50"
                readOnly
              />
            </div>

            {/* Observações Gerais */}
            <div className="mt-4">
              <Input
                label={`Observações Gerais${motivo && motivo === 'Compra Emergencial' ? ' *' : ''}`}
                type="textarea"
                rows={3}
                {...register('observacoes', {
                  required: motivo && motivo === 'Compra Emergencial' 
                    ? 'Observações são obrigatórias para Compra Emergencial' 
                    : false
                })}
                error={errors.observacoes?.message}
                disabled={viewMode}
                placeholder={motivo && motivo === 'Compra Emergencial' 
                  ? 'Digite as observações da solicitação (obrigatório para Compra Emergencial)...' 
                  : 'Digite as observações (opcional para Compra Programada)...'}
              />
            </div>
          </div>

          {/* Produtos da Solicitação */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Produtos da Solicitação</h3>
              {!viewMode && (
                <Button onClick={handleAddItem} size="sm" variant="ghost" type="button">
                  <FaPlus className="mr-1" />
                  Adicionar Produto
                </Button>
              )}
            </div>

            {itens.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto Genérico *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unidade *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade *
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Observação
                      </th>
                      {!viewMode && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itens.map((item, index) => {
                      // Filtrar produtos já adicionados (exceto o atual)
                      const produtosDisponiveis = produtosGenericos.filter(p => 
                        !produtosAdicionados.has(p.id) || p.id === parseInt(item.produto_id)
                      );

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {viewMode ? (
                              <span className="text-sm text-gray-900">
                                {item.nome_produto || item.produto_nome || '-'}
                              </span>
                            ) : (
                              <SearchableSelect
                                value={item.produto_id || ''}
                                onChange={(value) => handleItemChange(index, 'produto_id', value)}
                                options={produtosDisponiveis.map(p => ({
                                  value: p.id,
                                  label: `${p.codigo_produto || p.codigo || ''} - ${p.nome}`
                                }))}
                                placeholder="Selecione um produto..."
                                className="w-full"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="text"
                              value={item.unidade_simbolo || item.unidade_medida || '-'}
                              disabled={true}
                              className="bg-gray-50 cursor-not-allowed"
                              readOnly
                            />
                          </td>
                          <td className="px-4 py-3">
                            {viewMode ? (
                              <span className="text-sm text-gray-900">
                                {item.quantidade || '-'}
                              </span>
                            ) : (
                              <Input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={item.quantidade || ''}
                                onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                                className="w-full"
                                placeholder="0.000"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {viewMode ? (
                              <span className="text-sm text-gray-900">
                                {item.observacao || '-'}
                              </span>
                            ) : (
                              <Input
                                type="text"
                                value={item.observacao || ''}
                                onChange={(e) => handleItemChange(index, 'observacao', e.target.value)}
                                className="w-full"
                                placeholder="Observação do item..."
                              />
                            )}
                          </td>
                          {!viewMode && (
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                title="Remover item"
                                type="button"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            {!viewMode && (
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'Salvando...' : solicitacao ? 'Atualizar' : 'Criar'}
              </Button>
            )}
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              {viewMode ? 'Fechar' : 'Cancelar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SolicitacoesComprasModal;

