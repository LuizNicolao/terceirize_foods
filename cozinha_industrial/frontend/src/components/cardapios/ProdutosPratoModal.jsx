import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import pratosService from '../../services/pratos';
import toast from 'react-hot-toast';

/**
 * Modal para exibir produtos de um prato
 */
const ProdutosPratoModal = ({
  isOpen,
  onClose,
  pratoId,
  pratoNome
}) => {
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    if (isOpen && pratoId) {
      carregarProdutos();
    } else {
      setProdutos([]);
    }
  }, [isOpen, pratoId]);

  const carregarProdutos = async () => {
    if (!pratoId) return;

    setLoading(true);
    try {
      const response = await pratosService.buscarPorId(pratoId);
      if (response.success && response.data) {
        const pratoCompleto = response.data;
        const produtosList = [];
        
        // Criar mapa de receitas para associar aos produtos
        const receitasMap = {};
        if (pratoCompleto.receitas && pratoCompleto.receitas.length > 0) {
          pratoCompleto.receitas.forEach(receita => {
            receitasMap[receita.id] = receita;
          });
        }
        
        // Os produtos vêm diretamente de prato.produtos, não de receita.produtos
        if (pratoCompleto.produtos && pratoCompleto.produtos.length > 0) {
          pratoCompleto.produtos.forEach(produto => {
            // Associar receita ao produto se houver receita_id
            const receita = produto.receita_id ? receitasMap[produto.receita_id] : null;
            
            produtosList.push({
              ...produto,
              receita_nome: receita ? receita.nome : null,
              receita_codigo: receita ? receita.codigo : null
            });
          });
        }

        setProdutos(produtosList);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos do prato:', error);
      toast.error('Erro ao carregar produtos do prato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      title={`Produtos do Prato: ${pratoNome || ''}`}
    >
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Nenhum produto encontrado para este prato.</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Receita
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Grupo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Subgrupo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Classe
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Centro de Custo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Per capita
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {produtos.map((produto, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {produto.receita_codigo && produto.receita_nome ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {produto.receita_codigo}
                            </div>
                            <div className="text-xs text-gray-500">
                              {produto.receita_nome}
                            </div>
                          </div>
                        ) : produto.receita_nome ? (
                          <span className="text-sm text-gray-900">{produto.receita_nome}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {produto.produto_origem_nome || produto.produto_origem || `Produto ${produto.produto_origem_id}`}
                        </div>
                        {produto.produto_origem_id && (
                          <div className="text-xs text-gray-500">
                            ID: {produto.produto_origem_id}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {produto.grupo_nome || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {produto.subgrupo_nome || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {produto.classe_nome || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {produto.unidade_medida_sigla || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {produto.centro_custo_nome || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {produto.percapta ? parseFloat(produto.percapta).toFixed(6).replace('.', ',') : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Botão de fechar */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProdutosPratoModal;

