import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Modal } from '../ui';
import RotasNutricionistasService from '../../services/rotasNutricionistas';
import {
  RotasNutricionistasInfoBasicas,
  RotasNutricionistasUsuarios,
  RotasNutricionistasEscolasSelector,
  RotasNutricionistasObservacoes
} from './index';

const RotasNutricionistasModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  rota, 
  isViewMode = false,
  usuarios = [],
  supervisores = [],
  coordenadores = [],
  unidadesEscolares = [],
  loadingUsuarios = false
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [escolasSelecionadas, setEscolasSelecionadas] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState({
    supervisores: [],
    coordenadores: []
  });
  const [unidadesEscolaresFiltradas, setUnidadesEscolaresFiltradas] = useState([]);
  const [filtrando, setFiltrando] = useState(false);

  const watchedUsuarioId = watch('usuario_id');
  const watchedSupervisorId = watch('supervisor_id');
  const watchedCoordenadorId = watch('coordenador_id');

  useEffect(() => {
    if (rota && isOpen) {
      // Preencher formulário com dados da rota
      Object.keys(rota).forEach(key => {
        if (rota[key] !== null && rota[key] !== undefined) {
          setValue(key, rota[key]);
        }
      });
      
      // Preencher escolas selecionadas se a rota já tiver
      if (rota.escolas_responsaveis) {
        const escolasIds = rota.escolas_responsaveis.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        setEscolasSelecionadas(escolasIds);
      } else {
        setEscolasSelecionadas([]);
      }
    } else if (!rota && isOpen) {
      // Resetar formulário para nova rota
      reset();
      setValue('status', 'ativo');
      setEscolasSelecionadas([]);
    }

    // Inicializar estados filtrados sempre que os dados mudarem
    setUsuariosFiltrados({
      supervisores: supervisores || [],
      coordenadores: coordenadores || []
    });
    setUnidadesEscolaresFiltradas(unidadesEscolares || []);
  }, [rota, isOpen, setValue, reset, supervisores, coordenadores, unidadesEscolares]);

  // Filtrar usuários e unidades escolares quando nutricionista é selecionada
  useEffect(() => {
    const filtrarPorNutricionista = async () => {
      if (!watchedUsuarioId) {
        // Se não há nutricionista selecionada, mostrar todos
        setUsuariosFiltrados({
          supervisores: supervisores || [],
          coordenadores: coordenadores || []
        });
        setUnidadesEscolaresFiltradas(unidadesEscolares || []);
        setFiltrando(false);
        return;
      }

      setFiltrando(true);
      try {
        // Buscar filiais da nutricionista
        const filiaisResult = await RotasNutricionistasService.buscarFiliaisUsuario(watchedUsuarioId);
        if (!filiaisResult.success || !filiaisResult.data || filiaisResult.data.length === 0) {
          // Se não tem filiais, mostrar todos os usuários e escolas
          setUsuariosFiltrados({
            supervisores: supervisores || [],
            coordenadores: coordenadores || []
          });
          setUnidadesEscolaresFiltradas(unidadesEscolares || []);
          return;
        }

        const filiaisIds = filiaisResult.data.map(f => f.id);
        
        // Filtrar supervisores e coordenadores por filiais
        const [supervisoresFiltrados, coordenadoresFiltrados, unidadesFiltradas] = await Promise.all([
          Promise.all(filiaisIds.map(filialId => 
            RotasNutricionistasService.buscarUsuariosPorTipoEFilial('supervisor', filialId)
          )),
          Promise.all(filiaisIds.map(filialId => 
            RotasNutricionistasService.buscarUsuariosPorTipoEFilial('coordenador', filialId)
          )),
          Promise.all(filiaisIds.map(filialId => 
            RotasNutricionistasService.buscarUnidadesEscolaresPorFilial(filialId)
          ))
        ]);

        // Consolidar resultados
        const supervisoresUnicos = [...new Map(
          supervisoresFiltrados.flatMap(result => result.success ? result.data : [])
            .map(u => [u.id, u])
        ).values()];

        const coordenadoresUnicos = [...new Map(
          coordenadoresFiltrados.flatMap(result => result.success ? result.data : [])
            .map(u => [u.id, u])
        ).values()];

        const unidadesUnicas = [...new Map(
          unidadesFiltradas.flatMap(result => result.success ? result.data : [])
            .map(u => [u.id, u])
        ).values()];

        // Se não encontrou usuários filtrados, mostrar todos
        if (supervisoresUnicos.length === 0) {
          supervisoresUnicos.push(...(supervisores || []));
        }
        if (coordenadoresUnicos.length === 0) {
          coordenadoresUnicos.push(...(coordenadores || []));
        }
        if (unidadesUnicas.length === 0) {
          unidadesUnicas.push(...(unidadesEscolares || []));
        }

        setUsuariosFiltrados({
          supervisores: supervisoresUnicos,
          coordenadores: coordenadoresUnicos
        });
        setUnidadesEscolaresFiltradas(unidadesUnicas);

        // Limpar seleções se não forem mais válidas
        if (watchedSupervisorId && !supervisoresUnicos.find(s => s.id === parseInt(watchedSupervisorId))) {
          setValue('supervisor_id', '');
        }
        if (watchedCoordenadorId && !coordenadoresUnicos.find(c => c.id === parseInt(watchedCoordenadorId))) {
          setValue('coordenador_id', '');
        }
        if (escolasSelecionadas.length > 0) {
          const escolasValidas = escolasSelecionadas.filter(id => 
            unidadesUnicas.find(u => u.id === id)
          );
          setEscolasSelecionadas(escolasValidas);
        }

      } catch (error) {
        console.error('Erro ao filtrar por nutricionista:', error);
        // Em caso de erro, mostrar todos os usuários e escolas
        setUsuariosFiltrados({
          supervisores: supervisores || [],
          coordenadores: coordenadores || []
        });
        setUnidadesEscolaresFiltradas(unidadesEscolares || []);
      } finally {
        setFiltrando(false);
      }
    };

    // Só executar se tivermos os dados necessários
    if (supervisores && coordenadores && unidadesEscolares) {
      filtrarPorNutricionista();
    }
  }, [watchedUsuarioId, supervisores, coordenadores, unidadesEscolares, watchedSupervisorId, watchedCoordenadorId, escolasSelecionadas, setValue]);

  const handleFormSubmit = (data) => {
    // Adicionar escolas selecionadas aos dados do formulário
    const formDataWithEscolas = {
      ...data,
      escolas_responsaveis: escolasSelecionadas.join(',')
    };
    onSubmit(formDataWithEscolas);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Rota Nutricionista' : rota ? 'Editar Rota Nutricionista' : 'Adicionar Rota Nutricionista'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RotasNutricionistasInfoBasicas 
            register={register} 
            isViewMode={isViewMode} 
          />
          
          <RotasNutricionistasUsuarios
            register={register}
            isViewMode={isViewMode}
            loadingUsuarios={loadingUsuarios}
            usuarios={usuarios}
            usuariosFiltrados={usuariosFiltrados}
            filtrando={filtrando}
            watchedUsuarioId={watchedUsuarioId}
          />
        </div>

        {/* Segunda Linha - 1 Card Grande para Escolas */}
        <div className="grid grid-cols-1 gap-4">
          <RotasNutricionistasEscolasSelector
            escolasSelecionadas={escolasSelecionadas}
            onEscolasChange={setEscolasSelecionadas}
            isViewMode={isViewMode}
            unidadesEscolaresFiltradas={unidadesEscolaresFiltradas}
            watchedUsuarioId={watchedUsuarioId}
          />
        </div>
        
        {/* Terceira Linha - Observações */}
        <div className="grid grid-cols-1 gap-4">
          <RotasNutricionistasObservacoes 
            register={register} 
            isViewMode={isViewMode} 
          />
        </div>

        {/* Botões de ação */}
        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!watchedUsuarioId || !watchedSupervisorId || !watchedCoordenadorId}
            >
              {rota ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}

        {isViewMode && (
          <div className="flex justify-end pt-3 border-t">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default RotasNutricionistasModal;
