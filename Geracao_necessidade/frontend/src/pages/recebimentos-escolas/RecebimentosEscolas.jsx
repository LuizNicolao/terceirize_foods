import React, { useState, useEffect } from 'react';
import { FaTruck } from 'react-icons/fa';
import {
  RecebimentosLayout,
  RecebimentosStats,
  RecebimentosFilters,
  RecebimentosActions,
  RecebimentosTabs,
  RecebimentosLoading,
  RecebimentosTable,
  RecebimentoModal,
  RelatoriosRecebimentos
} from '../../components/recebimentos-escolas';
import { useFilters } from '../../hooks/common/useFilters';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';
import useRecebimentosEscolas from '../../hooks/useRecebimentosEscolas';
import useEscolas from '../../hooks/useEscolas';
import useProdutos from '../../hooks/useProdutos';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useModal } from '../../hooks/useModal';
import { useAuth } from '../../contexts/AuthContext';

const RecebimentosEscolas = () => {
  const { user } = useAuth();
  const { canView, canCreate, canEdit, canDelete, loading: permissionsLoading } = usePermissions();
  const { 
    recebimentos, 
    loading, 
    error, 
    pagination,
    carregarRecebimentos, 
    buscarRecebimento, 
    criarRecebimento, 
    atualizarRecebimento, 
    deletarRecebimento,
    setPage,
    setLimit
  } = useRecebimentosEscolas();
  
  const { escolas, carregarEscolas, carregarTodasEscolas } = useEscolas();
  const { produtos, carregarProdutos } = useProdutos();

  // Hook para semanas de abastecimento (deve vir antes do useFilters)
  const { 
    opcoes: opcoesSemanas, 
    semanaAtual, 
    obterSemanaPadrao,
    obterValorPadrao 
  } = useSemanasAbastecimento();

  // Hook para gerenciar filtros
  const { 
    searchTerm, 
    setSearchTerm, 
    semanaAbastecimento, 
    setSemanaAbastecimento, 
    filters, 
    updateFilter, 
    clearFilters, 
    getFilterParams 
  } = useFilters({
    escola_id: '',
    tipo_recebimento: '',
    tipo_entrega: '',
    data_inicio: '',
    data_fim: ''
  }, obterValorPadrao());

  // Inicializar filtro de semana com a semana atual (apenas na primeira carga)
  const [inicializado, setInicializado] = useState(false);
  useEffect(() => {
    const semanaPadrao = obterValorPadrao();
    if (semanaPadrao && !inicializado && semanaAbastecimento === '') {
      setSemanaAbastecimento(semanaPadrao);
      setInicializado(true);
    }
  }, [obterValorPadrao, inicializado, semanaAbastecimento]);

  // Estados do modal
  const {
    showModal: isModalOpen,
    editingItem: selectedRecebimento,
    viewMode,
    handleAdd,
    handleView,
    handleEdit,
    handleCloseModal,
    setViewMode
  } = useModal();
  
  const [modalLoading, setModalLoading] = useState(false);
  
  // Estado para controlar as tabs da página
  const [activeTab, setActiveTab] = useState('lista');

  // Carregar dados iniciais
  useEffect(() => {
    if (canView('recebimentos-escolas')) {
      carregarRecebimentos(getFilterParams());
      carregarTodasEscolas(); // Usar carregarTodasEscolas para dropdown sem limitação
      carregarProdutos();
    }
  }, [canView]);
  

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (canView('recebimentos-escolas')) {
      carregarRecebimentos(getFilterParams());
    }
  }, [searchTerm, semanaAbastecimento, filters, pagination.currentPage, pagination.itemsPerPage]);

  const canViewRecebimentos = canView('recebimentos-escolas');
  const canCreateRecebimentos = canCreate('recebimentos-escolas');
  const canEditRecebimentos = canEdit('recebimentos-escolas');
  const canDeleteRecebimentos = canDelete('recebimentos-escolas');

  // Preparar filtros adicionais para o componente
  const additionalFilters = [
    {
      value: filters.escola_id || '',
      onChange: (value) => updateFilter('escola_id', value),
      options: [
        { value: '', label: 'Todas as escolas' },
        ...escolas.map(escola => ({ 
          value: escola.id, 
          label: `${escola.nome_escola} - ${escola.rota}`,
          description: escola.cidade
        }))
      ],
      searchable: true,
      placeholder: "Buscar escola...",
      filterBy: (option, searchTerm) => {
        if (option.value === '') return true; // Sempre mostrar "Todas as escolas"
        const label = option.label.toLowerCase();
        const description = option.description?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return label.includes(term) || description.includes(term);
      },
      renderOption: (option) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{option.label}</span>
          {option.description && (
            <span className="text-xs text-gray-500 mt-1">{option.description}</span>
          )}
        </div>
      )
    },
    {
      value: filters.tipo_recebimento || '',
      onChange: (value) => updateFilter('tipo_recebimento', value),
      options: [
        { value: '', label: 'Todos os tipos' },
        { value: 'Completo', label: 'Completo' },
        { value: 'Parcial', label: 'Parcial' }
      ]
    },
    {
      value: filters.tipo_entrega || '',
      onChange: (value) => updateFilter('tipo_entrega', value),
      options: [
        { value: '', label: 'Todos os tipos' },
        { value: 'HORTI', label: 'Hortifruti' },
        { value: 'PAO', label: 'Pão' },
        { value: 'PERECIVEL', label: 'Perecível' },
        { value: 'BASE SECA', label: 'Base Seca' },
        { value: 'LIMPEZA', label: 'Limpeza' }
      ]
    }
  ];

  const handleAddRecebimento = () => {
    handleAdd();
  };

  const handleEditRecebimento = async (recebimento) => {
    try {
      setModalLoading(true);
      const recebimentoCompleto = await buscarRecebimento(recebimento.id);
      handleEdit(recebimentoCompleto);
    } catch (error) {
      console.error('Erro ao carregar recebimento:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewRecebimento = async (recebimento) => {
    try {
      setModalLoading(true);
      const recebimentoCompleto = await buscarRecebimento(recebimento.id);
      handleView(recebimentoCompleto);
    } catch (error) {
      console.error('Erro ao carregar recebimento:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRecebimento = async (recebimento) => {
    if (window.confirm(`Tem certeza que deseja deletar o recebimento da escola ${recebimento.nome_escola}?`)) {
      try {
        await deletarRecebimento(recebimento.id);
        carregarRecebimentos(getFilterParams());
      } catch (error) {
        console.error('Erro ao deletar recebimento:', error);
      }
    }
  };

  const handleSaveRecebimento = async (dados) => {
    try {
      setModalLoading(true);
      
      if (selectedRecebimento) {
        await atualizarRecebimento(selectedRecebimento.id, dados);
      } else {
        await criarRecebimento(dados);
      }
      
      handleCloseModal();
      carregarRecebimentos(getFilterParams());
    } catch (error) {
      console.error('Erro ao salvar recebimento:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModalWrapper = () => {
    handleCloseModal();
  };

  // Mostrar loading enquanto carrega permissões
  if (permissionsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Carregando permissões...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!canViewRecebimentos) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaTruck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-600">
              Você não tem permissão para visualizar os recebimentos de escolas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RecebimentosLayout
      actions={
        activeTab === 'lista' ? (
          <RecebimentosActions 
            canCreate={canCreateRecebimentos} 
            onAdd={handleAddRecebimento}
            loading={loading}
          />
        ) : null
      }
    >
      {/* Estatísticas */}
      <RecebimentosStats recebimentos={recebimentos} pagination={pagination} />

      {/* Tabs de navegação */}
      <RecebimentosTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userType={user.tipo_usuario} 
      />

        {/* Conteúdo das tabs */}
        {activeTab === 'lista' && (
          <>

          {/* Filtros */}
          <RecebimentosFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            semanaAbastecimento={semanaAbastecimento}
            onSemanaAbastecimentoChange={setSemanaAbastecimento}
            opcoesSemanas={opcoesSemanas}
            additionalFilters={additionalFilters}
            onClear={clearFilters}
            loading={loading}
          />

            {/* Tabela */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <RecebimentosLoading />
              </div>
            ) : (
              <RecebimentosTable
                recebimentos={recebimentos}
                pagination={pagination}
                onEdit={handleEditRecebimento}
                onDelete={handleDeleteRecebimento}
                onView={handleViewRecebimento}
                onAdd={handleAddRecebimento}
                onPageChange={setPage}
                onLimitChange={setLimit}
                canEdit={canEditRecebimentos}
                canDelete={canDeleteRecebimentos}
                canView={canViewRecebimentos}
                canCreate={canCreateRecebimentos}
                loading={loading}
              />
            )}
          </>
        )}

        {activeTab === 'relatorios' && (
          <RelatoriosRecebimentos />
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro ao carregar recebimentos
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        <RecebimentoModal
          isOpen={isModalOpen}
          onClose={handleCloseModalWrapper}
          recebimento={selectedRecebimento}
          onSave={handleSaveRecebimento}
          escolas={escolas}
          produtos={produtos}
          loading={modalLoading}
          isViewMode={viewMode}
        />
    </RecebimentosLayout>
  );
};

export default RecebimentosEscolas;





