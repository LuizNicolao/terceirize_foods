import React from 'react';
import { SearchableSelect } from '../ui';

const PedidosComprasFiliaisSelect = ({
  tipo = 'faturamento', // 'faturamento', 'cobranca', 'entrega'
  filiais = [],
  filialSelecionada = null,
  onFilialChange,
  dadosFilial = null,
  viewMode = false,
  required = false,
  error
}) => {
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

  const isReadonly = tipo === 'faturamento'; // Faturamento é readonly (mostra apenas o nome da filial)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{getTitulo()}</h4>
      
      {/* Select de Filial */}
      {!isReadonly && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Filial {required && <span className="text-red-500">*</span>}
          </label>
          <SearchableSelect
            options={filiais.map(f => ({
              value: f.id.toString(),
              label: `${f.filial || f.nome || 'Filial'} ${f.codigo_filial ? `(${f.codigo_filial})` : ''}`
            }))}
            value={filialSelecionada?.toString() || ''}
            onChange={(value) => {
              if (onFilialChange) {
                onFilialChange(value ? parseInt(value) : null);
              }
            }}
            disabled={viewMode || isReadonly}
            placeholder="Selecione uma filial"
            error={error}
          />
        </div>
      )}

      {/* Nome da Filial (readonly para faturamento) */}
      {isReadonly && filialSelecionada && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Filial
          </label>
          <p className="text-sm text-gray-900 font-medium">
            {(() => {
              const filial = filiais.find(f => f.id?.toString() === filialSelecionada?.toString());
              return filial ? `${filial.filial || filial.nome || 'Filial'} ${filial.codigo_filial ? `(${filial.codigo_filial})` : ''}` : '-';
            })()}
          </p>
        </div>
      )}

      {/* Dados da Filial (readonly) */}
      {dadosFilial && (
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <span className="text-gray-600 font-medium">Razão Social:</span>
            <p className="text-gray-900 mt-1">{dadosFilial.razao_social || dadosFilial.filial || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600 font-medium">CNPJ:</span>
            <p className="text-gray-900 mt-1">{dadosFilial.cnpj || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600 font-medium">Endereço:</span>
            <p className="text-gray-900 mt-1">
              {dadosFilial.endereco_completo || 
               `${dadosFilial.logradouro || ''} ${dadosFilial.numero || ''} ${dadosFilial.bairro || ''} ${dadosFilial.cidade || ''} ${dadosFilial.estado || ''} ${dadosFilial.cep ? `CEP: ${dadosFilial.cep}` : ''}`.trim() || '-'}
            </p>
          </div>
          {dadosFilial.codigo_filial && (
            <div>
              <span className="text-gray-600 font-medium">Código Filial:</span>
              <p className="text-gray-900 mt-1">{dadosFilial.codigo_filial}</p>
            </div>
          )}
        </div>
      )}

      {!dadosFilial && (
        <p className="text-xs text-gray-500">
          {isReadonly 
            ? 'Dados serão preenchidos automaticamente da solicitação'
            : 'Selecione uma filial para ver os dados'}
        </p>
      )}
    </div>
  );
};

export default PedidosComprasFiliaisSelect;

