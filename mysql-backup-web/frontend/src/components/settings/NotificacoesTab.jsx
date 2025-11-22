import { FaPaperPlane } from 'react-icons/fa'
import TelegramConfig from './components/TelegramConfig'

export default function NotificacoesTab({ settings }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FaPaperPlane className="text-green-600 text-lg" />
        <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
      </div>

      <TelegramConfig telegramEnabled={settings?.telegramEnabled} />
    </div>
  )
}

