import { getDatabaseDisplayName } from '../../utils/databaseNames'
import { FaFilter, FaDatabase, FaCalendarAlt } from 'react-icons/fa'

export default function BackupsFilters({ 
  databases, 
  selectedDatabase, 
  selectedType, 
  onDatabaseChange, 
  onTypeChange 
}) {
  return (
    <div className="card mb-4 sm:mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Título e Ícone */}
        <div className="flex items-center gap-2 text-gray-700">
          <FaFilter className="text-lg" />
          <h3 className="font-semibold text-sm sm:text-base">Filtros</h3>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
          {/* Filtro de Banco */}
          <div className="flex-1 sm:flex-initial min-w-[180px]">
            <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
              <FaDatabase className="text-xs" />
              Banco de Dados
            </label>
      <select
        value={selectedDatabase}
        onChange={(e) => onDatabaseChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white hover:border-gray-400"
      >
        <option value="">Todos os bancos</option>
        {databases.map(db => (
          <option key={db} value={db}>{getDatabaseDisplayName(db)}</option>
        ))}
      </select>
          </div>

          {/* Filtro de Tipo */}
          <div className="flex-1 sm:flex-initial min-w-[180px]">
            <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
              <FaCalendarAlt className="text-xs" />
              Tipo de Backup
            </label>
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white hover:border-gray-400"
      >
        <option value="">Todos os tipos</option>
        <option value="daily">Diário</option>
        <option value="weekly">Semanal</option>
        <option value="monthly">Mensal</option>
        <option value="incremental">Incremental</option>
        <option value="manual">Manual</option>
      </select>
          </div>
        </div>
      </div>
    </div>
  )
}

