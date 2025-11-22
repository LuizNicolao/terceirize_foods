import { useState, useEffect } from 'react'
import { FaCloud } from 'react-icons/fa'
import api from '../../services/api'
import RcloneStatus from './components/RcloneStatus'
import RcloneConfig from './components/RcloneConfig'
import RcloneRemotes from './components/RcloneRemotes'

export default function NuvemTab() {
  const [rcloneConfig, setRcloneConfig] = useState(null)
  const [testingRemote, setTestingRemote] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    loadRcloneConfig()
  }, [])

  const loadRcloneConfig = async () => {
    try {
      const res = await api.get('/rclone/config')
      setRcloneConfig(res.data.data)
    } catch (error) {
      console.error('Erro ao carregar configuração rclone:', error)
      setRcloneConfig({
        installed: false,
        configured: false,
        remotes: []
      })
    }
  }

  const testRemoteConnection = async (remoteName) => {
    if (!remoteName) {
      setTestResult({ success: false, message: 'Selecione um remoto primeiro' })
      return
    }

    setTestingRemote(true)
    setTestResult(null)

    try {
      const res = await api.post('/rclone/test', { remoteName })
      setTestResult(res.data)
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Erro ao testar conexão'
      })
    } finally {
      setTestingRemote(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FaCloud className="text-green-600 text-lg" />
        <h3 className="text-lg font-semibold text-gray-900">Backup em Nuvem (Rclone)</h3>
      </div>

      <RcloneStatus rcloneConfig={rcloneConfig} />

      {rcloneConfig?.installed && (
        <>
          <RcloneConfig onRefresh={loadRcloneConfig} />
          <RcloneRemotes 
            rcloneConfig={rcloneConfig}
            testingRemote={testingRemote}
            testResult={testResult}
            onTestRemote={testRemoteConnection}
            onRefresh={loadRcloneConfig}
          />
        </>
      )}
    </div>
  )
}

