import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input } from '../ui';

const UsuarioModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  usuario = null, 
  loading = false,
  viewMode = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo_usuario: 'Nutricionista',
    rota: '',
    setor: 'FOODS',
    ativo: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        tipo_usuario: usuario.tipo_usuario || 'Nutricionista',
        rota: usuario.rota || '',
        setor: usuario.setor || 'FOODS',
        ativo: usuario.ativo !== undefined ? usuario.ativo : true
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        senha: '',
        tipo_usuario: 'Nutricionista',
        rota: '',
        setor: 'FOODS',
        ativo: true
      });
    }
    setErrors({});
  }, [usuario, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!usuario && !formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.tipo_usuario) {
      newErrors.tipo_usuario = 'Tipo de usuário é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSave = { ...formData };
      
      // Se não é um novo usuário e a senha está vazia, remover do objeto
      if (usuario && !dataToSave.senha) {
        delete dataToSave.senha;
      }
      
      onSave(dataToSave);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        viewMode 
          ? 'Visualizar Usuário' 
          : usuario 
            ? 'Editar Usuário' 
            : 'Novo Usuário'
      }
      size="md"
    >

      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              disabled={viewMode}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.nome ? 'border-red-500' : 'border-gray-300'
              } ${viewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Digite o nome completo"
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={viewMode}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } ${viewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Digite o email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {!usuario && '*'}
            </label>
            <input
              type="password"
              name="senha"
              value={viewMode ? "••••••••" : formData.senha}
              onChange={handleChange}
              disabled={viewMode}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.senha ? 'border-red-500' : 'border-gray-300'
              } ${viewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder={viewMode ? "Senha oculta" : usuario ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
            />
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
            )}
          </div>

          <Input
            label="Tipo de Usuário"
            type="select"
            name="tipo_usuario"
            value={formData.tipo_usuario}
            onChange={handleChange}
            disabled={viewMode}
            error={errors.tipo_usuario}
            required
          >
            <option value="Nutricionista">Nutricionista</option>
            <option value="Supervisao">Supervisão</option>
            <option value="Coordenacao">Coordenação</option>
          </Input>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rota
            </label>
            <input
              type="text"
              name="rota"
              value={formData.rota}
              onChange={handleChange}
              disabled={viewMode}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${viewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Digite a rota"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setor
            </label>
            <input
              type="text"
              name="setor"
              value={formData.setor}
              onChange={handleChange}
              disabled={viewMode}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${viewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Digite o setor"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              disabled={viewMode}
              className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${viewMode ? 'cursor-not-allowed' : ''}`}
            />
            <label className="ml-2 block text-sm text-gray-700">
              Usuário ativo
            </label>
          </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            {viewMode ? 'Fechar' : 'Cancelar'}
          </Button>
          {!viewMode && (
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default UsuarioModal;
