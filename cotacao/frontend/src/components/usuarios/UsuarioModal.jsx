import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal } from '../ui';

const ROLE_OPTIONS = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'comprador', label: 'Comprador' }
];

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' }
];

const SCREENS = [
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

const DEFAULT_PERMISSIONS = SCREENS.reduce((acc, screen) => {
  acc[screen.key] = {
    can_view: screen.key === 'dashboard',
    can_create: false,
    can_edit: false,
    can_delete: false
  };
  return acc;
}, {});

const UsuarioModal = ({ isOpen, onClose, onSubmit, usuario, isViewMode = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'comprador',
    status: 'ativo'
  });
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  const isEditing = Boolean(usuario);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (usuario) {
      setFormData({
        name: usuario.name || usuario.nome || '',
        email: usuario.email || '',
        password: '',
        role: usuario.role || usuario.tipo_de_acesso || 'comprador',
        status: usuario.status || 'ativo'
      });

      if (Array.isArray(usuario.permissions) && usuario.permissions.length > 0) {
        const normalized = { ...DEFAULT_PERMISSIONS };
        usuario.permissions.forEach((permission) => {
          normalized[permission.screen] = {
            can_view: permission.can_view === 1 || permission.can_view === true,
            can_create: permission.can_create === 1 || permission.can_create === true,
            can_edit: permission.can_edit === 1 || permission.can_edit === true,
            can_delete: permission.can_delete === 1 || permission.can_delete === true
          };
        });
        setPermissions(normalized);
      } else {
        setPermissions(DEFAULT_PERMISSIONS);
      }
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'comprador',
        status: 'ativo'
      });
      setPermissions(DEFAULT_PERMISSIONS);
    }
  }, [usuario, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (screen, permissionKey, value) => {
    setPermissions((prev) => ({
      ...prev,
      [screen]: {
        ...prev[screen],
        [permissionKey]: value
      }
    }));
  };

  const permissionsArray = useMemo(() => (
    Object.entries(permissions)
      .map(([screen, perms]) => ({
        screen,
        can_view: perms.can_view,
        can_create: perms.can_create,
        can_edit: perms.can_edit,
        can_delete: perms.can_delete
      }))
      .filter((perms) => perms.can_view || perms.can_create || perms.can_edit || perms.can_delete)
  ), [permissions]);

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      status: formData.status,
      password: formData.password?.trim() || undefined,
      permissions: permissionsArray
    };

    if (!payload.password) {
      delete payload.password;
    }

    onSubmit(payload);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Usuário' : isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}
      size="full"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Pessoais
            </h3>
            <div className="space-y-3">
              <Input
                label="Nome Completo *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isViewMode}
              />
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações de Acesso
            </h3>
            <div className="space-y-3">
              <Input
                label="Tipo de Acesso *"
                type="select"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={isViewMode}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
              <Input
                label="Status *"
                type="select"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={isViewMode}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Permissões por Tela
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-xs text-gray-600 uppercase">
                  <th className="px-4 py-3 text-left">Tela</th>
                  <th className="px-4 py-3 text-center">Visualizar</th>
                  <th className="px-4 py-3 text-center">Criar</th>
                  <th className="px-4 py-3 text-center">Editar</th>
                  <th className="px-4 py-3 text-center">Excluir</th>
                </tr>
              </thead>
              <tbody>
                {SCREENS.map((screen, index) => {
                  const perms = permissions[screen.key] || DEFAULT_PERMISSIONS[screen.key];
                  return (
                    <tr key={screen.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">
                        {screen.label}
                      </td>
                      {['can_view', 'can_create', 'can_edit', 'can_delete'].map((permissionKey) => (
                        <td key={permissionKey} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={perms[permissionKey]}
                            disabled={isViewMode}
                            onChange={(event) =>
                              handlePermissionChange(screen.key, permissionKey, event.target.checked)
                            }
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
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

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Senha
          </h3>
          <Input
            label={isEditing ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={isViewMode}
          />
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-200">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UsuarioModal;
