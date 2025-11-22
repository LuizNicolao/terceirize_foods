import { useState, useEffect } from 'react'
import api from '../services/api'
import { getDatabaseDisplayName } from '../utils/databaseNames'
import StatsCards from '../components/dashboard/StatsCards'
import Charts from '../components/dashboard/Charts'
import DatabasesList from '../components/dashboard/DatabasesList'
import RecentBackupsTable from '../components/dashboard/RecentBackupsTable'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentBackups, setRecentBackups] = useState([])
  const [databases, setDatabases] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState({
    timeline: [],
    byDatabase: [],
    byStatus: [],
    sizeOverTime: [],
    successRateOverTime: []
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [backupsRes, databasesRes, schedulesRes] = await Promise.all([
        api.get('/backups?limit=1000'),
        api.get('/databases'),
        api.get('/schedules')
      ])

      setRecentBackups((backupsRes.data.data || []).slice(0, 10))
      setDatabases(databasesRes.data.data || [])
      setSchedules(schedulesRes.data.data || [])

      const backups = backupsRes.data.data || []
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      const backupsToday = backups.filter(b => {
        const backupDate = new Date(b.created_at)
        return backupDate >= today
      })

      const backupsThisWeek = backups.filter(b => {
        const backupDate = new Date(b.created_at)
        return backupDate >= weekAgo
      })

      const lastBackup = backups
        .filter(b => b.status === 'completed')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

      const successRate = backups.length > 0
        ? Math.round((backups.filter(b => b.status === 'completed').length / backups.length) * 100)
        : 0

      const stats = {
        total: backups.length,
        completed: backups.filter(b => b.status === 'completed').length,
        failed: backups.filter(b => b.status === 'failed').length,
        running: backups.filter(b => b.status === 'running').length,
        totalSize: backups.reduce((sum, b) => sum + (b.file_size || 0), 0),
        today: backupsToday.length,
        thisWeek: backupsThisWeek.length,
        successRate,
        activeSchedules: (schedulesRes.data.data || []).filter(s => s.enabled).length,
        totalSchedules: (schedulesRes.data.data || []).length,
        lastBackup: lastBackup ? new Date(lastBackup.created_at) : null
      }
      setStats(stats)

      prepareChartData(backups)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const prepareChartData = (backups) => {
    const now = new Date()
    
    // Gráfico de timeline (últimos 7 dias)
    const timelineData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayBackups = backups.filter(b => {
        const backupDate = new Date(b.created_at)
        return backupDate >= dayStart && backupDate < dayEnd
      })
      
      timelineData.push({
        date: dateStr,
        total: dayBackups.length,
        completed: dayBackups.filter(b => b.status === 'completed').length,
        failed: dayBackups.filter(b => b.status === 'failed').length
      })
    }

    // Gráfico por banco de dados
    const byDatabase = {}
    backups.forEach(b => {
      const dbName = getDatabaseDisplayName(b.database_name)
      if (!byDatabase[dbName]) {
        byDatabase[dbName] = { name: dbName, total: 0, completed: 0, failed: 0 }
      }
      byDatabase[dbName].total++
      if (b.status === 'completed') byDatabase[dbName].completed++
      if (b.status === 'failed') byDatabase[dbName].failed++
    })
    const byDatabaseArray = Object.values(byDatabase).sort((a, b) => b.total - a.total)

    // Gráfico por status (pizza)
    const statusCounts = {
      completed: backups.filter(b => b.status === 'completed').length,
      failed: backups.filter(b => b.status === 'failed').length,
      running: backups.filter(b => b.status === 'running').length,
      pending: backups.filter(b => b.status === 'pending').length
    }
    const byStatus = [
      { name: 'Concluídos', value: statusCounts.completed, color: '#10b981' },
      { name: 'Falhados', value: statusCounts.failed, color: '#ef4444' },
      { name: 'Em Execução', value: statusCounts.running, color: '#3b82f6' },
      { name: 'Pendentes', value: statusCounts.pending, color: '#6b7280' }
    ].filter(item => item.value > 0)

    // Gráfico de tamanho ao longo do tempo (últimos 7 dias)
    const sizeOverTime = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayBackups = backups.filter(b => {
        const backupDate = new Date(b.created_at)
        return backupDate >= dayStart && backupDate < dayEnd && b.status === 'completed'
      })
      
      const totalSize = dayBackups.reduce((sum, b) => sum + (b.file_size || 0), 0)
      
      sizeOverTime.push({
        date: dateStr,
        tamanho: Math.round(totalSize / 1024 / 1024) // MB
      })
    }

    // Gráfico de taxa de sucesso ao longo do tempo (últimos 7 dias)
    const successRateOverTime = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayBackups = backups.filter(b => {
        const backupDate = new Date(b.created_at)
        return backupDate >= dayStart && backupDate < dayEnd
      })
      
      const rate = dayBackups.length > 0
        ? Math.round((dayBackups.filter(b => b.status === 'completed').length / dayBackups.length) * 100)
        : 0
      
      successRateOverTime.push({
        date: dateStr,
        taxa: rate
      })
    }

    setChartData({
      timeline: timelineData,
      byDatabase: byDatabaseArray,
      byStatus: byStatus,
      sizeOverTime: sizeOverTime,
      successRateOverTime: successRateOverTime
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Dashboard</h2>

      <StatsCards stats={stats} formatBytes={formatBytes} />

      <Charts chartData={chartData} />

      <DatabasesList databases={databases} />

      <RecentBackupsTable recentBackups={recentBackups} />
    </div>
  )
}
