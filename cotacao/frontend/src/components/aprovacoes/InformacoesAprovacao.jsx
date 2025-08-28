import React from 'react';
import { Card } from '../../design-system/components';

const InformacoesSupervisor = ({ cotacao }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'aguardando_aprovacao':
      case 'aguardando_aprovacao':
        return 'bg-yellow-500';
      case 'aprovado':
        return 'bg-green-500';
      case 'rejeitado':
        return 'bg-red-500';
      case 'renegociacao':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'em_analise': 'Aguardando Análise do Supervisor',
      'aguardando_aprovacao': 'Aguardando Aprovação',
      'aguardando_aprovacao_supervisor': 'Aguardando Análise do Supervisor',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'renegociacao': 'Em Renegociação'
    };
    return statusMap[status] || status;
  };

  const formatarData = (data) => {
    if (!data) return 'Data não informada';
    
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) {
        return 'Data inválida';
      }
      return dataObj.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Card className="p-5 mb-6 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-700 text-sm">Comprador</span>
          <span className="text-gray-800 text-base">{cotacao?.comprador}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-700 text-sm">Data de Criação</span>
          <span className="text-gray-800 text-base">{formatarData(cotacao?.data_criacao)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-700 text-sm">Status</span>
          <span className={`${getStatusColor(cotacao?.status)} text-white px-3 py-1 rounded-full text-xs font-semibold inline-block w-fit`}>
            {getStatusLabel(cotacao?.status)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-700 text-sm">Tipo</span>
          <span className="text-gray-800 text-base">
            {cotacao?.tipo_compra === 'emergencial' ? 'Emergencial' : 'Programada'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-700 text-sm">Local de Entrega</span>
          <span className="text-gray-800 text-base">{cotacao?.local_entrega || 'CD CHAPECO'}</span>
        </div>
        {cotacao?.motivo_emergencial && (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-700 text-sm">Motivo Emergencial</span>
            <span className="text-gray-800 text-base">{cotacao.motivo_emergencial}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InformacoesSupervisor;
