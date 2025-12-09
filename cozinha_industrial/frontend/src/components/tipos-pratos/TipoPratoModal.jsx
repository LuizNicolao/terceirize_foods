import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';

/**
 * Modal para Tipo de Prato
 */
const TipoPratoModal = ({
  isOpen,
  onClose,
  onSubmit,
  tipoPrato,
  isViewMode = false
}) => {
  const [formData, setFormData] = useState({
    tipo_prato: '',
    descricao: '',
    status: 1
  });

  const [errors, setErrors] = useState({});

  // Limpar dados quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        tipo_prato: '',
        descricao: '',
        status: 1
      });
      setErrors({});
    }
  }, [isOpen]);

  // Preencher dados quando tipo de prato é fornecido
  useEffect(() => {
    if (isOpen && tipoPrato) {
      setFormData({
        tipo_prato: tipoPrato.tipo_prato || '',
        descricao: tipoPrato.descricao || '',
        status: tipoPrato.status !== undefined ? tipoPrato.status : 1
      });
    }
  }, [isOpen, tipoPrato]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação
    const newErrors = {};
    if (!formData.tipo_prato || formData.tipo_prato.trim() === '') {
      newErrors.tipo_prato = 'Tipo de prato é obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewMode 
          ? 'Visualizar Tipo de Prato' 
          : tipoPrato 
            ? 'Editar Tipo de Prato' 
            : 'Novo Tipo de Prato'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Código (somente leitura) */}
          {tipoPrato && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código
              </label>
              <Input
                type="text"
                value={tipoPrato.codigo || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
          )}

          {/* Tipo de Prato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Prato <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.tipo_prato}
              onChange={(e) => handleInputChange('tipo_prato', e.target.value.toUpperCase())}
              disabled={isViewMode}
              error={errors.tipo_prato}
              placeholder="Digite o tipo de prato"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              disabled={isViewMode}
              rows={4}
              placeholder="Digite a descrição (opcional)"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status !== undefined ? formData.status : 1}
              onChange={(e) => handleInputChange('status', parseInt(e.target.value))}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={1}>Ativo</option>
              <option value={0}>Inativo</option>
            </select>
          </div>

          {/* Botões */}
          {!isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {tipoPrato ? 'Atualizar Tipo de Prato' : 'Salvar Tipo de Prato'}
              </Button>
            </div>
          )}

          {isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="primary"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TipoPratoModal;

