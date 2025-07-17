import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaHistory, 
  FaFileExcel, 
  FaFilePdf,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    user: ''
  });

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    status: 'Ativo'
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Erro ao carregar classes:', error);
      toast.error('Erro ao carregar classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingClass) {
        await api.put(`/classes/${editingClass.id}`, formData);
        toast.success('Classe atualizada com sucesso!');
      } else {
        await api.post('/classes', formData);
        toast.success('Classe criada com sucesso!');
      }
      
      setShowModal(false);
      setEditingClass(null);
      setFormData({ nome: '', descricao: '', status: 'Ativo' });
      loadClasses();
    } catch (error) {
      console.error('Erro ao salvar classe:', error);
      const message = error.response?.data?.message || 'Erro ao salvar classe';
      toast.error(message);
    }
  };

  const handleEdit = (classe) => {
    setEditingClass(classe);
    setFormData({
      nome: classe.nome,
      descricao: classe.descricao || '',
      status: classe.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta classe?')) {
      try {
        await api.delete(`/classes/${id}`);
        toast.success('Classe excluída com sucesso!');
        loadClasses();
      } catch (error) {
        console.error('Erro ao excluir classe:', error);
        toast.error('Erro ao excluir classe');
      }
    }
  };

  const openAuditModal = async () => {
    setShowAuditModal(true);
    await loadAuditLogs();
  };

  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const params = new URLSearchParams();
      
      if (auditFilters.startDate) params.append('startDate', auditFilters.startDate);
      if (auditFilters.endDate) params.append('endDate', auditFilters.endDate);
      if (auditFilters.action) params.append('action', auditFilters.action);
      if (auditFilters.user) params.append('user', auditFilters.user);
      params.append('table', 'classes');

      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  const exportAuditToExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.startDate) params.append('startDate', auditFilters.startDate);
      if (auditFilters.endDate) params.append('endDate', auditFilters.endDate);
      if (auditFilters.action) params.append('action', auditFilters.action);
      if (auditFilters.user) params.append('user', auditFilters.user);
      params.append('table', 'classes');

      const response = await api.get(`/auditoria/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_classes_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const exportAuditToPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.startDate) params.append('startDate', auditFilters.startDate);
      if (auditFilters.endDate) params.append('endDate', auditFilters.endDate);
      if (auditFilters.action) params.append('action', auditFilters.action);
      if (auditFilters.user) params.append('user', auditFilters.user);
      params.append('table', 'classes');

      const response = await api.get(`/auditoria/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_classes_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const filteredClasses = classes.filter(classe =>
    classe.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classe.descricao && classe.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatAuditDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action) => {
    const actions = {
      'CREATE': 'Criação',
      'UPDATE': 'Atualização',
      'DELETE': 'Exclusão'
    };
    return actions[action] || action;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
        <div className="flex gap-2">
          <button
            onClick={openAuditModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaHistory />
            Auditoria
          </button>
          <button
            onClick={() => {
              setEditingClass(null);
              setFormData({ nome: '', descricao: '', status: 'Ativo' });
              setShowModal(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus />
            Nova Classe
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Descrição</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Criado em</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Atualizado em</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((classe) => (
                <tr key={classe.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{classe.nome}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {classe.descricao || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      classe.status === 'Ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {classe.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(classe.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(classe.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(classe)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(classe.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredClasses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma classe encontrada
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingClass ? 'Editar Classe' : 'Nova Classe'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingClass(null);
                  setFormData({ nome: '', descricao: '', status: 'Ativo' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {editingClass ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClass(null);
                    setFormData({ nome: '', descricao: '', status: 'Ativo' });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Logs de Auditoria - Classes</h2>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input
                  type="date"
                  value={auditFilters.startDate}
                  onChange={(e) => setAuditFilters({ ...auditFilters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                <input
                  type="date"
                  value={auditFilters.endDate}
                  onChange={(e) => setAuditFilters({ ...auditFilters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ação</label>
                <select
                  value={auditFilters.action}
                  onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="CREATE">Criação</option>
                  <option value="UPDATE">Atualização</option>
                  <option value="DELETE">Exclusão</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input
                  type="text"
                  value={auditFilters.user}
                  onChange={(e) => setAuditFilters({ ...auditFilters, user: e.target.value })}
                  placeholder="Nome do usuário"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={loadAuditLogs}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Filtrar
              </button>
              <button
                onClick={exportAuditToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaFileExcel />
                Exportar Excel
              </button>
              <button
                onClick={exportAuditToPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaFilePdf />
                Exportar PDF
              </button>
            </div>

            {auditLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data/Hora</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Usuário</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ação</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Registro</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mudanças</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatAuditDate(log.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {log.user_name || log.user_email}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          ID: {log.record_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {log.changes ? (
                            <div className="max-w-xs">
                              {Object.entries(JSON.parse(log.changes)).map(([field, values]) => (
                                <div key={field} className="mb-1">
                                  <strong>{field}:</strong> {values.old} → {values.new}
                                </div>
                              ))}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {auditLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum log de auditoria encontrado
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes; 