import React, { useState, useEffect } from 'react';
import { FaUndo } from 'react-icons/fa';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { usePermissoes } from '../../hooks/usePermissoes';

const PermissoesModal = ({ 
  isOpen, 
  onClose, 
  usuario,
  onSave 
}) => {
  const { permissoes, loading, error, atualizarPermissoes, resetarPermissoes } = usePermissoes(usuario?.id);
  const [permissoesEditadas, setPermissoesEditadas] = useState({});
  const [saving, setSaving] = useState(false);

  const telas = [
    { key: 'usuarios', label: 'Usuários' },
    { key: 'necessidades', label: 'Necessidades' },
    { key: 'produtos', label: 'Produtos' },
    { key: 'escolas', label: 'Escolas' },
    { key: 'tipos-entrega', label: 'Tipos de Entrega' },
    { key: 'medias-escolas', label: 'Quantidade Servida' },
    { key: 'registros-diarios', label: 'Registros Diários' },
    { key: 'produtos-per-capita', label: 'Produtos Per Capita' },
    { key: 'recebimentos-escolas', label: 'Recebimentos Escolas' },
    { key: 'solicitacoes-manutencao', label: 'Solicitações de Manutenção' }
  ];

  const acoes = [
    { key: 'visualizar', label: 'Visualizar' },
    { key: 'criar', label: 'Criar' },
    { key: 'editar', label: 'Editar' },
    { key: 'excluir', label: 'Excluir' }
  ];

  useEffect(() => {
    if (permissoes && Object.keys(permissoes).length > 0) {
      setPermissoesEditadas(permissoes);
    }
  }, [permissoes]);

  const handlePermissaoChange = (tela, acao, value) => {
    setPermissoesEditadas(prev => ({
      ...prev,
      [tela]: {
        ...prev[tela],
        [acao]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Converter para formato esperado pela API
      const permissoesParaSalvar = Object.entries(permissoesEditadas).map(([tela, perms]) => ({
        tela,
        pode_visualizar: perms.visualizar || false,
        pode_criar: perms.criar || false,
        pode_editar: perms.editar || false,
        pode_excluir: perms.excluir || false
      }));

      const result = await atualizarPermissoes(usuario.id, permissoesParaSalvar);
      
      if (result.success) {
        onSave && onSave();
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja resetar as permissões para o padrão do tipo de usuário?')) {
      const result = await resetarPermissoes(usuario.id);
      
      if (result.success) {
        // Recarregar permissões após reset
        window.location.reload();
      }
    }
  };

  if (!usuario) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gerenciar Permissões
          </h3>
          <p className="text-sm text-gray-600">
            {usuario.nome} ({usuario.tipo_usuario})
          </p>
        </div>
      }
      size="xl"
    >
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleReset}
          variant="warning"
          size="sm"
          title="Resetar para padrão"
        >
          <FaUndo className="mr-1" />
          Resetar
        </Button>
      </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tela
                    </th>
                    {acoes.map(acao => (
                      <th key={acao.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {acao.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {telas.map(tela => (
                    <tr key={tela.key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tela.label}
                      </td>
                      {acoes.map(acao => (
                        <td key={acao.key} className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={permissoesEditadas[tela.key]?.[acao.key] || false}
                            onChange={(e) => handlePermissaoChange(tela.key, acao.key, e.target.checked)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            loading={saving}
            disabled={saving || loading}
          >
            {saving ? 'Salvando...' : 'Salvar Permissões'}
          </Button>
        </div>
    </Modal>
  );
};

export default PermissoesModal;
