const { exec, spawn } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const { executeQuery } = require('./database');
const database = require('./database');
const { sendTelegram } = require('./telegram');
const { uploadFile } = require('./rclone');

const execPromise = util.promisify(exec);

// Traduzir tipo de backup para português
function translateBackupType(backupType) {
  const translations = {
    'daily': 'Diário',
    'weekly': 'Semanal',
    'monthly': 'Mensal',
    'manual': 'Manual',
    'incremental': 'Incremental'
  };
  return translations[backupType] || backupType;
}

// Armazenar processos de backup em execução para poder cancelar
const runningBackups = new Map();

// Armazenar processos de restore em execução para monitorar progresso
const runningRestores = new Map();

// Caminho do backup: detecta se está rodando no Docker ou fora
// Dentro do Docker: usa /backups (volume montado)
// Fora do Docker (npm start): usa terceirize_foods/bkp_banco_dados
function getBackupBaseDir() {
  if (process.env.BACKUP_BASE_DIR) {
    return process.env.BACKUP_BASE_DIR;
  }
  
  // Verificar se está rodando dentro do Docker
  const fs = require('fs');
  const isDocker = fs.existsSync('/.dockerenv') || fs.existsSync('/proc/self/cgroup');
  
  if (isDocker) {
    // Dentro do container: usar /backups (volume montado)
    return '/backups';
  } else {
    // Fora do container (npm start): usar caminho relativo ao terceirize_foods
    // O código está em mysql-backup-web/backend/services, então volta 3 níveis para terceirize_foods
    const projectRoot = path.resolve(__dirname, '../../..'); // volta para terceirize_foods
    return path.join(projectRoot, 'bkp_banco_dados');
  }
}

const BACKUP_BASE_DIR = getBackupBaseDir();
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'root123456';
const CONTAINER_NAME = process.env.MYSQL_CONTAINER_NAME || 'terceirize_mysql';

// Nomes amigáveis para pastas
const DB_NAMES = {
  'implantacao_db': 'implantacao',
  'foods_db': 'foods',
  'cotacao_db': 'cotacao',
  'cozinha_industrial_db': 'cozinha_industrial'
};

// Criar estrutura de pastas
async function ensureDirectories(backupType, databaseName) {
  const dbFolder = DB_NAMES[databaseName] || databaseName;
  const dirs = [
    path.join(BACKUP_BASE_DIR, backupType, dbFolder),
    path.join(BACKUP_BASE_DIR, 'logs')
  ];
  
  // Para backup incremental, usar pasta 'incremental' ao invés do tipo
  if (backupType === 'incremental') {
    dirs[0] = path.join(BACKUP_BASE_DIR, 'incremental', dbFolder);
  }
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
    // Garantir permissões
    await fs.chmod(dir, 0o755).catch(() => {});
  }
}

// Buscar último timestamp de backup incremental para uma tabela
async function getLastIncrementalBackupTimestamp(databaseName, tableName) {
  try {
    const pool = require('./database').getPool();
    if (!pool) return null;
    
    // Buscar último backup incremental completo (não apenas da tabela específica)
    // que tenha a tabela selecionada
    const [backups] = await pool.execute(`
      SELECT MAX(completed_at) as last_timestamp
      FROM backups
      WHERE database_name = ?
        AND backup_type = 'incremental'
        AND status = 'completed'
    `, [databaseName]);
    
    if (backups && backups.length > 0 && backups[0].last_timestamp) {
      return new Date(backups[0].last_timestamp);
    }
    
    // Se não encontrou backup incremental, buscar último backup diário como referência
    const [dailyBackups] = await pool.execute(`
      SELECT MAX(completed_at) as last_timestamp
      FROM backups
      WHERE database_name = ?
        AND backup_type = 'daily'
        AND status = 'completed'
    `, [databaseName]);
    
    if (dailyBackups && dailyBackups.length > 0 && dailyBackups[0].last_timestamp) {
      return new Date(dailyBackups[0].last_timestamp);
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar último timestamp de backup incremental:', error);
    return null;
  }
}

// Criar backup incremental de uma tabela específica (busca dados)
async function getIncrementalData(databaseName, tableName, timestampColumn = 'data_atualizacao') {
  const { getPool } = require('./database');
  const pool = getPool();
  
  if (!pool) {
    throw new Error('Database pool não inicializado');
  }
  
  // Buscar último timestamp
  const lastTimestamp = await getLastIncrementalBackupTimestamp(databaseName, tableName);
  
  if (!lastTimestamp) {
    // Se não há backup anterior, retornar erro
    throw new Error('Não há backup anterior. Faça um backup completo primeiro (daily) antes de usar incremental.');
  }
  
  // Criar conexão temporária para o banco de destino
  // Usar a mesma configuração do pool principal, mas mudando o database
  const tempConfig = {
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  };
  const mysql = require('mysql2/promise');
  const tempPool = mysql.createPool(tempConfig);
  
  try {
    // Buscar estrutura da tabela
    const [columns] = await tempPool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [databaseName, tableName]);
    
    if (columns.length === 0) {
      throw new Error(`Tabela ${tableName} não encontrada no banco ${databaseName}`);
    }
    
    // Verificar se a coluna de timestamp existe
    const hasTimestampColumn = columns.some(col => col.COLUMN_NAME === timestampColumn);
    if (!hasTimestampColumn) {
      throw new Error(`Coluna ${timestampColumn} não encontrada na tabela ${tableName}`);
    }
    
    // Buscar registros modificados desde o último backup
    const columnNames = columns.map(col => `\`${col.COLUMN_NAME}\``).join(', ');
    const [records] = await tempPool.execute(`
      SELECT ${columnNames}
      FROM \`${tableName}\`
      WHERE \`${timestampColumn}\` >= ?
      ORDER BY \`${timestampColumn}\` ASC
    `, [lastTimestamp]);
    
    await tempPool.end();
    
    return {
      records,
      columns,
      lastTimestamp,
      recordCount: records.length
    };
  } catch (error) {
    await tempPool.end();
    throw error;
  }
}

