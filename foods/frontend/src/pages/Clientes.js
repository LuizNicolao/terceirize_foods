import React, { useState, useEffect, useCallback } from 'react';
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
  FaBuilding,
  FaIndustry,
  FaTruck,
  FaStore,
  FaUsers
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';
import ClientesService from '../services/clientes';
import { Button, Input, Modal, StatCard } from '../components/ui';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

const Clientes = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [searching, setSearching] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total_clientes: 0,
    clientes_ativos: 0,
    com_email: 0,
    com_telefone: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [formKey, setFormKey] = useState(0); // Para forçar re-render do formulário
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Resetar para primeira página quando buscar
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Mostrar loading quando buscar
  useEffect(() => {
    if (searchTerm && searchTerm !== debouncedSearchTerm) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    loadClientes();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const loadClientes = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação e busca
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm, // Usar termo de busca com debounce
        ...params
      };

      const result = await ClientesService.listar(paginationParams);
      if (result.success) {
        setClientes(result.data);
        
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
        const ativos = result.data.filter(c => c.status === 1).length;
        const comEmail = result.data.filter(c => c.email && c.email.trim() !== '').length;
        const comTelefone = result.data.filter(c => c.telefone && c.telefone.trim() !== '').length;
        
        setEstatisticas({
          total_clientes: total,
          clientes_ativos: ativos,
          com_email: comEmail,
          com_telefone: comTelefone
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
      setSearching(false); // Parar loading de busca
    }
  };

  // Filtrar clientes (client-side) - apenas para casos especiais
  const filteredClientes = Array.isArray(clientes) ? clientes : [];

  // Função para mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const response = await fetch('/api/auditoria?entidade=clientes&limit=100', {
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
      const result = await ClientesService.exportarXLSX();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clientes.xlsx';
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
      const result = await ClientesService.exportarPDF();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clientes.pdf';
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
      CREATE: 'Criado',
      UPDATE: 'Atualizado',
      DELETE: 'Excluído'
    };
    return actions[action] || action;
  };

  const getFieldLabel = (field) => {
    const fields = {
      razao_social: 'Razão Social',
      nome_fantasia: 'Nome Fantasia',
      cnpj: 'CNPJ',
      email: 'Email',
      telefone: 'Telefone',
      logradouro: 'Logradouro',
      numero: 'Número',
      bairro: 'Bairro',
      municipio: 'Município',
      uf: 'UF',
      cep: 'CEP',
      status: 'Status'
    };
    return fields[field] || field;
  };

  const formatFieldValue = (field, value) => {
    if (field === 'status') {
        return value === 1 ? 'Ativo' : 'Inativo';
    }
    if (field === 'cnpj') {
      return value ? value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';
    }
    return value || '-';
  };

  const handleAddCliente = () => {
    setEditingCliente(null);
    setViewMode(false);
    setShowModal(true);
    reset();
  };

  const handleViewCliente = (cliente) => {
    setEditingCliente(cliente);
    setViewMode(true);
    setShowModal(true);
    reset(cliente);
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setViewMode(false);
    setShowModal(true);
    reset(cliente);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    setViewMode(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      // Limpar dados antes de enviar
      const cleanData = {
        razao_social: data.razao_social && data.razao_social.trim() !== '' ? data.razao_social.trim() : null,
        nome_fantasia: data.nome_fantasia && data.nome_fantasia.trim() !== '' ? data.nome_fantasia.trim() : null,
        cnpj: data.cnpj && data.cnpj.trim() !== '' ? data.cnpj.replace(/\D/g, '') : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        telefone: data.telefone && data.telefone.trim() !== '' ? data.telefone.trim() : null,
        logradouro: data.logradouro && data.logradouro.trim() !== '' ? data.logradouro.trim() : null,
        numero: data.numero && data.numero.trim() !== '' ? data.numero.trim() : null,
        bairro: data.bairro && data.bairro.trim() !== '' ? data.bairro.trim() : null,
        municipio: data.municipio && data.municipio.trim() !== '' ? data.municipio.trim() : null,
        uf: data.uf && data.uf.trim() !== '' ? data.uf.trim().toUpperCase() : null,
        cep: data.cep && data.cep.trim() !== '' ? data.cep.replace(/\D/g, '') : null,
        status: data.status || 1
      };

      let result;
      if (editingCliente) {
        result = await ClientesService.atualizar(editingCliente.id, cleanData);
      } else {
        result = await ClientesService.criar(cleanData);
      }

      if (result.success) {
        toast.success(result.message);
      handleCloseModal();
      loadClientes();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleDeleteCliente = async (clienteId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const result = await ClientesService.excluir(clienteId);
        if (result.success) {
          toast.success(result.message);
        loadClientes();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  const getStatusLabel = (status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  };

  // Função para buscar dados do CNPJ
  const buscarDadosCNPJ = async (cnpj) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length === 14) {
        console.log('Buscando dados do CNPJ:', cnpjLimpo);
        const result = await ClientesService.buscarCNPJ(cnpjLimpo);
        console.log('Resultado da busca CNPJ:', result);
        
        if (result.success && result.data) {
          const dados = result.data;
          console.log('Dados recebidos:', dados);
          
          // Verificar se os dados têm a estrutura esperada
          if (!dados.razao_social) {
            console.warn('Dados do CNPJ não contêm razao_social:', dados);
            toast.error('Dados do CNPJ incompletos ou inválidos');
            return;
          }
          
          // Usar reset para atualizar todos os campos de uma vez
          const formData = {
            razao_social: dados.razao_social || '',
            nome_fantasia: dados.nome_fantasia || '',
            logradouro: dados.logradouro || '',
            numero: dados.numero || '',
            bairro: dados.bairro || '',
            municipio: dados.municipio || '',
            uf: dados.uf || '',
            cep: dados.cep ? formatCEP(dados.cep) : '',
            cnpj: cnpj // Manter o CNPJ formatado
          };
          
          console.log('Dados do formulário:', formData);
          reset(formData);
          
          // Forçar re-render do formulário
          setFormKey(prev => prev + 1);
          
          toast.success('Dados do CNPJ carregados automaticamente!');
        } else {
          console.log('Erro na resposta:', result);
          toast.error(result.error || 'Erro ao buscar dados do CNPJ');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do CNPJ:', error);
      toast.error('Erro ao buscar dados do CNPJ');
    }
  };

  // Função para formatar CNPJ
  const formatCNPJ = (value) => {
    const cnpj = value.replace(/\D/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Função para validar CNPJ
  const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    let peso = 2;
    
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    
    soma = 0;
    peso = 2;
    
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    
    return parseInt(cnpj.charAt(12)) === digito1 && parseInt(cnpj.charAt(13)) === digito2;
  };

  // Função para formatar telefone
  const formatTelefone = (value) => {
    const telefone = value.replace(/\D/g, '');
    if (telefone.length <= 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Função para lidar com mudança no CNPJ
  const handleCNPJChange = (e) => {
    const value = e.target.value;
    const formatted = formatCNPJ(value);
    e.target.value = formatted;
    
    // Buscar dados automaticamente se CNPJ estiver completo e válido
    const cnpjLimpo = formatted.replace(/\D/g, '');
    if (cnpjLimpo.length === 14 && validarCNPJ(formatted)) {
          buscarDadosCNPJ(formatted);
    }
  };

  // Função para formatar CEP
  const formatCEP = (value) => {
    const cep = value.replace(/\D/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para lidar com mudança no telefone
  const handleTelefoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatTelefone(value);
    e.target.value = formatted;
  };

  // Função para lidar com mudança no CEP
  const handleCEPChange = (e) => {
    const value = e.target.value;
    const formatted = formatCEP(value);
    e.target.value = formatted;
  };

  // Função de teste para verificar se o setValue funciona
  const testSetValue = () => {
    console.log('Testando setValue...');
    setValue('razao_social', 'TESTE RAZÃO SOCIAL');
    setValue('nome_fantasia', 'TESTE NOME FANTASIA');
    setValue('logradouro', 'TESTE LOGRADOURO');
    setValue('numero', '123');
    setValue('bairro', 'TESTE BAIRRO');
    setValue('municipio', 'TESTE MUNICÍPIO');
    setValue('uf', 'SP');
    setValue('cep', '00000-000');
    toast.success('Teste de setValue executado!');
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Clientes</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {canCreate('clientes') && (
            <Button onClick={handleAddCliente} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Cliente</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
          
          <Button onClick={handleOpenAuditModal} variant="outline" size="sm">
            <FaHistory className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Logs</span>
          </Button>
          
          <Button onClick={testSetValue} variant="outline" size="sm">
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Teste</span>
            <span className="sm:hidden">Teste</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Clientes"
          value={estatisticas.total_clientes}
          icon={FaUsers}
          color="blue"
        />
        <StatCard
          title="Clientes Ativos"
          value={estatisticas.clientes_ativos}
          icon={FaBuilding}
          color="green"
        />
        <StatCard
          title="Com Email"
          value={estatisticas.com_email}
          icon={FaStore}
          color="purple"
        />
        <StatCard
          title="Com Telefone"
          value={estatisticas.com_telefone}
          icon={FaTruck}
          color="orange"
        />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por razão social, nome fantasia, CNPJ ou município..."
      />
      
      {/* Indicador de busca */}
      {searching && (
        <div className="flex items-center justify-center py-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Buscando...
        </div>
      )}

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

      {/* Loading */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando clientes...</p>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          {debouncedSearchTerm 
                      ? 'Nenhum cliente encontrado com os filtros aplicados'
                      : 'Nenhum cliente cadastrado'
                    }
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razão Social
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Município/UF
                  </th>
                  <th className="hidden lg:table-cell px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {cliente.cnpj ? cliente.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '-'}
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {cliente.razao_social}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {cliente.municipio && cliente.uf ? `${cliente.municipio}/${cliente.uf}` : '-'}
                    </td>
                    <td className="hidden lg:table-cell px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <div>
                        {cliente.email && <div>{cliente.email}</div>}
                        {cliente.telefone && <div>{cliente.telefone}</div>}
                        {!cliente.email && !cliente.telefone && '-'}
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        cliente.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getStatusLabel(cliente.status)}
                      </span>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-4 lg:px-6 lg:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex gap-1 sm:gap-2">
                        {canView('clientes') && (
                          <Button
                            variant="ghost"
                            size="xs"
                      onClick={() => handleViewCliente(cliente)}
                            title="Visualizar"
                    >
                            <FaEye className="text-green-600 text-xs sm:text-sm" />
                          </Button>
                        )}
                    {canEdit('clientes') && (
                          <Button
                            variant="ghost"
                            size="xs"
                        onClick={() => handleEditCliente(cliente)}
                            title="Editar"
                      >
                            <FaEdit className="text-blue-600 text-xs sm:text-sm" />
                          </Button>
                    )}
                    {canDelete('clientes') && (
                          <Button
                            variant="ghost"
                            size="xs"
                        onClick={() => handleDeleteCliente(cliente.id)}
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

      {/* Paginação */}
      {!loading && filteredClientes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Modal de Cliente */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Cliente' : editingCliente ? 'Editar Cliente' : 'Adicionar Cliente'}
        size="xl"
      >
        <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className={`grid grid-cols-1 ${viewMode ? 'lg:grid-cols-3 md:grid-cols-2' : 'lg:grid-cols-3 md:grid-cols-2'} gap-3 sm:gap-4`}>
            {/* Primeira linha - Informações básicas */}
            <div className="lg:col-span-2">
              <Input
                label="Razão Social"
                {...register('razao_social', { required: 'Razão social é obrigatória' })}
                error={errors.razao_social?.message}
                disabled={viewMode}
              />
            </div>
            
            <div>
                <Input
                label="CNPJ"
                {...register('cnpj')}
                error={errors.cnpj?.message}
                disabled={viewMode}
                placeholder="00.000.000/0000-00"
                onChange={handleCNPJChange}
              />
            </div>

            <div>
                <Input
                label="Nome Fantasia"
                  {...register('nome_fantasia')}
                error={errors.nome_fantasia?.message}
                disabled={viewMode}
                />
            </div>

            <div>
                  <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                disabled={viewMode}
              />
                    </div>

            <div>
                <Input
                label="Telefone"
                  {...register('telefone')}
                error={errors.telefone?.message}
                disabled={viewMode}
                placeholder="(00) 00000-0000"
                onChange={handleTelefoneChange}
              />
                </div>

            {/* Segunda linha - Endereço */}
            <div className="lg:col-span-2">
                <Input
                label="Logradouro"
                  {...register('logradouro')}
                error={errors.logradouro?.message}
                disabled={viewMode}
                />
            </div>

            <div>
                <Input
                label="Número"
                  {...register('numero')}
                error={errors.numero?.message}
                disabled={viewMode}
                />
            </div>

            <div>
                <Input
                label="Bairro"
                  {...register('bairro')}
                error={errors.bairro?.message}
                disabled={viewMode}
                />
            </div>

            <div>
                  <Input
                label="CEP"
                    {...register('cep')}
                error={errors.cep?.message}
                disabled={viewMode}
                placeholder="00000-000"
                onChange={handleCEPChange}
                  />
              </div>

                <div>
              <Input
                label="Município"
                {...register('municipio')}
                error={errors.municipio?.message}
                disabled={viewMode}
                  />
                </div>

                <div>
              <Input
                label="UF"
                {...register('uf')}
                error={errors.uf?.message}
                disabled={viewMode}
                maxLength={2}
                placeholder="SP"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
                  </label>
                  <select
                {...register('status')}
                disabled={viewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              >
                <option value={1}>Ativo</option>
                <option value={0}>Inativo</option>
                  </select>
                </div>
                </div>

          {!viewMode && (
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingCliente ? 'Atualizar' : 'Criar'} Cliente
              </Button>
                </div>
          )}
        </form>
      </Modal>

      {/* Modal de Auditoria */}
      <Modal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Logs de Auditoria - Clientes"
        size="xl"
      >
        <div className="space-y-4">
          {loadingAudit ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando logs...</p>
            </div>
              ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum log de auditoria encontrado
                </div>
              ) : (
            <div className="overflow-x-auto">
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {formatDate(log.data_registro)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {log.usuario_nome || log.usuario_id}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                            {getActionLabel(log.acao)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900">
                        {getFieldLabel(log.campo)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-500">
                        {formatFieldValue(log.campo, log.valor_anterior)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-500">
                        {formatFieldValue(log.campo, log.novo_valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                            </div>
                          )}
                                    </div>
        </Modal>
                </div>
  );
};

export default Clientes; 
