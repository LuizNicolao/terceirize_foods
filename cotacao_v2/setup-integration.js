#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando integração com sistema principal...\n');

// Configurações
const configs = {
  frontend: {
    envFile: path.join(__dirname, 'frontend', '.env'),
    envContent: `# Configuração de ambiente para o sistema de cotação
# URL da API do sistema principal (onde estão os fornecedores)
REACT_APP_MAIN_API_URL=http://localhost:3001/api

# URL da API do sistema de cotação
REACT_APP_API_URL=http://82.29.57.43:5000

# Configurações adicionais
REACT_APP_ENV=development
`
  },
  backend: {
    envFile: path.join(__dirname, 'backend', '.env'),
    envContent: `# Configurações do Backend
NODE_ENV=development
PORT=5000
JWT_SECRET=sua_chave_secreta_muito_segura_aqui

# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=cotacao_db
DB_PORT=3306

# Configurações do Frontend
REACT_APP_API_URL=http://localhost:5000

# URL da API do sistema principal para integração
MAIN_API_URL=http://localhost:3001/api
`
  }
};

// Função para criar arquivo .env
function createEnvFile(filePath, content) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo ${filePath} já existe. Pulando...`);
      return false;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Arquivo ${filePath} criado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar ${filePath}:`, error.message);
    return false;
  }
}

// Função para verificar se os diretórios existem
function checkDirectories() {
  const dirs = [
    path.join(__dirname, 'frontend'),
    path.join(__dirname, 'backend')
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      console.error(`❌ Diretório não encontrado: ${dir}`);
      return false;
    }
  }
  
  return true;
}

// Função principal
function main() {
  console.log('📁 Verificando estrutura de diretórios...');
  
  if (!checkDirectories()) {
    console.error('❌ Estrutura de diretórios inválida. Execute este script na raiz do projeto.');
    process.exit(1);
  }
  
  console.log('✅ Estrutura de diretórios OK!\n');
  
  console.log('📝 Criando arquivos de configuração...\n');
  
  let created = 0;
  
  // Criar arquivo .env do frontend
  if (createEnvFile(configs.frontend.envFile, configs.frontend.envContent)) {
    created++;
  }
  
  // Criar arquivo .env do backend
  if (createEnvFile(configs.backend.envFile, configs.backend.envContent)) {
    created++;
  }
  
  console.log(`\n📊 Resumo:`);
  console.log(`   - Arquivos criados: ${created}/2`);
  
  if (created > 0) {
    console.log('\n🎉 Configuração concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Ajuste as URLs nos arquivos .env conforme seu ambiente');
    console.log('   2. Certifique-se de que o sistema principal está rodando');
    console.log('   3. Reinicie os serviços do sistema de cotação');
    console.log('   4. Teste a busca de fornecedores nas telas de cotação');
  } else {
    console.log('\n⚠️  Nenhum arquivo foi criado. Verifique se já existem.');
  }
  
  console.log('\n📚 Documentação:');
  console.log('   - Leia o arquivo INTEGRACAO_FORNECEDORES.md para mais detalhes');
  console.log('   - Verifique as configurações de CORS no sistema principal');
  console.log('   - Teste a autenticação entre os sistemas');
}

// Executar script
main(); 