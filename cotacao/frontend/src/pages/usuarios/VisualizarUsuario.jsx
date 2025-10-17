import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaUser, 
  FaEnvelope, 
  FaShieldAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Button, LoadingSpinner } from '../../components/ui';
import { usuariosService } from '../../services/usuarios';

const VisualizarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    try {
      setLoading(true);
      setError(null);
      
      const data = await usuariosService.getUsuario(id);
      setUsuario(data);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setError(error.message || 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/usuarios');
  };

  const handleEdit = () => {
    navigate(`/editar-usuario/${id}`);
  };

  const getRoleLabel = (role) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getStatusLabel = (status) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  const getPermissionValue = (screen, permission) => {
    if (!usuario?.permissions) return false;
    const perm = usuario.permissions.find(p => p.screen === screen);
    return perm ? perm[permission] === 1 : false;
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

  if (!usuario) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Usuário não encontrado</h3>
          <p className="text-gray-600 mb-4">O usuário solicitado não foi encontrado.</p>
          <Button onClick={handleBack} variant="primary">
            Voltar
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
          Visualizar Usuário #{id}
        </h1>
        <p className="text-gray-600">
          Visualize os dados do usuário
        </p>
      </div>

      <div className="space-y-6">
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
                  Nome
                </div>
              </label>
              <input
                type="text"
                value={usuario.name}
                disabled
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" />
                  Email
                </div>
              </label>
              <input
                type="email"
                value={usuario.email}
                disabled
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Tipo de Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-gray-400" />
                  Tipo de Usuário
                </div>
              </label>
              <select
                value={usuario.role}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={usuario.status}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
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
            Visualize as permissões que este usuário tem em cada tela do sistema
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
                        disabled
                        readOnly
                        className="w-4 h-4 text-green-600 rounded cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 text-center border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={getPermissionValue(screen.key, 'can_create')}
                        disabled
                        readOnly
                        className="w-4 h-4 text-green-600 rounded cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 text-center border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={getPermissionValue(screen.key, 'can_edit')}
                        disabled
                        readOnly
                        className="w-4 h-4 text-green-600 rounded cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 text-center border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={getPermissionValue(screen.key, 'can_delete')}
                        disabled
                        readOnly
                        className="w-4 h-4 text-green-600 rounded cursor-not-allowed"
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
            onClick={handleBack}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Voltar
          </Button>
          <Button
            onClick={handleEdit}
            className="flex items-center justify-center gap-2"
          >
            <FaEdit />
            Editar Usuário
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VisualizarUsuario;

