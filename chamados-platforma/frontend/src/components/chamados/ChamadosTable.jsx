import React from 'react';
import { FaCheck, FaUserPlus, FaRedo, FaClock } from 'react-icons/fa';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import ChamadosService from '../../services/chamados';
import toast from 'react-hot-toast';
import SLAService from '../../utils/sla';

const ChamadosTable = ({ 
  chamados, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getTipoLabel,
  getStatusLabel,
  getPrioridadeLabel,
  getPrioridadeColor,
  getStatusColor,
  formatDate,
  sortField,
  sortDirection,
  onSort,
  onRefresh
}) => {
  const { user } = useAuth();
  const { canAssumir, canConcluir, canReabrir } = usePermissions();

  const handleAcaoRapida = async (chamado, acao) => {
    try {
      let result;
      
      switch (acao) {
        case 'assumir':
          result = await ChamadosService.atualizar(chamado.id, {
            usuario_responsavel_id: user.id,
            status: chamado.status === 'aberto' ? 'em_analise' : chamado.status
          });
          break;
        case 'concluir':
          result = await ChamadosService.atualizar(chamado.id, {
            status: 'concluido'
          });
          break;
        case 'reabrir':
          result = await ChamadosService.atualizar(chamado.id, {
            status: 'aberto'
          });
          break;
        default:
          return;
      }

      if (result.success) {
        toast.success(result.message || 'Ação realizada com sucesso!');
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.error || 'Erro ao realizar ação');
      }
    } catch (error) {
      toast.error('Erro ao realizar ação');
      console.error(error);
    }
  };

  const podeAssumir = (chamado) => {
    // Verificar permissão específica E condições do chamado
    if (!canAssumir('chamados')) {
      return false;
    }
    return !chamado.usuario_responsavel_id && 
           chamado.status !== 'concluido' && 
           chamado.status !== 'fechado';
  };

  const podeConcluir = (chamado) => {
    // Verificar permissão específica E condições do chamado
    if (!canConcluir('chamados')) {
      return false;
    }
    return chamado.usuario_responsavel_id === user?.id && 
           chamado.status !== 'concluido' && 
           chamado.status !== 'fechado';
  };

  const podeReabrir = (chamado) => {
    // Verificar permissão específica E condições do chamado
    if (!canReabrir('chamados')) {
      return false;
    }
    return chamado.status === 'concluido' || chamado.status === 'fechado';
  };

  const podeEditar = (chamado) => {
    // Verificar permissão básica
    if (!canEdit('chamados')) {
      return false;
    }
    
    // Se o chamado tem um responsável, apenas ele pode editar
    if (chamado.usuario_responsavel_id) {
      return chamado.usuario_responsavel_id === user?.id;
    }
    
    // Se não tem responsável, quem tem permissão pode editar
    return true;
  };

  const renderSLABadge = (chamado) => {
    if (!chamado.data_limite_resolucao) return null;
    
    const statusSLA = SLAService.obterStatusSLA(chamado.data_limite_resolucao);
    const corSLA = SLAService.obterCorSLA(statusSLA);
    const labels = {
      'ok': 'OK',
      'atencao': 'Atenção',
      'critico': 'Crítico',
      'vencido': 'Vencido',
      'sem_prazo': '-'
    };

    return (
      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${corSLA}`}>
        <FaClock className="mr-1" />
        {labels[statusSLA]}
      </span>
    );
  };

  if (chamados.length === 0) {
    return (
      <EmptyState
        title="Nenhum chamado encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo chamado"
        icon="chamados"
      />
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <SortableTableHeader
                  label="ID"
                  field="id"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Título"
                  field="titulo"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Sistema"
                  field="sistema"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Tipo"
                  field="tipo"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Status"
                  field="status"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Prioridade"
                  field="prioridade"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA
                </th>
                <SortableTableHeader
                  label="Data Abertura"
                  field="data_abertura"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chamados.map((chamado) => (
                <tr key={chamado.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    #{chamado.id}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {chamado.titulo}
                    </div>
                    {chamado.tela && (
                      <div className="text-xs text-gray-500">
                        {chamado.tela}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {chamado.sistema}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {getTipoLabel(chamado.tipo)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(chamado.status)}`}>
                      {getStatusLabel(chamado.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getPrioridadeColor(chamado.prioridade)}`}>
                      {getPrioridadeLabel(chamado.prioridade)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {renderSLABadge(chamado)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(chamado.data_abertura)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-1">
                      {/* Ações Rápidas */}
                      {podeAssumir(chamado) && (
                        <button
                          onClick={() => handleAcaoRapida(chamado, 'assumir')}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Assumir chamado"
                        >
                          <FaUserPlus />
                        </button>
                      )}
                      {podeConcluir(chamado) && (
                        <button
                          onClick={() => handleAcaoRapida(chamado, 'concluir')}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Marcar como concluído"
                        >
                          <FaCheck />
                        </button>
                      )}
                      {podeReabrir(chamado) && (
                        <button
                          onClick={() => handleAcaoRapida(chamado, 'reabrir')}
                          className="p-1 text-orange-600 hover:text-orange-800"
                          title="Reabrir chamado"
                        >
                          <FaRedo />
                        </button>
                      )}
                      <ActionButtons
                        canView={canView('chamados')}
                        canEdit={podeEditar(chamado)}
                        canDelete={canDelete('chamados')}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        item={chamado}
                        size="xs"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {chamados.map((chamado) => (
          <div key={chamado.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-gray-500">ID: #{chamado.id}</span>
                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(chamado.status)}`}>
                    {getStatusLabel(chamado.status)}
                  </span>
                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getPrioridadeColor(chamado.prioridade)}`}>
                    {getPrioridadeLabel(chamado.prioridade)}
                  </span>
                  {renderSLABadge(chamado)}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{chamado.titulo}</h3>
                <p className="text-gray-600 text-xs">{chamado.sistema}</p>
              </div>
              <div className="flex items-center gap-1">
                {/* Ações Rápidas Mobile */}
                {podeAssumir(chamado) && (
                  <button
                    onClick={() => handleAcaoRapida(chamado, 'assumir')}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="Assumir"
                  >
                    <FaUserPlus />
                  </button>
                )}
                {podeConcluir(chamado) && (
                  <button
                    onClick={() => handleAcaoRapida(chamado, 'concluir')}
                    className="p-2 text-green-600 hover:text-green-800"
                    title="Concluir"
                  >
                    <FaCheck />
                  </button>
                )}
                {podeReabrir(chamado) && (
                  <button
                    onClick={() => handleAcaoRapida(chamado, 'reabrir')}
                    className="p-2 text-orange-600 hover:text-orange-800"
                    title="Reabrir"
                  >
                    <FaRedo />
                  </button>
                )}
                <ActionButtons
                  canView={canView('chamados')}
                  canEdit={podeEditar(chamado)}
                  canDelete={canDelete('chamados')}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  item={chamado}
                  size="xs"
                  className="p-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Tipo:</span>
                <p className="font-medium">{getTipoLabel(chamado.tipo)}</p>
              </div>
              <div>
                <span className="text-gray-500">Data:</span>
                <p className="font-medium">{formatDate(chamado.data_abertura)}</p>
              </div>
              {chamado.tela && (
                <div className="col-span-2">
                  <span className="text-gray-500">Tela:</span>
                  <p className="font-medium">{chamado.tela}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ChamadosTable;
