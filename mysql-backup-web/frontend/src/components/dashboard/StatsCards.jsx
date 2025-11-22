import { FaDatabase, FaChartLine, FaHdd, FaCalendarAlt } from 'react-icons/fa'

export default function StatsCards({ stats, formatBytes }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center text-white bg-blue-500">
            <FaDatabase className="text-sm sm:text-lg lg:text-xl" />
          </div>
        </div>
        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          {stats?.total || 0}
        </div>
        <div className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">
          Total de Backups
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center text-white bg-green-500">
            <FaChartLine className="text-sm sm:text-lg lg:text-xl" />
          </div>
        </div>
        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          {stats?.successRate || 0}%
        </div>
        <div className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">
          Taxa de Sucesso
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center text-white bg-purple-500">
            <FaHdd className="text-sm sm:text-lg lg:text-xl" />
          </div>
        </div>
        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          {formatBytes(stats?.totalSize || 0)}
        </div>
        <div className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">
          Tamanho Total
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center text-white bg-orange-500">
            <FaCalendarAlt className="text-sm sm:text-lg lg:text-xl" />
          </div>
        </div>
        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          {stats?.activeSchedules || 0}
        </div>
        <div className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">
          Agendamentos Ativos
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {stats?.totalSchedules || 0} total
        </div>
      </div>
    </div>
  )
}

