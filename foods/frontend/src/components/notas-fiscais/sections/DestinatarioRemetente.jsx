import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import FormSection from './FormSection';

const DestinatarioRemetente = ({ filial, isViewMode = false }) => {
  if (!filial) {
    return null;
  }

  return (
    <FormSection
      icon={FaMapMarkerAlt}
      title="Destinatário / Remetente"
      isGreenBox={true}
    >
      <div className="space-y-3">
        {/* Informações Principais - Layout compacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              Filial
            </label>
            <p className="text-sm text-gray-900">{filial.filial || filial.nome || '-'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              CNPJ
            </label>
            <p className="text-sm text-gray-900">{filial.cnpj || '-'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              Razão Social
            </label>
            <p className="text-sm text-gray-900">{filial.razao_social || '-'}</p>
          </div>
        </div>
        
        {/* Endereço - Layout compacto em 2 linhas */}
        <div className="pt-2 border-t border-gray-200">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Endereço
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Logradouro</p>
              <p className="text-sm text-gray-900">{filial.logradouro || filial.endereco || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Número</p>
              <p className="text-sm text-gray-900">{filial.numero || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">CEP</p>
              <p className="text-sm text-gray-900">{filial.cep || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Bairro</p>
              <p className="text-sm text-gray-900">{filial.bairro || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Município/UF</p>
              <p className="text-sm text-gray-900">
                {filial.municipio || filial.cidade || '-'}
                {filial.uf ? `/${filial.uf}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default DestinatarioRemetente;

