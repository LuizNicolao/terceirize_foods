import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { usuariosService } from '../services/usuarios';
import { useAuditoria } from './useAuditoria';
import { useExport } from './useExport';

const normalizeErrorMessage = (error) => {
  const message = error?.message || 'Erro ao processar solicitação';

  if (message.includes('Email já cadastrado') || message.includes('já existe')) {
    return 'Este e-mail já está sendo utilizado por outro usuário.';
  }

  return message;
};

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  const auditoria = useAuditoria('usuarios');
  const exportadores = useExport({
    entityName: 'usuarios',
    exportXLSXEndpoint: '/users/export/xlsx',
    exportPDFEndpoint: '/users/export/pdf'
  });

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuariosService.getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError(err?.message || 'Erro ao carregar usuários');
      toast.error('Erro ao carregar usuários');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        (usuario.name && usuario.name.toLowerCase().includes(term)) ||
        (usuario.email && usuario.email.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === 'todos' || usuario.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [usuarios, searchTerm, statusFilter]);

  const handleAddUser = () => {
    setEditingUsuario(null);
    setViewMode(false);
    setShowModal(true);
  };

  const loadUsuario = async (userId, mode = 'view') => {
    try {
      setModalLoading(true);
      const data = await usuariosService.getUsuario(userId);
      setEditingUsuario(data);
      setViewMode(mode === 'view');
      setShowModal(true);
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      toast.error(normalizeErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewUser = (usuario) => {
    if (!usuario?.id) return;
    loadUsuario(usuario.id, 'view');
  };

  const handleEditUser = (usuario) => {
    if (!usuario?.id) return;
    loadUsuario(usuario.id, 'edit');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingUsuario(null);
  };

  const onSubmit = async (data) => {
    const payload = { ...data };

    if (!payload.permissions) {
      payload.permissions = [];
    }

    if (!payload.password) {
      delete payload.password;
    }

    try {
      setSaving(true);

      if (editingUsuario && editingUsuario.id) {
        await usuariosService.updateUsuario(editingUsuario.id, payload);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        if (!payload.password) {
          toast.error('Senha é obrigatória para novos usuários.');
          return;
        }
        await usuariosService.createUsuario(payload);
        toast.success('Usuário criado com sucesso!');
      }

      await fetchUsuarios();
      handleCloseModal();
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      toast.error(normalizeErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (usuario) => {
    if (!usuario?.id) return;
    setUsuarioToDelete(usuario);
    setShowDeleteConfirmModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setUsuarioToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!usuarioToDelete?.id) return;

    try {
      await usuariosService.deleteUsuario(usuarioToDelete.id);
      toast.success('Usuário excluído com sucesso!');
      await fetchUsuarios();
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      toast.error(normalizeErrorMessage(err));
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
  };

  return {
    usuarios,
    filteredUsuarios,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleClearFilters,
    showModal,
    viewMode,
    editingUsuario,
    modalLoading,
    saving,
    handleAddUser,
    handleViewUser,
    handleEditUser,
    handleCloseModal,
    onSubmit,
    showDeleteConfirmModal,
    usuarioToDelete,
    handleDeleteUser,
    handleConfirmDelete,
    handleCloseDeleteModal,
    ...auditoria,
    ...exportadores
  };
};
