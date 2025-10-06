import React from 'react';

const RegistroDetails = ({ registro }) => {
  if (!registro || !registro.medias) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum registro diário encontrado</p>
      </div>
    );
  }


  // Definir apenas os 5 tipos de registros permitidos (formato antigo)
  const tiposRegistros = [
    { key: 'lanche_manha', label: 'LANCHE DA MANHA' },
    { key: 'almoco', label: 'ALMOÇO' },
    { key: 'lanche_tarde', label: 'LANCHE DA TARDE' },
    { key: 'parcial', label: 'PARCIAL' },
    { key: 'eja', label: 'EJA' }
  ];

  // Criar lista de registros para exibir
  const registrosParaExibir = [];
  
  tiposRegistros.forEach(tipo => {
    const valor = registro.medias[tipo.key] || 0;
    
    // Adicionar todos os tipos, mesmo com valor 0
    registrosParaExibir.push({
      tipo: tipo.label,
      valor: parseFloat(valor).toFixed(2)
    });
  });

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
            {registrosParaExibir.map((registro, index) => (
              <tr key={registro.tipo} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {registro.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-medium">{registro.valor}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Informação adicional */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Nota:</strong> Valores lançados para esta escola e data.
        </p>
      </div>
    </div>
  );
};

export default RegistroDetails;
