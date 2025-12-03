/**
 * Validações específicas para Ficha Homologação
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para ficha homologação
const handleValidationErrors = createEntityValidationHandler('ficha-homologacao');

// Middleware para limpar campos vazios e converter para uppercase
const cleanEmptyFields = (req, res, next) => {
  // Converter campos vazios para null
  const fieldsToClean = [
    'produto_generico_id', 'fornecedor_id', 'unidade_medida_id',
    'avaliador_id', 'composicao', 'fabricante', 'lote', 'foto_embalagem',
    'foto_produto_cru', 'foto_produto_cozido', 'conclusao', 'resultado_final', 'pdf_avaliacao_antiga',
    'peso_valor', 'peso_cru_valor', 'peso_cozido_valor', 'fator_coccao_valor',
    'cor_observacao', 'odor_observacao', 'sabor_observacao', 'aparencia_observacao'
  ];
  
  fieldsToClean.forEach(field => {
    if (req.body[field] === '' || req.body[field] === undefined || req.body[field] === 'null') {
      req.body[field] = null;
    }
  });

  // Converter campos de texto para uppercase
  if (req.body.marca && typeof req.body.marca === 'string') {
    req.body.marca = req.body.marca.toUpperCase().trim();
  }
  if (req.body.fabricante && typeof req.body.fabricante === 'string') {
    req.body.fabricante = req.body.fabricante.toUpperCase().trim();
  }

  // Converter campos numéricos apenas se ainda forem strings (parseFormData já converteu se necessário)
  if (req.body.produto_generico_id && typeof req.body.produto_generico_id === 'string' && req.body.produto_generico_id !== '') {
    const numValue = parseInt(req.body.produto_generico_id, 10);
    if (!isNaN(numValue)) {
      req.body.produto_generico_id = numValue;
    }
  }

  if (req.body.fornecedor_id && typeof req.body.fornecedor_id === 'string' && req.body.fornecedor_id !== '') {
    const numValue = parseInt(req.body.fornecedor_id, 10);
    if (!isNaN(numValue)) {
      req.body.fornecedor_id = numValue;
    }
  }

  if (req.body.unidade_medida_id && typeof req.body.unidade_medida_id === 'string' && req.body.unidade_medida_id !== '') {
    const numValue = parseInt(req.body.unidade_medida_id, 10);
    if (!isNaN(numValue)) {
      req.body.unidade_medida_id = numValue;
    }
  }

  if (req.body.avaliador_id && typeof req.body.avaliador_id === 'string' && req.body.avaliador_id !== '') {
    const numValue = parseInt(req.body.avaliador_id, 10);
    if (!isNaN(numValue)) {
      req.body.avaliador_id = numValue;
    }
  }

  // Converter campos decimais apenas se ainda forem strings
  if (req.body.peso_valor && typeof req.body.peso_valor === 'string' && req.body.peso_valor !== '' && req.body.peso_valor !== 'null') {
    const numValue = parseFloat(req.body.peso_valor);
    if (!isNaN(numValue)) {
      req.body.peso_valor = numValue;
    }
  }
  if (req.body.peso_cru_valor && typeof req.body.peso_cru_valor === 'string' && req.body.peso_cru_valor !== '') {
    const numValue = parseFloat(req.body.peso_cru_valor);
    if (!isNaN(numValue)) {
      req.body.peso_cru_valor = numValue;
    }
  }
  if (req.body.peso_cozido_valor && typeof req.body.peso_cozido_valor === 'string' && req.body.peso_cozido_valor !== '') {
    const numValue = parseFloat(req.body.peso_cozido_valor);
    if (!isNaN(numValue)) {
      req.body.peso_cozido_valor = numValue;
    }
  }
  if (req.body.fator_coccao_valor && typeof req.body.fator_coccao_valor === 'string' && req.body.fator_coccao_valor !== '') {
    const numValue = parseFloat(req.body.fator_coccao_valor);
    if (!isNaN(numValue)) {
      req.body.fator_coccao_valor = numValue;
    }
  }

  next();
};

// Validações comuns
const commonValidations = {
  // Validação de ID numérico
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID deve ser um número inteiro positivo')
  ],

  // Validação de busca
  search: [
    query('search')
      .optional()
      .isString()
      .withMessage('Termo de busca deve ser uma string')
      .trim()
  ],

  // Validação de paginação
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limite deve ser um número entre 1 e 1000')
  ]
};

// Validações específicas para criação
const fichaHomologacaoValidations = {
  create: [
    cleanEmptyFields,
    body('tipo')
      .notEmpty()
      .withMessage('Tipo é obrigatório')
      .isIn(['NOVO_PRODUTO', 'REAVALIACAO'])
      .withMessage('Tipo deve ser NOVO_PRODUTO ou REAVALIACAO'),
    body('data_analise')
      .notEmpty()
      .withMessage('Data de análise é obrigatória')
      .isISO8601()
      .withMessage('Data de análise deve ser uma data válida'),
    body('produto_generico_id')
      .notEmpty()
      .withMessage('Nome genérico é obrigatório')
      .isInt({ min: 1 })
      .withMessage('Nome genérico ID deve ser um número inteiro positivo'),
    body('marca')
      .notEmpty()
      .withMessage('Marca é obrigatória')
      .isString()
      .isLength({ max: 200 })
      .withMessage('Marca deve ter no máximo 200 caracteres'),
    body('fornecedor_id')
      .notEmpty()
      .withMessage('Fornecedor é obrigatório')
      .isInt({ min: 1 })
      .withMessage('Fornecedor ID deve ser um número inteiro positivo'),
    body('unidade_medida_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade de medida ID deve ser um número inteiro positivo'),
    body('avaliador_id')
      .notEmpty()
      .withMessage('Avaliador é obrigatório')
      .isInt({ min: 1 })
      .withMessage('Avaliador ID deve ser um número inteiro positivo'),
    body('fabricante')
      .notEmpty()
      .withMessage('Fabricante é obrigatório')
      .isString()
      .isLength({ max: 200 })
      .withMessage('Fabricante deve ter no máximo 200 caracteres'),
    body('composicao')
      .notEmpty()
      .withMessage('Composição é obrigatória')
      .isString()
      .withMessage('Composição deve ser uma string'),
    body('lote')
      .notEmpty()
      .withMessage('Lote é obrigatório')
      .isString()
      .isLength({ max: 50 })
      .withMessage('Lote deve ter no máximo 50 caracteres'),
    body('fabricacao')
      .optional()
      .isISO8601()
      .withMessage('Data de fabricação deve ser uma data válida')
      .custom((value) => {
        if (!value) return true;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataFabricacao = new Date(value);
        dataFabricacao.setHours(0, 0, 0, 0);
        if (dataFabricacao > hoje) {
          throw new Error('Data de fabricação não pode ser superior à data atual');
        }
        return true;
      }),
    body('validade')
      .optional()
      .isISO8601()
      .withMessage('Data de validade deve ser uma data válida')
      .custom((value) => {
        if (!value) return true;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataValidade = new Date(value);
        dataValidade.setHours(0, 0, 0, 0);
        if (dataValidade < hoje) {
          throw new Error('Data de validade não pode ser anterior à data atual');
        }
        return true;
      }),
    body('peso')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso deve ser BOM, REGULAR ou RUIM'),
    body('peso_valor')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso (valor) deve ser um número positivo'),
    body('peso_cru')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso cru deve ser BOM, REGULAR ou RUIM'),
    body('peso_cozido')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso cozido deve ser BOM, REGULAR ou RUIM'),
    body('fator_coccao')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Fator de cocção deve ser BOM, REGULAR ou RUIM'),
    body('peso_cru_valor')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso cru (valor) deve ser um número positivo'),
    body('peso_cozido_valor')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso cozido (valor) deve ser um número positivo'),
    body('fator_coccao_valor')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Fator de cocção (valor) deve ser um número positivo'),
    body('cor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Cor deve ser BOM, REGULAR ou RUIM'),
    body('odor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Odor deve ser BOM, REGULAR ou RUIM'),
    body('sabor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Sabor deve ser BOM, REGULAR ou RUIM'),
    body('aparencia')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Aparência deve ser BOM, REGULAR ou RUIM'),
    body('cor_observacao')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Observação de cor deve ter no máximo 100 caracteres'),
    body('odor_observacao')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Observação de odor deve ter no máximo 100 caracteres'),
    body('sabor_observacao')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Observação de sabor deve ter no máximo 100 caracteres'),
    body('aparencia_observacao')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Observação de aparência deve ter no máximo 100 caracteres'),
    body('conclusao')
      .notEmpty()
      .withMessage('Conclusão é obrigatória')
      .isString()
      .withMessage('Conclusão deve ser uma string'),
    body('resultado_final')
      .notEmpty()
      .withMessage('Resultado final é obrigatório')
      .isIn(['APROVADO', 'APROVADO_COM_RESSALVAS', 'REPROVADO'])
      .withMessage('Resultado final deve ser APROVADO, APROVADO_COM_RESSALVAS ou REPROVADO'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    body('pdf_avaliacao_antiga')
      .optional()
      .custom((value, { req }) => {
        if (req.body.tipo === 'REAVALIACAO' && (!value || value === '')) {
          throw new Error('PDF da avaliação antiga é obrigatório para reavaliação');
        }
        return true;
      }),
    handleValidationErrors
  ],

  update: [
    cleanEmptyFields,
    body('tipo')
      .optional()
      .isIn(['NOVO_PRODUTO', 'REAVALIACAO'])
      .withMessage('Tipo deve ser NOVO_PRODUTO ou REAVALIACAO'),
    body('data_analise')
      .optional()
      .isISO8601()
      .withMessage('Data de análise deve ser uma data válida'),
    body('produto_generico_id')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const numValue = typeof value === 'number' ? value : parseInt(value, 10);
        return !isNaN(numValue) && numValue > 0;
      })
      .withMessage('Nome genérico ID deve ser um número inteiro positivo'),
    body('marca')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return typeof value === 'string' && value.trim().length > 0 && value.length <= 200;
      })
      .withMessage('Marca é obrigatória e deve ter no máximo 200 caracteres'),
    body('fornecedor_id')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const numValue = typeof value === 'number' ? value : parseInt(value, 10);
        return !isNaN(numValue) && numValue > 0;
      })
      .withMessage('Fornecedor ID deve ser um número inteiro positivo'),
    body('unidade_medida_id')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const numValue = typeof value === 'number' ? value : parseInt(value, 10);
        return !isNaN(numValue) && numValue > 0;
      })
      .withMessage('Unidade de medida ID deve ser um número inteiro positivo'),
    body('avaliador_id')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        const numValue = typeof value === 'number' ? value : parseInt(value, 10);
        return !isNaN(numValue) && numValue > 0;
      })
      .withMessage('Avaliador ID deve ser um número inteiro positivo'),
    body('fabricante')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Fabricante deve ter no máximo 100 caracteres'),
    body('composicao')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return typeof value === 'string';
      })
      .withMessage('Composição deve ser uma string'),
    body('lote')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Lote deve ter no máximo 50 caracteres'),
    body('fabricacao')
      .optional()
      .isISO8601()
      .withMessage('Data de fabricação deve ser uma data válida')
      .custom((value) => {
        if (!value) return true;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataFabricacao = new Date(value);
        dataFabricacao.setHours(0, 0, 0, 0);
        if (dataFabricacao > hoje) {
          throw new Error('Data de fabricação não pode ser superior à data atual');
        }
        return true;
      }),
    body('validade')
      .optional()
      .isISO8601()
      .withMessage('Data de validade deve ser uma data válida')
      .custom((value) => {
        if (!value) return true;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataValidade = new Date(value);
        dataValidade.setHours(0, 0, 0, 0);
        if (dataValidade < hoje) {
          throw new Error('Data de validade não pode ser anterior à data atual');
        }
        return true;
      }),
    body('peso')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso deve ser BOM, REGULAR ou RUIM'),
    body('peso_valor')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso (valor) deve ser um número positivo'),
    body('peso_cru')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso cru deve ser BOM, REGULAR ou RUIM'),
    body('peso_cozido')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Peso cozido deve ser BOM, REGULAR ou RUIM'),
    body('fator_coccao')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Fator de cocção deve ser BOM, REGULAR ou RUIM'),
    body('peso_cru_valor')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso cru (valor) deve ser um número positivo'),
    body('peso_cozido_valor')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Peso cozido (valor) deve ser um número positivo'),
    body('fator_coccao_valor')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Fator de cocção (valor) deve ser um número positivo'),
    body('cor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Cor deve ser BOM, REGULAR ou RUIM'),
    body('odor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Odor deve ser BOM, REGULAR ou RUIM'),
    body('sabor')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Sabor deve ser BOM, REGULAR ou RUIM'),
    body('aparencia')
      .optional()
      .isIn(['BOM', 'REGULAR', 'RUIM'])
      .withMessage('Aparência deve ser BOM, REGULAR ou RUIM'),
    body('cor_observacao')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Observação de cor deve ter no máximo 100 caracteres'),
    body('odor_observacao')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Observação de odor deve ter no máximo 100 caracteres'),
    body('sabor_observacao')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Observação de sabor deve ter no máximo 100 caracteres'),
    body('aparencia_observacao')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Observação de aparência deve ter no máximo 100 caracteres'),
    body('conclusao')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return typeof value === 'string';
      })
      .withMessage('Conclusão deve ser uma string'),
    body('resultado_final')
      .optional()
      .isIn(['APROVADO', 'APROVADO_COM_RESSALVAS', 'REPROVADO'])
      .withMessage('Resultado final deve ser APROVADO, APROVADO_COM_RESSALVAS ou REPROVADO')
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        return ['APROVADO', 'APROVADO_COM_RESSALVAS', 'REPROVADO'].includes(value);
      }),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    body('pdf_avaliacao_antiga')
      .optional()
      .custom((value, { req }) => {
        if (req.body.tipo === 'REAVALIACAO' && (!value || value === '')) {
          throw new Error('PDF da avaliação antiga é obrigatório para reavaliação');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

module.exports = {
  fichaHomologacaoValidations,
  commonValidations
};

