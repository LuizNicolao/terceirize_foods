import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FaSave, 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Button, LoadingSpinner } from '../../components/ui';
import { usuariosService } from '../../services/usuarios';

const EditarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'comprador',
    status: 'ativo'
  });

  const [permissions, setPermissions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const roles = [
    { value: 'administrador', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'comprador', label: 'Comprador' }
  ];

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' }
  ];

  const screens = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'usuarios', label: 'Usuários' },
    { key: 'cotacoes', label: 'Cotações' },
    { key: 'supervisor', label: 'Supervisor' },
    { key: 'aprovacoes', label: 'Aprovações' },
    { key: 'aprovacoes_supervisor', label: 'Aprovações Supervisor' },
    { key: 'saving', label: 'Saving' },
    { key: 'nova-cotacao', label: 'Nova Cotação' },
    { key: 'visualizar-cotacao', label: 'Visualizar Cotação' },
    { key: 'editar-cotacao', label: 'Editar Cotação' }
  ];

  useEffect(() => {
    fetchUsuario();
  }, [id]);

  const fetchUsuario = async () => {
    // Se for um novo usuário, não precisa buscar dados
    if (id === 'new') {
      // Inicializar permissões padrão
      const defaultPermissions = screens.map(screen => ({
        screen: screen.key,
        can_view: screen.key === 'dashboard' ? 1 : 0,
        can_create: 0,
        can_edit: 0,
        can_delete: 0
      }));
      setPermissions(defaultPermissions);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await usuariosService.getUsuario(id);
      
      setFormData({
        name: data.name || '',
        email: data.email || '',
        password: '',
        role: data.role || 'comprador',
        status: data.status || 'ativo'
      });
      
      setPermissions(data.permissions || []);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setError(error.message || 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePermissionChange = (screen, permission, value) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.screen === screen);
      
      if (existing) {
        return prev.map(p => 
          p.screen === screen ? { ...p, [permission]: value ? 1 : 0 } : p
        );
      } else {
        return [...prev, { 
          screen, 
          [permission]: value ? 1 : 0,
          can_view: permission === 'can_view' ? (value ? 1 : 0) : 0,
          can_create: permission === 'can_create' ? (value ? 1 : 0) : 0,
          can_edit: permission === 'can_edit' ? (value ? 1 : 0) : 0,
          can_delete: permission === 'can_delete' ? (value ? 1 : 0) : 0
        }];
      }
    });
  };

  const getPermissionValue = (screen, permission) => {
    const perm = permissions.find(p => p.screen === screen);
    return perm ? perm[permission] === 1 : false;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (id === 'new' && !formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória para novos usuários';
    } else if (formData.password.trim() && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      const userData = {
        ...formData,
        permissions: permissions
      };

      // Remover senha vazia se não foi alterada
      if (!userData.password.trim()) {
        delete userData.password;
      }

      if (id === 'new') {
        await usuariosService.createUsuario(userData);
        toast.success('Usuário criado com sucesso!');
      } else {
        await usuariosService.updateUsuario(id, userData);
        toast.success('Usuário atualizado com sucesso!');
      }

      navigate('/usuarios');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      
      let errorMessage = error.message || 'Erro ao salvar usuário';
      if (errorMessage.includes('Email já cadastrado') || errorMessage.includes('já existe')) {
        errorMessage = 'Este e-mail já está sendo usado por outro usuário.';
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/usuarios');
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Carregando usuário..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaExclamationTriangle className="mx-auto text-red-600 text-6xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar usuário</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchUsuario} variant="primary">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {id === 'new' ? 'Novo Usuário' : `Editar Usuário #${id}`}
        </h1>
        <p className="text-gray-600">
          {id === 'new' ? 'Crie um novo usuário' : 'Modifique os dados do usuário'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Informações Básicas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaUser className="text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Informações Básicas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  Nome *
                </div>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome completo"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" />
                  Email *
                </div>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaLock className="text-gray-400" />
                  Senha {id === 'new' ? '*' : '(deixe em branco para não alterar)'}
                </div>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={id === 'new' ? 'Senha' : 'Nova senha (opcional)'}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            
            {/* Tipo de Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-gray-400" />
                  Tipo de Usuário *
                </div>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Seção 2: Permissões */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <FaShieldAlt className="text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Permissões por Tela</h2>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Configure as permissões que este usuário terá em cada tela do sistema
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                    Tela
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                    Visualizar
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                    Criar
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                    Editar
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                    Excluir
                  </th>
                </tr>
              </thead>
              <tbody>
                {screens.map((screen, index) => (
                  <tr key={screen.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                      {screen.label}
                    </td>
                    <td className="px-4 py-3 text-center border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={getPermissionValue(screen.key, 'can_view')}
                        onChange={(e) => handlePermissionChange(screen.key, 'can_view', e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={getPermissionValue(screen.key, 'can_create')}
                        onChange={(e) => handlePermissionChange(screen.key, 'can_create', e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={getPermissionValue(screen.key, 'can_edit')}
                        onChange={(e) => handlePermissionChange(screen.key, 'can_edit', e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={getPermissionValue(screen.key, 'can_delete')}
                        onChange={(e) => handlePermissionChange(screen.key, 'can_delete', e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <FaTimes />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2"
          >
            <FaSave />
            {saving ? 'Salvando...' : (id === 'new' ? 'Criar Usuário' : 'Salvar Alterações')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditarUsuario;

