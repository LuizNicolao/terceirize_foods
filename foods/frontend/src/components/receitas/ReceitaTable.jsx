import React from 'react';
import { FaEye, FaEdit, FaTrash, FaFileAlt, FaCopy, FaPause, FaCheck, FaTimes, FaPlay } from 'react-icons/fa';
import { ActionButtons, EmptyState } from '../ui';

const ReceitaTable = ({
  receitas,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate
}) => {
  // Função para extrair o nome principal da receita
  const getNomePrincipal = (nomeCompleto) => {
    if (!nomeCompleto) return 'N/A';
    
    // Remove parênteses e tudo dentro deles
    let nome = nomeCompleto.split('(')[0];
    
    // Remove vírgulas e tudo depois da primeira vírgula
    nome = nome.split(',')[0];
    
    // Remove palavras comuns que indicam ingredientes/preparo
    const palavrasRemover = [
      'com', 'e', 'de', 'da', 'do', 'em', 'para', 'com', 'temperado', 'temperada',
      'refogado', 'refogada', 'assado', 'assada', 'cozido', 'cozida', 'frito', 'frita',
      'grelhado', 'grelhada', 'salteado', 'salteada', 'preparado', 'preparada'
    ];
    
    // Divide em palavras e remove as palavras comuns
    let palavras = nome.trim().split(' ').filter(palavra => 
      palavra.length > 2 && !palavrasRemover.includes(palavra.toLowerCase())
    );
    
    // Retorna as primeiras 3-4 palavras mais relevantes
    return palavras.slice(0, 4).join(' ').trim() || nome.trim();
  };
  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: {
        label: 'Ativo',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      inativo: {
        label: 'Inativo',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      },
      pendente: {
        label: 'Pendente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
    };

    const config = statusConfig[status] || statusConfig.inativo;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    const iconConfig = {
      ativo: FaCheck,
      inativo: FaTimes,
      pendente: FaPause
    };

    const IconComponent = iconConfig[status] || FaTimes;
    return <IconComponent className="h-3 w-3 mr-1" />;
  };

  if (!receitas || receitas.length === 0) {
    return <EmptyState message="Nenhuma receita encontrada" />;
  }

  return (
    <>
      {/* Versão Desktop - Tabela */}
      <div className="hidden xl:block bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receitas.map((receita) => (
              <tr key={receita.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {receita.codigo_referencia?.charAt(0) || 'R'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {receita.codigo_referencia || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {receita.codigo_interno || ''}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {getNomePrincipal(receita.nome)}
                  </div>
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {receita.descricao || ''}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(receita.status)}
                    {getStatusBadge(receita.status)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <ActionButtons
                    item={receita}
                    canView={canView}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    customActions={[
                      {
                        icon: FaFileAlt,
                        label: 'Preview',
                        onClick: onPreview,
                        className: 'text-purple-600 hover:text-purple-900'
                      },
                      {
                        icon: FaCopy,
                        label: 'Duplicar',
                        onClick: onDuplicate,
                        className: 'text-green-600 hover:text-green-900'
                      }
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="xl:hidden space-y-4">
        {receitas.map((receita) => (
          <div key={receita.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {getNomePrincipal(receita.nome)}
                </h3>
                <p className="text-xs text-gray-500">
                  {receita.codigo_referencia || 'N/A'} - {receita.codigo_interno || ''}
                </p>
              </div>
              <div className="flex items-center">
                {getStatusIcon(receita.status)}
                {getStatusBadge(receita.status)}
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-gray-600 line-clamp-2">
                {receita.descricao || 'Sem descrição'}
              </p>
            </div>
            
            <div className="flex items-center justify-end">
              <ActionButtons
                item={receita}
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                customActions={[
                  {
                    icon: FaFileAlt,
                    label: 'Preview',
                    onClick: onPreview,
                    className: 'text-purple-600 hover:text-purple-900'
                  },
                  {
                    icon: FaCopy,
                    label: 'Duplicar',
                    onClick: onDuplicate,
                    className: 'text-blue-600 hover:text-blue-900'
                  }
                ]}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReceitaTable;
