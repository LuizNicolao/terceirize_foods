import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { Button } from '../../../components/ui';

const PermissoesHeader = ({
  canView,
  onShowHelp,
  loading
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            🔐 Permissões
            <button
              onClick={onShowHelp}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Ajuda"
            >
              <FaQuestionCircle size={16} />
            </button>
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie permissões de acesso dos usuários do sistema
          </p>
        </div>

        <div className="flex space-x-3">
          {canView && (
            <Button
              onClick={onShowHelp}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <FaQuestionCircle className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Auditoria</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissoesHeader;
