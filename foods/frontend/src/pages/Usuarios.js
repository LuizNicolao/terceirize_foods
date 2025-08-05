import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaHistory,
  FaQuestionCircle,
  FaFileExcel,
  FaFilePdf,
  FaUser,
  FaUserShield,
  FaUserTie,
  FaUserCog,
  FaUsers
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import UsuariosService from '../services/usuarios';
import { Button, Input, Modal, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const Usuarios = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total_usuarios: 0,
    usuarios_ativos: 0,
    administradores: 0,
    coordenadores: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadUsuarios();
  }, [currentPage, itemsPerPage]);

  const loadUsuarios = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await UsuariosService.listar(paginationParams);
      if (result.success) {
        setUsuarios(result.data);
        
        // Extrair informações de paginação
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          // Fallback se não houver paginação no backend
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }
        
        // Calcular estatísticas básicas
        const total = result.pagination?.totalItems || result.data.length;
        const ativos = result.data.filter(u => u.status === 'ativo').length;
        const administradores = result.data.filter(u => u.tipo_de_acesso === 'administrador').length;
        const coordenadores = result.data.filter(u => u.tipo_de_acesso === 'coordenador').length;
        
        setEstatisticas({
          total_usuarios: total,
          usuarios_ativos: ativos,
          administradores,
          coordenadores
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários (client-side)
  const filteredUsuarios = (Array.isArray(usuarios) ? usuarios : []).filter(usuario => {
    const matchesSearch = !searchTerm || 
      (usuario.nome && usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario.email && usuario.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Função para mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const response = await fetch('/api/auditoria?entidade=usuarios&limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.data || []);
      } else {
        toast.error('Erro ao carregar logs de auditoria');
      }
    } catch (error) {
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    loadAuditLogs();
  };

  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
    setAuditLogs([]);
  };

  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  const handleExportXLSX = async () => {
    try {
      const result = await UsuariosService.exportarXLSX();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'usuarios.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Exportação XLSX realizada com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao exportar XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      const result = await UsuariosService.exportarPDF();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'usuarios.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Exportação PDF realizada com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action) => {
    const actions = {
      CREATE: 'Criar',
      UPDATE: 'Atualizar',
      DELETE: 'Excluir'
    };
    return actions[action] || action;
  };

  const getFieldLabel = (field) => {
    const fields = {
      nome: 'Nome',
      email: 'Email',
      senha: 'Senha',
      nivel_de_acesso: 'Nível de Acesso',
      tipo_de_acesso: 'Tipo de Acesso',
      status: 'Status'
    };
    return fields[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (field === 'status') {
      return getStatusLabel(value);
    }
    if (field === 'nivel_de_acesso') {
        return getNivelAcessoLabel(value);
    }
    if (field === 'tipo_de_acesso') {
        return getTipoAcessoLabel(value);
    }
    return value;
  };

  const handleAddUser = () => {
    setViewMode(false);
    setEditingUsuario(null);
    reset();
    setShowModal(true);
  };

  const handleViewUser = (usuario) => {
    setViewMode(true);
    setEditingUsuario(usuario);
    reset(usuario);
    setShowModal(true);
  };

  const handleEditUser = (usuario) => {
    setViewMode(false);
    setEditingUsuario(usuario);
    reset(usuario);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingUsuario(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        senha: data.senha && data.senha.trim() !== '' ? data.senha.trim() : null
      };

      let result;
      if (editingUsuario) {
        result = await UsuariosService.atualizar(editingUsuario.id, cleanData);
      } else {
        result = await UsuariosService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingUsuario ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      handleCloseModal();
      loadUsuarios();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
        toast.error('Erro ao salvar usuário');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const result = await UsuariosService.excluir(userId);
        if (result.success) {
        toast.success('Usuário excluído com sucesso!');
        loadUsuarios();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      bloqueado: 'Bloqueado'
    };
    return statusMap[status] || status;
  };

  const getNivelAcessoLabel = (nivel) => {
    const niveis = {
      'I': 'Nível I',
      'II': 'Nível II',
      'III': 'Nível III'
    };
    return niveis[nivel] || nivel;
  };

  const getTipoAcessoLabel = (tipo) => {
    const tipos = {
      'administrador': 'Administrador',
      'coordenador': 'Coordenador',
      'administrativo': 'Administrativo',
      'gerente': 'Gerente',
      'supervisor': 'Supervisor'
    };
    return tipos[tipo] || tipo;
  };

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard
          title="Total de Usuários"
          value={estatisticas.total_usuarios}
          icon={FaUsers}
          color="blue"
        />
        <StatCard
          title="Usuários Ativos"
          value={estatisticas.usuarios_ativos}
          icon={FaUser}
          color="green"
        />
        <StatCard
          title="Administradores"
          value={estatisticas.administradores}
          icon={FaUserShield}
          color="purple"
        />
        <StatCard
          title="Coordenadores"
          value={estatisticas.coordenadores}
          icon={FaUserTie}
          color="orange"
        />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por nome ou email..."
      />

      {/* Ações */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mb-4">
        <Button onClick={handleExportXLSX} variant="outline" size="sm">
          <FaFileExcel className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Exportar XLSX</span>
          <span className="sm:hidden">XLSX</span>
        </Button>
        <Button onClick={handleExportPDF} variant="outline" size="sm">
          <FaFilePdf className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>

      {/* Tabela */}
            {filteredUsuarios.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm 
                      ? 'Nenhum usuário encontrado com os filtros aplicados'
                      : 'Nenhum usuário cadastrado'
                    }
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Acesso
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {usuario.nome}
                      </div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {usuario.email}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {getTipoAcessoLabel(usuario.tipo_de_acesso)}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {getNivelAcessoLabel(usuario.nivel_de_acesso)}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        usuario.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : usuario.status === 'bloqueado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(usuario.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {usuario.criado_em ? formatDate(usuario.criado_em) : 'N/A'}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex gap-1 sm:gap-2">
                        {canView('usuarios') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleViewUser(usuario)}
                      title="Visualizar"
                    >
                            <FaEye className="text-green-600 text-xs sm:text-sm" />
                          </Button>
                        )}
                    {canEdit('usuarios') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEditUser(usuario)}
                        title="Editar"
                      >
                            <FaEdit className="text-blue-600 text-xs sm:text-sm" />
                          </Button>
                    )}
                    {canDelete('usuarios') && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteUser(usuario.id)}
                        title="Excluir"
                      >
                            <FaTrash className="text-red-600 text-xs sm:text-sm" />
                          </Button>
                    )}
                      </div>
                    </td>
                </tr>
                ))}
          </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Usuário */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Usuário' : editingUsuario ? 'Editar Usuário' : 'Adicionar Usuário'}
        size="xl"
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
      <Modal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Logs de Auditoria - Usuários"
        size="xl"
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Histórico de Alterações
            </h3>
            <Button onClick={handleApplyAuditFilters} variant="outline" size="sm">
              <span className="hidden sm:inline">Atualizar</span>
              <span className="sm:hidden">Atualizar</span>
            </Button>
              </div>

          {loadingAudit ? (
            <div className="flex justify-center items-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
            <div className="max-h-64 sm:max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Campo</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Anterior</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">Novo Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {log.usuario_nome || 'Sistema'}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {getActionLabel(log.action)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {getFieldLabel(log.field_name)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-500">
                        {formatFieldValue(log.field_name, log.old_value)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-500">
                        {formatFieldValue(log.field_name, log.new_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                            </div>
                          )}
                                    </div>
        </Modal>

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