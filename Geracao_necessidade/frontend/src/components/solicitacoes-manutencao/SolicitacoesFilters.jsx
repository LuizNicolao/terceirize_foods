import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { Input, SearchableSelect } from '../ui';
import Button from '../ui/Button';

const SolicitacoesFilters = ({ 
  filtros, 
  onFiltrosChange, 
  escolas = [], 
  onLimparFiltros 
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Aprovado', label: 'Aprovado' },
    { value: 'Reprovado', label: 'Reprovado' },
    { value: 'Pendente manutenção', label: 'Pendente manutenção' },
    { value: 'Concluído', label: 'Concluído' }
  ];

  const escolaOptions = [
    { value: '', label: 'Todas as escolas' },
    ...escolas.map(escola => ({
      value: escola.id.toString(),
      label: `${escola.nome_escola} - ${escola.rota}`
    }))
  ];

  const handleInputChange = (field, value) => {
    onFiltrosChange({
      ...filtros,
      [field]: value
    });
  };

  const limparFiltros = () => {
    onFiltrosChange({
      busca: '',
      status: '',
      escola_id: '',
      data_inicio: '',
      data_fim: ''
    });
    onLimparFiltros();
  };

  const temFiltrosAtivos = () => {
    return filtros.busca || filtros.status || filtros.escola_id || filtros.data_inicio || filtros.data_fim;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Barra de busca principal */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por escola, nutricionista ou descrição..."
              value={filtros.busca}
              onChange={(e) => handleInputChange('busca', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2"
          >
            <FaFilter />
            Filtros
            {temFiltrosAtivos() && (
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                !
              </span>
            )}
          </Button>
          
          {temFiltrosAtivos() && (
            <Button
              variant="outline"
              onClick={limparFiltros}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <FaTimes />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros avançados */}
      {mostrarFiltros && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <SearchableSelect
                options={statusOptions}
                value={filtros.status}
                onChange={(value) => handleInputChange('status', value)}
                placeholder="Selecione o status"
              />
            </div>

            {/* Escola */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escola
              </label>
              <SearchableSelect
                options={escolaOptions}
                value={filtros.escola_id}
                onChange={(value) => handleInputChange('escola_id', value)}
                placeholder="Selecione a escola"
              />
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <Input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => handleInputChange('data_inicio', e.target.value)}
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <Input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => handleInputChange('data_fim', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filtros ativos */}
      {temFiltrosAtivos() && (
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Filtros ativos:</span>
            
            {filtros.busca && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Busca: {filtros.busca}
              </span>
            )}
            
            {filtros.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {statusOptions.find(opt => opt.value === filtros.status)?.label}
              </span>
            )}
            
            {filtros.escola_id && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Escola: {escolaOptions.find(opt => opt.value === filtros.escola_id)?.label}
              </span>
            )}
            
            {filtros.data_inicio && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                De: {new Date(filtros.data_inicio).toLocaleDateString('pt-BR')}
              </span>
            )}
            
            {filtros.data_fim && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Até: {new Date(filtros.data_fim).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitacoesFilters;
