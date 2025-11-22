const { exec, spawn } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const { sendTelegram } = require('./telegram');

const execPromise = util.promisify(exec);

// Verificar se rclone está instalado
async function checkRcloneInstalled() {
  try {
    await execPromise('rclone version');
    return true;
  } catch (error) {
    return false;
  }
}

// Obter configuração atual do rclone
async function getRcloneConfig() {
  try {
    const configPath = process.env.RCLONE_CONFIG_PATH || path.join(process.env.HOME || '/root', '.config/rclone/rclone.conf');
    
    // Verificar se arquivo existe
    try {
      await fs.access(configPath);
    } catch {
      return {
        installed: await checkRcloneInstalled(),
        configured: false,
        remotes: []
      };
    }

    // Listar remotos configurados
    const { stdout } = await execPromise('rclone listremotes');
    const remotes = stdout.trim().split('\n').filter(r => r.trim()).map(r => r.replace(':', ''));

    return {
      installed: true,
      configured: remotes.length > 0,
      remotes: remotes,
      defaultRemote: process.env.RCLONE_REMOTE || (remotes.length > 0 ? `${remotes[0]}:` : null)
    };
  } catch (error) {
    return {
      installed: await checkRcloneInstalled(),
      configured: false,
      remotes: [],
      error: error.message
    };
  }
}

// Testar conexão com remoto
async function testRemote(remoteName) {
  try {
    if (!remoteName || !remoteName.includes(':')) {
      throw new Error('Nome do remoto inválido. Use o formato: remotename:');
    }

    // Testar listando o diretório raiz
    await execPromise(`rclone lsd ${remoteName}`, { timeout: 30000 });
    
    return {
      success: true,
      message: 'Conexão com remoto bem-sucedida'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Erro ao testar conexão'
    };
  }
}

// Fazer upload de arquivo para remoto
async function uploadFile(localPath, remotePath, options = {}) {
  try {
    if (!remotePath || !remotePath.includes(':')) {
      throw new Error('Caminho remoto inválido. Use o formato: remotename:path');
    }

    // Verificar se arquivo local existe
    try {
      await fs.access(localPath);
    } catch {
      throw new Error(`Arquivo local não encontrado: ${localPath}`);
    }

    // Extrair diretório remoto (tudo antes do nome do arquivo)
    const lastSlash = remotePath.lastIndexOf('/');
    const remoteDir = lastSlash > remotePath.indexOf(':') ? remotePath.substring(0, lastSlash + 1) : remotePath.substring(0, remotePath.indexOf(':') + 1);
    
    // Criar diretório remoto se não existir
    if (remoteDir && remoteDir !== remotePath) {
      await execPromise(`rclone mkdir "${remoteDir}"`, { timeout: 30000 }).catch(() => {
        // Ignorar erro se diretório já existe
      });
    }

    // Fazer upload - rclone copy copia o arquivo para o diretório remoto
    const progress = options.progress || false;
    const command = `rclone copy "${localPath}" "${remoteDir}" ${progress ? '--progress' : ''} --no-check-dest`;
    
    await execPromise(command, { timeout: 300000 }); // 5 minutos timeout

    return {
      success: true,
      remotePath: remotePath
    };
  } catch (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }
}

// Listar arquivos no remoto
async function listRemoteFiles(remotePath, maxResults = 100) {
  try {
    if (!remotePath || !remotePath.includes(':')) {
      throw new Error('Caminho remoto inválido');
    }

    const { stdout } = await execPromise(`rclone lsjson ${remotePath} --max-depth 1`, { timeout: 30000 });
    const files = JSON.parse(stdout);

    return {
      success: true,
      files: files.slice(0, maxResults)
    };
  } catch (error) {
    return {
      success: false,
      files: [],
      error: error.message
    };
  }
}

// Deletar arquivo do remoto
async function deleteRemoteFile(remotePath) {
  try {
    if (!remotePath || !remotePath.includes(':')) {
      throw new Error('Caminho remoto inválido');
    }

    await execPromise(`rclone delete "${remotePath}"`, { timeout: 30000 });

    return {
      success: true,
      message: 'Arquivo deletado com sucesso'
    };
  } catch (error) {
    throw new Error(`Erro ao deletar arquivo: ${error.message}`);
  }
}

// Baixar arquivo do remoto
async function downloadFile(remotePath, localPath) {
  try {
    if (!remotePath || !remotePath.includes(':')) {
      throw new Error('Caminho remoto inválido');
    }

    // Criar diretório local se não existir
    const localDir = path.dirname(localPath);
    await fs.mkdir(localDir, { recursive: true });

    await execPromise(`rclone copy "${remotePath}" "${localDir}"`, { timeout: 300000 });

    // Verificar se arquivo foi baixado
    const fileName = path.basename(remotePath);
    const downloadedPath = path.join(localDir, fileName);
    
    try {
      await fs.access(downloadedPath);
      return {
        success: true,
        localPath: downloadedPath
      };
    } catch {
      throw new Error('Arquivo não foi baixado corretamente');
    }
  } catch (error) {
    throw new Error(`Erro ao baixar arquivo: ${error.message}`);
  }
}

