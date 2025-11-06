import React, { useState, useEffect } from 'react';
import { Modal, Button, SearchableSelect } from '../ui';
import { FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TipoAtendimentoEscolaModal = ({
  isOpen,
  onClose,
  onSave,
  escolas = [],
  tiposAtendimento = [],
  editingItem = null,
  viewMode = false,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    escola_id: '',
    tipo_atendimento: '',
    ativo: true
  });

  const [errors, setErrors] = useState({});

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editingItem) {
      setFormData({
        escola_id: editingItem.escola_id || '',
        tipo_atendimento: editingItem.tipo_atendimento || '',
        ativo: editingItem.ativo !== undefined ? editingItem.ativo : true
      });
    } else {
      setFormData({
        escola_id: '',
        tipo_atendimento: '',
        ativo: true
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.escola_id) {
      newErrors.escola_id = 'Escola é obrigatória';
    }

    if (!formData.tipo_atendimento) {
      newErrors.tipo_atendimento = 'Tipo de atendimento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    await onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? (viewMode ? '👁️ Visualizar Vínculo' : '✏️ Editar Vínculo') : '➕ Novo Vínculo'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Escola */}
        <div>
          <SearchableSelect
            label="Escola *"
            value={formData.escola_id}
            onChange={(value) => handleInputChange('escola_id', value)}
            options={escolas.map(escola => ({
              value: escola.id,
              label: `${escola.nome_escola}${escola.rota ? ` - ${escola.rota}` : ''}`,
              description: escola.cidade
            }))}
            placeholder="Selecione uma escola..."
            disabled={loading || viewMode}
            required
            error={errors.escola_id}
            filterBy={(option, searchTerm) => {
              const label = option.label.toLowerCase();
              const description = option.description?.toLowerCase() || '';
              const term = searchTerm.toLowerCase();
              return label.includes(term) || description.includes(term);
            }}
            renderOption={(option) => (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                )}
              </div>
            )}
          />
        </div>

        {/* Tipo de Atendimento */}
        <div>
          <SearchableSelect
            label="Tipo de Atendimento *"
            value={formData.tipo_atendimento}
            onChange={(value) => handleInputChange('tipo_atendimento', value)}
            options={tiposAtendimento.map(tipo => ({
              value: tipo.value,
              label: tipo.label
            }))}
            placeholder="Selecione um tipo de atendimento..."
            disabled={loading || viewMode}
            required
            error={errors.tipo_atendimento}
          />
        </div>

        {/* Status Ativo */}
        {editingItem && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <SearchableSelect
              value={formData.ativo ? 'ativo' : 'inativo'}
              onChange={(value) => handleInputChange('ativo', value === 'ativo')}
              options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' }
              ]}
              disabled={loading || viewMode}
            />
          </div>
        )}

        {/* Botões */}
        {!viewMode && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={loading}
            >
              <FaTimes className="mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FaSave className="mr-2" />
              {loading ? 'Salvando...' : editingItem ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        )}

        {viewMode && (
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Fechar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default TipoAtendimentoEscolaModal;

