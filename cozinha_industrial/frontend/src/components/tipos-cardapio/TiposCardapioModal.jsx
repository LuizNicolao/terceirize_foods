import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, ConfirmModal } from '../ui';
import { FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FoodsApiService from '../../services/FoodsApiService';
import contratosService from '../../services/contratos';
import tiposCardapioService from '../../services/tiposCardapio';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';
import {
  SelecaoFilialCentroCustoContrato,
  GerenciarProdutosComerciais,
  BuscaUnidades,
  TabelaVinculos,
  NavegacaoUnidades,
  AcoesMassa
} from './sections';

/**
 * Modal para Vincular Tipos de Cardápio (Produtos Comerciais) às Unidades Escolares
 * Baseado no padrão do modal de Períodos de Atendimento
 */
const TiposCardapioModal = ({
  isOpen,
  onClose,
  onSubmit,
  tipoCardapio = null,
  isViewMode = false,
  loading = false
}) => {
  const [nome, setNome] = useState('');
  const [filialId, setFilialId] = useState('');
  const [centroCustoId, setCentroCustoId] = useState('');
  const [contratoId, setContratoId] = useState('');
  const [filiais, setFiliais] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingCentrosCusto, setLoadingCentrosCusto] = useState(false);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [vinculosSelecionados, setVinculosSelecionados] = useState({}); // { unidade_id: [produto1, produto2, ...] }
  const [unidadesPage, setUnidadesPage] = useState(1);
  const [unidadesTotalPages, setUnidadesTotalPages] = useState(1);
  const [unidadesTotalItems, setUnidadesTotalItems] = useState(0);
  const [unidadesItemsPerPage, setUnidadesItemsPerPage] = useState(20);
  const [buscaUnidade, setBuscaUnidade] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmacao, setConfirmacao] = useState({ aberto: false, acao: null });
  
  // Estados para produtos comerciais
  const [produtos, setProdutos] = useState([]); // Array de { produto_comercial_id: number, nome: string, codigo: string }
  
  const isEditing = Boolean(tipoCardapio);
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
      carregarFiliais();
      if (isEditing && tipoCardapio) {
        carregarDadosEdicao();
      } else {
        resetForm();
      }
    } else {
      // Limpar tudo quando modal fechar
      setProdutos([]);
      setVinculosSelecionados({});
      setFilialId('');
      setCentroCustoId('');
      setContratoId('');
      setNome('');
      setBuscaUnidade('');
      setUnidadesPage(1);
      setUnidades([]);
      setUnidadesTotalItems(0);
      setUnidadesTotalPages(1);
      setErrors({});
      resetDirty();
    }
  }, [isOpen, isEditing, tipoCardapio, resetDirty]);

  // Carregar centros de custo quando filial mudar
  useEffect(() => {
    if (filialId) {
      carregarCentrosCusto(filialId);
    } else if (!filialId) {
      setCentrosCusto([]);
      setCentroCustoId('');
    }
  }, [filialId]);

  // Carregar contratos quando centro de custo mudar
  useEffect(() => {
    if (centroCustoId) {
      carregarContratos(centroCustoId);
    } else if (!centroCustoId) {
      setContratos([]);
      setContratoId('');
    }
  }, [centroCustoId]);

  // Carregar unidades quando filial mudar
  useEffect(() => {
    if (!isOpen || isEditing) {
      return;
    }

    if (filialId) {
      carregarUnidades(filialId, unidadesPage, unidadesItemsPerPage);
    } else {
      setUnidades([]);
      setUnidadesTotalPages(1);
      setUnidadesTotalItems(0);
    }
  }, [filialId, unidadesPage, unidadesItemsPerPage, isOpen, isEditing, buscaUnidade]);

  const resetForm = () => {
    setNome('');
    setFilialId('');
    setCentroCustoId('');
    setContratoId('');
    setProdutos([]);
    setVinculosSelecionados({});
    setBuscaUnidade('');
    setUnidadesPage(1);
    setUnidades([]);
    setUnidadesTotalItems(0);
    setUnidadesTotalPages(1);
    setErrors({});
    resetDirty();
  };

  const carregarFiliais = async () => {
    setLoadingFiliais(true);
    try {
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
      toast.error('Erro ao carregar filiais');
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
      toast.error('Erro ao carregar centros de custo');
    } finally {
      setLoadingCentrosCusto(false);
    }
  };

  const carregarContratos = async (centroCustoIdParam) => {
    setLoadingContratos(true);
    try {
      const result = await contratosService.listar({ 
        centro_custo_id: centroCustoIdParam, 
        limit: 1000 
      });
      
      if (result.success && result.data) {
        setContratos(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoadingContratos(false);
    }
  };

  const carregarUnidades = async (filialIdParam, page = 1, limit = unidadesItemsPerPage) => {
    setLoadingUnidades(true);
    try {
      // Buscar todas as unidades (filtrar por filial no frontend)
      let todasUnidades = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore && currentPage <= 50) {
        const response = await FoodsApiService.getUnidadesEscolares({
          status: 'ativo',
          page: currentPage,
          limit: 100,
          search: buscaUnidade || undefined
        });
        
        if (response.success && response.data && response.data.length > 0) {
          todasUnidades = [...todasUnidades, ...response.data];
          hasMore = response.data.length === 100;
          currentPage++;
        } else {
          hasMore = false;
        }
      }
      
      // Filtrar apenas unidades da filial selecionada
      const unidadesFiltradas = todasUnidades.filter(unidade => {
        if (unidade.filial_id) {
          return parseInt(unidade.filial_id) === parseInt(filialIdParam);
        }
        return false;
      });
      
      // Aplicar paginação no frontend
      const totalItems = unidadesFiltradas.length;
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const currentPageFinal = Math.min(page, totalPages);
      const startIndex = (currentPageFinal - 1) * limit;
      const endIndex = startIndex + limit;
      const unidadesPaginadas = unidadesFiltradas.slice(startIndex, endIndex);
      
      setUnidades(unidadesPaginadas);
      setUnidadesTotalPages(totalPages);
      setUnidadesTotalItems(totalItems);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      toast.error('Erro ao carregar unidades escolares');
      setUnidades([]);
      setUnidadesTotalPages(1);
      setUnidadesTotalItems(0);
    } finally {
      setLoadingUnidades(false);
    }
  };

  const carregarDadosEdicao = async () => {
    try {
      // Carregar dados completos do tipo de cardápio
      const response = await tiposCardapioService.buscarPorId(tipoCardapio.id);
      if (response.success && response.data) {
        const dados = response.data;
        
        // Primeiro, definir a filial
        const filialIdStr = String(dados.filial_id || '');
        setFilialId(filialIdStr);
        
        // Carregar centros de custo antes de definir o centro de custo
        if (dados.filial_id) {
          await carregarCentrosCusto(dados.filial_id);
          // Aguardar um pouco para garantir que o estado foi atualizado
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Depois de carregar centros de custo, definir o centro de custo
        const centroCustoIdStr = String(dados.centro_custo_id || '');
        setCentroCustoId(centroCustoIdStr);
        
        // Carregar contratos antes de definir o contrato
        if (dados.centro_custo_id) {
          await carregarContratos(dados.centro_custo_id);
          // Aguardar um pouco para garantir que o estado foi atualizado
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Depois de carregar contratos, definir o contrato
        const contratoIdStr = String(dados.contrato_id || '');
        setContratoId(contratoIdStr);
        
        // Carregar produtos vinculados
        const produtosResponse = await tiposCardapioService.buscarProdutosVinculados(dados.id);
        if (produtosResponse.success && produtosResponse.data) {
          const produtosFormatados = produtosResponse.data.map(p => ({
            produto_comercial_id: p.produto_comercial_id,
            nome: p.produto_comercial_nome || `Produto ${p.produto_comercial_id}`,
            codigo: '' // Será preenchido quando buscar do foods
          }));
          setProdutos(produtosFormatados);
        }
        
        // Carregar vínculos: se houver unidades vinculadas e produtos vinculados,
        // criar uma matriz completa (todas as unidades com todos os produtos)
        // Isso porque os vínculos são salvos apenas na tabela tipos_cardapio_unidades
        if (dados.unidades_vinculadas && dados.unidades_vinculadas.length > 0 && 
            dados.produtos_vinculados && dados.produtos_vinculados.length > 0) {
          const vinculos = {};
          dados.unidades_vinculadas.forEach(unidade => {
            const unidadeId = String(unidade.unidade_id);
            vinculos[unidadeId] = dados.produtos_vinculados.map(p => p.produto_comercial_id);
          });
          setVinculosSelecionados(vinculos);
        }
        
        // Carregar unidades para exibição
        if (dados.filial_id) {
          await carregarUnidades(dados.filial_id, 1, unidadesItemsPerPage);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de edição:', error);
      toast.error('Erro ao carregar dados do tipo de cardápio');
    }
  };

  const handleFilialChange = (value) => {
    setFilialId(value || '');
    setCentroCustoId('');
    setContratoId('');
    setUnidadesPage(1);
    if (!isEditing) {
      setVinculosSelecionados({});
    }
    setErrors(prev => ({ ...prev, filial_id: undefined }));
    if (!isViewMode) {
      markDirty();
    }
  };

  const handleCentroCustoChange = (value) => {
    setCentroCustoId(value || '');
    setContratoId('');
    setErrors(prev => ({ ...prev, centro_custo_id: undefined }));
    if (!isViewMode) {
      markDirty();
    }
  };

  const handleContratoChange = (value) => {
    setContratoId(value || '');
    setErrors(prev => ({ ...prev, contrato_id: undefined }));
    if (!isViewMode) {
      markDirty();
    }
  };

  const handleProdutoToggle = useCallback((unidadeId, produtoId) => {
    setVinculosSelecionados(prev => {
      const unidadeIdStr = String(unidadeId);
      const unidadeVinculos = prev[unidadeIdStr] || [];
      
      // Toggle: se já está selecionado, remove; se não está, adiciona
      const novosVinculos = unidadeVinculos.includes(produtoId)
        ? unidadeVinculos.filter(p => p !== produtoId)
        : [...unidadeVinculos, produtoId];

      // Criar novo objeto sem a chave se não houver mais vínculos
      const novo = { ...prev };
      if (novosVinculos.length > 0) {
        novo[unidadeIdStr] = novosVinculos;
      } else {
        delete novo[unidadeIdStr];
      }
      
      return novo;
    });
    if (!isViewMode) {
      markDirty();
    }
  }, [isViewMode, markDirty]);

  const handleAdicionarProduto = (produto) => {
    // Verificar se produto já foi adicionado
    if (produtos.some(p => p.produto_comercial_id === produto.produto_comercial_id)) {
      toast.error('Este produto já foi adicionado');
      return;
    }
    
    setProdutos(prev => [...prev, produto]);
    markDirty();
  };

  const handleRemoverProduto = (produto) => {
    setProdutos(prev => prev.filter(p => p.produto_comercial_id !== produto.produto_comercial_id));
    
    // Remover vínculos deste produto
    setVinculosSelecionados(prev => {
      const novos = {};
      Object.entries(prev).forEach(([unidadeId, produtoIds]) => {
        const filtrados = produtoIds.filter(id => id !== produto.produto_comercial_id);
        if (filtrados.length > 0) {
          novos[unidadeId] = filtrados;
        }
      });
      return novos;
    });
    markDirty();
  };

  const handleMarcarTodos = useCallback(() => {
    if (unidades.length === 0 || produtos.length === 0) return;
    
    setVinculosSelecionados(prev => {
      const novo = { ...prev };
      unidades.forEach(unidade => {
        const unidadeIdStr = String(unidade.id);
        const todosProdutosIds = produtos.map(p => p.produto_comercial_id);
        novo[unidadeIdStr] = todosProdutosIds;
      });
      return novo;
    });
    if (!isViewMode) {
      markDirty();
    }
  }, [unidades, produtos, isViewMode, markDirty]);

  const handleDesmarcarTodos = useCallback(() => {
    setVinculosSelecionados({});
    if (!isViewMode) {
      markDirty();
    }
  }, [isViewMode, markDirty]);

  const buscarTodasUnidadesDaFilial = useCallback(async () => {
    if (!filialId) {
      return [];
    }

    try {
      let todas = [];
      let page = 1;
      const limit = 200;
      let continuar = true;

      while (continuar && page <= 50) {
        const response = await FoodsApiService.getUnidadesEscolares({
          status: 'ativo',
          page,
          limit
        });

        if (response.success && response.data && response.data.length > 0) {
          todas = todas.concat(response.data);
          
          if (response.data.length < limit) {
            continuar = false;
          } else {
            page += 1;
          }
        } else {
          continuar = false;
        }
      }

      // Filtrar apenas unidades da filial selecionada
      const unidadesFiltradas = todas.filter(unidade => {
        if (unidade.filial_id) {
          return parseInt(unidade.filial_id) === parseInt(filialId);
        }
        return false;
      });

      return unidadesFiltradas;
    } catch (erro) {
      toast.error('Erro ao buscar unidades da filial selecionada');
      return [];
    }
  }, [filialId]);

  const confirmarAcaoMassa = useCallback((acao) => {
    if (isViewMode) {
      return;
    }

    if (acao === 'selecionar' && !filialId) {
      toast.error('Selecione uma filial para marcar as unidades');
      return;
    }

    if (acao === 'selecionar' && produtos.length === 0) {
      toast.error('Adicione pelo menos um produto antes de marcar unidades');
      return;
    }

    setConfirmacao({ aberto: true, acao });
  }, [filialId, isViewMode, produtos.length]);

  const executarAcaoMassa = useCallback(async () => {
    if (confirmacao.acao === 'selecionar') {
      const todasUnidades = await buscarTodasUnidadesDaFilial();

      if (!todasUnidades || todasUnidades.length === 0) {
        toast.error('Nenhuma unidade encontrada para a filial selecionada');
        setConfirmacao({ aberto: false, acao: null });
        return;
      }

      const produtosDisponiveis = produtos.map(p => p.produto_comercial_id);

      setVinculosSelecionados(prev => {
        const novos = { ...prev };
        todasUnidades.forEach(unidade => {
          novos[unidade.id] = [...produtosDisponiveis];
        });
        return novos;
      });
      toast.success('Todos os produtos marcados para as unidades da filial selecionada.');
      markDirty();
    }

    if (confirmacao.acao === 'desmarcar') {
      setVinculosSelecionados({});
      toast.success('Todos os produtos foram desmarcados.');
      markDirty();
    }

    setConfirmacao({ aberto: false, acao: null });
  }, [confirmacao, buscarTodasUnidadesDaFilial, produtos, markDirty]);

  const fecharConfirmacao = useCallback(() => {
    setConfirmacao({ aberto: false, acao: null });
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!filialId) {
      newErrors.filial_id = 'Filial é obrigatória';
    }

    if (!centroCustoId) {
      newErrors.centro_custo_id = 'Centro de custo é obrigatório';
    }

    if (!contratoId) {
      newErrors.contrato_id = 'Contrato é obrigatório';
    }

    if (produtos.length === 0) {
      newErrors.produtos = 'Adicione pelo menos um produto comercial';
    }

    // Verificar se há pelo menos um vínculo selecionado
    const totalVinculos = Object.values(vinculosSelecionados).reduce(
      (acc, produtoIds) => acc + (produtoIds?.length || 0),
      0
    );

    if (!isEditing && totalVinculos === 0) {
      newErrors.vinculos = 'Selecione ao menos um produto para uma unidade';
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

    try {
      // Criar estrutura de vínculos: array de { unidade_id, produto_comercial_id }
      const vinculos = [];
      Object.entries(vinculosSelecionados).forEach(([unidadeId, produtoIds]) => {
        produtoIds.forEach(produtoId => {
          vinculos.push({
            unidade_id: parseInt(unidadeId),
            produto_comercial_id: produtoId
          });
        });
      });

      // Gerar nome automaticamente se não estiver editando ou se o nome estiver vazio
      let nomeFinal = nome.trim();
      if (!nomeFinal || nomeFinal === '') {
        const filialNome = filiais.find(f => String(f.id) === filialId)?.filial || filiais.find(f => String(f.id) === filialId)?.nome || '';
        const contratoNome = contratos.find(c => String(c.id) === contratoId)?.nome || '';
        const produtosNomes = produtos.map(p => p.nome || p.codigo || '').filter(Boolean).slice(0, 3).join(', ');
        
        if (filialNome && contratoNome) {
          nomeFinal = `Tipo de Cardápio - ${filialNome} - ${contratoNome}`;
          if (produtosNomes) {
            nomeFinal += ` - ${produtosNomes}`;
          }
        } else if (produtos.length > 0) {
          nomeFinal = `Tipo de Cardápio - ${produtosNomes || produtos.length + ' produto(s)'}`;
        } else {
          nomeFinal = 'Tipo de Cardápio';
        }
      }

      const dadosBasicos = {
        nome: nomeFinal,
        filial_id: parseInt(filialId),
        centro_custo_id: parseInt(centroCustoId),
        contrato_id: parseInt(contratoId),
        produtos_comerciais: produtos.map(p => ({
          produto_comercial_id: p.produto_comercial_id
        })),
        vinculos: vinculos
      };

      let response;
      
      if (isEditing) {
        // Atualizar tipo de cardápio
        response = await tiposCardapioService.atualizar(tipoCardapio.id, dadosBasicos);
      } else {
        // Criar tipo de cardápio
        response = await tiposCardapioService.criar(dadosBasicos);
      }

      if (response.success) {
        toast.success(response.message || 'Tipo de cardápio salvo com sucesso!');
        resetDirty();
        onClose();
        setTimeout(() => {
          if (onSubmit) {
            onSubmit();
          }
        }, 300);
      } else {
        toast.error(response.error || 'Erro ao salvar tipo de cardápio');
      }
    } catch (error) {
      console.error('Erro ao salvar tipo de cardápio:', error);
      toast.error('Erro ao salvar tipo de cardápio');
    }
  };

  const handleBuscaUnidade = (value) => {
    setBuscaUnidade(value);
    setUnidadesPage(1);
  };

  const handleBuscaUnidadeSubmit = () => {
    if (!filialId) {
      toast.error('Selecione uma filial antes de buscar unidades');
      return;
    }

    carregarUnidades(filialId, 1, unidadesItemsPerPage);
  };

  const handleItemsPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (Number.isNaN(value)) {
      return;
    }

    setUnidadesItemsPerPage(value);
    setUnidadesPage(1);
    
    if (filialId) {
      carregarUnidades(filialId, 1, value);
    }
  };

  const modalTitle = isEditing
    ? (isViewMode ? 'Visualizar Tipo de Cardápio' : 'Editar Tipo de Cardápio')
    : 'Novo Tipo de Cardápio';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => requestClose(onClose)}
        title={modalTitle}
        size="full"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Primeira Linha - Filial, Centro de Custo e Contrato | Tipo de Cardápio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Filial, Centro de Custo e Contrato */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Filial, Centro de Custo e Contrato
              </h3>
              <div className="space-y-3">
                <SelecaoFilialCentroCustoContrato
                  filialId={filialId}
                  centroCustoId={centroCustoId}
                  contratoId={contratoId}
                  filiais={filiais}
                  centrosCusto={centrosCusto}
                  contratos={contratos}
                  loadingFiliais={loadingFiliais}
                  loadingCentrosCusto={loadingCentrosCusto}
                  loadingContratos={loadingContratos}
                  isViewMode={isViewMode}
                  isEditing={isEditing}
                  errors={errors}
                  onFilialChange={handleFilialChange}
                  onCentroCustoChange={handleCentroCustoChange}
                  onContratoChange={handleContratoChange}
                />
              </div>
            </div>

            {/* Card 2: Tipo de Cardápio */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Tipo de Cardápio
              </h3>
              <div className="space-y-3">
                <GerenciarProdutosComerciais
                  produtos={produtos}
                  isViewMode={isViewMode}
                  onAdicionarProduto={handleAdicionarProduto}
                  onRemoverProduto={handleRemoverProduto}
                />
                {errors.produtos && (
                  <p className="text-sm text-red-600">{errors.produtos}</p>
                )}
              </div>
            </div>
          </div>

          {/* Segunda Linha - Busca de Unidades Escolares */}
          {filialId && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Buscar Unidades Escolares
              </h3>
              <div className="space-y-3">
                <BuscaUnidades
                  buscaUnidade={buscaUnidade}
                  loadingUnidades={loadingUnidades}
                  onBuscaUnidadeChange={handleBuscaUnidade}
                  onBuscaUnidadeSubmit={handleBuscaUnidadeSubmit}
                />
              </div>
            </div>
          )}

          {/* Quarta Linha - Tabela Matriz */}
          {filialId && produtos.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-green-500">
                <h3 className="text-sm font-semibold text-gray-700">
                  Vínculos de Produtos e Unidades
                </h3>
                {!isViewMode && !isEditing && (
                  <AcoesMassa
                    loadingUnidades={loadingUnidades}
                    loading={loading}
                    produtos={produtos}
                    isEditing={isEditing}
                    onConfirmarAcaoMassa={confirmarAcaoMassa}
                  />
                )}
              </div>
              <div className="space-y-3">
                <TabelaVinculos
                  produtos={produtos}
                  unidades={unidades}
                  loadingUnidades={loadingUnidades}
                  filialId={filialId}
                  vinculosSelecionados={vinculosSelecionados}
                  isViewMode={isViewMode}
                  loading={loading}
                  onProdutoToggle={handleProdutoToggle}
                  onMarcarTodos={handleMarcarTodos}
                  onDesmarcarTodos={handleDesmarcarTodos}
                />
              </div>
            </div>
          )}

          {/* Erro de validação */}
          {(errors.vinculos || errors.produtos) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                {errors.vinculos || errors.produtos}
              </p>
            </div>
          )}

          {/* Paginação */}
          {!isEditing && filialId && (
            <NavegacaoUnidades
              unidadesItemsPerPage={unidadesItemsPerPage}
              unidadesPage={unidadesPage}
              unidadesTotalPages={unidadesTotalPages}
              unidadesTotalItems={unidadesTotalItems}
              loadingUnidades={loadingUnidades}
              onItemsPerPageChange={handleItemsPerPageChange}
              onPageChange={setUnidadesPage}
            />
          )}

          {/* Botões */}
          {!isViewMode && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
              <Button
                type="button"
                onClick={() => requestClose(onClose)}
                variant="ghost"
                disabled={loading}
              >
                <FaTimes className="mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || (!isEditing && loadingUnidades)}
              >
                <FaSave className="mr-2" />
                {loading
                  ? 'Salvando...'
                  : isEditing
                    ? 'Salvar alterações'
                    : 'Salvar'}
              </Button>
            </div>
          )}
        </form>

        <ConfirmModal
          isOpen={confirmacao.aberto}
          onClose={fecharConfirmacao}
          onConfirm={executarAcaoMassa}
          title={confirmacao.acao === 'selecionar' ? 'Marcar todos os produtos?' : 'Desmarcar todos os produtos?'}
          message={confirmacao.acao === 'selecionar'
            ? 'Deseja marcar todos os produtos comerciais para todas as unidades listadas?'
            : 'Deseja desmarcar todos os produtos comerciais?'}
          confirmText={confirmacao.acao === 'selecionar' ? 'Marcar todos' : 'Desmarcar todos'}
          cancelText="Cancelar"
          variant={confirmacao.acao === 'desmarcar' ? 'danger' : 'primary'}
        />
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

export default TiposCardapioModal;
