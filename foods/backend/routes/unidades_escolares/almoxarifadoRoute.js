const express = require('express');
const router = express.Router();
const AlmoxarifadoController = require('../../controllers/unidades-escolares/AlmoxarifadoController');
const { authenticateToken } = require('../../middleware/auth');

// Rotas para almoxarifado de unidades escolares
router.get('/:unidadeEscolarId/almoxarifado', authenticateToken, AlmoxarifadoController.buscarAlmoxarifado);
router.post('/:unidadeEscolarId/almoxarifado', authenticateToken, AlmoxarifadoController.criarAlmoxarifado);
router.put('/almoxarifado/:id', authenticateToken, AlmoxarifadoController.atualizarAlmoxarifado);
router.delete('/almoxarifado/:id', authenticateToken, AlmoxarifadoController.excluirAlmoxarifado);

module.exports = router;
