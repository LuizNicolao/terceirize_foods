import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import UsuariosService from '../../services/usuarios';
import { Button, Input, Modal } from '../../components/ui';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import UsuariosStats from '../../components/usuarios/UsuariosStats';
import UsuariosActions from '../../components/usuarios/UsuariosActions';
import UsuariosTable from '../../components/usuarios/UsuariosTable';
import AuditModal from '../../components/shared/AuditModal';

const Usuarios = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    usuarios,
    loading,
    showModal,
    viewMode,
    editingUsuario,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    register,
    handleSubmit,
    reset,
    errors,
    onSubmit,
    handleDeleteUser,
    handleAddUser,
    handleViewUser,
    handleEditUser,
    handleCloseModal,
    handlePageChange,
    setSearchTerm,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    getNivelAcessoLabel,
    getTipoAcessoLabel
  } = useUsuarios();

  const {
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useAuditoria('usuarios');

  const { handleExportXLSX, handleExportPDF } = useExport(UsuariosService);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Usuários</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
          {canCreate('usuarios') && (
            <Button onClick={handleAddUser} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <UsuariosStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por nome ou email..."
      />

      {/* Ações */}
      <UsuariosActions 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Tabela */}
      <UsuariosTable
        usuarios={usuarios}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        getTipoAcessoLabel={getTipoAcessoLabel}
        getNivelAcessoLabel={getNivelAcessoLabel}
        getStatusLabel={getStatusLabel}
        formatDate={formatDate}
      />

      {/* Modal de Usuário */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Usuário' : editingUsuario ? 'Editar Usuário' : 'Adicionar Usuário'}
        size="full"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Primeira Linha - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Informações Pessoais */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Informações Pessoais</h3>
              <div className="space-y-3">
                <Input
                  label="Nome Completo *"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  error={errors.nome?.message}
                  disabled={viewMode}
                />
                <Input
                  label="Email *"
                  type="email"
                  {...register('email', { 
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email inválido'
                    }
                  })}
                  error={errors.email?.message}
                  disabled={viewMode}
                />
              </div>
            </div>

            {/* Card 2: Informações de Acesso */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Informações de Acesso</h3>
              <div className="space-y-3">
                  <Input
                  label="Tipo de Acesso *"
                  type="select"
                  {...register('tipo_de_acesso', { required: 'Tipo de acesso é obrigatório' })}
                  error={errors.tipo_de_acesso?.message}
                  disabled={viewMode}
                >
                  <option value="">Selecione o tipo de acesso</option>
                  <option value="administrador">Administrador</option>
                  <option value="coordenador">Coordenador</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="gerente">Gerente</option>
                  <option value="supervisor">Supervisor</option>
                </Input>
                <Input
                  label="Nível de Acesso *"
                  type="select"
                  {...register('nivel_de_acesso', { required: 'Nível de acesso é obrigatório' })}
                  error={errors.nivel_de_acesso?.message}
                  disabled={viewMode}
                >
                  <option value="">Selecione o nível de acesso</option>
                  <option value="I">Nível I</option>
                  <option value="II">Nível II</option>
                  <option value="III">Nível III</option>
                </Input>
                <Input
                  label="Status *"
                  type="select"
                  {...register('status', { required: 'Status é obrigatório' })}
                  error={errors.status?.message}
                  disabled={viewMode}
                >
                  <option value="">Selecione o status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="bloqueado">Bloqueado</option>
                </Input>
              </div>
            </div>
          </div>

          {/* Segunda Linha - 1 Card */}
          <div className="grid grid-cols-1 gap-4">
            {/* Card 3: Senha */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">Senha</h3>
              <div className="space-y-3">
                <Input
                  label={editingUsuario ? "Nova Senha (deixe em branco para manter a atual)" : "Senha *"}
                  type="password"
                  {...register('senha', { 
                    required: !editingUsuario ? 'Senha é obrigatória' : false,
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  error={errors.senha?.message}
                  disabled={viewMode}
                />
              </div>
            </div>
          </div>

          {!viewMode && (
            <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
              <Button type="button" variant="secondary" size="sm" onClick={handleCloseModal}>
                Cancelar
                </Button>
              <Button type="submit" size="sm">
                {editingUsuario ? 'Atualizar' : 'Criar'}
                  </Button>
            </div>
                )}
        </form>
        </Modal>

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
          title="Relatório de Auditoria - Usuários"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};

export default Usuarios; 