import { getDatabaseDisplayName } from '../../utils/databaseNames'

export default function DatabasesList({ databases }) {
  return (
    <div className="card mb-8">
      <div className="px-6 py-4 border-b border-gray-200 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bancos de Dados Disponíveis</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {databases.map(db => (
          <div key={db} className="border border-gray-200 rounded-lg p-4 transition-colors">
            <div className="font-medium text-gray-900">{getDatabaseDisplayName(db)}</div>
            <div className="text-xs text-gray-500 mt-1">{db}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

