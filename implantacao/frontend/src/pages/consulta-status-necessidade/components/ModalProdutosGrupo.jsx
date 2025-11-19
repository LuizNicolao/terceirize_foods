import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Pagination, Input } from '../../../components/ui';
import { FaSearch } from 'react-icons/fa';
import consultaStatusNecessidadeService from '../../../services/consultaStatusNecessidade';
import { usePagination } from '../../../hooks/common/usePagination';

const ModalProdutosGrupo = ({ isOpen, onClose, grupo, filtros = {} }) => {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState(null);
  const [error, setError] = useState(null);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [buscaEscola, setBuscaEscola] = useState('');
  const pagination = usePagination(20);
  const paginationEscolas = usePagination(20);

  const carregarProdutos = async () => {
    if (!grupo || !isOpen || grupo.trim() === '') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paramsFiltros = {
        grupo: grupo.trim()
      };

      // Adicionar filtros apenas se tiverem valor
      if (filtros.semana_abastecimento) {
        paramsFiltros.semana_abastecimento = filtros.semana_abastecimento;
      }
      if (filtros.semana_consumo) {
        paramsFiltros.semana_consumo = filtros.semana_consumo;
      }
      if (filtros.data_inicio) {
        paramsFiltros.data_inicio = filtros.data_inicio;
      }
      if (filtros.data_fim) {
        paramsFiltros.data_fim = filtros.data_fim;
      }

      const response = await consultaStatusNecessidadeService.buscarProdutosPorGrupo(paramsFiltros);

      if (response.success) {
        setDados(response.data);
      } else {
        setError(response.message || 'Erro ao carregar produtos');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao carregar produtos do grupo';
      setError(errorMessage);
      console.error('Erro ao carregar produtos do grupo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && grupo && grupo.trim() !== '') {
      carregarProdutos();
    } else if (!isOpen) {
      setDados(null);
      setError(null);
    } else if (isOpen && (!grupo || grupo.trim() === '')) {
      setError('Grupo não informado');
    }
  }, [isOpen, grupo, filtros]);

  const formatarNumero = (valor) => {
    if (!valor && valor !== 0) return '0';
    return new Intl.NumberFormat('pt-BR').format(parseFloat(valor));
  };

  const formatarQuantidade = (valor) => {
    if (!valor && valor !== 0) return '0';
    const num = parseFloat(valor);
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return num.toFixed(3).replace(/\.?0+$/, '').replace('.', ',');
  };

  // Filtrar produtos por busca
  const produtosFiltrados = useMemo(() => {
    if (!dados?.produtos) return [];
    
    if (!buscaProduto.trim()) {
      return dados.produtos;
    }

    const termoBusca = buscaProduto.toLowerCase().trim();
    return dados.produtos.filter(produto => 
      produto.produto_nome?.toLowerCase().includes(termoBusca) ||
      produto.produto_unidade?.toLowerCase().includes(termoBusca)
    );
  }, [dados?.produtos, buscaProduto]);

  // Calcular produtos paginados
  const produtosPaginados = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return produtosFiltrados.slice(startIndex, endIndex);
  }, [produtosFiltrados, pagination.currentPage, pagination.itemsPerPage]);

  // Filtrar escolas por busca
  const escolasFiltradas = useMemo(() => {
    if (!dados?.escolas) return [];
    
    if (!buscaEscola.trim()) {
      return dados.escolas;
    }

    const termoBusca = buscaEscola.toLowerCase().trim();
    return dados.escolas.filter(escola => 
      escola.escola_nome?.toLowerCase().includes(termoBusca)
    );
  }, [dados?.escolas, buscaEscola]);

  // Calcular escolas paginadas
  const escolasPaginadas = useMemo(() => {
    const startIndex = (paginationEscolas.currentPage - 1) * paginationEscolas.itemsPerPage;
    const endIndex = startIndex + paginationEscolas.itemsPerPage;
    return escolasFiltradas.slice(startIndex, endIndex);
  }, [escolasFiltradas, paginationEscolas.currentPage, paginationEscolas.itemsPerPage]);

  // Atualizar paginação quando produtos filtrados mudarem
  useEffect(() => {
    if (produtosFiltrados.length > 0) {
      const totalPages = Math.ceil(produtosFiltrados.length / pagination.itemsPerPage);
      pagination.setTotalPages(totalPages);
      pagination.setTotalItems(produtosFiltrados.length);
      
      // Ajustar página atual se necessário
      if (pagination.currentPage > totalPages && totalPages > 0) {
        pagination.setCurrentPage(1);
      }
    } else {
      pagination.setTotalPages(1);
      pagination.setTotalItems(0);
      pagination.setCurrentPage(1);
    }
  }, [produtosFiltrados.length, pagination.itemsPerPage, pagination.currentPage, pagination]);

  // Atualizar paginação quando escolas filtradas mudarem
  useEffect(() => {
    if (escolasFiltradas.length > 0) {
      const totalPages = Math.ceil(escolasFiltradas.length / paginationEscolas.itemsPerPage);
      paginationEscolas.setTotalPages(totalPages);
      paginationEscolas.setTotalItems(escolasFiltradas.length);
      
      // Ajustar página atual se necessário
      if (paginationEscolas.currentPage > totalPages && totalPages > 0) {
        paginationEscolas.setCurrentPage(1);
      }
    } else {
      paginationEscolas.setTotalPages(1);
      paginationEscolas.setTotalItems(0);
      paginationEscolas.setCurrentPage(1);
    }
  }, [escolasFiltradas.length, paginationEscolas.itemsPerPage, paginationEscolas.currentPage, paginationEscolas]);

  // Resetar busca e paginação quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setBuscaProduto('');
      setBuscaEscola('');
      pagination.setCurrentPage(1);
      paginationEscolas.setCurrentPage(1);
    }
  }, [isOpen, pagination, paginationEscolas]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Produtos do Grupo: ${grupo || ''}`}
      size="6xl"
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : dados ? (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total de Produtos</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {formatarNumero(dados.total_produtos)}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-600 font-medium">Total de Escolas</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {formatarNumero(dados.total_escolas)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Total de Necessidades</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {formatarNumero(
                  dados.produtos?.reduce((sum, p) => sum + parseInt(p.total_necessidades || 0), 0) || 0
                )}
              </div>
            </div>
          </div>

          {/* Tabela de Produtos */}
          {dados.produtos && dados.produtos.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Produtos Solicitados ({produtosFiltrados.length})
                </h3>
                <div className="w-64">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar produto..."
                      value={buscaProduto}
                      onChange={(e) => {
                        setBuscaProduto(e.target.value);
                        pagination.setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              {produtosFiltrados.length > 0 ? (
                <>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Necessidades
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Escolas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantidade Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Média
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {produtosPaginados.map((produto, index) => (
                          <tr key={produto.produto_id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {produto.produto_nome || 'Sem nome'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {produto.produto_unidade || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatarNumero(produto.total_necessidades)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatarNumero(produto.total_escolas)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatarQuantidade(produto.quantidade_total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatarQuantidade(produto.quantidade_media)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.handlePageChange}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.itemsPerPage}
                        onItemsPerPageChange={pagination.handleItemsPerPageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">
                    Nenhum produto encontrado com o termo "{buscaProduto}".
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">Nenhum produto encontrado para este grupo.</p>
            </div>
          )}

          {/* Lista de Escolas */}
          {dados.escolas && dados.escolas.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Escolas que Solicitam Produtos deste Grupo ({escolasFiltradas.length})
                </h3>
                <div className="w-64">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar escola..."
                      value={buscaEscola}
                      onChange={(e) => {
                        setBuscaEscola(e.target.value);
                        paginationEscolas.setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              {escolasFiltradas.length > 0 ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {escolasPaginadas.map((escola, index) => (
                        <div key={escola.escola_id || index} className="text-sm text-gray-700">
                          • {escola.escola_nome || `Escola ${escola.escola_id}`}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Paginação de Escolas */}
                  {paginationEscolas.totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={paginationEscolas.currentPage}
                        totalPages={paginationEscolas.totalPages}
                        onPageChange={paginationEscolas.handlePageChange}
                        totalItems={paginationEscolas.totalItems}
                        itemsPerPage={paginationEscolas.itemsPerPage}
                        onItemsPerPageChange={paginationEscolas.handleItemsPerPageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                  <p className="text-gray-600">
                    Nenhuma escola encontrada com o termo "{buscaEscola}".
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Nenhum dado disponível.</p>
        </div>
      )}
    </Modal>
  );
};

export default ModalProdutosGrupo;

