import React from 'react';
import { FaPlus } from 'react-icons/fa';
import ActionButtons from '../ui/ActionButtons';
import { formatarDataParaExibicao } from '../../utils/recebimentosUtils';

const RegistrosDiariosTable = ({ 
  registros, 
  onEdit, 
  onDelete, 
  onView,
  onAdd,
  canEdit,
  canDelete,
  canView,
  canCreate,
  loading = false 
}) => {
  const tiposMedias = {
    'eja_parcial': 'EJA Parcial',
    'eja_almoco': 'EJA Almoço',
    'eja_lanche': 'EJA Lanche',
    'eja_eja': 'EJA EJA',
    'almoco_parcial': 'Almoço Parcial',
    'almoco_almoco': 'Almoço Almoço',
    'almoco_lanche': 'Almoço Lanche',
    'almoco_eja': 'Almoço EJA',
    'parcial_parcial': 'Parcial Parcial',
    'parcial_almoco': 'Parcial Almoço',
    'parcial_lanche': 'Parcial Lanche',
    'parcial_eja': 'Parcial EJA',
    'lanche_parcial': 'Lanche Parcial',
    'lanche_almoco': 'Lanche Almoço',
    'lanche_lanche': 'Lanche Lanche',
    'lanche_eja': 'Lanche EJA'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Carregando registros...</span>
      </div>
    );
  }

  // Agrupar registros por escola e data, mas mostrar apenas o mais recente por escola
  const registrosAgrupados = (registros || []).reduce((acc, registro) => {
    const key = `${registro.escola_id}-${registro.data}`;
    if (!acc[key]) {
      acc[key] = {
        escola_id: registro.escola_id,
        nome_escola: registro.nome_escola,
        rota: registro.rota,
        data: registro.data,
        nutricionista_nome: registro.nutricionista_nome,
        tipos_medias: []
      };
    }
    acc[key].tipos_medias.push({
      tipo: registro.tipo_media,
      valor: registro.valor,
      id: registro.id
    });
    return acc;
  }, {});

  // Filtrar para mostrar apenas o registro mais recente por escola
  const registrosPorEscola = {};
  Object.values(registrosAgrupados).forEach(registro => {
    const escolaId = registro.escola_id;
    if (!registrosPorEscola[escolaId] || new Date(registro.data) > new Date(registrosPorEscola[escolaId].data)) {
      registrosPorEscola[escolaId] = registro;
    }
  });

  const registrosUnicos = Object.values(registrosPorEscola);

  if (registrosUnicos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
        <p className="text-gray-600 mb-4">Comece adicionando registros diários</p>
        {canCreate && (
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FaPlus className="mr-2" />
            Adicionar Registro
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Último Lançamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nutricionista
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrosUnicos.map((registro, index) => (
                <tr key={`${registro.escola_id}-${registro.data}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registro.nome_escola}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registro.rota}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatarDataParaExibicao(registro.data)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {registro.nutricionista_nome || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={registro}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {registrosUnicos.map((registro) => (
          <div key={`${registro.escola_id}-${registro.data}`} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{registro.nome_escola}</h3>
                <p className="text-gray-600 text-xs">{registro.rota}</p>
                <p className="text-gray-500 text-xs">
                  Data Último Lançamento: {formatarDataParaExibicao(registro.data)}
                </p>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={registro}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-gray-500 text-xs">Nutricionista:</span>
                <p className="font-medium text-sm">{registro.nutricionista_nome || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RegistrosDiariosTable;
