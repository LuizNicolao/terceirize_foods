import { ActionButtons } from '../ui'
import { getDatabaseDisplayName } from '../../utils/databaseNames'

export default function SchedulesTable({ 
  schedules, 
  loading, 
  getCronShortDescription,
  onView,
  onEdit,
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Banco</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Horário</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {schedules.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                Nenhum agendamento configurado
              </td>
            </tr>
          ) : (
            schedules.map(schedule => (
              <tr key={schedule.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getDatabaseDisplayName(schedule.database_name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {schedule.schedule_type === 'daily' ? 'Diário' : 
                   schedule.schedule_type === 'weekly' ? 'Semanal' : 
                   schedule.schedule_type === 'monthly' ? 'Mensal' : 
                   schedule.schedule_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span>{getCronShortDescription(schedule.cron_expression)}</span>
                    <span className="text-xs text-gray-400 font-mono mt-0.5">{schedule.cron_expression}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                    schedule.status === 'ativo' ? 'bg-green-100 text-green-800' :
                    schedule.status === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                    schedule.status === 'manutencao' ? 'bg-orange-100 text-orange-800' :
                    schedule.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.status || (schedule.enabled ? 'ativo' : 'inativo')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <ActionButtons
                    canView={true}
                    canEdit={true}
                    canDelete={true}
                    onView={() => onView(schedule)}
                    onEdit={() => onEdit(schedule)}
                    onDelete={() => onDelete(schedule.id)}
                    item={schedule}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

