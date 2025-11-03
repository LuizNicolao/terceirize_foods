import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Button, Input, SearchableSelect } from '../ui';

const ChecklistTable = ({ checklist, grupos, onChange, onAdd, onRemove, viewMode = false }) => {
  const tiposTransporte = [
    { value: 'Baú', label: 'Baú' },
    { value: 'Baú Isotérmico', label: 'Baú Isotérmico' },
    { value: 'Baú Refrigerado', label: 'Baú Refrigerado' },
    { value: 'Sider', label: 'Sider' },
    { value: 'Grade Baixa', label: 'Grade Baixa' },
    { value: 'Graneleiro', label: 'Graneleiro' }
  ];

  const opcoesConformidade = [
    { value: 'Conforme', label: 'Conforme' },
    { value: 'Não Conforme', label: 'Não Conforme' },
    { value: 'N/A', label: 'N/A' }
  ];

  const handleFieldChange = (index, field, value) => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const getGrupoOptions = () => {
    return grupos.map(grupo => ({
      value: grupo.nome, // Salvar o nome do grupo, não o ID
      label: `${grupo.codigo} - ${grupo.nome}`
    }));
  };

  const getStatusColor = (status) => {
    if (status === 'Conforme') return 'bg-green-50 text-green-700';
    if (status === 'Não Conforme') return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Check List de Avaliação Higiênico-Sanitária</h3>
        {!viewMode && (
          <Button onClick={onAdd} size="sm" variant="ghost">
            <FaPlus className="mr-1" />
            Adicionar Item
          </Button>
        )}
      </div>

      {checklist.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Nenhum item no checklist. Clique em "Adicionar Item" para começar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Transporte
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Produto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Isento de Material Estranho
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condições do Caminhão
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acondicionamento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condições da Embalagem
                </th>
                {!viewMode && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {checklist.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SearchableSelect
                      value={item.tipo_transporte || ''}
                      onChange={(value) => handleFieldChange(index, 'tipo_transporte', value)}
                      options={tiposTransporte}
                      placeholder="Selecione..."
                      className="w-full"
                      disabled={viewMode}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SearchableSelect
                      value={item.tipo_produto || ''}
                      onChange={(value) => handleFieldChange(index, 'tipo_produto', value)}
                      options={getGrupoOptions()}
                      placeholder="Selecione o grupo..."
                      className="w-full"
                      disabled={viewMode}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SearchableSelect
                      value={item.isento_material || ''}
                      onChange={(value) => handleFieldChange(index, 'isento_material', value)}
                      options={opcoesConformidade}
                      placeholder="Selecione..."
                      className="w-full"
                      disabled={viewMode}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SearchableSelect
                      value={item.condicoes_caminhao || ''}
                      onChange={(value) => handleFieldChange(index, 'condicoes_caminhao', value)}
                      options={opcoesConformidade}
                      placeholder="Selecione..."
                      className="w-full"
                      disabled={viewMode}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SearchableSelect
                      value={item.acondicionamento || ''}
                      onChange={(value) => handleFieldChange(index, 'acondicionamento', value)}
                      options={opcoesConformidade}
                      placeholder="Selecione..."
                      className="w-full"
                      disabled={viewMode}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SearchableSelect
                      value={item.condicoes_embalagem || ''}
                      onChange={(value) => handleFieldChange(index, 'condicoes_embalagem', value)}
                      options={opcoesConformidade}
                      placeholder="Selecione..."
                      className="w-full"
                      disabled={viewMode}
                    />
                  </td>
                  {!viewMode && (
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => onRemove(index)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Remover item"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                  {viewMode && (
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {/* Coluna vazia em modo visualização */}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChecklistTable;

