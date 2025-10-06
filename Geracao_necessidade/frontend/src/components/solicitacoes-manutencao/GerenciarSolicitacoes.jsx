import React, { useState, useEffect } from 'react';
import { FaTools, FaCheckCircle, FaTimesCircle, FaClock, FaFilter, FaSync } from 'react-icons/fa';
import { SearchableSelect } from '../ui';
import { ActionButtons } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import useEscolas from '../../hooks/useEscolas';
import { useSolicitacoesManutencao } from '../../hooks/useSolicitacoesManutencao';
import { useModal } from '../../hooks/useModal';
import { SolicitacaoModal } from './index';
import toast from 'react-hot-toast';

const GerenciarSolicitacoes = ({ onSolicitacaoAtualizada }) => {
  const { user } = useAuth();
  const [filtros, setFiltros] = useState({
    status: '',
    escola_id: '',
    data_inicio: '',
    data_fim: ''
  });
  const [loading, setLoading] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  
  // Hook para gerenciamento do modal (padrão do sistema)
  const {
    showModal: isModalOpen,
    viewMode,
    editingItem: selectedSolicitacao,
    handleView: handleViewSolicitacao,
    handleEdit: handleEditSolicitacao,
    handleCloseModal: handleCloseModal
  } = useModal();
  
  const [modalLoading, setModalLoading] = useState(false);

  const { escolas, carregarEscolas } = useEscolas();
  const { 
    carregarSolicitacoes, 
    atualizarSolicitacao,
    loading: solicitacoesLoading 
  } = useSolicitacoesManutencao();

  // Carregar escolas (todas para coordenação/supervisão)
  useEffect(() => {
    carregarEscolas({}, true);
  }, []);

  // Carregar solicitações pendentes
  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await carregarSolicitacoes({
        ...filtros,
        // Para gerenciamento, mostrar status que precisam de ação (incluir "Concluido" para edição posterior)
        status: filtros.status || 'Pendente,Pendente manutencao,Concluido'
      });
      
      if (response?.success) {
        setSolicitacoes(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };


  // Função para salvar solicitação (edição normal)
  const handleSaveSolicitacao = async (solicitacaoData) => {
    setModalLoading(true);
    
    try {
      let result;
      if (selectedSolicitacao) {
        result = await atualizarSolicitacao(selectedSolicitacao.id, solicitacaoData);
      } else {
        // Não deveria acontecer na aba gerenciar, mas por segurança
        toast.error('Operação não permitida');
        return;
      }

      if (result === true || (result && result.id)) {
        // Operação bem-sucedida - recarregar dados da aba gerenciar
        await carregarDados();
        if (onSolicitacaoAtualizada) {
          onSolicitacaoAtualizada();
        }
        handleCloseModal();
      } else if (result === null) {
        // Erro já foi tratado no hook, não precisa mostrar toast novamente
        return;
      } else {
        toast.error(result?.error || result?.message || 'Erro ao salvar solicitação');
      }
    } catch (error) {
      console.error('Erro ao salvar solicitação:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setModalLoading(false);
    }
  };

  // Função para atualizar solicitação (padrão do sistema)
  const handleAtualizarStatus = async (solicitacao, novoStatus) => {
    setModalLoading(true);
    try {
      // Determinar o status final
      let statusFinal = novoStatus;
      if (novoStatus === 'Aprovado') {
        statusFinal = 'Pendente manutencao';
      }

      // Se for concluir e já está "Concluido", verificar se campos obrigatórios estão preenchidos
      if (novoStatus === 'Concluido' && solicitacao.status === 'Concluido') {
        // Verificar se campos obrigatórios estão preenchidos
        if (!solicitacao.fornecedor || !solicitacao.valor || !solicitacao.data_servico) {
          toast.error('Preencha todos os campos obrigatórios: Fornecedor, Valor e Data do Serviço');
          setModalLoading(false);
          return;
        }
        
        // Salvar os dados e fechar modal
        const dadosAtualizacao = {
          fornecedor: solicitacao.fornecedor,
          valor: solicitacao.valor,
          data_servico: solicitacao.data_servico
        };

        const success = await atualizarSolicitacao(solicitacao.id, dadosAtualizacao);
        
        if (success) {
          toast.success('Solicitação concluída com sucesso!');
          carregarDados();
          if (onSolicitacaoAtualizada) {
            onSolicitacaoAtualizada();
          }
          handleCloseModal();
        } else {
          toast.error('Erro ao salvar dados da solicitação');
        }
        setModalLoading(false);
        return;
      }

      // Para outros casos (Aprovado, Reprovado, ou primeiro clique em Concluir)
      const dadosAtualizacao = {
        status: statusFinal
      };

      const success = await atualizarSolicitacao(solicitacao.id, dadosAtualizacao);
      
      if (success) {
        toast.success(`Solicitação ${novoStatus.toLowerCase()} com sucesso!`);
        
        // Atualizar dados locais
        carregarDados();
        
        // Notificar componente pai para atualizar a aba "Lista"
        if (onSolicitacaoAtualizada) {
          onSolicitacaoAtualizada();
        }
        
        // Se for primeiro clique em "Concluir", manter modal aberto
        if (novoStatus === 'Concluido') {
          toast.info('Preencha os campos obrigatórios e clique em "Concluir" novamente para finalizar');
        } else {
          // Fechar modal para outros status
          handleCloseModal();
        }
      } else {
        toast.error('Erro ao atualizar solicitação');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar solicitação');
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pendente': { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: FaClock,
        label: 'Pendente' 
      },
      'Aprovado': { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: FaCheckCircle,
        label: 'Aprovado' 
      },
      'Reprovado': { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: FaTimesCircle,
        label: 'Reprovado' 
      },
      'Pendente manutencao': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        icon: FaTools,
        label: 'Pendente Manutenção' 
      },
      'Concluido': { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: FaCheckCircle,
        label: 'Concluído' 
      }
    };

    const config = statusConfig[status] || statusConfig['Pendente'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    let date;
    if (dateString.includes('T')) {
      const dateOnly = dateString.split('T')[0];
      date = new Date(dateOnly + 'T12:00:00');
    } else {
      date = new Date(dateString + 'T12:00:00');
    }
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaFilter className="mr-2 text-green-600" />
            Filtros
          </h3>
          <button
            onClick={carregarDados}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <FaSync className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <SearchableSelect
              options={[
                { value: '', label: 'Todos os status' },
                { value: 'Pendente', label: 'Pendente' },
                { value: 'Pendente manutencao', label: 'Pendente Manutenção' },
                { value: 'Aprovado', label: 'Aprovado' },
                { value: 'Reprovado', label: 'Reprovado' },
                { value: 'Concluido', label: 'Concluído' }
              ]}
              value={filtros.status}
              onChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
              placeholder="Filtrar por status"
            />
          </div>

          {/* Escola */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escola
            </label>
            <SearchableSelect
              options={[
                { value: '', label: 'Todas as escolas' },
                ...escolas.map(escola => ({
                  value: escola.id.toString(),
                  label: `${escola.nome_escola} - ${escola.rota}`
                }))
              ]}
              value={filtros.escola_id}
              onChange={(value) => setFiltros(prev => ({ ...prev, escola_id: value }))}
              placeholder="Filtrar por escola"
            />
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Solicitações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Solicitações para Gerenciamento ({solicitacoes.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando solicitações...</p>
          </div>
        ) : solicitacoes.length === 0 ? (
          <div className="p-6 text-center">
            <FaTools className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma solicitação encontrada
            </h3>
            <p className="text-gray-600">
              Não há solicitações que correspondam aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Escola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nutricionista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manutenção
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
                {solicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {solicitacao.nome_escola}
                      </div>
                      <div className="text-sm text-gray-500">
                        {solicitacao.rota}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(solicitacao.data_solicitacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {solicitacao.nutricionista_nome || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {solicitacao.manutencao_descricao}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(solicitacao.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        canView={true}
                        canEdit={
                          // Para supervisor/coordenador: só pode editar se status for "Pendente manutencao" (não pode editar "Concluido")
                          // Para nutricionista: pode editar se status for "Pendente" ou "Pendente manutencao"
                          (user?.tipo_usuario === 'Supervisao' || user?.tipo_usuario === 'Coordenacao') 
                            ? (solicitacao.status === 'Pendente manutencao')
                            : (solicitacao.status === 'Pendente' || solicitacao.status === 'Pendente manutencao')
                        }
                        canDelete={false}
                        onView={() => handleViewSolicitacao(solicitacao)}
                        onEdit={
                          (user?.tipo_usuario === 'Supervisao' || user?.tipo_usuario === 'Coordenacao') 
                            ? ((solicitacao.status === 'Pendente manutencao') ? () => handleEditSolicitacao(solicitacao) : null)
                            : ((solicitacao.status === 'Pendente' || solicitacao.status === 'Pendente manutencao') ? () => handleEditSolicitacao(solicitacao) : null)
                        }
                        onDelete={null}
                        item={solicitacao}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Visualização com Ações */}
      <SolicitacaoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSolicitacao}
        solicitacao={selectedSolicitacao}
        escolas={escolas}
        loading={modalLoading}
        viewMode={viewMode} // Usar o viewMode do hook useModal
        // Props específicas para gerenciamento
        showManagementActions={true}
        onAprovar={() => handleAtualizarStatus(selectedSolicitacao, 'Aprovado')}
        onReprovar={() => handleAtualizarStatus(selectedSolicitacao, 'Reprovado')}
        onConcluir={() => handleAtualizarStatus(selectedSolicitacao, 'Concluido')}
        managementLoading={modalLoading}
      />
    </div>
  );
};

export default GerenciarSolicitacoes;
