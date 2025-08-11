import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const UsuarioPermissions = ({ permissions, handlePermissionChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FaShieldAlt />
        Permissões
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(permissions).map(([screen, screenPermissions]) => (
          <div key={screen} className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
              {screen}
            </h3>
            <div className="space-y-2">
              {Object.entries(screenPermissions).map(([permission, value]) => (
                <div key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${screen}-${permission}`}
                    checked={value}
                    onChange={(e) => handlePermissionChange(screen, permission, e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`${screen}-${permission}`}
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {permission.replace('can_', '').replace(/_/g, ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsuarioPermissions;
