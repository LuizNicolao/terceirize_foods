import React from 'react';
import { FaReceipt } from 'react-icons/fa';
import { Input } from '../../ui';
import FormSection from './FormSection';

const InformacoesFiscais = ({ formData, onChange, isViewMode = false, hidden = true }) => {
  if (hidden) {
    return null;
  }

  return (
    <FormSection
      icon={FaReceipt}
      title="Informações Fiscais"
      description="Dados fiscais da operação: natureza da operação e CFOP."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Natureza da Operação"
          name="natureza_operacao"
          value={formData.natureza_operacao || ''}
          onChange={(e) => onChange('natureza_operacao', e.target.value)}
          disabled={isViewMode}
        />
        <Input
          label="CFOP"
          name="cfop"
          value={formData.cfop || ''}
          onChange={(e) => onChange('cfop', e.target.value)}
          disabled={isViewMode}
          maxLength={10}
        />
      </div>
    </FormSection>
  );
};

export default InformacoesFiscais;

