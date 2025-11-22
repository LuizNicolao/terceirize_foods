import React from 'react';
import Modal from './Modal';
import { FaSpinner, FaDatabase, FaCheckCircle } from 'react-icons/fa';

const ModalProgressoRestore = ({
  isOpen,
  title = 'Restaurando Backup...',
  progresso = 0,
  total = 100,
  mensagem = 'Aguarde, restaurando dados...',
  databaseName = '',
  elapsedTime = 0,
  fileSize = 0
}) => {
  const percentual = Math.min(Math.round((progresso / total) * 100), 100);

  const formatElapsedTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Não permite fechar durante o restore
      title={title}
      size="sm"
    >
      <div className="py-6 px-4">
        <div className="text-center mb-6">
          {progresso < total ? (
            <FaSpinner className="animate-spin text-green-600 text-4xl mx-auto mb-4" />
          ) : (
            <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-4" />
          )}
          <p className="text-gray-700 mb-2 font-medium">{mensagem}</p>
          {databaseName && (
            <p className="text-sm text-gray-600 mb-1">
              <FaDatabase className="inline mr-1" />
              {databaseName}
            </p>
          )}
          {elapsedTime > 0 && (
            <p className="text-xs text-gray-500">
              ⏱️ Tempo decorrido: {formatElapsedTime(elapsedTime)}
            </p>
          )}
          {fileSize > 0 && (
            <p className="text-xs text-gray-500">
              📦 Tamanho: {formatBytes(fileSize)}
            </p>
          )}
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-green-600 h-4 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentual}%` }}
          />
        </div>

        {/* Porcentagem e números */}
        <div className="text-center">
          <span className="text-2xl font-bold text-green-600">{percentual}%</span>
          {progresso > 0 && total > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Processando: {progresso.toLocaleString('pt-BR')} / {total.toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalProgressoRestore;

