import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Button, Modal } from '../ui';
import PedidosComprasService from '../../services/pedidosComprasService';
import FormasPagamentoService from '../../services/formasPagamentoService';
import PrazosPagamentoService from '../../services/prazosPagamentoService';
import FornecedoresService from '../../services/fornecedores';
import PedidosComprasItensTable from './PedidosComprasItensTable';
import PedidosComprasFiliaisSelect from './PedidosComprasFiliaisSelect';
import PedidosComprasDadosSolicitacao from './PedidosComprasDadosSolicitacao';
import PedidosComprasFornecedorSection from './PedidosComprasFornecedorSection';
import PedidosComprasPagamentoSection from './PedidosComprasPagamentoSection';
import PedidosComprasSolicitacaoSelect from './PedidosComprasSolicitacaoSelect';
import FiliaisService from '../../services/filiais';
import toast from 'react-hot-toast';

const PedidosComprasModal = ({
  isOpen,
  onClose,
  onSubmit,
  pedidoCompras,
  viewMode,
  loading,
  solicitacoesDisponiveis = []
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  const [saving, setSaving] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [itensDisponiveis, setItensDisponiveis] = useState([]);
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [dadosFilial, setDadosFilial] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [prazosPagamento, setPrazosPagamento] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [filialMatriz, setFilialMatriz] = useState(null);
  const [dadosFilialFaturamento, setDadosFilialFaturamento] = useState(null);
  const [dadosFilialCobranca, setDadosFilialCobranca] = useState(null);
  const [dadosFilialEntrega, setDadosFilialEntrega] = useState(null);
  const [loadingItens, setLoadingItens] = useState(false);
  const [loadingDadosFilial, setLoadingDadosFilial] = useState(false);
  const [loadingFornecedores, setLoadingFornecedores] = useState(false);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [fornecedorSearchTerm, setFornecedorSearchTerm] = useState('');

  const solicitacaoId = watch('solicitacao_compras_id');
  const fornecedorId = watch('fornecedor_id');
  const filialCobrancaId = watch('filial_cobranca_id');
  const filialEntregaId = watch('filial_entrega_id');

  // Carregar dados auxiliares quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarFormasPagamento();
      carregarPrazosPagamento();
      carregarFiliais();
      // Não carregar todos os fornecedores inicialmente, apenas quando buscar
    }
  }, [isOpen]);

  // Buscar IDs de forma e prazo quando os dados estiverem carregados e houver pedido
  useEffect(() => {
    if (pedidoCompras && isOpen && formasPagamento.length > 0 && prazosPagamento.length > 0) {
      if (pedidoCompras.forma_pagamento) {
        buscarIdFormaPagamentoPorNome(pedidoCompras.forma_pagamento);
      }
      if (pedidoCompras.prazo_pagamento) {
        buscarIdPrazoPagamentoPorNome(pedidoCompras.prazo_pagamento);
      }
    }
  }, [pedidoCompras, isOpen, formasPagamento, prazosPagamento]);

  // Carregar itens quando solicitação for selecionada
  useEffect(() => {
    if (solicitacaoId && !pedidoCompras && isOpen) {
      carregarItensSolicitacao(solicitacaoId);
    }
  }, [solicitacaoId, pedidoCompras, isOpen]);

  // Carregar dados da filial de cobrança quando selecionada
  useEffect(() => {
    if (filialCobrancaId && isOpen) {
      carregarDadosFilialEspecifica(filialCobrancaId, 'cobranca');
    } else if (!filialCobrancaId) {
      setDadosFilialCobranca(null);
    }
  }, [filialCobrancaId, isOpen]);

  // Carregar dados da filial de entrega quando selecionada
  useEffect(() => {
    if (filialEntregaId && isOpen) {
      carregarDadosFilialEspecifica(filialEntregaId, 'entrega');
    } else if (!filialEntregaId) {
      setDadosFilialEntrega(null);
    }
  }, [filialEntregaId, isOpen]);

  // Auto-preenchimento de fornecedor e limpeza ao deselecionar
  useEffect(() => {
    if (fornecedorId && fornecedores.length > 0) {
      const fornecedor = fornecedores.find(f => f.id.toString() === fornecedorId.toString());
      if (fornecedor) {
        setValue('fornecedor_nome', fornecedor.razao_social || fornecedor.nome);
        setValue('fornecedor_cnpj', fornecedor.cnpj || '');
      }
    } else if (!fornecedorId) {
      // Limpar campos quando deselecionar fornecedor
      setValue('fornecedor_nome', '');
      setValue('fornecedor_cnpj', '');
    }
  }, [fornecedorId, fornecedores, setValue]);

  // Buscar fornecedores no backend quando digitar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fornecedorSearchTerm.trim().length >= 2) {
        buscarFornecedores(fornecedorSearchTerm);
      } else if (fornecedorSearchTerm.trim().length === 0) {
        setFornecedores([]);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [fornecedorSearchTerm]);

  // Carregar dados quando modal abrir com pedido existente
  useEffect(() => {
    if (pedidoCompras && isOpen) {
      // Preencher formulário
      Object.keys(pedidoCompras).forEach(key => {
        if (pedidoCompras[key] !== null && pedidoCompras[key] !== undefined && key !== 'itens') {
          setValue(key, pedidoCompras[key]);
        }
      });
      
      // Carregar fornecedor se existir (para exibir no dropdown)
      if (pedidoCompras.fornecedor_id) {
        buscarFornecedorPorId(pedidoCompras.fornecedor_id);
      }
      
      // Carregar itens se existirem
      if (pedidoCompras.itens && Array.isArray(pedidoCompras.itens)) {
        const itensComSelected = pedidoCompras.itens.map(item => ({
          ...item,
          selected: true,
          quantidade_pedido: item.quantidade_pedido || item.quantidade || 0
        }));
        setItensSelecionados(itensComSelected);
        setItensDisponiveis(itensComSelected);
      }

        // Carregar dados das filiais se houver
      if (pedidoCompras.filial_id) {
        carregarDadosFilial(pedidoCompras.filial_id);
      }
      if (pedidoCompras.filial_cobranca_id) {
        setValue('filial_cobranca_id', pedidoCompras.filial_cobranca_id);
        carregarDadosFilialEspecifica(pedidoCompras.filial_cobranca_id, 'cobranca');
      }
      if (pedidoCompras.filial_entrega_id) {
        setValue('filial_entrega_id', pedidoCompras.filial_entrega_id);
        carregarDadosFilialEspecifica(pedidoCompras.filial_entrega_id, 'entrega');
      }

      // Buscar IDs de forma e prazo de pagamento baseados nos nomes salvos
      if (pedidoCompras.forma_pagamento) {
        buscarIdFormaPagamentoPorNome(pedidoCompras.forma_pagamento);
      }
      if (pedidoCompras.prazo_pagamento) {
        buscarIdPrazoPagamentoPorNome(pedidoCompras.prazo_pagamento);
      }
    } else if (!pedidoCompras && isOpen) {
      reset();
      setItensDisponiveis([]);
      setItensSelecionados([]);
      setDadosFilial(null);
      setDadosFilialFaturamento(null);
      setDadosFilialCobranca(null);
      setDadosFilialEntrega(null);
      setSolicitacaoSelecionada(null);
      setFornecedores([]);
      setFornecedorSearchTerm('');
    }
  }, [pedidoCompras, isOpen, setValue, reset]);

  const carregarFormasPagamento = async () => {
    try {
      const response = await FormasPagamentoService.buscarAtivas();
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setFormasPagamento(items);
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  };

  const buscarIdFormaPagamentoPorNome = async (nome) => {
    if (!nome || !formasPagamento.length) return;
    
    const forma = formasPagamento.find(fp => 
      fp.nome && fp.nome.toLowerCase().trim() === nome.toLowerCase().trim()
    );
    
    if (forma) {
      setValue('forma_pagamento_id', forma.id);
    } else {
      // Se não encontrar, tentar buscar novamente
      await carregarFormasPagamento();
      // Aguardar um pouco e tentar novamente
      setTimeout(() => {
        const formaEncontrada = formasPagamento.find(fp => 
          fp.nome && fp.nome.toLowerCase().trim() === nome.toLowerCase().trim()
        );
        if (formaEncontrada) {
          setValue('forma_pagamento_id', formaEncontrada.id);
        }
      }, 500);
    }
  };

  const buscarIdPrazoPagamentoPorNome = async (nome) => {
    if (!nome || !prazosPagamento.length) return;
    
    const prazo = prazosPagamento.find(pp => 
      pp.nome && pp.nome.toLowerCase().trim() === nome.toLowerCase().trim()
    );
    
    if (prazo) {
      setValue('prazo_pagamento_id', prazo.id);
    } else {
      // Se não encontrar, tentar buscar novamente
      await carregarPrazosPagamento();
      // Aguardar um pouco e tentar novamente
      setTimeout(() => {
        const prazoEncontrado = prazosPagamento.find(pp => 
          pp.nome && pp.nome.toLowerCase().trim() === nome.toLowerCase().trim()
        );
        if (prazoEncontrado) {
          setValue('prazo_pagamento_id', prazoEncontrado.id);
        }
      }, 500);
    }
  };

  const carregarPrazosPagamento = async () => {
    try {
      const response = await PrazosPagamentoService.buscarAtivos();
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setPrazosPagamento(items);
      }
    } catch (error) {
      console.error('Erro ao carregar prazos de pagamento:', error);
    }
  };

  const carregarFiliais = async () => {
    setLoadingFiliais(true);
    try {
      const response = await FiliaisService.listar({ limit: 1000 });
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setFiliais(items);
        
        // Usar primeira filial como padrão para cobrança (substituindo lógica de matriz)
        if (items.length > 0) {
          const primeiraFilial = items[0];
          setFilialMatriz(primeiraFilial);
          // Pré-selecionar primeira filial para cobrança se não houver valor
          if (!pedidoCompras && !watch('filial_cobranca_id')) {
            setValue('filial_cobranca_id', primeiraFilial.id);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  };

  const buscarFornecedores = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setFornecedores([]);
      return;
    }

    setLoadingFornecedores(true);
    try {
      const response = await FornecedoresService.listar({ 
        search: searchTerm.trim(),
        status: 1, // Apenas ativos
        limit: 50 // Limitar resultados
      });
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setFornecedores(items);
      } else {
        setFornecedores([]);
      }
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      setFornecedores([]);
    } finally {
      setLoadingFornecedores(false);
    }
  };

  const buscarFornecedorPorId = async (id) => {
    if (!id) return;
    
    setLoadingFornecedores(true);
    try {
      const response = await FornecedoresService.buscarPorId(id);
      if (response.success && response.data) {
        setFornecedores([response.data]);
      }
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
    } finally {
      setLoadingFornecedores(false);
    }
  };

  const carregarItensSolicitacao = async (id) => {
    setLoadingItens(true);
    try {
      const response = await PedidosComprasService.buscarItensSolicitacao(id);
      if (response.success && response.data) {
        const { solicitacao, itens } = response.data;
        setSolicitacaoSelecionada(solicitacao);
        setItensDisponiveis(itens.map(item => ({ ...item, selected: false, quantidade_pedido: 0, valor_unitario: 0 })));
        setItensSelecionados([]);
        
        // Carregar dados da filial e pré-selecionar entrega
        if (solicitacao.filial_id) {
          carregarDadosFilial(solicitacao.filial_id);
          // Pré-selecionar filial de entrega com a filial da solicitação
          setValue('filial_entrega_id', solicitacao.filial_id);
          carregarDadosFilialEspecifica(solicitacao.filial_id, 'entrega');
        }
      } else {
        toast.error(response.error || 'Erro ao carregar itens da solicitação');
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens da solicitação');
    } finally {
      setLoadingItens(false);
    }
  };

  const carregarDadosFilial = async (id) => {
    setLoadingDadosFilial(true);
    try {
      const response = await PedidosComprasService.buscarDadosFilial(id);
      if (response.success && response.data) {
        setDadosFilial(response.data);
        setDadosFilialFaturamento(response.data); // Faturamento usa a mesma filial da solicitação
      }
    } catch (error) {
      console.error('Erro ao carregar dados da filial:', error);
    } finally {
      setLoadingDadosFilial(false);
    }
  };

  const carregarDadosFilialEspecifica = async (id, tipo) => {
    try {
      const response = await PedidosComprasService.buscarDadosFilial(id);
      if (response.success && response.data) {
        if (tipo === 'cobranca') {
          setDadosFilialCobranca(response.data);
        } else if (tipo === 'entrega') {
          setDadosFilialEntrega(response.data);
        }
      }
    } catch (error) {
      console.error(`Erro ao carregar dados da filial ${tipo}:`, error);
    }
  };

  const handleItemChange = (index, updatedItem) => {
    const newItens = [...itensDisponiveis];
    newItens[index] = updatedItem;
    setItensDisponiveis(newItens);
    
    // Atualizar itens selecionados
    const selected = newItens.filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0);
    setItensSelecionados(selected);
  };

  const handleRemoveItem = (index) => {
    const newItens = [...itensDisponiveis];
    newItens[index] = { ...newItens[index], selected: false, quantidade_pedido: 0 };
    setItensDisponiveis(newItens);
    setItensSelecionados(newItens.filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0));
  };

  const handleFormSubmit = async (data) => {
    // Validar se há itens selecionados
    if (!pedidoCompras && itensSelecionados.length === 0) {
      toast.error('Selecione pelo menos um item para criar o pedido');
      return;
    }

    // Validar se todos os itens selecionados têm valor unitário
    const itensSemValor = itensSelecionados.filter(item => 
      !item.valor_unitario || parseFloat(item.valor_unitario || 0) <= 0
    );
    if (itensSemValor.length > 0) {
      toast.error('Todos os itens selecionados devem ter um valor unitário preenchido');
      return;
    }

    setSaving(true);
    try {
      const formData = {
        solicitacao_compras_id: data.solicitacao_compras_id || pedidoCompras?.solicitacao_compras_id,
        fornecedor_id: data.fornecedor_id || null,
        fornecedor_nome: data.fornecedor_nome?.trim(),
        fornecedor_cnpj: data.fornecedor_cnpj || null,
        forma_pagamento_id: data.forma_pagamento_id || null,
        prazo_pagamento_id: data.prazo_pagamento_id || null,
        observacoes: data.observacoes || null,
        filial_cobranca_id: data.filial_cobranca_id || null,
        filial_entrega_id: data.filial_entrega_id || null,
        itens: pedidoCompras 
          ? (pedidoCompras.itens || [])
          : itensSelecionados.map(item => ({
              solicitacao_item_id: item.id,
              quantidade_pedido: parseFloat(item.quantidade_pedido || 0),
              valor_unitario: parseFloat(item.valor_unitario || 0)
            }))
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar pedido de compras:', error);
      toast.error('Erro ao salvar pedido de compras');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = viewMode === true;
  const itensParaExibir = pedidoCompras ? itensSelecionados : itensDisponiveis;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {isViewMode ? <FaEye className="w-5 h-5 text-white" /> : pedidoCompras ? <FaEdit className="w-5 h-5 text-white" /> : <FaPlus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isViewMode ? 'Visualizar Pedido de Compras' : pedidoCompras ? 'Editar Pedido de Compras' : 'Novo Pedido de Compras'}
              </h2>
              <p className="text-sm text-gray-600">
                {isViewMode 
                  ? 'Visualizando informações do pedido de compras' 
                  : pedidoCompras 
                    ? 'Editando informações do pedido de compras' 
                    : 'Preencha as informações do novo pedido de compras'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            disabled={saving}
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Solicitação de Compras */}
          <PedidosComprasSolicitacaoSelect
            solicitacoesDisponiveis={solicitacoesDisponiveis}
            watch={watch}
            setValue={setValue}
            errors={errors}
            isViewMode={isViewMode}
            pedidoCompras={pedidoCompras}
          />

          {/* Dados da Solicitação (readonly) */}
          <PedidosComprasDadosSolicitacao
            solicitacaoSelecionada={solicitacaoSelecionada}
          />

          {/* Dados das Filiais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PedidosComprasFiliaisSelect
              tipo="faturamento"
              filiais={filiais}
              filialSelecionada={solicitacaoSelecionada?.filial_id || null}
              dadosFilial={dadosFilialFaturamento}
              viewMode={isViewMode}
            />
            <PedidosComprasFiliaisSelect
              tipo="cobranca"
              filiais={filiais}
              filialSelecionada={watch('filial_cobranca_id')}
              onFilialChange={(id) => setValue('filial_cobranca_id', id)}
              dadosFilial={dadosFilialCobranca}
              viewMode={isViewMode}
              required
              error={errors.filial_cobranca_id?.message}
            />
            <PedidosComprasFiliaisSelect
              tipo="entrega"
              filiais={filiais}
              filialSelecionada={watch('filial_entrega_id') || solicitacaoSelecionada?.filial_id}
              onFilialChange={(id) => setValue('filial_entrega_id', id)}
              dadosFilial={dadosFilialEntrega || dadosFilial}
              viewMode={isViewMode}
              required
              error={errors.filial_entrega_id?.message}
            />
          </div>

          {/* Informações do Fornecedor */}
          <PedidosComprasFornecedorSection
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            fornecedores={fornecedores}
            loadingFornecedores={loadingFornecedores}
            fornecedorSearchTerm={fornecedorSearchTerm}
            setFornecedorSearchTerm={setFornecedorSearchTerm}
            setFornecedores={setFornecedores}
            isViewMode={isViewMode}
          />

          {/* Forma e Prazo de Pagamento */}
          <PedidosComprasPagamentoSection
            watch={watch}
            setValue={setValue}
            formasPagamento={formasPagamento}
            prazosPagamento={prazosPagamento}
            isViewMode={isViewMode}
          />

          {/* Itens do Pedido */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Itens do Pedido {!isViewMode && itensSelecionados.length > 0 && `(${itensSelecionados.length} selecionado(s))`}
            </h3>
            {loadingItens ? (
              <div className="p-8 text-center text-gray-500">
                <p>Carregando itens da solicitação...</p>
              </div>
            ) : (
              <PedidosComprasItensTable
                itens={itensParaExibir}
                onItemChange={handleItemChange}
                onRemoveItem={handleRemoveItem}
                viewMode={isViewMode}
                errors={errors}
              />
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              {...register('observacoes')}
              disabled={isViewMode}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Digite observações sobre o pedido"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              size="sm"
            >
              {isViewMode ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isViewMode && (
              <Button
                type="submit"
                disabled={saving || loading}
                loading={saving}
                size="sm"
              >
                <FaSave className="mr-2" />
                {pedidoCompras ? 'Atualizar' : 'Criar'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PedidosComprasModal;
