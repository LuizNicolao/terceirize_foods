import React, { useState } from 'react';
import CaptchaCheckbox from './CaptchaCheckbox';

const CaptchaDemo = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!isChecked) {
      setError('Por favor, confirme que você não é um robô');
    } else {
      setError('');
      alert('Captcha validado com sucesso!');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Demonstração do Captcha</h2>
      
      <div className="space-y-6">
        <CaptchaCheckbox
          isChecked={isChecked}
          onChange={setIsChecked}
          error={error}
          required={true}
        />
        
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
        >
          Validar
        </button>
        
        <div className="text-sm text-gray-600">
          <p><strong>Estado atual:</strong> {isChecked ? 'Marcado' : 'Desmarcado'}</p>
          <p><strong>Erro:</strong> {error || 'Nenhum'}</p>
        </div>
      </div>
    </div>
  );
};

export default CaptchaDemo;
