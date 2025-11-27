import React from 'react';
import { FaClipboard } from 'react-icons/fa';
import { Input } from '../../ui';
import FormSection from './FormSection';

const InformacoesAdicionais = ({ formData, onChange, isViewMode = false }) => {
  return (
    <FormSection
      icon={FaClipboard}
      title="Informações Adicionais"
      description="Informações complementares da NF-e e observações internas sobre a nota fiscal."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Informações Complementares da NF-e"
          name="informacoes_complementares"
          type="textarea"
          value={formData.informacoes_complementares || ''}
          onChange={(e) => onChange('informacoes_complementares', e.target.value.toUpperCase())}
          disabled={isViewMode}
          rows={4}
        />
        <Input
          label="Observações Internas"
          name="observacoes"
          type="textarea"
          value={formData.observacoes || ''}
          onChange={(e) => onChange('observacoes', e.target.value.toUpperCase())}
          disabled={isViewMode}
          rows={4}
        />
      </div>
    </FormSection>
  );
};

export default InformacoesAdicionais;

