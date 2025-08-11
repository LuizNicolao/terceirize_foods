import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarios } from './useUsuarios';

export const useUsuarioForm = (id) => {
  const navigate = useNavigate();
  const { selectedUsuario, loading, error, fetchUsuario, createUsuario, updateUsuario } = useUsuarios();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'comprador',
    status: 'ativo',
    password: '',
    confirmPassword: ''
  });
  
  const [permissions, setPermissions] = useState({
    usuarios: { can_view: false, can_create: false, can_edit: false, can_delete: false },
    cotacoes: { can_view: false, can_create: false, can_edit: false, can_delete: false },
    saving: { can_view: false, can_create: false, can_edit: false, can_delete: false },
    dashboard: { can_view: false }
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNewUser = id === 'new';

  useEffect(() => {
    if (!isNewUser && id) {
      fetchUsuario(id);
    }
  }, [id, isNewUser, fetchUsuario]);

  useEffect(() => {
    if (selectedUsuario && !isNewUser) {
      setFormData({
        name: selectedUsuario.name || '',
        email: selectedUsuario.email || '',
        role: selectedUsuario.role || 'comprador',
        status: selectedUsuario.status || 'ativo',
        password: '',
        confirmPassword: ''
      });
      
      if (selectedUsuario.permissions) {
        setPermissions(selectedUsuario.permissions);
      }
    }
  }, [selectedUsuario, isNewUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começa a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePermissionChange = (screen, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [screen]: {
        ...prev[screen],
        [permission]: value
      }
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (isNewUser && !formData.password) {
      errors.password = 'Senha é obrigatória para novos usuários';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        permissions
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      if (isNewUser) {
        await createUsuario(userData);
      } else {
        await updateUsuario(id, userData);
      }

      navigate('/usuarios');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/usuarios');
  };

  return {
    formData,
    permissions,
    formErrors,
    isSubmitting,
    loading,
    error,
    isNewUser,
    handleInputChange,
    handlePermissionChange,
    handleSubmit,
    handleCancel
  };
};
