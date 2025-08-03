const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 12;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Senha:', password);
    console.log('🔑 Hash gerado:', hash);
    console.log('✅ Verificação:', await bcrypt.compare(password, hash));
  } catch (error) {
    console.error('Erro ao gerar hash:', error);
  }
}

generateHash(); 