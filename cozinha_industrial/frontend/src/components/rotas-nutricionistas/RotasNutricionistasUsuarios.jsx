import React from 'react';
import { FaUser, FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { Input } from '../ui';

const RotasNutricionistasUsuarios = ({ 
  register, 
  isViewMode = false, 
  loadingUsuarios = false,
  usuarios = [],
  usuariosFiltrados = { supervisores: [], coordenadores: [] },
  filtrando = false,
  watchedUsuarioId,
  rotaData = {}
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500 flex items-center">
        <FaUser className="h-4 w-4 text-green-600 mr-2" />
        Usuários Responsáveis
      </h3>
      <div className="space-y-3">
        <Input
          label="Nutricionista *"
          type={isViewMode ? "text" : "select"}
          {...register('usuario_id')}
          disabled={isViewMode || loadingUsuarios}
          value={isViewMode ? (rotaData.usuario_nome || rotaData.nutricionista_nome || '-') : undefined}
        >
          {!isViewMode && (
            <>
              <option value="">
                {loadingUsuarios ? 'Carregando usuários...' : 'Selecione um nutricionista'}
              </option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome} - {usuario.email}
                </option>
              ))}
            </>
          )}
        </Input>

        <Input
          label="Supervisor *"
          type={isViewMode ? "text" : "select"}
          {...register('supervisor_id')}
          disabled={isViewMode || loadingUsuarios}
          value={isViewMode ? (rotaData.supervisor_nome || '-') : undefined}
        >
          {!isViewMode && (
            <>
              <option value="">
                {loadingUsuarios ? 'Carregando supervisores...' : 'Selecione um supervisor'}
              </option>
              {usuariosFiltrados.supervisores.length > 0 ? (
                usuariosFiltrados.supervisores.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.nome} - {supervisor.email}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {filtrando ? 'Filtrando supervisores...' : watchedUsuarioId ? 'Nenhum supervisor encontrado para as filiais da nutricionista' : 'Nenhum supervisor disponível'}
                </option>
              )}
            </>
          )}
        </Input>

        <Input
          label="Coordenador *"
          type={isViewMode ? "text" : "select"}
          {...register('coordenador_id')}
          disabled={isViewMode || loadingUsuarios}
          value={isViewMode ? (rotaData.coordenador_nome || '-') : undefined}
        >
          {!isViewMode && (
            <>
              <option value="">
                {loadingUsuarios ? 'Carregando coordenadores...' : 'Selecione um coordenador'}
              </option>
              {usuariosFiltrados.coordenadores.length > 0 ? (
                usuariosFiltrados.coordenadores.map((coordenador) => (
                  <option key={coordenador.id} value={coordenador.id}>
                    {coordenador.nome} - {coordenador.email}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {filtrando ? 'Filtrando coordenadores...' : watchedUsuarioId ? 'Nenhum coordenador encontrado para as filiais da nutricionista' : 'Nenhum coordenador disponível'}
                </option>
              )}
            </>
          )}
        </Input>
      </div>
    </div>
  );
};

export default RotasNutricionistasUsuarios;
