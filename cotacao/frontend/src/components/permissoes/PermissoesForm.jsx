import React from 'react';
import { Button, Modal } from '../ui';

const gruposTelas = {
  'Visão Geral': [
    { key: 'dashboard', label: 'Dashboard' }
  ],
  'Usuários': [
    { key: 'usuarios', label: 'Usuários' },
    { key: 'permissoes', label: 'Permissões' }
  ],
  'Cotações': [
    { key: 'cotacoes', label: 'Cotações' },
    { key: 'nova-cotacao', label: 'Nova Cotação' },
    { key: 'visualizar-cotacao', label: 'Visualizar Cotação' },
    { key: 'editar-cotacao', label: 'Editar Cotação' },
    { key: 'saving', label: 'Saving' }
  ],
  'Aprovações': [
    { key: 'aprovacoes', label: 'Aprovações' },
    { key: 'aprovacoes_supervisor', label: 'Aprovações Supervisor' },
    { key: 'supervisor', label: 'Supervisor' }
  ]
};

const colunas = [
  { key: 'pode_visualizar', label: 'Visualizar' },
  { key: 'pode_criar', label: 'Criar' },
  { key: 'pode_editar', label: 'Editar' },
  { key: 'pode_excluir', label: 'Excluir' }
];

const PermissoesForm = ({ isOpen, onClose, editingPermissions, saving, onPermissionChange, onSavePermissions }) => {
  if (!isOpen) return null;

  const renderLinha = ({ key, label }) => {
    const permissoes = editingPermissions[key] || {
      pode_visualizar: false,
      pode_criar: false,
      pode_editar: false,
      pode_excluir: false
    };

    return (
      <tr key={key} className="hover:bg-gray-50">
        <td className="px-4 py-2 text-sm text-gray-700 font-medium">{label}</td>
        {colunas.map((coluna) => (
          <td key={coluna.key} className="px-4 py-2 text-center">
            <input
              type="checkbox"
              checked={permissoes[coluna.key]}
              onChange={(event) => onPermissionChange(key, coluna.key, event.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
          </td>
        ))}
      </tr>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Permissões do Usuário" size="xl">
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {Object.entries(gruposTelas).map(([grupo, telas]) => (
          <div key={grupo} className="border border-gray-200 rounded-lg">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{grupo}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tela
                    </th>
                    {colunas.map((coluna) => (
                      <th
                        key={coluna.key}
                        className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {coluna.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {telas.map(renderLinha)}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button type="button" onClick={onSavePermissions} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Permissões'}
        </Button>
      </div>
    </Modal>
  );
};

export default PermissoesForm;

