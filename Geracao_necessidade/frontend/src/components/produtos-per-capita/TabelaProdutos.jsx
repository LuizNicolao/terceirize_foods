import React from 'react';

const TabelaProdutos = ({ produtos, onProdutosChange, readOnly = false }) => {
  const periodos = [
    { key: 'parcial', label: 'PARCIAL' },
    { key: 'almoco', label: 'ALMOÇO' },
    { key: 'lanche', label: 'LANCHE' },
    { key: 'eja', label: 'EJA' },
  ];

  const handleChange = (periodoKey, value) => {
    if (onProdutosChange) {
      onProdutosChange(periodoKey, parseFloat(value) || 0);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
              Período
            </th>
            {periodos.map(periodo => (
              <th 
                key={periodo.key} 
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 last:border-r-0"
              >
                {periodo.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-300 bg-gray-50">
              PER CAPITA
            </td>
            {periodos.map(periodo => {
              const fieldName = `per_capita_${periodo.key}`;
              const value = parseFloat(produtos?.[fieldName]) || 0;
              
              return (
                <td 
                  key={`per_capita_${periodo.key}`} 
                  className="px-4 py-3 text-center border-r border-gray-300 last:border-r-0"
                >
                  {readOnly ? (
                    <span className="text-sm text-gray-900">
                      {value.toFixed(3)}
                    </span>
                  ) : (
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={value}
                      onChange={(e) => handleChange(periodo.key, e.target.value)}
                      className="w-24 p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      readOnly={readOnly}
                    />
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TabelaProdutos;
