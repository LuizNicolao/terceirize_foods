import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, ConfirmModal } from '../ui';
import { FaSave, FaTimes, FaEye, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FoodsApiService from '../../services/FoodsApiService';
import contratosService from '../../services/contratos';
import { useAuth } from '../../contexts/AuthContext';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';
import {
  InformacoesBasicas,
  UnidadesEscolares,
  ProdutosComerciais
} from './sections';

/**
 * Modal para gerenciar Contratos
 * Com 3 abas: Informações Básicas, Unidades Escolares, Produtos Comerciais
 */
const ContratoModal = ({
  isOpen,
  onClose,
  onSubmit,
  contrato = null,
  isViewMode = false,
  loading = false
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basicas');
  
  // Estados da aba básicas
  const [nome, setNome] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [filialId, setFilialId] = useState('');
  const [centroCustoId, setCentroCustoId] = useState('');
  const [status, setStatus] = useState('ativo');
  
  // Estados para dropdowns
  const [clientes, setClientes] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingCentrosCusto, setLoadingCentrosCusto] = useState(false);
  
  // Estados da aba unidades
  const [unidades, setUnidades] = useState([]);
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [buscaUnidade, setBuscaUnidade] = useState('');
  
  // Estados da aba produtos
  const [produtosComerciais, setProdutosComerciais] = useState([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]); // [{ produto_comercial_id, valor_unitario }]
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [produtosCarregados, setProdutosCarregados] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  
  const isEditing = Boolean(contrato);
  const {
    markDirty,
    resetDirty,
    requestClose,
    showConfirm,
    confirmClose,
    cancelClose,
    confirmTitle,
    confirmMessage
  } = useUnsavedChangesPrompt();

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      carregarClientes();
      carregarFiliais();
      if (isEditing && contrato) {
        carregarDadosEdicao();
      } else {
        resetForm();
      }
    }
  }, [isOpen, contrato]);

  // Carregar centros de custo quando filial mudar
  useEffect(() => {
    if (filialId) {
      carregarCentrosCusto(filialId);
    } else {
      setCentrosCusto([]);
      setCentroCustoId('');
    }
  }, [filialId]);

  // Carregar unidades quando entrar na aba unidades
  useEffect(() => {
    if (activeTab === 'unidades' && filialId) {
      carregarUnidades();
    }
  }, [activeTab, filialId]);

  // Carregar produtos quando entrar na aba produtos (apenas uma vez)
  useEffect(() => {
    if (activeTab === 'produtos' && !produtosCarregados) {
      carregarProdutosComerciais();
      setProdutosCarregados(true);
    }
  }, [activeTab, produtosCarregados]);

  const resetForm = () => {
    setNome('');
    setClienteId('');
    setFilialId('');
    setCentroCustoId('');
    setStatus('ativo');
    setUnidadesSelecionadas([]);
    setProdutosSelecionados([]);
    setErrors({});
    setActiveTab('basicas');
    setProdutosCarregados(false);
    setBuscaProduto('');
    resetDirty();
  };

  const carregarClientes = async () => {
    setLoadingClientes(true);
    try {
      const response = await FoodsApiService.getClientesAtivos({ limit: 1000 });
      if (response.success) {
        setClientes(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const carregarFiliais = async () => {
    setLoadingFiliais(true);
    try {
      // Carregar todas as filiais com paginação (como na tela de receitas)
      let allFiliaisData = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getFiliais({ page, limit });
        
        if (result.success && result.data) {
          let items = [];
          if (result.data.items) {
            items = result.data.items;
          } else if (Array.isArray(result.data)) {
            items = result.data;
          } else if (result.data.data) {
            items = result.data.data;
          }
          
          allFiliaisData = [...allFiliaisData, ...items];
          hasMore = items.length === limit;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setFiliais(allFiliaisData);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  };

  const carregarCentrosCusto = async (filialIdParam) => {
    setLoadingCentrosCusto(true);
    try {
      const response = await FoodsApiService.getCentrosCusto({ 
        filial_id: filialIdParam,
        status: 1,
        limit: 1000 
      });
      if (response.success) {
        setCentrosCusto(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
    } finally {
      setLoadingCentrosCusto(false);
    }
  };

  const carregarUnidades = async () => {
    setLoadingUnidades(true);
    try {
      const params = { status: 'ativo', limit: 1000 };
      if (buscaUnidade) {
        params.search = buscaUnidade;
      }
      const response = await FoodsApiService.getUnidadesEscolares(params);
      if (response.success) {
        // Filtrar apenas unidades da filial selecionada
        let unidadesFiltradas = response.data || [];
        if (filialId) {
          unidadesFiltradas = unidadesFiltradas.filter(u => 
            u.filial_id === parseInt(filialId)
          );
        }
        setUnidades(unidadesFiltradas);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
    } finally {
      setLoadingUnidades(false);
    }
  };

  const carregarProdutosComerciais = async () => {
    setLoadingProdutos(true);
    try {
      // Carregar todos os produtos ativos com paginação (como na tela de receitas)
      let todasProdutos = [];
      let page = 1;
      let hasMore = true;
      const limit = 100;
      
      while (hasMore && page <= 50) {
        const response = await FoodsApiService.getProdutosComerciais({ 
          status: 1, 
          page, 
          limit 
        });
        
        if (response.success && response.data) {
          // Tratar diferentes formatos de resposta (como na tela de receitas)
          let items = [];
          if (response.data.items) {
            items = response.data.items;
          } else if (Array.isArray(response.data)) {
            items = response.data;
          } else if (response.data.data) {
            items = response.data.data;
          }
          
          todasProdutos = [...todasProdutos, ...items];
          hasMore = items.length === limit;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setProdutosComerciais(todasProdutos);
    } catch (error) {
      console.error('Erro ao carregar produtos comerciais:', error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const carregarDadosEdicao = async () => {
    if (!contrato?.id) return;
    
    try {
      // Carregar dados completos do contrato
      const response = await contratosService.buscarPorId(contrato.id);
      if (response.success && response.data) {
        const dados = response.data;
        setNome(dados.nome || '');
        setClienteId(String(dados.cliente_id || ''));
        setFilialId(String(dados.filial_id || ''));
        setCentroCustoId(String(dados.centro_custo_id || ''));
        setStatus(dados.status || 'ativo');
        
        // Carregar unidades vinculadas
        const unidadesResponse = await contratosService.buscarUnidadesVinculadas(dados.id);
        if (unidadesResponse.success) {
          setUnidadesSelecionadas(
            unidadesResponse.data.map(u => u.cozinha_industrial_id)
          );
        }
        
        // Carregar produtos vinculados
        const produtosResponse = await contratosService.buscarProdutosVinculados(dados.id);
        if (produtosResponse.success) {
          setProdutosSelecionados(
            produtosResponse.data.map(p => ({
              produto_comercial_id: p.produto_comercial_id,
              valor_unitario: parseFloat(p.valor_unitario) || 0
            }))
          );
        }
        
        // Carregar produtos comerciais se ainda não foram carregados
        if (!produtosCarregados) {
          await carregarProdutosComerciais();
          setProdutosCarregados(true);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de edição:', error);
      toast.error('Erro ao carregar dados do contrato');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!nome || !nome.trim()) {
      newErrors.nome = 'Nome do contrato é obrigatório';
    }
    
    if (!clienteId) {
      newErrors.clienteId = 'Cliente é obrigatório';
    }
    
    if (!filialId) {
      newErrors.filialId = 'Filial é obrigatória';
    }
    
    if (!centroCustoId) {
      newErrors.centroCustoId = 'Centro de custo é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setSaving(true);
    try {
      const dadosBasicos = {
        nome: nome.trim(),
        cliente_id: parseInt(clienteId),
        filial_id: parseInt(filialId),
        centro_custo_id: parseInt(centroCustoId),
        status
      };
      
      let contratoId;
      
      if (isEditing) {
        // Atualizar contrato
        const updateResponse = await contratosService.atualizar(contrato.id, dadosBasicos);
        if (!updateResponse.success) {
          toast.error(updateResponse.error || 'Erro ao atualizar contrato');
          setSaving(false);
          return;
        }
        contratoId = contrato.id;
      } else {
        // Criar contrato
        const createResponse = await contratosService.criar(dadosBasicos);
        if (!createResponse.success) {
          toast.error(createResponse.error || 'Erro ao criar contrato');
          setSaving(false);
          return;
        }
        contratoId = createResponse.data?.id;
      }
      
      // Vincular unidades
      if (unidadesSelecionadas.length > 0) {
        const unidadesResponse = await contratosService.vincularUnidades(
          contratoId,
          unidadesSelecionadas
        );
        if (!unidadesResponse.success) {
          toast.error(unidadesResponse.error || 'Erro ao vincular unidades');
        }
      }
      
      // Vincular produtos (filtrar apenas os que têm produto_comercial_id)
      const produtosParaVincular = produtosSelecionados.filter(
        p => p.produto_comercial_id && p.valor_unitario > 0
      );
      
      if (produtosParaVincular.length > 0) {
        const produtosResponse = await contratosService.vincularProdutos(
          contratoId,
          produtosParaVincular
        );
        if (!produtosResponse.success) {
          toast.error(produtosResponse.error || 'Erro ao vincular produtos');
        }
      }
      
      toast.success('Contrato salvo com sucesso!');
      resetDirty();
      onClose();
      setTimeout(() => {
        if (onSubmit) {
          onSubmit();
        }
      }, 300);
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      toast.error('Erro ao salvar contrato');
    } finally {
      setSaving(false);
    }
  };

  const handleUnidadeToggle = (unidadeId) => {
    setUnidadesSelecionadas(prev => {
      if (prev.includes(unidadeId)) {
        return prev.filter(id => id !== unidadeId);
      } else {
        return [...prev, unidadeId];
      }
    });
    markDirty();
  };

  const handleSelecionarTodasUnidades = () => {
    const todasUnidadesIds = unidades.map(u => u.id);
    setUnidadesSelecionadas(todasUnidadesIds);
    markDirty();
  };

  const handleDesmarcarTodasUnidades = () => {
    setUnidadesSelecionadas([]);
    markDirty();
  };

  const handleAdicionarProduto = () => {
    setProdutosSelecionados(prev => [
      ...prev,
      { produto_comercial_id: null, valor_unitario: 0 }
    ]);
    markDirty();
  };

  const handleRemoverProduto = (index) => {
    setProdutosSelecionados(prev => prev.filter((_, i) => i !== index));
    markDirty();
  };

  const handleProdutoChange = (index, produtoId) => {
    // Verificar se produto já foi adicionado
    const produtoJaAdicionado = produtosSelecionados.some(
      (p, i) => i !== index && p.produto_comercial_id === produtoId
    );
    
    if (produtoJaAdicionado) {
      toast.error('Este produto já foi adicionado');
      return;
    }
    
    setProdutosSelecionados(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        produto_comercial_id: produtoId
      };
      return updated;
    });
    markDirty();
  };

  const handleValorUnitarioChange = (index, valor) => {
    setProdutosSelecionados(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        valor_unitario: parseFloat(valor) || 0
      };
      return updated;
    });
    markDirty();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => requestClose(onClose)} size="full" hideCloseButton={true}>
        <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                {isViewMode ? <FaEye className="w-5 h-5 text-white" /> : isEditing ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isViewMode ? 'Visualizar Contrato' : isEditing ? 'Editar Contrato' : 'Novo Contrato'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isViewMode ? 'Visualizando informações do contrato' : isEditing ? 'Editando informações do contrato' : 'Preencha as informações do novo contrato'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => requestClose(onClose)}
                className="p-2"
              >
                <FaTimes className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Navegação por Abas */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('basicas')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'basicas'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Informações Básicas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('unidades')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'unidades'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Unidades Escolares
                  {unidadesSelecionadas.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unidadesSelecionadas.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('produtos')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'produtos'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Produtos Comerciais
                  {produtosSelecionados.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {produtosSelecionados.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Conteúdo das Abas */}
            <div className="space-y-6 min-h-[400px]">
              {/* Aba 1: Informações Básicas */}
              {activeTab === 'basicas' && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-opacity duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas do Contrato</h3>
                  <InformacoesBasicas
                    nome={nome}
                    clienteId={clienteId}
                    filialId={filialId}
                    centroCustoId={centroCustoId}
                    status={status}
                    clientes={clientes}
                    filiais={filiais}
                    centrosCusto={centrosCusto}
                    loadingClientes={loadingClientes}
                    loadingFiliais={loadingFiliais}
                    loadingCentrosCusto={loadingCentrosCusto}
                    isViewMode={isViewMode}
                    errors={errors}
                    onNomeChange={(value) => {
                      setNome(value);
                      markDirty();
                    }}
                    onClienteChange={(value) => {
                      setClienteId(value);
                      markDirty();
                    }}
                    onFilialChange={(value) => {
                      setFilialId(value);
                      markDirty();
                    }}
                    onCentroCustoChange={(value) => {
                      setCentroCustoId(value);
                      markDirty();
                    }}
                    onStatusChange={(value) => {
                      setStatus(value);
                      markDirty();
                    }}
                  />
                </div>
              )}

              {/* Aba 2: Unidades Escolares */}
              {activeTab === 'unidades' && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-opacity duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Unidades Escolares Vinculadas</h3>
                  <UnidadesEscolares
                    filialId={filialId}
                    unidades={unidades}
                    unidadesSelecionadas={unidadesSelecionadas}
                    buscaUnidade={buscaUnidade}
                    loadingUnidades={loadingUnidades}
                    isViewMode={isViewMode}
                    saving={saving}
                    onBuscaUnidadeChange={setBuscaUnidade}
                    onBuscaUnidadeSubmit={carregarUnidades}
                    onUnidadeToggle={handleUnidadeToggle}
                    onSelecionarTodas={handleSelecionarTodasUnidades}
                    onDesmarcarTodas={handleDesmarcarTodasUnidades}
                  />
                </div>
              )}

              {/* Aba 3: Produtos Comerciais */}
              {activeTab === 'produtos' && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-opacity duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Comerciais e Valores Unitários</h3>
                  <ProdutosComerciais
                    produtosComerciais={produtosComerciais}
                    produtosSelecionados={produtosSelecionados}
                    buscaProduto={buscaProduto}
                    loadingProdutos={loadingProdutos}
                    isViewMode={isViewMode}
                    saving={saving}
                    onBuscaProdutoChange={setBuscaProduto}
                    onBuscaProdutoSubmit={() => {}} // Não precisa mais, busca é local
                    onAdicionarProduto={handleAdicionarProduto}
                    onRemoverProduto={handleRemoverProduto}
                    onProdutoChange={handleProdutoChange}
                    onValorUnitarioChange={handleValorUnitarioChange}
                  />
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            {!isViewMode && (
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => requestClose(onClose)}
                  variant="ghost"
                  disabled={saving}
                >
                  <FaTimes className="mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                >
                  <FaSave className="mr-2" />
                  {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar Contrato'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </Modal>
      <ConfirmModal
        isOpen={showConfirm}
        onClose={cancelClose}
        onConfirm={confirmClose}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Descartar"
        cancelText="Continuar editando"
        variant="danger"
      />
    </>
  );
};

export default ContratoModal;

