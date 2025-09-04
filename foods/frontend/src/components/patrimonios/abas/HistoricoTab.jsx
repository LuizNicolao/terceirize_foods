import React from 'react';
import { FaCalendar, FaBuilding, FaUser, FaFileAlt } from 'react-icons/fa';
import { Pagination } from '../../ui';
import HistoricoFilters from '../filtros/HistoricoFilters';

const HistoricoTab = ({
  movimentacoes,
  loadingMovimentacoes,
  filtrosHistorico,
  onFiltrosChange,
  onLimparFiltros,
  paginaHistorico,
  setPaginaHistorico,
  itensPorPagina,
  movimentacoesFiltradas,
  movimentacoesPaginadas,
  totalPaginas
}) => {
  return (
    <div className="max-h-[75vh] overflow-y-auto p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Histórico de Movimentações
      </h3>
      
      {/* Filtros */}
      <HistoricoFilters
        filtros={filtrosHistorico}
        onFiltrosChange={onFiltrosChange}
        onLimparFiltros={onLimparFiltros}
      />
      
      {/* Resultados */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {movimentacoesFiltradas.length} movimentação{movimentacoesFiltradas.length !== 1 ? 'ões' : ''} encontrada{movimentacoesFiltradas.length !== 1 ? 's' : ''}
          {filtrosHistorico.dataInicio || filtrosHistorico.dataFim || filtrosHistorico.motivo !== 'todos' || filtrosHistorico.responsavel || filtrosHistorico.local ? ' com os filtros aplicados' : ''}
          {totalPaginas > 1 && ` • Página ${paginaHistorico} de ${totalPaginas}`}
        </p>
      </div>

      {loadingMovimentacoes ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg text-gray-500 mt-2">Carregando movimentações...</p>
        </div>
      ) : movimentacoesPaginadas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filtrosHistorico.dataInicio || filtrosHistorico.dataFim || filtrosHistorico.motivo !== 'todos' || filtrosHistorico.responsavel || filtrosHistorico.local 
            ? 'Nenhuma movimentação encontrada com os filtros aplicados.' 
            : 'Nenhuma movimentação encontrada para este patrimônio.'}
        </div>
      ) : (
        <div className="space-y-4">
          {movimentacoesPaginadas.map((movimentacao, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FaCalendar className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(movimentacao.data_movimentacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  movimentacao.motivo === 'transferencia' ? 'bg-blue-100 text-blue-800' :
                  movimentacao.motivo === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                  movimentacao.motivo === 'devolucao' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {movimentacao.motivo === 'transferencia' ? 'Transferência' :
                   movimentacao.motivo === 'manutencao' ? 'Manutenção' :
                   movimentacao.motivo === 'devolucao' ? 'Devolução' :
                   movimentacao.motivo}
                 </span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div>
                   <p className="text-gray-600 mb-1">
                     <FaBuilding className="inline mr-2 text-gray-400" />
                     <strong>Origem:</strong>
                   </p>
                   <p className="text-gray-900 ml-6">{movimentacao.local_origem_nome || 'N/A'}</p>
                 </div>
                 
                 <div>
                   <p className="text-gray-600 mb-1">
                     <FaBuilding className="inline mr-2 text-gray-400" />
                     <strong>Destino:</strong>
                   </p>
                   <p className="text-gray-900 ml-6">{movimentacao.local_destino_nome || 'N/A'}</p>
                 </div>
                 
                 <div>
                   <p className="text-gray-600 mb-1">
                     <FaUser className="inline mr-2 text-gray-400" />
                     <strong>Responsável:</strong>
                   </p>
                   <p className="text-gray-900 ml-6">{movimentacao.responsavel_nome || 'N/A'}</p>
                 </div>
                 
                 <div>
                   <p className="text-gray-600 mb-1">
                     <FaFileAlt className="inline mr-2 text-gray-400" />
                     <strong>Observações:</strong>
                   </p>
                   <p className="text-gray-900 ml-6">{movimentacao.observacoes || 'Nenhuma'}</p>
                 </div>
               </div>
             </div>
           ))}
         </div>
       )}
       
       {/* Controles de Paginação */}
       <Pagination
         currentPage={paginaHistorico}
         totalPages={totalPaginas}
         onPageChange={setPaginaHistorico}
         totalItems={movimentacoesFiltradas.length}
         itemsPerPage={itensPorPagina}
       />
     </div>
   );
};

export default HistoricoTab;
