import { useState, useEffect } from 'react'
import { Modal, Button } from '../ui'
import { getDatabaseDisplayName } from '../../utils/databaseNames'

export default function BackupModal({ 
  isOpen, 
  databaseName, 
  tables, 
  selectedTables: initialSelectedTables, 
  onClose, 
  onConfirm 
}) {
  const [tableSearchTerm, setTableSearchTerm] = useState('')
  const [localSelectedTables, setLocalSelectedTables] = useState([])

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedTables(initialSelectedTables || [])
      setTableSearchTerm('')
    }
  }, [isOpen, initialSelectedTables])

  const handleClose = () => {
    setTableSearchTerm('')
    setLocalSelectedTables([])
    onClose()
  }

  const handleSelectAll = () => {
    const filteredTables = tables.filter(table =>
      table.toLowerCase().includes(tableSearchTerm.toLowerCase())
    )
    setLocalSelectedTables([...new Set([...localSelectedTables, ...filteredTables])])
  }

  const handleDeselectAll = () => {
    const filteredTables = tables.filter(table =>
      table.toLowerCase().includes(tableSearchTerm.toLowerCase())
    )
    setLocalSelectedTables(localSelectedTables.filter(t => !filteredTables.includes(t)))
  }

  const handleToggleTable = (table) => {
    if (localSelectedTables.includes(table)) {
      setLocalSelectedTables(localSelectedTables.filter(t => t !== table))
    } else {
      setLocalSelectedTables([...localSelectedTables, table])
    }
  }

  const filteredTables = tables.filter(table =>
    table.toLowerCase().includes(tableSearchTerm.toLowerCase())
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Fazer Backup Manual - ${databaseName ? getDatabaseDisplayName(databaseName) : ''}`}
      size="lg"
    >
      {databaseName && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Banco: <strong>{getDatabaseDisplayName(databaseName)}</strong>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Selecione as tabelas que deseja fazer backup. Deixe vazio para fazer backup completo do banco.
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Tabelas ({localSelectedTables.length} selecionada(s))
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs px-2 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                >
                  Selecionar Todas
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                >
                  Desmarcar Todas
                </button>
              </div>
            </div>

            <div className="mb-3">
              <input
                type="text"
                placeholder="Buscar tabelas..."
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
              {tables.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Carregando tabelas...
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Nenhuma tabela encontrada para "{tableSearchTerm}"
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredTables.map((table) => (
                    <label
                      key={table}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={localSelectedTables.includes(table)}
                        onChange={() => handleToggleTable(table)}
                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{table}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => onConfirm(localSelectedTables)}
              disabled={tables.length > 0 && localSelectedTables.length === 0}
            >
              {tables.length > 0 && localSelectedTables.length === 0
                ? 'Selecione as Tabelas'
                : `Fazer Backup ${localSelectedTables.length > 0 ? `de ${localSelectedTables.length} Tabela(s)` : 'Completo'}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

