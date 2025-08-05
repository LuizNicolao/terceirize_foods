import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaHistory, FaFileExcel, FaFilePdf, FaBuilding, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Button, Table, Modal, StatCard } from '../components/ui';
import LoadingSpinner from '../components/LoadingSpinner';
import CadastroFilterBar from '../components/CadastroFilterBar';
import FilialForm from '../components/FilialForm';
import AlmoxarifadoModal from '../components/AlmoxarifadoModal';
import AuditModal from '../components/AuditModal';
import filiaisService from '../services/filiais';
import { usePermissions } from '../contexts/PermissionsContext';
import toast from 'react-hot-toast';

const Filiais = () => {
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFilial, setEditingFilial] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showAlmoxarifadoModal, setShowAlmoxarifadoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dados');
  const [estatisticas, setEstatisticas] = useState({
    total_filiais: 0,
    filiais_ativas: 0,
    filiais_inativas: 0,
    com_cnpj: 0
  });

  const { canCreate, canEdit, canDelete } = usePermissions();

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      setLoading(true);
      const response = await filiaisService.listar();
      if (response.success) {
        const data = response.data || [];
        setFiliais(data);
        
        // Calcular estatísticas
        setEstatisticas({
          total_filiais: data.length,
          filiais_ativas: data.filter(f => f.status === 1).length,
          filiais_inativas: data.filter(f => f.status === 0).length,
          com_cnpj: data.filter(f => f.cnpj && f.cnpj.trim() !== '').length
        });
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoading(false);
    }
  };

  // Consultar CNPJ
  const handleConsultarCNPJ = async (cnpj) => {
    if (!cnpj) {
      toast.error('Digite um CNPJ para consultar');
      return;
    }

    try {
      const response = await filiaisService.consultarCNPJ(cnpj);
      if (response.success) {
        const dados = response.data;
        // Retornar os dados para o formulário preencher
        return {
          razao_social: dados.razao_social || '',
          filial: dados.nome_fantasia || dados.razao_social || '',
          logradouro: dados.logradouro || '',
          numero: dados.numero || '',
          bairro: dados.bairro || '',
          cidade: dados.municipio || '',
          estado: dados.uf || '',
          cep: dados.cep || ''
        };
      } else {
        toast.error(response.error);
        return null;
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      toast.error('Erro ao consultar CNPJ');
      return null;
    }
  };

  // Salvar filial
  const handleSaveFilial = async (data) => {
    try {
      if (editingFilial) {
        const response = await filiaisService.atualizar(editingFilial.id, data);
        if (response.success) {
          toast.success('Filial atualizada com sucesso!');
        } else {
          toast.error(response.error);
          return false;
        }
      } else {
        const response = await filiaisService.criar(data);
        if (response.success) {
          toast.success('Filial criada com sucesso!');
        } else {
          toast.error(response.error);
          return false;
        }
      }
      handleCloseModal();
      loadFiliais();
      return true;
    } catch (error) {
      console.error('Erro ao salvar filial:', error);
      toast.error('Erro ao salvar filial');
      return false;
    }
  };

  // Excluir filial
  const handleDeleteFilial = async (filialId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta filial?')) return;

    try {
      const response = await filiaisService.excluir(filialId);
      if (response.success) {
        toast.success('Filial excluída com sucesso!');
        loadFiliais();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Erro ao excluir filial:', error);
      toast.error('Erro ao excluir filial');
    }
  };

  // Exportar para XLSX
  const handleExportXLSX = async () => {
    try {
      const response = await filiaisService.exportarXLSX();
      if (response.success) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `filiais_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Exportar para PDF
  const handleExportPDF = async () => {
    try {
      const response = await filiaisService.exportarPDF();
      if (response.success) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `filiais_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Modal handlers
  const handleAddFilial = () => {
    setEditingFilial(null);
    setViewMode(false);
    setActiveTab('dados');
    setShowModal(true);
  };

  const handleEditFilial = (filial) => {
    setEditingFilial(filial);
    setViewMode(false);
    setActiveTab('dados');
    setShowModal(true);
  };

  const handleViewFilial = (filial) => {
    setEditingFilial(filial);
    setViewMode(true);
    setActiveTab('dados');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFilial(null);
    setViewMode(false);
    setActiveTab('dados');
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadFiliais();
  }, []);

  // Filtros
  const filteredFiliais = filiais.filter(filial => {
    const matchesSearch = filial.filial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         filial.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         filial.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || filial.status === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner inline={true} text="Carregando filiais..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Filiais</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAuditModal(true)}
          >
            <FaHistory className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Logs</span>
          </Button>
          {canCreate('filiais') && (
            <Button
              variant="primary"
              onClick={handleAddFilial}
            >
              <FaPlus className="mr-2" />
              Adicionar Filial
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Filiais"
          value={estatisticas.total_filiais}
          icon={FaBuilding}
          color="blue"
        />
        <StatCard
          title="Filiais Ativas"
          value={estatisticas.filiais_ativas}
          icon={FaCheckCircle}
          color="green"
        />
        <StatCard
          title="Filiais Inativas"
          value={estatisticas.filiais_inativas}
          icon={FaTimesCircle}
          color="red"
        />
        <StatCard
          title="Com CNPJ"
          value={estatisticas.com_cnpj}
          icon={FaMapMarkerAlt}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={() => { setSearchTerm(''); setStatusFilter('todos'); }}
        placeholder="Buscar por nome, cidade ou código..."
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
      {filteredFiliais.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm || statusFilter !== 'todos' ? 
            'Nenhuma filial encontrada com os filtros aplicados' : 
            'Nenhuma filial cadastrada'
          }
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <Table.Header>
              <Table.HeaderCell>Código</Table.HeaderCell>
              <Table.HeaderCell>CNPJ</Table.HeaderCell>
              <Table.HeaderCell>Filial</Table.HeaderCell>
              <Table.HeaderCell>Razão Social</Table.HeaderCell>
              <Table.HeaderCell>Cidade</Table.HeaderCell>
              <Table.HeaderCell>Estado</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Ações</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {filteredFiliais.map(filial => (
                <Table.Row key={filial.id}>
                  <Table.Cell>{filial.codigo_filial || '-'}</Table.Cell>
                  <Table.Cell>{filial.cnpj || '-'}</Table.Cell>
                  <Table.Cell>{filial.filial}</Table.Cell>
                  <Table.Cell>{filial.razao_social}</Table.Cell>
                  <Table.Cell>{filial.cidade}</Table.Cell>
                  <Table.Cell>{filial.estado}</Table.Cell>
                  <Table.Cell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      filial.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {filial.status === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleViewFilial(filial)}
                        title="Visualizar"
                      >
                        <FaEye className="text-green-600 text-xs sm:text-sm" />
                      </Button>
                      {canEdit('filiais') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleEditFilial(filial)}
                          title="Editar"
                        >
                          <FaEdit className="text-blue-600 text-xs sm:text-sm" />
                        </Button>
                      )}
                      {canDelete('filiais') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDeleteFilial(filial.id)}
                          title="Excluir"
                        >
                          <FaTrash className="text-red-600 text-xs sm:text-sm" />
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Modal de Cadastro/Edição/Visualização */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={viewMode ? 'Visualizar Filial' : editingFilial ? 'Editar Filial' : 'Adicionar Filial'}
        size="xl"
      >
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'dados'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('dados')}
            >
              Dados
            </button>
            {editingFilial && editingFilial.id && (
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'almoxarifados'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('almoxarifados')}
              >
                Almoxarifados
              </button>
            )}
          </div>
        </div>

        {activeTab === 'dados' && (
          <FilialForm
            onSubmit={handleSaveFilial}
            initialData={editingFilial}
            viewMode={viewMode}
            onConsultarCNPJ={handleConsultarCNPJ}
          />
        )}

        {activeTab === 'almoxarifados' && editingFilial && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Almoxarifados da Filial</h3>
              {!viewMode && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAlmoxarifadoModal(true)}
                >
                  <FaPlus className="mr-1" />
                  Novo Almoxarifado
                </Button>
              )}
            </div>
            <div className="text-center py-8 text-gray-500">
              Clique em "Novo Almoxarifado" para gerenciar os almoxarifados desta filial
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Almoxarifados */}
      <AlmoxarifadoModal
        filialId={editingFilial?.id}
        isOpen={showAlmoxarifadoModal}
        onClose={() => setShowAlmoxarifadoModal(false)}
        viewMode={viewMode}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
      />
    </div>
  );
};

export default Filiais; 