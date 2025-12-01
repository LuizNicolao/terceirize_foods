import React from 'react';
import { SearchableSelect } from '../ui';

const ChecklistTable = ({ checklist, grupos, onChange, viewMode = false }) => {
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
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Check List de Avaliação Higiênico-Sanitária</h3>
      </div>

      {!checklist || checklist.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Nenhum item no checklist.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Transporte <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Isento de Material Estranho <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condições do Caminhão <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acondicionamento <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condições da Embalagem <span className="text-red-500">*</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {checklist.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {viewMode ? (
                      <span className="text-sm text-gray-900">
                        {item.tipo_transporte || '-'}
                      </span>
                    ) : (
                    <SearchableSelect
                      value={item.tipo_transporte || ''}
                      onChange={(value) => handleFieldChange(index, 'tipo_transporte', value)}
                      options={tiposTransporte}
                      placeholder="Selecione..."
                      className="w-full"
                      required
                    />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {viewMode ? (
                      <span className={`text-sm px-2 py-1 rounded ${getStatusColor(item.isento_material)}`}>
                        {item.isento_material || '-'}
                      </span>
                    ) : (
                    <SearchableSelect
                      value={item.isento_material || ''}
                      onChange={(value) => handleFieldChange(index, 'isento_material', value)}
                      options={opcoesConformidade}
                      placeholder="Selecione..."
                      className="w-full"
                      required
                    />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {viewMode ? (
                      <span className={`text-sm px-2 py-1 rounded ${getStatusColor(item.condicoes_caminhao)}`}>
                        {item.condicoes_caminhao || '-'}
                      </span>
                    ) : (
                    <SearchableSelect
                      value={item.condicoes_caminhao || ''}
                      onChange={(value) => handleFieldChange(index, 'condicoes_caminhao', value)}
                      options={opcoesConformidade}
                      placeholder="Selecione..."
                      className="w-full"
                      required
                    />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {viewMode ? (
                      <span className={`text-sm px-2 py-1 rounded ${getStatusColor(item.acondicionamento)}`}>
                        {item.acondicionamento || '-'}
                      </span>
                    ) : (
                    <SearchableSelect
                      value={item.acondicionamento || ''}
                      onChange={(value) => handleFieldChange(index, 'acondicionamento', value)}
                      options={opcoesConformidade}
                      placeholder="Selecione..."
                      className="w-full"
                      required
                    />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {viewMode ? (
                      <span className={`text-sm px-2 py-1 rounded ${getStatusColor(item.condicoes_embalagem)}`}>
                        {item.condicoes_embalagem || '-'}
                      </span>
                    ) : (
                    <SearchableSelect
                      value={item.condicoes_embalagem || ''}
                      onChange={(value) => handleFieldChange(index, 'condicoes_embalagem', value)}
                      options={opcoesConformidade}
                      placeholder="Selecione..."
                      className="w-full"
                      required
                    />
                    )}
                  </td>
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