// Função para escapar valores SQL
function escapeSQLValue(value, dataType) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  // Para tipos de texto/data, escapar e adicionar aspas
  if (dataType.includes('char') || dataType.includes('text') || dataType.includes('date') || dataType.includes('time')) {
    const str = String(value);
    return `'${str.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
  }
  
  // Para números, retornar como está
  if (dataType.includes('int') || dataType.includes('decimal') || dataType.includes('float') || dataType.includes('double')) {
    return String(value);
  }
  
  // Para boolean, converter para 0/1
  if (dataType.includes('bool') || dataType === 'tinyint(1)') {
    return value ? '1' : '0';
  }
  
  // Padrão: escapar como string
  return `'${String(value).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

// Criar backup incremental (wrapper principal)
async function createIncrementalBackupWrapper(databaseName, selectedTables) {
  if (!selectedTables || selectedTables.length === 0) {
    throw new Error('Para backup incremental, é necessário especificar pelo menos uma tabela');
  }
  
  if (selectedTables.length > 1) {
    throw new Error('Backup incremental atualmente suporta apenas uma tabela por vez');
  }
  
  const tableName = selectedTables[0];
  const timestampColumn = 'data_atualizacao'; // Padrão, pode ser configurável depois
  
  // Timestamp para nome do arquivo
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
  
  const dbFolder = DB_NAMES[databaseName] || databaseName;
  const backupType = 'incremental';
  
  // Garantir que as pastas existam ANTES de construir os caminhos
  await ensureDirectories(backupType, databaseName);
  
  const fileNameSql = `${tableName}_${timestamp}_incremental.sql`;
  const sqlFilePath = path.join(BACKUP_BASE_DIR, backupType, dbFolder, fileNameSql);
  const fileNameGz = `${tableName}_${timestamp}_incremental.sql.gz`;
  const filePath = path.join(BACKUP_BASE_DIR, backupType, dbFolder, fileNameGz);
  
  // Criar registro no banco
  const { getPool } = require('./database');
  const pool = getPool();
  
  if (!pool) {
    throw new Error('Database pool não inicializado');
  }
  
  const [result] = await pool.execute(
    `INSERT INTO backups (database_name, backup_type, file_path, status) 
     VALUES (?, ?, ?, 'running')`,
    [databaseName, backupType, filePath]
  );
  const backupId = result.insertId;
  
  try {
    // Buscar dados incrementais
    const { records, columns, lastTimestamp, recordCount } = await getIncrementalData(databaseName, tableName, timestampColumn);
    
    if (recordCount === 0) {
      // Não há mudanças, mas criar arquivo vazio para registrar que o backup foi executado
      let sqlContent = `-- Backup incremental: ${tableName}\n`;
      sqlContent += `-- Banco: ${databaseName}\n`;
      sqlContent += `-- Período: ${lastTimestamp.toISOString()} até ${now.toISOString()}\n`;
      sqlContent += `-- Registros alterados: 0\n`;
      sqlContent += `-- Gerado em: ${now.toISOString()}\n`;
      sqlContent += `-- Status: Nenhuma mudança detectada desde o último backup\n\n`;
      sqlContent += `USE \`${databaseName}\`;\n\n`;
      sqlContent += `-- Nenhum registro foi modificado desde o último backup incremental\n`;
      
      // Escrever arquivo
      await fs.writeFile(sqlFilePath, sqlContent, 'utf8');
      
      // Comprimir mesmo arquivo vazio para manter consistência
      await execPromise(`gzip -f "${sqlFilePath}"`).catch(() => {
        // Se falhar compressão de arquivo vazio, não é crítico
      });
      
      // Aguardar compressão
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tentar obter tamanho do arquivo comprimido (pode não existir se compressão falhou)
      let fileSize = 0;
      try {
        const finalStats = await fs.stat(filePath);
        fileSize = finalStats.size;
      } catch (error) {
        // Arquivo comprimido não existe, usar tamanho do arquivo SQL original
        try {
          const sqlStats = await fs.stat(sqlFilePath);
          fileSize = sqlStats.size;
        } catch (e) {
          // Se nenhum arquivo existe, manter 0
        }
      }
      
      // Atualizar registro
      await pool.execute(
        `UPDATE backups SET status = 'completed', completed_at = NOW(), file_size = ? WHERE id = ?`,
        [fileSize, backupId]
      );
      
      return {
        success: true,
        backupId,
        databaseName,
        backupType: 'incremental',
        filePath: fileSize > 0 ? filePath : sqlFilePath,
        fileSize: fileSize,
        recordCount: 0,
        message: 'Nenhuma mudança detectada desde o último backup'
      };
    }
    
    // Criar conteúdo SQL
    let sqlContent = `-- Backup incremental: ${tableName}\n`;
    sqlContent += `-- Banco: ${databaseName}\n`;
    sqlContent += `-- Período: ${lastTimestamp.toISOString()} até ${now.toISOString()}\n`;
    sqlContent += `-- Registros alterados: ${recordCount}\n`;
    sqlContent += `-- Gerado em: ${now.toISOString()}\n\n`;
    sqlContent += `USE \`${databaseName}\`;\n\n`;
    
    // Gerar INSERT ou REPLACE para cada registro
    const columnNames = columns.map(col => `\`${col.COLUMN_NAME}\``).join(', ');
    
    for (const record of records) {
      const values = columns.map(col => escapeSQLValue(record[col.COLUMN_NAME], col.DATA_TYPE)).join(', ');
      sqlContent += `REPLACE INTO \`${tableName}\` (${columnNames}) VALUES (${values});\n`;
    }
    
    // Escrever arquivo
    await fs.writeFile(sqlFilePath, sqlContent, 'utf8');
    
    // Comprimir
    await execPromise(`gzip -f "${sqlFilePath}"`);
    
    // Aguardar compressão
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Obter tamanho do arquivo comprimido
    const finalStats = await fs.stat(filePath);
    
    // Atualizar registro
    await pool.execute(
      `UPDATE backups SET status = 'completed', completed_at = NOW(), file_size = ? WHERE id = ?`,
      [finalStats.size, backupId]
    );
    
    // Enviar notificação
    const message = `✅ Backup incremental concluído: ${databaseName}/${tableName}\n📊 Registros: ${recordCount}\n💾 Tamanho: ${(finalStats.size / 1024).toFixed(2)} KB`;
    sendTelegram(message).catch(() => {});
    
    return {
      success: true,
      backupId,
      databaseName,
      backupType: 'incremental',
      tableName,
      filePath: filePath,
      fileSize: finalStats.size,
      recordCount,
      status: 'completed'
    };
  } catch (error) {
    // Atualizar registro com erro
    await pool.execute(
      `UPDATE backups SET status = 'failed', error_message = ?, completed_at = NOW() WHERE id = ?`,
      [error.message, backupId]
    );
    
    // Enviar notificação de erro
    sendTelegram(`❌ Erro no backup incremental: ${databaseName}/${tableName}\n⚠️ ${error.message}`).catch(() => {});
    
    throw error;
  }
}

// Fazer backup de um banco (com opção de tabelas específicas)
async function createBackup(databaseName, backupType = 'manual', selectedTables = null) {
  // Se for backup incremental, usar lógica diferente
  if (backupType === 'incremental') {
    return await createIncrementalBackupWrapper(databaseName, selectedTables);
  }
  // Usar o mesmo formato de timestamp do script: YYYY-MM-DD_HHMMSS
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
  
  const dbFolder = DB_NAMES[databaseName] || databaseName;
  // Usar o mesmo formato de nome do script: database_name_YYYY-MM-DD_HHMMSS.sql.gz
  // Primeiro criar o nome do arquivo .gz (final)
  const fileNameGz = `${databaseName}_${timestamp}.sql.gz`;
  const filePath = path.join(BACKUP_BASE_DIR, backupType, dbFolder, fileNameGz);
  // Depois criar o nome do arquivo .sql (temporário, antes de comprimir)
  // IMPORTANTE: garantir que não tenha .gz no nome do arquivo SQL
  const fileNameSql = `${databaseName}_${timestamp}.sql`;
  const sqlFilePath = path.join(BACKUP_BASE_DIR, backupType, dbFolder, fileNameSql);
  const logPath = path.join(BACKUP_BASE_DIR, 'logs', `backup_${timestamp}.log`);
  
  // Garantir que o sqlFilePath não tenha extensão duplicada
  if (sqlFilePath.endsWith('.sql.sql')) {
    throw new Error(`Erro: sqlFilePath tem extensão duplicada: ${sqlFilePath}`);
  }
  if (!sqlFilePath.endsWith('.sql')) {
    throw new Error(`Erro: sqlFilePath deve terminar com .sql: ${sqlFilePath}`);
  }
  
  // Criar registro no banco
  // Para INSERT, precisamos usar pool.execute diretamente para obter insertId
  const { getPool } = require('./database');
  
  // Obter pool (garante que está inicializado)
  const pool = getPool();
  
  if (!pool) {
    throw new Error('Database pool não inicializado');
  }
  
  const [result] = await pool.execute(
    `INSERT INTO backups (database_name, backup_type, file_path, status) 
     VALUES (?, ?, ?, 'running')`,
    [databaseName, backupType, filePath]
  );
  const backupId = result.insertId;
  
  try {
    // Garantir que as pastas existem
    await ensureDirectories(backupType, databaseName);
    
    // Verificar se está usando Docker
    const isDocker = await checkDockerContainer();
    
    // Executar backup usando spawn para poder monitorar e cancelar
    let backupProcess;
    
    // Preparar argumentos base do mysqldump
    const baseArgs = [
        '--single-transaction',      // Backup consistente sem travar tabelas
        '--skip-routines',           // Pular procedures/functions (evita erro de permissão)
        '--triggers',                // Incluir triggers
        '--events',                  // Incluir eventos agendados
        '--quick',                   // Carregar tabela em memória linha por linha
        '--lock-tables=false',       // Não travar tabelas
        '--no-tablespaces',          // Não incluir tablespaces (evita erro de PROCESS privilege)
        '--complete-insert',         // Usar INSERT INTO completo com nomes de colunas
        '--add-drop-table',          // Adicionar DROP TABLE antes de CREATE TABLE
      '--create-options'           // Incluir opções de CREATE TABLE
    ];
    
    // Se tabelas específicas foram selecionadas, adicionar ao comando
    // Se não, fazer backup completo (inclui --add-drop-database)
    if (!selectedTables || selectedTables.length === 0) {
      baseArgs.push('--add-drop-database'); // Apenas para backup completo
    }
    
    if (isDocker) {
      // Backup via Docker
      const dockerArgs = [
        'exec', CONTAINER_NAME,
        'mysqldump',
        '-u', MYSQL_USER,
        `-p${MYSQL_PASSWORD}`,
        ...baseArgs,
        databaseName
      ];
      
      // Se tabelas específicas, adicionar nomes das tabelas no final
      if (selectedTables && selectedTables.length > 0) {
        dockerArgs.push(...selectedTables);
      }
      
      backupProcess = spawn('docker', dockerArgs);
    } else {
      // Backup direto
      const dumpArgs = [
        '-h', MYSQL_HOST,
        '-P', String(MYSQL_PORT),
        '-u', MYSQL_USER,
        `-p${MYSQL_PASSWORD}`,
        ...baseArgs,
        databaseName
      ];
      
      // Se tabelas específicas, adicionar nomes das tabelas no final
      if (selectedTables && selectedTables.length > 0) {
        dumpArgs.push(...selectedTables);
      }
      
      backupProcess = spawn('mysqldump', dumpArgs);
    }
    
    // Armazenar processo para poder cancelar
    runningBackups.set(backupId, {
      process: backupProcess,
      databaseName,
      sqlFilePath,
      filePath,
      startTime: new Date()
    });
    
    // Criar stream de escrita para o arquivo
    const writeStream = require('fs').createWriteStream(sqlFilePath);
    
    // Pipe do processo para o arquivo
    backupProcess.stdout.pipe(writeStream);
    
    // Capturar erros do stderr (warnings podem aparecer aqui)
    let stderrOutput = '';
    backupProcess.stderr.on('data', (data) => {
      const errorText = data.toString();
      stderrOutput += errorText;
      // Capturar stderr mas não logar warnings de senha
    });
    
    // Aguardar conclusão do processo e fechamento do stream
    await new Promise((resolve, reject) => {
      let streamFinished = false;
      let processFinished = false;
      
      const checkComplete = () => {
        if (streamFinished && processFinished) {
          resolve();
        }
      };
      
      // Listener para quando o stream terminar de escrever
      writeStream.on('finish', () => {
        streamFinished = true;
        checkComplete();
      });
      
      writeStream.on('error', (err) => {
        runningBackups.delete(backupId);
        reject(new Error(`Erro ao escrever arquivo: ${err.message}`));
      });
      
      // Listener para quando o processo terminar
      backupProcess.on('close', (code) => {
        // Fechar o stream explicitamente
        if (writeStream.writable) {
          writeStream.end();
        }
        
        runningBackups.delete(backupId);
        
        // Verificar se houve erros críticos no stderr
        if (stderrOutput && !stderrOutput.includes('[Warning] Using a password')) {
          // Verificar se há erros reais (não apenas warnings)
          if (stderrOutput.toLowerCase().includes('error') || 
              stderrOutput.toLowerCase().includes('mysqldump: error')) {
            return reject(new Error(`Backup falhou: ${stderrOutput}`));
          }
        }
        
        if (code !== 0) {
          return reject(new Error(`Backup process exited with code ${code}. ${stderrOutput || ''}`));
        }
        
        processFinished = true;
        checkComplete();
      });
      
      backupProcess.on('error', (error) => {
        writeStream.destroy();
        runningBackups.delete(backupId);
        reject(error);
      });
    });
    
    // Aguardar um pouco para garantir que o arquivo foi completamente escrito e fechado
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificar se o arquivo foi criado
    // Primeiro verificar se o arquivo realmente existe no caminho correto
    let stats;
    try {
      stats = await fs.stat(sqlFilePath);
    } catch (error) {
      throw new Error(`Arquivo SQL não foi criado: ${sqlFilePath}. Erro: ${error.message}`);
    }
    
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }
    
    // Comprimir (como no script) - usando caminho absoluto
    try {
      
      // Verificar se o arquivo SQL existe antes de comprimir
      try {
        await fs.access(sqlFilePath);
      } catch (error) {
        throw new Error(`Arquivo SQL não existe para compressão: ${sqlFilePath}`);
      }
      
      // Executar gzip
      await execPromise(`gzip -f "${sqlFilePath}"`);
    } catch (error) {
      
      // Não deletar o arquivo SQL - deixar para debug
      throw new Error(`Erro ao comprimir backup: ${error.message}`);
    }
    
    // Aguardar um pouco para garantir que o arquivo foi comprimido e escrito
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar se o arquivo .gz foi criado
    let finalStats;
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries) {
      try {
        finalStats = await fs.stat(filePath);
        break; // Arquivo encontrado, sair do loop
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          // Última tentativa falhou - verificar se o .sql ainda existe
          try {
            const sqlStillExists = await fs.stat(sqlFilePath);
            throw new Error(`Arquivo .gz não foi criado após ${maxRetries} tentativas. Arquivo SQL ainda existe (${sqlStillExists.size} bytes). Caminho esperado: ${filePath}. Verifique permissões e espaço em disco.`);
          } catch (statError) {
            throw new Error(`Arquivo comprimido não foi criado: ${filePath}. Arquivo SQL também não existe. Verifique permissões e espaço em disco. Erro: ${error.message}`);
          }
        }
        // Aguardar um pouco antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Atualizar registro com o caminho do arquivo .gz
    await executeQuery(
      `UPDATE backups SET status = 'completed', file_path = ?, file_size = ?, completed_at = NOW() WHERE id = ?`,
      [filePath, finalStats.size, backupId]
    );
    
    // Upload para rclone (se configurado)
    let remotePath = null;
    if (process.env.RCLONE_REMOTE) {
      try {
        const remoteBase = process.env.RCLONE_REMOTE.trim();
        // Garantir que remoteBase termina com : ou /
        const separator = remoteBase.endsWith(':') ? '' : (remoteBase.endsWith('/') ? '' : '/');
        const remoteFilePath = `${remoteBase}${separator}${backupType}/${dbFolder}/${fileNameGz}`;
        
        await uploadFile(filePath, remoteFilePath, { progress: false });
        
        // Atualizar registro com caminho remoto
        await executeQuery(
          `UPDATE backups SET remote_path = ? WHERE id = ?`,
          [remoteFilePath, backupId]
        );
        
        remotePath = remoteFilePath;
        
        // Opcional: deletar local após upload (se configurado)
        if (process.env.RCLONE_DELETE_AFTER_UPLOAD === 'true') {
          await fs.unlink(filePath).catch(() => {
            // Ignorar erro se arquivo já foi deletado
          });
        }
      } catch (rcloneError) {
        // Não falhar o backup se rclone falhar, apenas logar
        console.error('Erro ao fazer upload via rclone:', rcloneError);
        sendTelegram(`⚠️ Backup concluído localmente, mas falhou upload para nuvem: ${rcloneError.message}`);
      }
    }
    
    // Enviar notificação Telegram
    const cloudStatus = remotePath ? '☁️ Enviado para nuvem' : '';
    const backupTypeTranslated = translateBackupType(backupType);
    
    // Formatar data e hora de forma legível
    const now = new Date();
    const dateTime = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Extrair diretório do caminho do arquivo
    const backupDir = path.dirname(filePath);
    
    sendTelegram(`✅ Backup concluído: ${databaseName}\n📦 Tipo: ${backupTypeTranslated}\n💾 Tamanho: ${formatBytes(finalStats.size)}\n📅 Data/Hora: ${dateTime}\n📁 Diretório: ${backupDir}${cloudStatus ? '\n' + cloudStatus : ''}`);
    
    return {
      id: backupId,
      databaseName,
      backupType,
      filePath: filePath, // Já inclui .gz
      fileSize: finalStats.size,
      status: 'completed',
      remotePath: remotePath
    };
  } catch (error) {
    // Atualizar registro com erro
    await executeQuery(
      `UPDATE backups SET status = 'failed', error_message = ?, completed_at = NOW() WHERE id = ?`,
      [error.message, backupId]
    );
    
    // Enviar notificação de erro
    sendTelegram(`❌ Erro no backup: ${databaseName}\n⚠️ ${error.message}`);
    
    throw error;
  }
}

