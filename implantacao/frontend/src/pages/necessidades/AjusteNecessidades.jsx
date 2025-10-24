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
import { Modal, Button, Input, SearchableSelect } from '../../components/ui';
import toast from 'react-hot-toast';

const AjusteNecessidades = () => {
  const { user } = useAuth();
  const { canView, canEdit, loading: permissionsLoading } = usePermissions();
  const [modalProdutoExtraAberto, setModalProdutoExtraAberto] = useState(false);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [searchProduto, setSearchProduto] = useState('');

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
        ajustesIniciais[nec.id] = nec.ajuste_nutricionista || nec.ajuste || 0;
      });
      setAjustesLocais(ajustesIniciais);
      setNecessidadeAtual(necessidades[0]); // Para obter informações do conjunto
    }
  }, [necessidades]);

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
      const itens = Object.entries(ajustesLocais).map(([necessidadeId, ajuste]) => ({
        necessidade_id: parseInt(necessidadeId),
        ajuste_nutricionista: ajuste
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
        consumo_de: filtros.consumo_de,
        consumo_ate: filtros.consumo_ate
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

  // Handler para incluir produto extra
  const handleIncluirProdutoExtra = async () => {
    if (!produtoSelecionado) {
      toast.error('Selecione um produto');
      return;
    }

    try {
      const dadosParaIncluir = {
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        periodo: {
          consumo_de: filtros.consumo_de,
          consumo_ate: filtros.consumo_ate
        },
        produto_id: produtoSelecionado.produto_id
      };

      const resultado = await incluirProdutoExtra(dadosParaIncluir);
      
      if (resultado.success) {
        toast.success('Produto extra incluído com sucesso!');
        setModalProdutoExtraAberto(false);
        setProdutoSelecionado(null);
        setSearchProduto('');
        carregarNecessidades(); // Recarregar para mostrar novo produto
      }
    } catch (error) {
      console.error('Erro ao incluir produto extra:', error);
      toast.error('Erro ao incluir produto extra');
    }
  };

  // Buscar produtos com filtro de pesquisa
  const handleSearchProduto = async (search) => {
    setSearchProduto(search);
    try {
      const produtos = await buscarProdutosParaModal({
        grupo: filtros.grupo,
        escola_id: filtros.escola_id,
        consumo_de: filtros.consumo_de,
        consumo_ate: filtros.consumo_ate,
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

        {/* Card de Informações da Escola */}
        {necessidadeAtual && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Informações da Escola</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Escola</label>
                <p className="text-blue-900 font-medium">{necessidadeAtual.escola}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Nutricionista</label>
                <p className="text-blue-900 font-medium">{user.nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Grupo</label>
                <p className="text-blue-900 font-medium">{filtros.grupo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Período de Consumo</label>
                <p className="text-blue-900 font-medium">{necessidadeAtual.semana_consumo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Período de Abastecimento</label>
                <p className="text-blue-900 font-medium">{necessidadeAtual.semana_abastecimento || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
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

        {/* Lista de Necessidades Agrupadas por Escola */}
        {necessidades.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Necessidades Disponíveis para Ajuste ({necessidades.length} produtos)
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {(() => {
                // Agrupar necessidades por escola e necessidade_id
                const agrupadas = necessidades.reduce((acc, necessidade) => {
                  const chave = `${necessidade.escola_id}-${necessidade.necessidade_id}`;
                  if (!acc[chave]) {
                    acc[chave] = {
                      necessidade_id: necessidade.necessidade_id,
                      escola_id: necessidade.escola_id,
                      escola: necessidade.escola,
                      semana_consumo: necessidade.semana_consumo,
                      semana_abastecimento: necessidade.semana_abastecimento,
                      status: necessidade.status,
                      produtos: []
                    };
                  }
                  acc[chave].produtos.push(necessidade);
                  return acc;
                }, {});

                return Object.values(agrupadas).map((grupo, index) => (
                  <div key={index} className="p-6">
                    {/* Cabeçalho da Escola */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {grupo.escola}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Semana de Consumo: {grupo.semana_consumo}</span>
                          <span>•</span>
                          <span>ID: {grupo.necessidade_id}</span>
                          <span>•</span>
                          <StatusBadge status={grupo.status} />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                          {grupo.produtos.length} produtos
                        </span>
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
                          {grupo.produtos.map((necessidade) => (
                            <tr key={necessidade.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {necessidade.codigo_teknisa || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {necessidade.produto}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {necessidade.produto_unidade}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                {necessidade.ajuste || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                <Input
                                  type="number"
                                  value={ajustesLocais[necessidade.id] || ''}
                                  onChange={(e) => handleAjusteChange(necessidade.id, e.target.value)}
                                  min="0"
                                  step="0.001"
                                  className="w-24 text-center"
                                  disabled={statusAtual === 'NEC COORD' || !canEditAjuste}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Botões de Ação para o Grupo */}
                    {canEditAjuste && (
                      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
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
                ));
              })()}
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
      </NecessidadesLayout>

      {/* Modal de Produto Extra */}
      <Modal
        isOpen={modalProdutoExtraAberto}
        onClose={() => setModalProdutoExtraAberto(false)}
        title="Incluir Produto Extra"
        size="lg"
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

          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosDisponiveis.map((produto) => (
                  <tr key={produto.produto_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{produto.produto_codigo || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{produto.produto_nome}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{produto.unidade_medida}</td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setProdutoSelecionado(produto)}
                        disabled={produtoSelecionado?.produto_id === produto.produto_id}
                      >
                        {produtoSelecionado?.produto_id === produto.produto_id ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setModalProdutoExtraAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleIncluirProdutoExtra}
              disabled={!produtoSelecionado}
              icon={<FaPlus />}
            >
              Incluir Produto
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AjusteNecessidades;
