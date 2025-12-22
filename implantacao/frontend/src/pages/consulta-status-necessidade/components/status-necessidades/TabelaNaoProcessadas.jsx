import React from 'react';
import { FaTimesCircle, FaFilePdf, FaFileExcel, FaSearch, FaSort, FaSortUp, FaSortDown, FaList, FaLayerGroup } from 'react-icons/fa';
import { Pagination } from '../../../../components/ui';
import { getStatusNecessidadeLabel } from '../../utils/getStatusLabels';
import { formatarQuantidade } from '../../utils/formatarQuantidade';

const TabelaNaoProcessadas = ({
  necessidades,
  necessidadesFiltradas,
  necessidadesPaginadas,
  loading,
  modoVisualizacao,
  onModoVisualizacaoChange,
  busca,
  onBuscaChange,
  sortConfig,
  onSort,
  page,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  onExportPDF,
  onExportExcel,
  temFiltrosAtivos
}) => {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-blue-600" />
      : <FaSortDown className="text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-red-50 border-b border-gray-200 p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-red-800 flex items-center">
              <FaTimesCircle className="mr-2" />
              Não Processadas ({necessidadesFiltradas.length} de {necessidades.length})
            </h3>
            <p className="text-red-600 text-sm mt-1">
              Necessidades sem substituição ou aguardando confirmação (conf)
            </p>
          </div>
          
          {necessidadesFiltradas.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={onExportPDF}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                title="Exportar necessidades não processadas em PDF"
              >
                <FaFilePdf className="mr-2" />
                PDF
              </button>
              <button
                onClick={onExportExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                title="Exportar necessidades não processadas em Excel"
              >
                <FaFileExcel className="mr-2" />
                Excel
              </button>
            </div>
          )}
        </div>
        
        {/* Controle de visualização */}
        <div className="mt-3 flex items-center justify-between">
          <div></div>
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                onModoVisualizacaoChange('individual');
                  onPageChange(1);
                }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                modoVisualizacao === 'individual'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Visualização Individual"
            >
              <FaList className="w-4 h-4" />
              Individual
            </button>
            <button
              onClick={() => {
                onModoVisualizacaoChange('consolidado');
                  onPageChange(1);
                }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                modoVisualizacao === 'consolidado'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Visualização Consolidada"
            >
              <FaLayerGroup className="w-4 h-4" />
              Consolidado
            </button>
          </div>
        </div>
        
        {/* Busca local */}
        <div className="mt-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por escola, nutricionista, produto, grupo, status..."
              value={busca}
              onChange={(e) => {
                onBuscaChange(e.target.value);
                onPageChange(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Carregando...</span>
          </div>
        ) : necessidadesPaginadas.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {modoVisualizacao === 'consolidado' ? (
                    <>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('produto')}
                      >
                        <div className="flex items-center gap-2">
                          Produto
                          {getSortIcon('produto')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('grupo')}
                      >
                        <div className="flex items-center gap-2">
                          Grupo
                          {getSortIcon('grupo')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Escolas
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Necessidades
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('quantidade')}
                      >
                        <div className="flex items-center gap-2">
                          Quantidade Total
                          {getSortIcon('quantidade')}
                        </div>
                      </th>
                    </>
                  ) : (
                    <>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('escola_nome')}
                      >
                        <div className="flex items-center gap-2">
                          Escola
                          {getSortIcon('escola_nome')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('usuario_email')}
                      >
                        <div className="flex items-center gap-2">
                          Nutricionista
                          {getSortIcon('usuario_email')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('produto')}
                      >
                        <div className="flex items-center gap-2">
                          Produto
                          {getSortIcon('produto')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('grupo')}
                      >
                        <div className="flex items-center gap-2">
                          Grupo
                          {getSortIcon('grupo')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semana Abastecimento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semana Consumo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {necessidadesPaginadas.map((necessidade, index) => (
                  <tr key={`nao-processada-${necessidade.id || index}-${necessidade.escola_id || index}-${necessidade.produto_id || index}-${index}`} className="hover:bg-red-50">
                    {modoVisualizacao === 'consolidado' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {necessidade.produto}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {necessidade.grupo || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {getStatusNecessidadeLabel(necessidade.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                            {necessidade.total_escolas || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                            {necessidade.total_necessidades || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {necessidade.quantidade_total ? (
                            <span className="font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {formatarQuantidade(necessidade.quantidade_total)} {necessidade.produto_unidade || ''}
                            </span>
                          ) : '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {necessidade.escola_nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {necessidade.nutricionista_nome || necessidade.usuario_email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {necessidade.produto}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {necessidade.grupo || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {getStatusNecessidadeLabel(necessidade.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {necessidade.semana_abastecimento || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {necessidade.semana_consumo || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {necessidade.quantidade ? (
                            <span className="font-medium">{formatarQuantidade(necessidade.quantidade)}</span>
                          ) : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Paginação */}
            {necessidadesFiltradas.length > itemsPerPage && (
              <div className="px-4 py-3 border-t border-gray-200">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(necessidadesFiltradas.length / itemsPerPage)}
                  totalItems={necessidadesFiltradas.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={onPageChange}
                  onItemsPerPageChange={(value) => {
                    onItemsPerPageChange(value);
                    onPageChange(1);
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FaTimesCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma necessidade não processada encontrada</p>
            {!temFiltrosAtivos && (
              <p className="text-sm mt-1">Preencha os filtros e clique em "Aplicar Filtros" para visualizar os dados.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabelaNaoProcessadas;

