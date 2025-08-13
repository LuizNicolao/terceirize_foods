import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { Button } from '../../components/ui';

const NomeGenericoModal = ({
  isOpen,
  onClose,
  onSubmit,
  nomeGenerico,
  isViewMode = false
}) => {
  const [formData, setFormData] = React.useState({
    nome: '',
    descricao: '',
    status: 'ativo'
  });

  const [errors, setErrors] = React.useState({});

  // Atualizar formData quando nomeGenerico mudar
  React.useEffect(() => {
    if (nomeGenerico) {
      setFormData({
        nome: nomeGenerico.nome || '',
        descricao: nomeGenerico.descricao || '',
        status: nomeGenerico.status || 'ativo'
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        status: 'ativo'
      });
    }
    setErrors({});
  }, [nomeGenerico]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome || formData.nome.trim() === '') {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.descricao || formData.descricao.trim() === '') {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isViewMode ? 'Visualizar' : nomeGenerico ? 'Editar' : 'Adicionar'} Nome Genérico
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Genérico *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              disabled={isViewMode}
              placeholder="Digite o nome genérico"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.nome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              disabled={isViewMode}
              placeholder="Digite a descrição"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.descricao ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          {/* Footer */}
          {!isViewMode && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
              >
                {nomeGenerico ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          )}

          {isViewMode && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={onClose}
                size="sm"
              >
                Fechar
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default NomeGenericoModal;
