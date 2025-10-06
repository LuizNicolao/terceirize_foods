import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import { useMediasEscolasPage } from '../../hooks/useMediasEscolasPage';
import { MediasEscolasStats, MediasEscolasActions } from '../../components/medias-escolas';
import { RegistrosDiariosTable, RegistroModal } from '../../components/registros-diarios';

const MediasEscolas = () => {
  const {
    // Estados
    escolas,
    medias,
    registros,
    mediasCalculadas,
    permissionsLoading,
    mediasLoading,
    registrosLoading,
    registroModalLoading,
    isRegistroModalOpen,
    isViewMode,
    selectedRegistro,
    mediasError,
    registrosError,
    
    // Permissões
    canViewMedias,
    canCreateMedias,
    canEditMedias,
    canDeleteMedias,
    canViewRegistros,
    canCreateRegistros,
    canEditRegistros,
    canDeleteRegistros,
    
    // Handlers
    handleAddRegistroWrapper,
    handleViewRegistroWrapper,
    handleEditRegistroWrapper,
    handleDeleteRegistro,
    handleSaveRegistro,
    handleCloseModalWithCleanup
  } = useMediasEscolasPage();



  // Mostrar loading enquanto carrega permissões
  if (permissionsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Carregando permissões...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!canViewMedias && !canViewRegistros) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaChartLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-600">
              Você não tem permissão para visualizar as médias por escolas ou registros diários.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quantidade Servida</h1>
          <p className="text-gray-600">Gerencie as quantidades servidas por período para cada escola</p>
        </div>
        <MediasEscolasActions
          canCreateRegistros={canCreateRegistros}
          onAddRegistro={handleAddRegistroWrapper}
        />
      </div>

      {/* Estatísticas */}
      <MediasEscolasStats 
        escolas={escolas}
        registros={registros}
        medias={medias}
      />


      {/* Conteúdo Principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Registros Diários
            </h3>
          </div>
          
          <RegistrosDiariosTable
            registros={registros}
            onEdit={handleEditRegistroWrapper}
            onDelete={handleDeleteRegistro}
            onView={handleViewRegistroWrapper}
            onAdd={handleAddRegistroWrapper}
            canEdit={canEditRegistros}
            canDelete={canDeleteRegistros}
            canView={canViewRegistros}
            canCreate={canCreateRegistros}
            loading={registrosLoading}
          />
        </div>

        {/* Error Messages */}
        {mediasError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{mediasError}</p>
          </div>
        )}
        {registrosError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{registrosError}</p>
          </div>
        )}


        {/* Modal de Registro Diário */}
        <RegistroModal
          isOpen={isRegistroModalOpen}
          onClose={handleCloseModalWithCleanup}
          registro={selectedRegistro}
          onSave={handleSaveRegistro}
          escolas={escolas}
          loading={registroModalLoading}
          isViewMode={isViewMode}
          mediasCalculadas={mediasCalculadas}
        />
    </div>
  );
};

export default MediasEscolas;
