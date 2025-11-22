import { useState, useEffect } from 'react'
import { FaCog, FaPaperPlane, FaCloud } from 'react-icons/fa'
import api from '../services/api'
import GeralTab from '../components/settings/GeralTab'
import NotificacoesTab from '../components/settings/NotificacoesTab'
import NuvemTab from '../components/settings/NuvemTab'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('geral')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings')
      setSettings(res.data.data)
      setError(null)
    } catch (error) {
      setError('Erro ao carregar configurações')
      setSettings({
        backupBaseDir: '/backups',
        retentionDaily: 7,
        retentionWeekly: 4,
        retentionMonthly: 3,
        timezone: 'UTC',
        telegramEnabled: false
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'geral', label: 'Geral', icon: FaCog },
    { id: 'notificacoes', label: 'Notificações', icon: FaPaperPlane },
    { id: 'nuvem', label: 'Nuvem', icon: FaCloud }
  ]

  return (
    <div className="p-3 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Configurações do Sistema</h2>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          {error}
        </div>
      )}

      {/* Sistema de Abas */}
      <div className="card">
        {/* Navegação das Abas */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
          </div>

        {/* Conteúdo das Abas */}
        <div className="p-6">
          {activeTab === 'geral' && <GeralTab settings={settings} />}
          {activeTab === 'notificacoes' && <NotificacoesTab settings={settings} />}
          {activeTab === 'nuvem' && <NuvemTab />}
        </div>
      </div>
    </div>
  )
}
