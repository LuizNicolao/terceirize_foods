/**
 * Hook customizado para gerenciar estado e lógica do modal de Pedidos de Compras
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PedidosComprasService from '../services/pedidosComprasService';
import FormasPagamentoService from '../services/formasPagamentoService';
import PrazosPagamentoService from '../services/prazosPagamentoService';
import FornecedoresService from '../services/fornecedores';
import FiliaisService from '../services/filiais';
import produtoGenericoService from '../services/produtoGenerico';
import api from '../services/api';

export const usePedidosComprasModal = ({ pedidoCompras, isOpen, solicitacoesDisponiveis = [] }) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  
  // Estados
  const [saving, setSaving] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [itensDisponiveis, setItensDisponiveis] = useState([]);
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [itensDisponiveisParaAdicionar, setItensDisponiveisParaAdicionar] = useState([]);
  const [loadingItensDisponiveis, setLoadingItensDisponiveis] = useState(false);
  const [dadosFilial, setDadosFilial] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [prazosPagamento, setPrazosPagamento] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [filialMatriz, setFilialMatriz] = useState(null);
  const [produtosGenericos, setProdutosGenericos] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [dadosFilialFaturamento, setDadosFilialFaturamento] = useState(null);
  const [dadosFilialCobranca, setDadosFilialCobranca] = useState(null);
  const [dadosFilialEntrega, setDadosFilialEntrega] = useState(null);
  const [loadingItens, setLoadingItens] = useState(false);
  const [loadingDadosFilial, setLoadingDadosFilial] = useState(false);
  const [loadingFornecedores, setLoadingFornecedores] = useState(false);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [fornecedorSearchTerm, setFornecedorSearchTerm] = useState('');
  
  // Refs para evitar loops infinitos
  const carregandoItensRef = useRef(false);
  const solicitacaoIdAnteriorRef = useRef(null);

  // Valores observados do formulário
  const solicitacaoId = watch('solicitacao_compras_id');
  const fornecedorId = watch('fornecedor_id');
  const filialFaturamentoId = watch('filial_faturamento_id');
  const filialCobrancaId = watch('filial_cobranca_id');
  const filialEntregaId = watch('filial_entrega_id');

  // Funções de carregamento
  const carregarFormasPagamento = useCallback(async () => {
    try {
      const response = await FormasPagamentoService.buscarAtivas();
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setFormasPagamento(items);
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  }, []);

  const carregarPrazosPagamento = useCallback(async () => {
    try {
      const response = await PrazosPagamentoService.buscarAtivos();
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setPrazosPagamento(items);
      }
    } catch (error) {
      console.error('Erro ao carregar prazos de pagamento:', error);
    }
  }, []);

  const carregarDadosFilialEspecifica = useCallback(async (id, tipo) => {
    try {
      const response = await PedidosComprasService.buscarDadosFilial(id);
      if (response.success && response.data) {
        if (tipo === 'faturamento') {
          setDadosFilialFaturamento(response.data);
        } else if (tipo === 'cobranca') {
          setDadosFilialCobranca(response.data);
        } else if (tipo === 'entrega') {
          setDadosFilialEntrega(response.data);
        }
        return response.data;
      }
    } catch (error) {
      console.error(`Erro ao carregar dados da filial ${tipo}:`, error);
    }
    return null;
  }, []);

  const carregarFiliais = useCallback(async () => {
    setLoadingFiliais(true);
    try {
      const response = await FiliaisService.listar({ limit: 1000 });
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        setFiliais(items);
        
        // Buscar filial MATRIZ (MTZ)
        const filialMatriz = items.find(filial => 
          filial.codigo_filial?.toUpperCase() === 'MTZ' ||
          filial.filial?.toUpperCase().includes('MATRIZ') ||
          filial.nome?.toUpperCase().includes('MATRIZ')
        );
        
        if (filialMatriz) {
          setFilialMatriz(filialMatriz);
          // Pré-selecionar MATRIZ para cobrança se não houver valor e não estiver editando
          if (!pedidoCompras && !watch('filial_cobranca_id')) {
            setValue('filial_cobranca_id', filialMatriz.id);
            carregarDadosFilialEspecifica(filialMatriz.id, 'cobranca');
          }
        } else if (items.length > 0) {
          // Fallback: usar primeira filial se não encontrar MATRIZ
          const primeiraFilial = items[0];
          setFilialMatriz(primeiraFilial);
          if (!pedidoCompras && !watch('filial_cobranca_id')) {
            setValue('filial_cobranca_id', primeiraFilial.id);
            carregarDadosFilialEspecifica(primeiraFilial.id, 'cobranca');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  }, [pedidoCompras, setValue, watch, carregarDadosFilialEspecifica]);

  const buscarIdFormaPagamentoPorNome = useCallback(async (nome) => {
    if (!nome) return;
    
    if (formasPagamento.length === 0) {
      await carregarFormasPagamento();
    }
    
    const buscarForma = async () => {
      const response = await FormasPagamentoService.buscarAtivas();
      
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        const forma = items.find(fp => 
          fp.nome && fp.nome.toLowerCase().trim() === nome.toLowerCase().trim()
        );
        
        if (forma) {
          setValue('forma_pagamento_id', forma.id);
        }
      }
    };
    
    await buscarForma();
    setTimeout(async () => {
      await buscarForma();
    }, 500);
  }, [formasPagamento.length, carregarFormasPagamento, setValue]);

  const buscarIdPrazoPagamentoPorNome = useCallback(async (nome) => {
    if (!nome) return;
    
    if (prazosPagamento.length === 0) {
      await carregarPrazosPagamento();
    }
    
    const buscarPrazo = async () => {
      const response = await PrazosPagamentoService.buscarAtivos();
      
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        const prazo = items.find(pp => 
          pp.nome && pp.nome.toLowerCase().trim() === nome.toLowerCase().trim()
        );
        
        if (prazo) {
          setValue('prazo_pagamento_id', prazo.id);
        }
      }
    };
    
    await buscarPrazo();
    setTimeout(async () => {
      await buscarPrazo();
    }, 500);
  }, [prazosPagamento.length, carregarPrazosPagamento, setValue]);

  const buscarFornecedores = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setFornecedores([]);
      return;
    }

    setLoadingFornecedores(true);
    try {
      const response = await FornecedoresService.listar({ 
        search: searchTerm.trim(),
        status: 1,
        limit: 50
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
  }, []);

  const buscarFornecedorPorId = useCallback(async (id) => {
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
  }, []);

  const carregarDadosFilial = useCallback(async (id) => {
    setLoadingDadosFilial(true);
    try {
      const response = await PedidosComprasService.buscarDadosFilial(id);
      if (response.success && response.data) {
        setDadosFilial(response.data);
        setDadosFilialFaturamento(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da filial:', error);
    } finally {
      setLoadingDadosFilial(false);
    }
  }, []);

  const carregarItensSolicitacao = useCallback(async (id, pedidoExistente = null) => {
    setLoadingItens(true);
    try {
      const response = await PedidosComprasService.buscarItensSolicitacao(id);
      
      if (response.success && response.data) {
        const { solicitacao, itens } = response.data;
        setSolicitacaoSelecionada(solicitacao);
        
        if (!pedidoExistente) {
          setItensDisponiveis(itens.map(item => ({ ...item, selected: false, quantidade_pedido: 0, valor_unitario: 0 })));
          setItensSelecionados([]);
        } else {
          // Quando há pedido existente, mapear itens do pedido com itens da solicitação
          const itensDisponiveisNovos = itens.map(item => {
            // Procurar item no pedido por solicitacao_item_id ou id
            const itemNoPedido = pedidoExistente.itens?.find(pi => {
              const match1 = pi.solicitacao_item_id === item.id;
              const match2 = pi.id === item.id;
              const match3 = pi.produto_generico_id && pi.produto_generico_id === item.produto_id;
              return match1 || match2 || match3;
            });
            
            if (itemNoPedido) {
              return {
                ...item,
                id: item.id, // Garantir que o id da solicitação seja mantido
                selected: true,
                quantidade_pedido: itemNoPedido.quantidade_pedido || itemNoPedido.quantidade || item.quantidade || 0,
                valor_unitario: itemNoPedido.valor_unitario || 0
              };
            }
            return { ...item, selected: false, quantidade_pedido: 0, valor_unitario: 0 };
          });
          
          const itensSelecionadosCount = itensDisponiveisNovos.filter(i => i.selected).length;
          
          // Se não encontrou itens mapeados, usar diretamente os itens do pedido
          if (pedidoExistente.itens && pedidoExistente.itens.length > 0 && itensSelecionadosCount === 0) {
            const itensDoPedido = pedidoExistente.itens.map(itemPedido => ({
              ...itemPedido,
              id: itemPedido.solicitacao_item_id || itemPedido.id,
              selected: true,
              quantidade_pedido: itemPedido.quantidade_pedido || itemPedido.quantidade || 0,
              valor_unitario: itemPedido.valor_unitario || 0
            }));
            setItensDisponiveis(itensDoPedido);
            setItensSelecionados(itensDoPedido);
          } else {
            setItensDisponiveis(itensDisponiveisNovos);
            setItensSelecionados(itensDisponiveisNovos.filter(item => item.selected));
          }
        }
        
        if (!pedidoExistente && solicitacao.filial_id) {
          carregarDadosFilial(solicitacao.filial_id);
          setValue('filial_entrega_id', solicitacao.filial_id);
          carregarDadosFilialEspecifica(solicitacao.filial_id, 'entrega');
          if (!watch('filial_faturamento_id')) {
            setValue('filial_faturamento_id', solicitacao.filial_id);
            carregarDadosFilialEspecifica(solicitacao.filial_id, 'faturamento');
          }
        }
      } else {
        toast.error(response.error || 'Erro ao carregar itens da solicitação');
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens da solicitação');
    } finally {
      setLoadingItens(false);
      carregandoItensRef.current = false;
    }
  }, [setValue, watch, carregarDadosFilial, carregarDadosFilialEspecifica]);

  // Handlers
  const handleItemChange = useCallback((index, updatedItem) => {
    const newItens = [...itensDisponiveis];
    
    // Se mudou produto genérico, buscar informações
    if (updatedItem.produto_id && updatedItem.isNewProduct) {
      const produto = produtosGenericos.find(p => p.id === parseInt(updatedItem.produto_id));
      if (produto) {
        updatedItem.produto_nome = produto.nome;
        updatedItem.codigo_produto = produto.codigo || produto.codigo_produto || '';
        updatedItem.unidade_medida_id = produto.unidade_medida_id || '';
        
        // Buscar unidade
        if (produto.unidade_medida_id) {
          const unidade = unidadesMedida.find(u => u.id === produto.unidade_medida_id);
          if (unidade) {
            updatedItem.unidade_simbolo = unidade.sigla || unidade.simbolo || '';
            updatedItem.unidade_medida = unidade.nome || unidade.sigla || unidade.simbolo || '';
          }
        }
      }
    }
    
    newItens[index] = updatedItem;
    setItensDisponiveis(newItens);
    
    const selected = newItens.filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0);
    setItensSelecionados(selected);
  }, [itensDisponiveis, produtosGenericos, unidadesMedida]);

  const handleRemoveItem = useCallback((index) => {
    const newItens = [...itensDisponiveis];
    newItens[index] = { ...newItens[index], selected: false, quantidade_pedido: 0 };
    setItensDisponiveis(newItens);
    setItensSelecionados(newItens.filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0));
  }, [itensDisponiveis]);

  // Carregar itens disponíveis para adicionar (apenas durante edição)
  const carregarItensDisponiveisParaAdicionar = useCallback(async (solicitacaoId, pedidoId) => {
    if (!solicitacaoId || !pedidoId) {
      setItensDisponiveisParaAdicionar([]);
      return;
    }

    setLoadingItensDisponiveis(true);
    try {
      const response = await PedidosComprasService.buscarItensDisponiveis(solicitacaoId, pedidoId);
      
      if (response.success && response.data) {
        setItensDisponiveisParaAdicionar(response.data);
      } else {
        setItensDisponiveisParaAdicionar([]);
        toast.error(response.error || 'Erro ao carregar itens disponíveis');
      }
    } catch (error) {
      console.error('Erro ao carregar itens disponíveis:', error);
      setItensDisponiveisParaAdicionar([]);
      toast.error('Erro ao carregar itens disponíveis');
    } finally {
      setLoadingItensDisponiveis(false);
    }
  }, []);

  // Adicionar item ao pedido (da lista de disponíveis)
  const handleAdicionarItem = useCallback((novoItem) => {
    // Adicionar ao array de itens disponíveis
    const novosItensDisponiveis = [...itensDisponiveis, novoItem];
    setItensDisponiveis(novosItensDisponiveis);
    
    // Adicionar aos itens selecionados
    const novosItensSelecionados = [...itensSelecionados, novoItem];
    setItensSelecionados(novosItensSelecionados);
    
    // Remover dos itens disponíveis para adicionar
    setItensDisponiveisParaAdicionar(prev => 
      prev.filter(item => item.id !== novoItem.id)
    );
    
    toast.success('Item adicionado ao pedido!');
  }, [itensDisponiveis, itensSelecionados]);

  // Adicionar nova linha vazia para produto genérico
  const handleAddNewItem = useCallback(() => {
    const novoItem = {
      id: `new-${Date.now()}`, // ID temporário
      produto_id: '',
      produto_nome: '',
      codigo_produto: '',
      unidade_medida_id: '',
      unidade_simbolo: '',
      unidade_medida: '',
      quantidade_solicitada: 0,
      quantidade_utilizada: 0,
      saldo_disponivel: 0, // Permitir adicionar qualquer quantidade quando for produto novo
      quantidade_pedido: 0,
      valor_unitario: 0,
      selected: true,
      isNewProduct: true // Flag para identificar que é um produto novo
    };
    
    const novosItensDisponiveis = [...itensDisponiveis, novoItem];
    setItensDisponiveis(novosItensDisponiveis);
    setItensSelecionados(novosItensDisponiveis.filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0));
  }, [itensDisponiveis]);

  // Efeitos
  useEffect(() => {
    if (isOpen) {
      carregarFormasPagamento();
      carregarPrazosPagamento();
      carregarFiliais();
      carregarProdutosGenericos();
      carregarUnidadesMedida();
    }
  }, [isOpen, carregarFormasPagamento, carregarPrazosPagamento, carregarFiliais, carregarProdutosGenericos, carregarUnidadesMedida]);

  useEffect(() => {
    if (pedidoCompras && isOpen && formasPagamento.length > 0 && prazosPagamento.length > 0) {
      // Aguardar um pouco para garantir que as listas foram carregadas
      const timeoutId = setTimeout(() => {
        if (pedidoCompras.forma_pagamento) {
          buscarIdFormaPagamentoPorNome(pedidoCompras.forma_pagamento);
        }
        if (pedidoCompras.prazo_pagamento) {
          buscarIdPrazoPagamentoPorNome(pedidoCompras.prazo_pagamento);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [pedidoCompras, isOpen, formasPagamento.length, prazosPagamento.length, buscarIdFormaPagamentoPorNome, buscarIdPrazoPagamentoPorNome]);

  useEffect(() => {
    if (solicitacaoId && 
        solicitacaoId !== solicitacaoIdAnteriorRef.current && 
        !pedidoCompras && 
        isOpen && 
        !carregandoItensRef.current) {
      carregandoItensRef.current = true;
      solicitacaoIdAnteriorRef.current = solicitacaoId;
      carregarItensSolicitacao(solicitacaoId);
    } else if (!solicitacaoId) {
      solicitacaoIdAnteriorRef.current = null;
      carregandoItensRef.current = false;
    }
  }, [solicitacaoId, pedidoCompras, isOpen, carregarItensSolicitacao]);

  useEffect(() => {
    if (filialFaturamentoId && isOpen) {
      carregarDadosFilialEspecifica(filialFaturamentoId, 'faturamento');
    } else if (!filialFaturamentoId) {
      setDadosFilialFaturamento(null);
    }
  }, [filialFaturamentoId, isOpen, carregarDadosFilialEspecifica]);

  useEffect(() => {
    if (filialCobrancaId && isOpen) {
      carregarDadosFilialEspecifica(filialCobrancaId, 'cobranca');
    } else if (!filialCobrancaId) {
      setDadosFilialCobranca(null);
    }
  }, [filialCobrancaId, isOpen, carregarDadosFilialEspecifica]);

  useEffect(() => {
    if (filialEntregaId && isOpen) {
      carregarDadosFilialEspecifica(filialEntregaId, 'entrega');
    } else if (!filialEntregaId) {
      setDadosFilialEntrega(null);
    }
  }, [filialEntregaId, isOpen, carregarDadosFilialEspecifica]);

  useEffect(() => {
    if (fornecedorId && fornecedores.length > 0) {
      const fornecedor = fornecedores.find(f => f.id.toString() === fornecedorId.toString());
      if (fornecedor) {
        setValue('fornecedor_nome', fornecedor.razao_social || fornecedor.nome);
        setValue('fornecedor_cnpj', fornecedor.cnpj || '');
      }
    } else if (!fornecedorId) {
      setValue('fornecedor_nome', '');
      setValue('fornecedor_cnpj', '');
    }
  }, [fornecedorId, fornecedores, setValue]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fornecedorSearchTerm.trim().length >= 2) {
        buscarFornecedores(fornecedorSearchTerm);
      } else if (fornecedorSearchTerm.trim().length === 0) {
        setFornecedores([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fornecedorSearchTerm, buscarFornecedores]);

  useEffect(() => {
    if (pedidoCompras && isOpen) {
      const carregarDados = async () => {
        // Preencher formulário
        if (pedidoCompras.solicitacao_compras_id) {
          setValue('solicitacao_compras_id', pedidoCompras.solicitacao_compras_id);
        }
        if (pedidoCompras.fornecedor_id) {
          setValue('fornecedor_id', pedidoCompras.fornecedor_id);
        }
        if (pedidoCompras.fornecedor_nome) {
          setValue('fornecedor_nome', pedidoCompras.fornecedor_nome);
        }
        if (pedidoCompras.fornecedor_cnpj) {
          setValue('fornecedor_cnpj', pedidoCompras.fornecedor_cnpj);
        }
        if (pedidoCompras.filial_faturamento_id) {
          setValue('filial_faturamento_id', pedidoCompras.filial_faturamento_id);
        }
        if (pedidoCompras.filial_cobranca_id) {
          setValue('filial_cobranca_id', pedidoCompras.filial_cobranca_id);
        }
        if (pedidoCompras.filial_entrega_id) {
          setValue('filial_entrega_id', pedidoCompras.filial_entrega_id);
        }
        if (pedidoCompras.observacoes) {
          setValue('observacoes', pedidoCompras.observacoes);
        }
        if (pedidoCompras.status) {
          setValue('status', pedidoCompras.status);
        }
        
        // Carregar fornecedor
        if (pedidoCompras.fornecedor_id) {
          buscarFornecedorPorId(pedidoCompras.fornecedor_id);
        }
        
        // Carregar filiais
        if (pedidoCompras.filial_faturamento_id) {
          await carregarDadosFilialEspecifica(pedidoCompras.filial_faturamento_id, 'faturamento');
        } else if (pedidoCompras.filial_id) {
          await carregarDadosFilialEspecifica(pedidoCompras.filial_id, 'faturamento');
        }
        
        if (pedidoCompras.filial_cobranca_id) {
          await carregarDadosFilialEspecifica(pedidoCompras.filial_cobranca_id, 'cobranca');
        }
        
        if (pedidoCompras.filial_entrega_id) {
          await carregarDadosFilialEspecifica(pedidoCompras.filial_entrega_id, 'entrega');
        }
        
        // Carregar itens - sempre tentar carregar da solicitação primeiro
        if (pedidoCompras.solicitacao_compras_id) {
          await carregarItensSolicitacao(pedidoCompras.solicitacao_compras_id, pedidoCompras);
          // Carregar itens disponíveis para adicionar (apenas durante edição)
          await carregarItensDisponiveisParaAdicionar(pedidoCompras.solicitacao_compras_id, pedidoCompras.id);
        } else if (pedidoCompras.itens && Array.isArray(pedidoCompras.itens) && pedidoCompras.itens.length > 0) {
          // Se não tem solicitação mas tem itens, usar itens diretamente
          const itensComSelected = pedidoCompras.itens.map(item => ({
            ...item,
            id: item.solicitacao_item_id || item.id,
            selected: true,
            quantidade_pedido: item.quantidade_pedido || item.quantidade || 0,
            valor_unitario: item.valor_unitario || 0
          }));
          setItensSelecionados(itensComSelected);
          setItensDisponiveis(itensComSelected);
        }

        // Aguardar carregamento de formas e prazos antes de buscar IDs
        if (formasPagamento.length === 0) {
          await carregarFormasPagamento();
        }
        if (prazosPagamento.length === 0) {
          await carregarPrazosPagamento();
        }
        
        // Aguardar um pouco e buscar IDs
        setTimeout(() => {
          if (pedidoCompras.forma_pagamento) {
            buscarIdFormaPagamentoPorNome(pedidoCompras.forma_pagamento);
          }
          if (pedidoCompras.prazo_pagamento) {
            buscarIdPrazoPagamentoPorNome(pedidoCompras.prazo_pagamento);
          }
        }, 300);
      };

      carregarDados();
    } else if (!pedidoCompras && isOpen) {
      reset();
      setItensDisponiveis([]);
      setItensSelecionados([]);
      setItensDisponiveisParaAdicionar([]);
      setDadosFilial(null);
      setDadosFilialFaturamento(null);
      setDadosFilialCobranca(null);
      setDadosFilialEntrega(null);
      setSolicitacaoSelecionada(null);
      setFornecedores([]);
      setFornecedorSearchTerm('');
      setValue('forma_pagamento_id', '');
      setValue('prazo_pagamento_id', '');
      setValue('fornecedor_id', '');
      setValue('filial_faturamento_id', '');
      setValue('filial_cobranca_id', '');
      setValue('filial_entrega_id', '');
    }
  }, [pedidoCompras, isOpen, setValue, reset, buscarFornecedorPorId, carregarItensSolicitacao, carregarDadosFilialEspecifica, buscarIdFormaPagamentoPorNome, buscarIdPrazoPagamentoPorNome, formasPagamento.length, prazosPagamento.length, carregarFormasPagamento, carregarPrazosPagamento, carregarItensDisponiveisParaAdicionar]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setItensDisponiveis([]);
      setItensSelecionados([]);
      setItensDisponiveisParaAdicionar([]);
      setDadosFilial(null);
      setDadosFilialFaturamento(null);
      setDadosFilialCobranca(null);
      setDadosFilialEntrega(null);
      setSolicitacaoSelecionada(null);
      setFornecedores([]);
      setFornecedorSearchTerm('');
      setFilialMatriz(null);
      carregandoItensRef.current = false;
      solicitacaoIdAnteriorRef.current = null;
    }
  }, [isOpen, reset]);

  return {
    // Form
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    reset,
    
    // Estados
    saving,
    setSaving,
    solicitacaoSelecionada,
    itensDisponiveis,
    itensSelecionados,
    dadosFilial,
    formasPagamento,
    prazosPagamento,
    fornecedores,
    filiais,
    dadosFilialFaturamento,
    dadosFilialCobranca,
    dadosFilialEntrega,
    loadingItens,
    loadingDadosFilial,
    loadingFornecedores,
    loadingFiliais,
    fornecedorSearchTerm,
    
    // Setters
    setFornecedorSearchTerm,
    setFornecedores,
    
    // Handlers
    handleItemChange,
    handleRemoveItem,
    handleAdicionarItem,
    handleAddNewItem,
    
    // Dados auxiliares
    produtosGenericos,
    unidadesMedida,
    
    // Itens disponíveis para adicionar (apenas durante edição)
    itensDisponiveisParaAdicionar,
    loadingItensDisponiveis,
    
    // Valores observados
    solicitacaoId,
    fornecedorId,
    filialFaturamentoId,
    filialCobrancaId,
    filialEntregaId
  };
};

