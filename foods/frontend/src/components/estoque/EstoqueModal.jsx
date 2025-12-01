import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Input, Button, SearchableSelect } from '../ui';
import SortableTableHeader from '../ui/SortableTableHeader';
import ExportButtons from '../shared/ExportButtons';
import { exportarVariacoesXLSX, exportarVariacoesPDF } from '../../utils/exportEstoqueVariacoes';
import almoxarifadoService from '../../services/almoxarifadoService';
import produtoGenericoService from '../../services/produtoGenerico';
import api from '../../services/api';

// Funções de formatação
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatNumber = (value, decimals = 3) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

const EstoqueModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  estoque, 
  isViewMode,
  onSuccess
}) => {
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [carregandoAlmoxarifados, setCarregandoAlmoxarifados] = useState(false);
  const [produtosGenericos, setProdutosGenericos] = useState([]);
  const [carregandoProdutosGenericos, setCarregandoProdutosGenericos] = useState(false);
  const [almoxarifadoSelecionado, setAlmoxarifadoSelecionado] = useState('');
  const [produtoGenericoSelecionado, setProdutoGenericoSelecionado] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Carregar almoxarifados ativos
  useEffect(() => {
    const carregarAlmoxarifados = async () => {
      if (isOpen) {
        setCarregandoAlmoxarifados(true);
        try {
          const response = await api.get('/almoxarifado?status=1&limit=1000');
          const processData = (response) => {
            if (response.data?.data?.items) return response.data.data.items;
            if (response.data?.data && Array.isArray(response.data.data)) return response.data.data;
            if (Array.isArray(response.data)) return response.data;
            return [];
          };
          setAlmoxarifados(processData(response));
        } catch (error) {
          console.error('Erro ao carregar almoxarifados:', error);
        } finally {
          setCarregandoAlmoxarifados(false);
        }
      }
    };

    carregarAlmoxarifados();
  }, [isOpen]);

  // Carregar produtos genéricos ativos
  useEffect(() => {
    const carregarProdutosGenericos = async () => {
      if (isOpen) {
        setCarregandoProdutosGenericos(true);
        try {
          const response = await produtoGenericoService.listar({ status: 1, limit: 1000 });
          if (response.success) {
            setProdutosGenericos(response.data || []);
          }
        } catch (error) {
          console.error('Erro ao carregar produtos genéricos:', error);
        } finally {
          setCarregandoProdutosGenericos(false);
        }
      }
    };

    carregarProdutosGenericos();
  }, [isOpen]);

  // Preencher campos quando estoque for carregado
  useEffect(() => {
    if (estoque && isOpen) {
      setAlmoxarifadoSelecionado(estoque.almoxarifado_id ? String(estoque.almoxarifado_id) : '');
      setProdutoGenericoSelecionado(estoque.produto_generico_id ? String(estoque.produto_generico_id) : '');
    } else if (isOpen && !estoque) {
      // Limpar campos se não houver estoque (não deve acontecer em uso normal)
      setAlmoxarifadoSelecionado('');
      setProdutoGenericoSelecionado('');
    }
  }, [estoque, isOpen]);

  // Limpar estados quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setAlmoxarifadoSelecionado('');
      setProdutoGenericoSelecionado('');
    }
  }, [isOpen]);

  // Função de ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Ordenar variações (usando useMemo para otimização)
  const variacoesOrdenadas = useMemo(() => {
    if (!isViewMode || !estoque || !estoque.variacoes || !Array.isArray(estoque.variacoes) || !sortField) {
      return [];
    }

    const sorted = [...estoque.variacoes].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Tratamento especial para campos numéricos
      if (sortField === 'quantidade_atual' || sortField === 'valor_unitario_medio' || sortField === 'valor_total') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
        return aValue - bValue;
      }

      // Tratamento especial para datas
      if (sortField === 'data_validade') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
        return aValue - bValue;
      }

      // Tratamento para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' });
      }

      // Fallback
      aValue = aValue ?? '';
      bValue = bValue ?? '';
      return String(aValue).localeCompare(String(bValue), 'pt-BR', { sensitivity: 'base' });
    });

    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [isViewMode, estoque, sortField, sortDirection]);

  // Se estiver em modo de visualização e tiver variações, mostrar tabela de variações
  if (isViewMode && estoque && estoque.variacoes && Array.isArray(estoque.variacoes)) {
    // Usar variações ordenadas se houver ordenação, senão usar as originais
    const variacoesParaExibir = sortField ? variacoesOrdenadas : estoque.variacoes;

    // Calcular totais das variações
    const quantidadeTotal = estoque.variacoes.reduce((sum, variacao) => {
      return sum + (parseFloat(variacao.quantidade_atual) || 0);
    }, 0);
    
    const valorTotal = estoque.variacoes.reduce((sum, variacao) => {
      return sum + (parseFloat(variacao.valor_total) || 0);
    }, 0);

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Visualizar Estoque - ${estoque.produto_generico_nome || ''}`}
        size="full"
        hideCloseButton={true}
      >
        <div className="space-y-4">
          {/* Botões de Exportação */}
          <div className="flex justify-end">
            <ExportButtons
              onExportXLSX={() => exportarVariacoesXLSX(variacoesParaExibir, {
                produto_generico_codigo: estoque.produto_generico_codigo,
                produto_generico_nome: estoque.produto_generico_nome,
                unidade_medida_sigla: estoque.unidade_medida_sigla,
                unidade_medida_nome: estoque.unidade_medida_nome
              })}
              onExportPDF={() => exportarVariacoesPDF(variacoesParaExibir, {
                produto_generico_id: estoque.produto_generico_id,
                produto_generico_codigo: estoque.produto_generico_codigo,
                produto_generico_nome: estoque.produto_generico_nome,
                unidade_medida_sigla: estoque.unidade_medida_sigla,
                unidade_medida_nome: estoque.unidade_medida_nome
              })}
              size="md"
              variant="outline"
            />
          </div>

          {/* Informações do Produto */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações do Produto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Código Produto</label>
                <p className="text-sm font-medium text-gray-900">{estoque.produto_generico_codigo || '-'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nome Produto</label>
                <p className="text-sm font-medium text-gray-900">{estoque.produto_generico_nome || '-'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Unidade de Medida</label>
                <p className="text-sm font-medium text-gray-900">
                  {estoque.unidade_medida_sigla || estoque.unidade_medida_nome || '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quantidade Total</label>
                <p className="text-sm font-semibold text-gray-900">{formatNumber(quantidadeTotal)}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Valor Total do Estoque</label>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(valorTotal)}</p>
              </div>
            </div>
          </div>

          {/* Tabela de Variações */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableTableHeader
                      label="Código Produto"
                      field="produto_generico_codigo"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="Nome Produto"
                      field="produto_generico_nome"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="Unidade de Medida"
                      field="unidade_medida_sigla"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="Lote"
                      field="lote"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="Validade"
                      field="data_validade"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="Quantidade em Estoque"
                      field="quantidade_atual"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="Valor Unitário"
                      field="valor_unitario_medio"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="Valor Total"
                      field="valor_total"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {variacoesParaExibir.map((variacao, index) => (
                    <tr key={variacao.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {variacao.produto_generico_codigo || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {variacao.produto_generico_nome || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {variacao.unidade_medida_sigla || variacao.unidade_medida_nome || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {variacao.lote || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatDate(variacao.data_validade)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatNumber(variacao.quantidade_atual)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatCurrency(variacao.valor_unitario_medio)}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {formatCurrency(variacao.valor_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Estoque' : 'Editar Estoque'}
      size="7xl"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          almoxarifado_id: formData.get('almoxarifado_id'),
          produto_generico_id: produtoGenericoSelecionado || formData.get('produto_generico_id'),
          quantidade_atual: formData.get('quantidade_atual') ? parseFloat(formData.get('quantidade_atual')) : 0,
          quantidade_reservada: formData.get('quantidade_reservada') ? parseFloat(formData.get('quantidade_reservada')) : 0,
          valor_unitario_medio: formData.get('valor_unitario_medio') ? parseFloat(formData.get('valor_unitario_medio')) : 0,
          estoque_minimo: formData.get('estoque_minimo') ? parseFloat(formData.get('estoque_minimo')) : 0,
          estoque_maximo: formData.get('estoque_maximo') ? parseFloat(formData.get('estoque_maximo')) : null,
          lote: formData.get('lote') || null,
          data_validade: formData.get('data_validade') || null,
          status: formData.get('status') || 'ATIVO',
          observacoes: formData.get('observacoes') || null
        };
        onSubmit(data);
      }} className="space-y-4">
        
        {/* Cards organizados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card: Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              {isViewMode && estoque ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Almoxarifado
                  </label>
                  <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900">
                    {estoque.almoxarifado_codigo ? `${estoque.almoxarifado_codigo} - ` : ''}{estoque.almoxarifado_nome || '-'}
                  </div>
                  <input type="hidden" name="almoxarifado_id" value={almoxarifadoSelecionado} />
                </div>
              ) : (
                <Input
                  label="Almoxarifado *"
                  name="almoxarifado_id"
                  type="select"
                  value={almoxarifadoSelecionado}
                  onChange={(e) => setAlmoxarifadoSelecionado(e.target.value)}
                  disabled={isViewMode || carregandoAlmoxarifados}
                  required
                >
                  <option value="">{carregandoAlmoxarifados ? 'Carregando...' : 'Selecione um almoxarifado'}</option>
                  {almoxarifados.map(almox => (
                    <option key={almox.id} value={String(almox.id)}>
                      {almox.codigo ? `${almox.codigo} - ` : ''}{almox.nome}
                    </option>
                  ))}
                </Input>
              )}

              {isViewMode && estoque ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produto Genérico
                  </label>
                  <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900">
                    {estoque.produto_generico_codigo ? `${estoque.produto_generico_codigo} - ` : ''}{estoque.produto_generico_nome || '-'}
                  </div>
                  <input type="hidden" name="produto_generico_id" value={produtoGenericoSelecionado} />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produto Genérico *
                  </label>
                  <SearchableSelect
                    value={produtoGenericoSelecionado}
                    onChange={(value) => setProdutoGenericoSelecionado(value)}
                    options={produtosGenericos.map(produto => ({
                      value: String(produto.id),
                      label: produto.codigo ? `${produto.codigo} - ${produto.nome}` : produto.nome
                    }))}
                    placeholder={
                      carregandoProdutosGenericos
                        ? 'Carregando produtos...'
                        : 'Digite para buscar produto...'
                    }
                    disabled={isViewMode || carregandoProdutosGenericos}
                    loading={carregandoProdutosGenericos}
                  />
                  <input type="hidden" name="produto_generico_id" value={produtoGenericoSelecionado} />
                </div>
              )}

              <Input
                label="Status"
                name="status"
                type="select"
                defaultValue={estoque ? estoque.status : 'ATIVO'}
                disabled={isViewMode}
              >
                <option value="ATIVO">Ativo</option>
                <option value="BLOQUEADO">Bloqueado</option>
                <option value="INATIVO">Inativo</option>
              </Input>
            </div>
          </div>

          {/* Card: Quantidades e Valores */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Quantidades e Valores
            </h3>
            <div className="space-y-3">
              <Input
                label="Quantidade Atual"
                name="quantidade_atual"
                type="number"
                step="0.001"
                defaultValue={estoque ? estoque.quantidade_atual : 0}
                disabled={isViewMode}
              />

              <Input
                label="Quantidade Reservada"
                name="quantidade_reservada"
                type="number"
                step="0.001"
                defaultValue={estoque ? estoque.quantidade_reservada : 0}
                disabled={isViewMode}
              />

              <Input
                label="Valor Unitário Médio"
                name="valor_unitario_medio"
                type="number"
                step="0.01"
                defaultValue={estoque ? estoque.valor_unitario_medio : 0}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Card: Controle de Estoque */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Controle de Estoque
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Estoque Mínimo"
              name="estoque_minimo"
              type="number"
              step="0.001"
              defaultValue={estoque ? estoque.estoque_minimo : 0}
              disabled={isViewMode}
            />

            <Input
              label="Estoque Máximo"
              name="estoque_maximo"
              type="number"
              step="0.001"
              defaultValue={estoque ? estoque.estoque_maximo : ''}
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* Card: Controle */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Controle
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Lote"
              name="lote"
              type="text"
              defaultValue={estoque ? estoque.lote : ''}
              disabled={isViewMode}
              placeholder="Ex: LOTE001"
            />

            <Input
              label="Data de Validade"
              name="data_validade"
              type="date"
              defaultValue={estoque && estoque.data_validade ? estoque.data_validade.split('T')[0] : ''}
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* Card: Observações */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Observações
          </h3>
          <Input
            label=""
            name="observacoes"
            type="textarea"
            defaultValue={estoque?.observacoes}
            disabled={isViewMode}
            rows={3}
            placeholder="Observações adicionais..."
          />
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {!isViewMode && (
            <Button type="submit" variant="primary" size="lg">
              {estoque ? 'Atualizar Estoque' : 'Salvar'}
            </Button>
          )}
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EstoqueModal;

