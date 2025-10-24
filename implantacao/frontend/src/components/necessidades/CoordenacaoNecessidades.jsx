import React, { useState, useEffect } from 'react';
import { FaEdit, FaPlus, FaSave, FaPaperPlane, FaClipboardList, FaSearch } from 'react-icons/fa';
import { useNecessidadesCoordenacao } from '../../hooks/useNecessidadesCoordenacao';
import { Modal, Button, Input, SearchableSelect } from '../../components/ui';
import { ExportButtons } from '../../components/shared';
import toast from 'react-hot-toast';

const CoordenacaoNecessidades = () => {
  const {
    necessidades,
    necessidadesFiltradas,
    loading,
    ajustesLocais,
    produtosModal,
    loadingProdutos,
    searchProduto,
    produtosSelecionados,
    filtros,
    escolas,
    grupos,
    nutricionistas,
    semanasConsumo,
    semanasAbastecimento,
    carregarNecessidades,
    handleFiltroChange,
    buscarProdutosParaModal,
    incluirProdutoExtra,
    salvarAjustes,
    liberarParaLogistica,
    handleAjusteChange,
    setSearchProduto,
    setProdutosSelecionados
  } = useNecessidadesCoordenacao();

  const [modalProdutoExtraAberto, setModalProdutoExtraAberto] = useState(false);

  // Filtrar necessidades por busca de produto
  useEffect(() => {
    if (searchProduto) {
      const filtradas = necessidades.filter(nec =>
        nec.produto.toLowerCase().includes(searchProduto.toLowerCase()) ||
        (nec.codigo_teknisa && nec.codigo_teknisa.toLowerCase().includes(searchProduto.toLowerCase()))
      );
      setNecessidadesFiltradas(filtradas);
    } else {
      setNecessidadesFiltradas(necessidades);
    }
  }, [searchProduto, necessidades]);

  const handleAbrirModalProdutoExtra = async () => {
    if (!filtros.grupo || !filtros.escola_id) {
      toast.error('Selecione grupo e escola primeiro');
      return;
    }
    await buscarProdutosParaModal();
    setModalProdutoExtraAberto(true);
  };

  const handleIncluirProdutosExtra = async () => {
    if (produtosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }

    for (const produto of produtosSelecionados) {
      await incluirProdutoExtra(produto);
    }

    setModalProdutoExtraAberto(false);
    setProdutosSelecionados([]);
    setSearchProduto('');
  };

  const handleToggleProduto = (produto) => {
    setProdutosSelecionados(prev => {
      const existe = prev.find(p => p.produto_id === produto.produto_id);
      if (existe) {
        return prev.filter(p => p.produto_id !== produto.produto_id);
      } else {
        return [...prev, produto];
      }
    });
  };

  const handleSelecionarTodos = () => {
    setProdutosSelecionados(produtosModal);
  };

  const handleDesmarcarTodos = () => {
    setProdutosSelecionados([]);
  };

  const handleExportarExcel = () => {
    // TODO: Implementar exportação Excel
    toast.info('Exportação Excel em desenvolvimento');
  };

  const handleExportarPDF = () => {
    // TODO: Implementar exportação PDF
    toast.info('Exportação PDF em desenvolvimento');
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <SearchableSelect
            label="Escola"
            value={filtros.escola_id}
            onChange={(selectedOption) => handleFiltroChange('escola_id', selectedOption?.value || '')}
            options={escolas.map(escola => ({
              value: escola.id,
              label: `${escola.nome} - ${escola.rota}`
            }))}
            placeholder="Selecione a escola"
          />
          
          <SearchableSelect
            label="Grupo"
            value={filtros.grupo}
            onChange={(selectedOption) => handleFiltroChange('grupo', selectedOption?.value || '')}
            options={grupos}
            placeholder="Selecione o grupo"
          />
          
          <SearchableSelect
            label="Semana de Consumo"
            value={filtros.semana_consumo}
            onChange={(selectedOption) => handleFiltroChange('semana_consumo', selectedOption?.value || '')}
            options={semanasConsumo}
            placeholder="Selecione a semana"
          />
          
          <SearchableSelect
            label="Semana de Abastecimento"
            value={filtros.semana_abastecimento}
            onChange={(selectedOption) => handleFiltroChange('semana_abastecimento', selectedOption?.value || '')}
            options={semanasAbastecimento}
            placeholder="Selecione a semana"
          />
          
          <SearchableSelect
            label="Nutricionista"
            value={filtros.nutricionista_id}
            onChange={(selectedOption) => handleFiltroChange('nutricionista_id', selectedOption?.value || '')}
            options={nutricionistas.map(nutri => ({
              value: nutri.nutricionista_id,
              label: nutri.nutricionista_nome
            }))}
            placeholder="Selecione a nutricionista"
          />
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button
            onClick={carregarNecessidades}
            disabled={!filtros.escola_id || !filtros.grupo || !filtros.semana_consumo}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Filtrar
          </Button>
        </div>
      </div>

      {/* Necessidades */}
      {necessidades.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Necessidades para Coordenação ({necessidadesFiltradas.length} produtos)
                </h3>
                <p className="text-sm text-gray-600">
                  Revise e ajuste as necessidades analisadas pelas nutricionistas
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <ExportButtons
                  onExportXLSX={handleExportarExcel}
                  onExportPDF={handleExportarPDF}
                  size="sm"
                  variant="outline"
                  showLabels={true}
                  disabled={necessidadesFiltradas.length === 0}
                />
                
                <Button
                  onClick={handleAbrirModalProdutoExtra}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <FaPlus className="mr-2" />
                  Incluir Produto Extra
                </Button>
                
                <Button
                  onClick={salvarAjustes}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                  disabled={loading}
                >
                  <FaSave className="mr-2" />
                  Salvar Ajustes
                </Button>
                
                <Button
                  onClick={liberarParaLogistica}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                  disabled={loading}
                >
                  <FaPaperPlane className="mr-2" />
                  Liberar para Logística
                </Button>
              </div>
            </div>
          </div>

          {/* Busca de produtos */}
          <div className="p-4 border-b border-gray-200">
            <div className="max-w-md">
              <Input
                placeholder="Buscar produto por nome ou código..."
                value={searchProduto}
                onChange={(e) => setSearchProduto(e.target.value)}
                icon={<FaSearch />}
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cod Unidade
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade Escolar
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código Produto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade de Medida
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ajuste
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {necessidadesFiltradas.map((necessidade) => (
                  <tr key={necessidade.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-gray-900">
                      {necessidade.codigo_teknisa}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-900">
                      {necessidade.escola}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-900">
                      {necessidade.produto_id}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-900">
                      {necessidade.produto}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-900">
                      {necessidade.produto_unidade}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-900">
                      {necessidade.ajuste_nutricionista || necessidade.ajuste || 0}
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        step="0.001"
                        value={ajustesLocais[necessidade.id] || ''}
                        onChange={(e) => handleAjusteChange(necessidade.id, e.target.value)}
                        className="w-20 py-1 text-xs"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Incluir Produto Extra */}
      <Modal
        isOpen={modalProdutoExtraAberto}
        onClose={() => {
          setModalProdutoExtraAberto(false);
          setProdutosSelecionados([]);
          setSearchProduto('');
        }}
        title="Incluir Produto Extra"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              placeholder="Buscar produto..."
              value={searchProduto}
              onChange={(e) => setSearchProduto(e.target.value)}
              icon={<FaSearch />}
              className="max-w-md"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleSelecionarTodos}
                size="sm"
                variant="outline"
              >
                Selecionar Todos
              </Button>
              <Button
                onClick={handleDesmarcarTodos}
                size="sm"
                variant="outline"
              >
                Desmarcar Todos
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {produtosSelecionados.length} produto(s) selecionado(s)
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Selecionar
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Unidade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosModal.map((produto) => {
                  const isSelected = produtosSelecionados.some(p => p.produto_id === produto.produto_id);
                  return (
                    <tr
                      key={produto.produto_id}
                      className={`cursor-pointer ${isSelected ? 'bg-green-50 border-l-4 border-green-500 text-green-900 font-medium' : 'hover:bg-gray-50'}`}
                      onClick={() => handleToggleProduto(produto)}
                    >
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProduto(produto)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-900">
                        {produto.produto_codigo}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-900">
                        {produto.produto_nome}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-900">
                        {produto.unidade_medida}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => {
                setModalProdutoExtraAberto(false);
                setProdutosSelecionados([]);
                setSearchProduto('');
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleIncluirProdutosExtra}
              className="bg-green-600 hover:bg-green-700"
              disabled={produtosSelecionados.length === 0}
            >
              Incluir Produto{produtosSelecionados.length > 1 ? 's' : ''} ({produtosSelecionados.length})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CoordenacaoNecessidades;
