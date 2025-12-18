/**
 * Componente da aba de Produtos do Modal de Necessidades
 * Contém a tabela de produtos com frequências, paginação e ações
 */

import React, { useState, useMemo } from 'react';
import { Button, Input, Pagination } from '../ui';
import { FaSearch, FaCopy, FaPaste, FaClipboard } from 'react-icons/fa';
import NecessidadeProdutosTable from './NecessidadeProdutosTable';
import toast from 'react-hot-toast';

const NecessidadeModalProdutos = ({
  produtosTabela = [],
  tiposDisponiveis = [],
  onFrequenciaChange,
  onAjusteChange,
  onReplicarFrequencias,
  onCopiarFrequencias,
  onColarFrequencias,
  temFrequenciasCopiadas = false,
  loading = false,
  necessidadesLoading = false
}) => {
  const [buscaProduto, setBuscaProduto] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(25);

  // Filtrar produtos baseado na busca
  const produtosFiltrados = useMemo(() => {
    if (!buscaProduto.trim()) {
      return produtosTabela;
    }
    
    const termo = buscaProduto.toLowerCase();
    return produtosTabela.filter(produto => 
      produto.nome?.toLowerCase().includes(termo) ||
      produto.unidade_medida?.toLowerCase().includes(termo)
    );
  }, [produtosTabela, buscaProduto]);

  // Calcular produtos paginados
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(indiceInicio, indiceFim);

  // Resetar página quando busca mudar
  React.useEffect(() => {
    setPaginaAtual(1);
  }, [buscaProduto]);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItensPorPagina(newItemsPerPage);
    setPaginaAtual(1);
  };

  if (produtosTabela.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Nenhum produto encontrado. Preencha os campos na aba anterior e clique em "Carregar Produtos".</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Barra de ações e busca */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar produto por nome ou unidade..."
              value={buscaProduto}
              onChange={(e) => setBuscaProduto(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* Botão de copiar frequências */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              if (onCopiarFrequencias) {
                onCopiarFrequencias();
              }
            }}
            disabled={loading || necessidadesLoading || produtosTabela.length === 0}
            className="flex items-center gap-2"
            title="Copiar frequências da escola atual para usar na próxima escola"
          >
            <FaClipboard className="w-4 h-4" />
            Copiar Frequências
          </Button>

          {/* Botão de colar frequências */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              if (onColarFrequencias) {
                onColarFrequencias();
              }
            }}
            disabled={loading || necessidadesLoading || !temFrequenciasCopiadas || produtosTabela.length === 0}
            className="flex items-center gap-2"
            title={temFrequenciasCopiadas ? 'Colar frequências da escola anterior' : 'Não há frequências copiadas'}
          >
            <FaPaste className="w-4 h-4" />
            Colar Frequências
          </Button>

          {/* Botão de replicar frequências */}
          {tiposDisponiveis.length > 1 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                if (onReplicarFrequencias) {
                  onReplicarFrequencias();
                } else {
                  toast('Funcionalidade de replicar frequências será implementada');
                }
              }}
              disabled={loading || necessidadesLoading}
              className="flex items-center gap-2"
              title="Replicar frequências entre turnos da mesma escola"
            >
              <FaCopy className="w-4 h-4" />
              Replicar Frequências
            </Button>
          )}
        </div>

        {/* Contador de produtos */}
        <div className="text-sm text-gray-600">
          {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto' : 'produtos'}
          {buscaProduto && ` encontrado${produtosFiltrados.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Tabela de produtos */}
      <NecessidadeProdutosTable
        produtos={produtosPaginados}
        tiposDisponiveis={tiposDisponiveis}
        onFrequenciaChange={onFrequenciaChange}
        onAjusteChange={onAjusteChange}
        loading={loading || necessidadesLoading}
      />

      {/* Paginação */}
      {produtosFiltrados.length > itensPorPagina && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <Pagination
            currentPage={paginaAtual}
            totalPages={totalPaginas}
            totalItems={produtosFiltrados.length}
            itemsPerPage={itensPorPagina}
            onPageChange={setPaginaAtual}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default NecessidadeModalProdutos;
