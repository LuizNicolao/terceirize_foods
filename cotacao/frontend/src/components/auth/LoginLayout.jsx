import React from 'react';
import { Logo } from '../ui';

export const LoginLayout = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md mx-4 animate-fadeInUp">
        <div className="text-center mb-8">
          <div className="mb-4">
            <Logo size="xl" showText={false} className="mx-auto mb-3" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
            Cotação
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sistema de Gerenciamento de Cotações
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
};
