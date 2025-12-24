/**
 * Rotas de Notificações
 */

const express = require('express');
const { param } = require('express-validator');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { commonValidations } = require('../chamados/chamadosValidator');
const NotificacoesController = require('../../controllers/notificacoes');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('notificacoes'));

// GET /api/notificacoes - Listar notificações
router.get('/', 
  checkPermission('visualizar'),
  ...commonValidations.pagination,
  NotificacoesController.listarNotificacoes
);

// GET /api/notificacoes/contar - Contar não lidas
router.get('/contar',
  checkPermission('visualizar'),
  NotificacoesController.contarNaoLidas
);

// PUT /api/notificacoes/:id/lida - Marcar como lida
// Qualquer usuário autenticado pode marcar suas próprias notificações como lidas
router.put('/:id/lida',
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  NotificacoesController.marcarComoLida
);

// PUT /api/notificacoes/marcar-todas - Marcar todas como lidas
// Qualquer usuário autenticado pode marcar suas próprias notificações como lidas
router.put('/marcar-todas',
  NotificacoesController.marcarTodasComoLidas
);

// DELETE /api/notificacoes/:id - Excluir notificação
// Qualquer usuário autenticado pode excluir suas próprias notificações
router.delete('/:id',
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  NotificacoesController.excluirNotificacao
);

module.exports = router;

