import React from 'react';

const TabelaMedias = ({ 
  medias, 
  onMediasChange, 
  readOnly = false 
}) => {
  const handleMediasChange = (tipoMedia, periodo, value) => {
    if (onMediasChange) {
      // Aceitar números decimais com até 2 casas decimais
      const numValue = parseFloat(value) || 0;
      const roundedValue = Math.round(numValue * 100) / 100; // Arredondar para 2 casas decimais
      onMediasChange(tipoMedia, periodo, roundedValue);
    }
  };

  const tiposMedias = [
    { key: 'media_eja', label: 'MÉDIA EJA' },
    { key: 'media_almoco', label: 'MÉDIA ALMOÇO' },
    { key: 'media_parcial', label: 'MÉDIA PARCIAL' },
    { key: 'media_lanche', label: 'MÉDIA LANCHE' }
  ];

  const periodos = [
    { key: 'parcial', label: 'PARCIAL' },
    { key: 'almoco', label: 'ALMOÇO' },
    { key: 'lanche', label: 'LANCHE' },
    { key: 'eja', label: 'EJA' }
  ];

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                Média
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
            {tiposMedias.map(tipoMedia => (
              <tr key={tipoMedia.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-300 bg-gray-50">
                  {tipoMedia.label}
                </td>
                {periodos.map(periodo => {
                  const fieldName = `${tipoMedia.key}_${periodo.key}`;
                  const value = parseFloat(medias?.[fieldName]) || 0;
                  
                  return (
                    <td 
                      key={`${tipoMedia.key}_${periodo.key}`} 
                      className="px-4 py-3 text-center border-r border-gray-300 last:border-r-0"
                    >
                      {readOnly ? (
                        <span className="text-sm text-gray-900">
                          {Math.round(value)}
                        </span>
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={value}
                          onChange={(e) => handleMediasChange(tipoMedia.key, periodo.key, e.target.value)}
                          className="w-full px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0.00"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="lg:hidden space-y-4">
        {tiposMedias.map(tipoMedia => (
          <div key={tipoMedia.key} className="bg-white border border-gray-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">{tipoMedia.label}</h4>
            <div className="grid grid-cols-2 gap-3">
              {periodos.map(periodo => {
                const fieldName = `${tipoMedia.key}_${periodo.key}`;
                const value = parseFloat(medias?.[fieldName]) || 0;
                
                return (
                  <div key={periodo.key} className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {periodo.label}
                    </label>
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded">
                        {Math.round(value)}
                      </div>
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={value}
                        onChange={(e) => handleMediasChange(tipoMedia.key, periodo.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="0.00"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TabelaMedias;
