import React, { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNecessidadesAjuste } from '../../hooks/useNecessidadesAjuste';
import useNecessidadesCoordenacao from '../../hooks/useNecessidadesCoordenacao';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import {
  NecessidadesLayout,
  NecessidadesLoading
} from '../../components/necessidades';
import NecessidadesTabs from '../../components/necessidades/NecessidadesTabs';
import { ExportButtons } from '../../components/shared';
import necessidadesService from '../../services/necessidadesService';
import toast from 'react-hot-toast';

// Componentes extraídos
import AjusteFiltros from '../../components/necessidades/ajuste/AjusteFiltros';
import AjusteTabelaNutricionista from '../../components/necessidades/ajuste/AjusteTabelaNutricionista';
import AjusteTabelaCoordenacao from '../../components/necessidades/ajuste/AjusteTabelaCoordenacao';
import ModalProdutoExtra from '../../components/necessidades/ajuste/ModalProdutoExtra';
import AjusteActions from '../../components/necessidades/ajuste/AjusteActions';
import AjusteEmptyStates from '../../components/necessidades/ajuste/AjusteEmptyStates';

const AjusteNecessidades = () => {
  const { user } = useAuth();
  const { canView, canEdit, loading: permissionsLoading } = usePermissions();
  // Inicializar aba baseada no tipo de usuário
  const getInitialTab = () => {
    if (user?.tipo_de_acesso === 'coordenador') {
      return 'coordenacao';
    }
    return 'nutricionista';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [modalProdutoExtraAberto, setModalProdutoExtraAberto] = useState(false);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [searchProduto, setSearchProduto] = useState('');

  // Hook para gerenciar ajuste de necessidades (nutricionista)
  const {
    necessidades: necessidadesNutricionista,
    escolas,
    grupos,
    filtros: filtrosNutricionista,
    loading: loadingNutricionista,
    error: errorNutricionista,
    carregarNecessidades: carregarNecessidadesNutricionista,
    salvarAjustes: salvarAjustesNutricionista,
    incluirProdutoExtra: incluirProdutoExtraNutricionista,
    liberarCoordenacao,
    buscarProdutosParaModal: buscarProdutosParaModalNutricionista,
    atualizarFiltros: atualizarFiltrosNutricionista,
    exportarXLSX: exportarXLSXNutricionista,
    exportarPDF: exportarPDFNutricionista
  } = useNecessidadesAjuste();

  // Hook para gerenciar coordenação
  const {
    necessidades: necessidadesCoordenacao,
    nutricionistas,
    filtros: filtrosCoordenacao,
    loading: loadingCoordenacao,
    error: errorCoordenacao,
    carregarNecessidades: carregarNecessidadesCoordenacao,
    carregarNutricionistas,
    salvarAjustes: salvarAjustesCoordenacao,
    liberarParaLogistica,
    buscarProdutosParaModal: buscarProdutosParaModalCoordenacao,
    incluirProdutoExtra: incluirProdutoExtraCoordenacao,
    atualizarFiltros: atualizarFiltrosCoordenacao
  } = useNecessidadesCoordenacao();

  // Hook para semanas de abastecimento
  const { opcoes: opcoesSemanasAbastecimento } = useSemanasAbastecimento();
  
  // Hook para semanas de consumo do calendário
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo();

  // Estados locais para edição
  const [ajustesLocais, setAjustesLocais] = useState({});
  const [necessidadeAtual, setNecessidadeAtual] = useState(null);
  const [buscaProduto, setBuscaProduto] = useState('');

  // Dados baseados na aba ativa
  const necessidades = activeTab === 'nutricionista' ? necessidadesNutricionista : necessidadesCoordenacao;
  const filtros = activeTab === 'nutricionista' ? filtrosNutricionista : filtrosCoordenacao;
  const loading = activeTab === 'nutricionista' ? loadingNutricionista : loadingCoordenacao;
  const error = activeTab === 'nutricionista' ? errorNutricionista : errorCoordenacao;
  const [necessidadesFiltradas, setNecessidadesFiltradas] = useState([]);

  // Verificar permissões específicas
  const tiposComAcesso = ['nutricionista', 'coordenador', 'supervisor', 'administrador'];
  const canViewAjuste = canView('analise_necessidades') || tiposComAcesso.includes(user.tipo_de_acesso);
  const canEditAjuste = canEdit('analise_necessidades') || tiposComAcesso.includes(user.tipo_de_acesso);

  // Carregar necessidades apenas quando o botão filtrar for clicado
  // useEffect removido - carregamento manual via botão

  // Carregar nutricionistas quando aba de coordenação for ativada
  useEffect(() => {
    if (activeTab === 'coordenacao') {
      carregarNutricionistas();
    }
  }, [activeTab, carregarNutricionistas]);

  // Limpar filtros quando muda de aba para garantir independência
  useEffect(() => {
    if (activeTab === 'nutricionista') {
      // Limpar filtros da coordenação
      atualizarFiltrosCoordenacao({
        escola_id: null,
        grupo: null,
        semana_consumo: null,
        semana_abastecimento: null,
        nutricionista_id: null
      });
    } else if (activeTab === 'coordenacao') {
      // Limpar filtros da nutricionista
      atualizarFiltrosNutricionista({
        escola_id: null,
        grupo: null,
        semana_consumo: null,
        semana_abastecimento: null
      });
    }
  }, [activeTab, atualizarFiltrosCoordenacao, atualizarFiltrosNutricionista]);

  // Função wrapper para carregar necessidades baseado na aba ativa
  const carregarNecessidades = () => {
    // Validação específica por aba
    if (activeTab === 'nutricionista') {
      // Para nutricionista: escola, grupo e semana são obrigatórios
      if (!filtros.escola_id || !filtros.grupo || !filtros.semana_consumo) {
        toast.error('Preencha todos os filtros obrigatórios');
        return;
      }
      carregarNecessidadesNutricionista();
    } else {
      // Para coordenação: pelo menos um filtro deve ser preenchido
      if (!filtros.escola_id && !filtros.nutricionista_id && !filtros.grupo && !filtros.semana_consumo && !filtros.semana_abastecimento) {
        toast.error('Selecione ao menos um filtro para buscar');
        return;
      }
      carregarNecessidadesCoordenacao();
    }
  };

  // Inicializar ajustes locais quando necessidades carregarem
  useEffect(() => {
    if (necessidades.length > 0) {
      const ajustesIniciais = {};
      necessidades.forEach(nec => {
        if (activeTab === 'coordenacao') {
          // Para coordenação: sempre deixar em branco (igual nutricionista)
          ajustesIniciais[nec.id] = '';
        } else {
          // Para nutricionista: lógica original
          if (nec.status === 'NEC NUTRI') {
            ajustesIniciais[nec.id] = ''; // Sempre em branco para NEC NUTRI
          } else {
            const valorInicial = nec.ajuste || 0;
            ajustesIniciais[nec.id] = valorInicial === 0 ? '' : valorInicial;
          }
        }
      });
      setAjustesLocais(ajustesIniciais);
      setNecessidadeAtual(necessidades[0]); // Para obter informações do conjunto
      setNecessidadesFiltradas(necessidades); // Inicializar filtro
    }
  }, [necessidades, activeTab]);

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
    if (activeTab === 'nutricionista') {
      atualizarFiltrosNutricionista({ [campo]: valor });
    } else {
      atualizarFiltrosCoordenacao({ [campo]: valor });
    }
  };

  // Handler para mudança de ajuste local
  const handleAjusteChange = (necessidadeId, valor) => {
    setAjustesLocais(prev => ({
      ...prev,
      [necessidadeId]: parseFloat(valor) || 0
    }));
  };

  // Handler para excluir necessidade
  const handleExcluirNecessidade = async (necessidadeId) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto da necessidade?')) {
      return;
    }

    try {
      const response = await necessidadesService.deletar(necessidadeId);
      
      if (response.success) {
        toast.success('Produto excluído com sucesso!');
        carregarNecessidades(); // Recarregar para atualizar a lista
      } else {
        toast.error(response.message || 'Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir necessidade:', error);
      toast.error('Erro ao excluir produto');
    }
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
        .map(([necessidadeId, ajuste]) => {
          if (activeTab === 'coordenacao') {
            // Para coordenação: backend espera { id, ajuste }
            return {
              id: parseInt(necessidadeId),
              ajuste: parseFloat(ajuste)
            };
          } else {
            // Para nutricionista: backend espera { necessidade_id, ajuste_nutricionista }
            return {
              necessidade_id: parseInt(necessidadeId),
              ajuste_nutricionista: parseFloat(ajuste)
            };
          }
        });

      const dadosParaSalvar = {
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        periodo: {
          consumo_de: filtros.consumo_de,
          consumo_ate: filtros.consumo_ate
        },
        itens
      };

      const resultado = activeTab === 'nutricionista' 
        ? await salvarAjustesNutricionista(dadosParaSalvar)
        : await salvarAjustesCoordenacao(itens);
      
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

      const resultado = activeTab === 'nutricionista' 
        ? await liberarCoordenacao(dadosParaLiberar)
        : await liberarParaLogistica([necessidadeAtual.necessidade_id]);
      
      if (resultado.success) {
        const mensagem = activeTab === 'nutricionista' 
          ? 'Necessidades liberadas para coordenação!'
          : 'Necessidades liberadas para logística!';
        toast.success(mensagem);
        carregarNecessidades(); // Recarregar para atualizar status
      }
    } catch (error) {
      console.error('Erro ao liberar para coordenação:', error);
      toast.error('Erro ao liberar para coordenação');
    }
  };

  // Handler para abrir modal de produto extra
  const handleAbrirModalProdutoExtra = async () => {
    // Validação específica por aba
    if (activeTab === 'coordenacao') {
      // Para coordenação: sempre validar filtros
      if (!filtros.escola_id) {
        toast.error('É necessário selecionar uma escola para incluir produtos');
        return;
      }
      
      if (!filtros.grupo) {
        toast.error('É necessário selecionar um grupo para incluir produtos');
        return;
      }
    } else {
      // Para nutricionista: validar necessidade atual
      if (!necessidadeAtual) {
        toast.error('Nenhuma necessidade selecionada');
        return;
      }
      
      if (!filtros.grupo) {
        toast.error('É necessário selecionar um grupo para incluir produtos');
        return;
      }
    }

    try {
      const buscarProdutos = activeTab === 'nutricionista' 
        ? buscarProdutosParaModalNutricionista
        : buscarProdutosParaModalCoordenacao;

      const produtos = await buscarProdutos({
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

      // Selecionar função correta baseada na aba ativa
      const incluirProduto = activeTab === 'nutricionista'
        ? incluirProdutoExtraNutricionista
        : incluirProdutoExtraCoordenacao;

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

          const resultado = await incluirProduto(dadosParaIncluir);
          
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

  // Handlers para exportação usando hook padronizado
  const handleExportarExcel = () => {
    const exportFunc = activeTab === 'nutricionista' ? exportarXLSXNutricionista : exportarXLSXCoordenacao;
    exportFunc(filtros);
  };

  const handleExportarPDF = () => {
    const exportFunc = activeTab === 'nutricionista' ? exportarPDFNutricionista : exportarPDFCoordenacao;
    exportFunc(filtros);
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

  return (
    <>
      <NecessidadesLayout hideHeader={true}>
        {/* Header com Status */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <FaEdit className="mr-2 sm:mr-3 text-blue-600" />
              {activeTab === 'nutricionista' ? 'Ajuste de Necessidade por Nutricionista' : 'Ajuste de Necessidade por Coordenação'}
            </h1>
            <p className="text-gray-600 mt-1">
              {activeTab === 'nutricionista' 
                ? 'Visualize, edite e ajuste necessidades geradas' 
                : 'Visualize, edite e ajuste necessidades para coordenação'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={statusAtual} />
            {/* Botões de Exportação */}
            <ExportButtons
              onExportXLSX={handleExportarExcel}
              onExportPDF={handleExportarPDF}
              size="sm"
              variant="outline"
              showLabels={true}
              disabled={necessidadesFiltradas.length === 0}
            />
          </div>
        </div>

        {/* Abas */}
        <NecessidadesTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          userType={user?.tipo_de_acesso}
        />

        {/* Filtros */}
        <AjusteFiltros
          activeTab={activeTab}
          filtros={filtros}
          escolas={escolas}
          grupos={grupos}
          nutricionistas={nutricionistas}
          opcoesSemanasConsumo={opcoesSemanasConsumo}
          opcoesSemanasAbastecimento={opcoesSemanasAbastecimento}
          loading={loading}
          onFiltroChange={handleFiltroChange}
          onFiltrar={carregarNecessidades}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Lista de Necessidades */}
        {necessidades.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <AjusteActions
              buscaProduto={buscaProduto}
              onBuscaChange={setBuscaProduto}
              onIncluirProduto={handleAbrirModalProdutoExtra}
              onSalvarAjustes={handleSalvarAjustes}
              onLiberar={handleLiberarCoordenacao}
              canEdit={canEditAjuste}
              activeTab={activeTab}
              statusAtual={statusAtual}
              filtros={filtros}
              disabledSalvar={activeTab === 'nutricionista' && statusAtual === 'NEC NUTRI'}
              disabledLiberar={activeTab === 'nutricionista' && statusAtual === 'NEC NUTRI'}
              titleIncluir={activeTab === 'coordenacao' && !filtros.escola_id ? 'Selecione uma escola e clique em Filtrar antes de incluir produtos' : undefined}
            />
            
            {/* Tabela de Produtos */}
            {activeTab === 'coordenacao' ? (
              <AjusteTabelaCoordenacao
                necessidades={necessidadesFiltradas}
                ajustesLocais={ajustesLocais}
                onAjusteChange={handleAjusteChange}
                onExcluirNecessidade={handleExcluirNecessidade}
                canEdit={canEditAjuste}
              />
            ) : (
              <AjusteTabelaNutricionista
                necessidades={necessidadesFiltradas}
                ajustesLocais={ajustesLocais}
                onAjusteChange={handleAjusteChange}
                onExcluirNecessidade={handleExcluirNecessidade}
                canEdit={canEditAjuste}
              />
            )}
          </div>
        ) : !loading && (
          <AjusteEmptyStates
            type="empty"
            message="Nenhuma necessidade encontrada"
          />
        )}

        {/* Mensagem quando busca não retorna resultados */}
        {necessidades.length > 0 && necessidadesFiltradas.length === 0 && (
          <AjusteEmptyStates
            type="busca"
            buscaProduto={buscaProduto}
            onClearSearch={() => setBuscaProduto('')}
          />
        )}
      </NecessidadesLayout>

      {/* Modal de Produto Extra */}
      <ModalProdutoExtra
        isOpen={modalProdutoExtraAberto}
        onClose={() => {
          setModalProdutoExtraAberto(false);
          setProdutosSelecionados([]);
          setSearchProduto('');
        }}
        produtosDisponiveis={produtosDisponiveis}
        produtosSelecionados={produtosSelecionados}
        onToggleProduto={handleToggleProduto}
        onSelecionarTodos={handleSelecionarTodos}
        onDesmarcarTodos={handleDesmarcarTodos}
        onIncluirProdutos={handleIncluirProdutosExtra}
        searchProduto={searchProduto}
        onSearchChange={handleSearchProduto}
      />
    </>
  );
};

export default AjusteNecessidades;
