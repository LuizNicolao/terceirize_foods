import React from 'react';

const PedidosComprasDadosSolicitacao = ({ solicitacaoSelecionada }) => {
  if (!solicitacaoSelecionada) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados da Solicitação</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-600 font-medium">Número da Solicitação:</span>
          <p className="text-gray-900 mt-1">{solicitacaoSelecionada.numero_solicitacao || '-'}</p>
        </div>
        <div>
          <span className="text-gray-600 font-medium">Data de Entrega CD:</span>
          <p className="text-gray-900 mt-1">
            {solicitacaoSelecionada.data_entrega_cd 
              ? new Date(solicitacaoSelecionada.data_entrega_cd).toLocaleDateString('pt-BR')
              : '-'}
          </p>
        </div>
        <div>
          <span className="text-gray-600 font-medium">Justificativa:</span>
          <p className="text-gray-900 mt-1">{solicitacaoSelecionada.motivo || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default PedidosComprasDadosSolicitacao;

