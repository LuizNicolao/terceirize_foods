import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Button } from '../../design-system/components';

const HeaderSupervisor = ({ cotacao }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-8">
      <Button
        onClick={() => navigate('/supervisor')}
        className="bg-gray-500 text-white px-3 py-2 rounded text-xs border-none cursor-pointer transition-all duration-300 flex items-center gap-1.5 hover:bg-gray-600"
      >
        <FaArrowLeft />
        Voltar
      </Button>
      <div>
        <h1 className="text-gray-800 text-2xl font-bold m-0">
          Análise de Cotação #{cotacao?.id} - Supervisor
        </h1>
        <p className="text-gray-500 text-base m-0">
          Análise detalhada e liberação para gerência
        </p>
      </div>
    </div>
  );
};

export default HeaderSupervisor;
