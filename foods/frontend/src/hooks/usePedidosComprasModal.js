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

export const usePedidosComprasModal = ({ pedidoCompras, isOpen, solicitacoesDisponiveis = [] }) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  
  // Estados
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
  }, [pedidoCompras, setValue, watch]);

  const buscarIdFormaPagamentoPorNome = useCallback(async (nome) => {
    if (!nome) {
      console.log('⚠️ [FORMA PAGAMENTO] Nome não fornecido');
      return;
    }
    
    console.log('🔵 [FORMA PAGAMENTO] Buscando ID por nome:', nome);
    console.log('📦 [FORMA PAGAMENTO] Formas disponíveis:', formasPagamento.length);
    
    if (formasPagamento.length === 0) {
      console.log('⚠️ [FORMA PAGAMENTO] Carregando formas...');
      await carregarFormasPagamento();
    }
    
    const buscarForma = async () => {
      console.log('🔵 [FORMA PAGAMENTO] Buscando na API...');
      const response = await FormasPagamentoService.buscarAtivas();
      console.log('📦 [FORMA PAGAMENTO] Resposta da API:', response);
      
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        console.log('📦 [FORMA PAGAMENTO] Itens encontrados:', items.length);
        console.log('📦 [FORMA PAGAMENTO] Itens:', items.map(i => ({ id: i.id, nome: i.nome })));
        
        const forma = items.find(fp => {
          const match = fp.nome && fp.nome.toLowerCase().trim() === nome.toLowerCase().trim();
          if (match) {
            console.log('✅ [FORMA PAGAMENTO] Match encontrado:', fp);
          }
          return match;
        });
        
        if (forma) {
          console.log('✅ [FORMA PAGAMENTO] Forma encontrada, setando ID:', forma.id);
          setValue('forma_pagamento_id', forma.id);
        } else {
          console.log('❌ [FORMA PAGAMENTO] Forma não encontrada para:', nome);
          console.log('📦 [FORMA PAGAMENTO] Nomes disponíveis:', items.map(i => i.nome));
        }
      }
    };
    
    await buscarForma();
    setTimeout(async () => {
      await buscarForma();
    }, 500);
  }, [formasPagamento.length, carregarFormasPagamento, setValue]);

  const buscarIdPrazoPagamentoPorNome = useCallback(async (nome) => {
    if (!nome) {
      console.log('⚠️ [PRAZO PAGAMENTO] Nome não fornecido');
      return;
    }
    
    console.log('🔵 [PRAZO PAGAMENTO] Buscando ID por nome:', nome);
    console.log('📦 [PRAZO PAGAMENTO] Prazos disponíveis:', prazosPagamento.length);
    
    if (prazosPagamento.length === 0) {
      console.log('⚠️ [PRAZO PAGAMENTO] Carregando prazos...');
      await carregarPrazosPagamento();
    }
    
    const buscarPrazo = async () => {
      console.log('🔵 [PRAZO PAGAMENTO] Buscando na API...');
      const response = await PrazosPagamentoService.buscarAtivos();
      console.log('📦 [PRAZO PAGAMENTO] Resposta da API:', response);
      
      if (response.success && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];
        console.log('📦 [PRAZO PAGAMENTO] Itens encontrados:', items.length);
        console.log('📦 [PRAZO PAGAMENTO] Itens:', items.map(i => ({ id: i.id, nome: i.nome })));
        
        const prazo = items.find(pp => {
          const match = pp.nome && pp.nome.toLowerCase().trim() === nome.toLowerCase().trim();
          if (match) {
            console.log('✅ [PRAZO PAGAMENTO] Match encontrado:', pp);
          }
          return match;
        });
        
        if (prazo) {
          console.log('✅ [PRAZO PAGAMENTO] Prazo encontrado, setando ID:', prazo.id);
          setValue('prazo_pagamento_id', prazo.id);
        } else {
          console.log('❌ [PRAZO PAGAMENTO] Prazo não encontrado para:', nome);
          console.log('📦 [PRAZO PAGAMENTO] Nomes disponíveis:', items.map(i => i.nome));
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

  const carregarDadosFilialEspecifica = useCallback(async (id, tipo) => {
    try {
      console.log(`🔵 [FILIAL ${tipo.toUpperCase()}] Buscando dados da filial ID:`, id);
      const response = await PedidosComprasService.buscarDadosFilial(id);
      console.log(`📦 [FILIAL ${tipo.toUpperCase()}] Resposta da API:`, response);
      if (response.success && response.data) {
        console.log(`✅ [FILIAL ${tipo.toUpperCase()}] Dados recebidos:`, response.data);
        if (tipo === 'faturamento') {
          setDadosFilialFaturamento(response.data);
        } else if (tipo === 'cobranca') {
          setDadosFilialCobranca(response.data);
        } else if (tipo === 'entrega') {
          setDadosFilialEntrega(response.data);
        }
        return response.data;
      } else {
        console.log(`❌ [FILIAL ${tipo.toUpperCase()}] Resposta sem sucesso:`, response);
      }
    } catch (error) {
      console.error(`❌ [FILIAL ${tipo.toUpperCase()}] Erro ao carregar dados:`, error);
    }
    return null;
  }, []);

  const carregarItensSolicitacao = useCallback(async (id, pedidoExistente = null) => {
    console.log('🔵 [ITENS SOLICITACAO] Iniciando carregamento...');
    console.log('📦 [ITENS SOLICITACAO] ID da solicitação:', id);
    console.log('📦 [ITENS SOLICITACAO] Pedido existente:', pedidoExistente ? 'SIM' : 'NÃO');
    if (pedidoExistente) {
      console.log('📦 [ITENS PEDIDO] Itens do pedido existente:', pedidoExistente.itens);
    }
    
    setLoadingItens(true);
    try {
      const response = await PedidosComprasService.buscarItensSolicitacao(id);
      console.log('📦 [ITENS SOLICITACAO] Resposta da API:', response);
      
      if (response.success && response.data) {
        const { solicitacao, itens } = response.data;
        console.log('✅ [ITENS SOLICITACAO] Solicitação recebida:', solicitacao);
        console.log('✅ [ITENS SOLICITACAO] Itens da solicitação recebidos:', itens);
        console.log('📦 [ITENS SOLICITACAO] Quantidade de itens:', itens.length);
        
        setSolicitacaoSelecionada(solicitacao);
        
        if (!pedidoExistente) {
          console.log('✅ [ITENS] Novo pedido - resetando itens');
          setItensDisponiveis(itens.map(item => ({ ...item, selected: false, quantidade_pedido: 0, valor_unitario: 0 })));
          setItensSelecionados([]);
        } else {
          console.log('✅ [ITENS] Pedido existente - mapeando itens...');
          console.log('📦 [ITENS] Itens do pedido para mapear:', pedidoExistente.itens);
          
          // Quando há pedido existente, mapear itens do pedido com itens da solicitação
          const itensDisponiveisNovos = itens.map(item => {
            console.log('🔍 [ITENS] Mapeando item da solicitação:', {
              id: item.id,
              produto_id: item.produto_id,
              nome: item.nome
            });
            
            // Procurar item no pedido por solicitacao_item_id ou id
            const itemNoPedido = pedidoExistente.itens?.find(pi => {
              const match1 = pi.solicitacao_item_id === item.id;
              const match2 = pi.id === item.id;
              const match3 = pi.produto_generico_id && pi.produto_generico_id === item.produto_id;
              
              if (match1 || match2 || match3) {
                console.log('✅ [ITENS] Match encontrado:', {
                  solicitacao_item_id: pi.solicitacao_item_id,
                  pedido_item_id: pi.id,
                  produto_generico_id: pi.produto_generico_id,
                  match1,
                  match2,
                  match3
                });
              }
              
              return match1 || match2 || match3;
            });
            
            if (itemNoPedido) {
              console.log('✅ [ITENS] Item mapeado encontrado:', itemNoPedido);
              return {
                ...item,
                id: item.id, // Garantir que o id da solicitação seja mantido
                selected: true,
                quantidade_pedido: itemNoPedido.quantidade_pedido || itemNoPedido.quantidade || item.quantidade || 0,
                valor_unitario: itemNoPedido.valor_unitario || 0
              };
            }
            console.log('⚠️ [ITENS] Item não encontrado no pedido');
            return { ...item, selected: false, quantidade_pedido: 0, valor_unitario: 0 };
          });
          
          console.log('📦 [ITENS] Itens mapeados:', itensDisponiveisNovos);
          const itensSelecionadosCount = itensDisponiveisNovos.filter(i => i.selected).length;
          console.log('📦 [ITENS] Itens selecionados após mapeamento:', itensSelecionadosCount);
          
          // Se não encontrou itens mapeados, usar diretamente os itens do pedido
          if (pedidoExistente.itens && pedidoExistente.itens.length > 0 && itensSelecionadosCount === 0) {
            console.log('⚠️ [ITENS] Nenhum item mapeado encontrado, usando itens do pedido diretamente');
            const itensDoPedido = pedidoExistente.itens.map(itemPedido => {
              console.log('📦 [ITENS] Item do pedido:', itemPedido);
              return {
                ...itemPedido,
                id: itemPedido.solicitacao_item_id || itemPedido.id,
                selected: true,
                quantidade_pedido: itemPedido.quantidade_pedido || itemPedido.quantidade || 0,
                valor_unitario: itemPedido.valor_unitario || 0
              };
            });
            console.log('📦 [ITENS] Itens do pedido mapeados:', itensDoPedido);
            setItensDisponiveis(itensDoPedido);
            setItensSelecionados(itensDoPedido);
          } else {
            console.log('✅ [ITENS] Usando itens mapeados da solicitação');
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
        console.log('❌ [ITENS SOLICITACAO] Erro na resposta:', response.error);
        toast.error(response.error || 'Erro ao carregar itens da solicitação');
      }
    } catch (error) {
      console.error('❌ [ITENS SOLICITACAO] Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens da solicitação');
    } finally {
      setLoadingItens(false);
      carregandoItensRef.current = false;
      console.log('✅ [ITENS SOLICITACAO] Carregamento finalizado');
    }
  }, [setValue, watch, carregarDadosFilial, carregarDadosFilialEspecifica]);

  // Handlers
  const handleItemChange = useCallback((index, updatedItem) => {
    const newItens = [...itensDisponiveis];
    newItens[index] = updatedItem;
    setItensDisponiveis(newItens);
    
    const selected = newItens.filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0);
    setItensSelecionados(selected);
  }, [itensDisponiveis]);

  const handleRemoveItem = useCallback((index) => {
    const newItens = [...itensDisponiveis];
    newItens[index] = { ...newItens[index], selected: false, quantidade_pedido: 0 };
    setItensDisponiveis(newItens);
    setItensSelecionados(newItens.filter(item => item.selected && parseFloat(item.quantidade_pedido || 0) > 0));
  }, [itensDisponiveis]);

  // Efeitos
  useEffect(() => {
    if (isOpen) {
      carregarFormasPagamento();
      carregarPrazosPagamento();
      carregarFiliais();
    }
  }, [isOpen, carregarFormasPagamento, carregarPrazosPagamento, carregarFiliais]);

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
      console.log('🔵 [PEDIDO COMPRAS] Dados recebidos do pedido:', {
        id: pedidoCompras.id,
        numero_pedido: pedidoCompras.numero_pedido,
        solicitacao_compras_id: pedidoCompras.solicitacao_compras_id,
        fornecedor_id: pedidoCompras.fornecedor_id,
        fornecedor_nome: pedidoCompras.fornecedor_nome,
        fornecedor_cnpj: pedidoCompras.fornecedor_cnpj,
        filial_id: pedidoCompras.filial_id,
        filial_nome: pedidoCompras.filial_nome,
        filial_faturamento_id: pedidoCompras.filial_faturamento_id,
        filial_cobranca_id: pedidoCompras.filial_cobranca_id,
        filial_entrega_id: pedidoCompras.filial_entrega_id,
        forma_pagamento: pedidoCompras.forma_pagamento,
        prazo_pagamento: pedidoCompras.prazo_pagamento,
        observacoes: pedidoCompras.observacoes,
        itens_count: pedidoCompras.itens?.length || 0,
        itens: pedidoCompras.itens
      });

      const carregarDados = async () => {
        console.log('🔵 [CARREGAMENTO] Iniciando carregamento de dados...');
        
        // Preencher formulário
        if (pedidoCompras.solicitacao_compras_id) {
          console.log('✅ [SET VALUE] solicitacao_compras_id:', pedidoCompras.solicitacao_compras_id);
          setValue('solicitacao_compras_id', pedidoCompras.solicitacao_compras_id);
        }
        if (pedidoCompras.fornecedor_id) {
          console.log('✅ [SET VALUE] fornecedor_id:', pedidoCompras.fornecedor_id);
          setValue('fornecedor_id', pedidoCompras.fornecedor_id);
        }
        if (pedidoCompras.fornecedor_nome) {
          console.log('✅ [SET VALUE] fornecedor_nome:', pedidoCompras.fornecedor_nome);
          setValue('fornecedor_nome', pedidoCompras.fornecedor_nome);
        }
        if (pedidoCompras.fornecedor_cnpj) {
          console.log('✅ [SET VALUE] fornecedor_cnpj:', pedidoCompras.fornecedor_cnpj);
          setValue('fornecedor_cnpj', pedidoCompras.fornecedor_cnpj);
        }
        if (pedidoCompras.filial_faturamento_id) {
          console.log('✅ [SET VALUE] filial_faturamento_id:', pedidoCompras.filial_faturamento_id);
          setValue('filial_faturamento_id', pedidoCompras.filial_faturamento_id);
        }
        if (pedidoCompras.filial_cobranca_id) {
          console.log('✅ [SET VALUE] filial_cobranca_id:', pedidoCompras.filial_cobranca_id);
          setValue('filial_cobranca_id', pedidoCompras.filial_cobranca_id);
        }
        if (pedidoCompras.filial_entrega_id) {
          console.log('✅ [SET VALUE] filial_entrega_id:', pedidoCompras.filial_entrega_id);
          setValue('filial_entrega_id', pedidoCompras.filial_entrega_id);
        }
        if (pedidoCompras.observacoes) {
          console.log('✅ [SET VALUE] observacoes:', pedidoCompras.observacoes);
          setValue('observacoes', pedidoCompras.observacoes);
        }
        
        // Carregar fornecedor
        if (pedidoCompras.fornecedor_id) {
          console.log('🔵 [FORNECEDOR] Buscando fornecedor por ID:', pedidoCompras.fornecedor_id);
          buscarFornecedorPorId(pedidoCompras.fornecedor_id);
        } else {
          console.log('⚠️ [FORNECEDOR] Nenhum fornecedor_id encontrado');
        }
        
        // Carregar filiais
        console.log('🔵 [FILIAIS] Carregando dados das filiais...');
        if (pedidoCompras.filial_faturamento_id) {
          console.log('✅ [FILIAL FATURAMENTO] ID:', pedidoCompras.filial_faturamento_id);
          const dadosFaturamento = await carregarDadosFilialEspecifica(pedidoCompras.filial_faturamento_id, 'faturamento');
          console.log('📦 [FILIAL FATURAMENTO] Dados carregados:', dadosFaturamento);
        } else if (pedidoCompras.filial_id) {
          console.log('⚠️ [FILIAL FATURAMENTO] Usando filial_id como fallback:', pedidoCompras.filial_id);
          await carregarDadosFilialEspecifica(pedidoCompras.filial_id, 'faturamento');
        } else {
          console.log('❌ [FILIAL FATURAMENTO] Nenhum ID encontrado');
        }
        
        if (pedidoCompras.filial_cobranca_id) {
          console.log('✅ [FILIAL COBRANCA] ID:', pedidoCompras.filial_cobranca_id);
          const dadosCobranca = await carregarDadosFilialEspecifica(pedidoCompras.filial_cobranca_id, 'cobranca');
          console.log('📦 [FILIAL COBRANCA] Dados carregados:', dadosCobranca);
        } else {
          console.log('❌ [FILIAL COBRANCA] Nenhum ID encontrado');
        }
        
        if (pedidoCompras.filial_entrega_id) {
          console.log('✅ [FILIAL ENTREGA] ID:', pedidoCompras.filial_entrega_id);
          const dadosEntrega = await carregarDadosFilialEspecifica(pedidoCompras.filial_entrega_id, 'entrega');
          console.log('📦 [FILIAL ENTREGA] Dados carregados:', dadosEntrega);
        } else {
          console.log('❌ [FILIAL ENTREGA] Nenhum ID encontrado');
        }
        
        // Carregar itens - sempre tentar carregar da solicitação primeiro
        console.log('🔵 [ITENS] Verificando itens do pedido...');
        console.log('📦 [ITENS PEDIDO] Itens recebidos:', pedidoCompras.itens);
        
        if (pedidoCompras.solicitacao_compras_id) {
          console.log('✅ [ITENS] Carregando itens da solicitação:', pedidoCompras.solicitacao_compras_id);
          await carregarItensSolicitacao(pedidoCompras.solicitacao_compras_id, pedidoCompras);
        } else if (pedidoCompras.itens && Array.isArray(pedidoCompras.itens) && pedidoCompras.itens.length > 0) {
          console.log('✅ [ITENS] Usando itens diretamente do pedido (sem solicitação)');
          console.log('📦 [ITENS] Itens antes do mapeamento:', pedidoCompras.itens);
          // Se não tem solicitação mas tem itens, usar itens diretamente
          const itensComSelected = pedidoCompras.itens.map(item => ({
            ...item,
            id: item.solicitacao_item_id || item.id,
            selected: true,
            quantidade_pedido: item.quantidade_pedido || item.quantidade || 0,
            valor_unitario: item.valor_unitario || 0
          }));
          console.log('📦 [ITENS] Itens após mapeamento:', itensComSelected);
          setItensSelecionados(itensComSelected);
          setItensDisponiveis(itensComSelected);
        } else {
          console.log('❌ [ITENS] Nenhum item encontrado no pedido');
        }

        // Aguardar carregamento de formas e prazos antes de buscar IDs
        console.log('🔵 [PAGAMENTO] Verificando formas e prazos...');
        console.log('📦 [PAGAMENTO] Formas disponíveis:', formasPagamento.length);
        console.log('📦 [PAGAMENTO] Prazos disponíveis:', prazosPagamento.length);
        console.log('📦 [PAGAMENTO] Forma do pedido:', pedidoCompras.forma_pagamento);
        console.log('📦 [PAGAMENTO] Prazo do pedido:', pedidoCompras.prazo_pagamento);
        
        if (formasPagamento.length === 0) {
          console.log('⚠️ [PAGAMENTO] Carregando formas de pagamento...');
          await carregarFormasPagamento();
        }
        if (prazosPagamento.length === 0) {
          console.log('⚠️ [PAGAMENTO] Carregando prazos de pagamento...');
          await carregarPrazosPagamento();
        }
        
        // Aguardar um pouco e buscar IDs
        setTimeout(() => {
          console.log('🔵 [PAGAMENTO] Buscando IDs por nome...');
          if (pedidoCompras.forma_pagamento) {
            console.log('✅ [PAGAMENTO] Buscando forma:', pedidoCompras.forma_pagamento);
            buscarIdFormaPagamentoPorNome(pedidoCompras.forma_pagamento);
          } else {
            console.log('❌ [PAGAMENTO] Nenhuma forma_pagamento encontrada');
          }
          if (pedidoCompras.prazo_pagamento) {
            console.log('✅ [PAGAMENTO] Buscando prazo:', pedidoCompras.prazo_pagamento);
            buscarIdPrazoPagamentoPorNome(pedidoCompras.prazo_pagamento);
          } else {
            console.log('❌ [PAGAMENTO] Nenhum prazo_pagamento encontrado');
          }
        }, 300);
        
        console.log('✅ [CARREGAMENTO] Carregamento de dados concluído');
      };

      carregarDados();
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
      setValue('forma_pagamento_id', '');
      setValue('prazo_pagamento_id', '');
      setValue('fornecedor_id', '');
      setValue('filial_faturamento_id', '');
      setValue('filial_cobranca_id', '');
      setValue('filial_entrega_id', '');
    }
  }, [pedidoCompras, isOpen, setValue, reset, buscarFornecedorPorId, carregarItensSolicitacao, carregarDadosFilialEspecifica, buscarIdFormaPagamentoPorNome, buscarIdPrazoPagamentoPorNome, formasPagamento.length, prazosPagamento.length, carregarFormasPagamento, carregarPrazosPagamento]);

  useEffect(() => {
    if (!isOpen) {
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
    
    // Valores observados
    solicitacaoId,
    fornecedorId,
    filialFaturamentoId,
    filialCobrancaId,
    filialEntregaId
  };
};

