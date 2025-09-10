import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaTruck, FaExclamationTriangle, FaFlag } from 'react-icons/fa';

const DeliveryEditModal = ({ 
  isOpen, 
  onClose, 
  delivery, 
  onSave, 
  onDelete,
  agrupamentoData 
}) => {
  const [formData, setFormData] = useState({
    date: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Função auxiliar para formatar data localmente (evita problemas de timezone)
  const formatDateLocal = (date) => {
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    
    
    return formatted;
  };

  // Inicializar dados do formulário
  useEffect(() => {
    if (delivery) {
      // DEBUG: Log da entrega recebida
      
      const dataFormatada = delivery.date ? formatDateLocal(delivery.date) : '';
      
      setFormData({
        date: dataFormatada
      });
    } else {
      // Reset para nova entrega
      setFormData({
        date: ''
      });
    }
    setErrors({});
  }, [delivery]);

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar entrega
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // DEBUG: Log da data original do formulário
      
      // Corrigir problema de fuso horário
      const [year, month, day] = formData.date.split('-');
      const correctedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // DEBUG: Log da data corrigida
      
      const deliveryData = {
        ...delivery, // Manter dados existentes
        date: correctedDate,
        id: delivery?.id || `delivery_${Date.now()}`,
        isNew: !delivery
      };
      
      // DEBUG: Log dos dados que serão enviados

      const success = await onSave(deliveryData);
      if (success) {
        // Modal permanece aberto para permitir mais edições
        setSuccessMessage('✅ Entrega salva com sucesso!');
        setTimeout(() => setSuccessMessage(''), 3000); // Remove mensagem após 3 segundos
      }
    } catch (error) {
      console.error('Erro ao salvar entrega:', error);
    } finally {
      setSaving(false);
    }
  };

  // Excluir entrega
  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta entrega?')) {
      onDelete(delivery.id);
      // Modal permanece aberto após exclusão
      setSuccessMessage('✅ Entrega excluída com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000); // Remove mensagem após 3 segundos
    }
  };

  // Atualizar campo do formulário
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FaTruck className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              {delivery ? 'Alterar Data da Entrega' : 'Nova Entrega'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          {/* Mensagem de sucesso */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-800 text-sm font-medium">{successMessage}</p>
            </div>
          )}
          
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline h-4 w-4 mr-1" />
              Data da Entrega
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateField('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Avisos */}
          {delivery?.feriado && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <div className="flex items-center">
                <FaFlag className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-orange-800 font-medium">
                  Feriado: {delivery.feriado.name}
                </span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Esta entrega está marcada para um feriado. Verifique se será realizada.
              </p>
            </div>
          )}

          {delivery?.conflicts && delivery.conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">
                  Conflitos Detectados
                </span>
              </div>
              <ul className="text-red-700 text-sm mt-1">
                {delivery.conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {delivery && !delivery.isNew && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Excluir
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar e Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryEditModal;
