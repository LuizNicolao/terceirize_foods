const { testConnection } = require('./database');

const initializeApp = async () => {
  console.log('🚀 Inicializando aplicação...');
  
  // Testar conexão com banco
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    console.log('✅ Aplicação inicializada com sucesso!');
    return true;
  } else {
    console.log('❌ Falha na inicialização da aplicação');
    return false;
  }
};

module.exports = { initializeApp };
