import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';

/**
 * Modal para Tipo de Receita
 */
const TipoReceitaModal = ({
  isOpen,
  onClose,
  onSubmit,
  tipoReceita,
  isViewMode = false
}) => {
  const [formData, setFormData] = useState({
    tipo_receita: '',
    descricao: '',
    status: 1
  });

  const [errors, setErrors] = useState({});

  // Limpar dados quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        tipo_receita: '',
        descricao: '',
        status: 1
      });
      setErrors({});
    }
  }, [isOpen]);

  // Preencher dados quando tipo de receita é fornecido
  useEffect(() => {
    if (isOpen && tipoReceita) {
      setFormData({
        tipo_receita: tipoReceita.tipo_receita || '',
        descricao: tipoReceita.descricao || '',
        status: tipoReceita.status !== undefined ? tipoReceita.status : 1
      });
    }
  }, [isOpen, tipoReceita]);

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
    if (!formData.tipo_receita || formData.tipo_receita.trim() === '') {
      newErrors.tipo_receita = 'Tipo de receita é obrigatório';
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
          ? 'Visualizar Tipo de Receita' 
          : tipoReceita 
            ? 'Editar Tipo de Receita' 
            : 'Novo Tipo de Receita'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Código (somente leitura) */}
          {tipoReceita && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código
              </label>
              <Input
                type="text"
                value={tipoReceita.codigo || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
          )}

          {/* Tipo de Receita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Receita <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.tipo_receita}
              onChange={(e) => handleInputChange('tipo_receita', e.target.value.toUpperCase())}
              disabled={isViewMode}
              error={errors.tipo_receita}
              placeholder="Digite o tipo de receita"
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
                {tipoReceita ? 'Atualizar Tipo de Receita' : 'Salvar Tipo de Receita'}
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

export default TipoReceitaModal;

