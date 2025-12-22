import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaSpinner } from 'react-icons/fa';
import { Button } from '../ui';
import GerarNecessidadePadraoFilters from './gerar-necessidade-padrao/components/GerarNecessidadePadraoFilters';
import NecessidadesPadroesService from '../../services/necessidadesPadroes';
import FoodsApiService from '../../services/FoodsApiService';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import ModalProgresso from '../necessidades/ajuste/ModalProgresso';
import toast from 'react-hot-toast';

const GerarNecessidadePadrao = () => {
  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    filial_id: '',
    semana_consumo: '',
    semana_abastecimento: '',
    grupo_id: ''
  });

  // Estado para escolas selecionadas (array de IDs)
  const [escolasSelecionadas, setEscolasSelecionadas] = useState([]);

  // Estados para filtros de ano e mês
  const [anoFiltro, setAnoFiltro] = useState('');
  const [mesFiltro, setMesFiltro] = useState('');

  // Estados para opções dos filtros
  const [filiais, setFiliais] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [semanasAbastecimento, setSemanasAbastecimento] = useState([]);

  // Hook para semanas de consumo do calendário com filtros de ano e mês
  const anoParaHook = anoFiltro && anoFiltro !== '' ? Number(anoFiltro) : new Date().getFullYear();
  const mesParaHook = mesFiltro && mesFiltro !== '' ? Number(mesFiltro) : null;
  const { opcoes: opcoesSemanasConsumo, loading: loadingSemanasConsumo } = useSemanasConsumo(anoParaHook, true, {}, mesParaHook);

  // Estados de loading
  const [loading, setLoading] = useState(false);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [loadingSemanaAbastecimento, setLoadingSemanaAbastecimento] = useState(false);
  const [semanaAbastecimentoPreenchidaAuto, setSemanaAbastecimentoPreenchidaAuto] = useState(false);

  // Estado para modal de progresso
  const [progressoModal, setProgressoModal] = useState({
    isOpen: false,
    progresso: 0,
    total: 0,
    mensagem: 'Gerando necessidades padrão...',
    title: 'Gerando Necessidades'
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Limpar escolas selecionadas quando filial mudar
  useEffect(() => {
    if (!filtros.filial_id) {
      setEscolasSelecionadas([]);
    }
  }, [filtros.filial_id]);

  const buscarSemanaAbastecimentoPorConsumo = useCallback(async (semana_consumo) => {
    try {
      setLoadingSemanaAbastecimento(true);
      const response = await NecessidadesPadroesService.buscarSemanaAbastecimentoPorConsumo(semana_consumo);
      if (response.success && response.data && response.data.semana_abastecimento) {
        const semanaAbastecimento = response.data.semana_abastecimento;
        
        // Verificar se a semana de abastecimento já está na lista, se não, adicionar
        setSemanasAbastecimento(prev => {
          const semanaJaExiste = prev.some(s => s.value === semanaAbastecimento);
          if (!semanaJaExiste) {
            return [
              ...prev,
              { value: semanaAbastecimento, label: semanaAbastecimento }
            ];
          }
          return prev;
        });
        
        // Atualizar o filtro e marcar como preenchido automaticamente
        setFiltros(prev => ({ 
          ...prev, 
          semana_abastecimento: semanaAbastecimento 
        }));
        setSemanaAbastecimentoPreenchidaAuto(true);
      } else {
        // Se não encontrou, limpar o campo
        setFiltros(prev => ({ ...prev, semana_abastecimento: '' }));
        setSemanaAbastecimentoPreenchidaAuto(false);
      }
    } catch (error) {
      console.error('Erro ao buscar semana de abastecimento:', error);
      // Limpar campo em caso de erro
      setFiltros(prev => ({ ...prev, semana_abastecimento: '' }));
      setSemanaAbastecimentoPreenchidaAuto(false);
    } finally {
      setLoadingSemanaAbastecimento(false);
    }
  }, []);

  // Buscar semana de abastecimento quando semana de consumo mudar
  useEffect(() => {
    if (filtros.semana_consumo) {
      buscarSemanaAbastecimentoPorConsumo(filtros.semana_consumo);
    } else {
      setFiltros(prev => ({ ...prev, semana_abastecimento: '' }));
      setSemanaAbastecimentoPreenchidaAuto(false);
    }
  }, [filtros.semana_consumo, buscarSemanaAbastecimentoPorConsumo]);

  const carregarDadosIniciais = async () => {
    setLoadingFiltros(true);
    try {
      // Carregar filiais
      const filiaisResponse = await FoodsApiService.getFiliais({ limit: 1000 });
      if (filiaisResponse.success && filiaisResponse.data) {
        const filiaisData = Array.isArray(filiaisResponse.data) 
          ? filiaisResponse.data 
          : filiaisResponse.data.data;
        
        if (Array.isArray(filiaisData)) {
          setFiliais(filiaisData.map(f => ({ 
            value: f.id, 
            label: f.filial || f.nome || f.razao_social || `Filial ${f.id}`
          })));
        }
      }

      // Carregar grupos
      const gruposResponse = await FoodsApiService.getGrupos({ limit: 1000 });
      if (gruposResponse.success && gruposResponse.data) {
        const gruposData = Array.isArray(gruposResponse.data) 
          ? gruposResponse.data 
          : gruposResponse.data.data;
        
        if (Array.isArray(gruposData)) {
          setGrupos(gruposData.map(g => ({ 
            value: g.id, 
            label: g.nome || g.descricao || `Grupo ${g.id}`
          })));
        }
      }

      // Semanas de consumo agora são carregadas pelo hook useSemanasConsumo baseado em ano e mês
      // Semanas de abastecimento são preenchidas automaticamente quando semana de consumo é selecionada
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setLoadingFiltros(false);
    }
  };


  const handleFiltroChange = (name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    
    // Limpar escolas selecionadas quando filial mudar
    if (name === 'filial_id') {
      setEscolasSelecionadas([]);
    }
    
    // Se semana de abastecimento for alterada manualmente, marcar como não preenchida automaticamente
    if (name === 'semana_abastecimento') {
      setSemanaAbastecimentoPreenchidaAuto(false);
    }
    
    // Se semana de consumo for alterada manualmente, já será tratado pelo useEffect
  };

  const handleAnoChange = (value) => {
    setAnoFiltro(value);
    // Limpar semana de consumo quando ano mudar
    setFiltros(prev => ({ ...prev, semana_consumo: '', semana_abastecimento: '' }));
    setSemanaAbastecimentoPreenchidaAuto(false);
  };

  const handleMesChange = (value) => {
    setMesFiltro(value || '');
    // Limpar semana de consumo quando mês mudar
    setFiltros(prev => ({ ...prev, semana_consumo: '', semana_abastecimento: '' }));
    setSemanaAbastecimentoPreenchidaAuto(false);
  };

  const handleLimparFiltros = () => {
    setAnoFiltro('');
    setMesFiltro('');
    setFiltros({
      filial_id: '',
      semana_consumo: '',
      semana_abastecimento: '',
      grupo_id: ''
    });
    setEscolasSelecionadas([]);
    setSemanaAbastecimentoPreenchidaAuto(false);
  };

  const handleGerar = async () => {
    // Validar filtros obrigatórios: Filial, Semana de Consumo e Grupo de Produtos
    if (!filtros.filial_id || !filtros.semana_consumo || !filtros.grupo_id) {
      toast.error('Por favor, preencha todos os campos obrigatórios: Filial, Semana de Consumo e Grupo de Produtos');
      return;
    }

    // Validar se semana de abastecimento foi preenchida automaticamente (ela é necessária para gerar, mas vem automaticamente)
    if (!filtros.semana_abastecimento) {
      toast.error('Aguarde o preenchimento automático da Semana de Abastecimento ou selecione uma Semana de Consumo válida');
      return;
    }

    // Validar se pelo menos uma escola foi selecionada (opcional, mas recomendado)
    if (escolasSelecionadas.length === 0) {
      toast.error('Por favor, selecione pelo menos uma escola');
      return;
    }

    setGerando(true);

    // Abrir modal de progresso
    const totalEscolas = escolasSelecionadas.length;
    setProgressoModal({
      isOpen: true,
      progresso: 0,
      total: totalEscolas,
      mensagem: 'Gerando necessidades padrão...',
      title: 'Gerando Necessidades'
    });

    try {
      // Gerar necessidades para cada escola selecionada
      let totalNecessidades = 0;
      let totalEscolasProcessadas = 0;
      const escolasProcessadas = [];
      const delayEntreRequisicoes = 200; // 200ms entre cada requisição para evitar bloqueio

      for (let i = 0; i < escolasSelecionadas.length; i++) {
        const escolaId = escolasSelecionadas[i];
        
        try {
          // Atualizar mensagem de progresso
          setProgressoModal(prev => ({
            ...prev,
            mensagem: `Gerando necessidade para escola ${i + 1} de ${totalEscolas}...`,
            progresso: i
          }));

          const response = await NecessidadesPadroesService.gerarNecessidadesPadrao({
            filial_id: filtros.filial_id,
            escola_id: escolaId,
            semana_abastecimento: filtros.semana_abastecimento,
            semana_consumo: filtros.semana_consumo,
            grupo_id: filtros.grupo_id
          });

          if (response.success) {
            totalNecessidades += response.data?.total_necessidades || 0;
            totalEscolasProcessadas += response.data?.escolas_processadas || 0;
            if (response.data?.escolas && Array.isArray(response.data.escolas)) {
              escolasProcessadas.push(...response.data.escolas);
            }
          }
        } catch (error) {
          console.error(`Erro ao gerar necessidade para escola ${escolaId}:`, error);
          // Continuar processando outras escolas mesmo se uma falhar
        }

        // Atualizar progresso
        setProgressoModal(prev => ({
          ...prev,
          progresso: i + 1
        }));

        // Delay entre requisições (exceto na última)
        if (i < escolasSelecionadas.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayEntreRequisicoes));
        }
      }

      // Fechar modal de progresso
      setProgressoModal(prev => ({ ...prev, isOpen: false }));

      if (totalNecessidades > 0) {
        let mensagem = `Necessidades geradas com sucesso!\n\n`;
        mensagem += `• ${totalNecessidades} necessidade(s) criada(s)\n`;
        mensagem += `• ${totalEscolasProcessadas} escola(s) processada(s)\n\n`;
        if (escolasProcessadas.length > 0) {
          mensagem += `Escolas afetadas:\n${escolasProcessadas.map(e => `  - ${e}`).join('\n')}`;
        }
        
        toast.success(mensagem, {
          duration: 8000,
          style: {
            whiteSpace: 'pre-line'
          }
        });

        // Limpar filtros após sucesso (manter filial, ano e mês)
        setFiltros({
          filial_id: filtros.filial_id, // Manter filial
          semana_consumo: '',
          semana_abastecimento: '',
          grupo_id: ''
        });
        setEscolasSelecionadas([]);
        // Não limpar ano e mês para facilitar gerar mais necessidades
      } else {
        toast.error('Nenhuma necessidade foi gerada. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao gerar necessidades:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao gerar necessidades padrão';
      toast.error(errorMessage);
      // Fechar modal de progresso em caso de erro
      setProgressoModal(prev => ({ ...prev, isOpen: false }));
    } finally {
      setGerando(false);
    }
  };

  // Validar se pode gerar: Filial, Semana de Consumo, Grupo de Produtos e pelo menos uma escola selecionada
  const podeGerar = filtros.filial_id && filtros.semana_consumo && filtros.grupo_id && filtros.semana_abastecimento && escolasSelecionadas.length > 0 && !gerando;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Modal de Progresso */}
      <ModalProgresso
        isOpen={progressoModal.isOpen}
        title={progressoModal.title}
        progresso={progressoModal.progresso}
        total={progressoModal.total}
        mensagem={progressoModal.mensagem}
      />

      {/* Filtros */}
      <GerarNecessidadePadraoFilters
        filtros={filtros}
        anoFiltro={anoFiltro}
        mesFiltro={mesFiltro}
        filiais={filiais}
        grupos={grupos}
        opcoesSemanasConsumo={opcoesSemanasConsumo}
        semanasAbastecimento={semanasAbastecimento}
        loading={loadingFiltros}
        loadingEscolas={loadingEscolas}
        loadingSemanasConsumo={loadingSemanasConsumo}
        loadingSemanaAbastecimento={loadingSemanaAbastecimento}
        onAnoChange={handleAnoChange}
        onMesChange={handleMesChange}
        onFiltroChange={handleFiltroChange}
        onLimparFiltros={handleLimparFiltros}
        escolasSelecionadas={escolasSelecionadas}
        onEscolasChange={setEscolasSelecionadas}
      />

      {/* Botão de ação */}
      <div className="flex justify-end">
        <Button
          onClick={handleGerar}
          color="green"
          icon={gerando ? <FaSpinner className="animate-spin" /> : <FaPlay />}
          disabled={!podeGerar}
          size="md"
        >
          {gerando ? 'Gerando...' : 'Gerar Necessidades'}
        </Button>
      </div>
    </div>
  );
};

export default GerarNecessidadePadrao;

