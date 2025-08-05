import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Button, Table } from './ui';
import LoadingSpinner from './LoadingSpinner';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuditModal = ({ isOpen, onClose }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    acao: '',
    usuario_id: '',
    periodo: ''
  });

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        switch (filters.periodo) {
          case '7dias': dataInicio.setDate(hoje.getDate() - 7); break;
          case '30dias': dataInicio.setDate(hoje.getDate() - 30); break;
          case '90dias': dataInicio.setDate(hoje.getDate() - 90); break;
          default: break;
        }
        if (filters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        if (filters.dataInicio) params.append('data_inicio', filters.dataInicio);
        if (filters.dataFim) params.append('data_fim', filters.dataFim);
      }
      
      if (filters.acao) params.append('acao', filters.acao);
      if (filters.usuario_id) params.append('usuario_id', filters.usuario_id);
      params.append('recurso', 'filiais');
      
      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  // Exportar para XLSX
  const handleExportXLSX = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
      if (filters.dataFim) params.append('dataFim', filters.dataFim);
      if (filters.acao) params.append('acao', filters.acao);
      if (filters.usuario_id) params.append('usuario_id', filters.usuario_id);
      if (filters.periodo) params.append('periodo', filters.periodo);
      params.append('tabela', 'filiais');

      const response = await api.get(`/auditoria/export/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_filiais_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  // Exportar para PDF
  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
      if (filters.dataFim) params.append('dataFim', filters.dataFim);
      if (filters.acao) params.append('acao', filters.acao);
      if (filters.usuario_id) params.append('usuario_id', filters.usuario_id);
      if (filters.periodo) params.append('periodo', filters.periodo);
      params.append('tabela', 'filiais');

      const response = await api.get(`/auditoria/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_filiais_${new Date().toISOString().split('T')[0]}.pdf`);
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

  // Aplicar filtros
  const handleApplyFilters = () => {
    loadAuditLogs();
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({
      dataInicio: '',
      dataFim: '',
      acao: '',
      usuario_id: '',
      periodo: ''
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadAuditLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Funções auxiliares
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionLabel = (action) => {
    const labels = {
      'create': 'Criar',
      'update': 'Editar',
      'delete': 'Excluir',
      'login': 'Login'
    };
    return labels[action] || action;
  };

  const getFieldLabel = (field) => {
    const labels = {
      'codigo_filial': 'Código da Filial',
      'cnpj': 'CNPJ',
      'filial': 'Filial',
      'razao_social': 'Razão Social',
      'logradouro': 'Logradouro',
      'numero': 'Número',
      'bairro': 'Bairro',
      'cidade': 'Cidade',
      'estado': 'Estado',
      'cep': 'CEP',
      'telefone': 'Telefone',
      'email': 'E-mail',
      'status': 'Status'
    };
    return labels[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') return '-';
    
    if (field === 'status') {
      return value === 'ativo' ? 'Ativo' : 'Inativo';
    }
    
    if (field === 'cnpj') {
      return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Relatório de Auditoria - Filiais</h2>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportXLSX}
              title="Exportar para Excel"
            >
              <FaFileExcel className="mr-1" />
              Excel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportPDF}
              title="Exportar para PDF"
            >
              <FaFilePdf className="mr-1" />
              PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters({...filters, dataInicio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters({...filters, dataFim: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação
              </label>
              <select
                value={filters.acao}
                onChange={(e) => setFilters({...filters, acao: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todas as ações</option>
                <option value="create">Criar</option>
                <option value="update">Editar</option>
                <option value="delete">Excluir</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={filters.periodo}
                onChange={(e) => setFilters({...filters, periodo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Período personalizado</option>
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="90dias">Últimos 90 dias</option>
                <option value="todos">Todos os registros</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyFilters}
              >
                Aplicar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
              >
                Limpar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {loading ? (
            <LoadingSpinner inline={true} text="Carregando logs..." />
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum log encontrado com os filtros aplicados
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                {auditLogs.length} log(s) encontrado(s)
              </div>
              {auditLogs.map((log, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 mb-4 bg-white"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.acao === 'create' ? 'bg-green-100 text-green-800' : 
                        log.acao === 'update' ? 'bg-yellow-100 text-yellow-800' : 
                        log.acao === 'delete' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getActionLabel(log.acao)}
                      </span>
                      <span className="text-sm text-gray-600">
                        por {log.usuario_nome || 'Usuário desconhecido'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  
                  {log.detalhes && (
                    <div className="text-sm text-gray-700">
                      {log.detalhes.changes && (
                        <div className="mb-3">
                          <strong className="text-gray-900">Mudanças Realizadas:</strong>
                          <div className="mt-2 space-y-2">
                            {Object.entries(log.detalhes.changes).map(([field, change]) => (
                              <div key={field} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <div className="font-medium text-gray-900 mb-1">
                                  {getFieldLabel(field)}:
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-red-700">
                                    <strong>Antes:</strong> {formatFieldValue(field, change.from)}
                                  </span>
                                  <span className="text-gray-500">→</span>
                                  <span className="text-green-700">
                                    <strong>Depois:</strong> {formatFieldValue(field, change.to)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {log.detalhes.requestBody && !log.detalhes.changes && (
                        <div>
                          <strong className="text-gray-900">Dados da Filial:</strong>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(log.detalhes.requestBody).map(([field, value]) => (
                              <div key={field} className="p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                                <div className="font-medium text-gray-900 mb-1">
                                  {getFieldLabel(field)}:
                                </div>
                                <div className="text-green-700">
                                  {formatFieldValue(field, value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {log.detalhes.resourceId && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                          <strong className="text-blue-900">ID da Filial:</strong> 
                          <span className="text-blue-700 ml-1">
                            #{log.detalhes.resourceId}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditModal; 