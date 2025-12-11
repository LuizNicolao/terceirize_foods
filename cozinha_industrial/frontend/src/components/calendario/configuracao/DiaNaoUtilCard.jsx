import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../../ui';

const formatarDestinoDia = (dia) => {
  if (dia.tipo_destino === 'global') {
    return 'Global - todas as unidades';
  }
  if (dia.tipo_destino === 'filial') {
    let descricao = `Filial: ${dia.filial_nome || dia.filial_id}`;
    if (dia.filial_cidade) {
      descricao += ` (${dia.filial_cidade})`;
    }
    return descricao;
  }
  if (dia.tipo_destino === 'unidade') {
    let descricao = `Unidade: ${dia.unidade_nome || dia.unidade_escolar_id}`;
    if (dia.unidade_cidade) {
      descricao += ` (${dia.unidade_cidade})`;
    }
    return descricao;
  }
  return 'Destino não informado';
};

const DiaNaoUtilCard = ({ dia, onRemover, onEditar, disabled }) => {
  const dataFormatada = dia.data
    ? new Date(`${dia.data}T00:00:00`).toLocaleDateString('pt-BR')
    : '-';

  // Se dia.destinos existe, significa que é um grupo agrupado
  const isAgrupado = Array.isArray(dia.destinos) && dia.destinos.length > 0;
  const destinos = isAgrupado ? dia.destinos : [dia];

  return (
    <div className="flex items-start justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
      <div className="pr-3 flex-1">
        <div className="font-medium text-gray-900">{dia.descricao || 'Dia não útil'}</div>
        <div className="text-sm text-gray-500">{dataFormatada}</div>
        
        {isAgrupado ? (
          <div className="mt-1">
            <div className="text-xs text-amber-700">
              Vinculado a {destinos.length} {destinos.length === 1 ? 'destino' : 'destinos'}
            </div>
          </div>
        ) : (
          <div className="text-xs text-amber-700 mt-1">{formatarDestinoDia(dia)}</div>
        )}
        
        {dia.observacoes && (
          <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{dia.observacoes}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onEditar && (
          <Button
            onClick={() => onEditar(dia)}
            variant="outline"
            size="sm"
            disabled={disabled}
          >
            <FaEdit className="h-4 w-4" />
          </Button>
        )}
        <Button
          onClick={() => onRemover(dia)}
          variant="outline"
          size="sm"
          disabled={disabled}
        >
          <FaTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DiaNaoUtilCard;

