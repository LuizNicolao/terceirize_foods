import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuariosService } from '../services/usuarios';
import { useAuditoria } from './useAuditoria';
import { useExport } from './useExport';
import toast from 'react-hot-toast';

export const useUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
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
    toast.error('Funcionalidade de visualização ainda não implementada');
    // navigate(`/visualizar-usuario/${user.id}`);
  };

  const handleEdit = (user) => {
    toast.error('Funcionalidade de edição ainda não implementada');
    // navigate(`/editar-usuario/${user.id}`);
  };

  const handleCreate = () => {
    toast.error('Funcionalidade de criação ainda não implementada');
    // navigate('/editar-usuario/new');
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
    handleView,
    handleEdit,
    handleCreate,
    handleDelete,
    refetch,
    handleExportXLSX,
    handleExportPDF,
    ...auditoria
  };
};
