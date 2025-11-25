import { useState, useEffect } from 'react'
import api from '../services/api'
import { ConfirmModal } from '../components/ui'
import ModalProgressoRestore from '../components/ui/ModalProgressoRestore'
import toast from 'react-hot-toast'
import { getDatabaseDisplayName } from '../utils/databaseNames'
import BackupsFilters from '../components/backups/BackupsFilters'
import BackupsTable from '../components/backups/BackupsTable'
import RestoreModal from '../components/backups/RestoreModal'
import BackupModal from '../components/backups/BackupModal'

export default function Backups() {
  const [backups, setBackups] = useState([])
  const [databases, setDatabases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDatabase, setSelectedDatabase] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [runningBackups, setRunningBackups] = useState(new Map())
  
  // Estado para modal de confirmação
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, config: null })
  
  // Estado para modal de seleção de tabelas (restore)
  const [restoreTableModal, setRestoreTableModal] = useState({ 
    isOpen: false, 
    backup: null, 
    tables: [], 
    selectedTables: []
  })
  
  // Estado para modal de seleção de tabelas (backup)
  const [backupTableModal, setBackupTableModal] = useState({ 
    isOpen: false, 
    databaseName: null, 
    tables: [], 
    selectedTables: []
  })
  
  // Estado para modal de progresso do restore
  const [restoreProgress, setRestoreProgress] = useState({
    isOpen: false,
    backupId: null,
    databaseName: '',
    progress: 0,
    total: 100,
    elapsedTime: 0,
    fileSize: 0,
    selectedTables: []
  })

  useEffect(() => {
    loadDatabases()
    loadBackups()
  }, [])

  // Monitorar backups em execução
  useEffect(() => {
    const running = backups.filter(b => b.status === 'running')
    
    if (running.length === 0) {
      setRunningBackups(new Map())
      return
    }

    const interval = setInterval(async () => {
      for (const backup of running) {
        try {
          const res = await api.get(`/backups/${backup.id}/status`)
          const status = res.data.data
          
          if (status && status.running) {
            setRunningBackups(prev => {
              const newMap = new Map(prev)
              newMap.set(backup.id, status)
              return newMap
            })
          } else {
            loadBackups()
            setRunningBackups(prev => {
              const newMap = new Map(prev)
              newMap.delete(backup.id)
              return newMap
            })
          }
        } catch (error) {
          // Ignorar erros
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [backups])

  // Monitorar restore em execução
  useEffect(() => {
    if (!restoreProgress.isOpen || !restoreProgress.backupId) {
      return
    }

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/backups/${restoreProgress.backupId}/restore/status`)
        const status = res.data.data
        
        if (status && status.running) {
          setRestoreProgress(prev => ({
            ...prev,
            progress: status.progress || 0,
            elapsedTime: status.elapsed || 0,
            fileSize: status.currentSize || 0
          }))
        } else {
          setRestoreProgress(prev => ({
            ...prev,
            isOpen: false,
            progress: 100
          }))
          
          toast.success('Restore concluído com sucesso!')
          loadBackups()
          clearInterval(interval)
        }
      } catch (error) {
        setRestoreProgress(prev => ({
          ...prev,
          isOpen: false
        }))
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [restoreProgress.isOpen, restoreProgress.backupId])

  const loadDatabases = async () => {
    try {
      const res = await api.get('/databases')
      setDatabases(res.data.data || [])
    } catch (error) {
      // Ignorar erro
    }
  }

  const loadBackups = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedDatabase) params.database = selectedDatabase
      if (selectedType) params.type = selectedType
      
      const res = await api.get('/backups', { params })
      
      if (res.data && res.data.success && res.data.data) {
        setBackups(res.data.data)
      } else {
        setBackups([])
      }
    } catch (error) {
      setBackups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBackups()
  }, [selectedDatabase, selectedType])

  const handleCreateBackup = async (databaseName) => {
    try {
      const tablesRes = await api.get(`/databases/${databaseName}/tables`)
      const tables = tablesRes.data.data || []
      
      setBackupTableModal({
        isOpen: true,
        databaseName: databaseName,
        tables: tables,
        selectedTables: []
      })
    } catch (error) {
      toast.error('Erro ao carregar tabelas: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleConfirmBackup = async (selectedTables) => {
    const { databaseName } = backupTableModal
    
    if (!databaseName) return
    
    setBackupTableModal({ isOpen: false, databaseName: null, tables: [], selectedTables: [] })
    
    try {
      const payload = {
        databaseName,
        backupType: 'manual'
      }
      
      if (selectedTables && selectedTables.length > 0) {
        payload.selectedTables = selectedTables
      }
      
      await api.post('/backups', payload)
      
      const message = selectedTables && selectedTables.length > 0
        ? `Backup de ${selectedTables.length} tabela(s) iniciado!`
        : 'Backup completo iniciado!'
      
      toast.success(message)
      
      setTimeout(() => {
        loadBackups()
      }, 1000)
      
      const checkInterval = setInterval(() => {
        loadBackups()
        const runningBackupsList = backups.filter(b => b.status === 'running')
        if (runningBackupsList.length === 0) {
          clearInterval(checkInterval)
        }
      }, 2000)
      
      setTimeout(() => clearInterval(checkInterval), 60000)
    } catch (error) {
      toast.error('Erro ao criar backup: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDownload = async (backupId) => {
    try {
      const backup = backups.find(b => b.id === backupId)
      if (!backup) {
        toast.error('Backup não encontrado')
        return
      }

      const response = await api.get(`/backups/${backupId}/download`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      
      const contentDisposition = response.headers['content-disposition']
      let fileName = backup.file_path ? backup.file_path.split('/').pop() : `backup_${backupId}.sql.gz`
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (fileNameMatch) {
          fileName = fileNameMatch[1]
        }
      }
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Download iniciado com sucesso!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao fazer download do backup')
    }
  }

  const handleRestore = async (backupId) => {
    const backup = backups.find(b => b.id === backupId)
    if (!backup) {
      toast.error('Backup não encontrado')
      return
    }

    try {
      const tablesRes = await api.get(`/databases/${backup.database_name}/tables`)
      const tables = tablesRes.data.data || []
      
      setRestoreTableModal({
        isOpen: true,
        backup: backup,
        tables: tables,
        selectedTables: []
      })
    } catch (error) {
      toast.error('Erro ao carregar tabelas: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleConfirmRestore = async (selectedTables) => {
    const { backup, tables } = restoreTableModal
    
    if (!backup) return
    
    setRestoreTableModal({ isOpen: false, backup: null, tables: [], selectedTables: [] })
    
    const restoreAll = selectedTables.length > 0 && selectedTables.length === tables.length
    
    setTimeout(() => {
      setConfirmModal({
        isOpen: true,
        config: {
          title: '⚠️ Confirmar Restauração',
          message: restoreAll
            ? `Tem certeza que deseja restaurar o banco ${getDatabaseDisplayName(backup.database_name)} COMPLETO?\n\n⚠️ ATENÇÃO: Esta ação irá SOBRESCREVER COMPLETAMENTE todos os dados atuais do banco!\n\nTodos os dados atuais serão perdidos e substituídos pelos dados do backup.`
            : `Tem certeza que deseja restaurar ${selectedTables.length} tabela(s) do banco ${getDatabaseDisplayName(backup.database_name)}?\n\n⚠️ ATENÇÃO: As tabelas selecionadas serão SOBRESCRITAS!\n\nTabelas selecionadas: ${selectedTables.join(', ')}`,
          confirmText: 'Restaurar',
          cancelText: 'Cancelar',
          type: 'warning',
          onConfirm: async () => {
            try {
              const payload = restoreAll ? {} : { tables: selectedTables }
              await api.post(`/backups/${backup.id}/restore`, payload)
              
              setRestoreProgress({
                isOpen: true,
                backupId: backup.id,
                databaseName: getDatabaseDisplayName(backup.database_name),
                progress: 0,
                total: 100,
                elapsedTime: 0,
                fileSize: 0,
                selectedTables: selectedTables
              })
              
              toast.success(restoreAll 
                ? 'Restore completo iniciado!' 
                : `Restore de ${selectedTables.length} tabela(s) iniciado!`)
            } catch (error) {
              toast.error('Erro ao restaurar: ' + (error.response?.data?.message || error.message))
            }
          }
        }
      })
    }, 100)
  }

  const handleDelete = async (backupId) => {
    setConfirmModal({
      isOpen: true,
      config: {
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja deletar este backup?',
        confirmText: 'Deletar',
        cancelText: 'Cancelar',
        type: 'danger',
        onConfirm: async () => {
          try {
            await api.delete(`/backups/${backupId}`)
            toast.success('Backup deletado com sucesso!')
            loadBackups()
          } catch (error) {
            toast.error('Erro ao deletar: ' + (error.response?.data?.message || error.message))
          }
        }
      }
    })
  }

  const handleCancel = async (backupId) => {
    setConfirmModal({
      isOpen: true,
      config: {
        title: 'Confirmar Cancelamento',
        message: 'Tem certeza que deseja cancelar este backup?',
        confirmText: 'Cancelar Backup',
        cancelText: 'Voltar',
        type: 'warning',
        onConfirm: async () => {
          try {
            const res = await api.post(`/backups/${backupId}/cancel`)
            if (res.data.success) {
              toast.success('Backup cancelado com sucesso!')
              loadBackups()
            } else {
              toast.error('Erro ao cancelar: ' + (res.data.message || 'Erro desconhecido'))
            }
          } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro ao cancelar backup'
            toast.error('Erro ao cancelar: ' + errorMessage)
            loadBackups()
          }
        }
      }
    })
  }

  const formatElapsedTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Backups</h2>
      </div>

      <BackupsFilters
        databases={databases}
        selectedDatabase={selectedDatabase}
        selectedType={selectedType}
        onDatabaseChange={setSelectedDatabase}
        onTypeChange={setSelectedType}
      />

      {/* Botões de Backup Manual */}
      <div className="card mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="font-semibold text-sm sm:text-base">Criar Backup Manual</h3>
          </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {databases.map(db => (
            <button
              key={db}
              onClick={() => handleCreateBackup(db)}
                className="px-4 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              Backup {getDatabaseDisplayName(db)}
            </button>
          ))}
          </div>
        </div>
      </div>

      <BackupsTable
        backups={backups}
        loading={loading}
        runningBackups={runningBackups}
        formatElapsedTime={formatElapsedTime}
        onCancel={handleCancel}
        onDownload={handleDownload}
        onRestore={handleRestore}
        onDelete={handleDelete}
                      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, config: null })}
        onConfirm={confirmModal.config?.onConfirm || (() => {})}
        title={confirmModal.config?.title || 'Confirmar ação'}
        message={confirmModal.config?.message || 'Tem certeza que deseja realizar esta ação?'}
        confirmText={confirmModal.config?.confirmText || 'Confirmar'}
        cancelText={confirmModal.config?.cancelText || 'Cancelar'}
        type={confirmModal.config?.type || 'danger'}
      />

      <RestoreModal
        isOpen={restoreTableModal.isOpen}
        backup={restoreTableModal.backup}
        tables={restoreTableModal.tables}
        selectedTables={restoreTableModal.selectedTables}
        onClose={() => setRestoreTableModal({ isOpen: false, backup: null, tables: [], selectedTables: [] })}
        onConfirm={handleConfirmRestore}
      />

      <BackupModal
        isOpen={backupTableModal.isOpen}
        databaseName={backupTableModal.databaseName}
        tables={backupTableModal.tables}
        selectedTables={backupTableModal.selectedTables}
        onClose={() => setBackupTableModal({ isOpen: false, databaseName: null, tables: [], selectedTables: [] })}
        onConfirm={handleConfirmBackup}
      />

      <ModalProgressoRestore
        isOpen={restoreProgress.isOpen}
        title="Restaurando Backup"
        progresso={restoreProgress.progress}
        total={restoreProgress.total}
        mensagem={
          restoreProgress.selectedTables.length > 0
            ? `Restaurando ${restoreProgress.selectedTables.length} tabela(s)...`
            : 'Restaurando banco completo...'
        }
        databaseName={restoreProgress.databaseName}
        elapsedTime={restoreProgress.elapsedTime}
        fileSize={restoreProgress.fileSize}
      />
    </div>
  )
}
