import { useState, useEffect } from 'react'
import { FaPlus, FaTimes, FaSpinner } from 'react-icons/fa'
import api from '../../../services/api'

export default function RcloneConfigForm({ onSuccess, onCancel }) {
  const [remoteTypes, setRemoteTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    credentials: {}
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRemoteTypes()
  }, [])

  const loadRemoteTypes = async () => {
    try {
      const res = await api.get('/rclone/types')
      setRemoteTypes(res.data.types || [])
    } catch (error) {
      setError('Erro ao carregar tipos de remoto')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (typeId) => {
    const selectedType = remoteTypes.find(t => t.id === typeId)
    setFormData({
      ...formData,
      type: typeId,
      credentials: {}
    })
  }

  const handleCredentialChange = (fieldName, value) => {
    setFormData({
      ...formData,
      credentials: {
        ...formData.credentials,
        [fieldName]: value
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      await api.post('/rclone/create', formData)
      if (onSuccess) onSuccess()
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao criar remoto')
    } finally {
      setSaving(false)
    }
  }

  const selectedType = remoteTypes.find(t => t.id === formData.type)

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <FaSpinner className="animate-spin text-green-600 text-2xl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Nome do Remoto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Remoto *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="ex: gdrive, s3-backup, dropbox"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Nome único para identificar este remoto</p>
      </div>

      {/* Tipo de Remoto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Serviço *
        </label>
        <select
          value={formData.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        >
          <option value="">Selecione um tipo...</option>
          {remoteTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} - {type.description}
            </option>
          ))}
        </select>
      </div>

      {/* Campos de Credenciais */}
      {selectedType && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Credenciais - {selectedType.name}
          </h4>
          <div className="space-y-3">
            {selectedType.fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData.credentials[field.name] || ''}
                    onChange={(e) => handleCredentialChange(field.name, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                    required={field.required}
                    placeholder={field.placeholder || ''}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={formData.credentials[field.name] || field.default || ''}
                    onChange={(e) => handleCredentialChange(field.name, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required={field.required}
                    placeholder={field.placeholder || ''}
                  />
                )}
                {field.description && (
                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !formData.name || !formData.type}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <FaSpinner className="animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <FaPlus />
              Criar Remoto
            </>
          )}
        </button>
      </div>
    </form>
  )
}