// Verificar se está usando Docker
async function checkDockerContainer() {
  try {
    await execPromise(`docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"`);
    return true;
  } catch {
    return false;
  }
}

// Extrair tabelas específicas de um arquivo SQL de backup
async function extractTablesFromBackup(backupFilePath, selectedTables) {
  const fs = require('fs').promises;
  const path = require('path');
  const os = require('os');
  
  // Criar arquivo temporário
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `restore_${Date.now()}.sql`);
  
  try {
    // Descomprimir se necessário
    let sqlFilePath = backupFilePath;
    let decompressed = false;
    
    if (backupFilePath.endsWith('.gz')) {
      sqlFilePath = backupFilePath.replace('.gz', '');
      await execPromise(`gunzip -c "${backupFilePath}" > "${sqlFilePath}"`);
      decompressed = true;
    }
    
    // Ler o arquivo SQL
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    // Usar regex para extrair blocos completos de cada tabela
    // Formato: DROP TABLE ... CREATE TABLE ... LOCK TABLES ... INSERT ... UNLOCK TABLES
    const extractedSQL = [];
    
    // Regex para encontrar o nome da tabela em diferentes comandos
    const getTableName = (line) => {
      const patterns = [
        /DROP TABLE[^`]*IF EXISTS[^`]*`([^`]+)`/i,
        /CREATE TABLE[^`]*`([^`]+)`/i,
        /LOCK TABLES[^`]*`([^`]+)`/i,
        /INSERT INTO[^`]*`([^`]+)`/i
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) return match[1];
      }
      return null;
    };
    
    const lines = sqlContent.split('\n');
    
    let currentTable = null;
    let isSelectedTable = false;
    let tableBlock = [];
    let inTableBlock = false;
    let expectingUnlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const tableName = getTableName(line);
      
      // Se encontrou uma referência de tabela
      if (tableName) {
        // Se é uma tabela selecionada
        if (selectedTables.includes(tableName)) {
          // Se estávamos processando outra tabela, finalizar ela
          if (currentTable && currentTable !== tableName && inTableBlock) {
            if (isSelectedTable && tableBlock.length > 0) {
              extractedSQL.push(...tableBlock);
              extractedSQL.push('');
            }
            tableBlock = [];
            inTableBlock = false;
          }
          
          currentTable = tableName;
          isSelectedTable = true;
          inTableBlock = true;
          
          // Se é DROP TABLE, adicionar
          if (line.includes('DROP TABLE')) {
            tableBlock.push(line);
          }
          // Se é CREATE TABLE, começar a capturar
          else if (line.includes('CREATE TABLE')) {
            tableBlock.push(line);
            expectingUnlock = false;
          }
          // Se é LOCK TABLES, adicionar
          else if (line.includes('LOCK TABLES')) {
            tableBlock.push(line);
            expectingUnlock = true;
          }
          // Se é INSERT INTO, adicionar
          else if (line.includes('INSERT INTO')) {
            tableBlock.push(line);
          }
        } else {
          // Tabela não selecionada - finalizar bloco anterior se havia um
          if (currentTable && isSelectedTable && inTableBlock) {
            if (tableBlock.length > 0) {
              extractedSQL.push(...tableBlock);
              extractedSQL.push('');
            }
            tableBlock = [];
            inTableBlock = false;
          }
          currentTable = null;
          isSelectedTable = false;
          expectingUnlock = false;
        }
        continue;
      }
      
      // Se estamos dentro de um bloco de tabela selecionada
      if (inTableBlock && isSelectedTable && currentTable) {
        // Continuar capturando linhas até encontrar UNLOCK TABLES
        
        // Se encontrou UNLOCK TABLES, finalizar
        if (line.trim() === 'UNLOCK TABLES;' || line.trim().startsWith('UNLOCK TABLES;')) {
          tableBlock.push(line);
          extractedSQL.push(...tableBlock);
          extractedSQL.push('');
          tableBlock = [];
          inTableBlock = false;
          currentTable = null;
          isSelectedTable = false;
          expectingUnlock = false;
          continue;
        }
        
        // Adicionar linha ao bloco (pode ser continuação de CREATE TABLE ou INSERT)
        tableBlock.push(line);
      }
    }
    
    // Adicionar última tabela se estiver selecionada
    if (inTableBlock && isSelectedTable && tableBlock.length > 0) {
      extractedSQL.push(...tableBlock);
    }
    
    // Adicionar cabeçalho SQL padrão
    const finalSQL = [
      '-- MySQL dump restored tables',
      'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";',
      'SET time_zone = "+00:00";',
      '/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;',
      '/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;',
      '/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;',
      '/*!40101 SET NAMES utf8mb4 */;',
      '',
      ...extractedSQL
    ].join('\n');
    
    // Salvar SQL extraído
    await fs.writeFile(tempFile, finalSQL);
    
    // Limpar arquivo descomprimido se foi criado
    if (decompressed) {
      await fs.unlink(sqlFilePath).catch(() => {});
    }
    
    return tempFile;
  } catch (error) {
    throw new Error(`Erro ao extrair tabelas do backup: ${error.message}`);
  }
}

// Restaurar backup (com opção de restaurar tabelas específicas)
async function restoreBackup(backupId, selectedTables = null) {
  const backup = await executeQuery(
    `SELECT * FROM backups WHERE id = ?`,
    [backupId]
  );
  
  if (!backup || !Array.isArray(backup) || backup.length === 0) {
    throw new Error('Backup not found');
  }
  
  const backupRecord = backup[0];
  
  if (!backupRecord) {
    throw new Error('Backup record is undefined');
  }
  
  if (backupRecord.status !== 'completed') {
    throw new Error('Backup is not completed');
  }
  
  // Verificar se já existe um restore em execução para este backup
  if (runningRestores.has(backupId)) {
    throw new Error('Restore já está em execução para este backup');
  }
  
  const isDocker = await checkDockerContainer();
  let restoreProcess;
  let tempFile = null;
  const startTime = new Date();
  
  // Obter estatísticas do arquivo para progresso
  const stats = await fs.stat(backupRecord.file_path).catch(() => ({ size: 0 }));
  const totalSize = stats.size;
  
  // Inicializar informações do restore
  runningRestores.set(backupId, {
    backupId,
    databaseName: backupRecord.database_name,
    selectedTables,
    startTime,
    totalSize,
    currentSize: 0,
    progress: 0,
    status: 'running'
  });
  
  try {
    // Se tabelas específicas foram selecionadas, extrair apenas essas tabelas
    if (selectedTables && selectedTables.length > 0 && selectedTables.length > 0) {
      tempFile = await extractTablesFromBackup(backupRecord.file_path, selectedTables);
      
      // Obter tamanho do arquivo extraído
      const tempStats = await fs.stat(tempFile).catch(() => ({ size: totalSize }));
      runningRestores.get(backupId).totalSize = tempStats.size;
      
      if (isDocker) {
        // Copiar arquivo para container
        const containerPath = `/tmp/restore_${Date.now()}.sql`;
        await execPromise(`docker cp "${tempFile}" ${CONTAINER_NAME}:${containerPath}`);
        
        // Usar cat no container para ler o arquivo e passar para mysql
        const catCommand = `cat ${containerPath} | mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${backupRecord.database_name} && rm -f ${containerPath}`;
        
        restoreProcess = spawn('docker', [
          'exec', '-i', CONTAINER_NAME,
          'sh', '-c', catCommand
        ]);
      } else {
        // Local: usar spawn
        restoreProcess = spawn('mysql', [
          '-h', MYSQL_HOST,
          '-P', String(MYSQL_PORT),
          '-u', MYSQL_USER,
          `-p${MYSQL_PASSWORD}`,
          backupRecord.database_name
        ]);
        
        const fileStream = require('fs').createReadStream(tempFile);
        fileStream.pipe(restoreProcess.stdin);
        
        // Monitorar progresso
        let bytesRead = 0;
        const tempStats = await fs.stat(tempFile);
        fileStream.on('data', (chunk) => {
          bytesRead += chunk.length;
          runningRestores.get(backupId).currentSize = bytesRead;
          runningRestores.get(backupId).progress = Math.round((bytesRead / tempStats.size) * 100);
        });
        
        fileStream.on('end', () => {
          restoreProcess.stdin.end();
        });
      }
    } else {
      // Restaurar banco completo
      if (backupRecord.file_path.endsWith('.gz')) {
        // Backup comprimido - usar gunzip com pipe
        const gunzipProcess = spawn('gunzip', ['-c', backupRecord.file_path]);
        
        if (isDocker) {
          restoreProcess = spawn('docker', [
            'exec', '-i', CONTAINER_NAME,
            'mysql', '-u', MYSQL_USER, `-p${MYSQL_PASSWORD}`, backupRecord.database_name
          ]);
        } else {
          restoreProcess = spawn('mysql', [
            '-h', MYSQL_HOST,
            '-P', String(MYSQL_PORT),
            '-u', MYSQL_USER,
            `-p${MYSQL_PASSWORD}`,
            backupRecord.database_name
          ]);
        }
        
        // Pipe gunzip -> mysql
        gunzipProcess.stdout.pipe(restoreProcess.stdin);
        
        // Monitorar progresso do arquivo comprimido
        let bytesRead = 0;
        gunzipProcess.stdout.on('data', (chunk) => {
          bytesRead += chunk.length;
          // Estimar progresso baseado no tamanho do arquivo comprimido
          // (aproximação, pois não sabemos o tamanho descomprimido exato)
          runningRestores.get(backupId).currentSize = bytesRead;
          runningRestores.get(backupId).progress = Math.min(
            Math.round((bytesRead / totalSize) * 120), // Permitir até 120% (estimativa)
            100
          );
        });
        
        gunzipProcess.on('error', (error) => {
          runningRestores.delete(backupId);
          throw error;
        });
      } else {
        // Backup não comprimido
        if (isDocker) {
          // Para Docker, copiar arquivo primeiro e depois restaurar
          const containerPath = `/tmp/restore_${Date.now()}.sql`;
          await execPromise(`docker cp "${backupRecord.file_path}" ${CONTAINER_NAME}:${containerPath}`);
          
          restoreProcess = spawn('docker', [
            'exec', '-i', CONTAINER_NAME,
            'mysql', '-u', MYSQL_USER, `-p${MYSQL_PASSWORD}`, backupRecord.database_name
          ]);
          
          const fileStream = require('fs').createReadStream(backupRecord.file_path);
          fileStream.pipe(restoreProcess.stdin);
          
          // Monitorar progresso
          let bytesRead = 0;
          fileStream.on('data', (chunk) => {
            bytesRead += chunk.length;
            runningRestores.get(backupId).currentSize = bytesRead;
            runningRestores.get(backupId).progress = Math.round((bytesRead / totalSize) * 100);
          });
          
          fileStream.on('end', () => {
            restoreProcess.stdin.end();
            setTimeout(() => {
              execPromise(`docker exec ${CONTAINER_NAME} rm -f ${containerPath}`).catch(() => {});
            }, 1000);
          });
        } else {
          restoreProcess = spawn('mysql', [
            '-h', MYSQL_HOST,
            '-P', String(MYSQL_PORT),
            '-u', MYSQL_USER,
            `-p${MYSQL_PASSWORD}`,
            backupRecord.database_name
          ]);
          
          const fileStream = require('fs').createReadStream(backupRecord.file_path);
          fileStream.pipe(restoreProcess.stdin);
          
          // Monitorar progresso
          let bytesRead = 0;
          fileStream.on('data', (chunk) => {
            bytesRead += chunk.length;
            runningRestores.get(backupId).currentSize = bytesRead;
            runningRestores.get(backupId).progress = Math.round((bytesRead / totalSize) * 100);
          });
          
          fileStream.on('end', () => {
            restoreProcess.stdin.end();
          });
        }
      }
    }
    
    // Aguardar conclusão do processo
    await new Promise((resolve, reject) => {
      let stderrOutput = '';
      
      restoreProcess.stderr.on('data', (data) => {
        const errorText = data.toString();
        stderrOutput += errorText;
        // MySQL envia warnings no stderr, não necessariamente erros
        if (errorText.includes('ERROR')) {
          reject(new Error(`Erro no restore: ${errorText}`));
        }
      });
      
      restoreProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Restore falhou com código ${code}: ${stderrOutput}`));
        }
      });
      
      restoreProcess.on('error', (error) => {
        reject(error);
      });
    });
    
    // Atualizar status para concluído
    runningRestores.get(backupId).status = 'completed';
    runningRestores.get(backupId).progress = 100;
    
    const tablesInfo = selectedTables && selectedTables.length > 0 
      ? ` (${selectedTables.length} tabela(s): ${selectedTables.join(', ')})`
      : ' (banco completo)';
    sendTelegram(`✅ Restore concluído: ${backupRecord.database_name}${tablesInfo}`);
    
    // Limpar arquivo temporário
    if (tempFile) {
      await fs.unlink(tempFile).catch(() => {});
    }
    
    // Remover do mapa após um delay (para permitir que o frontend pegue o status final)
    setTimeout(() => {
      runningRestores.delete(backupId);
    }, 5000);
    
    return { success: true };
  } catch (error) {
    // Limpar arquivo temporário mesmo em caso de erro
    if (tempFile) {
      await fs.unlink(tempFile).catch(() => {});
    }
    
    // Atualizar status para falhou
    if (runningRestores.has(backupId)) {
      runningRestores.get(backupId).status = 'failed';
      setTimeout(() => {
        runningRestores.delete(backupId);
      }, 5000);
    }
    
    sendTelegram(`❌ Erro no restore: ${backupRecord.database_name}\n⚠️ ${error.message}`);
    throw error;
  }
}

