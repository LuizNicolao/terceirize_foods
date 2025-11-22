import { getDatabaseDisplayName, getBackupTypeDisplayName, getBackupStatusDisplayName } from '../../utils/databaseNames'

export default function RecentBackupsTable({ recentBackups }) {
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Backups Recentes</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Banco</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Tamanho</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Data</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {recentBackups.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Nenhum backup encontrado
                </td>
              </tr>
            ) : (
              recentBackups.map(backup => (
                <tr key={backup.id} className="transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getDatabaseDisplayName(backup.database_name)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getBackupTypeDisplayName(backup.backup_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                      backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                      backup.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getBackupStatusDisplayName(backup.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.file_size_formatted || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(backup.created_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

