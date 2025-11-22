import { useState, useEffect } from 'react'
import { Modal, Button } from '../ui'
import { getDatabaseDisplayName } from '../../utils/databaseNames'

export default function RestoreModal({ 
  isOpen, 
  backup, 
  tables, 
  selectedTables, 
  onClose, 
  onConfirm 
}) {
  const [tableSearchTerm, setTableSearchTerm] = useState('')
  const [localSelectedTables, setLocalSelectedTables] = useState([])

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedTables(selectedTables || [])
      setTableSearchTerm('')
    }
  }, [isOpen, selectedTables])

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

  const allSelected = localSelectedTables.length > 0 && localSelectedTables.length === tables.length
  const someSelected = localSelectedTables.length > 0 && localSelectedTables.length < tables.length

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Selecionar Tabelas para Restaurar"
      size="lg"
    >
      {backup && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Banco: <strong>{getDatabaseDisplayName(backup.database_name)}</strong>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Selecione as tabelas que deseja restaurar. Deixe vazio para restaurar o banco completo.
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

          {localSelectedTables.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                ⚠️ Selecione as tabelas que deseja restaurar. Para restaurar o banco completo, selecione todas as tabelas.
              </p>
            </div>
          )}

          {someSelected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                ℹ️ Apenas as tabelas selecionadas serão restauradas. As outras tabelas não serão afetadas.
              </p>
            </div>
          )}

          {allSelected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-green-800">
                ✅ Todas as tabelas selecionadas. Isso restaurará o <strong>banco completo</strong>, sobrescrevendo todos os dados.
              </p>
            </div>
          )}

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
              disabled={localSelectedTables.length === 0 && tables.length > 0}
            >
              {localSelectedTables.length === 0 && tables.length > 0
                ? 'Selecione as Tabelas'
                : allSelected
                  ? 'Restaurar Banco Completo'
                  : localSelectedTables.length > 0
                    ? `Restaurar ${localSelectedTables.length} Tabela(s)`
                    : 'Restaurar Banco Completo'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

