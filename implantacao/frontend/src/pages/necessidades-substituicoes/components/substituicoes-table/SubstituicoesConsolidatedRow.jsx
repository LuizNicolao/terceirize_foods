import React from 'react';
import { FaChevronDown, FaChevronUp, FaSave, FaUndo, FaTrash } from 'react-icons/fa';
import { Button, SearchableSelect } from '../../../../components/ui';
import { formatarQuantidadeComUnidade } from '../../../consulta-status-necessidade/utils/formatarQuantidade';

const SubstituicoesConsolidatedRow = ({
  necessidade,
  chaveOrigem,
  produtoOrigemAtual,
  produtoOrigemAtualId,
  selectedProdutosOrigem,
  selectedProdutosGenericos,
  undGenericos,
  quantidadesGenericos,
  quantidadeConsolidada,
  quantidadeGenericaCalculada,
  expandedRows,
  trocaLoading,
  ajustesAtivados,
  loadingGenericos,
  loadingKey,
  produtosGenericos,
  produtosGrupo,
  onToggleExpand,
  onProdutoOrigemChange,
  onProdutoGenericoChange,
  onDesfazerOrigem,
  onSave,
  onDelete,
  calcularQuantidadeConsolidada
}) => {
  const isExpanded = expandedRows[chaveOrigem];
  const isLoading = trocaLoading[chaveOrigem];
  const temSubstituicoes = necessidade.escolas.some(
    escola => escola.substituicao && escola.substituicao.id
  );

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <button
          onClick={() => onToggleExpand(chaveOrigem)}
          className="text-green-600 hover:text-green-700 focus:outline-none transition-colors"
        >
          {isExpanded ? (
            <FaChevronUp className="w-4 h-4" />
          ) : (
            <FaChevronDown className="w-4 h-4" />
          )}
        </button>
      </td>
      <td className="px-2 py-2 whitespace-nowrap">
        <span className="text-xs font-semibold text-cyan-600">{necessidade.codigo_origem}</span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchableSelect
                value={selectedProdutosOrigem[chaveOrigem] || ''}
                onChange={(value) => onProdutoOrigemChange(chaveOrigem, value)}
                options={(() => {
                  const options = produtosGrupo.map(produto => {
                    const id = produto.produto_id || produto.id || produto.codigo;
                    const nome = produto.produto_nome || produto.nome;
                    const unidade = produto.unidade_medida || produto.unidade || '';
                    return {
                      value: `${id}|${nome}|${unidade}`,
                      label: `${nome}`,
                      description: unidade
                    };
                  });
                  const valorAtual = `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${necessidade.produto_origem_unidade || ''}`;
                  const jaExiste = options.some(opt => opt.value === valorAtual);
                  if (!jaExiste) {
                    options.unshift({
                      value: valorAtual,
                      label: necessidade.produto_origem_nome,
                      description: necessidade.produto_origem_unidade || ''
                    });
                  }
                  return options;
                })()}
                placeholder="Selecione um produto..."
                disabled={
                  !necessidade.substituicoes_existentes ||
                  Boolean(necessidade.produto_trocado_id) ||
                  !ajustesAtivados
                }
                filterBy={(option, searchTerm) =>
                  option.label.toLowerCase().includes(searchTerm.toLowerCase())
                }
                className="text-xs"
                usePortal={false}
              />
            </div>
            <div className="flex items-center gap-1">
              {necessidade.produto_trocado_id && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onDesfazerOrigem(necessidade)}
                  disabled={isLoading}
                  className="p-2"
                  title="Desfazer troca"
                >
                  {isLoading ? (
                    <span className="text-[10px] text-gray-500">...</span>
                  ) : (
                    <FaUndo className="w-3.5 h-3.5 text-amber-700" />
                  )}
                </Button>
              )}
            </div>
          </div>
          {necessidade.produto_trocado_nome && (
            <p className="text-[11px] text-amber-700">
              Original: {necessidade.produto_trocado_nome}
              {necessidade.produto_trocado_unidade && ` (${necessidade.produto_trocado_unidade})`}
            </p>
          )}
        </div>
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <span className="text-xs text-gray-700">{necessidade.produto_origem_unidade}</span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <span className="text-xs text-gray-900 font-semibold">
          {formatarQuantidadeComUnidade(
            quantidadeConsolidada > 0 
              ? quantidadeConsolidada 
              : (necessidade.quantidade_total_origem || 0),
            necessidade.produto_origem_unidade || ''
          )}
        </span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <span className="text-xs text-blue-600 font-medium">
          {necessidade.semana_abastecimento || '-'}
        </span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <span className="text-xs text-green-600 font-medium">
          {necessidade.semana_consumo || '-'}
        </span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap">
        <span className="text-xs text-purple-600">
          {selectedProdutosGenericos[chaveOrigem]?.split('|')[0] || necessidade.produto_generico_codigo || '-'}
        </span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex-1">
          <SearchableSelect
            value={selectedProdutosGenericos[chaveOrigem] || ''}
            onChange={(value) => onProdutoGenericoChange(chaveOrigem, value, necessidade)}
            options={produtosGenericos[produtoOrigemAtualId]?.map(produto => ({
              value: `${produto.id || produto.codigo}|${produto.nome}|${produto.unidade_medida_sigla || produto.unidade || produto.unidade_medida || ''}|${produto.fator_conversao || 1}`,
              label: produto.nome
            })) || []}
            placeholder="Selecione..."
            disabled={!ajustesAtivados || loadingGenericos[loadingKey]}
            className="text-xs"
            filterBy={(option, searchTerm) => {
              return option.label.toLowerCase().includes(searchTerm.toLowerCase());
            }}
            usePortal={false}
          />
        </div>
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <span className="text-xs text-gray-700">
          {undGenericos[chaveOrigem] || necessidade.produto_generico_unidade || '-'}
        </span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <span className="text-xs text-cyan-600 font-semibold">
          {formatarQuantidadeComUnidade(
            quantidadeGenericaCalculada || (quantidadesGenericos[chaveOrigem] !== undefined ? quantidadesGenericos[chaveOrigem] : 0),
            undGenericos[chaveOrigem] || necessidade.produto_generico_unidade || ''
          )}
        </span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-center">
        {ajustesAtivados && (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="xs"
              variant="success"
              onClick={() => onSave(necessidade)}
              className="flex items-center justify-center"
              title="Salvar"
            >
              <FaSave className="w-4 h-4" />
            </Button>
            {temSubstituicoes && onDelete && (
              <button
                onClick={() => onDelete(necessidade)}
                className="text-red-600 hover:text-red-800 transition-colors p-1"
                title="Excluir todas as substituições deste consolidado"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default SubstituicoesConsolidatedRow;