// Obter status do restore em execução
function getRestoreStatus(backupId) {
  const restore = runningRestores.get(backupId);
  if (!restore) {
    return null;
  }
  
  const elapsed = Math.floor((new Date() - restore.startTime) / 1000);
  
  return {
    running: restore.status === 'running',
    progress: restore.progress,
    total: 100,
    elapsed,
    currentSize: restore.currentSize,
    totalSize: restore.totalSize,
    databaseName: restore.databaseName,
    selectedTables: restore.selectedTables,
    status: restore.status
  };
}

// Listar backups
async function listBackups(filters = {}) {
  let query = `SELECT * FROM backups WHERE 1=1`;
  const params = [];
  
  if (filters.databaseName) {
    query += ` AND database_name = ?`;
    params.push(filters.databaseName);
  }
  
  if (filters.backupType) {
    query += ` AND backup_type = ?`;
    params.push(filters.backupType);
  }
  
  if (filters.status) {
    query += ` AND status = ?`;
    params.push(filters.status);
  }
  
  query += ` ORDER BY created_at DESC`;
  
  // LIMIT não pode usar placeholder, precisa ser número inteiro diretamente na query
  if (filters.limit) {
    const limitValue = parseInt(filters.limit, 10);
    if (limitValue > 0) {
      query += ` LIMIT ${limitValue}`;
    }
  }
  
  return await executeQuery(query, params);
}

