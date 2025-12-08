import React from 'react';

const SubstituicoesTableHeader = () => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th style={{ width: '50px' }} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
        <th style={{ width: '100px' }} className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
        <th style={{ minWidth: '200px' }} className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto Origem</th>
        <th style={{ width: '100px' }} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Unid.</th>
        <th style={{ width: '120px' }} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd Origem</th>
        <th style={{ width: '130px' }} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Semana Abast.</th>
        <th style={{ width: '130px' }} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Semana Consumo</th>
        <th style={{ width: '100px' }} className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
        <th style={{ minWidth: '250px' }} className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto Genérico</th>
        <th style={{ width: '120px' }} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Unid. Medida</th>
        <th style={{ width: '120px' }} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd Genérico</th>
        <th style={{ width: '120px' }} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
      </tr>
    </thead>
  );
};

export default SubstituicoesTableHeader;

