import React from 'react';

const PedidosComprasDadosFilial = ({
  dadosFilial,
  tipo = 'faturamento', // 'faturamento', 'cobranca', 'entrega'
  viewMode = false
}) => {
  if (!dadosFilial) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">
          Nenhuma filial selecionada. Selecione uma solicitação para carregar os dados da filial.
        </p>
      </div>
    );
  }

  const getTitulo = () => {
    switch (tipo) {
      case 'cobranca':
        return 'Dados para Cobrança';
      case 'entrega':
        return 'Dados para Entrega';
      default:
        return 'Dados para Faturamento';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{getTitulo()}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600 font-medium">Razão Social:</span>
          <p className="text-gray-900 mt-1">{dadosFilial.razao_social || dadosFilial.filial || '-'}</p>
        </div>
        <div>
          <span className="text-gray-600 font-medium">CNPJ:</span>
          <p className="text-gray-900 mt-1">{dadosFilial.cnpj || '-'}</p>
        </div>
        <div className="md:col-span-2">
          <span className="text-gray-600 font-medium">Endereço:</span>
          <p className="text-gray-900 mt-1">
            {dadosFilial.endereco_completo || 
             `${dadosFilial.logradouro || ''} ${dadosFilial.numero || ''} ${dadosFilial.complemento || ''} ${dadosFilial.bairro || ''} ${dadosFilial.cidade || ''} ${dadosFilial.uf || ''} ${dadosFilial.cep ? `CEP: ${dadosFilial.cep}` : ''}`.trim() || '-'}
          </p>
        </div>
        {dadosFilial.codigo_filial && (
          <div>
            <span className="text-gray-600 font-medium">Código Filial:</span>
            <p className="text-gray-900 mt-1">{dadosFilial.codigo_filial}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosComprasDadosFilial;

