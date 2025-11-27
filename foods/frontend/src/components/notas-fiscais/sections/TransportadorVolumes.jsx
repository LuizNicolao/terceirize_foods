import React from 'react';
import { FaTruck } from 'react-icons/fa';
import { Input } from '../../ui';
import FormSection from './FormSection';

const TransportadorVolumes = ({ formData, onChange, isViewMode = false }) => {
  // Função para formatar CNPJ
  const formatCNPJ = (value) => {
    if (!value) return '';
    // Remove tudo que não é número
    let cleaned = value.replace(/\D/g, '');
    // Limita a 14 dígitos
    if (cleaned.length > 14) {
      cleaned = cleaned.substring(0, 14);
    }
    // Aplica a máscara
    if (cleaned.length <= 14) {
      cleaned = cleaned.replace(/^(\d{2})(\d)/, '$1.$2');
      cleaned = cleaned.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      cleaned = cleaned.replace(/\.(\d{3})(\d)/, '.$1/$2');
      cleaned = cleaned.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return cleaned;
  };

  // Função para formatar Inscrição Estadual
  const formatInscricaoEstadual = (value) => {
    if (!value) return '';
    // Remove tudo que não é número
    let cleaned = value.replace(/\D/g, '');
    // Limita a 12 dígitos (tamanho comum de IE)
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    // Aplica a máscara: 123.456.789.012
    if (cleaned.length > 9) {
      cleaned = cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3.$4');
    } else if (cleaned.length > 6) {
      cleaned = cleaned.replace(/^(\d{3})(\d{3})(\d+)$/, '$1.$2.$3');
    } else if (cleaned.length > 3) {
      cleaned = cleaned.replace(/^(\d{3})(\d+)$/, '$1.$2');
    }
    return cleaned;
  };

  // Handler para mudanças em CNPJ
  const handleCNPJChange = (value) => {
    const formatted = formatCNPJ(value);
    onChange('transportadora_cnpj', formatted);
  };

  // Handler para mudanças em Inscrição Estadual
  const handleInscricaoEstadualChange = (value) => {
    const formatted = formatInscricaoEstadual(value);
    onChange('transportadora_inscricao_estadual', formatted);
  };
  return (
    <FormSection
      icon={FaTruck}
      title="Transportador / Volumes Transportados"
      description="Informe os dados do transporte e informações de volumes transportados."
    >
      {/* Linha 1 - Grid 5 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Input
          label="Razão Social Transp."
          name="transportadora_nome"
          value={formData.transportadora_nome || ''}
          onChange={(e) => onChange('transportadora_nome', e.target.value.toUpperCase())}
          disabled={isViewMode}
        />
        <Input
          label="CNPJ Transp."
          name="transportadora_cnpj"
          type="text"
          value={formData.transportadora_cnpj || ''}
          onChange={(e) => handleCNPJChange(e.target.value)}
          disabled={isViewMode}
          maxLength={18}
          placeholder="00.000.000/0000-00"
        />
        <Input
          label="Tipo Frete"
          name="tipo_frete"
          type="select"
          value={formData.tipo_frete || '9-SEM_FRETE'}
          onChange={(e) => onChange('tipo_frete', e.target.value)}
          disabled={isViewMode}
        >
          <option value="9-SEM_FRETE">Sem Frete</option>
          <option value="0-EMITENTE">Por conta do Emitente</option>
          <option value="1-DESTINATARIO">Por conta do Destinatário</option>
          <option value="2-TERCEIROS">Por conta de Terceiros</option>
        </Input>
        <Input
          label="Código ANTT"
          name="codigo_antt"
          value={formData.codigo_antt || ''}
          onChange={(e) => onChange('codigo_antt', e.target.value)}
          disabled={isViewMode}
        />
        <Input
          label="Placa Veículo"
          name="transportadora_placa"
          value={formData.transportadora_placa || ''}
          onChange={(e) => onChange('transportadora_placa', e.target.value.toUpperCase())}
          disabled={isViewMode}
          maxLength={10}
        />
      </div>

      {/* Linha 2 - Grid 5 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Input
          label="Endereço"
          name="transportadora_endereco"
          value={formData.transportadora_endereco || ''}
          onChange={(e) => onChange('transportadora_endereco', e.target.value.toUpperCase())}
          disabled={isViewMode}
        />
        <Input
          label="Bairro"
          name="transportadora_bairro"
          value={formData.transportadora_bairro || ''}
          onChange={(e) => onChange('transportadora_bairro', e.target.value.toUpperCase())}
          disabled={isViewMode}
        />
        <Input
          label="Município"
          name="transportadora_municipio"
          value={formData.transportadora_municipio || ''}
          onChange={(e) => onChange('transportadora_municipio', e.target.value.toUpperCase())}
          disabled={isViewMode}
        />
        <Input
          label="UF"
          name="transportadora_uf"
          type="text"
          value={formData.transportadora_uf || ''}
          onChange={(e) => onChange('transportadora_uf', e.target.value.toUpperCase().substring(0, 2))}
          disabled={isViewMode}
          maxLength={2}
          placeholder="ES"
        />
        <Input
          label="Inscrição Estadual"
          name="transportadora_inscricao_estadual"
          type="text"
          value={formData.transportadora_inscricao_estadual || ''}
          onChange={(e) => handleInscricaoEstadualChange(e.target.value)}
          disabled={isViewMode}
          placeholder="123.456.789.012"
        />
      </div>

      {/* Linha 3 - Grid 5 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Input
          label="Quantidade"
          name="volumes_quantidade"
          type="number"
          min="0"
          value={formData.volumes_quantidade || '0'}
          onChange={(e) => onChange('volumes_quantidade', e.target.value)}
          disabled={isViewMode}
        />
        <Input
          label="Espécie"
          name="volumes_especie"
          value={formData.volumes_especie || ''}
          onChange={(e) => onChange('volumes_especie', e.target.value)}
          disabled={isViewMode}
        />
        <Input
          label="Marca"
          name="volumes_marca"
          value={formData.volumes_marca || ''}
          onChange={(e) => onChange('volumes_marca', e.target.value)}
          disabled={isViewMode}
        />
        <Input
          label="Peso Bruto"
          name="volumes_peso_bruto"
          type="number"
          step="0.001"
          value={formData.volumes_peso_bruto || '0.000'}
          onChange={(e) => onChange('volumes_peso_bruto', e.target.value)}
          disabled={isViewMode}
        />
        <Input
          label="Peso Líquido"
          name="volumes_peso_liquido"
          type="number"
          step="0.001"
          value={formData.volumes_peso_liquido || '0.000'}
          onChange={(e) => onChange('volumes_peso_liquido', e.target.value)}
          disabled={isViewMode}
        />
      </div>
    </FormSection>
  );
};

export default TransportadorVolumes;

