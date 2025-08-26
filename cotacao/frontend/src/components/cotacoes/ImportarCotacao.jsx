import React, { useState } from 'react';
import { FaDownload, FaSearch } from 'react-icons/fa';
import cotacoesService from '../../services/cotacoes';
import toast from 'react-hot-toast';

const ImportarCotacao = ({ onCotacaoImportada }) => {
  const [cotacaoId, setCotacaoId] = useState('');
  const [loading, setLoading] = useState(false);

  const importarCotacao = async () => {
    if (!cotacaoId || isNaN(cotacaoId) || parseInt(cotacaoId) <= 0) {
      toast.error('Por favor, informe um ID de cotação válido.');
      return;
    }

    setLoading(true);
    
    try {
      // Buscar dados da cotação
      const cotacao = await cotacoesService.getCotacaoById(cotacaoId);
      
      if (!cotacao.fornecedores || cotacao.fornecedores.length === 0) {
        toast.error('A cotação selecionada não possui fornecedores para importar.');
        return;
      }

      // Preparar dados para importação
      const dadosImportados = {
        produtos: cotacao.produtos || [],
        fornecedores: cotacao.fornecedores.map(fornecedor => ({
          id: `forn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nome: fornecedor.nome,
          fornecedor_id: fornecedor.fornecedor_id,
          prazoPagamento: fornecedor.prazo_pagamento || '',
          tipoFrete: fornecedor.tipo_frete || '',
          valorFrete: parseFloat(fornecedor.valor_frete) || 0,
          produtos: fornecedor.produtos.map(produto => ({
            id: `forn_prod_${Date.now()}_${produto.id}_${Math.random().toString(36).substr(2, 9)}`,
            produto_id: produto.produto_id || produto.id,
            nome: produto.nome,
            qtde: parseFloat(produto.qtde) || 0,
            un: produto.un || 'UN',
            prazoEntrega: produto.prazo_entrega || '',
            valorUnitario: parseFloat(produto.valor_unitario) || 0,
            primeiroValor: parseFloat(produto.primeiro_valor) || 0,
            valorAnterior: parseFloat(produto.valor_anterior) || 0,
            dataEntregaFn: produto.data_entrega_fn || '',
            difal: parseFloat(produto.difal) || 0,
            ipi: parseFloat(produto.ipi) || 0,
            total: parseFloat(produto.total) || 0
          }))
        }))
      };

      // Chamar callback com os dados importados
      onCotacaoImportada(dadosImportados);
      
      toast.success(`Cotação #${cotacaoId} importada com sucesso! Você pode fazer as alterações necessárias antes de salvar.`);
      setCotacaoId('');
      
    } catch (error) {
      console.error('Erro ao importar cotação:', error);
      toast.error('Erro ao importar cotação. Verifique se o ID está correto.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      importarCotacao();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaDownload className="text-blue-600" />
        Importar Cotação Existente
      </h3>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            value={cotacaoId}
            onChange={(e) => setCotacaoId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite o ID da cotação"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        <button
          onClick={importarCotacao}
          disabled={loading || !cotacaoId}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Importando...
            </>
          ) : (
            <>
              <FaSearch size={14} />
              Importar
            </>
          )}
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        Digite o ID de uma cotação existente para importar seus fornecedores e produtos.
      </p>
    </div>
  );
};

export default ImportarCotacao;
