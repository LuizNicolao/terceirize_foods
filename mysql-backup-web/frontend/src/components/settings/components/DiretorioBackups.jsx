import { FaFolder, FaExclamationTriangle } from 'react-icons/fa'

export default function DiretorioBackups({ backupBaseDir }) {
  return (
    <div className="card">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FaFolder className="text-green-600 text-lg" />
          <label className="text-lg font-semibold text-gray-900">
            Diretório de Backups
          </label>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-gray-900 font-mono text-sm mb-3">
            {backupBaseDir || '/backups'}
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="mb-2">
              Este é o diretório onde todos os arquivos de backup são armazenados. O sistema organiza os backups em subpastas por tipo (daily, weekly, monthly, manual) e por banco de dados.
            </p>
            <p className="mb-2">
              <strong>Estrutura de pastas:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-xs font-mono bg-white p-3 rounded border border-gray-200">
              <li>{backupBaseDir || '/backups'}/daily/nome_banco/</li>
              <li>{backupBaseDir || '/backups'}/weekly/nome_banco/</li>
              <li>{backupBaseDir || '/backups'}/monthly/nome_banco/</li>
              <li>{backupBaseDir || '/backups'}/manual/nome_banco/</li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              <FaExclamationTriangle className="inline mr-1" />
              Certifique-se de que este diretório tenha espaço em disco suficiente e permissões de escrita adequadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

