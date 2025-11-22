import { FaInfoCircle, FaFolder, FaCalendarAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import DiretorioBackups from './components/DiretorioBackups'
import PoliticaRetencao from './components/PoliticaRetencao'
import TimezoneConfig from './components/TimezoneConfig'

export default function GeralTab({ settings }) {
  return (
    <div className="space-y-6">
      {/* Informação Geral */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <FaInfoCircle className="text-blue-600 text-xl mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Sobre as Configurações</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            As configurações abaixo são definidas através de variáveis de ambiente no arquivo <code className="bg-blue-100 px-1 rounded">docker-compose.yml</code>. 
            Para alterar qualquer configuração, edite o arquivo e reinicie os containers. Esta tela exibe apenas os valores atuais em uso pelo sistema.
          </p>
        </div>
      </div>

      {/* Diretório de Backups */}
      <DiretorioBackups backupBaseDir={settings?.backupBaseDir} />

      {/* Política de Retenção */}
      <PoliticaRetencao 
        retentionDaily={settings?.retentionDaily}
        retentionWeekly={settings?.retentionWeekly}
        retentionMonthly={settings?.retentionMonthly}
      />

      {/* Timezone */}
      <TimezoneConfig timezone={settings?.timezone} />
    </div>
  )
}