// Criar configuração de remoto
async function createRemote(config) {
  try {
    const { name, type, credentials } = config;
    
    if (!name || !type) {
      throw new Error('Nome e tipo do remoto são obrigatórios');
    }

    // Construir comando rclone config create
    let command = `rclone config create "${name}" ${type}`;
    
    // Adicionar credenciais baseado no tipo
    if (type === 'drive') {
      // Google Drive
      if (credentials.client_id) command += ` client_id="${credentials.client_id}"`;
      if (credentials.client_secret) command += ` client_secret="${credentials.client_secret}"`;
      if (credentials.token) command += ` token="${credentials.token}"`;
      if (credentials.team_drive) command += ` team_drive="${credentials.team_drive}"`;
    } else if (type === 's3') {
      // AWS S3
      if (credentials.access_key_id) command += ` access_key_id="${credentials.access_key_id}"`;
      if (credentials.secret_access_key) command += ` secret_access_key="${credentials.secret_access_key}"`;
      if (credentials.region) command += ` region="${credentials.region}"`;
      if (credentials.endpoint) command += ` endpoint="${credentials.endpoint}"`;
    } else if (type === 'dropbox') {
      // Dropbox
      if (credentials.app_key) command += ` app_key="${credentials.app_key}"`;
      if (credentials.app_secret) command += ` app_secret="${credentials.app_secret}"`;
      if (credentials.token) command += ` token="${credentials.token}"`;
    } else if (type === 'ftp' || type === 'sftp') {
      // FTP/SFTP
      if (credentials.host) command += ` host="${credentials.host}"`;
      if (credentials.user) command += ` user="${credentials.user}"`;
      if (credentials.pass) command += ` pass="${credentials.pass}"`;
      if (credentials.port) command += ` port="${credentials.port}"`;
    }

    await execPromise(command, { timeout: 30000 });

    return {
      success: true,
      message: `Remoto "${name}" criado com sucesso`
    };
  } catch (error) {
    throw new Error(`Erro ao criar remoto: ${error.message}`);
  }
}

// Deletar remoto
async function deleteRemote(remoteName) {
  try {
    if (!remoteName) {
      throw new Error('Nome do remoto é obrigatório');
    }

    await execPromise(`rclone config delete "${remoteName}"`, { timeout: 30000 });

    return {
      success: true,
      message: `Remoto "${remoteName}" deletado com sucesso`
    };
  } catch (error) {
    throw new Error(`Erro ao deletar remoto: ${error.message}`);
  }
}

// Obter tipos de remoto disponíveis
async function getRemoteTypes() {
  return {
    success: true,
    types: [
      {
        id: 'drive',
        name: 'Google Drive',
        description: 'Armazenamento em nuvem do Google',
        fields: [
          { name: 'client_id', label: 'Client ID', type: 'text', required: true },
          { name: 'client_secret', label: 'Client Secret', type: 'text', required: true },
          { name: 'token', label: 'Token (OAuth)', type: 'textarea', required: false },
          { name: 'team_drive', label: 'Team Drive ID (opcional)', type: 'text', required: false }
        ]
      },
      {
        id: 's3',
        name: 'AWS S3',
        description: 'Amazon Simple Storage Service',
        fields: [
          { name: 'access_key_id', label: 'Access Key ID', type: 'text', required: true },
          { name: 'secret_access_key', label: 'Secret Access Key', type: 'text', required: true },
          { name: 'region', label: 'Região', type: 'text', required: true },
          { name: 'endpoint', label: 'Endpoint (opcional)', type: 'text', required: false }
        ]
      },
      {
        id: 'dropbox',
        name: 'Dropbox',
        description: 'Armazenamento em nuvem Dropbox',
        fields: [
          { name: 'app_key', label: 'App Key', type: 'text', required: true },
          { name: 'app_secret', label: 'App Secret', type: 'text', required: true },
          { name: 'token', label: 'Token (OAuth)', type: 'textarea', required: false }
        ]
      },
      {
        id: 'ftp',
        name: 'FTP',
        description: 'Servidor FTP',
        fields: [
          { name: 'host', label: 'Host', type: 'text', required: true },
          { name: 'user', label: 'Usuário', type: 'text', required: true },
          { name: 'pass', label: 'Senha', type: 'password', required: true },
          { name: 'port', label: 'Porta', type: 'number', required: false, default: 21 }
        ]
      },
      {
        id: 'sftp',
        name: 'SFTP',
        description: 'Servidor SFTP (SSH)',
        fields: [
          { name: 'host', label: 'Host', type: 'text', required: true },
          { name: 'user', label: 'Usuário', type: 'text', required: true },
          { name: 'pass', label: 'Senha', type: 'password', required: true },
          { name: 'port', label: 'Porta', type: 'number', required: false, default: 22 }
        ]
      }
    ]
  };
}

module.exports = {
  checkRcloneInstalled,
  getRcloneConfig,
  testRemote,
  uploadFile,
  listRemoteFiles,
  deleteRemoteFile,
  downloadFile,
  createRemote,
  deleteRemote,
  getRemoteTypes
};

