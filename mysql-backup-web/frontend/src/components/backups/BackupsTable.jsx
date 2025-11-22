import { ActionButtons } from '../ui'
import { getDatabaseDisplayName, getBackupTypeDisplayName, getBackupStatusDisplayName } from '../../utils/databaseNames'

export default function BackupsTable({ 
  backups, 
  loading, 
  runningBackups, 
  formatElapsedTime,
  onCancel,
  onDownload,
  onRestore,
  onDelete
}) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="p-6 text-center text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Banco</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Tamanho</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Data</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {backups.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Nenhum backup encontrado</td>
              </tr>
            ) : (
              backups.map(backup => (
                <tr key={backup.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getDatabaseDisplayName(backup.database_name)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getBackupTypeDisplayName(backup.backup_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                        backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                        backup.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getBackupStatusDisplayName(backup.status)}
                      </span>
                      {backup.status === 'running' && runningBackups.has(backup.id) && (
                        <div className="text-xs text-gray-600">
                          <div>⏱️ {formatElapsedTime(runningBackups.get(backup.id).elapsed)}</div>
                          <div>📦 {runningBackups.get(backup.id).fileSizeFormatted || '0 Bytes'}</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.status === 'running' && runningBackups.has(backup.id) 
                      ? runningBackups.get(backup.id).fileSizeFormatted || '0 Bytes'
                      : backup.file_size_formatted || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(backup.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canCancel={backup.status === 'running'}
                      canDownload={backup.status === 'completed'}
                      canRestore={backup.status === 'completed'}
                      canDelete={backup.status === 'completed' || backup.status === 'failed'}
                      onCancel={() => onCancel(backup.id)}
                      onDownload={() => onDownload(backup.id)}
                      onRestore={() => onRestore(backup.id)}
                      onDelete={() => onDelete(backup.id)}
                      item={backup}
                    />
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

