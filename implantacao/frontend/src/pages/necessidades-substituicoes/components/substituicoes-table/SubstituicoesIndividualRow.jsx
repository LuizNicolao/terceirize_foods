import React from 'react';
import { FaSave, FaTrash } from 'react-icons/fa';
import { Button, Input, SearchableSelect } from '../../../../components/ui';

const SubstituicoesIndividualRow = ({
  escola,
  necessidade,
  chaveOrigem,
  chaveEscola,
  valorOrigemAtual,
  produtoSelecionado,
  opcoesGenericos,
  quantidadeOrigemFormatted,
  quantidadeGenerica,
  ajustesAtivados,
  onProdutoOrigemChange,
  onQuantidadeOrigemChange,
  onProdutoGenericoChange,
  onSave,
  onDelete
}) => {
  const partes = produtoSelecionado ? produtoSelecionado.split('|') : [];
  const codigoProduto = partes[0] || '';
  const nomeProduto = partes[1] || '';
  const unidadeProduto = partes[2] || '';

  return (
    <tr key={`${escola.escola_id}-${escola.necessidade_id}`}>
      <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-600">
        {escola.escola_id}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
        {escola.escola_nome}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-purple-600">
        {codigoProduto}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <SearchableSelect
          value={valorOrigemAtual || ''}
          onChange={(value) => onProdutoOrigemChange(necessidade, escola, value)}
          options={(() => {
            const baseOptions = (necessidade.produtos_grupo || []).map(produto => {
              const id = produto.produto_id || produto.id || produto.codigo;
              const nome = produto.produto_nome || produto.nome;
              const unidade = produto.unidade_medida || produto.unidade || '';
              return {
                value: `${id}|${nome}|${unidade}`,
                label: nome,
                description: unidade
              };
            });

            if (valorOrigemAtual && !baseOptions.some(opt => opt.value === valorOrigemAtual)) {
              const [, nomeAtual, unidadeAtual] = valorOrigemAtual.split('|');
              baseOptions.unshift({
                value: valorOrigemAtual,
                label: nomeAtual || 'Produto atual',
                description: unidadeAtual || ''
              });
            }

            return baseOptions;
          })()}
          placeholder="Produto origem..."
          disabled={Boolean(escola.produto_trocado_id) || !ajustesAtivados}
          className="text-xs"
          filterBy={(option, searchTerm) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
          }
          usePortal={false}
        />
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-center">
        <span className="text-xs text-gray-700">
          {(() => {
            const [, , unidadeOrigem] = valorOrigemAtual?.split('|') || [];
            return unidadeOrigem || necessidade.produto_origem_unidade || '-';
          })()}
        </span>
      </td>
      <td className="px-3 py-2 text-center" style={{ minWidth: '110px', width: '110px' }}>
        <Input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          value={quantidadeOrigemFormatted}
          onChange={(e) => onQuantidadeOrigemChange(necessidade, escola, e.target.value)}
          className="w-full max-w-[90px] text-center text-xs py-1"
          disabled={!ajustesAtivados || Boolean(escola.produto_trocado_id)}
          placeholder="0,000"
        />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex-1">
          <SearchableSelect
            value={produtoSelecionado}
            onChange={(value) => onProdutoGenericoChange(chaveEscola, value)}
            options={opcoesGenericos.map(produto => {
              const unidade = produto.unidade_medida_sigla || produto.unidade || produto.unidade_medida || '';
              return {
                value: `${produto.id || produto.codigo}|${produto.nome}|${unidade}|${produto.fator_conversao || 1}`,
                label: produto.nome
              };
            })}
            placeholder="Selecione..."
            disabled={Boolean(escola.produto_trocado_id) || !ajustesAtivados}
            className="text-xs"
            filterBy={(option, searchTerm) => {
              return option.label.toLowerCase().includes(searchTerm.toLowerCase());
            }}
            usePortal={false}
          />
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-center">
        <span className="text-xs text-gray-700">
          {unidadeProduto || '-'}
        </span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-center text-xs font-semibold text-cyan-600">
        {quantidadeGenerica || '0,000'}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-2">
          {ajustesAtivados && (
            <>
              <Button
                size="xs"
                variant="success"
                onClick={() => onSave(escola, necessidade)}
                className="flex items-center justify-center"
                title="Salvar"
              >
                <FaSave className="w-4 h-4" />
              </Button>
              {escola.substituicao && escola.substituicao.id && onDelete && (
                <button
                  onClick={() => onDelete(escola)}
                  className="text-red-600 hover:text-red-800 transition-colors p-1"
                  title="Excluir substituição"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default SubstituicoesIndividualRow;

