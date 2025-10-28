import React from 'react';

const ConsultaStatusLayout = ({ children }) => {
  return (
    <div className="p-4 sm:p-6">
      {/* Conteúdo Principal */}
      <div className="space-y-4 md:space-y-6">
        {children}
      </div>
    </div>
  );
};

export default ConsultaStatusLayout;
