import React from 'react';

const tipoBadgeStyles = {
  global: 'bg-blue-100 text-blue-800',
  filial: 'bg-purple-100 text-purple-800',
  unidade: 'bg-amber-100 text-amber-800',
  outros: 'bg-gray-100 text-gray-700'
};

const getTipoDestinoLabel = (tipo) => {
  switch (tipo) {
    case 'global':
      return 'Global';
    case 'filial':
      return 'Filiais';
    case 'unidade':
      return 'Unidades escolares';
    default:
      return 'Outros';
  }
};

const DiasNaoUteisResumoChips = ({ resumo }) => {
  if (!resumo || resumo.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {resumo.map((item) => (
        <span
          key={`resumo-chip-${item.tipo}`}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${tipoBadgeStyles[item.tipo] || tipoBadgeStyles.outros}`}
        >
          {getTipoDestinoLabel(item.tipo)}: {item.quantidade}
        </span>
      ))}
    </div>
  );
};

export default DiasNaoUteisResumoChips;

