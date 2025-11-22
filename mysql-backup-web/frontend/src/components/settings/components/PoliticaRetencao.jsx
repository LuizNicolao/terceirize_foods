import { FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa'

export default function PoliticaRetencao({ retentionDaily, retentionWeekly, retentionMonthly }) {
  return (
    <div className="card">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FaCalendarAlt className="text-green-600 text-lg" />
          <label className="text-lg font-semibold text-gray-900">
            Política de Retenção
          </label>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <p className="text-sm text-blue-800 leading-relaxed">
            A política de retenção define por quanto tempo os backups são mantidos antes de serem automaticamente excluídos. 
            Isso ajuda a gerenciar o espaço em disco e manter apenas os backups mais relevantes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-700 uppercase">Retenção Diária</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {retentionDaily || 7}
            </div>
            <div className="text-sm text-gray-600 mb-3">dias</div>
            <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-3">
              Backups diários são mantidos por este período. Após este tempo, os backups mais antigos são automaticamente removidos para liberar espaço.
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-700 uppercase">Retenção Semanal</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {retentionWeekly || 4}
            </div>
            <div className="text-sm text-gray-600 mb-3">semanas</div>
            <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-3">
              Backups semanais são mantidos por este período. Geralmente são backups mais compactos e servem como ponto de restauração intermediário.
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-700 uppercase">Retenção Mensal</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {retentionMonthly || 3}
            </div>
            <div className="text-sm text-gray-600 mb-3">meses</div>
            <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-3">
              Backups mensais são mantidos por este período. Estes são backups de longo prazo para recuperação histórica e auditoria.
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-yellow-600 text-lg mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 mb-1">Importante sobre Retenção</p>
              <p className="text-xs text-yellow-800 leading-relaxed">
                A exclusão automática de backups antigos é baseada na data de criação. Backups manuais não são afetados pela política de retenção e devem ser removidos manualmente se necessário.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

