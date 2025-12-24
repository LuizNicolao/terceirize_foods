/**
 * Rotas de Chamados
 * Implementa padrões RESTful com validação
 */

const express = require('express');
const { param } = require('express-validator');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { chamadoValidations, commonValidations } = require('./chamadosValidator');
const ChamadosController = require('../../controllers/chamados');
const upload = require('../../middleware/upload');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('chamados'));

// GET /api/chamados - Listar chamados com paginação e busca
router.get('/', 
  checkScreenPermission('chamados', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  ChamadosController.listarChamados
);

// GET /api/chamados/sistema/:sistema - Buscar chamados por sistema
router.get('/sistema/:sistema',
  checkScreenPermission('chamados', 'visualizar'),
  ChamadosController.buscarChamadosPorSistema
);

// ===== ROTAS DE COMENTÁRIOS (devem vir antes de :id) =====

// GET /api/chamados/:chamadoId/comentarios - Listar comentários de um chamado
router.get('/:chamadoId/comentarios',
  checkScreenPermission('chamados', 'visualizar'),
  param('chamadoId').isInt({ min: 1 }).withMessage('ID do chamado deve ser um número inteiro positivo'),
  ...commonValidations.pagination,
  ChamadosController.listarComentarios
);

// POST /api/chamados/:chamadoId/comentarios - Criar comentário
router.post('/:chamadoId/comentarios',
  checkScreenPermission('chamados', 'criar'),
  param('chamadoId').isInt({ min: 1 }).withMessage('ID do chamado deve ser um número inteiro positivo'),
  chamadoValidations.comentario.create,
  ChamadosController.criarComentario
);

// PUT /api/chamados/:chamadoId/comentarios/:comentarioId - Atualizar comentário
router.put('/:chamadoId/comentarios/:comentarioId',
  checkScreenPermission('chamados', 'editar'),
  chamadoValidations.comentario.update,
  ChamadosController.atualizarComentario
);

// DELETE /api/chamados/:chamadoId/comentarios/:comentarioId - Excluir comentário
router.delete('/:chamadoId/comentarios/:comentarioId',
  checkScreenPermission('chamados', 'excluir'),
  param('chamadoId').isInt({ min: 1 }).withMessage('ID do chamado deve ser um número inteiro positivo'),
  param('comentarioId').isInt({ min: 1 }).withMessage('ID do comentário deve ser um número inteiro positivo'),
  ChamadosController.excluirComentario
);

// ===== ROTAS DE ANEXOS =====

// GET /api/chamados/:chamadoId/anexos - Listar anexos de um chamado
router.get('/:chamadoId/anexos',
  checkScreenPermission('chamados', 'visualizar'),
  param('chamadoId').isInt({ min: 1 }).withMessage('ID do chamado deve ser um número inteiro positivo'),
  ChamadosController.listarAnexos
);

// POST /api/chamados/:chamadoId/anexos - Upload de anexo
router.post('/:chamadoId/anexos',
  checkScreenPermission('chamados', 'criar'),
  param('chamadoId').isInt({ min: 1 }).withMessage('ID do chamado deve ser um número inteiro positivo'),
  upload.single('arquivo'),
  ChamadosController.uploadAnexo
);

// GET /api/chamados/:chamadoId/anexos/:anexoId/download - Download de anexo
router.get('/:chamadoId/anexos/:anexoId/download',
  checkScreenPermission('chamados', 'visualizar'),
  param('chamadoId').isInt({ min: 1 }).withMessage('ID do chamado deve ser um número inteiro positivo'),
  param('anexoId').isInt({ min: 1 }).withMessage('ID do anexo deve ser um número inteiro positivo'),
  ChamadosController.downloadAnexo
);

// GET /api/chamados/:chamadoId/historico - Listar histórico de um chamado
router.get('/:chamadoId/historico',
  checkScreenPermission('chamados', 'visualizar'),
  param('chamadoId').isInt({ min: 1 }).withMessage('ID do chamado deve ser um número inteiro positivo'),
  ...commonValidations.pagination,
  ChamadosController.listarHistorico
);

// DELETE /api/chamados/:chamadoId/anexos/:anexoId - Excluir anexo
router.delete('/:chamadoId/anexos/:anexoId',
  checkScreenPermission('chamados', 'excluir'),
  param('chamadoId').isInt({ min: 1 }).withMessage('ID do chamado deve ser um número inteiro positivo'),
  param('anexoId').isInt({ min: 1 }).withMessage('ID do anexo deve ser um número inteiro positivo'),
  ChamadosController.excluirAnexo
);

// GET /api/chamados/:id - Buscar chamado por ID
router.get('/:id', 
  checkScreenPermission('chamados', 'visualizar'),
  commonValidations.id,
  ChamadosController.buscarChamadoPorId
);

// POST /api/chamados - Criar novo chamado
router.post('/', 
  checkScreenPermission('chamados', 'criar'),
  chamadoValidations.create,
  ChamadosController.criarChamado
);

// PUT /api/chamados/:id - Atualizar chamado
router.put('/:id', 
  checkScreenPermission('chamados', 'editar'),
  chamadoValidations.update,
  ChamadosController.atualizarChamado
);

// DELETE /api/chamados/:id - Excluir chamado (soft delete)
router.delete('/:id', 
  checkScreenPermission('chamados', 'excluir'),
  commonValidations.id,
  ChamadosController.excluirChamado
);

module.exports = router;
