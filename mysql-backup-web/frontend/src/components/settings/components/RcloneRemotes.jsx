import { useState } from 'react'
import { FaCloud, FaCheckCircle, FaTimesCircle, FaSpinner, FaTrash } from 'react-icons/fa'
import api from '../../../services/api'

export default function RcloneRemotes({ rcloneConfig, testingRemote, testResult, onTestRemote, onRefresh }) {
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (remoteName) => {
    if (!window.confirm(`Tem certeza que deseja deletar o remoto "${remoteName}"?`)) {
      return
    }

    setDeleting(remoteName)
    try {
      await api.delete(`/rclone/${remoteName}`)
      if (onRefresh) onRefresh()
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao deletar remoto')
    } finally {
      setDeleting(null)
    }
  }
  return (
    <div className="card">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <div className="text-sm font-semibold text-gray-900 mb-3">
          Remotos Configurados
        </div>
        
        {rcloneConfig?.remotes && rcloneConfig.remotes.length > 0 ? (
          <div className="space-y-2">
            {rcloneConfig.remotes.map((remote, index) => (
              <div key={index} className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCloud className="text-blue-500" />
                  <span className="text-sm font-mono">{remote}:</span>
                  {rcloneConfig.defaultRemote === `${remote}:` && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Padrão</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTestRemote(`${remote}:`)}
                    disabled={testingRemote}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {testingRemote ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Testar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(remote)}
                    disabled={deleting === remote}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {deleting === remote ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
            Nenhum remoto configurado. Execute <code className="bg-yellow-100 px-1 rounded">rclone config</code> no container para configurar.
          </div>
        )}

        {/* Resultado do Teste */}
        {testResult && (
          <div className={`mt-3 p-3 rounded border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <FaCheckCircle className="text-green-600" />
              ) : (
                <FaTimesCircle className="text-red-600" />
              )}
              <span className={`text-sm ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status da Configuração */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">Status Atual</div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Remoto Padrão:</span>
            <span className="font-mono text-gray-900">
              {rcloneConfig?.defaultRemote || 'Não configurado'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Upload Automático:</span>
            <span className={rcloneConfig?.defaultRemote ? 'text-green-600 font-semibold' : 'text-gray-500'}>
              {rcloneConfig?.defaultRemote ? '✅ Ativo' : '❌ Inativo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

