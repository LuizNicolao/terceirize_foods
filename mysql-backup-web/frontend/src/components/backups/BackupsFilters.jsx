import { getDatabaseDisplayName } from '../../utils/databaseNames'

export default function BackupsFilters({ 
  databases, 
  selectedDatabase, 
  selectedType, 
  onDatabaseChange, 
  onTypeChange 
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <select
        value={selectedDatabase}
        onChange={(e) => onDatabaseChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white min-w-[140px]"
      >
        <option value="">Todos os bancos</option>
        {databases.map(db => (
          <option key={db} value={db}>{getDatabaseDisplayName(db)}</option>
        ))}
      </select>
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white min-w-[140px]"
      >
        <option value="">Todos os tipos</option>
        <option value="daily">Diário</option>
        <option value="weekly">Semanal</option>
        <option value="monthly">Mensal</option>
        <option value="manual">Manual</option>
      </select>
    </div>
  )
}

