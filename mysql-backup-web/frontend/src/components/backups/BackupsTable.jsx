import React, { useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
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
  onDelete,
  onViewLogs
}) {
  const [expandedRows, setExpandedRows] = useState(new Set())

  const toggleRow = (backupId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(backupId)) {
        newSet.delete(backupId)
      } else {
        newSet.add(backupId)
      }
      return newSet
    })
  }

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
              backups.map(backup => {
                const isExpanded = expandedRows.has(backup.id)
                return (
                  <React.Fragment key={backup.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getDatabaseDisplayName(backup.database_name)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getBackupTypeDisplayName(backup.backup_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${
                            backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                            backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                            backup.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getBackupStatusDisplayName(backup.status)}
                          </span>
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRow(backup.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title={isExpanded ? 'Ocultar caminho' : 'Mostrar caminho'}
                          >
                            <FaInfoCircle className="w-4 h-4" />
                          </button>
                          <ActionButtons
                            canCancel={backup.status === 'running'}
                            canDownload={backup.status === 'completed'}
                            canRestore={backup.status === 'completed'}
                            canDelete={backup.status === 'completed' || backup.status === 'failed'}
                            canViewLogs={true}
                            onCancel={() => onCancel(backup.id)}
                            onDownload={() => onDownload(backup.id)}
                            onRestore={() => onRestore(backup.id)}
                            onDelete={() => onDelete(backup.id)}
                            onViewLogs={onViewLogs}
                            item={backup}
                          />
                        </div>
                      </td>
                    </tr>
                    {isExpanded && backup.file_path && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="px-6 py-3 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-700">Caminho no servidor:</span>
                            <span className="font-mono text-xs text-gray-600 break-all">{backup.file_path}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

