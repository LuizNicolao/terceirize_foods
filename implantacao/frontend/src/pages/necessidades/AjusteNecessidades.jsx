import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaPlus, FaSave, FaPaperPlane, FaClipboardList, FaSearch } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNecessidadesAjuste } from '../../hooks/useNecessidadesAjuste';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import {
  NecessidadesLayout,
  NecessidadesLoading,
  StatusBadge
} from '../../components/necessidades';
import CoordenacaoNecessidades from '../../components/necessidades/CoordenacaoNecessidades';
import { Modal, Button, Input, SearchableSelect } from '../../components/ui';
import { ExportButtons } from '../../components/shared';
import toast from 'react-hot-toast';

const AjusteNecessidades = () => {
  const { user } = useAuth();
  const { canView, canEdit, loading: permissionsLoading } = usePermissions();
  const [modalProdutoExtraAberto, setModalProdutoExtraAberto] = useState(false);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [searchProduto, setSearchProduto] = useState('');
  const [modoCoordenacao, setModoCoordenacao] = useState(false);

  // Hook para gerenciar ajuste de necessidades
  const {
    necessidades,
    escolas,
    grupos,
    filtros,
    loading,
    error,
    carregarNecessidades,
    salvarAjustes,
    incluirProdutoExtra,
    liberarCoordenacao,
    buscarProdutosParaModal,
    atualizarFiltros
  } = useNecessidadesAjuste();

  // Hook para semanas de abastecimento
  const { opcoes: opcoesSemanasAbastecimento } = useSemanasAbastecimento();
  
  // Hook para semanas de consumo do calendário
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo();

  // Estados locais para edição
  const [ajustesLocais, setAjustesLocais] = useState({});
  const [necessidadeAtual, setNecessidadeAtual] = useState(null);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [necessidadesFiltradas, setNecessidadesFiltradas] = useState([]);

  // Verificar permissões específicas
  const tiposComAcesso = ['nutricionista', 'coordenador', 'supervisor', 'administrador'];
  const canViewAjuste = canView('analise_necessidades') || tiposComAcesso.includes(user.tipo_de_acesso);
  const canEditAjuste = canEdit('analise_necessidades') || tiposComAcesso.includes(user.tipo_de_acesso);

  // Carregar necessidades apenas quando o botão filtrar for clicado
  // useEffect removido - carregamento manual via botão

  // Inicializar ajustes locais quando necessidades carregarem
  useEffect(() => {
    if (necessidades.length > 0) {
      const ajustesIniciais = {};
      necessidades.forEach(nec => {
        // Se status for NEC NUTRI, sempre deixar em branco (não mostrar valor salvo)
        // Se status for NEC, usar ajuste como valor inicial
        if (nec.status === 'NEC NUTRI') {
          ajustesIniciais[nec.id] = ''; // Sempre em branco para NEC NUTRI
        } else {
          const valorInicial = nec.ajuste || 0;
          ajustesIniciais[nec.id] = valorInicial === 0 ? '' : valorInicial;
        }
      });
      setAjustesLocais(ajustesIniciais);
      setNecessidadeAtual(necessidades[0]); // Para obter informações do conjunto
      setNecessidadesFiltradas(necessidades); // Inicializar filtro
    }
  }, [necessidades]);

  // Filtrar necessidades baseado na busca
  useEffect(() => {
    if (necessidades.length > 0) {
      if (buscaProduto.trim() === '') {
        setNecessidadesFiltradas(necessidades);
      } else {
        const filtradas = necessidades.filter(nec => 
          nec.produto.toLowerCase().includes(buscaProduto.toLowerCase()) ||
          (nec.codigo_teknisa && nec.codigo_teknisa.toLowerCase().includes(buscaProduto.toLowerCase()))
        );
        setNecessidadesFiltradas(filtradas);
      }
    }
  }, [necessidades, buscaProduto]);

  // Handler para mudança de filtros
  const handleFiltroChange = (campo, valor) => {
    atualizarFiltros({ [campo]: valor });
  };

  // Handler para mudança de ajuste local
  const handleAjusteChange = (necessidadeId, valor) => {
    setAjustesLocais(prev => ({
      ...prev,
      [necessidadeId]: parseFloat(valor) || 0
    }));
  };

  // Handler para salvar ajustes
  const handleSalvarAjustes = async () => {
    if (!necessidadeAtual) {
      toast.error('Nenhuma necessidade selecionada');
      return;
    }

    try {
      // Filtrar apenas ajustes que têm valores (não vazios, não 0, não null)
      const itens = Object.entries(ajustesLocais)
        .filter(([necessidadeId, ajuste]) => {
          const valor = parseFloat(ajuste);
          return !isNaN(valor) && valor > 0;
        })
        .map(([necessidadeId, ajuste]) => ({
          necessidade_id: parseInt(necessidadeId),
          ajuste_nutricionista: parseFloat(ajuste)
        }));

      const dadosParaSalvar = {
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        periodo: {
          consumo_de: filtros.consumo_de,
          consumo_ate: filtros.consumo_ate
        },
        itens
      };

      const resultado = await salvarAjustes(dadosParaSalvar);
      
      if (resultado.success) {
        toast.success('Ajustes salvos com sucesso!');
        // Zerar ajustes locais após salvar
        setAjustesLocais({});
        carregarNecessidades(); // Recarregar para atualizar status
      }
    } catch (error) {
      console.error('Erro ao salvar ajustes:', error);
      toast.error('Erro ao salvar ajustes');
    }
  };

  // Handler para liberar para coordenação
  const handleLiberarCoordenacao = async () => {
    if (!necessidadeAtual) {
      toast.error('Nenhuma necessidade selecionada');
      return;
    }

    try {
      const dadosParaLiberar = {
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        periodo: {
          consumo_de: filtros.consumo_de,
          consumo_ate: filtros.consumo_ate
        }
      };

      const resultado = await liberarCoordenacao(dadosParaLiberar);
      
      if (resultado.success) {
        toast.success('Necessidades liberadas para coordenação!');
        carregarNecessidades(); // Recarregar para atualizar status
      }
    } catch (error) {
      console.error('Erro ao liberar para coordenação:', error);
      toast.error('Erro ao liberar para coordenação');
    }
  };

  // Handler para abrir modal de produto extra
  const handleAbrirModalProdutoExtra = async () => {
    if (!necessidadeAtual) {
      toast.error('Nenhuma necessidade selecionada');
      return;
    }

    try {
      const produtos = await buscarProdutosParaModal({
        grupo: filtros.grupo,
        escola_id: filtros.escola_id,
        semana_consumo: filtros.semana_consumo,
        semana_abastecimento: filtros.semana_abastecimento
      });

      if (produtos.success) {
        setProdutosDisponiveis(produtos.data);
        setModalProdutoExtraAberto(true);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao buscar produtos disponíveis');
    }
  };

  // Handler para incluir produtos extras
  const handleIncluirProdutosExtra = async () => {
    if (produtosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }

    try {
      let sucessos = 0;
      let erros = 0;

      // Incluir cada produto selecionado
      for (const produto of produtosSelecionados) {
        try {
          const dadosParaIncluir = {
            escola_id: filtros.escola_id,
            grupo: filtros.grupo,
            periodo: {
              consumo_de: filtros.consumo_de,
              consumo_ate: filtros.consumo_ate
            },
            produto_id: produto.produto_id
          };

          const resultado = await incluirProdutoExtra(dadosParaIncluir);
          
          if (resultado.success) {
            sucessos++;
          } else {
            erros++;
          }
        } catch (error) {
          console.error(`Erro ao incluir produto ${produto.produto_nome}:`, error);
          erros++;
        }
      }

      if (sucessos > 0) {
        toast.success(`${sucessos} produto(s) incluído(s) com sucesso!`);
        setModalProdutoExtraAberto(false);
        setProdutosSelecionados([]);
        setSearchProduto('');
        carregarNecessidades(); // Recarregar para mostrar novos produtos
      }

      if (erros > 0) {
        toast.error(`${erros} produto(s) não puderam ser incluídos`);
      }
    } catch (error) {
      console.error('Erro ao incluir produtos extras:', error);
      toast.error('Erro ao incluir produtos extras');
    }
  };

  // Handler para selecionar/deselecionar produto
  const handleToggleProduto = (produto) => {
    setProdutosSelecionados(prev => {
      const jaSelecionado = prev.find(p => p.produto_id === produto.produto_id);
      if (jaSelecionado) {
        return prev.filter(p => p.produto_id !== produto.produto_id);
      } else {
        return [...prev, produto];
      }
    });
  };

  // Handler para selecionar todos os produtos
  const handleSelecionarTodos = () => {
    setProdutosSelecionados(produtosDisponiveis);
  };

  // Handler para desmarcar todos os produtos
  const handleDesmarcarTodos = () => {
    setProdutosSelecionados([]);
  };

  // Handler para exportar para Excel
  const handleExportarExcel = () => {
    if (necessidadesFiltradas.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      // Criar dados para exportação
      const dadosExportacao = necessidadesFiltradas.map(nec => ({
        'Código': nec.codigo_teknisa || 'N/A',
        'Produto': nec.produto,
        'Unidade': nec.produto_unidade,
        'Quantidade Gerada': nec.status === 'NEC NUTRI' 
          ? (nec.ajuste_nutricionista || 0)
          : (nec.ajuste || 0),
        'Ajuste Nutricionista': ajustesLocais[nec.id] || '',
        'Status': nec.status,
        'Escola': nec.escola,
        'Semana Consumo': nec.semana_consumo,
        'Semana Abastecimento': nec.semana_abastecimento
      }));

      // Converter para CSV
      const headers = Object.keys(dadosExportacao[0]);
      const csvContent = [
        headers.join(','),
        ...dadosExportacao.map(row => 
          headers.map(header => `"${row[header]}"`).join(',')
        )
      ].join('\n');

      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `necessidades_ajuste_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    }
  };

  // Handler para exportar para PDF
  const handleExportarPDF = () => {
    if (necessidadesFiltradas.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      // Criar conteúdo HTML para PDF
      const htmlContent = `
        <html>
          <head>
            <title>Necessidades - Ajuste</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>Necessidades - Ajuste por Nutricionista</h1>
            <div class="header">
              <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
              <p><strong>Total de produtos:</strong> ${necessidadesFiltradas.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Unidade</th>
                  <th>Quantidade Gerada</th>
                  <th>Ajuste Nutricionista</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${necessidadesFiltradas.map(nec => `
                  <tr>
                    <td>${nec.codigo_teknisa || 'N/A'}</td>
                    <td>${nec.produto}</td>
                    <td>${nec.produto_unidade}</td>
                    <td>${nec.status === 'NEC NUTRI' ? (nec.ajuste_nutricionista || 0) : (nec.ajuste || 0)}</td>
                    <td>${ajustesLocais[nec.id] || ''}</td>
                    <td>${nec.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Abrir nova janela para impressão
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();

      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    }
  };

  // Buscar produtos com filtro de pesquisa
  const handleSearchProduto = async (search) => {
    setSearchProduto(search);
    try {
      const produtos = await buscarProdutosParaModal({
        grupo: filtros.grupo,
        escola_id: filtros.escola_id,
        semana_consumo: filtros.semana_consumo,
        semana_abastecimento: filtros.semana_abastecimento,
        search
      });

      if (produtos.success) {
        setProdutosDisponiveis(produtos.data);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  // Verificar se pode visualizar
  if (permissionsLoading) {
    return <NecessidadesLoading />;
  }

  if (!canViewAjuste) {
    return (
      <NecessidadesLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o ajuste de necessidades.
          </p>
        </div>
      </NecessidadesLayout>
    );
  }

  // Determinar status atual do conjunto
  const statusAtual = necessidades.length > 0 ? necessidades[0].status : 'NEC';
  
  // Verificar se deve mostrar modo coordenação
  const isModoCoordenacao = statusAtual === 'NEC COORD' && (user?.role === 'coordenador' || user?.role === 'supervisor' || user?.role === 'administrador');
  
  // Se for modo coordenação, mostrar componente de coordenação
  if (isModoCoordenacao) {
    return <CoordenacaoNecessidades />;
  }

  return (
    <>
      <NecessidadesLayout hideHeader={true}>
        {/* Header com Status */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <FaEdit className="mr-2 sm:mr-3 text-blue-600" />
              Ajuste de Necessidade por Nutricionista
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize, edite e ajuste necessidades geradas
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={statusAtual} />
          </div>
        </div>

        {/* Filtros e Informações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            <Button
              onClick={carregarNecessidades}
              variant="primary"
              size="sm"
              disabled={!filtros.escola_id || !filtros.grupo || !filtros.semana_consumo || loading}
              className="flex items-center"
            >
              <FaSearch className="mr-2" />
              Filtrar
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
              <SearchableSelect
                value={filtros.escola_id || ''}
                onChange={(value) => {
                  const escola = escolas.find(e => e.id == value);
                  handleFiltroChange('escola_id', escola?.id || null);
                }}
                options={escolas.map(escola => ({
                  value: escola.id,
                  label: `${escola.nome_escola} - ${escola.rota}`,
                  description: escola.cidade
                }))}
                placeholder="Digite para buscar uma escola..."
                disabled={loading}
                required
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
              <SearchableSelect
                value={filtros.grupo || ''}
                onChange={(value) => {
                  const grupo = grupos.find(g => g.nome == value);
                  handleFiltroChange('grupo', grupo?.nome || null);
                }}
                options={grupos.map(grupo => ({
                  value: grupo.nome,
                  label: grupo.nome
                }))}
                placeholder="Digite para buscar um grupo..."
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semana de Consumo</label>
              <SearchableSelect
                value={filtros.semana_consumo || ''}
                onChange={(value) => {
                  const semana = opcoesSemanasConsumo?.find(s => s.value === value);
                  handleFiltroChange('semana_consumo', semana?.value || null);
                }}
                options={opcoesSemanasConsumo || []}
                placeholder="Selecione a semana de consumo..."
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semana de Abastecimento (AB)</label>
              <SearchableSelect
                value={filtros.semana_abastecimento || ''}
                onChange={(value) => {
                  const semana = opcoesSemanasAbastecimento?.find(s => s.value === value);
                  handleFiltroChange('semana_abastecimento', semana?.value || null);
                }}
                options={opcoesSemanasAbastecimento || []}
                placeholder="Selecione a semana..."
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Lista de Necessidades */}
        {necessidades.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Necessidades Disponíveis para Ajuste ({necessidadesFiltradas.length} de {necessidades.length} produtos)
                  </h3>
                  <div className="w-full max-w-md">
                    <Input
                      type="text"
                      value={buscaProduto}
                      onChange={(e) => setBuscaProduto(e.target.value)}
                      placeholder="Buscar por produto ou código..."
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Botões de Exportação */}
                  <ExportButtons
                    onExportXLSX={handleExportarExcel}
                    onExportPDF={handleExportarPDF}
                    size="sm"
                    variant="outline"
                    showLabels={true}
                    disabled={necessidadesFiltradas.length === 0}
                  />

                  {/* Botões de Ação */}
                  {canEditAjuste && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleAbrirModalProdutoExtra}
                        icon={<FaPlus />}
                      >
                        Incluir Produto Extra
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSalvarAjustes}
                        icon={<FaSave />}
                        disabled={statusAtual === 'NEC COORD'}
                      >
                        Salvar Ajustes
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleLiberarCoordenacao}
                        icon={<FaPaperPlane />}
                        disabled={statusAtual === 'NEC COORD'}
                      >
                        Liberar para Coordenação
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tabela de Produtos */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade (gerada)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ajuste (nutricionista)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {necessidadesFiltradas.map((necessidade) => (
                    <tr key={necessidade.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                        {necessidade.codigo_teknisa || 'N/A'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        {necessidade.produto}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                        {necessidade.produto_unidade}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                        {necessidade.status === 'NEC NUTRI' 
                          ? (necessidade.ajuste_nutricionista || 0)
                          : (necessidade.ajuste || 0)
                        }
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                        <Input
                          type="number"
                          value={ajustesLocais[necessidade.id] || ''}
                          onChange={(e) => handleAjusteChange(necessidade.id, e.target.value)}
                          min="0"
                          step="0.001"
                          className="w-20 text-center text-xs py-1"
                          disabled={statusAtual === 'NEC COORD' || !canEditAjuste}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma necessidade encontrada
            </h3>
            <p className="text-gray-600">
              Não há necessidades disponíveis para ajuste no momento.
            </p>
          </div>
        )}

        {/* Mensagem quando busca não retorna resultados */}
        {necessidades.length > 0 && necessidadesFiltradas.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600">
              Nenhum produto corresponde à busca "{buscaProduto}".
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setBuscaProduto('')}
              className="mt-4"
            >
              Limpar busca
            </Button>
          </div>
        )}
      </NecessidadesLayout>

      {/* Modal de Produto Extra */}
      <Modal
        isOpen={modalProdutoExtraAberto}
        onClose={() => {
          setModalProdutoExtraAberto(false);
          setProdutosSelecionados([]);
          setSearchProduto('');
        }}
        title="Incluir Produtos Extra"
        size="xl"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Produto
            </label>
            <Input
              type="text"
              value={searchProduto}
              onChange={(e) => handleSearchProduto(e.target.value)}
              placeholder="Digite o nome ou código do produto..."
            />
          </div>

          {/* Controles de seleção */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {produtosSelecionados.length} produto(s) selecionado(s)
            </div>
            <div className="space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSelecionarTodos}
                disabled={produtosDisponiveis.length === 0}
              >
                Selecionar Todos
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDesmarcarTodos}
                disabled={produtosSelecionados.length === 0}
              >
                Desmarcar Todos
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Selecionar</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosDisponiveis.map((produto) => {
                  const isSelected = produtosSelecionados.find(p => p.produto_id === produto.produto_id);
                  return (
                    <tr 
                      key={produto.produto_id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-green-50 border-l-4 border-green-500' 
                          : 'bg-white'
                      }`}
                      onClick={() => handleToggleProduto(produto)}
                    >
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => handleToggleProduto(produto)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className={`px-4 py-2 text-sm ${isSelected ? 'text-green-900 font-medium' : 'text-gray-900'}`}>
                        {produto.produto_codigo || 'N/A'}
                      </td>
                      <td className={`px-4 py-2 text-sm font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                        {produto.produto_nome}
                      </td>
                      <td className={`px-4 py-2 text-sm ${isSelected ? 'text-green-700' : 'text-gray-500'}`}>
                        {produto.unidade_medida}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setModalProdutoExtraAberto(false);
                setProdutosSelecionados([]);
                setSearchProduto('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleIncluirProdutosExtra}
              disabled={produtosSelecionados.length === 0}
              icon={<FaPlus />}
            >
              Incluir {produtosSelecionados.length} Produto(s)
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AjusteNecessidades;
