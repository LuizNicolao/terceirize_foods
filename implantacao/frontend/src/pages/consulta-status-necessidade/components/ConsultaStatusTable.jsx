import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle, FaBox, FaSchool } from 'react-icons/fa';

const ConsultaStatusTable = ({ necessidades, loading, canView }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONF':
        return <FaCheckCircle className="h-4 w-4 text-green-600" />;
      case 'PEND':
        return <FaClock className="h-4 w-4 text-yellow-600" />;
      case 'CANC':
        return <FaTimesCircle className="h-4 w-4 text-red-600" />;
      case 'REJE':
        return <FaExclamationTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FaClock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONF':
        return 'Confirmado';
      case 'PEND':
        return 'Pendente';
      case 'CANC':
        return 'Cancelado';
      case 'REJE':
        return 'Rejeitado';
      default:
        return status || 'N/A';
    }
  };

  const getStatusSubstituicaoIcon = (status) => {
    switch (status) {
      case 'aprovado':
        return <FaCheckCircle className="h-4 w-4 text-green-600" />;
      case 'conf':
        return <FaClock className="h-4 w-4 text-blue-600" />;
      case 'conf log':
        return <FaClock className="h-4 w-4 text-purple-600" />;
      case 'rejeitado':
        return <FaTimesCircle className="h-4 w-4 text-red-600" />;
      case 'cancelado':
        return <FaTimesCircle className="h-4 w-4 text-gray-600" />;
      case 'sem_substituicao':
        return <FaBox className="h-4 w-4 text-gray-400" />;
      default:
        return <FaBox className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusSubstituicaoLabel = (status) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado';
      case 'conf':
        return 'Confirmado';
      case 'conf log':
        return 'Confirmado (Log)';
      case 'rejeitado':
        return 'Rejeitado';
      case 'cancelado':
        return 'Cancelado';
      case 'sem_substituicao':
        return 'Sem Substituição';
      default:
        return status || 'N/A';
    }
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarQuantidade = (quantidade) => {
    if (!quantidade) return '0,000';
    return parseFloat(quantidade).toLocaleString('pt-BR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando necessidades...</span>
        </div>
      </div>
    );
  }

  if (!necessidades || necessidades.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-12">
          <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma necessidade encontrada
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros para encontrar as necessidades desejadas.
          </p>
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
                Escola
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Necessidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Substituição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto Genérico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qtd. Genérico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Criação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {necessidades.map((necessidade) => (
              <tr key={necessidade.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {necessidade.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaSchool className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {necessidade.escola_nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {necessidade.escola_rota}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {necessidade.produto_codigo} - {necessidade.produto}
                    </div>
                    <div className="text-sm text-gray-500">
                      {necessidade.produto_unidade}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatarQuantidade(necessidade.quantidade)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {necessidade.grupo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(necessidade.status)}
                    <span className="ml-2 text-sm text-gray-900">
                      {getStatusLabel(necessidade.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusSubstituicaoIcon(necessidade.status_substituicao)}
                    <span className="ml-2 text-sm text-gray-900">
                      {getStatusSubstituicaoLabel(necessidade.status_substituicao)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {necessidade.produto_generico_nome || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {necessidade.quantidade_generico ? formatarQuantidade(necessidade.quantidade_generico) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatarData(necessidade.data_criacao)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {necessidade.usuario_email || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsultaStatusTable;
