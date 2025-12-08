import React from 'react';
import SubstituicoesIndividualRow from './SubstituicoesIndividualRow';

const SubstituicoesExpandedRow = ({
  necessidade,
  chaveOrigem,
  produtosGenericos,
  produtoOrigemAtualId,
  selectedProdutosPorEscola,
  selectedProdutosOrigemPorEscola,
  origemInicialPorEscola,
  selectedProdutosOrigem,
  quantidadesOrigemEditadas,
  ajustesAtivados,
  onProdutoOrigemIndividualChange,
  onQuantidadeOrigemChange,
  onProdutoGenericoIndividualChange,
  onSaveIndividual,
  onDeleteIndividual,
  getQuantidadeOrigemFormatted,
  getQuantidadeOrigemAtual
}) => {
  return (
    <tr className="bg-gray-50">
      <td colSpan="12" className="px-6 py-4">
        <div className="bg-gray-50 border-l-4 border-green-600 p-4">
          <h4 className="text-md font-semibold text-green-700 mb-4 flex items-center gap-2">
            <span className="text-xl">🏢</span>
            Unidades Solicitantes {necessidade.escolas && necessidade.escolas.length > 0 && 
              `• ${necessidade.escolas.length} ${necessidade.escolas.length === 1 ? 'escola' : 'escolas'}`} 
            {necessidade.produto_generico_nome && `(${necessidade.produto_generico_nome})`}
          </h4>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th style={{ width: '80px' }} className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Cód. Escola</th>
                <th style={{ minWidth: '200px' }} className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Unidade Escolar</th>
                <th style={{ width: '80px' }} className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Código</th>
                <th style={{ minWidth: '180px' }} className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto Origem</th>
                <th style={{ width: '70px' }} className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">Unid.</th>
                <th style={{ minWidth: '110px', width: '110px' }} className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">Qtd Origem</th>
                <th style={{ minWidth: '200px' }} className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto Genérico</th>
                <th style={{ width: '80px' }} className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">Unid. Med.</th>
                <th style={{ width: '90px' }} className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade</th>
                <th style={{ width: '80px' }} className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {necessidade.escolas.map((escola, idx) => {
                const chaveEscola = `${chaveOrigem}-${escola.escola_id}`;
                const valorOrigemAtual =
                  (selectedProdutosOrigemPorEscola[chaveEscola] ??
                    origemInicialPorEscola[chaveEscola] ??
                    selectedProdutosOrigem[chaveOrigem]) ??
                  `${necessidade.codigo_origem}|${necessidade.produto_origem_nome}|${necessidade.produto_origem_unidade || ''}`;

                const produtoOrigemEscolaId = valorOrigemAtual?.split('|')[0];
                
                // Buscar produto genérico padrão do novo produto origem se ainda não foi carregado
                let produtoGenericoPadrao = null;
                if (produtoOrigemEscolaId && produtoOrigemEscolaId !== produtoOrigemAtualId) {
                  const produtosGrupo = necessidade.produtos_grupo || [];
                  const produtoOrigemEscola = produtosGrupo.find(
                    prod => String(prod.produto_id || prod.id || prod.codigo) === String(produtoOrigemEscolaId)
                  );
                  produtoGenericoPadrao = produtoOrigemEscola?.produto_generico_padrao;
                }
                
                const opcoesGenericosBase = produtosGenericos[produtoOrigemEscolaId] || produtosGenericos[produtoOrigemAtualId] || [];
                const opcoesGenericos = [...opcoesGenericosBase];
                
                // Adicionar produto genérico padrão se ainda não foi carregado mas existe
                if (produtoGenericoPadrao && !opcoesGenericos.some(opt => `${opt.id || opt.codigo}` === String(produtoGenericoPadrao.id || produtoGenericoPadrao.codigo))) {
                  opcoesGenericos.unshift({
                    id: produtoGenericoPadrao.id || produtoGenericoPadrao.codigo,
                    codigo: produtoGenericoPadrao.id || produtoGenericoPadrao.codigo,
                    nome: produtoGenericoPadrao.nome,
                    unidade: produtoGenericoPadrao.unidade_medida_sigla || produtoGenericoPadrao.unidade_medida || produtoGenericoPadrao.unidade || '',
                    unidade_medida: produtoGenericoPadrao.unidade_medida_sigla || produtoGenericoPadrao.unidade_medida || produtoGenericoPadrao.unidade || '',
                    unidade_medida_sigla: produtoGenericoPadrao.unidade_medida_sigla || produtoGenericoPadrao.unidade_medida || produtoGenericoPadrao.unidade || '',
                    fator_conversao: produtoGenericoPadrao.fator_conversao || 1
                  });
                }
                
                // Priorizar estado React sobre propriedade mutável do objeto
                const produtoSelecionado = selectedProdutosPorEscola[chaveEscola] || escola.selectedProdutoGenerico || (escola.substituicao ? 
                  `${escola.substituicao.produto_generico_id}|${escola.substituicao.produto_generico_nome}|${escola.substituicao.produto_generico_unidade || ''}` 
                  : '');
                const partes = produtoSelecionado ? produtoSelecionado.split('|') : [];
                const fatorConversao = partes.length >= 4 ? parseFloat(partes[3]) : 0;
                
                // Se produtoSelecionado existe mas não está nas opções, adicionar
                if (
                  produtoSelecionado &&
                  !opcoesGenericos.some(opt => {
                    const optValue = `${opt.id || opt.codigo}|${opt.nome}|${opt.unidade_medida_sigla || opt.unidade || opt.unidade_medida || ''}|${opt.fator_conversao || 1}`;
                    return optValue === produtoSelecionado;
                  })
                ) {
                  opcoesGenericos.unshift({
                    id: partes[0],
                    codigo: partes[0],
                    nome: partes[1] || 'Produto selecionado',
                    unidade: partes[2],
                    unidade_medida: partes[2],
                    unidade_medida_sigla: partes[2],
                    fator_conversao: fatorConversao || 1
                  });
                }
                
                const quantidadeOrigemAtual = getQuantidadeOrigemAtual(necessidade, escola, chaveOrigem);
                const quantidadeGenerica = produtoSelecionado && fatorConversao > 0 && quantidadeOrigemAtual > 0
                  ? Math.ceil(quantidadeOrigemAtual / fatorConversao)
                  : '';

                return (
                  <SubstituicoesIndividualRow
                    key={`${escola.escola_id}-${idx}`}
                    escola={escola}
                    necessidade={necessidade}
                    chaveOrigem={chaveOrigem}
                    chaveEscola={chaveEscola}
                    valorOrigemAtual={valorOrigemAtual}
                    produtoSelecionado={produtoSelecionado}
                    opcoesGenericos={opcoesGenericos}
                    quantidadeOrigemFormatted={getQuantidadeOrigemFormatted(necessidade, escola, chaveOrigem)}
                    quantidadeGenerica={quantidadeGenerica}
                    ajustesAtivados={ajustesAtivados}
                    onProdutoOrigemChange={onProdutoOrigemIndividualChange}
                    onQuantidadeOrigemChange={onQuantidadeOrigemChange}
                    onProdutoGenericoChange={onProdutoGenericoIndividualChange}
                    onSave={onSaveIndividual}
                    onDelete={onDeleteIndividual}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
};

export default SubstituicoesExpandedRow;

