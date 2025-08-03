const axios = require('axios');

// Script para resetar rate limiting em produção
// Uso: node scripts/reset-rate-limit.js [IP_ADDRESS]

const SERVER_URL = process.env.SERVER_URL || 'http://82.29.57.43:3001';
const IP_ADDRESS = process.argv[2] || '127.0.0.1';

async function resetRateLimit() {
  try {
    console.log(`🔄 Tentando resetar rate limiting para IP: ${IP_ADDRESS}`);
    console.log(`🌐 Servidor: ${SERVER_URL}`);
    
    // Fazer requisição para resetar rate limiting
    const response = await axios.post(`${SERVER_URL}/api/reset-rate-limit`, {}, {
      headers: {
        'X-Forwarded-For': IP_ADDRESS,
        'X-Real-IP': IP_ADDRESS
      },
      timeout: 5000
    });
    
    console.log('✅ Rate limiting resetado com sucesso!');
    console.log('📊 Resposta:', response.data);
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Rota de reset não disponível em produção');
      console.log('💡 Soluções:');
      console.log('   1. Reinicie o servidor: docker-compose restart backend');
      console.log('   2. Aguarde 15 minutos para o rate limiting expirar');
      console.log('   3. Configure NODE_ENV=development temporariamente');
    } else {
      console.log('❌ Erro ao resetar rate limiting:', error.message);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  resetRateLimit();
}

module.exports = { resetRateLimit }; 