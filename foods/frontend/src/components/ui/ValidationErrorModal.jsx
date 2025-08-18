import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import Button from './Button';

const ValidationErrorModal = ({ isOpen, onClose, errors, errorCategories }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Mapeamento dinâmico de ícones baseado no nome da categoria
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Informações Básicas': '📋',
      'Classificação': '🏷️',
      'Dimensões e Pesos': '📏',
      'Tributação': '💰',
      'Documentos e Registros': '📄',
      'Referências': '🔗',
      'Informações da Rota': '🛣️',
      'Agendamento': '📅',
      'Métricas da Rota': '📊',
      'Localização': '📍',
      'Informações Operacionais': '⚙️',
      'Informações Senior': '🏢',
      'Informações Adicionais': '📝',
      'Informações Técnicas': '🔧',
      'Capacidades e Pesos': '⚖️',
      'Manutenção': '🔧',
      'Documentação': '📋',
      'Informações Financeiras': '💳',
      'Informações Pessoais': '👤',
      'Informações de Acesso': '🔐',
      'Informações de Contato': '📞',
      'Endereço': '📍',
      'Informações da Empresa': '🏢',
      'Informações Organizacionais': '🏗️',
      'Status': '📊',
      'Campos Gerais': '📝',
      'Medidas': '📐',
      'Informações de Mercado': '🏪',
      'Detalhes de Referência': '🔍',
      'Validade': '⏰',
      'Integração': '🔌'
    };

    return iconMap[categoryName] || '⚠️';
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden relative z-[999999]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h2 className="text-xl font-semibold text-gray-900">
              Erros de Validação
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="p-2"
          >
            <FaTimes className="text-gray-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {errorCategories ? (
            // Exibir erros organizados por categoria
            <div className="space-y-4">
              {Object.entries(errorCategories).map(([categoryCode, categoryErrors]) => {
                if (categoryErrors.length === 0) return null;
                
                // Mapear códigos para nomes amigáveis
                const categoryNames = {
                  'basicInfo': 'Informações Básicas',
                  'classification': 'Classificação',
                  'dimensions': 'Dimensões e Pesos',
                  'taxation': 'Tributação',
                  'documents': 'Documentos e Registros',
                  'references': 'Referências',
                  'routeInfo': 'Informações da Rota',
                  'schedule': 'Agendamento',
                  'metrics': 'Métricas da Rota',
                  'locationInfo': 'Localização',
                  'operationalInfo': 'Informações Operacionais',
                  'seniorInfo': 'Informações Senior',
                  'additionalInfo': 'Informações Adicionais',
                  'technicalInfo': 'Informações Técnicas',
                  'capacityInfo': 'Capacidades e Pesos',
                  'maintenanceInfo': 'Manutenção',
                  'documentationInfo': 'Documentação',
                  'financialInfo': 'Informações Financeiras',
                  'personalInfo': 'Informações Pessoais',
                  'accessInfo': 'Informações de Acesso',
                  'contactInfo': 'Informações de Contato',
                  'addressInfo': 'Endereço',
                  'companyInfo': 'Informações da Empresa',
                  'organizationalInfo': 'Informações Organizacionais',
                  'statusInfo': 'Status',
                  'measurementInfo': 'Medidas',
                  'marketInfo': 'Informações de Mercado',
                  'referenceDetails': 'Detalhes de Referência',
                  'validityInfo': 'Validade',
                  'integrationInfo': 'Integração',
                  'general': 'Campos Gerais'
                };
                
                const categoryName = categoryNames[categoryCode] || categoryCode;
                
                return (
                  <div key={categoryCode} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{getCategoryIcon(categoryName)}</span>
                      <h3 className="font-semibold text-gray-900">
                        {categoryName}
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {categoryErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-red-600">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{error.msg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            // Exibir erros simples
            <div className="space-y-2">
              {errors && errors.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-red-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{error.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ValidationErrorModal;
