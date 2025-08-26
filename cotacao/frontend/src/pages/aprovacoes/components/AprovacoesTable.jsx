import React from 'react';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaCalendar, 
  FaDollarSign,
  FaEye
} from 'react-icons/fa';
import { Button } from '../../../components/ui';
import StatusBadge from '../../../components/shared/StatusBadge';
import TipoBadge from '../../../components/shared/TipoBadge';

const AprovacoesTable = ({
  aprovacoes,
  searchTerm,
  onView
}) => {

  
  // Filtrar cotações
  const filteredAprovacoes = aprovacoes.filter(aprovacao => {
    // Filtro por busca
    const matchesSearch = !searchTerm || 
      aprovacao.comprador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aprovacao.local_entrega?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (aprovacao.numero || aprovacao.id)?.toString().includes(searchTerm);

    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr key="header">
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comprador
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Local Entrega
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Data Criação
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Produtos
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAprovacoes.length === 0 ? (
              <tr key="no-data">
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {searchTerm 
                      ? 'Nenhuma cotação encontrada com os filtros aplicados'
                      : 'Nenhuma cotação aguardando aprovação'
                    }
                  </div>
                </td>
              </tr>
            ) : (
              filteredAprovacoes.map((aprovacao, index) => (
                <tr key={aprovacao.numero || aprovacao.id || `aprovacao-${index}`} className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        #{aprovacao.numero || aprovacao.id}
                      </div>
                      <div className="ml-2">
                        <TipoBadge tipo={aprovacao.tipo_compra} size="xs" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaUser className="text-gray-400 mr-2" size={12} />
                      <div className="text-sm text-gray-900">{aprovacao.comprador}</div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-400 mr-2" size={12} />
                      <div className="text-sm text-gray-900">{aprovacao.local_entrega}</div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center">
                      <FaCalendar className="text-gray-400 mr-2" size={12} />
                      <div className="text-sm text-gray-900">{formatDate(aprovacao.data_criacao)}</div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                    <div className="flex items-center">
                      <FaDollarSign className="text-gray-400 mr-2" size={12} />
                      <div className="text-sm text-gray-900">
                        {aprovacao.total_produtos > 0 ? `${aprovacao.total_produtos} produtos` : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={aprovacao.status} />
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      onClick={() => onView(aprovacao)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      title="Visualizar Cotação"
                    >
                      <FaEye size={12} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AprovacoesTable;
