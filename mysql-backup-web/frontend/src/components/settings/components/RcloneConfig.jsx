import { useState } from 'react'
import { FaInfoCircle, FaPlus } from 'react-icons/fa'
import RcloneConfigForm from './RcloneConfigForm'
import Modal from '../../ui/Modal'

export default function RcloneConfig({ onRefresh }) {
  const [showForm, setShowForm] = useState(false)

  const handleSuccess = () => {
    setShowForm(false)
    if (onRefresh) onRefresh()
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900">Configuração de Remotos</h4>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <FaPlus />
            Novo Remoto
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">📋 Configuração pela Interface</h4>
          
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              Use o botão <strong>"Novo Remoto"</strong> acima para configurar um novo serviço de nuvem através da interface web.
              Não é necessário executar comandos no terminal.
            </p>
            
            <div>
              <p className="font-semibold mb-2">Serviços Suportados:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Google Drive</strong> - Requer Client ID e Client Secret</li>
                <li><strong>AWS S3</strong> - Requer Access Key ID e Secret Access Key</li>
                <li><strong>Dropbox</strong> - Requer App Key e App Secret</li>
                <li><strong>FTP/SFTP</strong> - Requer Host, Usuário e Senha</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
          <div className="flex items-start gap-2">
            <FaInfoCircle className="text-blue-600 text-lg mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-2">Como Funciona</p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Após cada backup ser criado e comprimido, o sistema automaticamente faz upload para o remoto configurado</li>
                <li>Os backups são organizados na nuvem da mesma forma que localmente (daily/weekly/monthly/manual)</li>
                <li>O caminho remoto é salvo no banco de dados para referência futura</li>
                <li>Se o upload falhar, o backup local ainda é mantido e uma notificação é enviada</li>
                <li>Configure <code className="bg-blue-100 px-1 rounded">RCLONE_REMOTE</code> no docker-compose.yml para usar o remoto padrão</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Configurar Novo Remoto"
          size="lg"
        >
          <RcloneConfigForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </>
  )
}

