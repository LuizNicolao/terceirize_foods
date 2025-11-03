import React, { useState, useEffect, useCallback } from 'react';
import { FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRelatorioInspecao } from '../../hooks/useRelatorioInspecao';
import { Button, Input, SearchableSelect, LoadingSpinner } from '../../components/ui';
import ChecklistTable from '../../components/relatorio-inspecao/ChecklistTable';
import ProdutosTable from '../../components/relatorio-inspecao/ProdutosTable';

const RelatorioInspecaoForm = ({ rirId, onSuccess, onCancel }) => {
  const { canCreate, canEdit } = usePermissions();
  const isEditMode = !!rirId;

  const {
    rir,
    loading,
    grupos,
    buscarRIRPorId,
    criarRIR,
    atualizarRIR,
    buscarPedidosAprovados,
    buscarGrupos,
    buscarProdutosPedido
  } = useRelatorioInspecao();

  const [saving, setSaving] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    data_inspecao: new Date().toISOString().split('T')[0],
    hora_inspecao: new Date().toTimeString().slice(0, 5),
    numero_nota_fiscal: '',
    fornecedor: '',
    numero_pedido: '',
    cnpj_fornecedor: '',
    checklist_json: [],
    produtos_json: [],
    ocorrencias: '',
    recebedor: '',
    visto_responsavel: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (isEditMode && rirId) {
      loadRIRData();
    }
    loadInitialData();
  }, [rirId, isEditMode]);

  const loadRIRData = async () => {
    const data = await buscarRIRPorId(rirId);
    if (data) {
      setFormData({
        data_inspecao: data.data_inspecao || new Date().toISOString().split('T')[0],
        hora_inspecao: data.hora_inspecao || new Date().toTimeString().slice(0, 5),
        numero_nota_fiscal: data.numero_nota_fiscal || '',
        fornecedor: data.fornecedor || '',
        numero_pedido: data.numero_pedido || '',
        cnpj_fornecedor: data.cnpj_fornecedor || '',
        checklist_json: data.checklist_json || [],
        produtos_json: data.produtos_json || [],
        ocorrencias: data.ocorrencias || '',
        recebedor: data.recebedor || '',
        visto_responsavel: data.visto_responsavel || ''
      });
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePedidoChange = async (pedidoId) => {
    if (!pedidoId) {
      setFormData(prev => ({
        ...prev,
        numero_pedido: '',
        fornecedor: '',
        cnpj_fornecedor: '',
        produtos_json: []
      }));
      return;
    }

    const pedido = pedidos.find(p => p.id.toString() === pedidoId.toString());
    if (pedido) {
      setFormData(prev => ({
        ...prev,
        numero_pedido: pedido.numero_pedido || '',
        fornecedor: pedido.fornecedor || '',
        cnpj_fornecedor: pedido.cnpj || ''
      }));
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

      setFormData(prev => ({ ...prev, produtos_json: produtosMapeados }));
    }
  };

  const handleChecklistChange = (checklist) => {
    setFormData(prev => ({ ...prev, checklist_json: checklist }));
  };

  const handleProdutosChange = (produtos) => {
    setFormData(prev => ({ ...prev, produtos_json: produtos }));
  };

  const handleAddChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      checklist_json: [
        ...prev.checklist_json,
        {
          tipo_transporte: '',
          tipo_produto: '',
          isento_material: '',
          condicoes_caminhao: '',
          acondicionamento: '',
          condicoes_embalagem: ''
        }
      ]
    }));
  };

  const handleRemoveChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist_json: prev.checklist_json.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveProduto = (index) => {
    setFormData(prev => ({
      ...prev,
      produtos_json: prev.produtos_json.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.numero_nota_fiscal || !formData.fornecedor) {
      toast.error('Campos obrigatórios: Número da Nota Fiscal e Fornecedor');
      return;
    }

    setSaving(true);

    try {
      let response;
      if (isEditMode) {
        response = await atualizarRIR(rirId, formData);
      } else {
        response = await criarRIR(formData);
      }

      if (response.success) {
        toast.success(response.message || 'Relatório salvo com sucesso!');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        if (response.validationErrors) {
          // Erros de validação serão tratados pelo componente
          toast.error('Erros de validação encontrados');
        } else {
          toast.error(response.error || 'Erro ao salvar relatório');
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

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO A: Dados do Pedido */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">A) Dados do Pedido</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pedido de Compra
              </label>
              <SearchableSelect
                value={formData.pedido_id || ''}
                onChange={handlePedidoChange}
                options={getPedidoOptions()}
                placeholder="Selecione o pedido..."
                disabled={loadingPedidos}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.fornecedor}
                onChange={(e) => handleInputChange('fornecedor', e.target.value)}
                placeholder="Razão Social do fornecedor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ Fornecedor
              </label>
              <Input
                type="text"
                value={formData.cnpj_fornecedor}
                onChange={(e) => handleInputChange('cnpj_fornecedor', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nº Nota Fiscal <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.numero_nota_fiscal}
                onChange={(e) => handleInputChange('numero_nota_fiscal', e.target.value)}
                placeholder="Número da NF"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Recebimento <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.data_inspecao}
                onChange={(e) => handleInputChange('data_inspecao', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Recebimento <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={formData.hora_inspecao}
                onChange={(e) => handleInputChange('hora_inspecao', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO B: Check List Higiênico-Sanitário */}
        <ChecklistTable
          checklist={formData.checklist_json}
          grupos={grupos || []}
          onChange={handleChecklistChange}
          onAdd={handleAddChecklistItem}
          onRemove={handleRemoveChecklistItem}
        />

        {/* SEÇÃO C: Avaliação dos Produtos */}
        <ProdutosTable
          produtos={formData.produtos_json}
          onChange={handleProdutosChange}
          onRemove={handleRemoveProduto}
        />

        {/* SEÇÃO D: Ocorrências e Responsáveis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">D) Ocorrências e Responsáveis</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ocorrências e Observações Gerais
              </label>
              <textarea
                value={formData.ocorrencias}
                onChange={(e) => handleInputChange('ocorrencias', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Digite as ocorrências e observações gerais..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recebedor
                </label>
                <Input
                  type="text"
                  value={formData.recebedor}
                  onChange={(e) => handleInputChange('recebedor', e.target.value)}
                  placeholder="Nome do responsável pelo recebimento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visto Responsável
                </label>
                <Input
                  type="text"
                  value={formData.visto_responsavel}
                  onChange={(e) => handleInputChange('visto_responsavel', e.target.value)}
                  placeholder="Nome do responsável técnico"
                />
              </div>
            </div>
          </div>
        </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            size="sm"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving || (!canCreate('relatorio_inspecao') && !isEditMode) || (!canEdit('relatorio_inspecao') && isEditMode)}
          loading={saving}
          size="sm"
        >
          <FaSave className="mr-2" />
          {saving ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Criar')}
        </Button>
      </div>
      </form>
    </div>
  );
};

export default RelatorioInspecaoForm;

