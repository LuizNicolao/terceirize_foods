const { body, param, query, validationResult } = require('express-validator');

// Handler de validação simples para necessidades da merenda
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validações comuns
const commonValidations = {
  // Validação de ID
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),
  
  // Validação de busca
  search: query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),
  
  // Validação de paginação
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100')
  ]
};

// Validadores para Necessidades da Merenda

const listar = [
  // Validação simplificada para listagem
  handleValidationErrors
];

const buscarPorId = [
  commonValidations.id,
  handleValidationErrors
];

const criar = [
  body('cardapio_id').isInt({ min: 1 }).withMessage('ID do cardápio é obrigatório'),
  body('receita_id').isInt({ min: 1 }).withMessage('ID da receita é obrigatório'),
  body('data').isISO8601().withMessage('Data é obrigatória e deve estar no formato ISO'),
  body('produto_id').isInt({ min: 1 }).withMessage('ID do produto é obrigatório'),
  body('quantidade_total').isFloat({ min: 0 }).withMessage('Quantidade total deve ser um número positivo'),
  body('quantidade_per_capita').isFloat({ min: 0 }).withMessage('Quantidade per capita deve ser um número positivo'),
  body('efetivo_padrao').isInt({ min: 0 }).withMessage('Efetivo padrão deve ser um número inteiro não negativo'),
  body('efetivo_nae').isInt({ min: 0 }).withMessage('Efetivo NAE deve ser um número inteiro não negativo'),
  body('status').optional().isIn(['pendente', 'aprovado', 'rejeitado', 'ativo']).withMessage('Status inválido'),
  body('observacoes').optional().isString().withMessage('Observações devem ser uma string'),
  handleValidationErrors
];

const atualizar = [
  commonValidations.id,
  body('quantidade_total').optional().isFloat({ min: 0 }).withMessage('Quantidade total deve ser um número positivo'),
  body('quantidade_per_capita').optional().isFloat({ min: 0 }).withMessage('Quantidade per capita deve ser um número positivo'),
  body('efetivo_padrao').optional().isInt({ min: 0 }).withMessage('Efetivo padrão deve ser um número inteiro não negativo'),
  body('efetivo_nae').optional().isInt({ min: 0 }).withMessage('Efetivo NAE deve ser um número inteiro não negativo'),
  body('status').optional().isIn(['pendente', 'aprovado', 'rejeitado', 'ativo']).withMessage('Status inválido'),
  body('observacoes').optional().isString().withMessage('Observações devem ser uma string'),
  handleValidationErrors
];

const excluir = [
  commonValidations.id,
  handleValidationErrors
];

const gerarDePDF = [
  // Validação flexível para os diferentes tipos de seleção
  body('filiais_ids').optional().isString().withMessage('IDs das filiais devem ser uma string'),
  body('unidades_ids').optional().isString().withMessage('IDs das unidades devem ser uma string'),
  body('rotas_ids').optional().isString().withMessage('IDs das rotas devem ser uma string'),
  
  // Pelo menos um dos tipos de seleção deve estar presente
  body().custom((value, { req }) => {
    console.log('🔍 Validação customizada - Body recebido:', req.body);
    const { filiais_ids, unidades_ids, rotas_ids } = req.body;
    console.log('🔍 Validação customizada - filiais_ids:', filiais_ids);
    console.log('🔍 Validação customizada - unidades_ids:', unidades_ids);
    console.log('🔍 Validação customizada - rotas_ids:', rotas_ids);
    
    if (!filiais_ids && !unidades_ids && !rotas_ids) {
      console.log('❌ Validação customizada - Erro: Nenhum tipo de seleção fornecido');
      throw new Error('Pelo menos um tipo de seleção deve ser fornecido (filiais_ids, unidades_ids ou rotas_ids)');
    }
    console.log('✅ Validação customizada - Passou na validação');
    return true;
  }),
  handleValidationErrors
];

const gerarDeCardapio = [
  param('cardapio_id').isInt({ min: 1 }).withMessage('ID do cardápio é obrigatório'),
  body('unidade_escolar_id').optional().isInt({ min: 1 }).withMessage('ID da unidade escolar inválido'),
  body('tipo_geracao').optional().isIn(['individual', 'filial']).withMessage('Tipo de geração inválido')
];

const exportar = [
  query('formato').optional().isIn(['xlsx', 'pdf', 'csv']).withMessage('Formato inválido'),
  query('tipo').optional().isIn(['completo', 'resumido', 'lista_compras']).withMessage('Tipo de exportação inválido'),
  query('data_inicio').optional().isISO8601().withMessage('Data de início inválida'),
  query('data_fim').optional().isISO8601().withMessage('Data de fim inválida'),
  query('unidade_escolar_id').optional().isInt({ min: 1 }).withMessage('ID da unidade escolar inválido'),
  query('status').optional().isIn(['pendente', 'aprovado', 'rejeitado', 'ativo']).withMessage('Status inválido')
];

const alterarStatus = [
  body('ids').isArray({ min: 1 }).withMessage('IDs são obrigatórios'),
  body('ids.*').isInt({ min: 1 }).withMessage('Cada ID deve ser um número inteiro positivo'),
  body('status').isIn(['pendente', 'aprovado', 'rejeitado', 'ativo']).withMessage('Status inválido'),
  body('observacoes').optional().isString().withMessage('Observações devem ser uma string')
];

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
  gerarDePDF,
  gerarDeCardapio,
  exportar,
  alterarStatus,
  commonValidations
};
