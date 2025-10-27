/**
 * Validações específicas para Produto Genérico
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para produto genérico
const handleValidationErrors = createEntityValidationHandler('produto-generico');

// Middleware para limpar campos vazios
const cleanEmptyFields = (req, res, next) => {
  // Converter campos vazios para null
  const fieldsToClean = [
    'produto_origem_id', 'grupo_id', 'subgrupo_id', 'classe_id', 
    'unidade_medida_id', 'referencia_mercado', 'peso_liquido', 
    'peso_bruto', 'regra_palet', 'informacoes_adicionais',
    'referencia_interna', 'referencia_externa', 'registro_especifico',
    'tipo_registro', 'prazo_validade_padrao', 'unidade_validade',
    'integracao_senior'
  ];
  
  fieldsToClean.forEach(field => {
    if (req.body[field] === '' || req.body[field] === undefined || req.body[field] === 'null') {
      req.body[field] = null;
    }
  });

  // Converter campos numéricos
  if (req.body.codigo && req.body.codigo !== '') {
    req.body.codigo = parseInt(req.body.codigo);
  }

  if (req.body.produto_origem_id && req.body.produto_origem_id !== '') {
    req.body.produto_origem_id = parseInt(req.body.produto_origem_id);
  }

  if (req.body.fator_conversao && req.body.fator_conversao !== '') {
    req.body.fator_conversao = parseFloat(req.body.fator_conversao);
  }

  if (req.body.grupo_id && req.body.grupo_id !== '') {
    req.body.grupo_id = parseInt(req.body.grupo_id);
  }

  if (req.body.subgrupo_id && req.body.subgrupo_id !== '') {
    req.body.subgrupo_id = parseInt(req.body.subgrupo_id);
  }

  if (req.body.classe_id && req.body.classe_id !== '') {
    req.body.classe_id = parseInt(req.body.classe_id);
  }

  if (req.body.unidade_medida_id && req.body.unidade_medida_id !== '') {
    req.body.unidade_medida_id = parseInt(req.body.unidade_medida_id);
  }

  if (req.body.peso_liquido && req.body.peso_liquido !== '') {
    req.body.peso_liquido = parseFloat(req.body.peso_liquido);
  }

  if (req.body.peso_bruto && req.body.peso_bruto !== '') {
    req.body.peso_bruto = parseFloat(req.body.peso_bruto);
  }

  if (req.body.regra_palet && req.body.regra_palet !== '') {
    req.body.regra_palet = parseInt(req.body.regra_palet);
  }

  if (req.body.prazo_validade_padrao && req.body.prazo_validade_padrao !== '') {
    req.body.prazo_validade_padrao = parseInt(req.body.prazo_validade_padrao);
  }

  next();
};

// Validações comuns
const commonValidations = {
  // Validação de ID numérico
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

// Validações específicas para produto genérico
const produtoGenericoValidations = {
  create: [
    cleanEmptyFields,
    
    body('nome')
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome deve ter pelo menos 3 caracteres e no máximo 200 caracteres'),
    
    body('produto_origem_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Produto origem deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Produto origem deve ser selecionado'),
    
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Fator de conversão deve ser um número entre 0.001 e 999999.999'),
    
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Grupo deve ser selecionado'),
    
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Subgrupo deve ser selecionado'),
    
    body('classe_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Classe deve ser selecionada'),
    
    body('unidade_medida_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade de medida deve ser selecionada'),
    
    body('referencia_mercado')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Referência de mercado deve ter no máximo 200 caracteres'),
    
    body('produto_padrao')
      .optional()
      .isIn(['Sim', 'Não'])
      .withMessage('Produto padrão deve ser Sim ou Não'),
    
    body('peso_liquido')
      .optional(),
    
    body('peso_bruto')
      .optional(),
    
    body('regra_palet')
      .optional(),
    
    body('informacoes_adicionais')
      .optional()
      .isLength({ max: 65535 })
      .withMessage('Informações adicionais deve ter no máximo 65535 caracteres'),
    
    body('referencia_interna')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Referência interna deve ter no máximo 200 caracteres'),
    
    body('referencia_externa')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Referência externa deve ter no máximo 200 caracteres'),
    
    body('registro_especifico')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Registro específico deve ter no máximo 200 caracteres'),
    
    body('tipo_registro')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Tipo de registro deve ter no máximo 100 caracteres'),
    
    body('prazo_validade_padrao')
      .optional(),
    
    body('unidade_validade')
      .optional(),
    
    body('integracao_senior')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Integração Senior deve ter no máximo 50 caracteres'),
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ],

  update: [
    cleanEmptyFields,
    
    body('nome')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome deve ter entre 3 e 200 caracteres'),
    
    body('produto_origem_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Produto origem deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Produto origem deve ser selecionado'),
    
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Fator de conversão deve ser um número entre 0.001 e 999999.999'),
    
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Grupo deve ser selecionado'),
    
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Subgrupo deve ser selecionado'),
    
    body('classe_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Classe deve ser selecionada'),
    
    body('unidade_medida_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade de medida deve ser selecionada'),
    
    body('referencia_mercado')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Referência de mercado deve ter no máximo 200 caracteres'),
    
    body('produto_padrao')
      .optional()
      .isIn(['Sim', 'Não'])
      .withMessage('Produto padrão deve ser Sim ou Não'),
    
    body('peso_liquido')
      .optional(),
    
    body('peso_bruto')
      .optional(),
    
    body('regra_palet')
      .optional(),
    
    body('informacoes_adicionais')
      .optional()
      .isLength({ max: 65535 })
      .withMessage('Informações adicionais deve ter no máximo 65535 caracteres'),
    
    body('referencia_interna')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Referência interna deve ter no máximo 200 caracteres'),
    
    body('referencia_externa')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Referência externa deve ter no máximo 200 caracteres'),
    
    body('registro_especifico')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Registro específico deve ter no máximo 200 caracteres'),
    
    body('tipo_registro')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Tipo de registro deve ter no máximo 100 caracteres'),
    
    body('prazo_validade_padrao')
      .optional(),
    
    body('unidade_validade')
      .optional(),
    
    body('integracao_senior')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Integração Senior deve ter no máximo 50 caracteres'),
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ]
};

module.exports = {
  produtoGenericoValidations,
  commonValidations
};
