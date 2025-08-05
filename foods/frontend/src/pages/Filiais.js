import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Componentes reutilizáveis
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import StatCard from '../components/ui/StatCard';
import CadastroFilterBar from '../components/CadastroFilterBar';
import Pagination from '../components/Pagination';

// Service
import FiliaisService from '../services/filiais';

const Filiais = () => {
  // Estados principais
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFilial, setEditingFilial] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de auditoria
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    startDate: '',
    endDate: '',
    action: 'todos',
    userId: ''
  });

  // Estados de almoxarifados
  const [activeTab, setActiveTab] = useState('dados');
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [loadingAlmoxarifados, setLoadingAlmoxarifados] = useState(false);
  const [showAlmoxarifadoModal, setShowAlmoxarifadoModal] = useState(false);
  const [editingAlmoxarifado, setEditingAlmoxarifado] = useState(null);
  const [showItensModal, setShowItensModal] = useState(false);
  const [selectedAlmoxarifado, setSelectedAlmoxarifado] = useState(null);
  const [itensAlmoxarifado, setItensAlmoxarifado] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [searchProduto, setSearchProduto] = useState('');
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [quantidadeProduto, setQuantidadeProduto] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset página quando busca muda
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Controlar estado de busca
  useEffect(() => {
    setSearching(searchTerm !== debouncedSearchTerm);
  }, [searchTerm, debouncedSearchTerm]);

  // Carregar filiais
  const loadFiliais = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        status: statusFilter !== 'todos' ? statusFilter : undefined
      };

      const result = await FiliaisService.listar(params);
      
      if (result.success) {
        setFiliais(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.totalItems);
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, statusFilter]);

  // Carregar dados quando parâmetros mudam
  useEffect(() => {
    loadFiliais();
  }, [loadFiliais]);

  // Buscar dados do CNPJ
  const buscarDadosCNPJ = async (cnpj) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) return;

      const result = await FiliaisService.consultarCNPJ(cnpjLimpo);
      
      if (result.success && result.data) {
        const dados = result.data;
        const formData = {
          razao_social: dados.razao_social || '',
          nome_fantasia: dados.nome_fantasia || '',
          logradouro: dados.logradouro || '',
          numero: dados.numero || '',
          bairro: dados.bairro || '',
          municipio: dados.municipio || '',
          uf: dados.uf || '',
          cep: dados.cep || '',
          telefone: dados.telefone || '',
          email: dados.email || ''
        };

        reset(formData);
        toast.success('Dados do CNPJ carregados automaticamente!');
      } else {
        toast.error(result.error || 'Erro ao buscar dados do CNPJ');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do CNPJ:', error);
      toast.error('Erro ao buscar dados do CNPJ');
    }
  };

  // Formatação de CNPJ
  const formatCNPJ = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Validação de CNPJ
  const validarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    let peso = 2;
    
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    const digito1 = ((soma % 11) < 2) ? 0 : 11 - (soma % 11);
    
    soma = 0;
    peso = 2;
    
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    const digito2 = ((soma % 11) < 2) ? 0 : 11 - (soma % 11);
    
    return (parseInt(cnpjLimpo.charAt(12)) === digito1 && 
            parseInt(cnpjLimpo.charAt(13)) === digito2);
  };

  // Handler para mudança de CNPJ
  const handleCNPJChange = (e) => {
    const value = e.target.value;
    const formatted = formatCNPJ(value);
    setValue('cnpj', formatted);
    
    if (formatted.length === 18) {
      buscarDadosCNPJ(formatted);
    }
  };

  // Formatação de telefone
  const formatTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Handler para mudança de telefone
  const handleTelefoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatTelefone(value);
    setValue('telefone', formatted);
  };

  // Formatação de CEP
  const formatCEP = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Handler para mudança de CEP
  const handleCEPChange = (e) => {
    const value = e.target.value;
    const formatted = formatCEP(value);
    setValue('cep', formatted);
  };

  // Abrir modal para criar/editar
  const openModal = (filial = null) => {
    setEditingFilial(filial);
    setViewMode(false);
    
    if (filial) {
      reset(filial);
    } else {
      reset({
        razao_social: '',
        nome_fantasia: '',
        cnpj: '',
        logradouro: '',
        numero: '',
        bairro: '',
        municipio: '',
        uf: '',
        cep: '',
        telefone: '',
        email: '',
        status: 'ativo'
      });
    }
    
    setShowModal(true);
  };

  // Abrir modal de visualização
  const openViewModal = (filial) => {
    setEditingFilial(filial);
    setViewMode(true);
    reset(filial);
    setShowModal(true);
  };

  // Submeter formulário
  const onSubmit = async (data) => {
    try {
      let result;
      
      if (editingFilial) {
        result = await FiliaisService.atualizar(editingFilial.id, data);
      } else {
        result = await FiliaisService.criar(data);
      }
      
      if (result.success) {
        toast.success(editingFilial ? 'Filial atualizada com sucesso!' : 'Filial criada com sucesso!');
        setShowModal(false);
        loadFiliais();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar filial');
    }
  };

  // Excluir filial
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta filial?')) return;
    
    try {
      const result = await FiliaisService.excluir(id);
      
      if (result.success) {
        toast.success('Filial excluída com sucesso!');
        loadFiliais();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao excluir filial');
    }
  };

  // Exportar dados
  const handleExport = async (format) => {
    try {
      const params = {
        search: debouncedSearchTerm,
        status: statusFilter !== 'todos' ? statusFilter : undefined
      };

      let result;
      if (format === 'xlsx') {
        result = await FiliaisService.exportarXLSX(params);
      } else {
        result = await FiliaisService.exportarPDF(params);
      }
      
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `filiais.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success(`Dados exportados em ${format.toUpperCase()} com sucesso!`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(`Erro ao exportar dados em ${format.toUpperCase()}`);
    }
  };

  // Carregar almoxarifados
  const loadAlmoxarifados = async (filialId) => {
    try {
      setLoadingAlmoxarifados(true);
      const result = await FiliaisService.listarAlmoxarifados(filialId);
      
      if (result.success) {
        setAlmoxarifados(result.data);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar almoxarifados');
    } finally {
      setLoadingAlmoxarifados(false);
    }
  };

  // Carregar itens do almoxarifado
  const loadItensAlmoxarifado = async (almoxarifadoId) => {
    try {
      setLoadingItens(true);
      const result = await FiliaisService.listarItensAlmoxarifado(almoxarifadoId);
      
      if (result.success) {
        setItensAlmoxarifado(result.data);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar itens do almoxarifado');
    } finally {
      setLoadingItens(false);
    }
  };

  // Estatísticas
  const stats = {
    total: totalItems,
    ativas: filiais.filter(f => f.status === 'ativo').length,
    inativas: filiais.filter(f => f.status === 'inativo').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Filiais</h1>
            <p className="text-gray-600 mt-1">Gerencie as filiais da empresa</p>
          </div>
          <Button
            onClick={() => openModal()}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Filial
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total de Filiais"
          value={stats.total}
          icon="🏢"
          color="blue"
        />
        <StatCard
          title="Filiais Ativas"
          value={stats.ativas}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Filiais Inativas"
          value={stats.inativas}
          icon="❌"
          color="red"
        />
      </div>

      {/* Barra de filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        statusFilter={statusFilter}
        onExportXLSX={() => handleExport('xlsx')}
        onExportPDF={() => handleExport('pdf')}
        searching={searching}
        placeholder="Buscar por razão social, nome fantasia, CNPJ ou município..."
      />

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Razão Social
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Município/UF
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filiais.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    {debouncedSearchTerm ? 'Nenhuma filial encontrada para sua busca.' : 'Nenhuma filial cadastrada.'}
                  </td>
                </tr>
              ) : (
                filiais.map((filial) => (
                  <tr key={filial.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {filial.razao_social}
                        </div>
                        {filial.nome_fantasia && (
                          <div className="text-sm text-gray-500">
                            {filial.nome_fantasia}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {filial.cnpj}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {filial.municipio}/{filial.uf}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {filial.telefone}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        filial.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {filial.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewModal(filial)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(filial)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(filial.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Modal de Filial */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
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
                label="Nome Fantasia"
                {...register('nome_fantasia')}
                disabled={viewMode}
              />
            </div>

            {/* Segunda linha - CNPJ e Status */}
            <div>
              <Input
                label="CNPJ"
                {...register('cnpj', { 
                  required: 'CNPJ é obrigatório',
                  validate: (value) => {
                    const cnpjLimpo = value.replace(/\D/g, '');
                    if (cnpjLimpo.length === 14 && !validarCNPJ(value)) {
                      return 'CNPJ inválido';
                    }
                    return true;
                  }
                })}
                error={errors.cnpj?.message}
                onChange={handleCNPJChange}
                disabled={viewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register('status', { required: 'Status é obrigatório' })}
                disabled={viewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            {/* Terceira linha - Endereço */}
            <div className="lg:col-span-2">
              <Input
                label="Logradouro"
                {...register('logradouro')}
                disabled={viewMode}
              />
            </div>

            <div>
              <Input
                label="Número"
                {...register('numero')}
                disabled={viewMode}
              />
            </div>

            <div>
              <Input
                label="Bairro"
                {...register('bairro')}
                disabled={viewMode}
              />
            </div>

            <div>
              <Input
                label="Município"
                {...register('municipio')}
                disabled={viewMode}
              />
            </div>

            <div>
              <Input
                label="UF"
                {...register('uf', { maxLength: 2 })}
                maxLength={2}
                disabled={viewMode}
              />
            </div>

            <div>
              <Input
                label="CEP"
                {...register('cep')}
                onChange={handleCEPChange}
                disabled={viewMode}
              />
            </div>

            {/* Quarta linha - Contato */}
            <div>
              <Input
                label="Telefone"
                {...register('telefone')}
                onChange={handleTelefoneChange}
                disabled={viewMode}
              />
            </div>

            <div>
              <Input
                label="Email"
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                error={errors.email?.message}
                disabled={viewMode}
              />
            </div>
          </div>

          {/* Botões */}
          {!viewMode && (
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingFilial ? 'Atualizar' : 'Criar'} Filial
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Filiais; 