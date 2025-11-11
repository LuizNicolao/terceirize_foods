import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaToggleOn
} from 'react-icons/fa';
import { Button, Modal } from '../ui';

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

const createDefaultPermissions = () =>
  screens.map(screen => ({
    screen: screen.key,
    can_view: screen.key === 'dashboard' ? 1 : 0,
    can_create: 0,
    can_edit: 0,
    can_delete: 0
  }));

const normalizePermissions = (permissions = []) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return createDefaultPermissions();
  }

  const permissionsMap = permissions.reduce((acc, permission) => {
    acc[permission.screen] = {
      screen: permission.screen,
      can_view: permission.can_view ? 1 : 0,
      can_create: permission.can_create ? 1 : 0,
      can_edit: permission.can_edit ? 1 : 0,
      can_delete: permission.can_delete ? 1 : 0
    };
    return acc;
  }, {});

  return screens.map(screen => {
    if (permissionsMap[screen.key]) {
      return permissionsMap[screen.key];
    }

    return {
      screen: screen.key,
      can_view: 0,
      can_create: 0,
      can_edit: 0,
      can_delete: 0
    };
  });
};

const UsuarioModal = ({
  isOpen,
  onClose,
  onSubmit,
  usuario,
  isViewMode = false,
  isSaving = false
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue
  } = useForm();

  const [permissions, setPermissions] = useState(createDefaultPermissions());

  const modalTitle = useMemo(() => {
    if (isViewMode) return 'Visualizar Usuário';
    if (usuario && usuario.id) return `Editar Usuário #${usuario.id}`;
    return 'Adicionar Usuário';
  }, [isViewMode, usuario]);

  useEffect(() => {
    if (!isOpen) return;

    if (usuario && usuario.id) {
      reset({
        name: usuario.name || '',
        email: usuario.email || '',
        password: '',
        role: usuario.role || 'comprador',
        status: usuario.status || 'ativo'
      });
      setPermissions(normalizePermissions(usuario.permissions));
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        role: 'comprador',
        status: 'ativo'
      });
      setPermissions(createDefaultPermissions());
    }
  }, [isOpen, usuario, reset]);

  const handlePermissionChange = (screenKey, permissionKey, checked) => {
    setPermissions(prev =>
      prev.map(permission =>
        permission.screen === screenKey
          ? { ...permission, [permissionKey]: checked ? 1 : 0 }
          : permission
      )
    );
  };

  const handleFormSubmit = (data) => {
    const payload = {
      name: data.name?.trim() || '',
      email: data.email?.trim() || '',
      role: data.role,
      status: data.status,
      permissions
    };

    if (data.password && data.password.trim().length > 0) {
      payload.password = data.password.trim();
    }

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
        {/* Informações Básicas */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaUser className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Informações Básicas</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                {...register('name')}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  disabled={isViewMode}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaShieldAlt className="text-gray-400" />
                Tipo de Usuário *
              </label>
              <select
                {...register('role')}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaToggleOn className="text-gray-400" />
                Status *
              </label>
              <select
                {...register('status')}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaLock className="text-gray-400" />
                {usuario && usuario.id
                  ? 'Nova Senha (opcional)'
                  : 'Senha *'}
              </label>
              <input
                type="password"
                {...register('password')}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                placeholder={usuario && usuario.id ? 'Deixe em branco para manter' : 'Informe a senha'}
              />
            </div>
          </div>
        </div>

        {/* Permissões */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaShieldAlt className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Permissões por Tela</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Defina os acessos permitidos para este usuário em cada área do sistema.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tela
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Visualizar
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Criar
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Editar
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Excluir
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission, index) => {
                  const screen = screens.find(screenItem => screenItem.key === permission.screen);
                  return (
                    <tr
                      key={permission.screen}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {screen?.label || permission.screen}
                      </td>
                      {['can_view', 'can_create', 'can_edit', 'can_delete'].map(key => (
                        <td key={key} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permission[key] === 1}
                            onChange={e => handlePermissionChange(permission.screen, key, e.target.checked)}
                            disabled={isViewMode}
                            className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewMode && (
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : usuario && usuario.id ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default UsuarioModal;
