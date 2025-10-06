/**
 * Rotas de Consulta de CEP
 * Endpoints compartilhados para consulta de endereço via CEP
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const CepSearchController = require('../../controllers/shared/CepSearchController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);

// GET /api/shared/buscar-cep/:cep - Consultar CEP via API externa
router.get('/buscar-cep/:cep', 
  checkPermission('visualizar'),
  CepSearchController.buscarCEP
);

module.exports = router;
