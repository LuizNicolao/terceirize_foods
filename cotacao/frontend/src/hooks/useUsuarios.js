import { useState, useEffect } from 'react';
import { usuariosService } from '../services/usuarios';
import { useAuditoria } from './useAuditoria';
import { useExport } from './useExport';
import toast from 'react-hot-toast';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  // Estados do Modal
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  
  // Hook de auditoria
  const auditoria = useAuditoria('usuarios');
  
  // Hook de exportação
  const { handleExportXLSX, handleExportPDF } = useExport({
    entityName: 'usuarios',
    exportXLSXEndpoint: '/users/export/xlsx',
    exportPDFEndpoint: '/users/export/pdf'
  });

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await usuariosService.getUsuarios();
      // Garantir que sempre seja um array
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError(error.message || 'Erro ao carregar usuários');
      toast.error('Erro ao carregar usuários');
      setUsuarios([]); // Garantir que seja array mesmo em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user) => {
    setEditingUsuario(user);
    setViewMode(true);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUsuario(user);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingUsuario(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUsuario(null);
    setViewMode(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingUsuario) {
        // Atualizar usuário existente
        await usuariosService.updateUsuario(editingUsuario.id, formData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await usuariosService.createUsuario(formData);
        toast.success('Usuário criado com sucesso!');
      }
      
      handleCloseModal();
      await fetchUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Erro ao salvar usuário');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await usuariosService.deleteUsuario(userId);
        await fetchUsuarios();
        toast.success('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        toast.error(error.message || 'Erro ao excluir usuário');
      }
    }
  };

  const refetch = () => {
    fetchUsuarios();
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showModal,
    viewMode,
    editingUsuario,
    handleView,
    handleEdit,
    handleCreate,
    handleDelete,
    handleCloseModal,
    handleSubmit,
    refetch,
    handleExportXLSX,
    handleExportPDF,
    ...auditoria
  };
};
