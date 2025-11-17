import React from 'react';
import { FaSchool, FaBox, FaCalendarAlt } from 'react-icons/fa';
import { SearchableSelect } from '../../../components/ui';

const FiltrosGerarNecessidade = ({ 
  escolas, 
  grupos, 
  filtros, 
  onFiltroChange, 
  loading = false 
}) => {
  const handleEscolaChange = (escola) => {
    onFiltroChange('escola', escola);
  };

  const handleGrupoChange = (grupo) => {
    onFiltroChange('grupo', grupo);
  };

  const handleDataChange = (data) => {
    onFiltroChange('data', data);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FaSchool className="mr-2 text-green-600" />
        Filtros para Gerar Necessidade
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selecionar Escola */}
        <div className="form-group">
          <label className="form-label">
            <FaSchool className="mr-2" />
            Selecionar Escola *
          </label>
          <SearchableSelect
            options={escolas.map(escola => ({
              value: escola,
              label: `${escola.nome_escola} - ${escola.rota}`
            }))}
            value={filtros.escola}
            onChange={handleEscolaChange}
            placeholder="Selecione uma escola"
            disabled={loading}
            searchFields={['nome_escola', 'rota']}
            usePortal={false}
          />
        </div>

        {/* Selecionar Grupo */}
        <div className="form-group">
          <label className="form-label">
            <FaBox className="mr-2" />
            Selecionar Grupo *
          </label>
          <SearchableSelect
            options={grupos.map(grupo => ({
              value: grupo,
              label: grupo.nome
            }))}
            value={filtros.grupo}
            onChange={handleGrupoChange}
            placeholder="Selecione um grupo de produtos"
            disabled={loading}
            searchFields={['nome']}
            usePortal={false}
          />
        </div>

        {/* Selecionar Data */}
        <div className="form-group">
          <label className="form-label">
            <FaCalendarAlt className="mr-2" />
            Selecionar Data *
          </label>
          <input
            type="date"
            value={filtros.data}
            onChange={(e) => handleDataChange(e.target.value)}
            className="form-input"
            disabled={loading}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Resumo dos filtros selecionados */}
      {(filtros.escola || filtros.grupo || filtros.data) && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-2">Filtros Selecionados:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            {filtros.escola && (
              <div className="text-green-700">
                <span className="font-medium">Escola:</span> {filtros.escola.nome_escola}
              </div>
            )}
            {filtros.grupo && (
              <div className="text-green-700">
                <span className="font-medium">Grupo:</span> {filtros.grupo.nome}
              </div>
            )}
            {filtros.data && (
              <div className="text-green-700">
                <span className="font-medium">Data:</span> {new Date(filtros.data).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosGerarNecessidade;
