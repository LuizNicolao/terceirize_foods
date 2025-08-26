import React, { useState } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { aprovacoesService } from '../../services/aprovacoes';

const ModalRejeicao = ({ cotacao, onClose, onSuccess }) => {
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRejeicaoConfirmada = async () => {
    if (!motivoRejeicao.trim()) {
      toast.error('Por favor, informe o motivo da rejeição.');
      return;
    }

    setSaving(true);
    try {
      await aprovacoesService.rejeitarCotacao(cotacao.id, {
        motivo_rejeicao: motivoRejeicao
      });
      
      toast.success('Cotação rejeitada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao rejeitar cotação:', error);
      toast.error('Erro ao rejeitar cotação');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Rejeitar Cotação</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Motivo da Rejeição */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo da Rejeição
          </label>
          <textarea
            value={motivoRejeicao}
            onChange={(e) => setMotivoRejeicao(e.target.value)}
            placeholder="Informe o motivo da rejeição..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleRejeicaoConfirmada}
            disabled={saving}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" />
                Rejeitando...
              </>
            ) : (
              <>
                <FaTimes />
                Confirmar Rejeição
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRejeicao;
