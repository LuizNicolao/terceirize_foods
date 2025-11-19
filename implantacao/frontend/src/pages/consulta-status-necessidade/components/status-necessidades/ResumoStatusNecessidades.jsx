import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaSync } from 'react-icons/fa';

const ResumoStatusNecessidades = ({
  totalProcessadas,
  totalNaoProcessadas,
  ultimaAtualizacao
}) => {
  const formatarUltimaAtualizacao = () => {
    if (!ultimaAtualizacao) return '';
    const agora = new Date();
    const diff = agora - ultimaAtualizacao;
    const minutos = Math.floor(diff / 60000);
    
    if (minutos < 1) return 'Agora mesmo';
    if (minutos === 1) return 'Há 1 minuto';
    if (minutos < 60) return `Há ${minutos} minutos`;
    
    const horas = Math.floor(minutos / 60);
    if (horas === 1) return 'Há 1 hora';
    return `Há ${horas} horas`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Necessidades Processadas</p>
              <p className="text-2xl font-bold text-green-600">{totalProcessadas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
            <FaTimesCircle className="text-red-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">Necessidades Não Processadas</p>
              <p className="text-2xl font-bold text-red-600">{totalNaoProcessadas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <FaSync className="text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">Última Atualização</p>
              <p className="text-sm text-blue-600">{formatarUltimaAtualizacao()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoStatusNecessidades;

