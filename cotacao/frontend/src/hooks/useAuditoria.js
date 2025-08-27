import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export const useAuditoria = (recurso) => {
  // Estados de auditoria
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    dataInicio: '',
    dataFim: '',
    acao: '',
    usuario_id: '',
    periodo: ''
  });

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      
      const params = new URLSearchParams();
      
      // Aplicar filtro de período se selecionado
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        // Usar filtros manuais se período não estiver selecionado
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para o recurso
      params.append('recurso', recurso);
      
      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  // Abrir modal de auditoria
  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    loadAuditLogs();
  };

  // Fechar modal de auditoria
  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
    setAuditLogs([]);
    setAuditFilters({
      dataInicio: '',
      dataFim: '',
      acao: '',
      usuario_id: '',
      periodo: ''
    });
  };

  // Aplicar filtros de auditoria
  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  // Exportar auditoria para XLSX
  const handleExportAuditXLSX = async () => {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros atuais
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para o recurso
      params.append('recurso', recurso);
      
      // Fazer download do arquivo
      const response = await api.get(`/auditoria/export/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_${recurso}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Exportar auditoria para PDF
  const handleExportAuditPDF = async () => {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros atuais
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para o recurso
      params.append('recurso', recurso);
      
      // Fazer download do arquivo
      const response = await api.get(`/auditoria/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_${recurso}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  return {
    // Estados
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,

    // Funções
    loadAuditLogs,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  };
};
