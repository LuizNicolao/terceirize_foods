import { useState, useEffect } from 'react'
import api from '../services/api'
import SchedulesTable from '../components/schedules/SchedulesTable'
import ScheduleForm from '../components/schedules/ScheduleForm'

export default function Schedules() {
  const [schedules, setSchedules] = useState([])
  const [databases, setDatabases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingSchedule, setViewingSchedule] = useState(null)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [formData, setFormData] = useState({
    databaseName: '',
    scheduleType: 'daily',
    cronExpression: '0 2 * * *',
    enabled: true,
    status: 'ativo',
    selectedTables: []
  })
  const [availableTables, setAvailableTables] = useState([])
  const [tableSearchTerm, setTableSearchTerm] = useState('')
  const [cronFields, setCronFields] = useState({
    minute: '0',
    hour: '2',
    day: '*',
    month: '*',
    dayOfWeek: '*'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [schedulesRes, databasesRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/databases')
      ])
      setSchedules(schedulesRes.data.data || [])
      setDatabases(databasesRes.data.data || [])
    } catch (error) {
      // Ignorar erro
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        selectedTables: formData.selectedTables && formData.selectedTables.length > 0 ? formData.selectedTables : null
      }
      
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule.id}`, payload)
      } else {
        await api.post('/schedules', payload)
      }
      setShowModal(false)
      setEditingSchedule(null)
      resetForm()
      loadData()
    } catch (error) {
      alert(`Erro ao ${editingSchedule ? 'atualizar' : 'criar'} agendamento: ` + (error.response?.data?.message || error.message))
    }
  }

  const resetForm = () => {
    setFormData({
      databaseName: '',
      scheduleType: 'daily',
      cronExpression: '0 2 * * *',
      enabled: true,
      status: 'ativo',
      selectedTables: []
    })
    setAvailableTables([])
    setTableSearchTerm('')
    setCronFields({
      minute: '0',
      hour: '2',
      day: '*',
      month: '*',
      dayOfWeek: '*'
    })
  }

  const handleView = async (schedule) => {
    setViewingSchedule(schedule)
    const fields = expressionToCronFields(schedule.cron_expression)
    setCronFields(fields)
    
    let selectedTables = []
    if (schedule.selected_tables) {
      try {
        selectedTables = JSON.parse(schedule.selected_tables)
        if (!Array.isArray(selectedTables)) selectedTables = []
      } catch (e) {
        selectedTables = []
      }
    }
    
    setFormData({
      databaseName: schedule.database_name,
      scheduleType: schedule.schedule_type,
      cronExpression: schedule.cron_expression,
      enabled: schedule.enabled,
      status: schedule.status || 'ativo',
      selectedTables: selectedTables
    })
    
    try {
      const tablesRes = await api.get(`/databases/${schedule.database_name}/tables`)
      setAvailableTables(tablesRes.data.data || [])
    } catch (error) {
      setAvailableTables([])
    }
    
    setShowViewModal(true)
  }

  const handleEdit = async (schedule) => {
    setEditingSchedule(schedule)
    const fields = expressionToCronFields(schedule.cron_expression)
    setCronFields(fields)
    
    let selectedTables = []
    if (schedule.selected_tables) {
      try {
        selectedTables = JSON.parse(schedule.selected_tables)
        if (!Array.isArray(selectedTables)) selectedTables = []
      } catch (e) {
        selectedTables = []
      }
    }
    
    setFormData({
      databaseName: schedule.database_name,
      scheduleType: schedule.schedule_type,
      cronExpression: schedule.cron_expression,
      enabled: schedule.enabled,
      status: schedule.status || 'ativo',
      selectedTables: selectedTables
    })
    
    try {
      const tablesRes = await api.get(`/databases/${schedule.database_name}/tables`)
      setAvailableTables(tablesRes.data.data || [])
    } catch (error) {
      setAvailableTables([])
    }
    
    setShowModal(true)
  }
  
  const handleDatabaseChange = async (databaseName) => {
    setFormData({ ...formData, databaseName, selectedTables: [] })
    setAvailableTables([])
    setTableSearchTerm('')
    
    if (databaseName) {
      try {
        const tablesRes = await api.get(`/databases/${databaseName}/tables`)
        setAvailableTables(tablesRes.data.data || [])
      } catch (error) {
        setAvailableTables([])
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSchedule(null)
    resetForm()
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setViewingSchedule(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este agendamento?')) {
      return
    }
    
    try {
      await api.delete(`/schedules/${id}`)
      loadData()
    } catch (error) {
      alert('Erro ao deletar: ' + error.message)
    }
  }

  const getCronPresets = (type) => {
    const presets = {
      daily: { minute: '0', hour: '2', day: '*', month: '*', dayOfWeek: '*' },
      weekly: { minute: '0', hour: '2', day: '*', month: '*', dayOfWeek: '0' },
      monthly: { minute: '0', hour: '2', day: '1', month: '*', dayOfWeek: '*' }
    }
    return presets[type] || presets.daily
  }

  const cronFieldsToExpression = (fields) => {
    return `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.dayOfWeek}`
  }

  const expressionToCronFields = (expression) => {
    const parts = expression.trim().split(/\s+/)
    if (parts.length === 5) {
      return {
        minute: parts[0],
        hour: parts[1],
        day: parts[2],
        month: parts[3],
        dayOfWeek: parts[4]
      }
    }
    return { minute: '0', hour: '2', day: '*', month: '*', dayOfWeek: '*' }
  }

  const getCronShortDescription = (expression) => {
    const fields = expressionToCronFields(expression)
    
    if (fields.minute === '0' && fields.hour !== '*' && fields.day === '*' && fields.month === '*' && fields.dayOfWeek === '*') {
      return `Diariamente às ${fields.hour}h`
    }
    
    if (fields.minute === '0' && fields.hour !== '*' && fields.day === '*' && fields.month === '*' && fields.dayOfWeek !== '*') {
      const days = { '0': 'Domingo', '1': 'Segunda', '2': 'Terça', '3': 'Quarta', '4': 'Quinta', '5': 'Sexta', '6': 'Sábado' }
      if (fields.dayOfWeek in days) {
        return `Toda ${days[fields.dayOfWeek]} às ${fields.hour}h`
      }
    }
    
    if (fields.minute === '0' && fields.hour !== '*' && fields.day !== '*' && fields.month === '*' && fields.dayOfWeek === '*') {
      return `Dia ${fields.day} de cada mês às ${fields.hour}h`
    }
    
    let time = ''
    if (fields.hour !== '*') {
      time = `${fields.hour}:${fields.minute.padStart(2, '0')}`
    } else if (fields.minute !== '*') {
      time = `minuto ${fields.minute}`
    }
    
    if (time) {
      return `Às ${time}`
    }
    
    return expression
  }

  const getCronDescription = (expression) => {
    const fields = expressionToCronFields(expression)
    let desc = 'Executar '

    if (fields.minute === '*') {
      desc += 'a cada minuto '
    } else if (fields.minute.includes('/')) {
      const [_, interval] = fields.minute.split('/')
      desc += `a cada ${interval} minuto(s) `
    } else if (fields.minute.includes(',')) {
      desc += `nos minutos ${fields.minute} `
    } else if (fields.minute === '0') {
      desc += 'no início da hora '
    } else {
      desc += `no minuto ${fields.minute} `
    }

    if (fields.hour === '*') {
      desc += 'de cada hora '
    } else if (fields.hour.includes('/')) {
      const [_, interval] = fields.hour.split('/')
      desc += `a cada ${interval} hora(s) `
    } else if (fields.hour.includes(',')) {
      desc += `às ${fields.hour} horas `
    } else {
      desc += `às ${fields.hour}h `
    }

    if (fields.day === '*') {
      desc += 'de cada dia '
    } else if (fields.day.includes('/')) {
      const [_, interval] = fields.day.split('/')
      desc += `a cada ${interval} dia(s) `
    } else if (fields.day.includes(',')) {
      desc += `nos dias ${fields.day} `
    } else if (fields.day.includes('-')) {
      const [start, end] = fields.day.split('-')
      desc += `do dia ${start} ao ${end} `
    } else {
      desc += `no dia ${fields.day} `
    }

    if (fields.month === '*') {
      // não adiciona nada
    } else if (fields.month.includes(',')) {
      desc += `dos meses ${fields.month} `
    } else if (fields.month.includes('-')) {
      const [start, end] = fields.month.split('-')
      desc += `dos meses ${start} a ${end} `
    } else {
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
      const monthNum = parseInt(fields.month) - 1
      if (monthNum >= 0 && monthNum < 12) {
        desc += `de ${months[monthNum]} `
      } else {
        desc += `do mês ${fields.month} `
      }
    }

    if (fields.dayOfWeek !== '*') {
      const days = { '0': 'domingo', '1': 'segunda', '2': 'terça', '3': 'quarta', '4': 'quinta', '5': 'sexta', '6': 'sábado' }
      if (fields.dayOfWeek.includes(',')) {
        const dayNames = fields.dayOfWeek.split(',').map(d => days[d.trim()] || d).join(', ')
        desc += `nos dias ${dayNames} `
      } else if (fields.dayOfWeek in days) {
        desc += `às ${days[fields.dayOfWeek]}s `
      }
    }

    return desc.trim()
  }

  useEffect(() => {
    const preset = getCronPresets(formData.scheduleType)
    setCronFields(preset)
    setFormData(prev => ({
      ...prev,
      cronExpression: cronFieldsToExpression(preset)
    }))
  }, [formData.scheduleType])

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      cronExpression: cronFieldsToExpression(cronFields)
    }))
  }, [cronFields])

  return (
    <div className="p-3 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agendamentos</h2>
        <button
          onClick={() => {
            resetForm()
            setEditingSchedule(null)
            setShowModal(true)
          }}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          + Novo Agendamento
        </button>
      </div>

      <SchedulesTable
        schedules={schedules}
        loading={loading}
        getCronShortDescription={getCronShortDescription}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ScheduleForm
        isOpen={showModal}
        editingSchedule={editingSchedule}
        databases={databases}
        formData={formData}
        cronFields={cronFields}
        availableTables={availableTables}
        tableSearchTerm={tableSearchTerm}
        getCronDescription={getCronDescription}
        expressionToCronFields={expressionToCronFields}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
        onCronFieldsChange={setCronFields}
        onTableSearchTermChange={setTableSearchTerm}
        onDatabaseChange={handleDatabaseChange}
      />

      <ScheduleForm
        isOpen={showViewModal}
        editingSchedule={viewingSchedule}
        databases={databases}
        formData={formData}
        cronFields={cronFields}
        availableTables={availableTables}
        tableSearchTerm={tableSearchTerm}
        getCronDescription={getCronDescription}
        expressionToCronFields={expressionToCronFields}
        onClose={handleCloseViewModal}
        onSubmit={() => {}}
        onFormDataChange={setFormData}
        onCronFieldsChange={setCronFields}
        onTableSearchTermChange={setTableSearchTerm}
        onDatabaseChange={() => {}}
        readOnly={true}
      />
    </div>
  )
}
