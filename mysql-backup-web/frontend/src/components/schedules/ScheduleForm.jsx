import { useState, useEffect } from 'react'
import { Modal } from '../ui'
import { getDatabaseDisplayName } from '../../utils/databaseNames'

export default function ScheduleForm({
  isOpen,
  editingSchedule,
  databases,
  formData,
  cronFields,
  availableTables,
  tableSearchTerm,
  getCronDescription,
  expressionToCronFields,
  onClose,
  onSubmit,
  onFormDataChange,
  onCronFieldsChange,
  onTableSearchTermChange,
  onDatabaseChange,
  readOnly = false
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!readOnly) {
      onSubmit()
    }
  }

  const filteredTables = availableTables.filter(table =>
    table.toLowerCase().includes(tableSearchTerm.toLowerCase())
  )

  const getTitle = () => {
    if (readOnly) return "Detalhes do Agendamento"
    return editingSchedule ? "Editar Agendamento" : "Novo Agendamento"
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção: Informações Básicas */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco de Dados
              </label>
              <select
                value={formData.databaseName}
                onChange={(e) => onDatabaseChange(e.target.value)}
                disabled={readOnly}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                required={!readOnly}
              >
                <option value="">Selecione...</option>
                {databases.map(db => (
                  <option key={db} value={db}>{getDatabaseDisplayName(db)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Agendamento
              </label>
              <select
                value={formData.scheduleType}
                onChange={(e) => onFormDataChange({ ...formData, scheduleType: e.target.value })}
                disabled={readOnly}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                required={!readOnly}
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção: Configuração de Horário */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Configuração de Horário</h3>
          
          {/* Campos da expressão Cron */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Minuto</label>
              <input
                type="text"
                value={cronFields.minute}
                onChange={(e) => onCronFieldsChange({ ...cronFields, minute: e.target.value })}
                disabled={readOnly}
                className={`w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-0.5">0-59</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hora</label>
              <input
                type="text"
                value={cronFields.hour}
                onChange={(e) => onCronFieldsChange({ ...cronFields, hour: e.target.value })}
                disabled={readOnly}
                className={`w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="2"
              />
              <p className="text-xs text-gray-400 mt-0.5">0-23</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dia</label>
              <input
                type="text"
                value={cronFields.day}
                onChange={(e) => onCronFieldsChange({ ...cronFields, day: e.target.value })}
                disabled={readOnly}
                className={`w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="*"
              />
              <p className="text-xs text-gray-400 mt-0.5">1-31</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mês</label>
              <input
                type="text"
                value={cronFields.month}
                onChange={(e) => onCronFieldsChange({ ...cronFields, month: e.target.value })}
                disabled={readOnly}
                className={`w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="*"
              />
              <p className="text-xs text-gray-400 mt-0.5">1-12</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dia Sem.</label>
              <input
                type="text"
                value={cronFields.dayOfWeek}
                onChange={(e) => onCronFieldsChange({ ...cronFields, dayOfWeek: e.target.value })}
                disabled={readOnly}
                className={`w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="*"
              />
              <p className="text-xs text-gray-400 mt-0.5">0-6 (0=Dom)</p>
            </div>
          </div>

          {/* Expressão Cron gerada */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Expressão Cron</label>
            <input
              type="text"
              value={formData.cronExpression}
              onChange={(e) => {
                if (!readOnly) {
                  const fields = expressionToCronFields(e.target.value)
                  onCronFieldsChange(fields)
                  onFormDataChange({ ...formData, cronExpression: e.target.value })
                }
              }}
              disabled={readOnly}
              className={`w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'cursor-not-allowed' : 'focus:bg-white'}`}
              readOnly={readOnly}
            />
          </div>

          {/* Descrição em linguagem natural */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-blue-900 mb-1">📅 Quando será executado:</p>
            <p className="text-sm text-blue-800">
              {getCronDescription(formData.cronExpression)}
            </p>
          </div>

          {/* Ajuda rápida */}
          <details className="mt-2">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              ℹ️ Como usar expressões Cron
            </summary>
            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded space-y-1">
              <p><strong>*</strong> = qualquer valor</p>
              <p><strong>,</strong> = lista (ex: 1,3,5)</p>
              <p><strong>-</strong> = intervalo (ex: 1-5)</p>
              <p><strong>/</strong> = passo (ex: */2 = a cada 2)</p>
              <p><strong>Dia da semana:</strong> 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb</p>
            </div>
          </details>
        </div>
        
        {/* Seção: Seleção de Tabelas */}
        {formData.databaseName && (
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Tabelas para Backup</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Selecione as tabelas que deseja fazer backup. Deixe vazio para backup completo do banco.
                </p>
              </div>
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {formData.selectedTables.length} selecionada(s)
              </span>
            </div>
            
            {/* Campo de busca */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Buscar tabelas..."
                value={tableSearchTerm}
                onChange={(e) => onTableSearchTermChange(e.target.value)}
                disabled={readOnly}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              />
            </div>
            
            {!readOnly && (
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    const filtered = filteredTables
                    onFormDataChange({
                      ...formData,
                      selectedTables: [...new Set([...formData.selectedTables, ...filtered])]
                    })
                  }}
                  className="text-xs px-2 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                >
                  Selecionar Todas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const filtered = filteredTables
                    onFormDataChange({
                      ...formData,
                      selectedTables: formData.selectedTables.filter(t => !filtered.includes(t))
                    })
                  }}
                  className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                >
                  Desmarcar Todas
                </button>
                <button
                  type="button"
                  onClick={() => onFormDataChange({ ...formData, selectedTables: [] })}
                  className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                >
                  Limpar Seleção
                </button>
              </div>
            )}
            
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {availableTables.length === 0 ? (
                <div className="p-3 text-center text-gray-500 text-sm">
                  Carregando tabelas...
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="p-3 text-center text-gray-500 text-sm">
                  Nenhuma tabela encontrada
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredTables.map((table) => (
                    <label
                      key={table}
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedTables.includes(table)}
                        onChange={(e) => {
                          if (!readOnly) {
                            if (e.target.checked) {
                              onFormDataChange({
                                ...formData,
                                selectedTables: [...formData.selectedTables, table]
                              })
                            } else {
                              onFormDataChange({
                                ...formData,
                                selectedTables: formData.selectedTables.filter(t => t !== table)
                              })
                            }
                          }
                        }}
                        disabled={readOnly}
                        className={`mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${readOnly ? 'cursor-not-allowed' : ''}`}
                      />
                      <span className="text-sm text-gray-700">{table}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {formData.selectedTables.length === 0 && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-800">
                  ℹ️ Nenhuma tabela selecionada = backup completo do banco
                </p>
              </div>
            )}
            
            {formData.selectedTables.length > 0 && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2">
                <p className="text-xs text-green-800">
                  ✅ {formData.selectedTables.length} tabela(s) selecionada(s): {formData.selectedTables.slice(0, 3).join(', ')}{formData.selectedTables.length > 3 ? '...' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Seção: Status */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Status</h3>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status do Agendamento
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                if (!readOnly) {
                  const newStatus = e.target.value
                  onFormDataChange({ 
                    ...formData, 
                    status: newStatus,
                    enabled: newStatus === 'ativo'
                  })
                }
              }}
              disabled={readOnly}
              className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              required={!readOnly}
            >
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="manutencao">Manutenção</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            {readOnly ? 'Fechar' : 'Cancelar'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {editingSchedule ? 'Salvar Alterações' : 'Criar'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

