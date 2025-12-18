/**
 * Aba de Correção de Necessidades
 * Permite visualizar e corrigir necessidades com informações erradas
 */

import React, { useState } from 'react';
import { Button, ConfirmModal } from '../ui';
import { StatusBadge } from './';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CorrecaoNecessidadesTab = ({
  necessidades = [],
  onCorrigir,
  onExcluir,
  loading = false
}) => {
  const [necessidadeIdParaExcluir, setNecessidadeIdParaExcluir] = useState(null);
  const [showConfirmExclusao, setShowConfirmExclusao] = useState(false);
  // Agrupar necessidades APENAS por necessidade_id (sem separar por grupo)
  const agrupadas = necessidades.reduce((acc, necessidade) => {
    // Usar apenas necessidade_id, sem incluir grupo na chave
    const chave = necessidade.necessidade_id || `${necessidade.escola}-${necessidade.semana_consumo}`;
    if (!acc[chave]) {
      acc[chave] = {
        necessidade_id: necessidade.necessidade_id,
        escola: necessidade.escola,
        rota: necessidade.escola_rota,
        data_consumo: necessidade.semana_consumo,
        data_abastecimento: necessidade.semana_abastecimento,
        status: necessidade.status,
        grupos: new Set(), // Usar Set para evitar duplicatas
        produtos: []
      };
    }
    // Adicionar grupo ao Set de grupos
    if (necessidade.grupo) {
      acc[chave].grupos.add(necessidade.grupo);
    }
    acc[chave].produtos.push(necessidade);
    return acc;
  }, {});

  // Converter grupos Set para Array para exibição
  const gruposArray = Object.values(agrupadas).map(item => ({
    ...item,
    grupos: Array.from(item.grupos)
  }));

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
        <span className="text-gray-600">Carregando necessidades...</span>
      </div>
    );
  }

  if (gruposArray.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Nenhuma necessidade encontrada para correção.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900">
          ⚠️ Correção de Necessidades
        </h3>
        <p className="text-sm text-yellow-800 mt-1">
          Use esta aba para corrigir necessidades com semanas de consumo ou outras informações incorretas.
          Apenas administradores podem acessar esta funcionalidade.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Escola
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grupo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produtos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semana Consumo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semana Abastecimento
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gruposArray.map((grupo, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {grupo.necessidade_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {grupo.escola || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {grupo.rota || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {grupo.grupos && grupo.grupos.length > 0 ? (
                      grupo.grupos.map((grupoNome, idx) => (
                        <span key={idx} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {grupoNome}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {grupo.produtos.length} produtos
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {grupo.data_consumo || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {grupo.data_abastecimento || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <StatusBadge status={grupo.status || grupo.produtos[0]?.status || 'NEC'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onCorrigir(grupo.necessidade_id)}
                      title="Corrigir necessidade"
                      className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                    >
                      <FaEdit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setNecessidadeIdParaExcluir(grupo.necessidade_id);
                        setShowConfirmExclusao(true);
                      }}
                      title="Excluir necessidade"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <FaTrash className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={showConfirmExclusao}
        onClose={() => {
          setShowConfirmExclusao(false);
          setNecessidadeIdParaExcluir(null);
        }}
        onConfirm={() => {
          if (necessidadeIdParaExcluir && onExcluir) {
            onExcluir(necessidadeIdParaExcluir);
          }
          setShowConfirmExclusao(false);
          setNecessidadeIdParaExcluir(null);
        }}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a necessidade ID ${necessidadeIdParaExcluir}? Esta ação excluirá todos os produtos desta necessidade e não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default CorrecaoNecessidadesTab;
