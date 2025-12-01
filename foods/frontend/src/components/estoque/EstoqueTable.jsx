import React, { useMemo, useState, useEffect } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

const EstoqueTable = ({ 
  estoques, 
  canView, 
  onView, 
  getStatusLabel,
  formatDate,
  formatCurrency,
  formatNumber,
  sortField,
  sortDirection,
  onSort
}) => {
  // Estado para controlar grupos expandidos (todos expandidos por padrão)
  const [expandedGroups, setExpandedGroups] = useState(() => {
    // Inicializar todos os grupos como expandidos
    const grupos = {};
    if (Array.isArray(estoques) && estoques.length > 0) {
      estoques.forEach(estoque => {
        const grupoNome = estoque.grupo_nome || 'Sem Grupo';
        if (!grupos[grupoNome]) {
          grupos[grupoNome] = true;
        }
      });
    }
    return grupos;
  });

  // Função para alternar expansão de grupo
  const toggleGroup = (grupoNome) => {
    setExpandedGroups(prev => ({
      ...prev,
      [grupoNome]: !prev[grupoNome]
    }));
  };

  // Agrupar estoques por grupo
  const estoquesAgrupados = useMemo(() => {
    if (!Array.isArray(estoques) || estoques.length === 0) {
      return [];
    }

    const grupos = {};
    estoques.forEach(estoque => {
      const grupoNome = estoque.grupo_nome || 'Sem Grupo';
      if (!grupos[grupoNome]) {
        grupos[grupoNome] = {
          nome: grupoNome,
          estoques: []
        };
      }
      grupos[grupoNome].estoques.push(estoque);
    });

    // Ordenar grupos por nome
    return Object.values(grupos).sort((a, b) => 
      a.nome.localeCompare(b.nome, 'pt-BR')
    );
  }, [estoques]);

  // Atualizar expandedGroups quando estoques mudarem (adicionar novos grupos)
  useEffect(() => {
    if (Array.isArray(estoques) && estoques.length > 0) {
      setExpandedGroups(prev => {
        const novos = { ...prev };
        estoques.forEach(estoque => {
          const grupoNome = estoque.grupo_nome || 'Sem Grupo';
          if (novos[grupoNome] === undefined) {
            novos[grupoNome] = true; // Expandir novos grupos por padrão
          }
        });
        return novos;
      });
    }
  }, [estoques]);

  if (!Array.isArray(estoques) || estoques.length === 0) {
    return (
      <EmptyState
        title="Nenhum estoque encontrado"
        description="Tente ajustar os filtros de busca"
        icon="estoque"
      />
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <SortableTableHeader
                  label="Código Produto"
                  field="produto_generico_codigo"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Nome Produto"
                  field="produto_generico_nome"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade de Medida
                </th>
                <SortableTableHeader
                  label="Quantidade em Estoque"
                  field="quantidade_atual"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Valor Unitário"
                  field="valor_unitario_medio"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Valor Total"
                  field="valor_total"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estoquesAgrupados.map((grupo, grupoIndex) => (
                <React.Fragment key={grupo.nome}>
                  {/* Cabeçalho do Grupo */}
                  <tr className="bg-green-50 border-t-2 border-green-500">
                    <td colSpan="7" className="px-6 py-3">
                      <button
                        onClick={() => toggleGroup(grupo.nome)}
                        className="flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 w-full text-left"
                      >
                        {expandedGroups[grupo.nome] !== false ? (
                          <FaChevronDown className="text-xs" />
                        ) : (
                          <FaChevronRight className="text-xs" />
                        )}
                        <span>{grupo.nome}</span>
                        <span className="ml-2 text-xs text-green-600 font-normal">
                          ({grupo.estoques.length} {grupo.estoques.length === 1 ? 'produto' : 'produtos'})
                        </span>
                      </button>
                    </td>
                  </tr>
                  {/* Produtos do Grupo */}
                  {expandedGroups[grupo.nome] !== false && grupo.estoques.map((estoque) => (
                <tr key={estoque.produto_generico_id || estoque.id} className="hover:bg-gray-50">
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {estoque.produto_generico_codigo || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {estoque.produto_generico_nome || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {estoque.unidade_medida_sigla || estoque.unidade_medida_nome || estoque.unidade_medida || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatNumber(estoque.quantidade_atual)}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(estoque.valor_unitario_medio)}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(estoque.valor_total)}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium">
                    <ActionButtons
                      canView={canView('almoxarifado_estoque') && onView}
                      canEdit={false}
                      canDelete={false}
                      onView={() => onView(estoque.produto_generico_id)}
                      item={estoque.produto_generico_id}
                    />
                  </td>
                </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-4">
        {estoquesAgrupados.map((grupo) => (
          <div key={grupo.nome}>
            {/* Cabeçalho do Grupo */}
            <button
              onClick={() => toggleGroup(grupo.nome)}
              className="w-full bg-green-50 border-l-4 border-green-500 rounded-lg p-3 mb-3 text-left hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedGroups[grupo.nome] !== false ? (
                  <FaChevronDown className="text-xs text-green-700" />
                ) : (
                  <FaChevronRight className="text-xs text-green-700" />
                )}
                <h2 className="text-sm font-bold text-green-700">
                  {grupo.nome}
                </h2>
                <span className="ml-auto text-xs text-green-600">
                  {grupo.estoques.length} {grupo.estoques.length === 1 ? 'produto' : 'produtos'}
                </span>
              </div>
            </button>
            {/* Produtos do Grupo */}
            {expandedGroups[grupo.nome] !== false && grupo.estoques.map((estoque) => (
              <div key={estoque.produto_generico_id || estoque.id} className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-3">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base">{estoque.produto_generico_nome || '-'}</h3>
                <p className="text-gray-600 text-sm">
                  {estoque.produto_generico_codigo && `Código: ${estoque.produto_generico_codigo}`}
                </p>
              </div>
              <ActionButtons
                canView={canView('almoxarifado_estoque') && onView}
                canEdit={false}
                canDelete={false}
                onView={() => onView(estoque.produto_generico_id)}
                item={estoque.produto_generico_id}
                size="xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Unidade de Medida:</span>
                <p className="font-medium">{estoque.unidade_medida_sigla || estoque.unidade_medida_nome || estoque.unidade_medida || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Quantidade em Estoque:</span>
                <p className="font-medium">{formatNumber(estoque.quantidade_atual)}</p>
              </div>
              <div>
                <span className="text-gray-500">Valor Unitário:</span>
                <p className="font-medium">{formatCurrency(estoque.valor_unitario_medio)}</p>
              </div>
              <div>
                <span className="text-gray-500">Valor Total:</span>
                <p className="font-medium">{formatCurrency(estoque.valor_total)}</p>
              </div>
            </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default EstoqueTable;

