/**
 * Validador de Produtos
 * Implementa validações para operações CRUD de produtos
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationResponse } = require('../../middleware/responseHandler');

// Middleware para capturar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return validationResponse(res, errors.array());
  }
  
  next();
};

// Middleware para limpar campos vazios
const cleanEmptyFields = (req, res, next) => {
  // Converter campos vazios para null
  const fieldsToClean = [
    'codigo_produto', 'codigo_barras', 'referencia_interna', 'referencia_externa', 
    'referencia_mercado', 'unidade_id', 'grupo_id', 'subgrupo_id', 'classe_id', 
    'nome_generico_id', 'produto_origem_id', 'marca_id', 'peso_liquido', 'peso_bruto', 
    'fabricante', 'informacoes_adicionais', 'foto_produto', 'prazo_validade', 
    'unidade_validade', 'regra_palet_un', 'ficha_homologacao', 'registro_especifico', 
    'comprimento', 'largura', 'altura', 'volume', 'integracao_senior', 'ncm', 'cest', 
    'cfop', 'ean', 'cst_icms', 'csosn', 'aliquota_icms', 'aliquota_ipi', 'aliquota_pis', 
    'aliquota_cofins', 'tipo_registro', 'embalagem_secundaria_id', 'fator_conversao_embalagem'
  ];
  
  fieldsToClean.forEach(field => {
    if (req.body[field] === '' || req.body[field] === undefined || req.body[field] === 'null') {
      req.body[field] = null;
    }
  });

  // Converter campos numéricos
  if (req.body.fator_conversao && req.body.fator_conversao !== '') {
    req.body.fator_conversao = parseFloat(req.body.fator_conversao);
  }

  if (req.body.unidade_id && req.body.unidade_id !== '') {
    req.body.unidade_id = parseInt(req.body.unidade_id);
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

  if (req.body.nome_generico_id && req.body.nome_generico_id !== '') {
    req.body.nome_generico_id = parseInt(req.body.nome_generico_id);
  }

  if (req.body.produto_origem_id && req.body.produto_origem_id !== '') {
    req.body.produto_origem_id = parseInt(req.body.produto_origem_id);
  }

  if (req.body.marca_id && req.body.marca_id !== '') {
    req.body.marca_id = parseInt(req.body.marca_id);
  }

  if (req.body.peso_liquido && req.body.peso_liquido !== '') {
    req.body.peso_liquido = parseFloat(req.body.peso_liquido);
  }

  if (req.body.peso_bruto && req.body.peso_bruto !== '') {
    req.body.peso_bruto = parseFloat(req.body.peso_bruto);
  }

  if (req.body.prazo_validade && req.body.prazo_validade !== '') {
    req.body.prazo_validade = parseInt(req.body.prazo_validade);
  }

  if (req.body.regra_palet_un && req.body.regra_palet_un !== '') {
    req.body.regra_palet_un = parseInt(req.body.regra_palet_un);
  }

  if (req.body.comprimento && req.body.comprimento !== '') {
    req.body.comprimento = parseFloat(req.body.comprimento);
  }

  if (req.body.largura && req.body.largura !== '') {
    req.body.largura = parseFloat(req.body.largura);
  }

  if (req.body.altura && req.body.altura !== '') {
    req.body.altura = parseFloat(req.body.altura);
  }

  if (req.body.volume && req.body.volume !== '') {
    req.body.volume = parseFloat(req.body.volume);
  }

  if (req.body.aliquota_icms && req.body.aliquota_icms !== '') {
    req.body.aliquota_icms = parseFloat(req.body.aliquota_icms);
  }

  if (req.body.aliquota_ipi && req.body.aliquota_ipi !== '') {
    req.body.aliquota_ipi = parseFloat(req.body.aliquota_ipi);
  }

  if (req.body.aliquota_pis && req.body.aliquota_pis !== '') {
    req.body.aliquota_pis = parseFloat(req.body.aliquota_pis);
  }

  if (req.body.aliquota_cofins && req.body.aliquota_cofins !== '') {
    req.body.aliquota_cofins = parseFloat(req.body.aliquota_cofins);
  }

  if (req.body.embalagem_secundaria_id && req.body.embalagem_secundaria_id !== '') {
    req.body.embalagem_secundaria_id = parseInt(req.body.embalagem_secundaria_id);
  }

  if (req.body.fator_conversao_embalagem && req.body.fator_conversao_embalagem !== '') {
    req.body.fator_conversao_embalagem = parseInt(req.body.fator_conversao_embalagem);
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
    cleanEmptyFields,
    
    body('nome')
      .notEmpty()
      .withMessage('Nome do produto é obrigatório')
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome do produto deve ter entre 3 e 200 caracteres')
      .trim(),
    
    body('codigo_produto')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Código do produto deve ter entre 1 e 20 caracteres')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Código do produto deve conter apenas letras, números, hífens e underscores'),
    
    body('codigo_barras')
      .optional()
      .isLength({ min: 8, max: 50 })
      .withMessage('Código de barras deve ter entre 8 e 50 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('Código de barras deve conter apenas números'),
    
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Fator de conversão deve ser um número entre 0.001 e 999999.999'),
    
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
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Unidade deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Unidade deve ser selecionada'),
    
    body('grupo_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Grupo deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Grupo deve ser selecionado'),
    
    body('subgrupo_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Subgrupo deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Subgrupo deve ser selecionado'),
    
    body('classe_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Classe deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Classe deve ser selecionada'),
    
    body('nome_generico_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Produto genérico deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Produto genérico deve ser selecionado'),
    
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
    
    body('marca_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Marca deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Marca deve ser selecionada'),
    
    body('peso_liquido')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Peso líquido deve ser um número entre 0.001 e 999999.999'),
    
    body('peso_bruto')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Peso bruto deve ser um número entre 0.001 e 999999.999'),
    
    body('fabricante')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Fabricante deve ter entre 1 e 100 caracteres'),
    
    body('informacoes_adicionais')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Informações adicionais deve ter no máximo 1000 caracteres'),
    
    body('foto_produto')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Foto do produto deve ter entre 1 e 255 caracteres'),
    
    body('prazo_validade')
      .optional()
      .isInt({ min: 1, max: 9999 })
      .withMessage('Prazo de validade deve ser um número inteiro entre 1 e 9999'),
    
    body('unidade_validade')
      .optional()
      .isIn(['DIAS', 'SEMANAS', 'MESES', 'ANOS'])
      .withMessage('Unidade de validade deve ser DIAS, SEMANAS, MESES ou ANOS'),
    
    body('regra_palet_un')
      .optional()
      .isInt({ min: 1, max: 999999 })
      .withMessage('Regra palet deve ser um número inteiro entre 1 e 999999'),
    
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
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Comprimento deve ser um número entre 0.01 e 999999.99'),
    
    body('largura')
      .optional()
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Largura deve ser um número entre 0.01 e 999999.99'),
    
    body('altura')
      .optional()
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Altura deve ser um número entre 0.01 e 999999.99'),
    
    body('volume')
      .optional()
      .isFloat({ min: 0.01, max: 999999999.99 })
      .withMessage('Volume deve ser um número entre 0.01 e 999999999.99'),
    
    body('integracao_senior')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Integração Senior deve ter entre 1 e 50 caracteres'),
    
    body('ncm')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('NCM deve ter entre 1 e 10 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('NCM deve conter apenas números'),
    
    body('cest')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('CEST deve ter entre 1 e 10 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('CEST deve conter apenas números'),
    
    body('cfop')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('CFOP deve ter entre 1 e 10 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('CFOP deve conter apenas números'),
    
    body('ean')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('EAN deve ter entre 1 e 50 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('EAN deve conter apenas números'),
    
    body('cst_icms')
      .optional()
      .isLength({ min: 1, max: 3 })
      .withMessage('CST ICMS deve ter entre 1 e 3 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('CST ICMS deve conter apenas números'),
    
    body('csosn')
      .optional()
      .isLength({ min: 1, max: 3 })
      .withMessage('CSOSN deve ter entre 1 e 3 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('CSOSN deve conter apenas números'),
    
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
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Embalagem secundária deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Embalagem secundária deve ser selecionada'),
    
    body('fator_conversao_embalagem')
      .optional()
      .isInt({ min: 1, max: 999999 })
      .withMessage('Fator de conversão da embalagem deve ser um número inteiro entre 1 e 999999'),
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ],

  update: [
    cleanEmptyFields,
    commonValidations.id,
    
    body('nome')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome do produto deve ter entre 3 e 200 caracteres')
      .trim(),
    
    body('codigo_produto')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Código do produto deve ter entre 1 e 20 caracteres')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Código do produto deve conter apenas letras, números, hífens e underscores'),
    
    body('codigo_barras')
      .optional()
      .isLength({ min: 8, max: 50 })
      .withMessage('Código de barras deve ter entre 8 e 50 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('Código de barras deve conter apenas números'),
    
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Fator de conversão deve ser um número entre 0.001 e 999999.999'),
    
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
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Unidade deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Unidade deve ser selecionada'),
    
    body('grupo_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Grupo deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Grupo deve ser selecionado'),
    
    body('subgrupo_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Subgrupo deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Subgrupo deve ser selecionado'),
    
    body('classe_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Classe deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Classe deve ser selecionada'),
    
    body('nome_generico_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Produto genérico deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Produto genérico deve ser selecionado'),
    
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
    
    body('marca_id')
      .optional()
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Marca deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Marca deve ser selecionada'),
    
    body('peso_liquido')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Peso líquido deve ser um número entre 0.001 e 999999.999'),
    
    body('peso_bruto')
      .optional()
      .isFloat({ min: 0.001, max: 999999.999 })
      .withMessage('Peso bruto deve ser um número entre 0.001 e 999999.999'),
    
    body('fabricante')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Fabricante deve ter entre 1 e 100 caracteres'),
    
    body('informacoes_adicionais')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Informações adicionais deve ter no máximo 1000 caracteres'),
    
    body('foto_produto')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Foto do produto deve ter entre 1 e 255 caracteres'),
    
    body('prazo_validade')
      .optional()
      .isInt({ min: 1, max: 9999 })
      .withMessage('Prazo de validade deve ser um número inteiro entre 1 e 9999'),
    
    body('unidade_validade')
      .optional()
      .isIn(['DIAS', 'SEMANAS', 'MESES', 'ANOS'])
      .withMessage('Unidade de validade deve ser DIAS, SEMANAS, MESES ou ANOS'),
    
    body('regra_palet_un')
      .optional()
      .isInt({ min: 1, max: 999999 })
      .withMessage('Regra palet deve ser um número inteiro entre 1 e 999999'),
    
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
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Comprimento deve ser um número entre 0.01 e 999999.99'),
    
    body('largura')
      .optional()
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Largura deve ser um número entre 0.01 e 999999.99'),
    
    body('altura')
      .optional()
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Altura deve ser um número entre 0.01 e 999999.99'),
    
    body('volume')
      .optional()
      .isFloat({ min: 0.01, max: 999999999.99 })
      .withMessage('Volume deve ser um número entre 0.01 e 999999999.99'),
    
    body('integracao_senior')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Integração Senior deve ter entre 1 e 50 caracteres'),
    
    body('ncm')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('NCM deve ter entre 1 e 10 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('NCM deve conter apenas números'),
    
    body('cest')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('CEST deve ter entre 1 e 10 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('CEST deve conter apenas números'),
    
    body('cfop')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('CFOP deve ter entre 1 e 10 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('CFOP deve conter apenas números'),
    
    body('ean')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('EAN deve ter entre 1 e 50 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('EAN deve conter apenas números'),
    
    body('cst_icms')
      .optional()
      .isLength({ min: 1, max: 3 })
      .withMessage('CST ICMS deve ter entre 1 e 3 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('CST ICMS deve conter apenas números'),
    
    body('csosn')
      .optional()
      .isLength({ min: 1, max: 3 })
      .withMessage('CSOSN deve ter entre 1 e 3 caracteres')
      .matches(/^[0-9]+$/)
      .withMessage('CSOSN deve conter apenas números'),
    
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
      .custom((value) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 1) {
            throw new Error('Embalagem secundária deve ser um número válido');
          }
        }
        return true;
      })
      .withMessage('Embalagem secundária deve ser selecionada'),
    
    body('fator_conversao_embalagem')
      .optional()
      .isInt({ min: 1, max: 999999 })
      .withMessage('Fator de conversão da embalagem deve ser um número inteiro entre 1 e 999999'),
    
    body('status')
      .optional()
      .isIn([0, 1, '0', '1'])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    
    handleValidationErrors
  ]
};

module.exports = {
  produtoValidations,
  commonValidations,
  handleValidationErrors,
  cleanEmptyFields
}; 