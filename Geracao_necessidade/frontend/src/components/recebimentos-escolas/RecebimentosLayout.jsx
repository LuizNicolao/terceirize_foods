import React from 'react';

const RecebimentosLayout = ({ children, actions }) => {
  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <svg className="mr-2 sm:mr-3 text-green-600 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Recebimentos Escolas
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os recebimentos de produtos nas escolas
          </p>
        </div>
        {actions}
      </div>

      {/* Conteúdo Principal */}
      <div className="space-y-4 md:space-y-6">
        {children}
      </div>
    </div>
  );
};

export default RecebimentosLayout;
