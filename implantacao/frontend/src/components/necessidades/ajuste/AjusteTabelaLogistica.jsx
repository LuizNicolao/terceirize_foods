import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Input, SearchableSelect, Pagination } from '../../ui';
import FoodsApiService from '../../../services/FoodsApiService';
import SubstituicoesNecessidadesService from '../../../services/substituicoesNecessidades';
import toast from 'react-hot-toast';

const AjusteTabelaLogistica = ({
  necessidades,
  ajustesLocais,
  onAjusteChange,
  onExcluirNecessidade,
  canEdit,
  onTrocarProdutoOrigem,
  onSelectedProdutosOrigemChange
}) => {
  const [produtosGrupo, setProdutosGrupo] = useState({});
  const [selectedProdutosOrigem, setSelectedProdutosOrigem] = useState({});
  const [loadingProdutos, setLoadingProdutos] = useState({});
  const [trocaLoading, setTrocaLoading] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  
  // Expor selectedProdutosOrigem para o componente pai
  useEffect(() => {
    if (onSelectedProdutosOrigemChange) {
      onSelectedProdutosOrigemChange(selectedProdutosOrigem);
    }
  }, [selectedProdutosOrigem, onSelectedProdutosOrigemChange]);

  // Funções auxiliares - devem ser definidas antes do useMemo que as utiliza
  // Função para calcular quantidade anterior
  const getQuantidadeAnterior = (necessidade) => {
    // Se existe ajuste_anterior, usar ele
    if (necessidade.ajuste_anterior !== null && necessidade.ajuste_anterior !== undefined) {
      return necessidade.ajuste_anterior ?? 0;
    }
    // Fallback para lógica antiga se ajuste_anterior não existir
    return necessidade.ajuste_coordenacao ?? 0;
  };

  // Função para calcular quantidade atual baseado no status
  const getQuantidadeAtual = (necessidade) => {
    // Para NEC LOG, mostrar ajuste_logistica
    return necessidade.ajuste_logistica ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0;
  };

  // Função para calcular a diferença
  const getDiferenca = (necessidade) => {
    const atual = getQuantidadeAtual(necessidade);
    const anterior = getQuantidadeAnterior(necessidade);
    return atual - anterior;
  };

  // Função para formatar números
  const formatarQuantidade = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      return '0';
    }
    const num = typeof valor === 'number' ? valor : parseFloat(valor);
    if (isNaN(num)) {
      return '0';
    }
    
    // Separar parte inteira e decimal
    const parteInteira = Math.floor(Math.abs(num));
    const parteDecimal = Math.abs(num) - parteInteira;
    const sinal = num < 0 ? '-' : '';
    
    // Formatar parte inteira com separador de milhar (vírgula)
    const parteInteiraFormatada = parteInteira.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Se for um número inteiro, exibir sem decimais
    if (parteDecimal === 0) {
      return sinal + parteInteiraFormatada;
    }
    
    // Caso contrário, formatar com até 3 casas decimais, removendo zeros à direita
    const decimais = parteDecimal.toFixed(3).replace(/\.?0+$/, '');
    return sinal + parteInteiraFormatada + decimais.replace('.', ',');
  };

  // Função para consolidar necessidades por produto_id + grupo_id
  const necessidadesConsolidadas = useMemo(() => {
    const consolidado = new Map();
    
    necessidades.forEach(nec => {
      // Chave única: produto_id + grupo_id (para diferenciar mesmo produto em grupos diferentes)
      const chave = `${nec.produto_id || ''}_${nec.grupo_id || nec.grupo || ''}`;
      
      if (!consolidado.has(chave)) {
        consolidado.set(chave, {
          produto_id: nec.produto_id,
          produto_codigo: nec.produto_codigo,
          produto: nec.produto,
          produto_unidade: nec.produto_unidade,
          grupo: nec.grupo,
          grupo_id: nec.grupo_id,
          quantidade_total: parseFloat(getQuantidadeAtual(nec) || 0),
          quantidade_anterior_total: parseFloat(getQuantidadeAnterior(nec) || 0),
          ajuste_total: 0,
          diferenca_total: 0,
          total_escolas: 1,
          escolas: [nec],
          // Manter referência do produto origem selecionado (usar o primeiro como padrão)
          produto_origem_selecionado: `${nec.produto_id}|${nec.produto}|${nec.produto_unidade || ''}`
        });
      } else {
        const item = consolidado.get(chave);
        item.quantidade_total += parseFloat(getQuantidadeAtual(nec) || 0);
        item.quantidade_anterior_total += parseFloat(getQuantidadeAnterior(nec) || 0);
        item.total_escolas += 1;
        item.escolas.push(nec);
      }
    });

    // Calcular ajuste e diferença totais
    return Array.from(consolidado.values()).map(item => {
      // Calcular ajuste total baseado nos ajustesLocais
      const ajusteTotal = item.escolas.reduce((acc, escola) => {
        const chave = `${escola.escola_id}_${escola.produto_id}`;
        const ajusteLocal = ajustesLocais[chave];
        if (ajusteLocal !== undefined && ajusteLocal !== '') {
          const ajusteNormalizado = String(ajusteLocal).replace(',', '.');
          return acc + (parseFloat(ajusteNormalizado) || 0);
        } else {
          // Se não tem ajuste local, usar o valor atual
          return acc + parseFloat(getQuantidadeAtual(escola) || 0);
        }
      }, 0);

      item.ajuste_total = ajusteTotal;
      item.diferenca_total = ajusteTotal - item.quantidade_anterior_total;

      return item;
    });
  }, [necessidades, ajustesLocais]);

  // Buscar produtos do grupo
  const buscarProdutosGrupo = useCallback(async (grupoNome, grupoId) => {
    const cacheKey = grupoId || grupoNome;
    if (!cacheKey || produtosGrupo[cacheKey]) {
      return produtosGrupo[cacheKey] || [];
    }

    setLoadingProdutos(prev => ({ ...prev, [cacheKey]: true }));
    try {
      // Primeiro tentar buscar por grupo_id se tiver
      let response;
      if (grupoId) {
        response = await FoodsApiService.getProdutosOrigem({ grupo_id: grupoId, status: 1, limit: 1000 });
      } else {
        // Se não tiver grupo_id, buscar por nome do grupo
        // Precisamos primeiro buscar o grupo_id pelo nome
        const gruposResponse = await FoodsApiService.getGrupos({ nome: grupoNome, limit: 1 });
        if (gruposResponse.success && gruposResponse.data && gruposResponse.data.length > 0) {
          const grupoEncontrado = gruposResponse.data[0];
          response = await FoodsApiService.getProdutosOrigem({ grupo_id: grupoEncontrado.id, status: 1, limit: 1000 });
        } else {
          return [];
        }
      }

      if (response.success && response.data) {
        const produtos = response.data.map(produto => ({
          produto_id: produto.id,
          produto_nome: produto.nome,
          unidade_medida: produto.unidade_medida || produto.unidade || ''
        }));
        setProdutosGrupo(prev => ({ ...prev, [cacheKey]: produtos }));
        return produtos;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar produtos do grupo:', error);
      toast.error('Erro ao buscar produtos do grupo');
      return [];
    } finally {
      setLoadingProdutos(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, [produtosGrupo]);

  // Inicializar produtos origem selecionados (agora por chave consolidada)
  useEffect(() => {
    const valoresIniciais = {};
    necessidadesConsolidadas.forEach((consolidado) => {
      const chave = `${consolidado.produto_id}_${consolidado.grupo_id || consolidado.grupo}`;
      const primeiraEscola = consolidado.escolas[0];
      const valorAtual = `${primeiraEscola.produto_id}|${primeiraEscola.produto}|${primeiraEscola.produto_unidade || ''}`;
      valoresIniciais[chave] = valorAtual;
      consolidado.produto_origem_selecionado = valorAtual;
    });
    setSelectedProdutosOrigem(valoresIniciais);
  }, [necessidadesConsolidadas]);

  // Pré-carregar produtos do grupo quando necessário
  useEffect(() => {
    const gruposParaCarregar = new Set();
    
    necessidadesConsolidadas.forEach((consolidado) => {
      const grupoNome = consolidado.grupo;
      const grupoId = consolidado.grupo_id;
      if (grupoNome) {
        const cacheKey = grupoId || grupoNome;
        if (!produtosGrupo[cacheKey] && !loadingProdutos[cacheKey]) {
          gruposParaCarregar.add(JSON.stringify({ grupoNome, grupoId }));
        }
      }
    });
    
    // Pré-carregar produtos de todos os grupos únicos
    gruposParaCarregar.forEach(grupoStr => {
      const { grupoNome, grupoId } = JSON.parse(grupoStr);
      buscarProdutosGrupo(grupoNome, grupoId);
    });
  }, [necessidadesConsolidadas, produtosGrupo, loadingProdutos, buscarProdutosGrupo]);

  // Handler para mudança de produto origem (consolidado)
  const handleProdutoOrigemChange = useCallback(async (consolidado, valor) => {
    const chave = `${consolidado.produto_id}_${consolidado.grupo_id || consolidado.grupo}`;
    
    // Se valor for vazio (deselecionou), limpar a seleção mas manter os produtos do grupo carregados
    if (!valor) {
      setSelectedProdutosOrigem(prev => {
        const atualizado = { ...prev, [chave]: '' };
        // Limpar também os individuais
        consolidado.escolas.forEach(escola => {
          const chaveIndividual = `${escola.id}`;
          delete atualizado[chaveIndividual];
        });
        return atualizado;
      });
      return;
    }

    setSelectedProdutosOrigem(prev => {
      const atualizado = { ...prev, [chave]: valor };
      // Atualizar também os individuais com o mesmo valor (mesma lógica de Análise Substituições)
      // Quando troca no consolidado, todos os individuais também são atualizados
      consolidado.escolas.forEach(escola => {
        const chaveIndividual = `${escola.id}`;
        atualizado[chaveIndividual] = valor;
      });
      return atualizado;
    });
    consolidado.produto_origem_selecionado = valor;

    const [novoProdutoId] = valor.split('|');
    if (!novoProdutoId || String(novoProdutoId) === String(consolidado.produto_id)) {
      return;
    }

    // Buscar produtos do grupo se necessário
    const grupoNome = consolidado.grupo;
    const grupoId = consolidado.grupo_id;
    if (grupoNome && !produtosGrupo[grupoId || grupoNome]) {
      await buscarProdutosGrupo(grupoNome, grupoId);
    }
  }, [produtosGrupo, buscarProdutosGrupo]);

  // Handler para mudança de produto origem individual (nas escolas expandidas)
  const handleProdutoOrigemChangeIndividual = useCallback(async (necessidade, valor) => {
    const chave = `${necessidade.id}`;
    
    if (!valor) {
      setSelectedProdutosOrigem(prev => ({ ...prev, [chave]: '' }));
      return;
    }

    setSelectedProdutosOrigem(prev => ({ ...prev, [chave]: valor }));

    const [novoProdutoId] = valor.split('|');
    if (!novoProdutoId || String(novoProdutoId) === String(necessidade.produto_id)) {
      return;
    }

    // Buscar produtos do grupo se necessário
    const grupoNome = necessidade.grupo;
    const grupoId = necessidade.grupo_id;
    if (grupoNome && !produtosGrupo[grupoId || grupoNome]) {
      await buscarProdutosGrupo(grupoNome, grupoId);
    }
  }, [produtosGrupo, buscarProdutosGrupo]);

  // Processar troca de produto origem (consolidado - troca todas as escolas)
  const processarTrocaProdutoOrigem = useCallback(async (consolidado) => {
    const chave = `${consolidado.produto_id}_${consolidado.grupo_id || consolidado.grupo}`;
    const selecionado = selectedProdutosOrigem[chave];
    if (!selecionado) return;

    const [novoProdutoId] = selecionado.split('|');
    if (!novoProdutoId || String(novoProdutoId) === String(consolidado.produto_id)) {
      return;
    }

    setTrocaLoading(prev => ({ ...prev, [chave]: true }));
    try {
      const necessidade_ids = consolidado.escolas.map(e => e.id);
      const response = await SubstituicoesNecessidadesService.trocarProdutoOrigem({
        necessidade_ids,
        novo_produto_id: novoProdutoId
      });

      if (response.success) {
        toast.success('Produto origem trocado com sucesso!');
        if (onTrocarProdutoOrigem) {
          onTrocarProdutoOrigem();
        }
      } else {
        toast.error(response.message || 'Erro ao trocar produto origem');
      }
    } catch (error) {
      console.error('Erro ao trocar produto origem:', error);
      toast.error('Erro ao trocar produto origem');
    } finally {
      setTrocaLoading(prev => ({ ...prev, [chave]: false }));
    }
  }, [selectedProdutosOrigem, onTrocarProdutoOrigem]);

  // Processar troca de produto origem individual
  const processarTrocaProdutoOrigemIndividual = useCallback(async (necessidade) => {
    const chave = `${necessidade.id}`;
    const selecionado = selectedProdutosOrigem[chave];
    if (!selecionado) return;

    const [novoProdutoId] = selecionado.split('|');
    if (!novoProdutoId || String(novoProdutoId) === String(necessidade.produto_id)) {
      return;
    }

    setTrocaLoading(prev => ({ ...prev, [chave]: true }));
    try {
      const response = await SubstituicoesNecessidadesService.trocarProdutoOrigem({
        necessidade_ids: [necessidade.id],
        novo_produto_id: novoProdutoId
      });

      if (response.success) {
        toast.success('Produto origem trocado com sucesso!');
        if (onTrocarProdutoOrigem) {
          onTrocarProdutoOrigem();
        }
      } else {
        toast.error(response.message || 'Erro ao trocar produto origem');
      }
    } catch (error) {
      console.error('Erro ao trocar produto origem:', error);
      toast.error('Erro ao trocar produto origem');
    } finally {
      setTrocaLoading(prev => ({ ...prev, [chave]: false }));
    }
  }, [selectedProdutosOrigem, onTrocarProdutoOrigem]);

  const handleToggleExpand = (chave) => {
    setExpandedRows(prev => ({
      ...prev,
      [chave]: !prev[chave]
    }));
  };

  // Paginação
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calcular dados paginados
  const necessidadesPaginadas = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return necessidadesConsolidadas.slice(start, end);
  }, [necessidadesConsolidadas, page, itemsPerPage]);

  // Resetar para página 1 quando necessidades mudarem
  useEffect(() => {
    setPage(1);
  }, [necessidadesConsolidadas.length]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th style={{ width: '50px' }} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Codigo Produto
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto Origem
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidade de Medida
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade Total
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade Anterior Total
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ajuste Total
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Diferença Total
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Escolas
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {necessidadesPaginadas.map((consolidado) => {
            const chave = `${consolidado.produto_id}_${consolidado.grupo_id || consolidado.grupo}`;
            const grupoNome = consolidado.grupo;
            const grupoId = consolidado.grupo_id;
                        const cacheKey = grupoId || grupoNome;
                        const produtos = produtosGrupo[cacheKey] || [];
                        
            // Criar opções de produtos
                        const options = produtos.map(produto => ({
                          value: `${produto.produto_id}|${produto.produto_nome}|${produto.unidade_medida || ''}`,
                          label: produto.produto_nome,
                          description: produto.unidade_medida || ''
                        }));
                        
            // Adicionar produto atual se não estiver na lista
            const valorAtual = `${consolidado.produto_id}|${consolidado.produto}|${consolidado.produto_unidade || ''}`;
                        const jaExiste = options.some(opt => opt.value === valorAtual);
            if (!jaExiste && consolidado.produto_id) {
                          options.unshift({
                            value: valorAtual,
                label: consolidado.produto,
                description: consolidado.produto_unidade || ''
                          });
                        }
                        
            const produtoSelecionado = selectedProdutosOrigem[chave] !== undefined ? selectedProdutosOrigem[chave] : valorAtual;
            const produtoSelecionadoId = produtoSelecionado ? produtoSelecionado.split('|')[0] : '';

            return (
              <React.Fragment key={chave}>
                {/* Linha Consolidada */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleExpand(chave)}
                      className="text-green-600 hover:text-green-700 focus:outline-none transition-colors"
                    >
                      {expandedRows[chave] ? (
                        <FaChevronUp className="w-4 h-4" />
                      ) : (
                        <FaChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                    <span className="font-semibold text-cyan-600">
                      {consolidado.produto_codigo || consolidado.produto_id || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="flex-1 min-w-[200px]">
                        <SearchableSelect
                          value={produtoSelecionado || undefined}
                          onChange={(value) => handleProdutoOrigemChange(consolidado, value)}
                          options={options.length > 0 ? options : [{
                            value: valorAtual,
                            label: consolidado.produto,
                            description: consolidado.produto_unidade || ''
                          }]}
                      placeholder="Selecione um produto..."
                          disabled={!canEdit || trocaLoading[chave]}
                      onFocus={async () => {
                        if (grupoNome && !produtosGrupo[cacheKey] && !loadingProdutos[cacheKey]) {
                          await buscarProdutosGrupo(grupoNome, grupoId);
                        }
                      }}
                      onOpen={() => {
                        if (grupoNome && !produtosGrupo[cacheKey] && !loadingProdutos[cacheKey]) {
                          buscarProdutosGrupo(grupoNome, grupoId);
                        }
                      }}
                      filterBy={(option, searchTerm) => {
                        // Se o termo de busca estiver vazio ou for igual ao produto atual, mostrar todas as opções
                        // Isso permite ver todos os produtos do grupo quando o dropdown abre
                        if (!searchTerm || !searchTerm.trim()) {
                          return true;
                        }
                        const produtoAtualLabel = consolidado.produto || '';
                        if (searchTerm.toLowerCase() === produtoAtualLabel.toLowerCase()) {
                          return true;
                        }
                        // Caso contrário, aplicar filtro normal
                        return option.label?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               option.value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
                      }}
                      usePortal={false}
                    />
                  </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                    {consolidado.produto_unidade}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                    {formatarQuantidade(consolidado.quantidade_total)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                    {formatarQuantidade(consolidado.quantidade_anterior_total)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                    {formatarQuantidade(consolidado.ajuste_total)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                    {consolidado.diferenca_total !== 0 && (
                      <span className={consolidado.diferenca_total > 0 ? 'text-green-600' : 'text-red-600'}>
                        {consolidado.diferenca_total > 0 ? '+' : ''}{formatarQuantidade(consolidado.diferenca_total)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                      {consolidado.total_escolas}
                    </span>
                  </td>
                </tr>

                {/* Linha Expandida (Detalhes das Escolas) */}
                {expandedRows[chave] && (
                  <tr className="bg-gray-50">
                    <td colSpan="9" className="px-6 py-4">
                      <div className="bg-gray-50 border-l-4 border-green-600 p-4">
                        <h4 className="text-md font-semibold text-green-700 mb-4 flex items-center gap-2">
                          <span className="text-xl">🏢</span>
                          Unidades Escolares - {consolidado.produto}
                        </h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Cod Unidade</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Unidade Escolar</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Unidade</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade Anterior</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ajuste</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Diferença</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {consolidado.escolas.map((necessidade) => {
                              const chaveIndividual = `${necessidade.id}`;
                              const valorAtualIndividual = `${necessidade.produto_id}|${necessidade.produto}|${necessidade.produto_unidade || ''}`;
                              const produtoSelecionadoIndividual = selectedProdutosOrigem[chaveIndividual] !== undefined 
                                ? selectedProdutosOrigem[chaveIndividual] 
                                : valorAtualIndividual;
                              
                              return (
                                <tr key={necessidade.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                    {necessidade.escola_id}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                    {necessidade.escola}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                      <div className="flex-1 min-w-[200px]">
                                        <SearchableSelect
                                          value={produtoSelecionadoIndividual || undefined}
                                          onChange={(value) => handleProdutoOrigemChangeIndividual(necessidade, value)}
                                          options={options.length > 0 ? options : [{
                                            value: `${necessidade.produto_id}|${necessidade.produto}|${necessidade.produto_unidade || ''}`,
                                            label: necessidade.produto,
                                            description: necessidade.produto_unidade || ''
                                          }]}
                                          placeholder="Selecione um produto..."
                                          disabled={!canEdit || trocaLoading[chaveIndividual]}
                                          onFocus={async () => {
                                            if (grupoNome && !produtosGrupo[cacheKey] && !loadingProdutos[cacheKey]) {
                                              await buscarProdutosGrupo(grupoNome, grupoId);
                                            }
                                          }}
                                          filterBy={(option, searchTerm) => {
                                            // Se o termo de busca estiver vazio ou for igual ao produto atual, mostrar todas as opções
                                            // Isso permite ver todos os produtos do grupo quando o dropdown abre
                                            if (!searchTerm || !searchTerm.trim()) {
                                              return true;
                                            }
                                            const produtoAtualLabel = necessidade.produto || '';
                                            if (searchTerm.toLowerCase() === produtoAtualLabel.toLowerCase()) {
                                              return true;
                                            }
                                            // Caso contrário, aplicar filtro normal
                                            return option.label?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                   option.value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
                                          }}
                                          usePortal={false}
                                        />
                                      </div>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {necessidade.produto_unidade}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                    {formatarQuantidade(getQuantidadeAtual(necessidade))}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {formatarQuantidade(getQuantidadeAnterior(necessidade))}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  value={ajustesLocais[`${necessidade.escola_id}_${necessidade.produto_id}`] || ''}
                  onChange={(e) => {
                    const valor = e.target.value;
                    // Permitir apenas números, vírgula e ponto
                    if (valor === '' || /^[0-9]*[.,]?[0-9]*$/.test(valor)) {
                      onAjusteChange({
                        escola_id: necessidade.escola_id,
                        produto_id: necessidade.produto_id,
                        valor: valor
                      });
                    }
                  }}
                  className="w-20 text-center text-xs py-1"
                  disabled={!canEdit}
                  placeholder="0.000"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                {getDiferenca(necessidade) !== 0 && (
                  <span className={getDiferenca(necessidade) > 0 ? 'text-green-600' : 'text-red-600'}>
                    {getDiferenca(necessidade) > 0 ? '+' : ''}{formatarQuantidade(getDiferenca(necessidade))}
                  </span>
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                <button
                  onClick={() => onExcluirNecessidade(necessidade.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Excluir produto"
                  disabled={!canEdit}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      
      {/* Paginação */}
      {necessidadesConsolidadas.length > itemsPerPage && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(necessidadesConsolidadas.length / itemsPerPage)}
            totalItems={necessidadesConsolidadas.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AjusteTabelaLogistica;
