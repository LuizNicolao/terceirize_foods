import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Modal } from '../ui';
// import RotasNutricionistasService from '../../services/rotasNutricionistas';
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
      // Lidar com estrutura de dados do projeto implantação
      const rotaData = rota.data || rota;
      
      // Mapear campos específicos para o formulário
      const fieldMappings = {
        codigo: rotaData.codigo || rotaData.codigo_rota,
        descricao: rotaData.descricao || rotaData.nome || rotaData.nome_rota,
        status: rotaData.status,
        usuario_id: rotaData.usuario_id || rotaData.nutricionista_id,
        supervisor_id: rotaData.supervisor_id,
        coordenador_id: rotaData.coordenador_id,
        data_inicio: rotaData.data_inicio,
        data_fim: rotaData.data_fim,
        observacoes: rotaData.observacoes || rotaData.observacao
      };

      // Preencher campos mapeados
      Object.keys(fieldMappings).forEach(key => {
        if (fieldMappings[key] !== null && fieldMappings[key] !== undefined) {
          setValue(key, fieldMappings[key]);
        }
      });
      
      // Preencher escolas selecionadas se a rota já tiver
      if (rotaData.escolas_responsaveis) {
        const escolasIds = rotaData.escolas_responsaveis.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
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
    // Para o projeto implantação, não temos a lógica de filtro por filiais
    // Mostrar todos os usuários e escolas disponíveis
    setUsuariosFiltrados({
      supervisores: supervisores || [],
      coordenadores: coordenadores || []
    });
    setUnidadesEscolaresFiltradas(unidadesEscolares || []);
    setFiltrando(false);
  }, [watchedUsuarioId, supervisores, coordenadores, unidadesEscolares]);

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
            rotaData={rota}
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
            rotaData={rota}
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
