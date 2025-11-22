export default function RcloneStatus({ rcloneConfig }) {
  return (
    <div className="card">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-1">Status da Instalação</div>
            <div className="text-xs text-gray-600">
              {rcloneConfig?.installed ? (
                <span className="text-green-600">✅ Rclone está instalado</span>
              ) : (
                <span className="text-red-600">❌ Rclone não está instalado</span>
              )}
            </div>
          </div>
        </div>

        {!rcloneConfig?.installed && (
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mt-3">
            <p className="text-xs text-yellow-800 mb-2">
              <strong>Nota:</strong> O rclone será instalado automaticamente ao reconstruir o container do backend.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

