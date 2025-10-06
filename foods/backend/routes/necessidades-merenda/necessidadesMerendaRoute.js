const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { uploadPDF, handleUploadError } = require('../../middleware/uploadPDF');

// Importar controllers
const {
  listarNecessidades,
  buscarNecessidadePorId,
  criarNecessidade,
  atualizarNecessidade,
  excluirNecessidade,
  atualizarStatusMultiplas,
  processarPDFEGerarNecessidades,
  gerarNecessidadesDeCardapioExistente,
  exportarParaExcel,
  exportarListaCompras,
  exportarRelatorioCustos
} = require('../../controllers/necessidades-merenda');

// Middleware de validação
const necessidadesValidations = require('./necessidadesMerendaValidator');

// ===== ROTAS DE TESTE (SEM AUTENTICAÇÃO) =====

// Rota temporária para teste (sem autenticação)
router.get('/test', (req, res) => {
  console.log('🧪 Rota de teste chamada!');
  res.json({
    success: true,
    message: 'Rota de teste funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota temporária para teste de listagem (sem autenticação)
router.get('/test-list', async (req, res) => {
  try {
    console.log('🧪 Rota de teste de listagem chamada!');
    const { executeQuery } = require('../../config/database');
    
    const necessidades = await executeQuery('SELECT COUNT(*) as total FROM necessidades_cardapio');
    
    res.json({
      success: true,
      message: 'Rota de teste de listagem funcionando',
      data: necessidades,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro na rota de teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na rota de teste',
      error: error.message
    });
  }
});

// Rota temporária para teste de processamento (sem autenticação)
router.post('/test-process', async (req, res) => {
  try {
    console.log('🧪 Rota de teste de processamento chamada!');
    console.log('📊 Body recebido:', req.body);
    console.log('📁 Files recebidos:', req.files);
    
    res.json({
      success: true,
      message: 'Rota de teste de processamento funcionando',
      body: req.body,
      files: req.files,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro na rota de teste de processamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na rota de teste de processamento',
      error: error.message
    });
  }
});

// Aplicar autenticação em todas as outras rotas
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('necessidades_merenda'));

// ===== ROTAS CRUD =====

/**
 * @route GET /necessidades-merenda
 * @desc Listar necessidades da merenda com paginação e filtros
 */
router.get('/',
  checkScreenPermission('necessidades_merenda', 'visualizar'),
  necessidadesValidations.listar,
  listarNecessidades
);

/**
 * @route GET /necessidades-merenda/:id
 * @desc Buscar necessidade por ID
 */
router.get('/:id',
  checkScreenPermission('necessidades_merenda', 'visualizar'),
  necessidadesValidations.buscarPorId,
  auditMiddleware(AUDIT_ACTIONS.READ, 'necessidades_merenda'),
  buscarNecessidadePorId
);

/**
 * @route POST /necessidades-merenda
 * @desc Criar nova necessidade
 */
router.post('/',
  checkScreenPermission('necessidades_merenda', 'criar'),
  necessidadesValidations.criar,
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'necessidades_merenda'),
  criarNecessidade
);

/**
 * @route PUT /necessidades-merenda/:id
 * @desc Atualizar necessidade
 */
router.put('/:id',
  checkScreenPermission('necessidades_merenda', 'editar'),
  necessidadesValidations.atualizar,
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'necessidades_merenda'),
  atualizarNecessidade
);

/**
 * @route DELETE /necessidades-merenda/:id
 * @desc Excluir necessidade
 */
router.delete('/:id',
  checkScreenPermission('necessidades_merenda', 'excluir'),
  necessidadesValidations.excluir,
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'necessidades_merenda'),
  excluirNecessidade
);

// ===== ROTAS DE GERAÇÃO =====

/**
 * @route POST /necessidades-merenda/gerar-de-pdf
 * @desc Gerar necessidades a partir de PDF de cardápio
 */
router.post('/gerar-de-pdf',
  uploadPDF,
  handleUploadError,
  checkScreenPermission('necessidades_merenda', 'criar'),
  necessidadesValidations.gerarDePDF,
  auditMiddleware('necessidades_merenda', 'CREATE'),
  processarPDFEGerarNecessidades
);

/**
 * @route POST /necessidades-merenda/gerar-de-cardapio/:cardapio_id
 * @desc Gerar necessidades a partir de cardápio existente
 */
router.post('/gerar-de-cardapio/:cardapio_id',
  checkScreenPermission('necessidades_merenda', 'visualizar'),
  necessidadesValidations.gerarDeCardapio,
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'necessidades_merenda'),
  gerarNecessidadesDeCardapioExistente
);

// ===== ROTAS DE EXPORTAÇÃO =====

/**
 * @route GET /necessidades-merenda/exportar/excel
 * @desc Exportar necessidades para Excel
 */
router.get('/exportar/excel',
  checkScreenPermission('necessidades_merenda', 'visualizar'),
  necessidadesValidations.exportar,
  exportarParaExcel
);

/**
 * @route GET /necessidades-merenda/exportar/pdf
 * @desc Exportar necessidades para PDF
 */
router.get('/exportar/pdf',
  checkScreenPermission('necessidades_merenda', 'visualizar'),
  necessidadesValidations.exportar,
  exportarRelatorioCustos
);

/**
 * @route GET /necessidades-merenda/exportar/lista-compras
 * @desc Exportar lista de compras
 */
router.get('/exportar/lista-compras',
  checkScreenPermission('necessidades_merenda', 'visualizar'),
  necessidadesValidations.exportar,
  exportarListaCompras
);

// ===== ROTAS DE STATUS =====

/**
 * @route PATCH /necessidades-merenda/alterar-status
 * @desc Alterar status de múltiplas necessidades
 */
router.patch('/alterar-status',
  checkScreenPermission('necessidades_merenda', 'visualizar'),
  necessidadesValidations.alterarStatus,
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'necessidades_merenda'),
  atualizarStatusMultiplas
);

module.exports = router;
