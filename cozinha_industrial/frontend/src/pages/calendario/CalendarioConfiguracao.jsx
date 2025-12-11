import React, { useState, useEffect } from 'react';
import { FaCog, FaArrowLeft } from 'react-icons/fa';
import { useCalendario } from '../../hooks/useCalendario';
import { useDiasNaoUteis } from '../../hooks/useDiasNaoUteis';
import { usePermissions } from '../../contexts/PermissionsContext';
import { ConfirmModal } from '../../components/ui';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import calendarioService from '../../services/calendarioService';
import {
  DiasUteisConfig,
  DiasAbastecimentoConfig,
  DiasConsumoConfig,
  FeriadosConfig,
  DiasNaoUteisConfig,
  FeriadoModal,
  DiaNaoUtilModal,
  DiasNaoUteisListaModal
} from '../../components/calendario/configuracao';

const CalendarioConfiguracao = () => {
  const { user } = usePermissions();
  const [ano, setAno] = useState(new Date().getFullYear());
  
  const {
    loading,
    configuracao,
    carregarConfiguracao,
    configurarDiasUteis,
    configurarDiasAbastecimento,
    configurarDiasConsumo,
    adicionarFeriado,
    removerFeriado,
    diasNaoUteis
  } = useCalendario();

  const {
    diasNaoUteisAgrupados,
    diasNaoUteisRecentes,
    diasNaoUteisFiltrados,
    diasNaoUteisConfigurados,
    resumoDiasNaoUteis,
    resumoDiasNaoUteisFiltrados,
    filiaisOptions,
    unidadesFiltradas,
    unidadesEscolares,
    buscaUnidadesTermo,
    setBuscaUnidadesTermo,
    buscaDiaNaoUtil,
    setBuscaDiaNaoUtil,
    adicionarDiaNaoUtil,
    atualizarDiaNaoUtil,
    removerDiaNaoUtil,
    carregarConfiguracao: recarregarConfiguracao,
    loading: loadingDiasNaoUteis,
    loadingListas
  } = useDiasNaoUteis(ano, diasNaoUteis);
  const [diasUteis, setDiasUteis] = useState([]);
  const [diasAbastecimento, setDiasAbastecimento] = useState([]);
  const [diasConsumo, setDiasConsumo] = useState([]);
  const [modalFeriado, setModalFeriado] = useState(false);
  const [formFeriado, setFormFeriado] = useState({
    data: '',
    nome_feriado: '',
    observacoes: ''
  });
  const [modalDiaNaoUtil, setModalDiaNaoUtil] = useState(false);
  const [editandoDiaNaoUtil, setEditandoDiaNaoUtil] = useState(null);
  const [formDiaNaoUtil, setFormDiaNaoUtil] = useState({
    data: '',
    descricao: '',
    tipo_destino: 'global',
    filial_id: '',
    unidades_escola_ids: [],
    observacoes: ''
  });
  const [modalListaDiasNaoUteis, setModalListaDiasNaoUteis] = useState(false);
  const [confirmacaoDiaNaoUtil, setConfirmacaoDiaNaoUtil] = useState({
    isOpen: false,
    dia: null
  });
  const [confirmacaoFeriado, setConfirmacaoFeriado] = useState({
    isOpen: false,
    data: null
  });

  useEffect(() => {
    carregarConfiguracao(ano);
  }, [ano, carregarConfiguracao]);

  useEffect(() => {
    if (configuracao) {
      setDiasUteis(configuracao.dias_uteis?.map(d => d.dia_semana_numero) || []);
      setDiasAbastecimento(configuracao.dias_abastecimento?.map(d => d.dia_semana_numero) || []);
      setDiasConsumo(configuracao.dias_consumo?.map(d => d.dia_semana_numero) || []);
    }
  }, [configuracao]);

  // Handlers de Dias Úteis
  const handleDiaToggle = (tipo, diaNumero) => {
    switch (tipo) {
      case 'util':
        setDiasUteis(prev => 
          prev.includes(diaNumero) 
            ? prev.filter(d => d !== diaNumero)
            : [...prev, diaNumero]
        );
        break;
      case 'abastecimento':
        setDiasAbastecimento(prev => 
          prev.includes(diaNumero) 
            ? prev.filter(d => d !== diaNumero)
            : [...prev, diaNumero]
        );
        break;
      case 'consumo':
        setDiasConsumo(prev => 
          prev.includes(diaNumero) 
            ? prev.filter(d => d !== diaNumero)
            : [...prev, diaNumero]
        );
        break;
    }
  };

  const handleSalvarDiasUteis = async () => {
    const sucesso = await configurarDiasUteis(ano, diasUteis);
    if (sucesso) {
      toast.success('Dias úteis salvos com sucesso!');
    }
  };

  const handleSalvarDiasAbastecimento = async () => {
    const sucesso = await configurarDiasAbastecimento(ano, diasAbastecimento);
    if (sucesso) {
      toast.success('Dias de abastecimento salvos com sucesso!');
    }
  };

  const handleSalvarDiasConsumo = async () => {
    const sucesso = await configurarDiasConsumo(ano, diasConsumo);
    if (sucesso) {
      toast.success('Dias de consumo salvos com sucesso!');
    }
  };

  // Handlers de Feriados
  const handleAdicionarFeriado = () => {
    setFormFeriado({
      data: '',
      nome_feriado: '',
      observacoes: ''
    });
    setModalFeriado(true);
  };

  const handleSalvarFeriado = async () => {
    if (!formFeriado.data || !formFeriado.nome_feriado) {
      toast.error('Data e nome do feriado são obrigatórios');
      return;
    }

    const sucesso = await adicionarFeriado(formFeriado);
    if (sucesso) {
      setModalFeriado(false);
      setFormFeriado({
        data: '',
        nome_feriado: '',
        observacoes: ''
      });
    }
  };

  const handleRemoverFeriado = (data) => {
    setConfirmacaoFeriado({
      isOpen: true,
      data: data
    });
  };

  const handleConfirmarRemoverFeriado = async () => {
    if (confirmacaoFeriado.data) {
      const sucesso = await removerFeriado(confirmacaoFeriado.data);
      if (sucesso) {
        toast.success('Feriado removido com sucesso!');
      }
      setConfirmacaoFeriado({
        isOpen: false,
        data: null
      });
    }
  };

  // Handlers de Dias Não Úteis
  const handleAdicionarDiaNaoUtil = () => {
    setEditandoDiaNaoUtil(null);
    setFormDiaNaoUtil({
      data: '',
      descricao: '',
      tipo_destino: 'global',
      filial_id: '',
      unidades_escola_ids: [],
      observacoes: ''
    });
    setBuscaUnidadesTermo('');
    setModalDiaNaoUtil(true);
  };

  const handleEditarDiaNaoUtil = (dia) => {
    const diaParaEditar = dia.destinos && dia.destinos.length > 0 ? dia.destinos[0] : dia;
    
    let tipoDestino = diaParaEditar.tipo_destino || 'global';
    let filialId = diaParaEditar.filial_id || '';
    let unidadesIds = [];
    
    if (dia.destinos && dia.destinos.length > 0) {
      const destinosUnidades = dia.destinos.filter(d => d.tipo_destino === 'unidade' && d.unidade_escolar_id);
      
      if (destinosUnidades.length > 0) {
        tipoDestino = 'unidade';
        unidadesIds = destinosUnidades.map(d => d.unidade_escolar_id);
        
        if (unidadesEscolares && unidadesEscolares.length > 0) {
          const primeiraUnidade = unidadesEscolares.find(u => u.id === unidadesIds[0]);
          if (primeiraUnidade && primeiraUnidade.filial_id) {
            filialId = primeiraUnidade.filial_id;
          }
        }
      } else if (dia.destinos[0].tipo_destino === 'filial') {
        tipoDestino = 'filial';
        filialId = dia.destinos[0].filial_id || '';
      }
    } else if (diaParaEditar.unidade_escolar_id) {
      tipoDestino = 'unidade';
      unidadesIds = [diaParaEditar.unidade_escolar_id];
      
      if (unidadesEscolares && unidadesEscolares.length > 0) {
        const unidade = unidadesEscolares.find(u => u.id === diaParaEditar.unidade_escolar_id);
        if (unidade && unidade.filial_id) {
          filialId = unidade.filial_id;
        }
      }
    } else if (diaParaEditar.filial_id) {
      tipoDestino = 'filial';
      filialId = diaParaEditar.filial_id;
    }
    
    setEditandoDiaNaoUtil(dia);
    setFormDiaNaoUtil({
      data: diaParaEditar.data || '',
      descricao: diaParaEditar.descricao || '',
      tipo_destino: tipoDestino,
      filial_id: filialId,
      unidades_escola_ids: unidadesIds,
      observacoes: diaParaEditar.observacoes || ''
    });
    setBuscaUnidadesTermo('');
    setModalDiaNaoUtil(true);
  };

  const handleTipoDestinoChange = (valor) => {
    setFormDiaNaoUtil((prev) => ({
      ...prev,
      tipo_destino: valor,
      filial_id: valor === 'filial' ? prev.filial_id : '',
      unidades_escola_ids: valor === 'unidade' ? prev.unidades_escola_ids : []
    }));
  };

  const handleFilialChangeDiaNaoUtil = (valor) => {
    setFormDiaNaoUtil((prev) => ({
      ...prev,
      filial_id: valor,
      unidades_escola_ids: []
    }));
    setBuscaUnidadesTermo('');
  };

  const handleToggleUnidadeSelecionada = (unidadeId) => {
    setFormDiaNaoUtil((prev) => {
      const idNumber = parseInt(unidadeId, 10);
      const atual = new Set(prev.unidades_escola_ids || []);
      if (atual.has(idNumber)) {
        atual.delete(idNumber);
      } else {
        atual.add(idNumber);
      }
      return {
        ...prev,
        unidades_escola_ids: Array.from(atual)
      };
    });
  };

  const handleSelecionarTodasUnidades = (unidadesParaSelecionar = []) => {
    if (!Array.isArray(unidadesParaSelecionar) || unidadesParaSelecionar.length === 0) {
      return;
    }

    setFormDiaNaoUtil((prev) => {
      const idsAtuais = new Set(prev.unidades_escola_ids || []);
      unidadesParaSelecionar.forEach((unidade) => {
        idsAtuais.add(parseInt(unidade.id, 10));
      });
      return {
        ...prev,
        unidades_escola_ids: Array.from(idsAtuais)
      };
    });
  };

  const handleLimparSelecaoUnidades = () => {
    setFormDiaNaoUtil((prev) => ({
      ...prev,
      unidades_escola_ids: []
    }));
  };

  const handleSalvarDiaNaoUtil = async () => {
    if (!formDiaNaoUtil.data || !formDiaNaoUtil.descricao) {
      toast.error('Data e descrição são obrigatórias');
      return;
    }

    if (formDiaNaoUtil.tipo_destino === 'filial' && !formDiaNaoUtil.filial_id) {
      toast.error('Selecione a filial vinculada ao dia não útil');
      return;
    }

    if (editandoDiaNaoUtil) {
      const anoReferencia = formDiaNaoUtil.data
        ? new Date(`${formDiaNaoUtil.data}T00:00:00`).getFullYear()
        : ano;

      // Se for edição de grupo com múltiplas unidades
      if (editandoDiaNaoUtil.ids && editandoDiaNaoUtil.ids.length > 0 && editandoDiaNaoUtil.destinos) {
        // Se o tipo é unidade
        if (formDiaNaoUtil.tipo_destino === 'unidade') {
          const unidadesOriginais = new Set(
            editandoDiaNaoUtil.destinos
              .filter(d => d.tipo_destino === 'unidade' && d.unidade_escolar_id)
              .map(d => d.unidade_escolar_id)
          );
          const unidadesSelecionadas = new Set(formDiaNaoUtil.unidades_escola_ids || []);
          
          // Unidades a remover (estavam marcadas mas foram desmarcadas)
          const unidadesParaRemover = [...unidadesOriginais].filter(id => !unidadesSelecionadas.has(id));
          // Unidades a manter/atualizar (continuam selecionadas)
          const unidadesParaManter = [...unidadesSelecionadas].filter(id => unidadesOriginais.has(id));
          // Unidades a adicionar (novas seleções)
          const unidadesParaAdicionar = [...unidadesSelecionadas].filter(id => !unidadesOriginais.has(id));

          let sucessoCount = 0;
          let falhasCount = 0;
          let removidosCount = 0;
          let adicionadosCount = 0;

          // Remover unidades desmarcadas (sem recarregar ainda)
          for (const unidadeId of unidadesParaRemover) {
            const registroParaRemover = editandoDiaNaoUtil.destinos.find(
              d => d.tipo_destino === 'unidade' && d.unidade_escolar_id === unidadeId
            );
            
            if (registroParaRemover) {
              const idParaRemover = editandoDiaNaoUtil.ids[editandoDiaNaoUtil.destinos.indexOf(registroParaRemover)];
              
              // Chamar o serviço diretamente sem recarregar
              try {
                const response = await calendarioService.removerDiaNaoUtil(idParaRemover);
                if (response.success) {
                  removidosCount++;
                } else {
                  falhasCount++;
                }
              } catch (error) {
                console.error('Erro ao remover dia não útil:', error);
                falhasCount++;
              }
            }
          }

          // Atualizar unidades mantidas
          for (const unidadeId of unidadesParaManter) {
            const registroOriginal = editandoDiaNaoUtil.destinos.find(
              d => d.tipo_destino === 'unidade' && d.unidade_escolar_id === unidadeId
            );
            
            if (registroOriginal) {
              const idParaAtualizar = editandoDiaNaoUtil.ids[editandoDiaNaoUtil.destinos.indexOf(registroOriginal)];
              
              const payload = {
                data: formDiaNaoUtil.data,
                descricao: formDiaNaoUtil.descricao,
                observacoes: formDiaNaoUtil.observacoes || null,
                tipo_destino: 'unidade',
                filial_id: null,
                unidade_escolar_id: unidadeId
              };

              const resultado = await atualizarDiaNaoUtil(idParaAtualizar, payload, { reload: false });
              if (resultado?.success) {
                sucessoCount++;
              } else {
                falhasCount++;
              }
            }
          }

          // Adicionar novas unidades
          for (const unidadeId of unidadesParaAdicionar) {
            const payload = {
              data: formDiaNaoUtil.data,
              descricao: formDiaNaoUtil.descricao,
              observacoes: formDiaNaoUtil.observacoes || null,
              tipo_destino: 'unidade',
              filial_id: null,
              unidade_escolar_id: unidadeId
            };

            const resultado = await adicionarDiaNaoUtil(payload, { reload: false });
            if (resultado?.success) {
              adicionadosCount++;
            } else {
              falhasCount++;
            }
          }

          // Recarregar configuração uma única vez após todas as operações
          await carregarConfiguracao(anoReferencia);
        
        // Mensagens de sucesso
        const mensagens = [];
        if (sucessoCount > 0) {
          mensagens.push(`${sucessoCount} ${sucessoCount === 1 ? 'registro atualizado' : 'registros atualizados'}`);
        }
        if (removidosCount > 0) {
          mensagens.push(`${removidosCount} ${removidosCount === 1 ? 'registro removido' : 'registros removidos'}`);
        }
        if (adicionadosCount > 0) {
          mensagens.push(`${adicionadosCount} ${adicionadosCount === 1 ? 'registro adicionado' : 'registros adicionados'}`);
        }
        
        if (mensagens.length > 0) {
          toast.success(mensagens.join(', ') + ' com sucesso');
        }

        if (falhasCount > 0) {
          toast.error(
            `Não foi possível processar ${falhasCount} ${falhasCount === 1 ? 'registro' : 'registros'}`
          );
        }

        setModalDiaNaoUtil(false);
        setEditandoDiaNaoUtil(null);
        return;
        } else {
          // Se não é tipo unidade, atualiza todos os registros mantendo os destinos originais
          let sucessoCount = 0;
          let falhasCount = 0;

          for (let i = 0; i < editandoDiaNaoUtil.ids.length; i++) {
            const id = editandoDiaNaoUtil.ids[i];
            const destinoOriginal = editandoDiaNaoUtil.destinos[i];
            
            const payload = {
              data: formDiaNaoUtil.data,
              descricao: formDiaNaoUtil.descricao,
              observacoes: formDiaNaoUtil.observacoes || null,
              tipo_destino: destinoOriginal.tipo_destino || 'global',
              filial_id: destinoOriginal.tipo_destino === 'filial' ? destinoOriginal.filial_id : null,
              unidade_escolar_id: destinoOriginal.tipo_destino === 'unidade' ? destinoOriginal.unidade_escolar_id : null
            };

            const resultado = await atualizarDiaNaoUtil(id, payload, { reload: false });
            if (resultado?.success) {
              sucessoCount++;
            } else {
              falhasCount++;
            }
          }

          if (sucessoCount > 0) {
            await carregarConfiguracao(anoReferencia);
            toast.success(
              `${sucessoCount} ${sucessoCount === 1 ? 'registro atualizado' : 'registros atualizados'} com sucesso`
            );
            setModalDiaNaoUtil(false);
            setEditandoDiaNaoUtil(null);
          }

          if (falhasCount > 0) {
            toast.error(
              `Não foi possível atualizar ${falhasCount} ${falhasCount === 1 ? 'registro' : 'registros'}`
            );
          }
          return;
        }
      } else {
        const payload = {
          data: formDiaNaoUtil.data,
          descricao: formDiaNaoUtil.descricao,
          observacoes: formDiaNaoUtil.observacoes || null,
          tipo_destino: formDiaNaoUtil.tipo_destino,
          filial_id: formDiaNaoUtil.tipo_destino === 'filial' ? parseInt(formDiaNaoUtil.filial_id, 10) : null,
          unidade_escolar_id: formDiaNaoUtil.tipo_destino === 'unidade' && formDiaNaoUtil.unidades_escola_ids?.length === 1
            ? parseInt(formDiaNaoUtil.unidades_escola_ids[0], 10)
            : null
        };

        const resultado = await atualizarDiaNaoUtil(editandoDiaNaoUtil.id, payload);
        if (resultado?.success) {
          toast.success(resultado?.message || 'Dia não útil atualizado com sucesso');
          setModalDiaNaoUtil(false);
          setEditandoDiaNaoUtil(null);
        } else {
          toast.error(resultado?.message || 'Erro ao atualizar dia não útil');
        }
        return;
      }
    }

    if (formDiaNaoUtil.tipo_destino === 'unidade') {
      const unidadesSelecionadas = formDiaNaoUtil.unidades_escola_ids || [];
      if (!formDiaNaoUtil.filial_id) {
        toast.error('Selecione a filial para listar as unidades');
        return;
      }

      if (unidadesSelecionadas.length === 0) {
        toast.error('Selecione pelo menos uma unidade escolar');
        return;
      }

      const anoReferencia = formDiaNaoUtil.data
        ? new Date(`${formDiaNaoUtil.data}T00:00:00`).getFullYear()
        : ano;
      let sucessoGlobal = true;
      let sucessoCount = 0;
      for (const unidadeId of unidadesSelecionadas) {
        const payloadUnidade = {
          data: formDiaNaoUtil.data,
          descricao: formDiaNaoUtil.descricao,
          observacoes: formDiaNaoUtil.observacoes || null,
          tipo_destino: 'unidade',
          filial_id: null,
          unidade_escolar_id: parseInt(unidadeId, 10)
        };

        const resultado = await adicionarDiaNaoUtil(payloadUnidade, {
          reload: false
        });

        if (resultado?.success) {
          sucessoCount += 1;
        } else {
          sucessoGlobal = false;
        }
      }

      if (sucessoCount > 0) {
        await recarregarConfiguracao(anoReferencia);
        toast.success(
          `Dia não útil configurado para ${sucessoCount} ${sucessoCount === 1 ? 'unidade' : 'unidades'}`
        );
      }

      if (!sucessoGlobal) {
        const falhas = unidadesSelecionadas.length - sucessoCount;
        toast.error(
          `Não foi possível configurar ${falhas} ${falhas === 1 ? 'unidade' : 'unidades'}.`
        );
      }

      if (sucessoGlobal) {
        setModalDiaNaoUtil(false);
      }
      return;
    }

    const payload = {
      data: formDiaNaoUtil.data,
      descricao: formDiaNaoUtil.descricao,
      observacoes: formDiaNaoUtil.observacoes || null,
      tipo_destino: formDiaNaoUtil.tipo_destino,
      filial_id: formDiaNaoUtil.tipo_destino === 'filial' ? parseInt(formDiaNaoUtil.filial_id, 10) : null,
      unidade_escolar_id: null
    };

    const resultado = await adicionarDiaNaoUtil(payload);
    if (resultado?.success) {
      toast.success(resultado?.message || 'Dia não útil adicionado com sucesso');
      setModalDiaNaoUtil(false);
    } else {
      toast.error(resultado?.message || 'Erro ao adicionar dia não útil');
    }
  };

  const handleSolicitarRemocaoDiaNaoUtil = (dia) => {
    if (!dia || !dia.id) return;
    setConfirmacaoDiaNaoUtil({
      isOpen: true,
      dia
    });
  };

  const handleConfirmarRemocaoDiaNaoUtil = async () => {
    if (!confirmacaoDiaNaoUtil.dia) return;
    
    const dia = confirmacaoDiaNaoUtil.dia;
    
    if (dia.ids && Array.isArray(dia.ids) && dia.ids.length > 1) {
      let sucessoCount = 0;
      let falhasCount = 0;
      
      for (const id of dia.ids) {
        const resultado = await removerDiaNaoUtil(id, dia.data);
        if (resultado) {
          sucessoCount++;
      } else {
          falhasCount++;
        }
      }
      
      if (sucessoCount > 0) {
        toast.success(
          `${sucessoCount} ${sucessoCount === 1 ? 'registro removido' : 'registros removidos'} com sucesso`
        );
      }
      
      if (falhasCount > 0) {
        toast.error(
          `Não foi possível remover ${falhasCount} ${falhasCount === 1 ? 'registro' : 'registros'}`
        );
      }
    } else {
      await removerDiaNaoUtil(dia.id, dia.data);
    }
    
    setConfirmacaoDiaNaoUtil({
      isOpen: false,
      dia: null
    });
  };

  // Filtrar unidades por filial selecionada
  const unidadesFiltradasPorFilial = formDiaNaoUtil.filial_id
    ? unidadesFiltradas.filter((unidade) => String(unidade.filial_id) === String(formDiaNaoUtil.filial_id))
    : [];

  const gerarAnos = () => {
    const anos = [];
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
      anos.push(i);
    }
    return anos;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center">
          <Link
            to="/foods/calendario"
            className="mr-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <FaCog className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Configuração do Calendário</h1>
            <p className="text-sm text-gray-600">Configure dias úteis, abastecimento, consumo e feriados</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
            <select
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              className="block w-24 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              {gerarAnos().map(anoOption => (
                <option key={anoOption} value={anoOption}>{anoOption}</option>
              ))}
            </select>
          </div>
        </div>
            </div>
            
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DiasUteisConfig
          diasUteis={diasUteis}
          onToggle={(diaNumero) => handleDiaToggle('util', diaNumero)}
          onSalvar={handleSalvarDiasUteis}
          loading={loading}
        />

        <DiasAbastecimentoConfig
          diasAbastecimento={diasAbastecimento}
          onToggle={(diaNumero) => handleDiaToggle('abastecimento', diaNumero)}
          onSalvar={handleSalvarDiasAbastecimento}
          loading={loading}
        />

        <DiasConsumoConfig
          diasConsumo={diasConsumo}
          onToggle={(diaNumero) => handleDiaToggle('consumo', diaNumero)}
          onSalvar={handleSalvarDiasConsumo}
          loading={loading}
        />

        <FeriadosConfig
          feriados={configuracao?.feriados || []}
          ano={ano}
          onAdicionar={handleAdicionarFeriado}
          onRemover={handleRemoverFeriado}
          loading={loading}
        />

        <DiasNaoUteisConfig
          diasNaoUteisAgrupados={diasNaoUteisAgrupados}
          diasNaoUteisRecentes={diasNaoUteisRecentes}
          diasNaoUteisConfigurados={diasNaoUteisConfigurados}
          resumoDiasNaoUteis={resumoDiasNaoUteis}
          ano={ano}
          onAdicionar={handleAdicionarDiaNaoUtil}
          onEditar={handleEditarDiaNaoUtil}
                            onRemover={handleSolicitarRemocaoDiaNaoUtil}
          onVerListaCompleta={() => {
                        setBuscaDiaNaoUtil('');
                        setModalListaDiasNaoUteis(true);
                      }}
          loading={loadingDiasNaoUteis}
          loadingListas={loadingListas}
        />
        </div>

      <FeriadoModal
        isOpen={modalFeriado}
        onClose={() => setModalFeriado(false)}
        formData={formFeriado}
        onChange={setFormFeriado}
        onSalvar={handleSalvarFeriado}
        loading={loading}
      />

      <DiaNaoUtilModal
        isOpen={modalDiaNaoUtil}
        isEditando={!!editandoDiaNaoUtil}
        onClose={() => {
          setModalDiaNaoUtil(false);
          setEditandoDiaNaoUtil(null);
        }}
        formData={formDiaNaoUtil}
        onFormChange={setFormDiaNaoUtil}
        onTipoDestinoChange={handleTipoDestinoChange}
        onFilialChange={handleFilialChangeDiaNaoUtil}
        onToggleUnidade={handleToggleUnidadeSelecionada}
        onSelecionarTodasUnidades={handleSelecionarTodasUnidades}
        onLimparSelecaoUnidades={handleLimparSelecaoUnidades}
        buscaUnidadesTermo={buscaUnidadesTermo}
        onBuscaUnidadesChange={setBuscaUnidadesTermo}
        filiaisOptions={filiaisOptions}
        unidadesEscolares={unidadesEscolares}
        unidadesFiltradas={unidadesFiltradasPorFilial}
        loading={loadingDiasNaoUteis}
        loadingListas={loadingListas}
        onSalvar={handleSalvarDiaNaoUtil}
          />

      <DiasNaoUteisListaModal
        isOpen={modalListaDiasNaoUteis}
        onClose={() => setModalListaDiasNaoUteis(false)}
        buscaDiaNaoUtil={buscaDiaNaoUtil}
        onBuscaChange={setBuscaDiaNaoUtil}
        diasNaoUteisFiltrados={diasNaoUteisFiltrados}
        diasNaoUteisAgrupados={diasNaoUteisAgrupados}
        diasNaoUteisConfigurados={diasNaoUteisConfigurados}
        resumoDiasNaoUteisFiltrados={resumoDiasNaoUteisFiltrados}
        onEditar={handleEditarDiaNaoUtil}
                    onRemover={handleSolicitarRemocaoDiaNaoUtil}
        loading={loadingDiasNaoUteis}
      />

      <ConfirmModal
        isOpen={confirmacaoDiaNaoUtil.isOpen}
        onClose={() => setConfirmacaoDiaNaoUtil({ isOpen: false, dia: null })}
        onConfirm={handleConfirmarRemocaoDiaNaoUtil}
        title="Remover dia não útil"
        message={
          confirmacaoDiaNaoUtil.dia?.ids?.length > 1
            ? `Tem certeza que deseja remover este dia não útil? Todos os ${confirmacaoDiaNaoUtil.dia.ids.length} registros vinculados serão removidos.`
            : "Tem certeza que deseja remover este dia não útil?"
        }
        confirmText="Remover"
        cancelText="Cancelar"
        type="danger"
      />

      <ConfirmModal
        isOpen={confirmacaoFeriado.isOpen}
        onClose={() => setConfirmacaoFeriado({ isOpen: false, data: null })}
        onConfirm={handleConfirmarRemoverFeriado}
        title="Remover feriado"
        message="Tem certeza que deseja remover este feriado?"
        confirmText="Remover"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default CalendarioConfiguracao;
