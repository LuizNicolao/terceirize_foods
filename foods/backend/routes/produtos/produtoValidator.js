/**
 * Validador de Produtos
 * Implementa validações para operações CRUD de produtos
 */

const { body, param, query, validationResult } = require('express-validator');

// Middleware para tratar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
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

// Validações específicas para produtos
const produtoValidations = {
  create: [
    body('nome')
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome do produto deve ter entre 3 e 200 caracteres'),
    body('codigo_produto')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('Código do produto deve ter entre 1 e 10 caracteres'),
    body('codigo_barras')
      .optional()
      .isLength({ min: 8, max: 50 })
      .withMessage('Código de barras deve ter entre 8 e 50 caracteres'),
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Fator de conversão deve ser um número positivo'),
    body('referencia_interna')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Referência interna deve ter entre 1 e 100 caracteres'),
    body('referencia_externa')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Referência externa deve ter entre 1 e 100 caracteres'),
    body('referencia_mercado')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Referência de mercado deve ter entre 1 e 200 caracteres'),
    body('unidade_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade deve ser selecionada'),
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
    body('nome_generico_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Produto genérico deve ser selecionado'),
    body('marca_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Marca deve ser selecionada'),
    body('peso_liquido')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso líquido deve ser um número positivo'),
    body('peso_bruto')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso bruto deve ser um número positivo'),
    body('fabricante')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Fabricante deve ter entre 1 e 100 caracteres'),
    body('informacoes_adicionais')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Informações adicionais deve ter entre 1 e 1000 caracteres'),
    body('foto_produto')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Foto do produto deve ter entre 1 e 255 caracteres'),
    body('prazo_validade')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Prazo de validade deve ser um número inteiro positivo'),
    body('unidade_validade')
      .optional()
      .isIn(['DIAS', 'SEMANAS', 'MESES', 'ANOS'])
      .withMessage('Unidade de validade deve ser DIAS, SEMANAS, MESES ou ANOS'),
    body('regra_palet_un')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Regra palet deve ser um número inteiro positivo'),
    body('ficha_homologacao')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Ficha de homologação deve ter entre 1 e 50 caracteres'),
    body('registro_especifico')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Registro específico deve ter entre 1 e 200 caracteres'),
    body('comprimento')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Comprimento deve ser um número positivo'),
    body('largura')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Largura deve ser um número positivo'),
    body('altura')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Altura deve ser um número positivo'),
    body('volume')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Volume deve ser um número positivo'),
    body('integracao_senior')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Integração Senior deve ter entre 1 e 50 caracteres'),
    body('ncm')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('NCM deve ter entre 1 e 10 caracteres'),
    body('cest')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('CEST deve ter entre 1 e 10 caracteres'),
    body('cfop')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('CFOP deve ter entre 1 e 10 caracteres'),
    body('ean')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('EAN deve ter entre 1 e 50 caracteres'),
    body('cst_icms')
      .optional()
      .isLength({ min: 1, max: 3 })
      .withMessage('CST ICMS deve ter entre 1 e 3 caracteres'),
    body('csosn')
      .optional()
      .isLength({ min: 1, max: 3 })
      .withMessage('CSOSN deve ter entre 1 e 3 caracteres'),
    body('aliquota_icms')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alíquota ICMS deve ser um número entre 0 e 100'),
    body('aliquota_ipi')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alíquota IPI deve ser um número entre 0 e 100'),
    body('aliquota_pis')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alíquota PIS deve ser um número entre 0 e 100'),
    body('aliquota_cofins')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alíquota COFINS deve ser um número entre 0 e 100'),
    body('tipo_registro')
      .optional()
      .isIn(['ANVISA', 'MAPA', 'OUTROS'])
      .withMessage('Tipo de registro deve ser ANVISA, MAPA ou OUTROS'),
    body('embalagem_secundaria_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Embalagem secundária deve ser selecionada'),
    body('fator_conversao_embalagem')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Fator de conversão da embalagem deve ser um número inteiro positivo'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('nome')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome do produto deve ter entre 3 e 200 caracteres'),
    body('codigo_produto')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('Código do produto deve ter entre 1 e 10 caracteres'),
    body('codigo_barras')
      .optional()
      .isLength({ min: 8, max: 50 })
      .withMessage('Código de barras deve ter entre 8 e 50 caracteres'),
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Fator de conversão deve ser um número positivo'),
    body('referencia_interna')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Referência interna deve ter entre 1 e 100 caracteres'),
    body('referencia_externa')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Referência externa deve ter entre 1 e 100 caracteres'),
    body('referencia_mercado')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Referência de mercado deve ter entre 1 e 200 caracteres'),
    body('unidade_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade deve ser selecionada'),
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
    body('nome_generico_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Produto genérico deve ser selecionado'),
    body('marca_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Marca deve ser selecionada'),
    body('peso_liquido')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso líquido deve ser um número positivo'),
    body('peso_bruto')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso bruto deve ser um número positivo'),
    body('fabricante')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Fabricante deve ter entre 1 e 100 caracteres'),
    body('informacoes_adicionais')
      .optional()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Informações adicionais deve ter entre 1 e 1000 caracteres'),
    body('foto_produto')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Foto do produto deve ter entre 1 e 255 caracteres'),
    body('prazo_validade')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Prazo de validade deve ser um número inteiro positivo'),
    body('unidade_validade')
      .optional()
      .isIn(['DIAS', 'SEMANAS', 'MESES', 'ANOS'])
      .withMessage('Unidade de validade deve ser DIAS, SEMANAS, MESES ou ANOS'),
    body('regra_palet_un')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Regra palet deve ser um número inteiro positivo'),
    body('ficha_homologacao')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Ficha de homologação deve ter entre 1 e 50 caracteres'),
    body('registro_especifico')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Registro específico deve ter entre 1 e 200 caracteres'),
    body('comprimento')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Comprimento deve ser um número positivo'),
    body('largura')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Largura deve ser um número positivo'),
    body('altura')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Altura deve ser um número positivo'),
    body('volume')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Volume deve ser um número positivo'),
    body('integracao_senior')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Integração Senior deve ter entre 1 e 50 caracteres'),
    body('ncm')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('NCM deve ter entre 1 e 10 caracteres'),
    body('cest')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('CEST deve ter entre 1 e 10 caracteres'),
    body('cfop')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('CFOP deve ter entre 1 e 10 caracteres'),
    body('ean')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('EAN deve ter entre 1 e 50 caracteres'),
    body('cst_icms')
      .optional()
      .isLength({ min: 1, max: 3 })
      .withMessage('CST ICMS deve ter entre 1 e 3 caracteres'),
    body('csosn')
      .optional()
      .isLength({ min: 1, max: 3 })
      .withMessage('CSOSN deve ter entre 1 e 3 caracteres'),
    body('aliquota_icms')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alíquota ICMS deve ser um número entre 0 e 100'),
    body('aliquota_ipi')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alíquota IPI deve ser um número entre 0 e 100'),
    body('aliquota_pis')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alíquota PIS deve ser um número entre 0 e 100'),
    body('aliquota_cofins')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Alíquota COFINS deve ser um número entre 0 e 100'),
    body('tipo_registro')
      .optional()
      .isIn(['ANVISA', 'MAPA', 'OUTROS'])
      .withMessage('Tipo de registro deve ser ANVISA, MAPA ou OUTROS'),
    body('embalagem_secundaria_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Embalagem secundária deve ser selecionada'),
    body('fator_conversao_embalagem')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Fator de conversão da embalagem deve ser um número inteiro positivo'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

module.exports = {
  produtoValidations,
  commonValidations,
  handleValidationErrors
}; 