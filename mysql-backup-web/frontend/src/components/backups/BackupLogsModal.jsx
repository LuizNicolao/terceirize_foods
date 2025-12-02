import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function BackupLogsModal({ isOpen, onClose, backupId }) {
  const [logContent, setLogContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && backupId) {
      loadLogs();
    } else {
      setLogContent('');
      setError(null);
    }
  }, [isOpen, backupId]);

  const loadLogs = async () => {
    if (!backupId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get(`/backups/${backupId}/logs`);
      
      if (res.data && res.data.success) {
        setLogContent(res.data.data.log || 'Log vazio');
      } else {
        setError(res.data?.message || 'Erro ao carregar logs');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao carregar logs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (logContent) {
      navigator.clipboard.writeText(logContent);
      toast.success('Log copiado para a área de transferência!');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Logs do Backup"
      size="xl"
    >
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8 text-gray-500">
            Carregando logs...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && logContent && (
          <>
            <div className="flex justify-end gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                Copiar Log
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadLogs}
              >
                Atualizar
              </Button>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap break-words">{logContent}</pre>
            </div>
          </>
        )}

        {!loading && !error && !logContent && (
          <div className="text-center py-8 text-gray-500">
            Nenhum log disponível
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

