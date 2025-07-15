const bcrypt = require('bcryptjs');
const { executeQuery, testConnection } = require('../config/database');

const createAdminUser = async () => {
  try {
    console.log('🔗 Testando conexão com banco de dados...');
    await testConnection();

    console.log('👤 Criando usuário administrador...');

    // Verificar se já existe um usuário administrador
    const existingAdmin = await executeQuery(
      'SELECT id FROM usuarios WHERE tipo_de_acesso = "administrador" LIMIT 1'
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Usuário administrador já existe!');
      return;
    }

    // Dados do administrador padrão
    const adminData = {
      nome: 'Administrador',
      email: 'admin@foods.com',
      senha: 'admin123456',
      nivel_de_acesso: 'III',
      tipo_de_acesso: 'administrador',
      status: 'ativo'
    };

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(adminData.senha, 12);

    // Inserir usuário administrador
    const result = await executeQuery(
      'INSERT INTO usuarios (nome, email, senha, nivel_de_acesso, tipo_de_acesso, status) VALUES (?, ?, ?, ?, ?, ?)',
      [adminData.nome, adminData.email, hashedPassword, adminData.nivel_de_acesso, adminData.tipo_de_acesso, adminData.status]
    );

    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Senha:', adminData.senha);
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error.message);
    process.exit(1);
  }
};

// Executar script
createAdminUser().then(() => {
  console.log('🎉 Script concluído!');
  process.exit(0);
}); 