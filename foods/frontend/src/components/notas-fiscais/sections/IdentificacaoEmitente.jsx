import React from 'react';
import { FaBuilding } from 'react-icons/fa';
import FormSection from './FormSection';

const IdentificacaoEmitente = ({ fornecedor, isViewMode = false }) => {
  if (!fornecedor) {
    return null;
  }

  return (
    <FormSection
      icon={FaBuilding}
      title="Identificação do Emitente"
      isGreenBox={true}
    >
      <div className="space-y-3">
        {/* Informações Principais - Layout compacto */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              Razão Social
            </label>
            <p className="text-sm text-gray-900">{fornecedor.razao_social || '-'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              CNPJ
            </label>
            <p className="text-sm text-gray-900">{fornecedor.cnpj || '-'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              Telefone
            </label>
            <p className="text-sm text-gray-900">{fornecedor.telefone || '-'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              Nome Fantasia
            </label>
            <p className="text-sm text-gray-900">{fornecedor.nome_fantasia || '-'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              Email
            </label>
            <p className="text-sm text-gray-900">{fornecedor.email || '-'}</p>
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
              <p className="text-sm text-gray-900">{fornecedor.logradouro || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Número</p>
              <p className="text-sm text-gray-900">{fornecedor.numero || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">CEP</p>
              <p className="text-sm text-gray-900">{fornecedor.cep || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Bairro</p>
              <p className="text-sm text-gray-900">{fornecedor.bairro || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Município/UF</p>
              <p className="text-sm text-gray-900">
                {fornecedor.municipio || fornecedor.cidade || '-'}
                {fornecedor.uf ? `/${fornecedor.uf}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default IdentificacaoEmitente;

