import React from 'react';

/**
 * Componente base para seções do formulário
 * Segue o padrão do layout com título, ícone e descrição
 */
const FormSection = ({ 
  icon: Icon, 
  title, 
  description, 
  children, 
  isInfoBox = false,
  isGreenBox = false,
  className = ''
}) => {
  // Determinar classes de background e borda
  let bgAndBorderClasses = 'bg-gray-50 border border-gray-200';
  if (isGreenBox) {
    bgAndBorderClasses = 'bg-green-50 border-l-4 border-green-500';
  } else if (isInfoBox) {
    bgAndBorderClasses = 'bg-blue-50 border-l-4 border-blue-500';
  }
  
  return (
    <div className={`${bgAndBorderClasses} p-3 rounded-lg ${className}`}>
      {/* Título da Seção */}
      <div className="mb-2 pb-1.5 border-b-2 border-green-500">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {Icon && <Icon className="text-green-600" />}
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-600 mt-0.5">
            {description}
          </p>
        )}
      </div>
      
      {/* Conteúdo da Seção */}
      <div>
        {children}
      </div>
    </div>
  );
};

export default FormSection;

