import React from 'react';

const TabelaRegistrosSimples = ({ 
  medias, 
  onMediasChange, 
  readOnly = false 
}) => {
  const handleMediasChange = (tipoMedia, periodo, value) => {
    if (onMediasChange) {
      // Garantir que apenas números válidos sejam aceitos
      const numValue = parseFloat(value) || 0;
      const roundedValue = Math.round(numValue * 100) / 100; // Arredondar para 2 casas decimais
      onMediasChange(tipoMedia, periodo, roundedValue);
    }
  };

        // Definir apenas os 5 tipos de registros específicos 
        const tiposRegistros = [
          { key: 'lanche_manha', label: 'LANCHE DA MANHA' },
          { key: 'almoco', label: 'ALMOÇO' },
          { key: 'lanche_tarde', label: 'LANCHE DA TARDE' },
          { key: 'parcial', label: 'PARCIAL' },
          { key: 'eja', label: 'EJA' }
        ];

  // Criar lista de registros para exibir
  const registros = [];
  
  tiposRegistros.forEach(tipo => {
    const valor = medias[tipo.key] || 0;
    
    // Só adicionar se o valor for maior que 0 ou se não for readonly
    if (valor > 0 || !readOnly) {
      registros.push({
        tipo: tipo.label,
        valor: valor,
        key: tipo.key
      });
    }
  });

  // Se não há registros e é readonly, mostrar mensagem
  if (readOnly && registros.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum lançamento encontrado para esta data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Lançado no Dia
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registros.map((registro, index) => (
              <tr key={registro.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {registro.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {readOnly ? (
                    <span className="text-sm text-gray-900">
                      {registro.valor > 0 ? registro.valor.toFixed(2) : '0.00'}
                    </span>
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={registro.valor}
                      onChange={(e) => {
                        const numValue = parseFloat(e.target.value) || 0;
                        const roundedValue = Math.round(numValue * 100) / 100;
                        // Simular chamada do onMediasChange com formato antigo
                        if (onMediasChange) {
                          onMediasChange(registro.key, 'valor', roundedValue);
                        }
                      }}
                      className="w-full max-w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      placeholder="0.00"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Informação adicional */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Nota:</strong> Escola e Data são definidos no formulário acima. 
          Preencha os valores de lançamento para cada tipo de média.
        </p>
      </div>
    </div>
  );
};

export default TabelaRegistrosSimples;
