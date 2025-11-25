const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
// Carregar arquivo .env baseado no ambiente (seguindo padrão do implantacao)
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? 'env.production' : 'env.development' });

const app = express();
// Porta padrão 3006 para desenvolvimento local, mas Docker usa PORT=3000 do docker-compose.yml
const PORT = process.env.PORT || 3006;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes públicas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/health', require('./routes/health'));

// Rotas protegidas - requerem autenticação
const { authenticateToken } = require('./middleware/auth');
app.use('/api/databases', authenticateToken, require('./routes/databases'));
app.use('/api/backups', authenticateToken, require('./routes/backups'));
app.use('/api/schedules', authenticateToken, require('./routes/schedules'));
app.use('/api/settings', authenticateToken, require('./routes/settings'));
app.use('/api/rclone', authenticateToken, require('./routes/rclone'));

// Initialize scheduler
const { initScheduler } = require('./services/scheduler');
setTimeout(() => {
  initScheduler().catch(() => {});
}, 5000); // Aguardar 5s para o banco estar pronto

// Error handling
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MySQL Backup Web API running on port ${PORT}`);
  console.log(`📅 Timezone: ${process.env.TZ || 'UTC'}`);
});

module.exports = app;