// Formatar bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Cancelar backup em execução
async function cancelBackup(backupId) {
  try {
    // Verificar se o backup existe e está rodando no banco
    const backups = await executeQuery('SELECT * FROM backups WHERE id = ?', [backupId]);
    
    if (!backups || backups.length === 0) {
      throw new Error('Backup não encontrado');
    }
    
    const backup = backups[0];
    
    // Se não está rodando, verificar se já foi cancelado/completado
    if (backup.status !== 'running') {
      throw new Error(`Backup não está em execução. Status atual: ${backup.status}`);
    }
    
    // Tentar encontrar o processo no Map
    const backupInfo = runningBackups.get(backupId);
    
    if (backupInfo && backupInfo.process) {
      try {
        // Matar o processo
        backupInfo.process.kill('SIGTERM');
        
        // Aguardar um pouco e forçar kill se necessário
        setTimeout(() => {
          if (!backupInfo.process.killed) {
            backupInfo.process.kill('SIGKILL');
          }
        }, 2000);
        
        // Limpar arquivo parcial se existir
        try {
          await fs.unlink(backupInfo.sqlFilePath).catch(() => {});
        } catch {}
        
        // Remover do mapa
        runningBackups.delete(backupId);
      } catch (processError) {
        // Continuar mesmo se houver erro ao matar o processo
      }
    } else {
      // Processo não está no Map (pode ter sido perdido em restart do servidor)
      // Tentar encontrar e matar processos mysqldump/docker relacionados ao backup
      try {
        if (backup.file_path) {
          const sqlFilePath = backup.file_path.replace('.gz', '.sql');
          // Limpar arquivo parcial se existir
          await fs.unlink(sqlFilePath).catch(() => {});
        }
      } catch {}
    }
    
    // Sempre atualizar status no banco
    await executeQuery(
      `UPDATE backups SET status = 'failed', error_message = ?, completed_at = NOW() WHERE id = ?`,
      ['Backup cancelado pelo usuário', backupId]
    );
    
    // Remover do mapa se ainda estiver lá
    runningBackups.delete(backupId);
    
    return { success: true, message: 'Backup cancelado com sucesso' };
  } catch (error) {
    // Se for erro conhecido, relançar
    if (error.message.includes('não encontrado') || error.message.includes('não está em execução')) {
      throw error;
    }
    
    // Para outros erros, tentar atualizar o banco mesmo assim
    try {
      await executeQuery(
        `UPDATE backups SET status = 'failed', error_message = ?, completed_at = NOW() WHERE id = ?`,
        [`Erro ao cancelar: ${error.message}`, backupId]
      );
    } catch {}
    
    throw error;
  }
}

// Obter status de um backup em execução
function getBackupStatus(backupId) {
  const backupInfo = runningBackups.get(backupId);
  
  if (!backupInfo) {
    return null;
  }
  
  const elapsed = Math.floor((new Date() - backupInfo.startTime) / 1000);
  
  // Verificar tamanho do arquivo parcial
  let fileSize = 0;
  try {
    const stats = require('fs').statSync(backupInfo.sqlFilePath);
    fileSize = stats.size;
  } catch {}
  
  return {
    running: true,
    elapsed: elapsed,
    fileSize: fileSize,
    fileSizeFormatted: formatBytes(fileSize),
    startTime: backupInfo.startTime
  };
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  formatBytes,
  cancelBackup,
  getBackupStatus,
  getRestoreStatus,
  runningBackups,
  getBackupBaseDir
};

