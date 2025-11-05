import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaEye, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRelatorioInspecao } from '../../hooks/useRelatorioInspecao';
import { Button, Input, SearchableSelect, LoadingSpinner, Modal } from '../ui';
import ChecklistTable from './ChecklistTable';
import ProdutosTable from './ProdutosTable';

const RelatorioInspecaoModal = ({ isOpen, onClose, onSubmit, rir, viewMode, grupos, loading }) => {
  const { canCreate, canEdit } = usePermissions();
  const isEditMode = !!rir?.id;
  const isViewMode = viewMode || false;
  const rirId = rir?.id || null;

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  
  const {
    rir: rirData,
    loading: loadingRIR,
    grupos: gruposData,
    buscarRIRPorId,
    criarRIR,
    atualizarRIR,
    buscarPedidosAprovados,
    buscarGrupos,
    buscarProdutosPedido,
    buscarNQAGrupo
  } = useRelatorioInspecao();

  const [saving, setSaving] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && rirId) {
        loadRIRData();
      } else {
        // Resetar formulário para novo relatório
        reset();
        setValue('data_inspecao', new Date().toISOString().split('T')[0]);
        setValue('hora_inspecao', new Date().toTimeString().slice(0, 5));
        setChecklist([]);
        setProdutos([]);
      }
      loadInitialData();
    }
  }, [rirId, isEditMode, isOpen, setValue, reset]);

  const loadRIRData = async () => {
    const response = await buscarRIRPorId(rirId);
    if (response.success && response.data) {
      const data = response.data;
      // Preencher formulário com dados do RIR
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && key !== 'checklist_json' && key !== 'produtos_json') {
          setValue(key, data[key]);
        }
      });
      
      // Carregar checklist e produtos
      if (data.checklist_json) {
        setChecklist(Array.isArray(data.checklist_json) ? data.checklist_json : []);
      }
      if (data.produtos_json) {
        setProdutos(Array.isArray(data.produtos_json) ? data.produtos_json : []);
      }
    }
  };

  const loadInitialData = async () => {
    // Carregar pedidos aprovados
    setLoadingPedidos(true);
    const pedidosResponse = await buscarPedidosAprovados();
    if (pedidosResponse.success) {
      setPedidos(pedidosResponse.data || []);
    }
    setLoadingPedidos(false);

    // Carregar grupos
    const gruposResponse = await buscarGrupos();
    // grupos já está disponível no hook
  };

  const handlePedidoChange = async (pedidoId) => {
    if (!pedidoId) {
      setValue('numero_pedido', '');
      setValue('fornecedor', '');
      setValue('cnpj_fornecedor', '');
      setProdutos([]);
      return;
    }

    const pedido = pedidos.find(p => p.id.toString() === pedidoId.toString());
    if (pedido) {
      setValue('numero_pedido', pedido.numero_pedido || '');
      setValue('fornecedor', pedido.fornecedor || '');
      setValue('cnpj_fornecedor', pedido.cnpj || '');
    }

    // Buscar produtos do pedido
    const produtosResponse = await buscarProdutosPedido(pedidoId);
    if (produtosResponse.success && produtosResponse.data) {
      const produtosDoPedido = produtosResponse.data.produtos || [];
      
      // Mapear produtos para o formato esperado e buscar NQA para cada um
      const produtosMapeados = await Promise.all(
        produtosDoPedido.map(async (produto, index) => {
          let nqaData = {
            nqa_id: produto.nqa_id || null,
            nqa_codigo: produto.nqa_codigo || null
          };

          // Se não trouxe NQA do pedido, buscar pelo grupo
          if (!nqaData.nqa_id && produto.grupo_id) {
            const nqaResponse = await buscarNQAGrupo(produto.grupo_id);
            if (nqaResponse.success && nqaResponse.data) {
              nqaData.nqa_id = nqaResponse.data.id;
              nqaData.nqa_codigo = nqaResponse.data.codigo;
            }
          }

          return {
            index: index,
            codigo: produto.codigo_produto || '',
            descricao: produto.nome_produto || '',
            und: produto.unidade_medida || '',
            qtde: produto.quantidade_pedido || '',
            grupo_id: produto.grupo_id,
            grupoId: produto.grupo_id,
            grupo_nome: produto.grupo_nome,
            nqa_id: nqaData.nqa_id,
            nqa_codigo: nqaData.nqa_codigo,
            fabricacao: '',
            fabricacaoBR: '',
            lote: '',
            validade: '',
            validadeBR: '',
            controle_validade: null,
            temperatura: '',
            aval_sensorial: '',
            tam_lote: '',
            num_amostras_avaliadas: null,
            num_amostras_aprovadas: '',
            num_amostras_reprovadas: '',
            resultado_final: 'Aprovado',
            ac: null,
            re: null
          };
        })
      );

      setProdutos(produtosMapeados);
    }
  };

  const handleChecklistChange = (checklistData) => {
    setChecklist(checklistData);
  };

  const handleProdutosChange = (produtosData) => {
    setProdutos(produtosData);
  };

  const handleAddChecklistItem = () => {
    setChecklist([...checklist, {
      tipo_transporte: '',
      tipo_produto: '',
      isento_material: '',
      condicoes_caminhao: '',
      acondicionamento: '',
      condicoes_embalagem: ''
    }]);
  };

  const handleRemoveChecklistItem = (index) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleRemoveProduto = (index) => {
    setProdutos(produtos.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data) => {
    if (!data.numero_nota_fiscal || !data.fornecedor) {
      toast.error('Campos obrigatórios: Número da Nota Fiscal e Fornecedor');
      return;
    }

    setSaving(true);

    try {
      const formData = {
        ...data,
        checklist_json: checklist,
        produtos_json: produtos
      };

      let response;
      if (isEditMode) {
        response = await atualizarRIR(rirId, formData);
      } else {
        response = await criarRIR(formData);
      }

      if (response.success) {
        toast.success(response.message || 'Relatório salvo com sucesso!');
        if (onSubmit) {
          onSubmit(formData);
    }
    onClose();
      } else {
        if (response.validationErrors) {
          toast.error('Erros de validação encontrados');
        } else {
          toast.error(response.message || 'Erro ao salvar relatório');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar relatório');
    } finally {
      setSaving(false);
    }
  };

  const getPedidoOptions = () => {
    return pedidos.map(pedido => ({
      value: pedido.id.toString(),
      label: `${pedido.numero_pedido || pedido.id} - ${pedido.fornecedor || 'Sem fornecedor'}`
    }));
  };

  if (!isOpen) return null;

  if (loadingRIR && isEditMode) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {viewMode ? <FaEye className="w-5 h-5 text-white" /> : rir ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode ? 'Visualizar Relatório de Inspeção' : rir ? 'Editar Relatório de Inspeção' : 'Novo Relatório de Inspeção'}
              </h2>
              <p className="text-sm text-gray-600">
                {viewMode ? 'Visualizando informações do relatório de inspeção' : rir ? 'Editando informações do relatório de inspeção' : 'Preencha as informações do novo relatório de inspeção'}
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
          {/* SEÇÃO A: Dados do Pedido */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">A) Dados do Pedido</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pedido de Compra */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pedido de Compra
                </label>
                <SearchableSelect
                  value={watch('pedido_id') || ''}
                  onChange={(value) => {
                    setValue('pedido_id', value);
                    handlePedidoChange(value);
                  }}
                  options={getPedidoOptions()}
                  placeholder="Selecione o pedido..."
                  disabled={loadingPedidos || isViewMode}
                />
              </div>

              {/* Fornecedor */}
              <Input
                label="Fornecedor *"
                {...register('fornecedor', {
                  required: 'Fornecedor é obrigatório'
                })}
                error={errors.fornecedor?.message}
                disabled={true}
                placeholder="Razão Social do fornecedor"
              />

              {/* CNPJ Fornecedor */}
              <Input
                label="CNPJ Fornecedor"
                {...register('cnpj_fornecedor')}
                error={errors.cnpj_fornecedor?.message}
                disabled={true}
                placeholder="00.000.000/0000-00"
              />

              {/* Nº Nota Fiscal */}
              <Input
                label="Nº Nota Fiscal *"
                {...register('numero_nota_fiscal', {
                  required: 'Número da Nota Fiscal é obrigatório'
                })}
                error={errors.numero_nota_fiscal?.message}
                disabled={isViewMode}
                placeholder="Número da NF"
              />

              {/* Data Recebimento */}
              <Input
                label="Data Recebimento *"
                type="date"
                {...register('data_inspecao', {
                  required: 'Data de recebimento é obrigatória'
                })}
                error={errors.data_inspecao?.message}
                disabled={isViewMode}
              />

              {/* Hora Recebimento */}
              <Input
                label="Hora Recebimento *"
                type="time"
                {...register('hora_inspecao', {
                  required: 'Hora de recebimento é obrigatória'
                })}
                error={errors.hora_inspecao?.message}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* SEÇÃO B: Check List Higiênico-Sanitário */}
          <ChecklistTable
            checklist={checklist}
            grupos={gruposData || grupos || []}
            onChange={handleChecklistChange}
            onAdd={handleAddChecklistItem}
            onRemove={handleRemoveChecklistItem}
            viewMode={isViewMode}
          />

          {/* SEÇÃO C: Avaliação dos Produtos */}
          <ProdutosTable
            produtos={produtos}
            onChange={handleProdutosChange}
            onRemove={handleRemoveProduto}
            viewMode={isViewMode}
          />

          {/* SEÇÃO D: Ocorrências e Responsáveis */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">D) Ocorrências e Responsáveis</h3>
            
            <div className="space-y-4">
              {/* Ocorrências */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ocorrências e Observações Gerais
                </label>
                <textarea
                  {...register('ocorrencias')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Digite as ocorrências e observações gerais..."
                  disabled={isViewMode}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recebedor */}
                <Input
                  label="Recebedor"
                  {...register('recebedor')}
                  error={errors.recebedor?.message}
                  disabled={isViewMode}
                  placeholder="Nome do responsável pelo recebimento"
                />

                {/* Visto Responsável */}
                <Input
                  label="Visto Responsável"
                  {...register('visto_responsavel')}
                  error={errors.visto_responsavel?.message}
                  disabled={isViewMode}
                  placeholder="Nome do responsável técnico"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            {!isViewMode && (
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={saving || loading}
              >
                {saving ? 'Salvando...' : rir ? 'Atualizar' : 'Criar'}
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={onClose}
            >
              {isViewMode ? 'Fechar' : 'Cancelar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RelatorioInspecaoModal;
