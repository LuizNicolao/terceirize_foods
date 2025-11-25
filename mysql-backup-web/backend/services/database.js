const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const CONTAINER_NAME = process.env.MYSQL_CONTAINER_NAME || 'terceirize_mysql';

// Configuração do banco de dados do sistema (seguindo padrão DB_* como foods e implantacao)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123456',
  database: process.env.DB_NAME || 'mysql_backup_web',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

let pool = null;

// Inicializar pool de conexões
function initPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Verificar conexão
async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// Executar query
async function executeQuery(query, params = []) {
  if (!pool) initPool();
  try {
    const [rows, fields] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

// Verificar se o container Docker está rodando
async function checkDockerContainer() {
  try {
    const { stdout } = await execPromise(`docker ps --filter name=${CONTAINER_NAME} --format "{{.Names}}"`);
    return stdout.trim() === CONTAINER_NAME;
  } catch (error) {
    return false;
  }
}

// Listar bancos de dados disponíveis no MySQL
async function listAvailableDatabases() {
  try {
    // Primeiro verificar se Docker está disponível
    const isDocker = await checkDockerContainer();
    
    if (isDocker) {
      // Tentar via Docker exec primeiro (mais confiável em ambiente Docker)
      try {
        const command = `docker exec ${CONTAINER_NAME} mysql -u ${dbConfig.user} -p${dbConfig.password} -e "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys', 'mysql_backup_web') ORDER BY SCHEMA_NAME;" -N`;
        
        const { stdout } = await execPromise(command);
        const databases = stdout
          .trim()
          .split('\n')
          .filter(db => db && db.trim().length > 0)
          .map(db => db.trim());
        
        if (databases.length > 0) {
          return databases;
        }
      } catch (dockerError) {
      }
    }
    
    // Se Docker falhar ou não estiver disponível, tentar conexão direta
    try {
      const tempConfig = { ...dbConfig };
      delete tempConfig.database;
      
      const tempPool = mysql.createPool(tempConfig);
      const [databases] = await tempPool.execute(
        `SELECT SCHEMA_NAME as name 
         FROM information_schema.SCHEMATA 
         WHERE SCHEMA_NAME NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys', 'mysql_backup_web')
         ORDER BY SCHEMA_NAME`
      );
      await tempPool.end();
      
      const dbNames = databases.map(db => db.name);
      if (dbNames.length > 0) {
        return dbNames;
      }
    } catch (error) {
    }
    
    // Fallback: retornar os bancos conhecidos
    return ['implantacao_db', 'foods_db', 'cotacao_db', 'cozinha_industrial_db'];
  } catch (error) {
    // Em caso de erro, retornar lista padrão
    return ['implantacao_db', 'foods_db', 'cotacao_db', 'cozinha_industrial_db'];
  }
}

// Inicializar banco de dados do sistema (criar tabelas se não existirem)
async function initSystemDatabase() {
  try {
    // Inicializar o pool com o database (assumindo que o banco já existe)
    if (!pool) initPool();
    
    // Testar conexão com o banco
    try {
      await pool.execute('SELECT 1');
    } catch (error) {
      console.error(`Erro ao conectar ao banco ${dbConfig.database}:`, error.message);
      // Não lançar erro, apenas logar - o banco pode não estar disponível ainda
      return;
    }
    
    // Criar tabela de backups
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS backups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        database_name VARCHAR(255) NOT NULL,
        backup_type ENUM('daily', 'weekly', 'monthly', 'manual') NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT,
        remote_path VARCHAR(500) NULL,
        status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        INDEX idx_database (database_name),
        INDEX idx_type (backup_type),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Adicionar coluna remote_path se não existir (migração)
    try {
      await pool.execute(`ALTER TABLE backups ADD COLUMN remote_path VARCHAR(500) NULL`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }
    
    // Criar tabela de agendamentos
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        database_name VARCHAR(255) NOT NULL,
        schedule_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
        cron_expression VARCHAR(100) NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'ativo',
        selected_tables TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_schedule (database_name, schedule_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Migrações: adicionar colunas se não existirem
    try {
      await pool.execute(`ALTER TABLE schedules ADD COLUMN status VARCHAR(20) DEFAULT 'ativo'`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }
    
    try {
      await pool.execute(`ALTER TABLE schedules ADD COLUMN selected_tables TEXT NULL`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }
    
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    // Não lançar erro para não parar a aplicação
    // A conexão será retentada depois
  }
}

// Inicializar banco de dados primeiro, depois o pool
initSystemDatabase()
  .then(() => {
    initPool();
  })
  .catch(error => {
    // Tentar inicializar pool mesmo assim (pode ser que o banco já exista)
    setTimeout(() => {
      initPool();
    }, 2000);
  });

// Função para obter o pool (garante que está inicializado)
function getPool() {
  if (!pool) {
    initPool();
  }
  return pool;
}

module.exports = {
  get pool() {
    return getPool();
  },
  initPool,
  checkDatabaseConnection,
  executeQuery,
  listAvailableDatabases,
  initSystemDatabase,
  getPool
};

