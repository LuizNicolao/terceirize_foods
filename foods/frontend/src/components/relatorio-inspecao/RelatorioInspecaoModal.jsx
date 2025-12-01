import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaEye, FaEdit, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRelatorioInspecao } from '../../hooks/useRelatorioInspecao';
import RelatorioInspecaoService from '../../services/relatorioInspecao';
import { Button, Input, SearchableSelect, LoadingSpinner, Modal } from '../ui';
import ChecklistTable from './ChecklistTable';
import ProdutosTable from './ProdutosTable';

const RelatorioInspecaoModal = ({ isOpen, onClose, onSubmit, onSuccess, rir, viewMode, grupos, loading }) => {
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
    buscarNQAGrupo,
    handlePrintRIR
  } = useRelatorioInspecao();

  const [saving, setSaving] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const produtosTableRef = useRef(null);
  const [pedidoIdAtual, setPedidoIdAtual] = useState(null);
  const isSubmittingRef = useRef(false);

  // Resetar ref quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      isSubmittingRef.current = false;
      setSaving(false);
    }
  }, [isOpen]);

  // Definir loadInitialData primeiro
  const loadInitialData = useCallback(async () => {
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
  }, [buscarPedidosAprovados, buscarGrupos]);

  const loadRIRData = useCallback(async () => {
    try {
      const response = await buscarRIRPorId(rirId);
      if (response && response.success && response.data) {
        const data = response.data;
        
        // Preencher formulário com dados do RIR
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined && key !== 'produtos') {
            setValue(key, data[key]);
          }
        });
        
        // Salvar pedido_id atual se existir (pode vir de numero_pedido também)
        if (data.pedido_id) {
          setPedidoIdAtual(data.pedido_id);
          setValue('pedido_id', data.pedido_id.toString());
        } else if (data.numero_pedido && pedidos.length > 0) {
          // Tentar encontrar o pedido pelo número
          const pedido = pedidos.find(p => p.numero_pedido === data.numero_pedido);
          if (pedido) {
            setPedidoIdAtual(pedido.id);
            setValue('pedido_id', pedido.id.toString());
          }
        }
        
        // Processar produtos
        let produtosData = [];
        if (data.produtos && Array.isArray(data.produtos)) {
          produtosData = data.produtos;
        }
        setProdutos(produtosData);

        // Processar checklist - montar array a partir dos campos individuais
        if (data.tipo_transporte || data.isento_material || data.condicoes_caminhao || 
            data.acondicionamento || data.condicoes_embalagem) {
          setChecklist([{
            tipo_transporte: data.tipo_transporte || '',
            isento_material: data.isento_material || '',
            condicoes_caminhao: data.condicoes_caminhao || '',
            acondicionamento: data.acondicionamento || '',
            condicoes_embalagem: data.condicoes_embalagem || ''
          }]);
        } else {
          // Se não houver dados do checklist, inicializar com item vazio
          setChecklist([{
            tipo_transporte: '',
            isento_material: '',
            condicoes_caminhao: '',
            acondicionamento: '',
            condicoes_embalagem: ''
          }]);
        }
      } else {
        console.error('Resposta inválida ao buscar RIR:', response);
        toast.error('Erro ao carregar dados do relatório de inspeção');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do RIR:', error);
      toast.error('Erro ao carregar dados do relatório de inspeção');
    }
  }, [rirId, buscarRIRPorId, setValue, pedidos]);
  
  // Carregar dados quando modal abrir
  useEffect(() => {
    if (isOpen) {
      if (!isEditMode) {
        // Resetar formulário para novo relatório
        reset();
        setValue('data_inspecao', new Date().toISOString().split('T')[0]);
        setValue('hora_inspecao', new Date().toTimeString().slice(0, 5));
        setProdutos([]);
        // Inicializar checklist com um item vazio
        setChecklist([{
          tipo_transporte: '',
          isento_material: '',
          condicoes_caminhao: '',
          acondicionamento: '',
          condicoes_embalagem: ''
        }]);
      }
      // Sempre carregar dados iniciais (pedidos e grupos)
      loadInitialData();
    }
  }, [rirId, isEditMode, isOpen, setValue, reset, loadInitialData]);
  
  // Carregar dados do RIR quando pedidos forem carregados e estiver editando ou visualizando
  useEffect(() => {
    if (isOpen && (isEditMode || isViewMode) && rirId) {
      // Se já temos os dados completos no prop rir, usar diretamente
      if (rir && rir.id) {
        // Processar dados do prop rir diretamente
        const data = rir;
        
        // Preencher formulário com dados do RIR
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined && key !== 'produtos') {
            setValue(key, data[key]);
          }
        });
        
        // Processar pedido_id - tentar encontrar pelo numero_pedido se não tiver pedido_id
        if (data.pedido_id) {
          setPedidoIdAtual(data.pedido_id);
          setValue('pedido_id', data.pedido_id.toString());
        } else if (data.numero_pedido && pedidos.length > 0) {
          // Tentar encontrar o pedido pelo número
          const pedido = pedidos.find(p => p.numero_pedido === data.numero_pedido);
          if (pedido) {
            setPedidoIdAtual(pedido.id);
            setValue('pedido_id', pedido.id.toString());
          }
        }
        
        // Processar produtos
        let produtosData = [];
        if (data.produtos && Array.isArray(data.produtos)) {
          produtosData = data.produtos;
        }
        setProdutos(produtosData);

        // Processar checklist - montar array a partir dos campos individuais
        if (data.tipo_transporte || data.isento_material || data.condicoes_caminhao || 
            data.acondicionamento || data.condicoes_embalagem) {
          setChecklist([{
            tipo_transporte: data.tipo_transporte || '',
            isento_material: data.isento_material || '',
            condicoes_caminhao: data.condicoes_caminhao || '',
            acondicionamento: data.acondicionamento || '',
            condicoes_embalagem: data.condicoes_embalagem || ''
          }]);
        } else {
          // Se não houver dados do checklist, inicializar com item vazio
          setChecklist([{
            tipo_transporte: '',
            isento_material: '',
            condicoes_caminhao: '',
            acondicionamento: '',
            condicoes_embalagem: ''
          }]);
        }
      } else if (pedidos.length > 0 && !loadingPedidos) {
        // Se não temos dados completos, buscar da API
        loadRIRData();
      }
    }
  }, [isOpen, isEditMode, isViewMode, rirId, rir, pedidos.length, loadingPedidos, loadRIRData, setValue]);

  // Processar pedido quando pedidos forem carregados e tivermos numero_pedido mas não pedido_id
  // Funciona tanto em modo de edição quanto de visualização
  useEffect(() => {
    if (isOpen && (isEditMode || isViewMode) && pedidos.length > 0 && !loadingPedidos) {
      const numeroPedido = watch('numero_pedido');
      const pedidoIdAtual = watch('pedido_id');
      
      // Se temos numero_pedido mas não temos pedido_id preenchido no select
      if (numeroPedido && !pedidoIdAtual) {
        // Tentar encontrar o pedido pelo número
        const pedido = pedidos.find(p => p.numero_pedido === numeroPedido);
        if (pedido) {
          setPedidoIdAtual(pedido.id);
          setValue('pedido_id', pedido.id.toString());
        }
      }
    }
  }, [isOpen, isEditMode, isViewMode, pedidos, loadingPedidos, watch, setValue]);

  const handlePedidoChange = async (pedidoId) => {
    if (!pedidoId) {
      setValue('numero_pedido', '');
      setValue('fornecedor', '');
      setValue('cnpj_fornecedor', '');
      setProdutos([]);
      setPedidoIdAtual(null);
      return;
    }
    
    setPedidoIdAtual(pedidoId);

    const pedido = pedidos.find(p => p.id.toString() === pedidoId.toString());
    if (pedido) {
      setValue('numero_pedido', pedido.numero_pedido || '');
      setValue('fornecedor', pedido.fornecedor || '');
      setValue('cnpj_fornecedor', pedido.cnpj || '');
    }

    // Buscar produtos do pedido
    // Passar rirId se estiver editando para incluir itens já utilizados neste RIR
    const produtosResponse = await buscarProdutosPedido(pedidoId, isEditMode ? rirId : null);
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
            pedido_item_id: produto.id, // ID do item do pedido (pedido_compras_itens.id) - necessário para rastrear qual item foi usado
            codigo: produto.codigo_produto || '',
            descricao: produto.nome_produto || '',
            und: produto.unidade_medida || '',
            // Sempre usar quantidade_pedido (quantidade original do pedido) no campo qtde
            qtde: produto.quantidade_pedido || '',
            quantidade_pedido: produto.quantidade_pedido || '', // Quantidade original do pedido
            quantidade_disponivel: produto.quantidade_disponivel !== undefined ? produto.quantidade_disponivel : null, // Saldo disponível
            quantidade_lancada_notas: produto.quantidade_lancada_notas !== undefined ? produto.quantidade_lancada_notas : null, // Quantidade já lançada em notas
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
            resultado_final: '', // Vazio inicialmente - será calculado após preenchimento dos dados
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


  const handleRemoveProduto = (index) => {
    // Apenas remover da lista local - não deleta do pedido
    // O item continua disponível no pedido para outros relatórios
    setProdutos(produtos.filter((_, i) => i !== index));
  };

  const handleDesvincularSelecionados = (itemIds) => {
    if (itemIds.length === 0) {
      return;
    }

    if (!window.confirm(`Deseja realmente remover ${itemIds.length} produto(s) selecionado(s) deste relatório? O item continuará disponível no pedido para outros relatórios.`)) {
      return;
    }

    // Apenas remover da lista local - não deleta do pedido
    // Os itens continuam disponíveis no pedido para outros relatórios
    setProdutos(produtos.filter(p => !itemIds.includes(p.pedido_item_id)));
  };

  const handleFormSubmit = async (data) => {
    // Proteção contra duplo submit - verificar ANTES de qualquer validação
    if (saving || isSubmittingRef.current) {
      console.warn('Tentativa de duplo submit bloqueada');
      return;
    }

    // Marcar como submetendo IMEDIATAMENTE
    isSubmittingRef.current = true;
    setSaving(true);

    if (!data.numero_nota_fiscal || !data.fornecedor) {
      isSubmittingRef.current = false;
      setSaving(false);
      toast.error('Campos obrigatórios: Número da Nota Fiscal e Fornecedor');
      return;
    }

    // Validar campos obrigatórios do checklist
    if (checklist.length > 0) {
      const checklistInvalido = checklist.some(item => 
        !item.tipo_transporte || 
        !item.isento_material || 
        !item.condicoes_caminhao || 
        !item.acondicionamento || 
        !item.condicoes_embalagem
      );
      
      if (checklistInvalido) {
        isSubmittingRef.current = false;
        setSaving(false);
        toast.error('Por favor, preencha todos os campos obrigatórios do Check List de Avaliação Higiênico-Sanitária');
        return;
      }
    }

    // Validar campos obrigatórios dos produtos
    if (produtosTableRef.current && produtos.length > 0) {
      const isValid = produtosTableRef.current.validate();
      if (!isValid) {
        isSubmittingRef.current = false;
        setSaving(false);
        toast.error('Por favor, preencha todos os campos obrigatórios: Fabricação, Lote, Validade, Avaliação Sensorial e Temperatura (para produtos do grupo Frios) para todos os produtos');
        return;
      }
    }

    try {
      // Formatar hora para HH:MM:SS se estiver em HH:MM
      let horaInspecao = data.hora_inspecao || '';
      if (horaInspecao && horaInspecao.length === 5 && horaInspecao.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)) {
        horaInspecao = horaInspecao + ':00';
      }

      // Limpar campos temporários dos produtos (campos usados apenas no frontend)
      const produtosLimpos = produtos.map(produto => {
        const { _dividido, _indexOriginal, ...produtoLimpo } = produto;
        return produtoLimpo;
      });

      const formData = {
        ...data,
        hora_inspecao: horaInspecao,
        checklist_json: checklist,
        produtos: produtosLimpos
      };

      let response;
      if (isEditMode) {
        response = await atualizarRIR(rirId, formData);
      } else {
        response = await criarRIR(formData);
      }

      if (response.success) {
        // Toast já é exibido pelo hook criarRIR/atualizarRIR
        // Não exibir toast duplicado aqui
        
        // Fechar modal
        onClose();
        
        // Recarregar lista no componente pai
        if (onSuccess) {
          onSuccess();
        }
      } else {
        if (response.validationErrors) {
          // Exibir erros de validação específicos
          const errorMessages = Object.values(response.validationErrors).flat();
          if (errorMessages.length > 0) {
            toast.error(errorMessages[0] || 'Erros de validação encontrados');
          } else {
          toast.error('Erros de validação encontrados');
          }
        } else {
          toast.error(response.message || 'Erro ao salvar relatório');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar relatório');
    } finally {
      setSaving(false);
      isSubmittingRef.current = false;
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
          <div className="flex items-center gap-2">
            {isViewMode && rir && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrintRIR(rir)}
                className="flex items-center gap-2"
              >
                <FaPrint className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <FaTimes className="w-5 h-5" />
            </Button>
          </div>
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
                usePortal={false}
                />
              </div>

              {/* Fornecedor */}
              <Input
                label={<span>Fornecedor <span className="text-red-500">*</span></span>}
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
                label={<span>Nº Nota Fiscal <span className="text-red-500">*</span></span>}
                {...register('numero_nota_fiscal', {
                  required: 'Número da Nota Fiscal é obrigatório'
                })}
                error={errors.numero_nota_fiscal?.message}
                disabled={isViewMode}
                placeholder="Número da NF"
              />

              {/* Data Recebimento */}
              <Input
                label={<span>Data Recebimento <span className="text-red-500">*</span></span>}
                type="date"
                {...register('data_inspecao', {
                  required: 'Data de recebimento é obrigatória'
                })}
                error={errors.data_inspecao?.message}
                disabled={isViewMode}
              />

              {/* Hora Recebimento */}
              <Input
                label={<span>Hora Recebimento <span className="text-red-500">*</span></span>}
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
            viewMode={isViewMode}
          />

          {/* SEÇÃO C: Avaliação dos Produtos */}
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">C) Avaliação dos Produtos</h3>
            </div>
          <ProdutosTable
              ref={produtosTableRef}
            produtos={produtos}
            onChange={handleProdutosChange}
            onRemove={handleRemoveProduto}
            viewMode={isViewMode}
              pedidoIdAtual={pedidoIdAtual}
              onDesvincularSelecionados={handleDesvincularSelecionados}
          />
          </div>

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
