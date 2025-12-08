import React, { useMemo } from 'react';
import { Pagination, ConfirmModal } from '../../../components/ui';
import toast from 'react-hot-toast';
import useSubstituicoesTableState from '../../../hooks/necessidades/useSubstituicoesTableState';
import useSubstituicoesCalculos from '../../../hooks/necessidades/useSubstituicoesCalculos';
import useSubstituicoesHandlers from '../../../hooks/necessidades/useSubstituicoesHandlers';
import { 
  SubstituicoesTableHeader, 
  SubstituicoesConsolidatedRow, 
  SubstituicoesExpandedRow 
} from './substituicoes-table';

const SubstituicoesTableNutricionista = ({
  necessidades,
  produtosGenericos,
  loadingGenericos,
  onBuscarProdutosGenericos,
  ajustesAtivados = false,
  onExpand,
  onSaveConsolidated,
  onSaveIndividual,
  onTrocarProdutoOrigem,
  onDesfazerTroca,
  onDeletarSubstituicao
}) => {
  // Hook para gerenciar estados da tabela
  const tableState = useSubstituicoesTableState(necessidades);
  const {
    expandedRows,
    selectedProdutosGenericos,
    setSelectedProdutosGenericos,
    quantidadesGenericos,
    setQuantidadesGenericos,
    undGenericos,
    setUndGenericos,
    produtosPadraoSelecionados,
    setProdutosPadraoSelecionados,
    selectedProdutosPorEscola,
    setSelectedProdutosPorEscola,
    selectedProdutosOrigem,
    setSelectedProdutosOrigem,
    selectedProdutosOrigemPorEscola,
    setSelectedProdutosOrigemPorEscola,
    trocaLoading,
    setTrocaLoading,
    origemInicialPorEscola,
    setOrigemInicialPorEscola,
    quantidadesOrigemEditadas,
    setQuantidadesOrigemEditadas,
    showDeleteIndividualModal,
    setShowDeleteIndividualModal,
    substituicaoToDelete,
    setSubstituicaoToDelete,
    showDeleteConsolidatedModal,
    setShowDeleteConsolidatedModal,
    necessidadeToDelete,
    setNecessidadeToDelete,
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    necessidadesPaginadas,
    getChaveOrigem,
    handleToggleExpand
  } = tableState;

  // Hook para cálculos
  const calculos = useSubstituicoesCalculos({
    quantidadesOrigemEditadas,
    getChaveOrigem
  });
  const {
    calcularQuantidadeConsolidada,
    recalcularQuantidadeGenerica: recalcularQuantidadeGenericaHook,
    getQuantidadeOrigemAtual,
    getQuantidadeOrigemFormatted
  } = calculos;

  const recalcularQuantidadeGenerica = (necessidade, chaveOrigem) => {
    recalcularQuantidadeGenericaHook(necessidade, chaveOrigem, selectedProdutosGenericos, setQuantidadesGenericos);
  };

  const getProdutoOrigemSelecionadoInfo = (necessidade) => {
    const chave = getChaveOrigem(necessidade);
    const selecionado = selectedProdutosOrigem[chave];

    if (selecionado) {
      const [id, nome, unidade] = selecionado.split('|');
      return {
        id: id || necessidade.codigo_origem,
        nome: nome || necessidade.produto_origem_nome,
        unidade: unidade || necessidade.produto_origem_unidade || ''
      };
    }

    return {
      id: necessidade.codigo_origem,
      nome: necessidade.produto_origem_nome,
      unidade: necessidade.produto_origem_unidade || ''
    };
  };

  const getLoadingKey = (produtoId, grupo, search = '') => `${produtoId}_${grupo || ''}_${search}`;

  // Hook para handlers
  const handlers = useSubstituicoesHandlers({
    necessidades,
    produtosGenericos,
    onBuscarProdutosGenericos,
    onTrocarProdutoOrigem,
    onDesfazerTroca,
    onSaveConsolidated,
    onSaveIndividual,
    onDeletarSubstituicao,
    getChaveOrigem,
    getProdutoOrigemSelecionadoInfo,
    calcularQuantidadeConsolidada,
    recalcularQuantidadeGenerica,
    selectedProdutosOrigem,
    setSelectedProdutosOrigem,
    selectedProdutosGenericos,
    setSelectedProdutosGenericos,
    setUndGenericos,
    setQuantidadesGenericos,
    setProdutosPadraoSelecionados,
    selectedProdutosPorEscola,
    setSelectedProdutosPorEscola,
    selectedProdutosOrigemPorEscola,
    setSelectedProdutosOrigemPorEscola,
    setTrocaLoading,
    origemInicialPorEscola,
    setOrigemInicialPorEscola,
    quantidadesOrigemEditadas,
    setQuantidadesOrigemEditadas,
    produtosPadraoSelecionados
  });

  const {
    handleProdutoOrigemChange,
    handleDesfazerOrigem,
    processarTrocaProdutoOrigem,
    handleProdutoGenericoChange,
    handleQuantidadeOrigemChange,
    handleProdutoOrigemIndividualChange,
    handleProdutoGenericoIndividualChange,
    handleSaveConsolidated,
    handleSaveIndividual,
    handleDeleteConsolidated,
    handleDeleteIndividual
  } = handlers;

  // Handlers de confirmação de exclusão (locais)
  const onDeleteConsolidatedClick = (necessidade) => {
    const result = handleDeleteConsolidated(necessidade);
    if (result) {
      setNecessidadeToDelete(result);
      setShowDeleteConsolidatedModal(true);
    }
  };

  const confirmDeleteConsolidated = async () => {
    if (!necessidadeToDelete || !onDeletarSubstituicao) return;

    const { substituicoesIds } = necessidadeToDelete;

    try {
      // Excluir todas as substituições em paralelo
      const promises = substituicoesIds.map(id => onDeletarSubstituicao(id));
      const resultados = await Promise.all(promises);

      // Verificar se todas foram excluídas com sucesso
      const sucessos = resultados.filter(r => r && r.success).length;
      const falhas = resultados.filter(r => !r || !r.success).length;

      if (sucessos > 0) {
        toast.success(`${sucessos} ${sucessos === 1 ? 'substituição excluída' : 'substituições excluídas'} com sucesso!`);
      }

      if (falhas > 0) {
        toast.error(`${falhas} ${falhas === 1 ? 'substituição falhou' : 'substituições falharam'} ao ser excluída`);
      }

      // A lista será recarregada automaticamente pelo hook
    } catch (error) {
      console.error('Erro ao excluir substituições consolidadas:', error);
      toast.error('Erro ao excluir substituições');
    } finally {
      setShowDeleteConsolidatedModal(false);
      setNecessidadeToDelete(null);
    }
  };

  const onDeleteIndividualClick = (escola) => {
    const id = handleDeleteIndividual(escola);
    if (id) {
      setSubstituicaoToDelete(id);
      setShowDeleteIndividualModal(true);
    }
  };

  const confirmDeleteIndividual = async () => {
    if (!substituicaoToDelete || !onDeletarSubstituicao) return;

    const response = await onDeletarSubstituicao(substituicaoToDelete);
    if (response && response.success) {
      // A lista será recarregada automaticamente pelo hook
    }

    setShowDeleteIndividualModal(false);
    setSubstituicaoToDelete(null);
  };


  if (necessidades.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-600">Nenhuma necessidade encontrada para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full divide-y divide-gray-200">
          <SubstituicoesTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {necessidadesPaginadas.map((necessidade, index) => {
              const chaveOrigem = getChaveOrigem(necessidade);
              const produtoOrigemAtual = getProdutoOrigemSelecionadoInfo(necessidade);
              const produtoOrigemAtualId = produtoOrigemAtual.id;
              const loadingKey = getLoadingKey(produtoOrigemAtualId, necessidade.grupo);
              // Usar índice global para garantir chave única, já que podem haver múltiplas necessidades com mesma chaveOrigem
              // Calcular índice global baseado na página atual e índice na página
              const indiceGlobal = (page - 1) * itemsPerPage + index;
              const keyUnica = `${chaveOrigem}-${indiceGlobal}`;
              const quantidadeConsolidada = calcularQuantidadeConsolidada(necessidade);
              const produtoGenericoSelecionado = selectedProdutosGenericos[chaveOrigem];
              const quantidadeGenericaCalculada = useMemo(() => {
                if (produtoGenericoSelecionado && quantidadeConsolidada > 0) {
                  const partes = produtoGenericoSelecionado.split('|');
                  const fatorConversao = parseFloat(partes[3]) || 1;
                  if (fatorConversao > 0) {
                    return Math.ceil(quantidadeConsolidada / fatorConversao).toString();
                  }
                }
                return quantidadesGenericos[chaveOrigem] !== undefined ? quantidadesGenericos[chaveOrigem] : '0,000';
              }, [produtoGenericoSelecionado, quantidadeConsolidada, quantidadesGenericos, chaveOrigem]);

              return (
              <React.Fragment key={keyUnica}>
                  <SubstituicoesConsolidatedRow
                    necessidade={necessidade}
                    chaveOrigem={chaveOrigem}
                    produtoOrigemAtual={produtoOrigemAtual}
                    produtoOrigemAtualId={produtoOrigemAtualId}
                    selectedProdutosOrigem={selectedProdutosOrigem}
                    selectedProdutosGenericos={selectedProdutosGenericos}
                    undGenericos={undGenericos}
                    quantidadesGenericos={quantidadesGenericos}
                    quantidadeConsolidada={quantidadeConsolidada}
                    quantidadeGenericaCalculada={quantidadeGenericaCalculada}
                    expandedRows={expandedRows}
                    trocaLoading={trocaLoading}
                    ajustesAtivados={ajustesAtivados}
                    loadingGenericos={loadingGenericos}
                    loadingKey={loadingKey}
                    produtosGenericos={produtosGenericos}
                    produtosGrupo={necessidade.produtos_grupo || []}
                    onToggleExpand={handleToggleExpand}
                    onProdutoOrigemChange={handleProdutoOrigemChange}
                    onProdutoGenericoChange={handleProdutoGenericoChange}
                    onDesfazerOrigem={handleDesfazerOrigem}
                    onSave={handleSaveConsolidated}
                    onDelete={onDeleteConsolidatedClick}
                    calcularQuantidadeConsolidada={calcularQuantidadeConsolidada}
                  />
                {expandedRows[chaveOrigem] && (
                    <SubstituicoesExpandedRow
                      necessidade={necessidade}
                      chaveOrigem={chaveOrigem}
                      produtosGenericos={produtosGenericos}
                      produtoOrigemAtualId={produtoOrigemAtualId}
                      selectedProdutosPorEscola={selectedProdutosPorEscola}
                      selectedProdutosOrigemPorEscola={selectedProdutosOrigemPorEscola}
                      origemInicialPorEscola={origemInicialPorEscola}
                      selectedProdutosOrigem={selectedProdutosOrigem}
                      quantidadesOrigemEditadas={quantidadesOrigemEditadas}
                      ajustesAtivados={ajustesAtivados}
                      onProdutoOrigemIndividualChange={handleProdutoOrigemIndividualChange}
                      onQuantidadeOrigemChange={handleQuantidadeOrigemChange}
                      onProdutoGenericoIndividualChange={handleProdutoGenericoIndividualChange}
                      onSaveIndividual={handleSaveIndividual}
                      onDeleteIndividual={onDeleteIndividualClick}
                      getQuantidadeOrigemFormatted={getQuantidadeOrigemFormatted}
                      getQuantidadeOrigemAtual={getQuantidadeOrigemAtual}
                    />
                )}
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
        
        {/* Paginação */}
        {necessidades.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(necessidades.length / itemsPerPage)}
              totalItems={necessidades.length}
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

      {/* Modal de Confirmação de Exclusão Individual */}
      <ConfirmModal
        isOpen={showDeleteIndividualModal}
        onClose={() => {
          setShowDeleteIndividualModal(false);
          setSubstituicaoToDelete(null);
        }}
        onConfirm={confirmDeleteIndividual}
        title="Excluir Substituição"
        message="Tem certeza que deseja excluir esta substituição? Ela será removida da visualização."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Confirmação de Exclusão Consolidada */}
      <ConfirmModal
        isOpen={showDeleteConsolidatedModal}
        onClose={() => {
          setShowDeleteConsolidatedModal(false);
          setNecessidadeToDelete(null);
        }}
        onConfirm={confirmDeleteConsolidated}
        title="Excluir Substituições"
        message={necessidadeToDelete ? 
          `Tem certeza que deseja excluir ${necessidadeToDelete.substituicoesIds.length} ${necessidadeToDelete.substituicoesIds.length === 1 ? 'substituição' : 'substituições'} de ${necessidadeToDelete.necessidade.escolas.length} ${necessidadeToDelete.necessidade.escolas.length === 1 ? 'escola' : 'escolas'}? Elas serão removidas da visualização.` :
          'Tem certeza que deseja excluir estas substituições? Elas serão removidas da visualização.'
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default SubstituicoesTableNutricionista;
