const express = require('express');
const router = express.Router();
const { listAvailableDatabases, executeQuery } = require('../services/database');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'root123456';
const CONTAINER_NAME = process.env.MYSQL_CONTAINER_NAME || 'terceirize_mysql';

// Listar bancos de dados disponíveis
router.get('/', async (req, res) => {
  try {
    const databases = await listAvailableDatabases();
    res.json({
      success: true,
      data: databases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Listar tabelas de um banco de dados
router.get('/:databaseName/tables', async (req, res) => {
  try {
    const { databaseName } = req.params;
    
    // Verificar se está usando Docker
    const isDocker = await checkDockerContainer();
    
    let tables = [];
    
    if (isDocker) {
      // Via Docker exec
      const command = `docker exec ${CONTAINER_NAME} mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e "USE ${databaseName}; SHOW TABLES;"`;
      const { stdout } = await execPromise(command);
      
      // Parse da saída: primeira linha é o cabeçalho, resto são os nomes das tabelas
      const lines = stdout.trim().split('\n').slice(1);
      tables = lines.map(line => line.trim()).filter(Boolean);
    } else {
      // Conexão direta
      const pool = require('../services/database').getPool();
      const tempConfig = { ...pool.config.connectionConfig };
      tempConfig.database = databaseName;
      
      const tempPool = require('mysql2').createPool(tempConfig);
      const [rows] = await tempPool.execute(
        `SELECT TABLE_NAME as table_name 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = ? 
         ORDER BY TABLE_NAME`,
        [databaseName]
      );
      await tempPool.end();
      
      tables = rows.map(row => row.table_name);
    }
    
    res.json({
      success: true,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Função auxiliar para verificar Docker
async function checkDockerContainer() {
  try {
    const { stdout } = await execPromise(`docker ps --filter name=${CONTAINER_NAME} --format "{{.Names}}"`);
    return stdout.trim() === CONTAINER_NAME;
  } catch (error) {
    return false;
  }
}

module.exports = router;

