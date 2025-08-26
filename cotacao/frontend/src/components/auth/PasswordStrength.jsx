import React from 'react';

export const PasswordStrength = ({ password }) => {
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    
    // Comprimento mínimo
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    
    // Caracteres especiais
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 2) return { score, label: 'Fraca', color: 'red' };
    if (score <= 4) return { score, label: 'Média', color: 'yellow' };
    if (score <= 5) return { score, label: 'Forte', color: 'green' };
    return { score, label: 'Muito Forte', color: 'green' };
  };

  const strength = getPasswordStrength(password);
  
  if (!password) return null;

  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  };

  const textColorClasses = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600'
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className={textColorClasses[strength.color]}>
          Força da senha: {strength.label}
        </span>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`w-2 h-2 rounded-full ${
                level <= strength.score ? colorClasses[strength.color] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PasswordStrength;
