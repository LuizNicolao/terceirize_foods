import React from 'react';
import { FaFileInvoice } from 'react-icons/fa';
import { Input } from '../../ui';
import FormSection from './FormSection';

const DadosNotaFiscal = ({ formData, onChange, isViewMode = false, rirSelecionado = null }) => {
  // Validar se o número da nota corresponde ao RIR
  const numeroNotaRIR = rirSelecionado?.numero_nota_fiscal || null;
  const numeroNotaInformado = formData.numero_nota || '';
  const numeroNotaInvalido = numeroNotaRIR && numeroNotaInformado && numeroNotaInformado.trim() !== '' && numeroNotaInformado !== numeroNotaRIR;
  return (
    <FormSection
      icon={FaFileInvoice}
      title="Dados da Nota Fiscal"
      description="Informe os dados da nota fiscal: número, série e chave de acesso NF-e."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="Tipo de Nota *"
          name="tipo_nota"
          type="select"
          value={formData.tipo_nota || 'ENTRADA'}
          onChange={(e) => onChange('tipo_nota', e.target.value)}
          disabled={isViewMode}
          required
        >
          <option value="ENTRADA">Entrada</option>
          <option value="SAIDA">Saída</option>
        </Input>
        <Input
          label="Série *"
          name="serie"
          value={formData.serie || ''}
          onChange={(e) => onChange('serie', e.target.value)}
          disabled={isViewMode}
          required
          maxLength={10}
        />
        <div>
          <Input
            label="Número da Nota *"
            name="numero_nota"
            value={formData.numero_nota || ''}
            onChange={(e) => onChange('numero_nota', e.target.value)}
            disabled={isViewMode}
            required
            maxLength={20}
            error={numeroNotaInvalido}
          />
          {numeroNotaInvalido && (
            <p className="text-xs text-red-600 mt-1">
              O número da nota ({numeroNotaInformado}) não corresponde ao número da nota do RIR ({numeroNotaRIR})
            </p>
          )}
          {numeroNotaRIR && !numeroNotaInvalido && numeroNotaInformado === numeroNotaRIR && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Número da nota corresponde ao RIR
            </p>
          )}
        </div>
        <Input
          label="Data de Emissão *"
          name="data_emissao"
          type="date"
          value={formData.data_emissao || ''}
          onChange={(e) => onChange('data_emissao', e.target.value)}
          disabled={isViewMode}
          required
        />
        
        {/* Chave de Acesso - ocupa 3 colunas */}
        <div className="col-span-1 md:col-span-3">
          <Input
            label="Chave de Acesso (NF-e)"
            name="chave_acesso"
            value={formData.chave_acesso || ''}
            onChange={(e) => onChange('chave_acesso', e.target.value)}
            disabled={isViewMode}
            maxLength={44}
          />
        </div>
        
        {/* Data de Saída - 1 coluna */}
        <div className="col-span-1">
          <Input
            label="Data de Saída *"
            name="data_saida"
            type="date"
            value={formData.data_saida || ''}
            onChange={(e) => onChange('data_saida', e.target.value)}
            disabled={isViewMode}
            required
          />
        </div>
      </div>
    </FormSection>
  );
};

export default DadosNotaFiscal;

