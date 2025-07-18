import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaTruck, FaQuestionCircle, FaFileExcel, FaFilePdf, FaUpload, FaTimes, FaInfoCircle, FaWhatsapp } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import * as XLSX from 'xlsx';

const Container = styled.div`
  padding: 24px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  color: var(--dark-gray);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const AddButton = styled.button`
  background: var(--primary-green);
  color: var(--white);
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--dark-green);
    transform: translateY(-1px);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const ClearButton = styled.button`
  background: var(--gray);
  color: var(--white);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--dark-gray);
    transform: translateY(-1px);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--white);
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 12px 12px;
`;

const PaginationInfo = styled.div`
  color: var(--dark-gray);
  font-size: 14px;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  background: var(--white);
  color: var(--dark-gray);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  min-width: 40px;

  &:hover:not(:disabled) {
    background: var(--primary-green);
    color: var(--white);
    border-color: var(--primary-green);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: var(--primary-green);
    color: var(--white);
    border-color: var(--primary-green);
  }
`;

const PageSizeSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: var(--white);
  color: var(--dark-gray);
  font-size: 14px;
  cursor: pointer;
  margin-left: 16px;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const TableContainer = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f5f5f5;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
`;

const SortableTh = styled.th`
  background-color: #f5f5f5;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background-color: #e8e8e8;
    color: var(--primary-green);
  }

  &.asc, &.desc {
    background-color: #e8f5e8;
    color: var(--primary-green);
    font-weight: 700;
  }

  &::after {
    content: '';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    opacity: 0.3;
  }

  &.asc::after {
    border-bottom: 6px solid var(--primary-green);
    opacity: 1;
  }

  &.desc::after {
    border-top: 6px solid var(--primary-green);
    opacity: 1;
  }
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: var(--dark-gray);
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.status === 'ativo' ? 'var(--success-green)' : '#ffebee'};
  color: ${props => props.status === 'ativo' ? 'white' : 'var(--error-red)'};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-right: 8px;
  color: var(--gray);

  &:hover {
    background-color: var(--light-gray);
  }

  &.edit {
    color: var(--blue);
  }

  &.delete {
    color: var(--error-red);
  }

  &.view {
    color: var(--primary-green);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 90vw;
  width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  grid-column: 1 / -1;
`;

const ModalTitle = styled.h2`
  color: var(--dark-gray);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--gray);
  padding: 4px;

  &:hover {
    color: var(--error-red);
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-height: calc(95vh - 120px);
  overflow-y: auto;
  padding-right: 8px;

  /* Estilizar scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary-green);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--dark-green);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  color: var(--dark-gray);
  font-weight: 600;
  font-size: 13px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: var(--white);
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  grid-column: 1 / -1;
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: var(--primary-green);
    color: var(--white);

    &:hover {
      background: var(--dark-green);
    }
  }

  &.secondary {
    background: var(--gray);
    color: var(--white);

    &:hover {
      background: var(--dark-gray);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: var(--gray);
`;

const PhoneLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-green);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 6px;
  
  &:hover {
    background: rgba(0, 114, 62, 0.1);
    color: var(--dark-green);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const WhatsAppIcon = styled(FaWhatsapp)`
  font-size: 14px;
  color: #25D366;
  transition: all 0.3s ease;
  
  ${PhoneLink}:hover & {
    transform: scale(1.1);
  }
`;

const Fornecedores = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
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
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues
  } = useForm();

  // Carregar fornecedores
  const loadFornecedores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/fornecedores');
      setFornecedores(response.data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      toast.error('Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFornecedores();
  }, []);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchField, statusFilter, itemsPerPage]);

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
      
      // Adicionar filtro específico para fornecedores
      params.append('recurso', 'fornecedores');
      
      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
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
  const handleExportXLSX = async () => {
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
      
      // Adicionar filtro específico para fornecedores
      params.append('recurso', 'fornecedores');
      
      // Fazer download do arquivo
      const response = await api.get(`/auditoria/export/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_fornecedores_${new Date().toISOString().split('T')[0]}.xlsx`);
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
  const handleExportPDF = async () => {
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
      
      // Adicionar filtro específico para fornecedores
      params.append('recurso', 'fornecedores');
      
      // Fazer download do arquivo
      const response = await api.get(`/auditoria/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_fornecedores_${new Date().toISOString().split('T')[0]}.pdf`);
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

  // Importar fornecedores via Excel
  const handleImportExcel = async (file) => {
    try {
      setImportLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            toast.error('Arquivo deve ter pelo menos um cabeçalho e uma linha de dados');
            setImportLoading(false);
            return;
          }
          
          // Função para tentar corrigir CNPJ
          const tentarCorrigirCNPJ = (valor) => {
            if (!valor) return null;
            
            let cnpj = valor.toString().trim();
            
            // Remover todos os caracteres não numéricos
            cnpj = cnpj.replace(/\D/g, '');
            
            // Se tem exatamente 14 dígitos, está correto
            if (cnpj.length === 14) {
              return cnpj;
            }
            
            // Tentar adicionar zeros à esquerda se for muito curto
            if (cnpj.length < 14 && cnpj.length >= 10) {
              const cnpjCorrigido = cnpj.padStart(14, '0');
              console.log(`🔧 Tentando corrigir CNPJ: ${valor} -> ${cnpjCorrigido}`);
              return cnpjCorrigido;
            }
            
            // Tentar remover dígitos extras se for muito longo
            if (cnpj.length > 14 && cnpj.length <= 18) {
              const cnpjCorrigido = cnpj.substring(0, 14);
              console.log(`🔧 Tentando corrigir CNPJ: ${valor} -> ${cnpjCorrigido}`);
              return cnpjCorrigido;
            }
            
            return null;
          };

          // Extrair CNPJs da planilha (primeira coluna ou coluna com CNPJ)
          const cnpjs = [];
          const cnpjsInvalidos = [];
          const cnpjsCorrigidos = [];
          const headers = jsonData[0];
          
          console.log('📊 Headers encontrados:', headers);
          
          // Encontrar a coluna que contém CNPJs
          let cnpjColumnIndex = 0; // Padrão: primeira coluna
          
          // Procurar por coluna com "cnpj" no cabeçalho
          headers.forEach((header, index) => {
            if (header && header.toString().toLowerCase().includes('cnpj')) {
              cnpjColumnIndex = index;
              console.log(`🎯 Coluna CNPJ encontrada no índice ${index}: "${header}"`);
            }
          });
          
          console.log(`📋 Usando coluna ${cnpjColumnIndex} para extrair CNPJs`);
          console.log(`📄 Total de linhas de dados: ${jsonData.length - 1}`);
          
          // Verificar se há linhas vazias ou com dados inconsistentes
          let linhasVazias = 0;
          let linhasComDados = 0;
          
          jsonData.slice(1).forEach((row, rowIndex) => {
            if (row && row.length > 0) {
              const temDados = row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '');
              if (temDados) {
                linhasComDados++;
              } else {
                linhasVazias++;
              }
            } else {
              linhasVazias++;
            }
          });
          
          console.log(`📊 Análise das linhas:`);
          console.log(`   - Linhas com dados: ${linhasComDados}`);
          console.log(`   - Linhas vazias: ${linhasVazias}`);
          console.log(`   - Total esperado: ${linhasComDados + linhasVazias}`);
          
          // Extrair CNPJs da coluna identificada
          jsonData.slice(1).forEach((row, rowIndex) => {
            const cnpjValue = row[cnpjColumnIndex];
            const linhaReal = rowIndex + 2;
            
            if (cnpjValue && cnpjValue.toString().trim() !== '') {
              // Tentar corrigir CNPJ primeiro
              const cnpjCorrigido = tentarCorrigirCNPJ(cnpjValue);
              
              if (cnpjCorrigido) {
                cnpjs.push({
                  original: cnpjValue.toString(),
                  limpo: cnpjCorrigido,
                  linha: linhaReal,
                  foiCorrigido: cnpjCorrigido !== cnpjValue.toString().replace(/\D/g, '')
                });
                
                if (cnpjCorrigido !== cnpjValue.toString().replace(/\D/g, '')) {
                  cnpjsCorrigidos.push({
                    original: cnpjValue.toString(),
                    corrigido: cnpjCorrigido,
                    linha: linhaReal
                  });
                }
              } else {
                // Registrar CNPJs inválidos para análise
                const cnpjLimpo = cnpjValue.toString().replace(/\D/g, '');
                cnpjsInvalidos.push({
                  original: cnpjValue.toString(),
                  limpo: cnpjLimpo,
                  linha: linhaReal,
                  motivo: cnpjLimpo.length < 14 ? 'Muito curto' : 'Muito longo'
                });
                console.warn(`❌ CNPJ inválido na linha ${linhaReal}: "${cnpjValue}" (${cnpjLimpo.length} dígitos)`);
              }
            } else {
              console.warn(`⚠️  Linha ${linhaReal} vazia ou sem CNPJ`);
            }
          });
          
          console.log(`✅ CNPJs válidos encontrados: ${cnpjs.length}`);
          console.log(`🔧 CNPJs corrigidos: ${cnpjsCorrigidos.length}`);
          console.log(`❌ CNPJs inválidos encontrados: ${cnpjsInvalidos.length}`);
          
          // Mostrar alguns exemplos de CNPJs corrigidos
          if (cnpjsCorrigidos.length > 0) {
            console.log('🔧 Exemplos de CNPJs corrigidos:');
            cnpjsCorrigidos.slice(0, 5).forEach(cnpj => {
              console.log(`   Linha ${cnpj.linha}: "${cnpj.original}" -> ${cnpj.corrigido}`);
            });
          }
          
          // Mostrar alguns exemplos de CNPJs inválidos para debug
          if (cnpjsInvalidos.length > 0) {
            console.log('🔍 Exemplos de CNPJs inválidos:');
            cnpjsInvalidos.slice(0, 5).forEach(cnpj => {
              console.log(`   Linha ${cnpj.linha}: "${cnpj.original}" -> ${cnpj.limpo} (${cnpj.motivo})`);
            });
          }
          
          if (cnpjs.length === 0) {
            toast.error('Nenhum CNPJ válido encontrado no arquivo');
            setImportLoading(false);
            return;
          }
          
          // Inicializar resultados
          const resultados = {
            total: cnpjs.length,
            sucessos: 0,
            erros: 0,
            detalhes: {
              sucessos: [],
              erros: []
            }
          };
          
          // Processar cada CNPJ
          for (let i = 0; i < cnpjs.length; i++) {
            const cnpj = cnpjs[i];
            
            try {
              // Buscar dados do CNPJ usando a API existente
              const response = await api.get(`/fornecedores/buscar-cnpj/${cnpj.limpo}`);
              
              if (response.data.success && response.data.data) {
                const dadosCNPJ = response.data.data;
                
                // Preparar dados para cadastro
                const dadosFornecedor = {
                  cnpj: cnpj.limpo,
                  razao_social: dadosCNPJ.razao_social || '',
                  nome_fantasia: dadosCNPJ.nome_fantasia || '',
                  logradouro: dadosCNPJ.logradouro || '',
                  numero: dadosCNPJ.numero || '',
                  bairro: dadosCNPJ.bairro || '',
                  municipio: dadosCNPJ.municipio || '',
                  uf: dadosCNPJ.uf || '',
                  cep: dadosCNPJ.cep || '',
                  telefone: dadosCNPJ.telefone || '',
                  email: dadosCNPJ.email || '',
                  status: 1 // Ativo por padrão
                };
                
                // Cadastrar fornecedor
                const createResponse = await api.post('/fornecedores', dadosFornecedor);
                
                resultados.sucessos++;
                resultados.detalhes.sucessos.push({
                  cnpj: cnpj.original,
                  razao_social: dadosCNPJ.razao_social,
                  linha: cnpj.linha
                });
                
                // Mostrar progresso
                toast.success(`CNPJ ${cnpj.original} importado com sucesso! (${i + 1}/${cnpjs.length})`, {
                  duration: 2000
                });
                
              } else {
                resultados.erros++;
                resultados.detalhes.erros.push({
                  cnpj: cnpj.original,
                  erro: 'CNPJ não encontrado ou dados indisponíveis',
                  linha: cnpj.linha
                });
                
                toast.error(`CNPJ ${cnpj.original} não encontrado (${i + 1}/${cnpjs.length})`, {
                  duration: 2000
                });
              }
              
            } catch (error) {
              resultados.erros++;
              let erroMsg = 'Erro desconhecido';
              
              if (error.response?.status === 400 && error.response?.data?.error === 'CNPJ já cadastrado') {
                erroMsg = 'CNPJ já cadastrado no sistema';
              } else if (error.response?.status === 404) {
                erroMsg = 'CNPJ não encontrado';
              } else if (error.response?.status === 503) {
                erroMsg = 'Serviço de consulta indisponível';
              } else if (error.code === 'ECONNABORTED') {
                erroMsg = 'Timeout na consulta';
              }
              
              resultados.detalhes.erros.push({
                cnpj: cnpj.original,
                erro: erroMsg,
                linha: cnpj.linha
              });
              
              toast.error(`Erro ao processar CNPJ ${cnpj.original}: ${erroMsg} (${i + 1}/${cnpjs.length})`, {
                duration: 2000
              });
            }
            
            // Pequena pausa entre as consultas para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Definir resultados finais
          setImportResults({
            resultados,
            mensagem: `Importação concluída! ${resultados.sucessos} fornecedores importados com sucesso e ${resultados.erros} erros.`,
            estatisticas: {
              totalLinhas: jsonData.length - 1,
              linhasComDados: linhasComDados,
              linhasVazias: linhasVazias,
              cnpjsValidos: cnpjs.length,
              cnpjsCorrigidos: cnpjsCorrigidos.length,
              cnpjsInvalidos: cnpjsInvalidos.length,
              cnpjsProcessados: resultados.total
            }
          });
          setShowImportModal(true);
          
          // Recarregar lista se houve sucessos
          if (resultados.sucessos > 0) {
            loadFornecedores();
          }
          
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          toast.error('Erro ao processar arquivo Excel');
        } finally {
          setImportLoading(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      toast.error('Erro ao importar arquivo');
      setImportLoading(false);
    }
  };

  // Abrir modal de importação
  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setImportResults(null);
  };

  // Fechar modal de importação
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportResults(null);
  };

  // Selecionar arquivo para importação
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')) {
        handleImportExcel(file);
      } else {
        toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      }
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Obter label da ação
  const getActionLabel = (action) => {
    const actions = {
      'create': 'Criar',
      'update': 'Editar',
      'delete': 'Excluir',
      'login': 'Login',
      'logout': 'Logout',
      'view': 'Visualizar'
    };
    return actions[action] || action;
  };

  // Obter label do campo
  const getFieldLabel = (field) => {
    const labels = {
      'razao_social': 'Razão Social',
      'nome_fantasia': 'Nome Fantasia',
      'cnpj': 'CNPJ',
      'email': 'Email',
      'telefone': 'Telefone',
      'logradouro': 'Logradouro',
      'numero': 'Número',
      'bairro': 'Bairro',
      'municipio': 'Município',
      'uf': 'UF',
      'cep': 'CEP',
      'status': 'Status'
    };
    return labels[field] || field;
  };

  // Formatar valor do campo
  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return 'Não informado';
    }

    switch (field) {
      case 'cnpj':
        return formatCNPJ(value);
      case 'telefone':
        return formatPhone(value);
      case 'status':
        return value === 1 ? 'Ativo' : 'Inativo';
      case 'email':
        return value;
      default:
        return value;
    }
  };

  // Abrir modal para adicionar fornecedor
  const handleAddFornecedor = () => {
    setEditingFornecedor(null);
    reset();
    setValue('status', '1'); // Define status como "Ativo" por padrão
    setShowModal(true);
  };

  // Abrir modal para visualizar fornecedor
  const handleViewFornecedor = (fornecedor) => {
    setEditingFornecedor(fornecedor);
    setValue('razao_social', fornecedor.razao_social);
    setValue('nome_fantasia', fornecedor.nome_fantasia);
    setValue('cnpj', fornecedor.cnpj);
    setValue('telefone', fornecedor.telefone);
    setValue('email', fornecedor.email);
    setValue('logradouro', fornecedor.logradouro);
    setValue('numero', fornecedor.numero);
    setValue('bairro', fornecedor.bairro);
    setValue('municipio', fornecedor.municipio);
    setValue('uf', fornecedor.uf);
    setValue('cep', fornecedor.cep);
    setValue('status', fornecedor.status);
    setIsViewMode(true);
    setShowModal(true);
  };

  // Abrir modal para editar fornecedor
  const handleEditFornecedor = (fornecedor) => {
    setEditingFornecedor(fornecedor);
    setValue('razao_social', fornecedor.razao_social);
    setValue('nome_fantasia', fornecedor.nome_fantasia);
    setValue('cnpj', fornecedor.cnpj);
    setValue('telefone', fornecedor.telefone);
    setValue('email', fornecedor.email);
    setValue('logradouro', fornecedor.logradouro);
    setValue('numero', fornecedor.numero);
    setValue('bairro', fornecedor.bairro);
    setValue('municipio', fornecedor.municipio);
    setValue('uf', fornecedor.uf);
    setValue('cep', fornecedor.cep);
    setValue('status', fornecedor.status);
    setIsViewMode(false);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFornecedor(null);
    setIsViewMode(false);
    reset();
  };

  // Salvar fornecedor
  const onSubmit = async (data) => {
    try {
      if (editingFornecedor) {
        // Para edição, enviar apenas os campos que foram alterados
        const updateData = {};
        
        if (data.razao_social !== editingFornecedor.razao_social) {
          updateData.razao_social = data.razao_social;
        }
        
        if (data.nome_fantasia !== editingFornecedor.nome_fantasia) {
          updateData.nome_fantasia = data.nome_fantasia;
        }
        
        if (data.cnpj !== editingFornecedor.cnpj) {
          updateData.cnpj = data.cnpj;
        }
        
        if (data.email !== editingFornecedor.email) {
          updateData.email = data.email;
        }
        
        if (data.telefone !== editingFornecedor.telefone) {
          updateData.telefone = data.telefone;
        }
        
        if (data.uf !== editingFornecedor.uf) {
          updateData.uf = data.uf;
        }
        
        if (data.municipio !== editingFornecedor.municipio) {
          updateData.municipio = data.municipio;
        }
        
        if (data.status !== editingFornecedor.status) {
          updateData.status = parseInt(data.status);
        }
        
        // Se não há campos para atualizar, mostrar erro
        if (Object.keys(updateData).length === 0) {
          toast.error('Nenhum campo foi alterado');
          return;
        }
        
        await api.put(`/fornecedores/${editingFornecedor.id}`, updateData);
        toast.success('Fornecedor atualizado com sucesso!');
      } else {
        // Para criação, enviar todos os campos
        const createData = { ...data };
        if (createData.status) {
          createData.status = parseInt(createData.status);
        }
        await api.post('/fornecedores', createData);
        toast.success('Fornecedor criado com sucesso!');
      }
      
      handleCloseModal();
      loadFornecedores();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar fornecedor');
    }
  };

  // Excluir fornecedor
  const handleDeleteFornecedor = async (fornecedorId) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await api.delete(`/fornecedores/${fornecedorId}`);
        toast.success('Fornecedor excluído com sucesso!');
        loadFornecedores();
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        toast.error(error.response?.data?.error || 'Erro ao excluir fornecedor');
      }
    }
  };

  // Função para ordenar fornecedores
  const sortFornecedores = (fornecedores) => {
    return fornecedores.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Tratar diferentes tipos de dados
      if (sortField === 'id' || sortField === 'status') {
        // Para números, converter para número
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
        
        if (sortDirection === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      } else if (sortField === 'cnpj' || sortField === 'telefone') {
        // Para CNPJ e telefone, remover formatação antes de comparar
        aValue = String(aValue).replace(/\D/g, '').toLowerCase();
        bValue = String(bValue).replace(/\D/g, '').toLowerCase();

        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue, 'pt-BR');
        } else {
          return bValue.localeCompare(aValue, 'pt-BR');
        }
      } else if (sortField === 'municipio') {
        // Para cidade/estado, ordenar primeiro por cidade, depois por estado
        const aCidade = String(a.municipio || '').toLowerCase();
        const bCidade = String(b.municipio || '').toLowerCase();
        const aEstado = String(a.uf || '').toLowerCase();
        const bEstado = String(b.uf || '').toLowerCase();

        if (sortDirection === 'asc') {
          const cidadeCompare = aCidade.localeCompare(bCidade, 'pt-BR');
          if (cidadeCompare !== 0) return cidadeCompare;
          return aEstado.localeCompare(bEstado, 'pt-BR');
        } else {
          const cidadeCompare = bCidade.localeCompare(aCidade, 'pt-BR');
          if (cidadeCompare !== 0) return cidadeCompare;
          return bEstado.localeCompare(aEstado, 'pt-BR');
        }
      } else {
        // Para texto, converter para string e usar localeCompare
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();

        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue, 'pt-BR');
        } else {
          return bValue.localeCompare(aValue, 'pt-BR');
        }
      }
    });
  };

  // Função para lidar com ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Função para limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchField('todos');
    setStatusFilter('todos');
    setCurrentPage(1); // Reset para primeira página
  };

  // Filtrar e ordenar fornecedores
  const filteredFornecedores = useMemo(() => {
    return sortFornecedores(
      fornecedores.filter(fornecedor => {
        let matchesSearch = true;
        
        if (searchTerm) {
          switch (searchField) {
            case 'id':
              matchesSearch = fornecedor.id?.toString().includes(searchTerm);
              break;
            case 'razao_social':
              matchesSearch = fornecedor.razao_social?.toLowerCase().includes(searchTerm.toLowerCase());
              break;
            case 'nome_fantasia':
              matchesSearch = fornecedor.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase());
              break;
            case 'cnpj':
              matchesSearch = fornecedor.cnpj?.includes(searchTerm);
              break;
            case 'email':
              matchesSearch = fornecedor.email?.toLowerCase().includes(searchTerm.toLowerCase());
              break;
            case 'telefone':
              matchesSearch = fornecedor.telefone?.includes(searchTerm);
              break;
            case 'municipio':
              matchesSearch = fornecedor.municipio?.toLowerCase().includes(searchTerm.toLowerCase());
              break;
            case 'uf':
              matchesSearch = fornecedor.uf?.toLowerCase().includes(searchTerm.toLowerCase());
              break;
            case 'todos':
            default:
              matchesSearch = fornecedor.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             fornecedor.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             fornecedor.cnpj?.includes(searchTerm) ||
                             fornecedor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             fornecedor.telefone?.includes(searchTerm) ||
                             fornecedor.municipio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             fornecedor.uf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             fornecedor.id?.toString().includes(searchTerm);
              break;
          }
        }
        
        const matchesStatus = statusFilter === 'todos' || fornecedor.status === parseInt(statusFilter);
        return matchesSearch && matchesStatus;
      })
    );
  }, [fornecedores, searchTerm, searchField, statusFilter, sortField, sortDirection]);

  // Calcular dados da paginação
  const paginationData = useMemo(() => {
    const totalItems = filteredFornecedores.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredFornecedores.slice(startIndex, endIndex);
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentItems
    };
  }, [filteredFornecedores, currentPage, itemsPerPage]);

  const { totalItems, totalPages, startIndex, endIndex, currentItems } = paginationData;

  // Função para mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Função para ir para primeira página
  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  // Função para ir para última página
  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  // Função para ir para página anterior
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Função para ir para próxima página
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Gerar array de páginas para exibir
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Se temos poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Se temos muitas páginas, mostrar apenas algumas
      if (currentPage <= 3) {
        // Páginas iniciais
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Páginas finais
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Páginas do meio
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [totalPages, currentPage]);

  // Formatar CNPJ
  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Formatar telefone
  const formatPhone = (phone) => {
    if (!phone) return '';
    
    // Remover "undefined" se estiver concatenado
    let telefoneLimpo = phone.toString().replace(/undefined/g, '');
    
    // Remover todos os caracteres não numéricos
    telefoneLimpo = telefoneLimpo.replace(/\D/g, '');
    
    // Se não tem dígitos suficientes, retornar como está
    if (telefoneLimpo.length < 10) {
      return phone;
    }
    
    // Formatar baseado no tamanho
    if (telefoneLimpo.length === 11) {
      return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefoneLimpo.length === 10) {
      return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Para outros tamanhos, retornar apenas os números
      return telefoneLimpo;
    }
  };

  // Formatar CNPJ para exibição
  const formatCNPJDisplay = (cnpj) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  };

  // Formatar CNPJ para input
  const formatCNPJInput = (cnpj) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length <= 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  };

  // Validar CNPJ
  const validarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    let peso = 2;
    
    // Primeiro dígito verificador
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    
    if (parseInt(cnpjLimpo.charAt(12)) !== digito1) return false;
    
    // Segundo dígito verificador
    soma = 0;
    peso = 2;
    
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    
    return parseInt(cnpjLimpo.charAt(13)) === digito2;
  };

  // Buscar dados do CNPJ via API
  const buscarDadosCNPJ = async (cnpj) => {
    try {
      setCnpjLoading(true);
      
      // Limpar CNPJ (remover pontos, traços e barras)
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      
      if (cnpjLimpo.length !== 14) {
        toast.error('CNPJ deve ter 14 dígitos');
        return;
      }

      if (!validarCNPJ(cnpj)) {
        toast.error('CNPJ inválido');
        return;
      }

      // Usar a rota do backend para evitar problemas de CORS
      const response = await api.get(`/fornecedores/buscar-cnpj/${cnpjLimpo}`);
      
      if (response.data.success && response.data.data) {
        const result = response.data.data;
        
        // Preencher os campos automaticamente
        setValue('razao_social', result.razao_social || '');
        setValue('nome_fantasia', result.nome_fantasia || '');
        setValue('cnpj', formatCNPJDisplay(cnpjLimpo));
        setValue('logradouro', result.logradouro || '');
        setValue('numero', result.numero || '');
        setValue('bairro', result.bairro || '');
        setValue('municipio', result.municipio || '');
        setValue('uf', result.uf || '');
        setValue('cep', result.cep || '');
        
        // Se há telefone, formatar
        if (result.telefone) {
          // Usar a função formatPhone para garantir consistência
          const telefoneFormatado = formatPhone(result.telefone);
          setValue('telefone', telefoneFormatado);
        }
        
        // Se há email
        if (result.email) {
          setValue('email', result.email);
        }
        
        toast.success('Dados do CNPJ carregados com sucesso!');
      } else {
        toast.error('CNPJ não encontrado ou dados indisponíveis');
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      if (error.response?.status === 404) {
        toast.error('CNPJ não encontrado ou dados indisponíveis');
      } else if (error.response?.status === 503) {
        toast.error('Serviço de consulta CNPJ temporariamente indisponível. Tente novamente em alguns minutos.');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error('Tempo limite excedido. O serviço pode estar sobrecarregado. Tente novamente.');
      } else {
        toast.error('Erro ao buscar dados do CNPJ. Tente novamente.');
      }
    } finally {
      setCnpjLoading(false);
    }
  };

  // Função para lidar com mudança no campo CNPJ
  const handleCNPJChange = (e) => {
    const value = e.target.value;
    const formatted = formatCNPJInput(value);
    setValue('cnpj', formatted);
    
    // Se o CNPJ está completo (14 dígitos), buscar dados automaticamente
    const cnpjLimpo = value.replace(/\D/g, '');
    if (cnpjLimpo.length === 14 && !editingFornecedor) {
      // Validar CNPJ antes de buscar
      if (validarCNPJ(formatted)) {
        // Aguardar um pouco para o usuário terminar de digitar
        setTimeout(() => {
          buscarDadosCNPJ(formatted);
        }, 1000);
      } else {
        toast.error('CNPJ inválido');
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <div>Carregando fornecedores...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Fornecedores</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          {canCreate('fornecedores') && (
            <>
              <AddButton 
                onClick={() => fileInputRef.current?.click()}
                style={{ background: 'var(--orange)', fontSize: '12px', padding: '8px 12px' }}
                disabled={importLoading}
                title="Importar planilha com CNPJs - busca dados automaticamente"
              >
                <FaUpload />
                {importLoading ? 'Importando...' : 'Importar por CNPJ'}
              </AddButton>
              <AddButton onClick={handleAddFornecedor}>
                <FaPlus />
                Adicionar Fornecedor
              </AddButton>
            </>
          )}
        </div>
      </Header>

      <SearchContainer>
        <FilterSelect
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="todos">Todos os campos</option>
          <option value="id">ID</option>
          <option value="razao_social">Razão Social</option>
          <option value="nome_fantasia">Nome Fantasia</option>
          <option value="cnpj">CNPJ</option>
          <option value="email">Email</option>
          <option value="telefone">Telefone</option>
          <option value="municipio">Cidade</option>
          <option value="uf">Estado</option>
        </FilterSelect>
        <SearchInput
          type="text"
          placeholder={
            searchField === 'todos' ? 'Buscar em todos os campos...' :
            searchField === 'id' ? 'Buscar por ID...' :
            searchField === 'razao_social' ? 'Buscar por razão social...' :
            searchField === 'nome_fantasia' ? 'Buscar por nome fantasia...' :
            searchField === 'cnpj' ? 'Buscar por CNPJ...' :
            searchField === 'email' ? 'Buscar por email...' :
            searchField === 'telefone' ? 'Buscar por telefone...' :
            searchField === 'municipio' ? 'Buscar por cidade...' :
            searchField === 'uf' ? 'Buscar por estado...' :
            'Buscar...'
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </FilterSelect>
        {(searchTerm || searchField !== 'todos' || statusFilter !== 'todos') && (
          <ClearButton onClick={handleClearFilters}>
            <FaTimes />
            Limpar Filtros
          </ClearButton>
        )}
      </SearchContainer>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <SortableTh 
                onClick={() => handleSort('id')}
                className={sortField === 'id' ? sortDirection : ''}
              >
                ID {sortField === 'id' && <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                  ({sortDirection === 'asc' ? '↑' : '↓'})
                </span>}
              </SortableTh>
              <SortableTh 
                onClick={() => handleSort('razao_social')}
                className={sortField === 'razao_social' ? sortDirection : ''}
              >
                Nome {sortField === 'razao_social' && <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                  ({sortDirection === 'asc' ? '↑' : '↓'})
                </span>}
              </SortableTh>
              <SortableTh 
                onClick={() => handleSort('cnpj')}
                className={sortField === 'cnpj' ? sortDirection : ''}
              >
                CNPJ {sortField === 'cnpj' && <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                  ({sortDirection === 'asc' ? '↑' : '↓'})
                </span>}
              </SortableTh>
              <SortableTh 
                onClick={() => handleSort('telefone')}
                className={sortField === 'telefone' ? sortDirection : ''}
              >
                Telefone {sortField === 'telefone' && <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                  ({sortDirection === 'asc' ? '↑' : '↓'})
                </span>}
              </SortableTh>
              <SortableTh 
                onClick={() => handleSort('email')}
                className={sortField === 'email' ? sortDirection : ''}
              >
                Email {sortField === 'email' && <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                  ({sortDirection === 'asc' ? '↑' : '↓'})
                </span>}
              </SortableTh>
              <SortableTh 
                onClick={() => handleSort('municipio')}
                className={sortField === 'municipio' ? sortDirection : ''}
              >
                Cidade/Estado {sortField === 'municipio' && <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                  ({sortDirection === 'asc' ? '↑' : '↓'})
                </span>}
              </SortableTh>
              <SortableTh 
                onClick={() => handleSort('status')}
                className={sortField === 'status' ? sortDirection : ''}
              >
                Status {sortField === 'status' && <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                  ({sortDirection === 'asc' ? '↑' : '↓'})
                </span>}
              </SortableTh>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredFornecedores.length === 0 ? (
              <tr>
                <Td colSpan="8">
                  <EmptyState>
                    {searchTerm || searchField !== 'todos' || statusFilter !== 'todos' 
                      ? 'Nenhum fornecedor encontrado com os filtros aplicados'
                      : 'Nenhum fornecedor cadastrado'
                    }
                  </EmptyState>
                </Td>
              </tr>
            ) : (
              currentItems.map((fornecedor) => (
                <tr key={fornecedor.id}>
                  <Td>{fornecedor.id}</Td>
                  <Td>{fornecedor.razao_social}</Td>
                  <Td>{formatCNPJ(fornecedor.cnpj)}</Td>
                  <Td>
                    {fornecedor.telefone ? (
                      <PhoneLink 
                        href={`https://wa.me/55${fornecedor.telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir no WhatsApp"
                      >
                        {formatPhone(fornecedor.telefone)}
                        <WhatsAppIcon />
                      </PhoneLink>
                    ) : (
                      '-'
                    )}
                  </Td>
                  <Td>{fornecedor.email}</Td>
                  <Td>{fornecedor.municipio}/{fornecedor.uf}</Td>
                  <Td>
                    <StatusBadge status={fornecedor.status === 1 ? 'ativo' : 'inativo'}>
                      {fornecedor.status === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleViewFornecedor(fornecedor)}
                    >
                      <FaEye />
                    </ActionButton>
                    {canEdit('fornecedores') && (
                      <ActionButton
                        className="edit"
                        title="Editar"
                        onClick={() => handleEditFornecedor(fornecedor)}
                      >
                        <FaEdit />
                      </ActionButton>
                    )}
                    {canDelete('fornecedores') && (
                      <ActionButton
                        className="delete"
                        title="Excluir"
                        onClick={() => handleDeleteFornecedor(fornecedor.id)}
                      >
                        <FaTrash />
                      </ActionButton>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      {totalItems > 0 && (
        <PaginationContainer>
          <PaginationInfo>
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} fornecedores 
            {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
          </PaginationInfo>
          
          <PaginationControls>
            <PageSizeSelect
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </PageSizeSelect>
            
            <PageButton 
              onClick={handleFirstPage} 
              disabled={currentPage === 1}
              title="Primeira página"
            >
              «
            </PageButton>
            
            <PageButton 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              title="Página anterior"
            >
              ‹
            </PageButton>

            {pageNumbers.map((page, index) => (
              <PageButton
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                className={page === currentPage ? 'active' : ''}
                disabled={page === '...'}
                style={page === '...' ? { cursor: 'default', border: 'none', background: 'transparent' } : {}}
              >
                {page}
              </PageButton>
            ))}

            <PageButton 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              title="Próxima página"
            >
              ›
            </PageButton>
            
            <PageButton 
              onClick={handleLastPage} 
              disabled={currentPage === totalPages}
              title="Última página"
            >
              »
            </PageButton>
          </PaginationControls>
        </PaginationContainer>
      )}

      {/* Input file oculto para importação */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
      />

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {isViewMode ? 'Visualizar Fornecedor' : editingFornecedor ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Razão Social *</Label>
                <Input
                  type="text"
                  placeholder="Razão social da empresa"
                  disabled={isViewMode}
                  {...register('razao_social', { required: 'Razão social é obrigatória' })}
                />
                {errors.razao_social && <span style={{ color: 'red', fontSize: '11px' }}>{errors.razao_social.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Nome Fantasia</Label>
                <Input
                  type="text"
                  placeholder="Nome fantasia da empresa"
                  disabled={isViewMode}
                  {...register('nome_fantasia')}
                />
                {errors.nome_fantasia && <span style={{ color: 'red', fontSize: '11px' }}>{errors.nome_fantasia.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>CNPJ</Label>
                <div style={{ position: 'relative' }}>
                  <Input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    disabled={isViewMode}
                    {...register('cnpj')}
                    onChange={isViewMode ? undefined : handleCNPJChange}
                    style={{ paddingRight: cnpjLoading ? '40px' : '12px' }}
                  />
                  {cnpjLoading && (
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--primary-green)'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid var(--primary-green)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    </div>
                  )}
                </div>
                                  {errors.cnpj && <span style={{ color: 'red', fontSize: '11px' }}>{errors.cnpj.message}</span>}
                {!editingFornecedor && !isViewMode && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--gray)', fontSize: '11px' }}>
                      Digite o CNPJ completo para buscar dados automaticamente
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const cnpjValue = getValues('cnpj');
                        if (cnpjValue && cnpjValue.replace(/\D/g, '').length === 14) {
                          if (validarCNPJ(cnpjValue)) {
                            buscarDadosCNPJ(cnpjValue);
                          } else {
                            toast.error('CNPJ inválido');
                          }
                        } else {
                          toast.error('Digite um CNPJ válido primeiro');
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        background: 'var(--primary-green)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = 'var(--dark-green)'}
                      onMouseOut={(e) => e.target.style.background = 'var(--primary-green)'}
                    >
                      Buscar Dados
                    </button>
                    <span style={{ color: 'var(--orange)', fontSize: '10px', fontStyle: 'italic' }}>
                      ⚠️ Se a busca falhar, você pode preencher os dados manualmente
                    </span>
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Telefone</Label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Input
                    type="text"
                    placeholder="(00) 00000-0000"
                    disabled={isViewMode}
                    {...register('telefone')}
                    style={{ flex: 1 }}
                  />
                  {isViewMode && getValues('telefone') && (
                    <PhoneLink 
                      href={`https://wa.me/55${getValues('telefone').replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir no WhatsApp"
                      style={{ 
                        padding: '8px 12px', 
                        fontSize: '14px',
                        minWidth: 'auto'
                      }}
                    >
                      <WhatsAppIcon />
                    </PhoneLink>
                  )}
                </div>
                {errors.telefone && <span style={{ color: 'red', fontSize: '11px' }}>{errors.telefone.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  disabled={isViewMode}
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                />
                                  {errors.email && <span style={{ color: 'red', fontSize: '11px' }}>{errors.email.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Logradouro</Label>
                <Input
                  type="text"
                  placeholder="Rua, avenida, etc."
                  disabled={isViewMode}
                  {...register('logradouro')}
                />
                                  {errors.logradouro && <span style={{ color: 'red', fontSize: '11px' }}>{errors.logradouro.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Número</Label>
                <Input
                  type="text"
                  placeholder="Número"
                  disabled={isViewMode}
                  {...register('numero')}
                />
                                  {errors.numero && <span style={{ color: 'red', fontSize: '11px' }}>{errors.numero.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Bairro</Label>
                <Input
                  type="text"
                  placeholder="Bairro"
                  disabled={isViewMode}
                  {...register('bairro')}
                />
                                  {errors.bairro && <span style={{ color: 'red', fontSize: '11px' }}>{errors.bairro.message}</span>}
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <FormGroup>
                  <Label>Município</Label>
                  <Input
                    type="text"
                    placeholder="Município"
                    disabled={isViewMode}
                    {...register('municipio')}
                  />
                                      {errors.municipio && <span style={{ color: 'red', fontSize: '11px' }}>{errors.municipio.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>UF</Label>
                  <Select disabled={isViewMode} {...register('uf')}>
                    <option value="">Selecione...</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </Select>
                                      {errors.uf && <span style={{ color: 'red', fontSize: '11px' }}>{errors.uf.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>CEP</Label>
                  <Input
                    type="text"
                    placeholder="00000-000"
                    disabled={isViewMode}
                    {...register('cep')}
                  />
                                      {errors.cep && <span style={{ color: 'red', fontSize: '11px' }}>{errors.cep.message}</span>}
                </FormGroup>
              </div>



              <FormGroup>
                <Label>Status</Label>
                <Select disabled={isViewMode} {...register('status', { required: 'Status é obrigatório' })}>
                  <option value="">Selecione...</option>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </Select>
                {errors.status && <span style={{ color: 'red', fontSize: '11px' }}>{errors.status.message}</span>}
              </FormGroup>

              <ButtonGroup>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  {isViewMode ? 'Fechar' : 'Cancelar'}
                </Button>
                {!isViewMode && (
                  <Button type="submit" className="primary">
                    {editingFornecedor ? 'Atualizar' : 'Criar'}
                  </Button>
                )}
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', maxHeight: '90vh', width: '1200px' }}>
            <ModalHeader>
              <ModalTitle>Relatório de Auditoria - Fornecedores</ModalTitle>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleExportXLSX}
                  title="Exportar para Excel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'var(--dark-green)'}
                  onMouseOut={(e) => e.target.style.background = 'var(--primary-green)'}
                >
                  <FaFileExcel />
                  Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  title="Exportar para PDF"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'var(--dark-green)'}
                  onMouseOut={(e) => e.target.style.background = 'var(--primary-green)'}
                >
                  <FaFilePdf />
                  PDF
                </button>
                <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
              </div>
            </ModalHeader>

            {/* Filtros de Auditoria */}
            <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>Filtros</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={auditFilters.dataInicio}
                    onChange={(e) => setAuditFilters({...auditFilters, dataInicio: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={auditFilters.dataFim}
                    onChange={(e) => setAuditFilters({...auditFilters, dataFim: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Ação
                  </label>
                  <select
                    value={auditFilters.acao}
                    onChange={(e) => setAuditFilters({...auditFilters, acao: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Todas as ações</option>
                    <option value="create">Criar</option>
                    <option value="update">Editar</option>
                    <option value="delete">Excluir</option>
                    <option value="login">Login</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Usuário
                  </label>
                  <select
                    value={auditFilters.usuario_id}
                    onChange={(e) => setAuditFilters({...auditFilters, usuario_id: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Todos os usuários</option>
                    {/* Aqui você pode adicionar a lista de usuários se necessário */}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Período
                  </label>
                  <select
                    value={auditFilters.periodo}
                    onChange={(e) => setAuditFilters({...auditFilters, periodo: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Período personalizado</option>
                    <option value="7dias">Últimos 7 dias</option>
                    <option value="30dias">Últimos 30 dias</option>
                    <option value="90dias">Últimos 90 dias</option>
                    <option value="todos">Todos os registros</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleApplyAuditFilters}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Aplicar Filtros
              </button>
            </div>

            {/* Lista de Logs */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {auditLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Carregando logs...</div>
              ) : auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)' }}>
                  Nenhum log encontrado com os filtros aplicados
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--gray)' }}>
                    {auditLogs.length} log(s) encontrado(s)
                  </div>
                  {auditLogs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px',
                        background: 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: log.acao === 'create' ? '#e8f5e8' : 
                                       log.acao === 'update' ? '#fff3cd' : 
                                       log.acao === 'delete' ? '#f8d7da' : '#e3f2fd',
                            color: log.acao === 'create' ? '#2e7d32' : 
                                   log.acao === 'update' ? '#856404' : 
                                   log.acao === 'delete' ? '#721c24' : '#1976d2'
                          }}>
                            {getActionLabel(log.acao)}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                            por {log.usuario_nome || 'Usuário desconhecido'}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      
                      {log.detalhes && (
                        <div style={{ fontSize: '12px', color: 'var(--dark-gray)' }}>
                          {log.detalhes.changes && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Mudanças Realizadas:</strong>
                              <div style={{ marginLeft: '12px', marginTop: '8px' }}>
                                {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                  <div key={field} style={{ 
                                    marginBottom: '6px', 
                                    padding: '8px', 
                                    background: '#f8f9fa', 
                                    borderRadius: '4px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '4px' }}>
                                      {getFieldLabel(field)}:
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                                      <span style={{ color: '#721c24' }}>
                                        <strong>Antes:</strong> {formatFieldValue(field, change.from)}
                                      </span>
                                      <span style={{ color: '#6c757d' }}>→</span>
                                      <span style={{ color: '#2e7d32' }}>
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
                              <strong>Dados do Fornecedor:</strong>
                              <div style={{ 
                                marginLeft: '12px', 
                                marginTop: '8px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px'
                              }}>
                                {Object.entries(log.detalhes.requestBody).map(([field, value]) => (
                                  <div key={field} style={{ 
                                    padding: '6px 8px', 
                                    background: '#f8f9fa', 
                                    borderRadius: '4px',
                                    border: '1px solid #e9ecef',
                                    fontSize: '11px'
                                  }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '2px' }}>
                                      {getFieldLabel(field)}:
                                    </div>
                                    <div style={{ color: '#2e7d32' }}>
                                      {formatFieldValue(field, value)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.detalhes.resourceId && (
                            <div style={{ 
                              marginTop: '8px', 
                              padding: '6px 8px', 
                              background: '#e3f2fd', 
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              <strong>ID do Fornecedor:</strong> 
                              <span style={{ color: '#1976d2', marginLeft: '4px' }}>
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
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Resultados de Importação */}
      {showImportModal && (
        <Modal onClick={handleCloseImportModal}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <ModalHeader>
              <ModalTitle>Resultados da Importação por CNPJ</ModalTitle>
              <CloseButton onClick={handleCloseImportModal}>&times;</CloseButton>
            </ModalHeader>
            
            {!importResults && (
              <div style={{ 
                padding: '16px', 
                background: '#e3f2fd', 
                borderRadius: '8px', 
                marginBottom: '16px',
                border: '1px solid #1976d2'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}>
                  <FaInfoCircle />
                  Como funciona a importação por CNPJ:
                </div>
                <ul style={{ 
                  margin: '0', 
                  paddingLeft: '20px', 
                  fontSize: '13px',
                  color: '#1976d2'
                }}>
                  <li>A planilha deve conter apenas CNPJs (uma coluna)</li>
                  <li>O sistema busca automaticamente os dados de cada CNPJ</li>
                  <li>Fornecedores são cadastrados com status "Ativo"</li>
                  <li>CNPJs já cadastrados são ignorados</li>
                </ul>
              </div>
            )}

            {importResults ? (
              <div>
                <div style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  background: importResults.resultados.sucessos > 0 ? '#e8f5e8' : '#f8d7da',
                  border: `1px solid ${importResults.resultados.sucessos > 0 ? '#2e7d32' : '#721c24'}`
                }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: importResults.resultados.sucessos > 0 ? '#2e7d32' : '#721c24',
                    fontSize: '16px'
                  }}>
                    {importResults.mensagem}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    fontSize: '14px',
                    color: importResults.resultados.sucessos > 0 ? '#2e7d32' : '#721c24',
                    flexWrap: 'wrap'
                  }}>
                    <span><strong>Total de CNPJs:</strong> {importResults.resultados.total}</span>
                    <span><strong>Sucessos:</strong> {importResults.resultados.sucessos}</span>
                    <span><strong>Erros:</strong> {importResults.resultados.erros}</span>
                  </div>
                  
                  {/* Estatísticas detalhadas */}
                  {importResults.estatisticas && (
                    <div style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      background: 'rgba(255,255,255,0.7)', 
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📊 Análise da Planilha:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <span>📄 Total de linhas: {importResults.estatisticas.totalLinhas}</span>
                        <span>📝 Linhas com dados: {importResults.estatisticas.linhasComDados}</span>
                        <span>⚪ Linhas vazias: {importResults.estatisticas.linhasVazias}</span>
                        <span>✅ CNPJs válidos: {importResults.estatisticas.cnpjsValidos}</span>
                        <span>🔧 CNPJs corrigidos: {importResults.estatisticas.cnpjsCorrigidos}</span>
                        <span>❌ CNPJs inválidos: {importResults.estatisticas.cnpjsInvalidos}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seção de Sucessos */}
                {importResults.resultados.detalhes.sucessos.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '14px', 
                      color: '#2e7d32',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '16px' }}>✓</span>
                      Fornecedores Importados com Sucesso ({importResults.resultados.detalhes.sucessos.length})
                    </h4>
                    <div style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      border: '1px solid #e8f5e8',
                      borderRadius: '6px',
                      padding: '8px'
                    }}>
                      {importResults.resultados.detalhes.sucessos.map((sucesso, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '8px 12px',
                            marginBottom: '6px',
                            borderRadius: '4px',
                            border: '1px solid #2e7d32',
                            background: '#e8f5e8',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '4px'
                          }}>
                            <span style={{ 
                              fontWeight: 'bold',
                              color: '#2e7d32'
                            }}>
                              Linha {sucesso.linha} - CNPJ: {formatCNPJ(sucesso.cnpj)}
                            </span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              background: '#2e7d32',
                              color: 'white'
                            }}>
                              SUCESSO
                            </span>
                          </div>
                          <div style={{ 
                            color: '#2e7d32',
                            fontSize: '11px'
                          }}>
                            <strong>Razão Social:</strong> {sucesso.razao_social}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seção de Erros */}
                {importResults.resultados.detalhes.erros.length > 0 && (
                  <div>
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '14px', 
                      color: '#721c24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '16px' }}>✗</span>
                      Erros na Importação ({importResults.resultados.detalhes.erros.length})
                    </h4>
                    <div style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      border: '1px solid #f8d7da',
                      borderRadius: '6px',
                      padding: '8px'
                    }}>
                      {importResults.resultados.detalhes.erros.map((erro, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '8px 12px',
                            marginBottom: '6px',
                            borderRadius: '4px',
                            border: '1px solid #721c24',
                            background: '#f8d7da',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '4px'
                          }}>
                            <span style={{ 
                              fontWeight: 'bold',
                              color: '#721c24'
                            }}>
                              Linha {erro.linha} - CNPJ: {formatCNPJ(erro.cnpj)}
                            </span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              background: '#721c24',
                              color: 'white'
                            }}>
                              ERRO
                            </span>
                          </div>
                          <div style={{ 
                            color: '#721c24',
                            fontSize: '11px'
                          }}>
                            <strong>Erro:</strong> {erro.erro}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '4px solid #f3f3f3', 
                  borderTop: '4px solid var(--primary-green)', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px auto'
                }}></div>
                Processando importação...
              </div>
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Fornecedores; 