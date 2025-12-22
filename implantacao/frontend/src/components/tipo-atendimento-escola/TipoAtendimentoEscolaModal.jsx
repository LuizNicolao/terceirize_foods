import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, SearchableSelect, ConfirmModal } from '../ui';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Pagination } from '../ui';
import toast from 'react-hot-toast';
import FoodsApiService from '../../services/FoodsApiService';
import escolasService from '../../services/escolasService';
import TipoAtendimentoEscolaService from '../../services/tipoAtendimentoEscolaService';
import { useAuth } from '../../contexts/AuthContext';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';

const TipoAtendimentoEscolaModal = ({
  isOpen,
  onClose,
  onSave,
  tiposAtendimento = [],
  editingItem = null,
  viewMode = false,
  loading = false,
  buscarPorEscola = async () => [],
  onSaveComplete = null // Callback quando salvar for concluído
}) => {
  const { user } = useAuth();
  const [filialId, setFilialId] = useState('');
  const [filiais, setFiliais] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [vinculosSelecionados, setVinculosSelecionados] = useState({}); // { escola_id: [tipo1, tipo2, ...] }
  const [vinculosIniciais, setVinculosIniciais] = useState({}); // Estado inicial para comparar mudanças
  const [escolasPage, setEscolasPage] = useState(1);
  const [escolasTotalPages, setEscolasTotalPages] = useState(1);
  const [escolasTotalItems, setEscolasTotalItems] = useState(0);
  const [escolasItemsPerPage, setEscolasItemsPerPage] = useState(20);
  const [buscaEscola, setBuscaEscola] = useState('');
  const [errors, setErrors] = useState({});
  const [statusAtivo, setStatusAtivo] = useState(true);
  const [confirmacao, setConfirmacao] = useState({ aberto: false, acao: null });
  const isEditing = Boolean(editingItem);
  const isViewMode = viewMode;
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

  useEffect(() => {
    if (!isOpen || isViewMode) {
      resetDirty();
    }
  }, [isOpen, isViewMode, resetDirty]);

  // Carregar filiais
  useEffect(() => {
    if (isOpen) {
      carregarFiliais();
    }
  }, [isOpen]);

  // Carregar escolas quando filial mudar (apenas criação)
  useEffect(() => {
    if (!isOpen || isEditing) {
      return;
    }

    if (filialId) {
      carregarEscolas(filialId, escolasPage, escolasItemsPerPage);
    } else {
      setEscolas([]);
      setEscolasTotalPages(1);
      setEscolasTotalItems(0);
    }
  }, [filialId, escolasPage, escolasItemsPerPage, isOpen, isEditing, buscaEscola]);

  // Preparar estado quando abrir modal (criação ou edição)
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isEditing && editingItem) {
      const escolaId = editingItem.escola_id;
      const filialIdItem = editingItem.filial_id ? String(editingItem.filial_id) : '';

      setFilialId(filialIdItem);
      setBuscaEscola('');
      setEscolasPage(1);
      setStatusAtivo(editingItem.ativo !== undefined ? Boolean(editingItem.ativo) : true);

      // Carregar todas as escolas da filial que têm tipos de atendimento configurados
      const carregarEscolasDaFilial = async () => {
        try {
          setLoadingEscolas(true);
          
          if (!filialIdItem) {
            // Fallback: mostrar apenas a escola do editingItem
      const escolaSelecionada = {
        id: escolaId,
        nome_escola: editingItem.nome_escola || '',
        rota: editingItem.rota || '',
        cidade: editingItem.cidade || '',
        filial_id: editingItem.filial_id || null,
        filial_nome: editingItem.filial_nome || ''
      };
      setEscolas([escolaSelecionada]);
      setEscolasTotalItems(1);
      setEscolasTotalPages(1);

          const tiposExistentes = await buscarPorEscola(escolaId);
          const tiposSelecionados = Array.isArray(tiposExistentes) && tiposExistentes.length > 0
            ? tiposExistentes
                .filter(item => item && item.tipo_atendimento)
                .map(item => item.tipo_atendimento)
            : editingItem.tipo_atendimento
              ? [editingItem.tipo_atendimento]
              : [];
            const vinculosIniciaisMap = { [escolaId]: tiposSelecionados };
            setVinculosSelecionados(vinculosIniciaisMap);
            // Salvar estado inicial
            setVinculosIniciais(JSON.parse(JSON.stringify(vinculosIniciaisMap)));
            setLoadingEscolas(false);
            return;
          }

          // Buscar todos os vínculos da tabela tipos_atendimento_escola de uma vez
          // Isso evita fazer múltiplas requisições (uma por escola)
          let pagina = 1;
          const limite = 1000; // Limite alto para buscar todos de uma vez
          let todosVinculos = [];
          let continuar = true;

          while (continuar) {
            const responseVinculos = await TipoAtendimentoEscolaService.listar({
              page: pagina,
              limit: limite,
              ativo: true // Apenas vínculos ativos
            });

            if (responseVinculos.success && responseVinculos.data) {
              todosVinculos = todosVinculos.concat(responseVinculos.data);
              
              if (responseVinculos.data.length < limite) {
                continuar = false;
              } else {
                pagina += 1;
              }
            } else {
              continuar = false;
            }
            
            // Limite de segurança
            if (pagina > 10) {
              continuar = false;
            }
          }

          // Filtrar vínculos pela filial e agrupar por escola
          const filialIdNum = parseInt(filialIdItem);
          const escolasComTipos = [];
          const vinculosMap = {};
          const escolasMap = new Map(); // Para evitar duplicatas

          for (const vinculo of todosVinculos) {
            // Verificar se a escola pertence à filial
            if (vinculo.filial_id === filialIdNum) {
              const escolaId = vinculo.escola_id;
              
              // Extrair tipos de atendimento
              const tiposSelecionados = Array.isArray(vinculo.tipos_atendimento)
                ? vinculo.tipos_atendimento
                : vinculo.tipo_atendimento
                  ? [vinculo.tipo_atendimento]
                  : [];

              // Incluir apenas escolas que têm tipos de atendimento configurados
              if (tiposSelecionados.length > 0) {
                if (!escolasMap.has(escolaId)) {
                  escolasComTipos.push({
                    id: escolaId,
                    nome_escola: vinculo.nome_escola || '',
                    rota: vinculo.rota || '',
                    cidade: vinculo.cidade || '',
                    filial_id: vinculo.filial_id || filialIdNum,
                    filial_nome: vinculo.filial_nome || editingItem.filial_nome || ''
                  });
                  escolasMap.set(escolaId, true);
                }
                
                // Agrupar tipos por escola (pode haver múltiplos registros por escola)
                if (!vinculosMap[escolaId]) {
                  vinculosMap[escolaId] = [];
                }
                // Adicionar tipos únicos
                tiposSelecionados.forEach(tipo => {
                  if (!vinculosMap[escolaId].includes(tipo)) {
                    vinculosMap[escolaId].push(tipo);
                  }
                });
              }
            }
          }

          if (escolasComTipos.length > 0) {
            // Calcular paginação
            const totalItems = escolasComTipos.length;
            const totalPages = Math.max(1, Math.ceil(totalItems / escolasItemsPerPage));
            
            setEscolas(escolasComTipos);
            setEscolasTotalItems(totalItems);
            setEscolasTotalPages(totalPages);
            setVinculosSelecionados(vinculosMap);
            // Salvar estado inicial para comparar mudanças depois
            setVinculosIniciais(JSON.parse(JSON.stringify(vinculosMap)));
          } else {
            // Se não encontrou escolas com tipos, mostrar apenas a escola do editingItem
            const escolaSelecionada = {
              id: escolaId,
              nome_escola: editingItem.nome_escola || '',
              rota: editingItem.rota || '',
              cidade: editingItem.cidade || '',
              filial_id: editingItem.filial_id || null,
              filial_nome: editingItem.filial_nome || ''
            };
            setEscolas([escolaSelecionada]);
            setEscolasTotalItems(1);
            setEscolasTotalPages(1);

            const tiposExistentes = await buscarPorEscola(escolaId);
            const tiposSelecionados = Array.isArray(tiposExistentes) && tiposExistentes.length > 0
              ? tiposExistentes
                  .filter(item => item && item.tipo_atendimento)
                  .map(item => item.tipo_atendimento)
              : editingItem.tipo_atendimento
                ? [editingItem.tipo_atendimento]
                : [];
            
          const vinculosIniciaisMap = { [escolaId]: tiposSelecionados };
          setVinculosSelecionados(vinculosIniciaisMap);
          // Salvar estado inicial
          setVinculosIniciais(JSON.parse(JSON.stringify(vinculosIniciaisMap)));
          }
        } catch (error) {
          console.error('Erro ao carregar escolas da filial para visualização/edição:', error);
          // Fallback: mostrar apenas a escola do editingItem
          const escolaSelecionada = {
            id: escolaId,
            nome_escola: editingItem.nome_escola || '',
            rota: editingItem.rota || '',
            cidade: editingItem.cidade || '',
            filial_id: editingItem.filial_id || null,
            filial_nome: editingItem.filial_nome || ''
          };
          setEscolas([escolaSelecionada]);
          setEscolasTotalItems(1);
          setEscolasTotalPages(1);

          try {
            const tiposExistentes = await buscarPorEscola(escolaId);
            const tiposSelecionados = Array.isArray(tiposExistentes) && tiposExistentes.length > 0
              ? tiposExistentes
                  .filter(item => item && item.tipo_atendimento)
                  .map(item => item.tipo_atendimento)
              : editingItem.tipo_atendimento
                ? [editingItem.tipo_atendimento]
                : [];
            const vinculosIniciaisMap = { [escolaId]: tiposSelecionados };
            setVinculosSelecionados(vinculosIniciaisMap);
            // Salvar estado inicial
            setVinculosIniciais(JSON.parse(JSON.stringify(vinculosIniciaisMap)));
          } catch (err) {
            console.error('Erro ao carregar tipos da escola:', err);
            const vinculosIniciaisMap = { [escolaId]: editingItem.tipo_atendimento ? [editingItem.tipo_atendimento] : [] };
            setVinculosSelecionados(vinculosIniciaisMap);
            // Salvar estado inicial
            setVinculosIniciais(JSON.parse(JSON.stringify(vinculosIniciaisMap)));
          }
        } finally {
          setLoadingEscolas(false);
        }
      };

      carregarEscolasDaFilial();
    } else {
      setVinculosSelecionados({});
      setVinculosIniciais({});
      setFilialId('');
      setBuscaEscola('');
      setEscolasPage(1);
      setStatusAtivo(true);
      setEscolas([]);
      setEscolasTotalItems(0);
      setEscolasTotalPages(1);
    }
  }, [isOpen, isEditing, editingItem, buscarPorEscola, user]);

  const carregarFiliais = async () => {
    setLoadingFiliais(true);
    try {
      const response = await FoodsApiService.getFiliais({ ativo: true });
      if (response.success) {
        setFiliais(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  };

  const carregarEscolas = async (filialIdParam, page = 1, limit = escolasItemsPerPage) => {
    setLoadingEscolas(true);
    try {
      const response = await escolasService.listar(
        { 
          filial_id: filialIdParam,
          page,
          limit,
          search: buscaEscola || undefined
        },
        user
      );
      if (response.success) {
        setEscolas(response.data || []);
        // Se a resposta tiver paginação, usar ela
        if (response.pagination) {
          const {
            totalItems: paginatedTotalItems,
            totalPages: paginatedTotalPages,
            itemsPerPage: paginatedItemsPerPage,
            total,
            last_page,
            per_page
          } = response.pagination;

          const resolvedItemsPerPage = paginatedItemsPerPage || per_page || limit || escolasItemsPerPage;
          const resolvedTotalItems = paginatedTotalItems ?? total ?? response.data?.length ?? 0;
          const resolvedTotalPages = paginatedTotalPages || last_page || Math.max(1, Math.ceil((resolvedTotalItems || 0) / (resolvedItemsPerPage || 1)));

          setEscolasTotalPages(resolvedTotalPages);
          setEscolasTotalItems(resolvedTotalItems);
        } else {
          // Fallback: calcular paginação básica
          setEscolasTotalPages(1);
          setEscolasTotalItems(response.data?.length || 0);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      toast.error('Erro ao carregar escolas');
    } finally {
      setLoadingEscolas(false);
    }
  };

  const handleFilialChange = (value) => {
    if (isEditing) {
      return;
    }
    setFilialId(value);
    setEscolasPage(1);
    setVinculosSelecionados({});
    setErrors(prev => ({ ...prev, filial_id: undefined }));
    if (!isViewMode) {
      markDirty();
    }
  };

  const handleTipoToggle = useCallback((escolaId, tipoValue) => {
    setVinculosSelecionados(prev => {
      const escolaVinculos = prev[escolaId] || [];
      const novosVinculos = escolaVinculos.includes(tipoValue)
        ? escolaVinculos.filter(t => t !== tipoValue)
        : [...escolaVinculos, tipoValue];

      return {
        ...prev,
        [escolaId]: novosVinculos.length > 0 ? novosVinculos : undefined
      };
    });
    if (!isViewMode) {
      markDirty();
    }
  }, [isViewMode, markDirty, isEditing, editingItem]);

  const isTipoSelecionado = (escolaId, tipoValue) => {
    return vinculosSelecionados[escolaId]?.includes(tipoValue) || false;
  };

  const buscarTodasEscolasDaFilial = useCallback(async () => {
    if (!filialId) {
      return [];
    }

    try {
      let pagina = 1;
      const limite = 200;
      let todas = [];
      let continuar = true;

      while (continuar) {
        const response = await escolasService.listar(
          {
            filial_id: filialId,
            page: pagina,
            limit: limite
          },
          user
        );

        const dados = response?.data || [];
        todas = todas.concat(dados);

        if (dados.length < limite) {
          continuar = false;
        } else {
          pagina += 1;
        }
      }

      return todas;
    } catch (erro) {
      console.error('Erro ao buscar todas as escolas da filial:', erro);
      toast.error('Erro ao buscar instituições da filial selecionada');
      return [];
    }
  }, [filialId, user]);

  const confirmarAcaoMassa = useCallback((acao) => {
    if (isViewMode) {
      return;
    }

    if (acao === 'selecionar' && !filialId) {
      toast.error('Selecione uma filial para marcar as escolas');
      return;
    }

    setConfirmacao({ aberto: true, acao });
  }, [filialId, isViewMode]);

  const executarAcaoMassa = useCallback(async () => {
    if (confirmacao.acao === 'selecionar') {
      const todasEscolas = await buscarTodasEscolasDaFilial();

      if (!todasEscolas || todasEscolas.length === 0) {
        toast.error('Nenhuma escola encontrada para a filial selecionada');
        setConfirmacao({ aberto: false, acao: null });
        return;
      }

      const tiposDisponiveis = tiposAtendimento.map(tipo => tipo.value);

      setVinculosSelecionados(prev => {
        const novos = { ...prev };
        todasEscolas.forEach(escola => {
          novos[escola.id] = [...tiposDisponiveis];
        });
        return novos;
      });
      toast.success('Todos os tipos marcados para as escolas da filial selecionada.');
      markDirty();
    }

    if (confirmacao.acao === 'desmarcar') {
      setVinculosSelecionados({});
      toast.success('Todos os tipos foram desmarcados.');
      markDirty();
    }

    setConfirmacao({ aberto: false, acao: null });
  }, [confirmacao, buscarTodasEscolasDaFilial, tiposAtendimento, markDirty]);

  const fecharConfirmacao = useCallback(() => {
    setConfirmacao({ aberto: false, acao: null });
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!editingItem && !filialId) {
      newErrors.filial_id = 'Filial é obrigatória';
    }

    // Verificar se há pelo menos um vínculo selecionado
    const totalVinculos = Object.values(vinculosSelecionados).reduce(
      (acc, tipos) => acc + (tipos?.length || 0),
      0
    );

    if (!isEditing && totalVinculos === 0) {
      newErrors.vinculos = 'Selecione ao menos um tipo de atendimento para uma escola';
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

    // Se estiver editando, atualizar tipos apenas das escolas que foram realmente modificadas
    if (isEditing && editingItem) {
      // Comparar estado inicial com estado atual para identificar mudanças
      const escolasModificadas = [];
      
      // Função auxiliar para comparar arrays (ordem não importa)
      const arraysIguais = (arr1, arr2) => {
        if (!arr1 && !arr2) return true;
        if (!arr1 || !arr2) return false;
        const sorted1 = [...arr1].sort().join(',');
        const sorted2 = [...arr2].sort().join(',');
        return sorted1 === sorted2;
      };
      
      // Verificar todas as escolas no estado atual
      const todasEscolas = new Set([
        ...Object.keys(vinculosSelecionados),
        ...Object.keys(vinculosIniciais)
      ]);
      
      for (const escolaIdStr of todasEscolas) {
        const escolaId = parseInt(escolaIdStr);
        const tiposAtuais = vinculosSelecionados[escolaIdStr] || [];
        const tiposIniciais = vinculosIniciais[escolaIdStr] || [];
        
        // Verificar se houve mudança
        if (!arraysIguais(tiposAtuais, tiposIniciais)) {
          escolasModificadas.push(escolaIdStr);
        }
      }
      
      // Se nenhuma escola foi modificada, apenas atualizar status se mudou
      if (escolasModificadas.length === 0) {
        const statusMudou = statusAtivo !== (editingItem.ativo !== undefined ? Boolean(editingItem.ativo) : true);
        if (statusMudou) {
          const resultado = await onSave(editingItem.id, {
            escola_id: editingItem.escola_id,
            tipos_atendimento: vinculosSelecionados[editingItem.escola_id] || [],
            ativo: statusAtivo
          });
          
          if (resultado && resultado.success) {
            // Chamar callback para recarregar dados
            if (onSaveComplete) {
              await onSaveComplete();
            }
            toast.success('Vínculo atualizado com sucesso!');
          }
        } else {
          toast.info('Nenhuma alteração para salvar');
        }
        return;
      }

      // Salvar apenas as escolas que foram modificadas
      // Para a escola do editingItem, usar o ID conhecido
      // Para outras escolas, buscar o ID do vínculo ou criar novo
      const promessasSalvar = escolasModificadas.map(async (escolaIdStr) => {
        const escolaId = parseInt(escolaIdStr);
        const tiposAtendimento = vinculosSelecionados[escolaIdStr] || [];
        const isEscolaPrincipal = escolaId === editingItem.escola_id;

        if (isEscolaPrincipal) {
          // Escola principal: usar ID do editingItem e atualizar diretamente
          const dadosParaSalvar = {
            escola_id: escolaId,
            tipos_atendimento: tiposAtendimento,
            ativo: statusAtivo
          };

          return onSave(editingItem.id, dadosParaSalvar);
        } else {
          // Outras escolas: buscar ID do vínculo primeiro
          try {
            const tiposEscola = await buscarPorEscola(escolaId);
            const vinculoId = tiposEscola && tiposEscola.length > 0 ? tiposEscola[0].id : null;

            if (vinculoId) {
              // Atualizar vínculo existente
              const dadosParaSalvar = {
                escola_id: escolaId,
                tipos_atendimento: tiposAtendimento,
                ativo: true
              };

              return onSave(vinculoId, dadosParaSalvar);
            } else {
              // Criar novo vínculo (o backend vai criar se não existir)
              const dadosParaSalvar = {
                escola_id: escolaId,
                tipos_atendimento: tiposAtendimento,
                ativo: true
              };

              // Usar onSave sem ID para criar (handleSave vai detectar e usar criar)
              return onSave(dadosParaSalvar);
            }
          } catch (error) {
            console.error(`[TipoAtendimentoEscolaModal] Erro ao processar escola ${escolaId}:`, error);
            throw error;
          }
        }
      });

      // Aguardar todas as atualizações
      const resultados = await Promise.all(promessasSalvar);
      
      // Contar sucessos
      const sucessos = resultados.filter(r => r && r.success).length;
      const total = resultados.length;
      
      // Recarregar vínculos e fechar modal apenas uma vez
      if (sucessos > 0) {
        // Chamar callback para recarregar dados (se fornecido)
        if (onSaveComplete) {
          await onSaveComplete();
        }
        
        // Exibir mensagem única
        if (total === 1) {
          toast.success('Vínculo atualizado com sucesso!');
        } else {
          toast.success(`${sucessos} vínculo(s) atualizado(s) com sucesso!`);
        }
        
        // Fechar modal será feito pelo componente pai
      } else if (total > 0) {
        toast.error('Erro ao atualizar vínculo(s)');
      }
    } else {
      // Criar array de vínculos para salvar
      const vinculosParaSalvar = [];
      Object.entries(vinculosSelecionados).forEach(([escolaId, tipos]) => {
        if (tipos && tipos.length > 0) {
          tipos.forEach(tipo => {
            vinculosParaSalvar.push({
              escola_id: parseInt(escolaId),
              tipo_atendimento: tipo,
              ativo: true
            });
          });
        }
      });

      await onSave({
        vinculos: vinculosParaSalvar
      });
    }
    resetDirty();
  };

  const handleBuscaEscola = (e) => {
    setBuscaEscola(e.target.value);
    setEscolasPage(1);
    // No modo de edição, o filtro é aplicado automaticamente via escolasFiltradas
  };

  const handleBuscaEscolaSubmit = () => {
    if (!filialId) {
      toast.error('Selecione uma filial antes de buscar escolas');
      return;
    }

    carregarEscolas(filialId, 1, escolasItemsPerPage);
  };

  const handleItemsPerPageChange = (value) => {
    if (Number.isNaN(value) || value <= 0) {
      return;
    }

      setEscolasItemsPerPage(value);
    setEscolasPage(1);
    
    if (isEditing) {
      // Recalcular totalPages baseado no novo itemsPerPage
      const totalPages = Math.max(1, Math.ceil(escolasTotalItems / value));
      setEscolasTotalPages(totalPages);
      return;
    }

    if (filialId) {
      carregarEscolas(filialId, 1, value);
    }
  };

  // Calcular escolas exibidas com paginação (tanto criação quanto edição)
  // No modo de edição, fazemos slice do array completo de escolas
  // No modo de criação, as escolas já vêm paginadas do backend
  // Aplicar filtro de busca local no modo de edição
  const escolasFiltradas = isEditing && buscaEscola
    ? escolas.filter(escola => {
        const busca = buscaEscola.toLowerCase();
        return (
          (escola.nome_escola && escola.nome_escola.toLowerCase().includes(busca)) ||
          (escola.rota && escola.rota.toLowerCase().includes(busca)) ||
          (escola.cidade && escola.cidade.toLowerCase().includes(busca))
        );
      })
    : escolas;
  
  const escolasExibidas = isEditing && escolasFiltradas.length > 0
    ? escolasFiltradas.slice((escolasPage - 1) * escolasItemsPerPage, escolasPage * escolasItemsPerPage)
    : escolas;
  
  // No modo de edição, usar escolasFiltradas para calcular totais
  const totalItemsParaExibicao = isEditing ? escolasFiltradas.length : escolasTotalItems;
  const totalPagesParaExibicao = isEditing 
    ? Math.max(1, Math.ceil(escolasFiltradas.length / escolasItemsPerPage))
    : escolasTotalPages;

  const handleStatusChange = (e) => {
    setStatusAtivo(e.target.value === 'ativo');
  };

  // Modo edição: mostrar formulário simples
  const modalTitle = isEditing
    ? (isViewMode ? 'Visualizar Vínculo' : 'Editar Vínculo')
    : 'Vincular Tipos de Atendimento às Escolas';

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={() => requestClose(onClose)}
      title={modalTitle}
      size="full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Filial */}
        <div>
          <SearchableSelect
            label="Filial"
            value={filialId}
            onChange={handleFilialChange}
            options={filiais.map(filial => ({
              value: String(filial.id),
              label: filial.filial || filial.nome || `Filial ${filial.id}`
            }))}
            placeholder="Selecione uma filial..."
            disabled={loading || loadingFiliais || isViewMode || isEditing}
            required={!isEditing}
            error={errors.filial_id}
            usePortal={false}
          />
        </div>

        {/* Status apenas (sem Filial e Escola) */}
        {isEditing && !isViewMode && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Status</span>
                <select
                  value={statusAtivo ? 'ativo' : 'inativo'}
                  onChange={handleStatusChange}
                  disabled={loading}
                  className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    loading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
          </div>
        )}

        {/* Busca de Escola */}
        {filialId && (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar escola por nome, rota ou cidade..."
                value={buscaEscola}
                onChange={handleBuscaEscola}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (isEditing) {
                      // No modo edição, apenas filtra localmente (já está implementado)
                      setEscolasPage(1);
                    } else {
                      handleBuscaEscolaSubmit();
                    }
                  }
                }}
                disabled={loadingEscolas}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
              {!isEditing && (
              <Button
                type="button"
                onClick={handleBuscaEscolaSubmit}
                disabled={loadingEscolas}
                size="sm"
              >
                Buscar
              </Button>
              )}
            </div>
          </div>
        )}


        {/* Tabela Matriz */}
        {filialId && (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                      Escola
                    </th>
                    {tiposAtendimento
                      .slice()
                      .sort((a, b) => {
                        const ordem = [
                          'lanche_manha',
                          'parcial_manha',
                          'almoco',
                          'lanche_tarde',
                          'parcial_tarde',
                          'eja'
                        ];
                        const indexA = ordem.indexOf(a.value);
                        const indexB = ordem.indexOf(b.value);
                        const posA = indexA === -1 ? ordem.length : indexA;
                        const posB = indexB === -1 ? ordem.length : indexB;
                        return posA - posB;
                      })
                      .map(tipo => (
                      <th
                        key={tipo.value}
                        className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg mb-1">{tipo.icon}</span>
                          <span className="text-xs">
                            {tipo.label.replace(/[🌅🍽️🌆🥗🌙]/g, '').trim()}
                            {tipo.value === 'eja' ? ' (Noturno)' : ''}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingEscolas ? (
                    <tr>
                      <td colSpan={tiposAtendimento.length + 1} className="px-4 py-8 text-center text-gray-500">
                        Carregando escolas...
                      </td>
                    </tr>
                  ) : escolasExibidas.length === 0 ? (
                    <tr>
                      <td colSpan={tiposAtendimento.length + 1} className="px-4 py-8 text-center text-gray-500">
                        {filialId ? 'Nenhuma escola encontrada' : 'Selecione uma filial para ver as escolas'}
                      </td>
                    </tr>
                  ) : (
                    escolasExibidas.map(escola => (
                      <tr key={escola.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 bg-white z-10">
                          <div className="font-medium">{escola.nome_escola}</div>
                          {escola.rota && (
                            <div className="text-xs text-gray-500">{escola.rota}</div>
                          )}
                          {escola.cidade && (
                            <div className="text-xs text-gray-500">{escola.cidade}</div>
                          )}
                        </td>
                        {tiposAtendimento
                          .slice()
                          .sort((a, b) => {
                            const ordem = [
                              'lanche_manha',
                              'parcial_manha',
                              'almoco',
                              'lanche_tarde',
                              'parcial_tarde',
                              'eja'
                            ];
                            const indexA = ordem.indexOf(a.value);
                            const indexB = ordem.indexOf(b.value);
                            const posA = indexA === -1 ? ordem.length : indexA;
                            const posB = indexB === -1 ? ordem.length : indexB;
                            return posA - posB;
                          })
                          .map(tipo => (
                          <td key={tipo.value} className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isTipoSelecionado(escola.id, tipo.value)}
                              onChange={() => handleTipoToggle(escola.id, tipo.value)}
                              disabled={viewMode || loading}
                              className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Erro de validação */}
        {errors.vinculos && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errors.vinculos}</p>
          </div>
        )}

        {/* Navegação - Modo criação */}
        {!isEditing && filialId && (
          <div className="flex flex-col items-center justify-center gap-3 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                {escolasTotalPages > 1 && (
                  <Pagination
                    currentPage={escolasPage}
                    totalPages={escolasTotalPages}
                    totalItems={escolasTotalItems}
                    itemsPerPage={escolasItemsPerPage}
                    onPageChange={setEscolasPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loadingEscolas || loading}
                  onClick={() => confirmarAcaoMassa('selecionar')}
                  className="text-xs"
                >
                  Marcar todos
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loadingEscolas || loading}
                  onClick={() => confirmarAcaoMassa('desmarcar')}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Desmarcar todos
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Navegação - Modo edição/visualização */}
        {isEditing && filialId && totalItemsParaExibicao > 0 && (
          <div className="flex flex-col items-center justify-center gap-3 pt-4 border-t border-gray-200">
                {totalPagesParaExibicao > 1 && (
                  <Pagination
                    currentPage={escolasPage}
                    totalPages={totalPagesParaExibicao}
                    totalItems={totalItemsParaExibicao}
                    itemsPerPage={escolasItemsPerPage}
                    onPageChange={setEscolasPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
          </div>
        )}

        {/* Botões */}
        {!viewMode && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              disabled={loading || (!isEditing && loadingEscolas)}
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
        title={confirmacao.acao === 'selecionar' ? 'Marcar todos os tipos?' : 'Desmarcar todos os tipos?'}
        message={confirmacao.acao === 'selecionar'
          ? 'Deseja marcar todos os tipos de atendimento para todas as escolas listadas?'
          : 'Deseja desmarcar todos os tipos de atendimento?'}
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

export default TipoAtendimentoEscolaModal;
