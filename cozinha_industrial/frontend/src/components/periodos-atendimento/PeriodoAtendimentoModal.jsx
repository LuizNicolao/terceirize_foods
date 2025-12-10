import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, ConfirmModal } from '../ui';
import { FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FoodsApiService from '../../services/FoodsApiService';
import periodosAtendimentoService from '../../services/periodosAtendimento';
import { useAuth } from '../../contexts/AuthContext';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';
import {
  SelecaoFilial,
  GerenciarPeriodos,
  BuscaUnidades,
  TabelaVinculos,
  NavegacaoUnidades,
  AcoesMassa
} from './sections';

/**
 * Modal para Vincular Períodos de Atendimento às Unidades Escolares
 * Baseado no padrão do sistema de implantação
 */
const PeriodoAtendimentoModal = ({
  isOpen,
  onClose,
  onSubmit,
  periodoAtendimento = null,
  isViewMode = false,
  loading = false
}) => {
  const { user } = useAuth();
  const [filialId, setFilialId] = useState('');
  const [filiais, setFiliais] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [vinculosSelecionados, setVinculosSelecionados] = useState({}); // { unidade_id: [periodo1, periodo2, ...] }
  const [unidadesPage, setUnidadesPage] = useState(1);
  const [unidadesTotalPages, setUnidadesTotalPages] = useState(1);
  const [unidadesTotalItems, setUnidadesTotalItems] = useState(0);
  const [unidadesItemsPerPage, setUnidadesItemsPerPage] = useState(20);
  const [buscaUnidade, setBuscaUnidade] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmacao, setConfirmacao] = useState({ aberto: false, acao: null });
  
  // Estados para períodos de atendimento (turnos)
  const [periodos, setPeriodos] = useState([]); // Array de { id: null|number, nome: string, codigo: string, status: 'ativo'|'inativo' }
  const [novoPeriodoNome, setNovoPeriodoNome] = useState('');
  const [mostrarFormNovoPeriodo, setMostrarFormNovoPeriodo] = useState(false);
  
  const isEditing = Boolean(periodoAtendimento);
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

  // Carregar filiais (apenas CD TOLEDO) e limpar dados quando modal fechar
  useEffect(() => {
    if (isOpen) {
      carregarFiliais();
    } else {
      // Limpar tudo quando modal fechar
      setPeriodos([]);
      setVinculosSelecionados({});
      setFilialId('');
      setBuscaUnidade('');
      setUnidadesPage(1);
      setUnidades([]);
      setUnidadesTotalItems(0);
      setUnidadesTotalPages(1);
      setNovoPeriodoNome('');
      setMostrarFormNovoPeriodo(false);
      setErrors({});
      resetDirty();
    }
  }, [isOpen, resetDirty]);

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

  // Carregar períodos existentes e vínculos quando editar
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isEditing && periodoAtendimento) {
      carregarDadosEdicao();
    } else {
      // Modo criação: limpar tudo e começar com períodos vazios
      // Não carregar períodos existentes - o usuário deve adicionar os períodos que quer vincular
      setPeriodos([]);
      setVinculosSelecionados({});
      setFilialId('');
      setBuscaUnidade('');
      setUnidadesPage(1);
      setUnidades([]);
      setUnidadesTotalItems(0);
      setUnidadesTotalPages(1);
      setNovoPeriodoNome('');
      setMostrarFormNovoPeriodo(false);
    }
  }, [isOpen, isEditing, periodoAtendimento]);

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
      
      // Filtrar apenas a filial "CD TOLEDO"
      allFiliaisData = allFiliaisData.filter(filial => {
        if (filial.filial) {
          const filialNome = filial.filial.toLowerCase().trim();
          return filialNome.includes('cd toledo') || 
                 filialNome === 'toledo' ||
                 filialNome.includes('toledo');
        }
        return false;
      });
      
      setFiliais(allFiliaisData);
      
      // Se só tem uma filial, selecionar automaticamente
      if (allFiliaisData.length === 1) {
        setFilialId(String(allFiliaisData[0].id));
      }
    } catch (error) {
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  };

  const carregarPeriodosExistentes = async () => {
    try {
      const response = await periodosAtendimentoService.listar({ status: 'ativo', limit: 1000 });
      if (response.success && response.data) {
        const periodosFormatados = response.data.map(p => ({
          id: p.id,
          nome: p.nome,
          codigo: p.codigo,
          status: p.status || 'ativo'
        }));
        setPeriodos(periodosFormatados);
      }
    } catch (error) {
    }
  };

  const carregarDadosEdicao = async () => {
    try {
      // Carregar filiais e selecionar CD TOLEDO primeiro
      await carregarFiliais();
      
      // Buscar unidades vinculadas ao período (incluindo inativas para edição)
      if (periodoAtendimento?.id) {
        const response = await periodosAtendimentoService.buscarUnidadesVinculadas(periodoAtendimento.id, true);
        
        if (response.success && response.data && response.data.length > 0) {
          // Coletar todos os IDs de unidades vinculadas
          const unidadesIds = new Set();
          response.data.forEach(vinculo => {
            unidadesIds.add(parseInt(vinculo.cozinha_industrial_id));
          });
          
          // Buscar TODOS os períodos vinculados a essas unidades usando o novo endpoint
          // Incluir inativos para mostrar no modal de edição
          try {
            const unidadesIdsArray = Array.from(unidadesIds);
            const periodosPorUnidadesResponse = await periodosAtendimentoService.buscarPeriodosPorUnidades(unidadesIdsArray, true);
            
            if (periodosPorUnidadesResponse.success && periodosPorUnidadesResponse.data) {
              const { vinculos: vinculosPorUnidade, periodos: periodosVinculados } = periodosPorUnidadesResponse.data;
              
              // Definir os períodos vinculados diretamente (sem merge com períodos existentes)
              if (periodosVinculados && periodosVinculados.length > 0) {
                const periodosFormatados = periodosVinculados.map(p => ({
                  id: p.id,
                  nome: p.nome,
                  codigo: p.codigo,
                  status: p.status || 'ativo'
                }));
                
                // Ordenar por nome para melhor visualização
                periodosFormatados.sort((a, b) => a.nome.localeCompare(b.nome));
                
                setPeriodos(periodosFormatados);
              } else {
                // Se não encontrou períodos vinculados, usar apenas o período atual
                setPeriodos([{
                  id: periodoAtendimento.id,
                  nome: periodoAtendimento.nome,
                  codigo: periodoAtendimento.codigo,
                  status: periodoAtendimento.status || 'ativo'
                }]);
              }
              
              // Usar os vínculos retornados
              setVinculosSelecionados(vinculosPorUnidade || {});
            } else {
              // Fallback: usar apenas o período atual
              setPeriodos([{
                id: periodoAtendimento.id,
                nome: periodoAtendimento.nome,
                codigo: periodoAtendimento.codigo,
                status: periodoAtendimento.status || 'ativo'
              }]);
              
              const vinculos = {};
              response.data.forEach(vinculo => {
                const unidadeId = String(vinculo.cozinha_industrial_id);
                if (!vinculos[unidadeId]) {
                  vinculos[unidadeId] = [];
                }
                vinculos[unidadeId].push(periodoAtendimento.id);
              });
              setVinculosSelecionados(vinculos);
            }
          } catch (error) {
            console.error('Erro ao buscar períodos por unidades:', error);
            // Fallback: usar apenas o período atual
            setPeriodos([{
              id: periodoAtendimento.id,
              nome: periodoAtendimento.nome,
              codigo: periodoAtendimento.codigo,
              status: periodoAtendimento.status || 'ativo'
            }]);
            
            const vinculos = {};
            response.data.forEach(vinculo => {
              const unidadeId = String(vinculo.cozinha_industrial_id);
              if (!vinculos[unidadeId]) {
                vinculos[unidadeId] = [];
              }
              vinculos[unidadeId].push(periodoAtendimento.id);
            });
            setVinculosSelecionados(vinculos);
          }
          
          // Buscar informações completas das unidades vinculadas
          const unidadesFiltradas = [];
          
          // Buscar todas as unidades ativas
          let todasUnidades = [];
          let page = 1;
          let hasMore = true;
          
          while (hasMore && page <= 50) {
            const responseUnidades = await FoodsApiService.getUnidadesEscolares({
              status: 'ativo',
              page,
              limit: 100
            });
            
            if (responseUnidades.success && responseUnidades.data && responseUnidades.data.length > 0) {
              todasUnidades = [...todasUnidades, ...responseUnidades.data];
              hasMore = responseUnidades.data.length === 100;
              page++;
            } else {
              hasMore = false;
            }
          }
          
          // Filtrar apenas unidades da CD TOLEDO e que estão vinculadas
          unidadesIds.forEach(unidadeId => {
            const unidadeFoods = todasUnidades.find(u => u.id === unidadeId);
            
            if (unidadeFoods) {
              const pertenceCDToledo = unidadeFoods.filial_nome && (
                unidadeFoods.filial_nome.toLowerCase().trim().includes('cd toledo') ||
                unidadeFoods.filial_nome.toLowerCase().trim() === 'toledo' ||
                unidadeFoods.filial_nome.toLowerCase().trim().includes('toledo')
              );
              
              if (pertenceCDToledo) {
                unidadesFiltradas.push(unidadeFoods);
              } else {
                // Se não encontrou no Foods, usar dados do backend
                const vinculo = response.data.find(v => v.cozinha_industrial_id === unidadeId);
                if (vinculo) {
                  unidadesFiltradas.push({
                    id: unidadeId,
                    nome_escola: vinculo.unidade_escolar?.nome_escola || vinculo.unidade_nome || `ID ${unidadeId}`,
                    filial_nome: 'CD TOLEDO'
                  });
                }
              }
            } else {
              // Se não encontrou no Foods, usar dados do backend
              const vinculo = response.data.find(v => v.cozinha_industrial_id === unidadeId);
              if (vinculo) {
                unidadesFiltradas.push({
                  id: unidadeId,
                  nome_escola: vinculo.unidade_escolar?.nome_escola || vinculo.unidade_nome || `ID ${unidadeId}`,
                  filial_nome: 'CD TOLEDO'
                });
              }
            }
          });
          
          setUnidades(unidadesFiltradas);
          setUnidadesTotalItems(unidadesFiltradas.length);
          setUnidadesTotalPages(1);
        } else {
          // Se não há unidades vinculadas, apenas carregar filiais
          setUnidades([]);
          setUnidadesTotalItems(0);
          setUnidadesTotalPages(1);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de edição:', error);
      toast.error('Erro ao carregar dados do período');
    }
  };

  const carregarUnidades = async (filialIdParam, page = 1, limit = unidadesItemsPerPage) => {
    setLoadingUnidades(true);
    try {
      // Buscar todas as unidades (sem filtro de filial na API, pois vamos filtrar no frontend)
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
      
      // Filtrar apenas unidades escolares vinculadas à filial "CD TOLEDO"
      // O campo que contém o nome da filial é 'filial_nome'
      const unidadesFiltradas = todasUnidades.filter(unidade => {
        if (unidade.filial_nome) {
          const filialNome = unidade.filial_nome.toLowerCase().trim();
          // Verificar se contém "cd toledo" ou apenas "toledo" (caso o nome seja apenas "TOLEDO")
          return filialNome.includes('cd toledo') || 
                 filialNome === 'toledo' ||
                 filialNome.includes('toledo');
        }
        // Se não tiver informação de filial, não incluir
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
      toast.error('Erro ao carregar unidades escolares');
      setUnidades([]);
      setUnidadesTotalPages(1);
      setUnidadesTotalItems(0);
    } finally {
      setLoadingUnidades(false);
    }
  };

  const handleFilialChange = (value) => {
    if (isEditing) {
      return;
    }
    setFilialId(value);
    setUnidadesPage(1);
    setVinculosSelecionados({});
    setErrors(prev => ({ ...prev, filial_id: undefined }));
    if (!isViewMode) {
      markDirty();
    }
  };

  const handlePeriodoToggle = useCallback((unidadeId, periodoId) => {
    setVinculosSelecionados(prev => {
      // Garantir que unidadeId seja string para consistência
      const unidadeIdStr = String(unidadeId);
      const unidadeVinculos = prev[unidadeIdStr] || [];
      
      // Toggle: se já está selecionado, remove; se não está, adiciona
      const novosVinculos = unidadeVinculos.includes(periodoId)
        ? unidadeVinculos.filter(p => p !== periodoId)
        : [...unidadeVinculos, periodoId];

      // Criar novo objeto sem a chave se não houver mais vínculos
      const novo = { ...prev };
      if (novosVinculos.length > 0) {
        novo[unidadeIdStr] = novosVinculos;
      } else {
        // Remover a chave completamente se não houver mais vínculos
        delete novo[unidadeIdStr];
      }
      
      return novo;
    });
    if (!isViewMode) {
      markDirty();
    }
  }, [isViewMode, markDirty]);

  const handleAdicionarPeriodo = () => {
    if (!novoPeriodoNome.trim()) {
      toast.error('Digite o nome do período');
      return;
    }

    const nomeUpper = novoPeriodoNome.trim().toUpperCase();
    
    // Gerar código válido: apenas letras maiúsculas, números e underscore
    // Remover caracteres especiais e espaços, pegar primeiros 20 caracteres
    let codigo = nomeUpper
      .replace(/[^A-Z0-9_]/g, '') // Remove tudo que não é A-Z, 0-9 ou _
      .substring(0, 20);
    
    // Se não sobrou nada após limpar, usar um código padrão baseado no nome
    if (!codigo || codigo.length === 0) {
      // Gerar código único baseado no nome e timestamp
      const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
      codigo = 'PER_' + timestamp;
    }
    
    // Garantir que o código tenha pelo menos 1 caractere e no máximo 20
    if (codigo.length > 20) {
      codigo = codigo.substring(0, 20);
    }
    
    // Garantir que o código comece com letra ou número (não underscore)
    if (codigo.startsWith('_')) {
      codigo = 'PER' + codigo;
    }
    
    // Verificar se já existe período com mesmo nome
    if (periodos.some(p => p.nome.toUpperCase() === nomeUpper)) {
      toast.error('Já existe um período com este nome');
      return;
    }
    
    // Verificar se já existe período com mesmo código
    if (periodos.some(p => p.codigo.toUpperCase() === codigo.toUpperCase())) {
      toast.error('Já existe um período com este código');
      return;
    }

    const novoPeriodo = {
      id: null, // null indica que é novo
      nome: nomeUpper,
      codigo: codigo,
      status: 'ativo'
    };

    setPeriodos([...periodos, novoPeriodo]);
    setNovoPeriodoNome('');
    setMostrarFormNovoPeriodo(false);
    markDirty();
    toast.success('Período adicionado. Marque as unidades e salve para criar.');
  };

  const handleRemoverPeriodo = (periodo) => {
    if (periodo.id === null) {
      // Encontrar o índice do período na lista
      const periodoIndex = periodos.findIndex(p => 
        p.id === null && p.nome === periodo.nome && p.codigo === periodo.codigo
      );
      
      if (periodoIndex === -1) return;
      
      const periodoRemovido = periodos[periodoIndex];
      const periodoIdRef = `novo_${periodoRemovido.nome}`;
      
      // Remover período novo (ainda não salvo)
      setPeriodos(periodos.filter((p, idx) => idx !== periodoIndex));
      
      // Limpar vínculos deste período
      setVinculosSelecionados(prev => {
        const novos = {};
        Object.entries(prev).forEach(([unidadeId, periodoIds]) => {
          const filtrados = periodoIds.filter(id => id !== periodoIdRef);
          if (filtrados.length > 0) {
            novos[unidadeId] = filtrados;
          }
        });
        return novos;
      });
      toast.success('Período removido');
      markDirty();
    } else {
      toast.error('Não é possível remover períodos já salvos. Desative-os no cadastro.');
    }
  };

  const handleEditarPeriodo = (periodo, novoNome) => {
    if (periodo.id === null) {
      // Encontrar o índice do período na lista
      const periodoIndex = periodos.findIndex(p => 
        p.id === null && p.nome === periodo.nome && p.codigo === periodo.codigo
      );
      
      if (periodoIndex === -1) return;
      
      const periodoAntigo = periodos[periodoIndex];
      const periodoIdRefAntigo = `novo_${periodoAntigo.nome}`;
      
      // Verificar se já existe período com mesmo nome
      const nomeUpper = novoNome.toUpperCase();
      if (periodos.some((p, idx) => idx !== periodoIndex && p.nome.toUpperCase() === nomeUpper)) {
        toast.error('Já existe um período com este nome');
        return;
      }
      
      // Gerar novo código baseado no novo nome
      let codigo = nomeUpper
        .replace(/[^A-Z0-9_]/g, '')
        .substring(0, 20);
      
      if (!codigo || codigo.length === 0) {
        const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
        codigo = 'PER_' + timestamp;
      }
      
      if (codigo.length > 20) {
        codigo = codigo.substring(0, 20);
      }
      
      if (codigo.startsWith('_')) {
        codigo = 'PER' + codigo;
      }
      
      // Verificar se já existe período com mesmo código
      if (periodos.some((p, idx) => idx !== periodoIndex && p.codigo.toUpperCase() === codigo.toUpperCase())) {
        toast.error('Já existe um período com este código');
        return;
      }
      
      const periodoAtualizado = {
        ...periodoAntigo,
        nome: nomeUpper,
        codigo: codigo
      };
      
      // Atualizar período na lista
      const novosPeriodos = [...periodos];
      novosPeriodos[periodoIndex] = periodoAtualizado;
      setPeriodos(novosPeriodos);
      
      // Atualizar referências nos vínculos
      const periodoIdRefNovo = `novo_${nomeUpper}`;
      setVinculosSelecionados(prev => {
        const novos = {};
        Object.entries(prev).forEach(([unidadeId, periodoIds]) => {
          const atualizados = periodoIds.map(id => 
            id === periodoIdRefAntigo ? periodoIdRefNovo : id
          );
          if (atualizados.length > 0) {
            novos[unidadeId] = atualizados;
          }
        });
        return novos;
      });
      
      toast.success('Período atualizado');
      markDirty();
    } else {
      toast.error('Não é possível editar períodos já salvos. Edite-os no cadastro.');
    }
  };

  const buscarTodasUnidadesDaFilial = useCallback(async () => {
    if (!filialId) {
      return [];
    }

    try {
      let todas = [];
      let page = 1;
      const limit = 200;
      let continuar = true;

      // Buscar todas as unidades (sem filtro de filial na API)
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

      // Filtrar apenas unidades escolares vinculadas à filial "CD TOLEDO"
      // O campo que contém o nome da filial é 'filial_nome'
      const unidadesFiltradas = todas.filter(unidade => {
        if (unidade.filial_nome) {
          const filialNome = unidade.filial_nome.toLowerCase().trim();
          // Verificar se contém "cd toledo" ou apenas "toledo" (caso o nome seja apenas "TOLEDO")
          return filialNome.includes('cd toledo') || 
                 filialNome === 'toledo' ||
                 filialNome.includes('toledo');
        }
        // Se não tiver informação de filial, não incluir
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

    if (acao === 'selecionar' && periodos.length === 0) {
      toast.error('Adicione pelo menos um período antes de marcar unidades');
      return;
    }

    setConfirmacao({ aberto: true, acao });
  }, [filialId, isViewMode, periodos.length]);

  const executarAcaoMassa = useCallback(async () => {
    if (confirmacao.acao === 'selecionar') {
      const todasUnidades = await buscarTodasUnidadesDaFilial();

      if (!todasUnidades || todasUnidades.length === 0) {
        toast.error('Nenhuma unidade encontrada para a filial selecionada');
        setConfirmacao({ aberto: false, acao: null });
        return;
      }

      const periodosDisponiveis = periodos.map(p => p.id === null ? `novo_${p.nome}` : p.id);

      setVinculosSelecionados(prev => {
        const novos = { ...prev };
        todasUnidades.forEach(unidade => {
          novos[unidade.id] = [...periodosDisponiveis];
        });
        return novos;
      });
      toast.success('Todos os períodos marcados para as unidades da filial selecionada.');
      markDirty();
    }

    if (confirmacao.acao === 'desmarcar') {
      setVinculosSelecionados({});
      toast.success('Todos os períodos foram desmarcados.');
      markDirty();
    }

    setConfirmacao({ aberto: false, acao: null });
  }, [confirmacao, buscarTodasUnidadesDaFilial, periodos, markDirty]);

  const fecharConfirmacao = useCallback(() => {
    setConfirmacao({ aberto: false, acao: null });
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!isEditing && !filialId) {
      newErrors.filial_id = 'Filial é obrigatória';
    }

    if (periodos.length === 0) {
      newErrors.periodos = 'Adicione pelo menos um período de atendimento';
    }

    // Verificar se há pelo menos um vínculo selecionado
    const totalVinculos = Object.values(vinculosSelecionados).reduce(
      (acc, periodoIds) => acc + (periodoIds?.length || 0),
      0
    );

    if (!isEditing && totalVinculos === 0) {
      newErrors.vinculos = 'Selecione ao menos um período para uma unidade';
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

    // Separar períodos novos dos existentes
    const periodosNovos = periodos.filter(p => p.id === null);
    const periodosExistentes = periodos.filter(p => p.id !== null);

    // Criar períodos novos primeiro
    const periodosCriados = [];
    for (const periodoNovo of periodosNovos) {
      try {
        // Validar código antes de enviar
        if (!periodoNovo.codigo || periodoNovo.codigo.length === 0) {
          toast.error(`Código inválido para o período ${periodoNovo.nome}`);
          return;
        }
        
        // Garantir que o código está no formato correto
        const codigoValido = periodoNovo.codigo.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        if (codigoValido.length === 0) {
          toast.error(`Código inválido para o período ${periodoNovo.nome}. Use apenas letras, números e underscore.`);
          return;
        }
        
        // Preparar dados para envio
        const dadosParaEnviar = {
          nome: periodoNovo.nome.trim(),
          codigo: codigoValido.trim(),
          status: periodoNovo.status === 'ativo' || periodoNovo.status === 'inativo' 
            ? periodoNovo.status 
            : 'ativo'
        };
        
        const result = await periodosAtendimentoService.criar(dadosParaEnviar);
        
        if (result.success && result.data) {
          periodosCriados.push(result.data.id);
        } else {
          toast.error(result.error || `Erro ao criar período ${periodoNovo.nome}`);
          return;
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erro desconhecido';
        toast.error(`Erro ao criar período ${periodoNovo.nome}: ${errorMessage}`);
        // Não continuar se houver erro ao criar período
        return;
      }
    }

    // Mapear IDs: novos períodos recebem IDs criados, existentes mantêm seus IDs
    const periodoIdMap = new Map();
    let novoIndex = 0;
    periodos.forEach(periodo => {
      if (periodo.id === null) {
        periodoIdMap.set(`novo_${periodo.nome}`, periodosCriados[novoIndex]);
        novoIndex++;
      } else {
        periodoIdMap.set(periodo.id, periodo.id);
      }
    });

    // Criar array de vínculos para salvar
    const vinculosParaSalvar = [];
    const unidadesSelecionadas = [];
    
    Object.entries(vinculosSelecionados).forEach(([unidadeId, periodoIds]) => {
      if (periodoIds && periodoIds.length > 0) {
        // Adicionar unidade à lista para debug
        const unidade = unidades.find(u => u.id === parseInt(unidadeId));
        if (unidade && !unidadesSelecionadas.find(u => u.id === parseInt(unidadeId))) {
          unidadesSelecionadas.push({
            id: parseInt(unidadeId),
            nome: unidade.nome_escola || unidade.nome || `ID ${unidadeId}`,
            filial_nome: unidade.filial_nome || 'Não informado'
          });
        }
        
        periodoIds.forEach(periodoIdRef => {
          const periodoIdReal = periodoIdMap.get(periodoIdRef);
          if (periodoIdReal) {
            vinculosParaSalvar.push({
              cozinha_industrial_id: parseInt(unidadeId),
              periodo_atendimento_id: periodoIdReal,
              status: 'ativo'
            });
          }
        });
      }
    });
    

    // Agrupar vínculos por período para criar/atualizar
    // IMPORTANTE: Processar TODOS os períodos, mesmo os que não têm vínculos selecionados
    // Isso garante que períodos desmarcados tenham seus vínculos removidos
    const vinculosPorPeriodo = {};
    
    // Inicializar todos os períodos com arrays vazios
    periodos.forEach(periodo => {
      const periodoIdReal = periodo.id === null 
        ? periodoIdMap.get(`novo_${periodo.nome}`)
        : periodo.id;
      if (periodoIdReal) {
        vinculosPorPeriodo[periodoIdReal] = [];
      }
    });
    
    // Adicionar os vínculos selecionados
    vinculosParaSalvar.forEach(vinculo => {
      if (!vinculosPorPeriodo[vinculo.periodo_atendimento_id]) {
        vinculosPorPeriodo[vinculo.periodo_atendimento_id] = [];
      }
      vinculosPorPeriodo[vinculo.periodo_atendimento_id].push(vinculo.cozinha_industrial_id);
    });

    // Criar/atualizar vínculos para TODOS os períodos
    // Períodos com array vazio terão todos os vínculos removidos pelo backend
    for (const [periodoId, unidadeIds] of Object.entries(vinculosPorPeriodo)) {
      try {
        // O backend remove todos os vínculos e adiciona os novos
        // Se unidadeIds estiver vazio, todos os vínculos serão removidos
        const result = await periodosAtendimentoService.vincularUnidades(parseInt(periodoId), unidadeIds);
        if (!result.success) {
          toast.error(result.error || `Erro ao vincular unidades ao período ${periodoId}`, { duration: 6000 });
          return;
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erro desconhecido';
        toast.error(`Erro ao vincular unidades: ${errorMessage}`, { duration: 6000 });
        return;
      }
    }

    toast.success('Períodos e vínculos salvos com sucesso!');
    resetDirty();
    
    // Fechar modal (seguindo padrão de receitas e pratos)
    onClose();
    
    // Chamar onSubmit para recarregar a lista (seguindo padrão de receitas e pratos)
    if (onSubmit) {
      onSubmit();
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

  const unidadesExibidas = unidades;
  const totalItemsParaExibicao = unidadesTotalItems;
  const totalPagesParaExibicao = unidadesTotalPages;
  
  const inicioItem = totalItemsParaExibicao === 0
    ? 0
    : (unidadesPage - 1) * unidadesItemsPerPage + 1;
  const fimItem = totalItemsParaExibicao === 0
    ? 0
    : Math.min(unidadesPage * unidadesItemsPerPage, totalItemsParaExibicao);
  const possuiUnidadesListadas = filialId && totalItemsParaExibicao > 0;

  const modalTitle = isEditing
    ? (isViewMode ? 'Visualizar Vínculos' : 'Editar Vínculos')
    : 'Vincular Períodos de Atendimento às Unidades';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => requestClose(onClose)}
        title={modalTitle}
        size="full"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Primeira Linha - Seleção de Filial e Gerenciar Períodos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Seleção de Filial */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Filial
              </h3>
              <div className="space-y-3">
                <SelecaoFilial
                  filialId={filialId}
                  filiais={filiais}
                  loadingFiliais={loadingFiliais}
                  isViewMode={isViewMode}
                  isEditing={isEditing}
                  errors={errors}
                  onFilialChange={handleFilialChange}
                />
              </div>
            </div>

            {/* Card 2: Gerenciar Períodos */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Períodos de Atendimento
              </h3>
              <div className="space-y-3">
                <GerenciarPeriodos
                  periodos={periodos}
                  novoPeriodoNome={novoPeriodoNome}
                  mostrarFormNovoPeriodo={mostrarFormNovoPeriodo}
                  isViewMode={isViewMode}
                  onNovoPeriodoNomeChange={setNovoPeriodoNome}
                  onMostrarFormNovoPeriodoChange={setMostrarFormNovoPeriodo}
                  onAdicionarPeriodo={handleAdicionarPeriodo}
                  onRemoverPeriodo={handleRemoverPeriodo}
                  onEditarPeriodo={handleEditarPeriodo}
                />
              </div>
            </div>
          </div>

          {/* Segunda Linha - Busca de Unidades */}
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

          {/* Terceira Linha - Tabela Matriz */}
          {filialId && periodos.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-green-500">
                <h3 className="text-sm font-semibold text-gray-700">
                  Vínculos de Períodos e Unidades
                </h3>
                {!isViewMode && !isEditing && (
                  <AcoesMassa
                    loadingUnidades={loadingUnidades}
                    loading={loading}
                    periodos={periodos}
                    isEditing={isEditing}
                    onConfirmarAcaoMassa={confirmarAcaoMassa}
                  />
                )}
              </div>
              <div className="space-y-3">
                <TabelaVinculos
                  periodos={periodos}
                  unidades={unidadesExibidas}
                  loadingUnidades={loadingUnidades}
                  filialId={filialId}
                  vinculosSelecionados={vinculosSelecionados}
                  isViewMode={isViewMode}
                  loading={loading}
                  onPeriodoToggle={handlePeriodoToggle}
                />
              </div>
            </div>
          )}

          {/* Erro de validação */}
          {(errors.vinculos || errors.periodos) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                {errors.vinculos || errors.periodos}
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
                    : 'Salvar Vínculos'}
              </Button>
            </div>
          )}
        </form>

        <ConfirmModal
          isOpen={confirmacao.aberto}
          onClose={fecharConfirmacao}
          onConfirm={executarAcaoMassa}
          title={confirmacao.acao === 'selecionar' ? 'Marcar todos os períodos?' : 'Desmarcar todos os períodos?'}
          message={confirmacao.acao === 'selecionar'
            ? 'Deseja marcar todos os períodos de atendimento para todas as unidades listadas?'
            : 'Deseja desmarcar todos os períodos de atendimento?'}
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

export default PeriodoAtendimentoModal;
