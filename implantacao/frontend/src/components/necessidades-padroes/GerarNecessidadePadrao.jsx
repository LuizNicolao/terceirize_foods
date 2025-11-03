import React, { useState, useEffect, useCallback } from 'react';
import { FaFilter, FaPlay, FaSpinner } from 'react-icons/fa';
import { Button, SearchableSelect } from '../ui';
import NecessidadesPadroesService from '../../services/necessidadesPadroes';
import FoodsApiService from '../../services/FoodsApiService';
import calendarioService from '../../services/calendarioService';
import toast from 'react-hot-toast';

const GerarNecessidadePadrao = () => {
  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    filial_id: '',
    escola_id: '',
    semana_consumo: '',
    semana_abastecimento: '',
    grupo_id: ''
  });

  // Estados para opções dos filtros
  const [filiais, setFiliais] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [semanasConsumo, setSemanasConsumo] = useState([]);
  const [semanasAbastecimento, setSemanasAbastecimento] = useState([]);

  // Estados de loading
  const [loading, setLoading] = useState(false);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [loadingSemanaConsumo, setLoadingSemanaConsumo] = useState(false);
  const [semanaConsumoPreenchidaAuto, setSemanaConsumoPreenchidaAuto] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Carregar escolas quando filial mudar
  useEffect(() => {
    if (filtros.filial_id) {
      carregarEscolas();
    } else {
      setEscolas([]);
      setFiltros(prev => ({ ...prev, escola_id: '' }));
    }
  }, [filtros.filial_id]);

  const buscarSemanaConsumoPorAbastecimento = useCallback(async (semana_abastecimento) => {
    try {
      setLoadingSemanaConsumo(true);
      const response = await NecessidadesPadroesService.buscarSemanaConsumoPorAbastecimento(semana_abastecimento);
      if (response.success && response.data && response.data.semana_consumo) {
        const semanaConsumo = response.data.semana_consumo;
        
        // Verificar se a semana de consumo já está na lista, se não, adicionar
        setSemanasConsumo(prev => {
          const semanaJaExiste = prev.some(s => s.value === semanaConsumo);
          if (!semanaJaExiste) {
            return [
              ...prev,
              { value: semanaConsumo, label: semanaConsumo }
            ];
          }
          return prev;
        });
        
        // Atualizar o filtro e marcar como preenchido automaticamente
        setFiltros(prev => ({ 
          ...prev, 
          semana_consumo: semanaConsumo 
        }));
        setSemanaConsumoPreenchidaAuto(true);
      } else {
        // Se não encontrou, limpar o campo
        setFiltros(prev => ({ ...prev, semana_consumo: '' }));
        setSemanaConsumoPreenchidaAuto(false);
      }
    } catch (error) {
      console.error('Erro ao buscar semana de consumo:', error);
      // Limpar campo em caso de erro
      setFiltros(prev => ({ ...prev, semana_consumo: '' }));
      setSemanaConsumoPreenchidaAuto(false);
    } finally {
      setLoadingSemanaConsumo(false);
    }
  }, []);

  // Buscar semana de consumo quando semana de abastecimento mudar
  useEffect(() => {
    if (filtros.semana_abastecimento) {
      buscarSemanaConsumoPorAbastecimento(filtros.semana_abastecimento);
    } else {
      setFiltros(prev => ({ ...prev, semana_consumo: '' }));
      setSemanaConsumoPreenchidaAuto(false);
    }
  }, [filtros.semana_abastecimento, buscarSemanaConsumoPorAbastecimento]);

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

      // Carregar semanas de consumo
      const anoAtual = new Date().getFullYear();
      const semanasResponse = await calendarioService.buscarSemanasConsumo(anoAtual);
      if (semanasResponse.success && semanasResponse.data) {
        const semanasData = semanasResponse.data.map(s => ({
          value: s.semana_consumo,
          label: s.semana_consumo
        }));
        setSemanasConsumo([{ value: '', label: 'Selecione...' }, ...semanasData]);
      }

      // Carregar semanas de abastecimento
      const semanasAbastResponse = await calendarioService.buscarSemanasAbastecimento(anoAtual);
      if (semanasAbastResponse.success && semanasAbastResponse.data) {
        const semanasAbastData = semanasAbastResponse.data.map(s => ({
          value: s.semana_abastecimento,
          label: s.semana_abastecimento
        }));
        setSemanasAbastecimento([{ value: '', label: 'Selecione...' }, ...semanasAbastData]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setLoadingFiltros(false);
    }
  };

  const carregarEscolas = async () => {
    setLoadingEscolas(true);
    try {
      const response = await FoodsApiService.getUnidadesEscolares({ 
        filial_id: filtros.filial_id, 
        limit: 1000 
      });
      if (response.success && response.data) {
        const escolasData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data;
        
        if (Array.isArray(escolasData)) {
          setEscolas([
            { value: '', label: 'Todas as escolas' },
            ...escolasData.map(e => ({ 
              value: e.id, 
              label: e.nome_escola 
            }))
          ]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      toast.error('Erro ao carregar escolas');
      setEscolas([]);
    } finally {
      setLoadingEscolas(false);
    }
  };

  const handleFiltroChange = (name, value) => {
    setFiltros(prev => ({ ...prev, [name]: value }));
    
    // Limpar escola quando filial mudar
    if (name === 'filial_id') {
      setFiltros(prev => ({ ...prev, escola_id: '' }));
    }
    
    // Se semana de consumo for alterada manualmente, marcar como não preenchida automaticamente
    if (name === 'semana_consumo') {
      setSemanaConsumoPreenchidaAuto(false);
    }
    
    // Se semana de abastecimento for alterada manualmente, já será tratado pelo useEffect
  };

  const handleGerar = async () => {
    // Validar filtros obrigatórios: Filial, Escola, Semana de Abastecimento e Grupo de Produtos
    if (!filtros.filial_id || !filtros.escola_id || !filtros.semana_abastecimento || !filtros.grupo_id) {
      toast.error('Por favor, preencha todos os campos obrigatórios: Filial, Escola, Semana de Abastecimento e Grupo de Produtos');
      return;
    }

    // Validar se semana de consumo foi preenchida automaticamente (ela é necessária para gerar, mas vem automaticamente)
    if (!filtros.semana_consumo) {
      toast.error('Aguarde o preenchimento automático da Semana de Consumo ou selecione uma Semana de Abastecimento válida');
      return;
    }

    setGerando(true);
    try {
      const response = await NecessidadesPadroesService.gerarNecessidadesPadrao({
        filial_id: filtros.filial_id,
        escola_id: filtros.escola_id,
        semana_abastecimento: filtros.semana_abastecimento,
        semana_consumo: filtros.semana_consumo,
        grupo_id: filtros.grupo_id
      });

      if (response.success) {
        const { total_necessidades, escolas_processadas, escolas } = response.data;
        let mensagem = `Necessidades geradas com sucesso!\n\n`;
        mensagem += `• ${total_necessidades} necessidade(s) criada(s)\n`;
        mensagem += `• ${escolas_processadas} escola(s) processada(s)\n\n`;
        mensagem += `Escolas afetadas:\n${escolas.map(e => `  - ${e}`).join('\n')}`;
        
        toast.success(mensagem, {
          duration: 8000,
          style: {
            whiteSpace: 'pre-line'
          }
        });

        // Limpar filtros após sucesso
        setFiltros({
          filial_id: filtros.filial_id, // Manter filial
          escola_id: '',
          semana_consumo: '',
          semana_abastecimento: '',
          grupo_id: ''
        });
      } else {
        toast.error(response.message || 'Erro ao gerar necessidades');
      }
    } catch (error) {
      console.error('Erro ao gerar necessidades:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao gerar necessidades padrão';
      toast.error(errorMessage);
    } finally {
      setGerando(false);
    }
  };

  // Validar se pode gerar: Filial, Escola, Semana de Abastecimento e Grupo de Produtos (Semana de Consumo é preenchida automaticamente)
  const podeGerar = filtros.filial_id && filtros.escola_id && filtros.semana_abastecimento && filtros.grupo_id && filtros.semana_consumo && !gerando;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaFilter className="mr-2" /> Filtros
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SearchableSelect
            label="Filial"
            name="filial_id"
            options={filiais}
            value={filtros.filial_id}
            onChange={(value) => handleFiltroChange('filial_id', value)}
            placeholder="Digite para buscar a filial..."
            loading={loadingFiltros}
            required
          />
          
          <SearchableSelect
            label="Escola"
            name="escola_id"
            options={escolas}
            value={filtros.escola_id}
            onChange={(value) => handleFiltroChange('escola_id', value)}
            placeholder={filtros.filial_id ? "Digite para buscar uma escola..." : "Selecione uma filial primeiro"}
            loading={loadingEscolas}
            disabled={!filtros.filial_id}
            required
          />
          
          <SearchableSelect
            label="Semana de Abastecimento"
            name="semana_abastecimento"
            options={semanasAbastecimento}
            value={filtros.semana_abastecimento}
            onChange={(value) => handleFiltroChange('semana_abastecimento', value)}
            placeholder="Selecione a semana de abastecimento..."
            loading={loadingFiltros}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semana de Consumo
              {filtros.semana_abastecimento && (
                <span className="ml-2 text-xs text-gray-500 font-normal">(Preenchido automaticamente)</span>
              )}
            </label>
            <SearchableSelect
              name="semana_consumo"
              options={filtros.semana_consumo && filtros.semana_abastecimento
                ? [{ value: filtros.semana_consumo, label: filtros.semana_consumo }]
                : semanasConsumo
              }
              value={filtros.semana_consumo || ''}
              onChange={() => {
                // Campo apenas informativo - não permite mudança manual quando há semana de abastecimento
              }}
              placeholder={
                !filtros.semana_abastecimento
                  ? "Selecione primeiro a semana de abastecimento"
                  : loadingSemanaConsumo
                  ? "Carregando semana de consumo..."
                  : filtros.semana_consumo
                  ? filtros.semana_consumo
                  : "Carregando..."
              }
              disabled={true}
              loading={loadingSemanaConsumo}
              required
              className={filtros.semana_abastecimento ? "bg-gray-50 cursor-not-allowed" : ""}
            />
          </div>
          
          <SearchableSelect
            label="Grupo de Produtos"
            name="grupo_id"
            options={grupos}
            value={filtros.grupo_id}
            onChange={(value) => handleFiltroChange('grupo_id', value)}
            placeholder="Digite para buscar um grupo..."
            loading={loadingFiltros}
            required
          />
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
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
    </div>
  );
};

export default GerarNecessidadePadrao;

