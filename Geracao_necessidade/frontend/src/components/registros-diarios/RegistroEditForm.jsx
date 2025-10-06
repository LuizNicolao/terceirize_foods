import React from 'react';
import { TabelaMedias } from '../medias-escolas';
import RegistroFormFields from './RegistroFormFields';

const RegistroEditForm = ({ 
  registro, 
  medias, 
  onMediasChange, 
  escolas, 
  selectedEscolaId, 
  onEscolaChange,
  data,
  onDataChange,
  buscaEscola,
  onBuscaEscolaChange,
  mostrarDropdownEscolas,
  setMostrarDropdownEscolas,
  escolasFiltradas,
  onEscolaSelect,
  indiceSelecionadoEscola,
  setIndiceSelecionadoEscola,
  dropdownEscolasRef,
  isViewMode = false
}) => {
  return (
    <div className="space-y-6">
      {/* Campos do Formulário */}
      <RegistroFormFields
        data={data}
        selectedEscolaId={selectedEscolaId}
        escolas={escolas}
        onDataChange={onDataChange}
        onEscolaChange={onEscolaChange}
      />

      {/* Registros Diários */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Registros Diários
        </h4>
        <TabelaMedias
          medias={medias}
          onMediasChange={onMediasChange}
          readOnly={isViewMode}
        />
      </div>
    </div>
  );
};

export default RegistroEditForm;
