import React from 'react';

const MediasCalculadas = ({ mediasCalculadas }) => {
  if (!mediasCalculadas || Object.keys(mediasCalculadas).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma média calculada disponível</p>
      </div>
    );
  }

  // Definir apenas os 5 tipos de registros permitidos
  const tiposRegistros = [
    { key: 'lanche_manha', label: 'LANCHE DA MANHA' },
    { key: 'almoco', label: 'ALMOÇO' },
    { key: 'lanche_tarde', label: 'LANCHE DA TARDE' },
    { key: 'parcial', label: 'PARCIAL' },
    { key: 'eja', label: 'EJA' }
  ];

  // Criar lista de médias para exibir
  const mediasParaExibir = [];
  
  tiposRegistros.forEach(registro => {
    const valor = mediasCalculadas[registro.key];
    
    // Se o valor é um objeto com propriedade 'media'
    if (valor && typeof valor === 'object' && valor.media > 0) {
      mediasParaExibir.push({
        tipo: registro.label,
        valor: parseFloat(valor.media).toFixed(2), // Valor com 2 casas decimais
        quantidade: valor.quantidade_registros || 0
      });
    }
    // Se o valor é um número direto
    else if (valor && typeof valor === 'number' && valor > 0) {
      mediasParaExibir.push({
        tipo: registro.label,
        valor: parseFloat(valor).toFixed(2), // Valor com 2 casas decimais
        quantidade: 1
      });
    }
    // Se não há valor, adicionar com 0
    else {
      mediasParaExibir.push({
        tipo: registro.label,
        valor: '0,00',
        quantidade: 0
      });
    }
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
                Média Calculada
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mediasParaExibir.map((media, index) => (
              <tr key={media.tipo} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {media.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-medium">{media.valor}</span>
                    {media.quantidade > 0 && (
                      <span className="text-xs text-gray-500">
                        ({media.quantidade} lançamento{media.quantidade > 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Informação adicional */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Nota:</strong> Médias calculadas considerando os últimos 20 dias úteis com lançamentos.
          A média é calculada pela soma dos valores dividida pela quantidade de lançamentos realizados.
        </p>
      </div>
    </div>
  );
};

export default MediasCalculadas;
