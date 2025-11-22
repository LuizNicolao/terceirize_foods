import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Charts({ chartData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico de Timeline - Backups por Dia */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Backups por Dia (Últimos 7 dias)</h3>
        </div>
        <div className="px-6 pb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Concluídos" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Falhados" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Status (Pizza) */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Distribuição por Status</h3>
        </div>
        <div className="px-6 pb-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.byStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.byStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico por Banco de Dados */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Backups por Banco de Dados</h3>
        </div>
        <div className="px-6 pb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.byDatabase}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="completed" fill="#10b981" name="Concluídos" />
              <Bar dataKey="failed" fill="#ef4444" name="Falhados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Tamanho ao Longo do Tempo */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tamanho dos Backups (Últimos 7 dias)</h3>
        </div>
        <div className="px-6 pb-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.sizeOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} MB`} />
              <Legend />
              <Area type="monotone" dataKey="tamanho" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Tamanho (MB)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Taxa de Sucesso */}
      <div className="card lg:col-span-2">
        <div className="px-6 py-4 border-b border-gray-200 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Taxa de Sucesso ao Longo do Tempo</h3>
        </div>
        <div className="px-6 pb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.successRateOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="taxa" stroke="#10b981" strokeWidth={3} name="Taxa de Sucesso (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

