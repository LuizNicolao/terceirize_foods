import React from 'react';
import { FaCalendarAlt, FaSchool, FaUser, FaClock, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { EmptyState } from '../ui';

const HistoricoTab = ({ historico, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando histórico...</span>
      </div>
    );
  }
  
  if (!historico || historico.length === 0) {
    return (
      <EmptyState
        title="Nenhum histórico encontrado"
        description="O histórico de alterações aparecerá aqui quando houver registros"
        icon="history"
      />
    );
  }
  
  const getAcaoIcon = (acao) => {
    switch (acao) {
      case 'criacao':
        return <FaPlus className="text-green-600" />;
      case 'edicao':
        return <FaEdit className="text-blue-600" />;
      case 'exclusao':
        return <FaTrash className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };
  
  const getAcaoText = (acao) => {
    switch (acao) {
      case 'criacao':
        return 'Registro criado';
      case 'edicao':
        return 'Registro atualizado';
      case 'exclusao':
        return 'Registro excluído';
      default:
        return 'Ação realizada';
    }
  };
  
  const getAcaoColor = (acao) => {
    switch (acao) {
      case 'criacao':
        return 'bg-green-100 border-green-200';
      case 'edicao':
        return 'bg-blue-100 border-blue-200';
      case 'exclusao':
        return 'bg-red-100 border-red-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="relative">
        {/* Linha vertical da timeline */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Itens do histórico */}
        <div className="space-y-6">
          {historico.map((item, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Ícone da ação */}
              <div className={`
                relative z-10 flex items-center justify-center w-16 h-16 
                rounded-full border-4 border-white shadow-sm
                ${getAcaoColor(item.acao)}
              `}>
                {getAcaoIcon(item.acao)}
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 pb-6">
                <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {getAcaoText(item.acao)}
                    </h4>
                    <span className="text-xs text-gray-500 flex items-center">
                      <FaClock className="mr-1" />
                      {new Date(item.data_acao).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {/* Detalhes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FaSchool className="mr-2 text-green-600" />
                      <span className="font-medium">Escola:</span>
                      <span className="ml-2">{item.escola_nome || `ID ${item.escola_id}`}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-blue-600" />
                      <span className="font-medium">Data Registro:</span>
                      <span className="ml-2">
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-2 text-purple-600" />
                      <span className="font-medium">Responsável:</span>
                      <span className="ml-2">{item.usuario_nome || `ID ${item.nutricionista_id}`}</span>
                    </div>
                    
                    {item.valores && (
                      <div className="md:col-span-2">
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.valores.lanche_manha > 0 && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              Lanche Manhã: {item.valores.lanche_manha}
                            </span>
                          )}
                          {item.valores.almoco > 0 && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                              Almoço: {item.valores.almoco}
                            </span>
                          )}
                          {item.valores.lanche_tarde > 0 && (
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                              Lanche Tarde: {item.valores.lanche_tarde}
                            </span>
                          )}
                          {item.valores.parcial > 0 && (
                            <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
                              Parcial: {item.valores.parcial}
                            </span>
                          )}
                          {item.valores.eja > 0 && (
                            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">
                              EJA: {item.valores.eja}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoricoTab;

