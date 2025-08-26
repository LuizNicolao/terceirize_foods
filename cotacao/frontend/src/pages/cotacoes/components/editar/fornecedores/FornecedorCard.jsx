import React, { useState } from 'react';
import { FaTrash, FaPaperclip } from 'react-icons/fa';
import { FornecedorSearch } from '../../../../../components/ui';
import AnexosManager from '../../../../../components/anexos/AnexosManager';
import FornecedorImportExport from '../../../../../components/anexos/FornecedorImportExport';
import FornecedorProdutosTable from './FornecedorProdutosTable';

const FornecedorCard = ({
  fornecedor,
  index,
  produtos,
  tiposFrete,
  searchProduto,
  setSearchProduto,
  melhorPrecoPorProduto,
  updateFornecedor,
  updateProdutoFornecedor,
  removeFornecedor,
  removeProduto,
  cotacaoId,
  calcularValorComDifalEFrete
}) => {
  const [showAnexos, setShowAnexos] = useState(false);

  const handleDataUpdate = (dadosAtualizados) => {
    // Atualizar todos os campos do fornecedor
    Object.keys(dadosAtualizados).forEach(field => {
      if (field !== 'produtos') {
        updateFornecedor(fornecedor.id, field, dadosAtualizados[field]);
      }
    });
    
    // Atualizar produtos se houver
    if (dadosAtualizados.produtos) {
      dadosAtualizados.produtos.forEach(produtoAtualizado => {
        const produtoExistente = fornecedor.produtos.find(p => p.nome === produtoAtualizado.nome);
        if (produtoExistente) {
          Object.keys(produtoAtualizado).forEach(field => {
            updateProdutoFornecedor(fornecedor.id, produtoExistente.id, field, produtoAtualizado[field]);
          });
        }
      });
    }
  };

  // Calcular valor total do fornecedor
  const calcularValorTotalFornecedor = () => {
    const valorTotalProdutos = fornecedor.produtos.reduce((total, produto) => {
      const qtde = parseFloat(produto.qtde || produto.quantidade) || 0;
      const valorUnit = parseFloat(produto.valor_unitario || produto.valorUnitario) || 0;
      const difal = parseFloat(produto.difal) || 0;
      const ipi = parseFloat(produto.ipi) || 0;
      const valorComImpostos = valorUnit * (1 + (difal / 100)) + ipi;
      return total + (qtde * valorComImpostos);
    }, 0);

    const frete = parseFloat(fornecedor.valor_frete || fornecedor.valorFrete || 0);
    
    return valorTotalProdutos + frete;
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const valorTotal = calcularValorTotalFornecedor();

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Header do Fornecedor */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-green-500">
        <h3 className="text-lg font-semibold text-gray-800">
          Fornecedor {index + 1}
        </h3>
        <div className="flex gap-2 items-center">
          {fornecedor.produtos && fornecedor.produtos.length > 0 && (
            <span className="text-sm font-semibold text-green-600">
              Total: {formatarValor(valorTotal)}
            </span>
          )}
          {cotacaoId && (
            <button
              type="button"
              onClick={() => setShowAnexos(!showAnexos)}
              className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
            >
              <FaPaperclip /> Anexos
            </button>
          )}
          <FornecedorImportExport
            fornecedor={fornecedor}
            onDataUpdate={handleDataUpdate}
          />
          <button
            type="button"
            onClick={() => removeFornecedor(fornecedor.id)}
            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
          >
            <FaTrash /> Remover
          </button>
        </div>
      </div>

      {/* Informações do Fornecedor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Nome do Fornecedor *
          </label>
          <FornecedorSearch
            value={fornecedor.nome || ''}
            placeholder="Buscar fornecedor no sistema..."
            onSelect={(fornecedorSelecionado) => {
              if (fornecedorSelecionado) {
                const nomeCompleto = fornecedorSelecionado.razao_social || fornecedorSelecionado.nome_fantasia;
                updateFornecedor(fornecedor.id, 'nome', nomeCompleto);
                updateFornecedor(fornecedor.id, 'fornecedor_id', fornecedorSelecionado.id);
                updateFornecedor(fornecedor.id, 'cnpj', fornecedorSelecionado.cnpj);
              }
            }}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Prazo de Pagamento
          </label>
          <input
            type="text"
            value={fornecedor.prazoPagamento || ''}
            onChange={(e) => updateFornecedor(fornecedor.id, 'prazoPagamento', e.target.value)}
            placeholder="Ex: 30/60/90 dias"
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Tipo de Frete
          </label>
          <select
            value={fornecedor.tipoFrete || ''}
            onChange={(e) => updateFornecedor(fornecedor.id, 'tipoFrete', e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Selecione o tipo de frete</option>
            {tiposFrete.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Valor do Frete
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={fornecedor.valorFrete || 0}
            onChange={(e) => updateFornecedor(fornecedor.id, 'valorFrete', parseFloat(e.target.value) || 0)}
            placeholder="R$ 0,00"
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Seção de Anexos */}
      {showAnexos && cotacaoId && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <AnexosManager
            cotacaoId={cotacaoId}
            fornecedorId={fornecedor.id}
            fornecedorNome={fornecedor.nome}
            onAnexoChange={() => {
              // Callback para notificar mudanças nos anexos
            }}
          />
        </div>
      )}

      {/* Tabela de Produtos */}
      {fornecedor.produtos && fornecedor.produtos.length > 0 && (
        <FornecedorProdutosTable
          fornecedor={fornecedor}
          produtos={produtos}
          searchProduto={searchProduto}
          setSearchProduto={setSearchProduto}
          melhorPrecoPorProduto={melhorPrecoPorProduto}
          updateProdutoFornecedor={updateProdutoFornecedor}
          removeProduto={removeProduto}
          calcularValorComDifalEFrete={calcularValorComDifalEFrete}
        />
      )}
    </div>
  );
};

export default FornecedorCard;
