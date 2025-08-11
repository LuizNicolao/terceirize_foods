import React from 'react';
import { 
  FaEye, 
  FaEdit, 
  FaPaperPlane, 
  FaTrash,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFileAlt
} from 'react-icons/fa';

const CotacoesTable = ({ 
  cotacoes, 
  loading, 
  handleViewCotacao, 
  handleEditCotacao, 
  handleEnviarParaSupervisor, 
  handleDeleteCotacao,
  formatDate,
  getStatusColor,
  getStatusLabel
}) => {
  const getStatusIcon = (status) => {
    const iconMap = {
      'pendente': FaClock,
      'aprovada': FaCheckCircle,
      'rejeitada': FaTimesCircle,
      'em_analise': FaSearch
    };
    const IconComponent = iconMap[status] || FaClock;
    return <IconComponent />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Carregando cotações...</span>
        </div>
      </div>
    );
  }

  if (cotacoes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <FaFileAlt className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Nenhuma cotação encontrada</p>
          <p className="text-sm">Tente ajustar os filtros ou criar uma nova cotação.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comprador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Local Entrega
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Criação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cotacoes.map((cotacao) => (
              <tr key={cotacao.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{cotacao.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cotacao.comprador}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cotacao.local_entrega}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    cotacao.tipo_compra === 'emergencial' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {cotacao.tipo_compra}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getStatusColor(cotacao.status) }}
                    ></div>
                    <span className="text-sm text-gray-900">
                      {getStatusLabel(cotacao.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(cotacao.data_criacao)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewCotacao(cotacao.id)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Visualizar"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditCotacao(cotacao.id)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    {cotacao.status === 'pendente' && (
                      <button
                        onClick={() => handleEnviarParaSupervisor(cotacao.id)}
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title="Enviar para Supervisor"
                      >
                        <FaPaperPlane />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCotacao(cotacao.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CotacoesTable;
