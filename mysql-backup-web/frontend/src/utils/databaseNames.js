// Mapeamento de nomes de bancos de dados para nomes amigáveis
export const DATABASE_NAMES = {
  'implantacao_db': 'Implantação',
  'foods_db': 'Foods',
  'cotacao_db': 'Cotação',
  'cozinha_industrial_db': 'Cozinha Industrial'
}

// Função para obter nome amigável de um banco
export const getDatabaseDisplayName = (databaseName) => {
  return DATABASE_NAMES[databaseName] || databaseName
}

// Função para traduzir tipo de backup
export const getBackupTypeDisplayName = (type) => {
  const types = {
    'manual': 'Manual',
    'daily': 'Diário',
    'weekly': 'Semanal',
    'monthly': 'Mensal',
    'incremental': 'Incremental'
  }
  return types[type] || type
}

// Função para traduzir status de backup (versões curtas)
export const getBackupStatusDisplayName = (status) => {
  const statuses = {
    'completed': 'Concluído',
    'failed': 'Falhou',
    'running': 'Executando',
    'pending': 'Pendente'
  }
  return statuses[status] || status
}

