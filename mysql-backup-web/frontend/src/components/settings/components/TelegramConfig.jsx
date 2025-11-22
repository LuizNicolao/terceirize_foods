import { FaPaperPlane } from 'react-icons/fa'

export default function TelegramConfig({ telegramEnabled }) {
  return (
    <div className="card">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FaPaperPlane className="text-green-600 text-lg" />
          <label className="text-lg font-semibold text-gray-900">
            Notificações Telegram
          </label>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="mb-3">
            {telegramEnabled ? (
              <span className="inline-flex items-center text-green-600 font-semibold text-lg">
                <span className="mr-2">✅</span>
                Configurado e Ativo
              </span>
            ) : (
              <span className="inline-flex items-center text-gray-500 font-semibold text-lg">
                <span className="mr-2">❌</span>
                Não Configurado
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-600 leading-relaxed">
            {telegramEnabled ? (
              <>
                <p className="mb-2">
                  As notificações via Telegram estão ativas. Você receberá mensagens automáticas sobre:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                  <li>Início e conclusão de backups</li>
                  <li>Falhas durante o processo de backup</li>
                  <li>Conclusão de restaurações</li>
                  <li>Erros críticos do sistema</li>
                </ul>
              </>
            ) : (
              <>
                <p className="mb-2">
                  Para habilitar notificações via Telegram, configure as seguintes variáveis de ambiente no <code className="bg-gray-200 px-1 rounded">docker-compose.yml</code>:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1 text-xs font-mono bg-white p-2 rounded border border-gray-200">
                  <li>TELEGRAM_BOT_TOKEN</li>
                  <li>TELEGRAM_CHAT_ID</li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  Após configurar, reinicie o container do backend para aplicar as alterações.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

