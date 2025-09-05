import React, { useState } from 'react';
import { FaPlus, FaTrash, FaUtensils, FaExclamationTriangle, FaUsers, FaEdit } from 'react-icons/fa';
import { Button, Table, ConfirmModal } from '../ui';
import SearchableSelect from '../ui/SearchableSelect';
import { usePeriodosRefeicaoUnidade } from '../../hooks/usePeriodosRefeicaoUnidade';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import { EfetivoModal, EfetivosEditModal } from '../efetivos';
import toast from 'react-hot-toast';

const PeriodosRefeicaoContent = ({ unidade, canEdit, canDelete }) => {
  const {
    periodosVinculados,
    periodosDisponiveis,
    loading,
    showDeleteModal,
    periodoToDelete,
    handleAddPeriodo,
    handleDeletePeriodo,
    confirmDeletePeriodo,
    closeDeleteModal,
    loadPeriodosRefeicao
  } = usePeriodosRefeicaoUnidade(unidade?.id);

  const [selectedPeriodoId, setSelectedPeriodoId] = useState('');
  
  // Estados para modal de efetivos
  const [showEfetivoModal, setShowEfetivoModal] = useState(false);
  const [selectedPeriodoForEfetivo, setSelectedPeriodoForEfetivo] = useState(null);
  
  // Estados para modal de edição de efetivos
  const [showEditEfetivoModal, setShowEditEfetivoModal] = useState(false);
  const [selectedPeriodoForEdit, setSelectedPeriodoForEdit] = useState(null);

  // Preparar opções para o SearchableSelect
  const periodoOptions = periodosDisponiveis.map(periodo => ({
    value: periodo.id,
    label: periodo.nome,
    description: periodo.codigo ? `Código: ${periodo.codigo}` : undefined
  }));

  // Função para adicionar período selecionado
  const handleAddSelectedPeriodo = async () => {
    if (!selectedPeriodoId) return;
    
    const periodo = periodosDisponiveis.find(p => p.id === selectedPeriodoId);
    if (periodo) {
      await handleAddPeriodo(periodo);
      setSelectedPeriodoId(''); // Limpar seleção
    }
  };


  // Função para verificar se há inconsistências
  const hasInconsistency = (periodo) => {
    const totalConfigurado = (periodo.quantidade_efetivos_padrao || 0) + (periodo.quantidade_efetivos_nae || 0);
    const totalCadastrado = (parseInt(periodo.efetivos_cadastrados_padrao) || 0) + (parseInt(periodo.efetivos_cadastrados_nae) || 0);
    return totalConfigurado !== totalCadastrado;
  };

  // Funções para modal de efetivos
  const handleAddEfetivo = (periodo) => {
    setSelectedPeriodoForEfetivo(periodo);
    setShowEfetivoModal(true);
  };

  const handleCloseEfetivoModal = () => {
    setShowEfetivoModal(false);
    setSelectedPeriodoForEfetivo(null);
  };

  // Funções para modal de edição de efetivos
  const handleEditEfetivos = (periodo) => {
    setSelectedPeriodoForEdit(periodo);
    setShowEditEfetivoModal(true);
  };

  const handleCloseEditEfetivoModal = () => {
    setShowEditEfetivoModal(false);
    setSelectedPeriodoForEdit(null);
  };

  const handleSaveEfetivos = async () => {
    // Recarregar os períodos para mostrar as atualizações
    await loadPeriodosRefeicao();
  };

  const handleSubmitEfetivo = async (data) => {
    try {
      // Adicionar o período de refeição aos dados
      const efetivoData = {
        ...data,
        periodo_refeicao_id: selectedPeriodoForEfetivo?.id
      };

      // Importar o serviço de efetivos
      const EfetivosService = (await import('../../services/efetivos')).default;
      
      const result = await EfetivosService.criarPorUnidade(unidade?.id, efetivoData);
      
      if (result.success) {
        toast.success('Efetivo adicionado com sucesso!');
        handleCloseEfetivoModal();
        // Recarregar os períodos para mostrar as atualizações
        await loadPeriodosRefeicao();
      } else {
        toast.error(result.message || 'Erro ao adicionar efetivo');
      }
    } catch (error) {
      console.error('Erro ao adicionar efetivo:', error);
      toast.error('Erro ao adicionar efetivo');
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
          <FaUtensils className="text-green-600" />
          Períodos de Refeição
        </h3>
        
        {canEdit('unidades_escolares') && periodosDisponiveis.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <SearchableSelect
                  label="Adicionar Período de Refeição"
                  value={selectedPeriodoId}
                  onChange={setSelectedPeriodoId}
                  options={periodoOptions}
                  placeholder="Selecione um período de refeição..."
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
                onClick={handleAddSelectedPeriodo}
                disabled={!selectedPeriodoId || loading}
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

      {/* Lista de períodos vinculados */}
      {periodosVinculados.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaUtensils className="mx-auto text-4xl text-gray-300 mb-2" />
          <p>Nenhum período de refeição vinculado</p>
          {periodosDisponiveis.length > 0 && (
            <p className="text-sm mt-1">Use o dropdown acima para adicionar períodos disponíveis</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efetivos Padrão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efetivos NAE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                {canEdit('unidades_escolares') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {periodosVinculados.map((periodo) => {
                const totalConfigurado = (parseInt(periodo.efetivos_cadastrados_padrao) || 0) + (parseInt(periodo.efetivos_cadastrados_nae) || 0);
                const hasInconsistencyFlag = hasInconsistency(periodo);
                
                return (
                  <tr key={periodo.id} className={`hover:bg-gray-50 ${hasInconsistencyFlag ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {periodo.codigo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {periodo.nome}
                        {hasInconsistencyFlag && (
                          <FaExclamationTriangle className="text-yellow-500 text-xs" title="Inconsistência detectada" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {periodo.descricao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        periodo.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {periodo.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    
                    {/* Efetivos Padrão */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">{periodo.efetivos_cadastrados_padrao || 0}</span>
                    </td>
                    
                    {/* Efetivos NAE */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">{periodo.efetivos_cadastrados_nae || 0}</span>
                    </td>
                    
                    {/* Total */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">
                        {(parseInt(periodo.efetivos_cadastrados_padrao) || 0) + (parseInt(periodo.efetivos_cadastrados_nae) || 0)}
                      </span>
                    </td>
                    
                    {/* Ações */}
                    {canEdit('unidades_escolares') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleAddEfetivo(periodo)}
                            variant="ghost"
                            size="xs"
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            title="Adicionar efetivo"
                          >
                            <FaUsers className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleEditEfetivos(periodo)}
                            variant="ghost"
                            size="xs"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title="Editar efetivos"
                          >
                            <FaEdit className="h-4 w-4" />
                          </Button>
                          {canDelete('unidades_escolares') && (
                            <Button
                              onClick={() => handleDeletePeriodo(periodo)}
                              variant="ghost"
                              size="xs"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <FaTrash className="text-sm" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDeletePeriodo}
        title="Desvincular Período de Refeição"
        message={`Tem certeza que deseja desvincular o período de refeição "${periodoToDelete?.nome}" desta unidade escolar?`}
        confirmText="Desvincular"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Efetivo */}
      <EfetivoModal
        isOpen={showEfetivoModal}
        onClose={handleCloseEfetivoModal}
        onSubmit={handleSubmitEfetivo}
        efetivo={null}
        isViewMode={false}
        unidadeEscolarId={unidade?.id}
        periodoRefeicao={selectedPeriodoForEfetivo}
      />

      {/* Modal de Edição de Efetivos */}
      <EfetivosEditModal
        isOpen={showEditEfetivoModal}
        onClose={handleCloseEditEfetivoModal}
        onSave={handleSaveEfetivos}
        unidadeEscolarId={unidade?.id}
        periodoRefeicao={selectedPeriodoForEdit}
      />
    </div>
  );
};

export default PeriodosRefeicaoContent;
