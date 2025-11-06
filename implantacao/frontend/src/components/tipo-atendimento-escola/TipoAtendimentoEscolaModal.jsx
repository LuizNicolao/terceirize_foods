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
    tipos_selecionados: [],
    ativo: true
  });

  const [buscaTipo, setBuscaTipo] = useState('');
  const [errors, setErrors] = useState({});

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editingItem) {
      setFormData({
        escola_id: editingItem.escola_id || '',
        tipos_selecionados: editingItem.tipo_atendimento ? [editingItem.tipo_atendimento] : [],
        ativo: editingItem.ativo !== undefined ? editingItem.ativo : true
      });
    } else {
      setFormData({
        escola_id: '',
        tipos_selecionados: [],
        ativo: true
      });
    }
    setBuscaTipo('');
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

  const handleTipoToggle = (tipoValue) => {
    const novosTipos = formData.tipos_selecionados.includes(tipoValue)
      ? formData.tipos_selecionados.filter(t => t !== tipoValue)
      : [...formData.tipos_selecionados, tipoValue];
    
    setFormData(prev => ({
      ...prev,
      tipos_selecionados: novosTipos
    }));

    // Limpar erro quando selecionar um tipo
    if (errors.tipos_selecionados) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.tipos_selecionados;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.escola_id) {
      newErrors.escola_id = 'Escola é obrigatória';
    }

    if (!formData.tipos_selecionados || formData.tipos_selecionados.length === 0) {
      newErrors.tipos_selecionados = 'Selecione ao menos um tipo de atendimento';
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

    // Se estiver editando, manter o formato antigo para compatibilidade
    if (editingItem) {
      await onSave({
        ...formData,
        tipo_atendimento: formData.tipos_selecionados[0] // Para edição, manter apenas o primeiro
      });
    } else {
      // Para criação, enviar array de tipos para criar múltiplos vínculos
      await onSave({
        escola_id: formData.escola_id,
        tipos_atendimento: formData.tipos_selecionados,
        ativo: formData.ativo
      });
    }
  };

  // Filtrar tipos de atendimento pela busca
  const tiposFiltrados = tiposAtendimento.filter(tipo =>
    tipo.label.toLowerCase().includes(buscaTipo.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? (viewMode ? 'Visualizar Vínculo' : 'Editar Vínculo') : 'Novo Vínculo'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Escola */}
        <div>
          <SearchableSelect
            label="Escola"
            value={formData.escola_id}
            onChange={(value) => handleInputChange('escola_id', value)}
            options={escolas.map(escola => ({
              value: escola.id,
              label: `${escola.nome_escola}${escola.rota ? ` - ${escola.rota}` : ''}`,
              description: escola.cidade
            }))}
            placeholder="Selecione uma escola..."
            disabled={loading || viewMode || !!editingItem}
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

        {/* Tipos de Atendimento - Checkboxes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipos de Atendimento * <span className="text-gray-500 text-xs">({formData.tipos_selecionados.length} selecionado{formData.tipos_selecionados.length !== 1 ? 's' : ''})</span>
          </label>
          {!editingItem ? (
            <div className="border border-gray-300 rounded-lg bg-white">
              {/* Campo de busca */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Buscar tipo de atendimento..."
                  value={buscaTipo}
                  onChange={(e) => setBuscaTipo(e.target.value)}
                  disabled={viewMode || loading}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              
              {/* Lista de tipos filtrados */}
              <div className="p-2 max-h-56 overflow-y-auto">
                {tiposFiltrados.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Nenhum tipo encontrado com "{buscaTipo}"
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {tiposFiltrados.map(tipo => {
                      const isSelected = formData.tipos_selecionados.includes(tipo.value);
                      return (
                        <label
                          key={tipo.value}
                          className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-gray-50 ${
                            isSelected ? 'bg-green-50' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTipoToggle(tipo.value)}
                            disabled={viewMode || loading}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded flex-shrink-0"
                          />
                          <span className="text-sm text-gray-700">{tipo.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Modo edição: mostrar apenas o tipo atual (compatibilidade)
            <div className="border border-gray-300 rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-700">
                {tiposAtendimento.find(t => t.value === formData.tipos_selecionados[0])?.label || 'N/A'}
              </span>
            </div>
          )}
          {errors.tipos_selecionados && (
            <p className="mt-1 text-sm text-red-600">{errors.tipos_selecionados}</p>
          )}
        </div>

        {/* Status Ativo */}
        {editingItem && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.ativo ? 'ativo' : 'inativo'}
                onChange={(e) => handleInputChange('ativo', e.target.value === 'ativo')}
                disabled={loading || viewMode}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  loading || viewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
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

