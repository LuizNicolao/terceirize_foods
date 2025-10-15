import React, { useState, useEffect } from 'react';
import { FaPlus, FaList, FaChartLine } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRegistrosDiarios } from '../../hooks/useRegistrosDiarios';
import { Button, ConfirmModal } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { 
  RegistrosDiariosModal, 
  RegistrosDiariosTable, 
  RegistrosDiariosStats 
} from '../../components/registros-diarios';
import MediasCalculadasTab from '../../components/registros-diarios/MediasCalculadasTab';
import RegistrosDiariosService from '../../services/registrosDiarios';

const RegistrosDiarios = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [abaAtiva, setAbaAtiva] = useState('registros');
  
  const {
    registros,
    loading,
    saving,
    showModal,
    editingRegistro,
    viewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    onSubmit,
    handleDeleteRegistro,
    handleAddRegistro,
    handleEditRegistro,
    handleViewRegistro,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange
  } = useRegistrosDiarios();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRegistro, setDeletingRegistro] = useState(null);
  const [medias, setMedias] = useState([]);
  const [loadingMedias, setLoadingMedias] = useState(false);
  
  const handleDeleteClick = (escolaId, data) => {
    setDeletingRegistro({ escolaId, data });
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    if (deletingRegistro) {
      handleDeleteRegistro(deletingRegistro.escolaId, deletingRegistro.data);
      setShowDeleteConfirm(false);
      setDeletingRegistro(null);
    }
  };
  
  // Carregar médias quando aba de médias for ativada
  useEffect(() => {
    const carregarMedias = async () => {
      if (abaAtiva === 'medias') {
        setLoadingMedias(true);
        const result = await RegistrosDiariosService.listarMedias();
        if (result.success) {
          setMedias(result.data);
        }
        setLoadingMedias(false);
      }
    };
    
    carregarMedias();
  }, [abaAtiva]);
  
  const abas = [
    { id: 'registros', label: 'Registros', icon: FaList },
    { id: 'medias', label: 'Médias Calculadas', icon: FaChartLine }
  ];
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quantidade Servida</h1>
          <p className="text-sm text-gray-600 mt-1">
            Registre diariamente as quantidades de refeições servidas por escola
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {canCreate('registros_diarios') && (
            <Button onClick={handleAddRegistro} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Registro</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Estatísticas */}
      <RegistrosDiariosStats estatisticas={estatisticas} />
      
      {/* Abas de Navegação */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {abas.map((aba) => {
              const Icon = aba.icon;
              const isActive = abaAtiva === aba.id;
              
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${isActive
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {aba.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Conteúdo das Abas */}
      {abaAtiva === 'registros' && (
        <>
          {/* Tabela de Registros */}
          <RegistrosDiariosTable
            registros={registros}
            canView={canView('registros_diarios')}
            canEdit={canEdit('registros_diarios')}
            canDelete={canDelete('registros_diarios')}
            onView={handleViewRegistro}
            onEdit={handleEditRegistro}
            onDelete={handleDeleteClick}
            loading={loading}
          />
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </>
      )}
      
      {abaAtiva === 'medias' && (
        <MediasCalculadasTab
          medias={medias}
          loading={loadingMedias}
        />
      )}
      
      {/* Modal de Cadastro/Edição */}
      <RegistrosDiariosModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={onSubmit}
        registro={editingRegistro}
        isViewMode={viewMode}
      />
      
      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir todos os registros desta data?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default RegistrosDiarios;

