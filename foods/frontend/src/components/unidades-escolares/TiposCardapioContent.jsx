import React, { useState } from 'react';
import { FaPlus, FaTrash, FaClipboardList } from 'react-icons/fa';
import { Button, Table, ConfirmModal } from '../ui';
import SearchableSelect from '../ui/SearchableSelect';
import { useTiposCardapioUnidade } from '../../hooks/useTiposCardapioUnidade';

const TiposCardapioContent = ({ unidade, canEdit, canDelete }) => {
  const {
    tiposVinculados,
    tiposDisponiveis,
    loading,
    showDeleteModal,
    tipoToDelete,
    handleAddTipo,
    handleDeleteTipo,
    confirmDeleteTipo,
    closeDeleteModal
  } = useTiposCardapioUnidade(unidade?.id);

  const [selectedTipoId, setSelectedTipoId] = useState('');

  // Preparar opções para o SearchableSelect
  const tipoOptions = tiposDisponiveis.map(tipo => ({
    value: tipo.id,
    label: tipo.nome,
    description: tipo.codigo ? `Código: ${tipo.codigo}` : undefined
  }));

  // Função para adicionar tipo selecionado
  const handleAddSelectedTipo = async () => {
    if (!selectedTipoId) return;
    
    const tipo = tiposDisponiveis.find(t => t.id === selectedTipoId);
    if (tipo) {
      await handleAddTipo(tipo);
      setSelectedTipoId(''); // Limpar seleção
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com dropdown de seleção */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaClipboardList className="text-green-600" />
          Tipos de Cardápio
        </h3>
        
        {canEdit('unidades_escolares') && tiposDisponiveis.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <SearchableSelect
                  label="Adicionar Tipo de Cardápio"
                  value={selectedTipoId}
                  onChange={setSelectedTipoId}
                  options={tipoOptions}
                  placeholder="Selecione um tipo de cardápio..."
                  loading={loading}
                  disabled={loading}
                  size="md"
                  renderOption={(option) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{option.label}</span>
                        {option.description && (
                          <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>
              <Button
                onClick={handleAddSelectedTipo}
                disabled={!selectedTipoId || loading}
                size="sm"
                className="flex items-center gap-2"
              >
                <FaPlus className="text-sm" />
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de tipos vinculados */}
      {tiposVinculados.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaClipboardList className="mx-auto text-4xl text-gray-300 mb-2" />
          <p>Nenhum tipo de cardápio vinculado</p>
          {tiposDisponiveis.length > 0 && (
            <p className="text-sm mt-1">Use o dropdown acima para adicionar tipos disponíveis</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {canDelete('unidades_escolares') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tiposVinculados.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {tipo.codigo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tipo.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tipo.descricao || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tipo.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tipo.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {canDelete('unidades_escolares') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => handleDeleteTipo(tipo)}
                        variant="ghost"
                        size="xs"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <FaTrash className="text-sm" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}


      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTipo}
        title="Desvincular Tipo de Cardápio"
        message={`Tem certeza que deseja desvincular o tipo de cardápio "${tipoToDelete?.nome}" desta unidade escolar?`}
        confirmText="Desvincular"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default TiposCardapioContent;
