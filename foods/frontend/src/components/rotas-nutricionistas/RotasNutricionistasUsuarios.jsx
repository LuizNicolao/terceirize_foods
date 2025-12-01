import React from 'react';
import { FaUser, FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { Input } from '../ui';
import SearchableSelect from '../ui/SearchableSelect';

const RotasNutricionistasUsuarios = ({ 
  register, 
  isViewMode = false, 
  loadingUsuarios = false,
  usuarios = [],
  usuariosFiltrados = { supervisores: [], coordenadores: [] },
  filtrando = false,
  watch,
  setValue
}) => {
  const watchedUsuarioId = watch('usuario_id');
  const watchedSupervisorId = watch('supervisor_id');
  const watchedCoordenadorId = watch('coordenador_id');
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500 flex items-center">
        <FaUser className="h-4 w-4 text-green-600 mr-2" />
        Usuários Responsáveis
      </h3>
      <div className="space-y-3">
        <SearchableSelect
          label="Nutricionista"
          value={watchedUsuarioId || ''}
          onChange={(value) => setValue('usuario_id', value)}
          options={usuarios.map((usuario) => ({
            value: usuario.id,
            label: `${usuario.nome} - ${usuario.email}`
          }))}
          placeholder={loadingUsuarios ? 'Carregando usuários...' : 'Selecione um nutricionista'}
          disabled={isViewMode || loadingUsuarios}
          required
          loading={loadingUsuarios}
          filterBy={(option, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return option.label.toLowerCase().includes(term);
          }}
        />

        <SearchableSelect
          label="Supervisor"
          value={watchedSupervisorId || ''}
          onChange={(value) => setValue('supervisor_id', value)}
          options={usuariosFiltrados.supervisores.length > 0 
            ? usuariosFiltrados.supervisores.map((supervisor) => ({
                value: supervisor.id,
                label: `${supervisor.nome} - ${supervisor.email}`
              }))
            : []
          }
          placeholder={
            loadingUsuarios 
              ? 'Carregando supervisores...' 
              : filtrando 
                ? 'Filtrando supervisores...' 
                : watchedUsuarioId 
                  ? 'Nenhum supervisor encontrado para as filiais da nutricionista' 
                  : 'Selecione um supervisor'
          }
          disabled={isViewMode || loadingUsuarios || filtrando}
          required
          loading={loadingUsuarios || filtrando}
          filterBy={(option, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return option.label.toLowerCase().includes(term);
          }}
        />

        <SearchableSelect
          label="Coordenador"
          value={watchedCoordenadorId || ''}
          onChange={(value) => setValue('coordenador_id', value)}
          options={usuariosFiltrados.coordenadores.length > 0 
            ? usuariosFiltrados.coordenadores.map((coordenador) => ({
                value: coordenador.id,
                label: `${coordenador.nome} - ${coordenador.email}`
              }))
            : []
          }
          placeholder={
            loadingUsuarios 
              ? 'Carregando coordenadores...' 
              : filtrando 
                ? 'Filtrando coordenadores...' 
                : watchedUsuarioId 
                  ? 'Nenhum coordenador encontrado para as filiais da nutricionista' 
                  : 'Selecione um coordenador'
          }
          disabled={isViewMode || loadingUsuarios || filtrando}
          required
          loading={loadingUsuarios || filtrando}
          filterBy={(option, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return option.label.toLowerCase().includes(term);
          }}
        />
      </div>
    </div>
  );
};

export default RotasNutricionistasUsuarios;
