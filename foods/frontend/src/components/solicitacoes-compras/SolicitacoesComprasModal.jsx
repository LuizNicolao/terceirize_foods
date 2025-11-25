import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPlus, FaTrash, FaSearch, FaPrint } from 'react-icons/fa';
import { Button, Input, Modal, SearchableSelect, Pagination } from '../ui';
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
  loading,
  onPrint
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  const { user } = useAuth();
  const [itens, setItens] = useState([]);
  const [semanaAbastecimento, setSemanaAbastecimento] = useState('');
  const [carregandoSemana, setCarregandoSemana] = useState(false);
  const [produtosAdicionados, setProdutosAdicionados] = useState(new Set());
  const [abaAtiva, setAbaAtiva] = useState('cabecalho'); // 'cabecalho' ou 'produtos'
  const [paginaProdutos, setPaginaProdutos] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [buscaProduto, setBuscaProduto] = useState('');

  // Observar data de entrega para buscar semana
  const dataEntrega = watch('data_entrega_cd');
  const justificativa = watch('justificativa');

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

  // Resetar aba quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setAbaAtiva('cabecalho');
      setPaginaProdutos(1);
      setBuscaProduto('');
    }
  }, [isOpen]);

  // Atualizar nomes dos produtos nos itens quando produtos genéricos forem carregados
  useEffect(() => {
    if (produtosGenericos.length > 0 && itens.length > 0) {
      // Verificar se algum item precisa de atualização
      const precisaAtualizar = itens.some(item => 
        item.produto_id && !item.nome_produto && !item.produto_nome
      );
      
      if (!precisaAtualizar) return;
      
      const itensAtualizados = itens.map(item => {
        // Se já tem nome, não precisa atualizar
        if (item.nome_produto || item.produto_nome) {
          return item;
        }
        
        // Se tem produto_id, buscar nome do produto
        if (item.produto_id) {
          const produto = produtosGenericos.find(p => p.id === parseInt(item.produto_id));
          if (produto) {
            return {
              ...item,
              nome_produto: produto.nome || '',
              produto_nome: produto.nome || '',
              codigo_produto: produto.codigo_produto || produto.codigo || '',
              codigo: produto.codigo_produto || produto.codigo || ''
            };
          }
        }
        
        return item;
      });
      
      // Só atualizar se houver mudanças reais
      const houveMudancas = itensAtualizados.some((item, index) => {
        const original = itens[index];
        return item.nome_produto !== original.nome_produto ||
               item.codigo_produto !== original.codigo_produto;
      });
      
      if (houveMudancas) {
        setItens(itensAtualizados);
      }
    }
  }, [produtosGenericos.length, itens.length]);

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (solicitacao && isOpen) {
      // Preencher formulário com dados da solicitação
      Object.keys(solicitacao).forEach(key => {
        if (solicitacao[key] !== null && solicitacao[key] !== undefined && key !== 'itens') {
          // Mapear motivo para justificativa se necessário (compatibilidade)
          if (key === 'motivo' && !solicitacao.justificativa) {
            setValue('justificativa', solicitacao[key]);
          } else if (key !== 'motivo') {
            setValue(key, solicitacao[key]);
          }
        }
      });
      // Garantir que justificativa seja preenchida mesmo se vier apenas motivo
      if (solicitacao.justificativa || solicitacao.motivo) {
        setValue('justificativa', solicitacao.justificativa || solicitacao.motivo);
      }
      
      // Carregar itens se existirem
      if (solicitacao.itens && Array.isArray(solicitacao.itens)) {
        // Processar itens para garantir que unidade seja exibida como texto e nome do produto esteja disponível
        const itensProcessados = solicitacao.itens.map(item => {
          // Se não tiver nome do produto, buscar do array de produtos genéricos
          let nomeProduto = item.nome_produto || item.produto_nome;
          let codigoProduto = item.codigo_produto || item.codigo;
          
          if (!nomeProduto && item.produto_id && produtosGenericos.length > 0) {
            const produto = produtosGenericos.find(p => p.id === parseInt(item.produto_id));
            if (produto) {
              nomeProduto = produto.nome || '';
              codigoProduto = produto.codigo_produto || produto.codigo || '';
            }
          }
          
          return {
            ...item,
            nome_produto: nomeProduto || '',
            produto_nome: nomeProduto || '',
            codigo_produto: codigoProduto || '',
            codigo: codigoProduto || '',
            unidade_simbolo: item.unidade_simbolo || item.unidade_medida || '',
            unidade_medida: item.unidade_medida || item.unidade_simbolo || item.unidade_nome || '',
            unidade_texto: item.unidade_simbolo || item.unidade_medida || item.unidade_nome || ''
          };
        });
        setItens(itensProcessados);
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
    // Ir para a última página se necessário
    const totalItensAposAdicionar = itens.length + 1;
    const novaPagina = Math.ceil(totalItensAposAdicionar / itensPorPagina);
    setPaginaProdutos(novaPagina);
  };

  // Remover item
  const handleRemoveItem = (index) => {
    const item = itens[index];
    if (item.produto_id) {
      const novosProdutos = new Set(produtosAdicionados);
      novosProdutos.delete(item.produto_id);
      setProdutosAdicionados(novosProdutos);
    }
    const novosItens = itens.filter((_, i) => i !== index);
    setItens(novosItens);
    
    // Ajustar página se necessário
    const totalItensAposRemover = novosItens.length;
    const novaPaginaMaxima = Math.ceil(totalItensAposRemover / itensPorPagina) || 1;
    if (paginaProdutos > novaPaginaMaxima) {
      setPaginaProdutos(novaPaginaMaxima);
    }
  };

  // Atualizar campo de item
  const handleItemChange = (index, field, value) => {
    const updated = [...itens];
    updated[index] = { ...updated[index], [field]: value };
    
    // Se mudou produto, auto-preenche unidade e símbolo
    if (field === 'produto_id' && value) {
      const produto = produtosGenericos.find(p => p.id === parseInt(value));
      if (produto) {
        // Salvar nome e código do produto para busca
        updated[index].nome_produto = produto.nome || '';
        updated[index].produto_nome = produto.nome || '';
        updated[index].codigo_produto = produto.codigo_produto || produto.codigo || '';
        updated[index].codigo = produto.codigo_produto || produto.codigo || '';
        
        if (produto.unidade_medida_id) {
          updated[index].unidade_medida_id = produto.unidade_medida_id;
        }
        // Buscar símbolo da unidade
        const unidade = unidadesMedida.find(u => u.id === produto.unidade_medida_id);
        if (unidade) {
          updated[index].unidade_simbolo = unidade.sigla || unidade.simbolo || '';
          updated[index].unidade_medida = unidade.nome || unidade.sigla || unidade.simbolo || '';
          // Garantir que o texto da unidade seja exibido
          updated[index].unidade_texto = unidade.sigla || unidade.simbolo || unidade.nome || '';
        } else {
          // Limpar se não encontrar unidade
          updated[index].unidade_simbolo = '';
          updated[index].unidade_medida = '';
          updated[index].unidade_texto = '';
        }
      } else {
        // Limpar se produto não encontrado
        updated[index].nome_produto = '';
        updated[index].produto_nome = '';
        updated[index].codigo_produto = '';
        updated[index].codigo = '';
        updated[index].unidade_simbolo = '';
        updated[index].unidade_medida = '';
        updated[index].unidade_texto = '';
        updated[index].unidade_medida_id = '';
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

  // Filtrar itens baseado na busca
  const itensFiltrados = useMemo(() => {
    if (!buscaProduto.trim()) {
      return itens;
    }

    const termoBusca = buscaProduto.toLowerCase().trim();
    return itens.filter(item => {
      // Buscar pelo nome do produto
      const nomeProduto = (item.nome_produto || item.produto_nome || '').toLowerCase();
      // Buscar pelo código do produto (se disponível)
      const codigoProduto = (item.codigo_produto || item.codigo || '').toLowerCase();
      // Buscar pela observação
      const observacao = (item.observacao || '').toLowerCase();
      
      return nomeProduto.includes(termoBusca) || 
             codigoProduto.includes(termoBusca) || 
             observacao.includes(termoBusca);
    });
  }, [itens, buscaProduto]);

  // Calcular itens paginados (após filtro)
  const itensPaginados = useMemo(() => {
    const inicio = (paginaProdutos - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return itensFiltrados.slice(inicio, fim);
  }, [itensFiltrados, paginaProdutos, itensPorPagina]);

  // Calcular total de páginas (baseado nos itens filtrados)
  const totalPaginasProdutos = useMemo(() => {
    return Math.ceil(itensFiltrados.length / itensPorPagina) || 1;
  }, [itensFiltrados.length, itensPorPagina]);

  // Resetar página quando itens mudarem ou busca mudar
  useEffect(() => {
    if (paginaProdutos > totalPaginasProdutos && totalPaginasProdutos > 0) {
      setPaginaProdutos(1);
    }
  }, [itensFiltrados.length, totalPaginasProdutos, paginaProdutos]);

  // Resetar página quando busca mudar
  useEffect(() => {
    setPaginaProdutos(1);
  }, [buscaProduto]);

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

    if (!data.justificativa) {
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

    // Validar observações se justificativa for "Compra Emergencial"
    if (data.justificativa && data.justificativa === 'Compra Emergencial') {
      if (!data.observacoes || data.observacoes.trim() === '') {
        toast.error('Observações são obrigatórias para Compra Emergencial');
        return;
      }
    }

    // Preparar dados para envio
    const filialId = parseInt(data.filial_id);
    if (isNaN(filialId) || filialId < 1) {
      toast.error('Filial inválida');
      return;
    }

    // Validar e mapear itens
    const itensFormatados = [];
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const produtoId = parseInt(item.produto_id);
      const quantidade = parseFloat(item.quantidade);
      const unidadeMedidaId = parseInt(item.unidade_medida_id);

      if (isNaN(produtoId) || produtoId < 1) {
        toast.error(`Item ${i + 1}: Produto inválido`);
        return;
      }
      if (isNaN(quantidade) || quantidade <= 0) {
        toast.error(`Item ${i + 1}: Quantidade inválida`);
        return;
      }
      if (isNaN(unidadeMedidaId) || unidadeMedidaId < 1) {
        toast.error(`Item ${i + 1}: Unidade inválida`);
        return;
      }

      itensFormatados.push({
        produto_id: produtoId,
        quantidade: quantidade,
        unidade_medida_id: unidadeMedidaId,
        observacao: item.observacao && item.observacao.trim() !== '' ? item.observacao.trim() : null // Observação do produto é opcional
      });
    }

    const formData = {
      filial_id: filialId,
      data_entrega_cd: data.data_entrega_cd,
      justificativa: data.justificativa,
      observacoes: data.observacoes && data.observacoes.trim() !== '' ? data.observacoes.trim() : null,
      itens: itensFormatados
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
          <div className="flex items-center gap-2">
            {viewMode && solicitacao && onPrint && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(solicitacao)}
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          {/* Navegação por Abas */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setAbaAtiva('cabecalho')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === 'cabecalho'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cabeçalho da Solicitação
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('produtos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === 'produtos'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Produtos da Solicitação
                {itens.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {itens.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          <div className="space-y-6 min-h-[400px]">
            {/* Aba: Cabeçalho */}
            {abaAtiva === 'cabecalho' && (
              <div className="bg-gray-50 p-4 rounded-lg transition-opacity duration-300">
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
                {...register('justificativa', {
                  required: 'Justificativa é obrigatória'
                })}
                error={errors.justificativa?.message}
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

              {/* Pedidos Vinculados (se editando/visualizando) - ao lado de Solicitante */}
              {solicitacao && (
                <Input
                  label="Pedidos Vinculados"
                  value={solicitacao.pedidos_vinculados && solicitacao.pedidos_vinculados.length > 0 
                    ? solicitacao.pedidos_vinculados.join(', ') 
                    : '-'}
                  disabled={true}
                  className="bg-gray-50"
                  readOnly
                />
              )}
            </div>

            {/* Observações Gerais */}
            <div className="mt-4">
              <Input
                label={`Observações Gerais${justificativa && justificativa === 'Compra Emergencial' ? ' *' : ''}`}
                type="textarea"
                rows={3}
                {...register('observacoes', {
                  required: justificativa && justificativa === 'Compra Emergencial' 
                    ? 'Observações são obrigatórias para Compra Emergencial' 
                    : false
                })}
                error={errors.observacoes?.message}
                disabled={viewMode}
                placeholder={justificativa && justificativa === 'Compra Emergencial' 
                  ? 'Digite as observações da solicitação (obrigatório para Compra Emergencial)...' 
                  : 'Digite as observações (opcional para Compra Programada)...'}
              />
            </div>
          </div>
            )}

            {/* Aba: Produtos */}
            {abaAtiva === 'produtos' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-opacity duration-300 relative">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Produtos da Solicitação</h3>
              {!viewMode && (
                <Button onClick={handleAddItem} size="sm" variant="primary" type="button">
                  <FaPlus className="mr-1" />
                  Adicionar Produto
                </Button>
              )}
            </div>

            {/* Campo de Busca */}
            {itens.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Buscar produto por nome, código ou observação..."
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    className="w-full pl-10 pr-10"
                  />
                  {buscaProduto && (
                    <button
                      type="button"
                      onClick={() => setBuscaProduto('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {buscaProduto && (
                  <p className="mt-2 text-sm text-gray-600">
                    {itensFiltrados.length} produto(s) encontrado(s)
                  </p>
                )}
              </div>
            )}

            {itens.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.</p>
              </div>
            ) : itensFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Nenhum produto encontrado com o termo "{buscaProduto}".</p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-visible">
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
                    {itensPaginados.map((item, indexPagina) => {
                      // Encontrar índice real no array original de itens
                      // Primeiro tenta encontrar por referência (mais rápido e confiável)
                      let indexReal = itens.findIndex(i => i === item);
                      
                      // Se não encontrar por referência, busca por propriedades únicas
                      if (indexReal === -1) {
                        indexReal = itens.findIndex(i => 
                          i.produto_id === item.produto_id &&
                          i.quantidade === item.quantidade &&
                          i.observacao === item.observacao
                        );
                      }
                      
                      // Filtrar produtos já adicionados (exceto o atual)
                      const produtosDisponiveis = produtosGenericos.filter(p => 
                        !produtosAdicionados.has(p.id) || p.id === parseInt(item.produto_id)
                      );

                      return (
                        <tr key={`${indexReal}-${item.produto_id || indexPagina}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {viewMode ? (
                              <span className="text-sm text-gray-900">
                                {item.nome_produto || item.produto_nome || '-'}
                              </span>
                            ) : (
                              <div className="relative z-50">
                                <SearchableSelect
                                  value={item.produto_id || ''}
                                  onChange={(value) => handleItemChange(indexReal, 'produto_id', value)}
                                  options={produtosDisponiveis.map(p => ({
                                    value: p.id,
                                    label: `${p.codigo_produto || p.codigo || ''} - ${p.nome}`
                                  }))}
                                  placeholder="Selecione um produto..."
                                  className="w-full"
                                  usePortal={true}
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 font-medium">
                              {item.unidade_simbolo || item.unidade_medida || item.unidade_texto || (
                                <span className="text-gray-400 italic">Selecione um produto...</span>
                              )}
                            </div>
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
                                onChange={(e) => handleItemChange(indexReal, 'quantidade', e.target.value)}
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
                                onChange={(e) => handleItemChange(indexReal, 'observacao', e.target.value)}
                                className="w-full"
                                placeholder="Observação do item..."
                              />
                            )}
                          </td>
                          {!viewMode && (
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleRemoveItem(indexReal)}
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

            {/* Paginação */}
            {itensFiltrados.length > 0 && (
              <Pagination
                currentPage={paginaProdutos}
                totalPages={totalPaginasProdutos}
                totalItems={itensFiltrados.length}
                itemsPerPage={itensPorPagina}
                onPageChange={setPaginaProdutos}
                onItemsPerPageChange={(novoValor) => {
                  setItensPorPagina(novoValor);
                  setPaginaProdutos(1);
                }}
              />
            )}
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

