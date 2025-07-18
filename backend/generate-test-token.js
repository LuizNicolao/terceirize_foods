const jwt = require('jsonwebtoken');
const { executeQuery } = require('./config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'foods_jwt_secret_key_2024';

async function generateTestToken() {
  try {
    // Buscar um usuário ativo
    const users = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso FROM usuarios WHERE status = "ativo" LIMIT 1'
    );

    if (users.length === 0) {
      console.log('❌ Nenhum usuário ativo encontrado no banco');
      return;
    }

    const user = users[0];
    console.log('👤 Usuário encontrado:', user.nome, `(${user.email})`);

    // Gerar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('\n✅ Token gerado com sucesso!');
    console.log('\n🔑 Token:', token);
    console.log('\n📋 Comando curl para testar:');
    console.log(`curl -X GET "http://82.29.57.43:3001/api/fornecedores?page=1&limit=5" -H "Authorization: Bearer ${token}"`);

  } catch (error) {
    console.error('❌ Erro ao gerar token:', error);
  }
}

generateTestToken(); 