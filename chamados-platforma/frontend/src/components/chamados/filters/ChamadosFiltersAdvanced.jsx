import React, { useState } from 'react';
import { FaFilter, FaCalendarAlt, FaUser, FaTimes } from 'react-icons/fa';
import { Button } from '../../ui';
import UsuariosService from '../../../services/usuarios';

const ChamadosFiltersAdvanced = ({
  sistemaFilter,
  tipoFilter,
  statusFilter,
  prioridadeFilter,
  responsavelFilter,
  criadorFilter,
  dataInicioFilter,
  dataFimFilter,
  onSistemaChange,
  onTipoChange,
  onStatusChange,
  onPrioridadeChange,
  onResponsavelChange,
  onCriadorChange,
  onDataInicioChange,
  onDataFimChange,
  onClearFilters
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  React.useEffect(() => {
    if (showAdvanced) {
      carregarUsuarios();
    }
  }, [showAdvanced]);

  const carregarUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const result = await UsuariosService.buscarAtivos();
      if (result.success) {
        setUsuarios(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const sistemasDisponiveis = [
    { value: '', label: 'Todos os Sistemas' },
    { value: 'implantacao', label: 'Implantação' },
    { value: 'cozinha_industrial', label: 'Cozinha Industrial' },
    { value: 'chamados-platforma', label: 'Chamados Platforma' },
    { value: 'foods', label: 'Foods' },
    { value: 'cotacao', label: 'Cotação' }
  ];

  const hasActiveFilters = sistemaFilter || tipoFilter || statusFilter || prioridadeFilter || 
                          responsavelFilter || criadorFilter || dataInicioFilter || dataFimFilter;

  return (
    <div className="mb-4 space-y-3">
      {/* Filtros Básicos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <select
          value={sistemaFilter}
          onChange={(e) => onSistemaChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {sistemasDisponiveis.map(sistema => (
            <option key={sistema.value} value={sistema.value}>
              {sistema.label}
            </option>
          ))}
        </select>

        <select
          value={tipoFilter}
          onChange={(e) => onTipoChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todos os Tipos</option>
          <option value="bug">Bug</option>
          <option value="erro">Erro</option>
          <option value="melhoria">Melhoria</option>
          <option value="feature">Feature</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todos os Status</option>
          <option value="aberto">Aberto</option>
          <option value="em_analise">Em Análise</option>
          <option value="em_desenvolvimento">Em Desenvolvimento</option>
          <option value="em_teste">Em Teste</option>
          <option value="concluido">Concluído</option>
          <option value="fechado">Fechado</option>
        </select>

        <select
          value={prioridadeFilter}
          onChange={(e) => onPrioridadeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todas as Prioridades</option>
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>
      </div>

      {/* Botão para mostrar filtros avançados */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <FaFilter />
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Filtros Avançados
        </Button>

        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-red-600 hover:text-red-800"
          >
            <FaTimes />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Filtros Avançados</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Filtro por Responsável */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <FaUser className="inline mr-1" />
                Responsável
              </label>
              <select
                value={responsavelFilter}
                onChange={(e) => onResponsavelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loadingUsuarios}
              >
                <option value="">Todos</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Criador */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <FaUser className="inline mr-1" />
                Criador
              </label>
              <select
                value={criadorFilter}
                onChange={(e) => onCriadorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loadingUsuarios}
              >
                <option value="">Todos</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Data Início */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline mr-1" />
                Data Início
              </label>
              <input
                type="date"
                value={dataInicioFilter}
                onChange={(e) => onDataInicioChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Filtro por Data Fim */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline mr-1" />
                Data Fim
              </label>
              <input
                type="date"
                value={dataFimFilter}
                onChange={(e) => onDataFimChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChamadosFiltersAdvanced;

