const express = require('express');
const router = express.Router();
const { checkDatabaseConnection } = require('../services/database');

router.get('/', async (req, res) => {
  try {
    const dbStatus = await checkDatabaseConnection();
    
    res.json({
      success: true,
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

