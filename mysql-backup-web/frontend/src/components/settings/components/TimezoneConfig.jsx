import { FaClock } from 'react-icons/fa'

export default function TimezoneConfig({ timezone }) {
  return (
    <div className="card">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FaClock className="text-green-600 text-lg" />
          <label className="text-lg font-semibold text-gray-900">
            Timezone
          </label>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-gray-900 font-semibold text-lg mb-3">
            {timezone || 'UTC'}
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="mb-2">
              O fuso horário usado pelo sistema para registrar datas e horários dos backups. 
              Todas as operações de backup e agendamento utilizam este timezone.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              <strong>Exemplos:</strong> America/Sao_Paulo, UTC, America/New_York, Europe/London
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

