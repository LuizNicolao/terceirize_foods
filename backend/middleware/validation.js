/**
 * Middleware de validação padronizado
 * Implementa validações consistentes usando express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationResponse } = require('./responseHandler');

// Middleware para capturar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Debug - Erros de validação:', errors.array());
    console.log('Debug - Dados recebidos:', req.body);
    return validationResponse(res, errors.array());
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
  ],

  // Validação de email
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),

  // Validação de senha
  password: body('senha')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/[a-z]/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula')
    .matches(/[A-Z]/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/)
    .withMessage('Senha deve conter pelo menos um número')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Senha deve conter pelo menos um caractere especial'),

  // Validação de nome
  name: body('nome')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  // Validação de telefone
  phone: body('telefone')
    .optional()
    .matches(/^[\d\s\(\)\-\+]+$/)
    .withMessage('Telefone deve conter apenas números, espaços, parênteses, hífens e +'),

  // Validação de CNPJ
  cnpj: body('cnpj')
    .optional()
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/)
    .withMessage('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'),

  // Validação de CEP
  cep: body('cep')
    .optional()
    .matches(/^\d{5}\-\d{3}$/)
    .withMessage('CEP deve estar no formato XXXXX-XXX'),

  // Validação de status
  status: body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'bloqueado'])
    .withMessage('Status deve ser ativo, inativo ou bloqueado')
};

// Validações específicas para usuários
const userValidations = {
  create: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    body('nivel_de_acesso')
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de acesso deve ser I, II ou III'),
    body('tipo_de_acesso')
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso inválido'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    commonValidations.name.optional(),
    commonValidations.email.optional(),
    body('nivel_de_acesso')
      .optional()
      .isIn(['I', 'II', 'III'])
      .withMessage('Nível de acesso deve ser I, II ou III'),
    body('tipo_de_acesso')
      .optional()
      .isIn(['administrador', 'coordenador', 'administrativo', 'gerente', 'supervisor'])
      .withMessage('Tipo de acesso inválido'),
    handleValidationErrors
  ]
};

// Validações específicas para fornecedores
const fornecedorValidations = {
  create: [
    body('razao_social')
      .isLength({ min: 3, max: 200 })
      .withMessage('Razão social deve ter entre 3 e 200 caracteres'),
    body('nome_fantasia')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome fantasia deve ter entre 3 e 200 caracteres'),
    commonValidations.cnpj,
    commonValidations.phone,
    commonValidations.email.optional(),
    body('logradouro')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Logradouro deve ter entre 3 e 200 caracteres'),
    body('numero')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Número deve ter entre 1 e 20 caracteres'),
    body('bairro')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Bairro deve ter entre 2 e 100 caracteres'),
    body('municipio')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Município deve ter entre 2 e 100 caracteres'),
    body('uf')
      .optional()
      .isLength({ min: 2, max: 2 })
      .isUppercase()
      .withMessage('UF deve ter 2 caracteres maiúsculos'),
    commonValidations.cep,
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('razao_social')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Razão social deve ter entre 3 e 200 caracteres'),
    body('nome_fantasia')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome fantasia deve ter entre 3 e 200 caracteres'),
    commonValidations.cnpj.optional(),
    commonValidations.phone.optional(),
    commonValidations.email.optional(),
    body('logradouro')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Logradouro deve ter entre 3 e 200 caracteres'),
    body('numero')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Número deve ter entre 1 e 20 caracteres'),
    body('bairro')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Bairro deve ter entre 2 e 100 caracteres'),
    body('municipio')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Município deve ter entre 2 e 100 caracteres'),
    body('uf')
      .optional()
      .isLength({ min: 2, max: 2 })
      .isUppercase()
      .withMessage('UF deve ter 2 caracteres maiúsculos'),
    commonValidations.cep.optional(),
    handleValidationErrors
  ]
};

// Validações específicas para clientes
const clienteValidations = {
  create: [
    body('razao_social')
      .isLength({ min: 3, max: 200 })
      .withMessage('Razão social deve ter entre 3 e 200 caracteres'),
    body('nome_fantasia')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome fantasia deve ter entre 3 e 200 caracteres'),
    commonValidations.cnpj,
    commonValidations.phone,
    commonValidations.email.optional(),
    body('logradouro')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Logradouro deve ter entre 3 e 200 caracteres'),
    body('numero')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Número deve ter entre 1 e 20 caracteres'),
    body('bairro')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Bairro deve ter entre 2 e 100 caracteres'),
    body('municipio')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Município deve ter entre 2 e 100 caracteres'),
    body('uf')
      .optional()
      .isLength({ min: 2, max: 2 })
      .isUppercase()
      .withMessage('UF deve ter 2 caracteres maiúsculos'),
    commonValidations.cep,
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('razao_social')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Razão social deve ter entre 3 e 200 caracteres'),
    body('nome_fantasia')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome fantasia deve ter entre 3 e 200 caracteres'),
    commonValidations.cnpj.optional(),
    commonValidations.phone.optional(),
    commonValidations.email.optional(),
    body('logradouro')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Logradouro deve ter entre 3 e 200 caracteres'),
    body('numero')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Número deve ter entre 1 e 20 caracteres'),
    body('bairro')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Bairro deve ter entre 2 e 100 caracteres'),
    body('municipio')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Município deve ter entre 2 e 100 caracteres'),
    body('uf')
      .optional()
      .isLength({ min: 2, max: 2 })
      .isUppercase()
      .withMessage('UF deve ter 2 caracteres maiúsculos'),
    commonValidations.cep.optional(),
    handleValidationErrors
  ]
};

// Validações específicas para grupos
const grupoValidations = {
  create: [
    body('nome')
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome do grupo deve ter entre 3 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome deve conter apenas letras e espaços'),
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
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome do grupo deve ter entre 3 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome deve conter apenas letras e espaços'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

// Validações específicas para subgrupos
const subgrupoValidations = {
  create: [
    body('nome')
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome do subgrupo deve ter entre 3 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome deve conter apenas letras e espaços'),
    body('grupo_id')
      .isInt({ min: 1 })
      .withMessage('ID do grupo é obrigatório e deve ser um número válido'),
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
      .isLength({ min: 3, max: 100 })
      .withMessage('Nome do subgrupo deve ter entre 3 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome deve conter apenas letras e espaços'),
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do grupo deve ser um número válido'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

// Validações específicas para marcas
const marcaValidations = {
  create: [
    body('marca')
      .isLength({ min: 2, max: 100 })
      .withMessage('Marca deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Marca deve conter apenas letras, números, espaços, hífens e pontos'),
    body('fabricante')
      .isLength({ min: 2, max: 100 })
      .withMessage('Fabricante deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Fabricante deve conter apenas letras, números, espaços, hífens e pontos'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('marca')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Marca deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Marca deve conter apenas letras, números, espaços, hífens e pontos'),
    body('fabricante')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Fabricante deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Fabricante deve conter apenas letras, números, espaços, hífens e pontos'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

// Validações específicas para classes
const classeValidations = {
  create: [
    body('nome')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome da classe deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Nome deve conter apenas letras, números, espaços, hífens e pontos'),
    body('subgrupo_id')
      .isInt({ min: 1 })
      .withMessage('ID do subgrupo é obrigatório e deve ser um número válido'),
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
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome da classe deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/)
      .withMessage('Nome deve conter apenas letras, números, espaços, hífens e pontos'),
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do subgrupo deve ser um número válido'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)'),
    handleValidationErrors
  ]
};

// Validações específicas para produtos
const produtoValidations = {
  create: [
    body('nome')
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome do produto deve ter entre 3 e 200 caracteres'),
    body('descricao')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
    body('codigo_barras')
      .optional()
      .isLength({ min: 8, max: 50 })
      .withMessage('Código de barras deve ter entre 8 e 50 caracteres'),
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Fator de conversão deve ser um número positivo'),
    body('preco_custo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço de custo deve ser um número positivo'),
    body('preco_venda')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço de venda deve ser um número positivo'),
    body('estoque_atual')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque atual deve ser um número inteiro positivo'),
    body('estoque_minimo')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque mínimo deve ser um número inteiro positivo'),
    body('fornecedor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Fornecedor deve ser selecionado'),
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Grupo deve ser selecionado'),
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Subgrupo deve ser selecionado'),
    body('unidade_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade deve ser selecionada'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    handleValidationErrors
  ],

  update: [
    commonValidations.id,
    body('nome')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Nome do produto deve ter entre 3 e 200 caracteres'),
    body('descricao')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
    body('codigo_barras')
      .optional()
      .isLength({ min: 8, max: 50 })
      .withMessage('Código de barras deve ter entre 8 e 50 caracteres'),
    body('fator_conversao')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Fator de conversão deve ser um número positivo'),
    body('preco_custo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço de custo deve ser um número positivo'),
    body('preco_venda')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço de venda deve ser um número positivo'),
    body('estoque_atual')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque atual deve ser um número inteiro positivo'),
    body('estoque_minimo')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque mínimo deve ser um número inteiro positivo'),
    body('fornecedor_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Fornecedor deve ser selecionado'),
    body('grupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Grupo deve ser selecionado'),
    body('subgrupo_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Subgrupo deve ser selecionado'),
    body('unidade_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Unidade deve ser selecionada'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo'])
      .withMessage('Status deve ser ativo ou inativo'),
    handleValidationErrors
  ],

  estoque: [
    commonValidations.id,
    body('estoque_atual')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque atual deve ser um número inteiro positivo'),
    body('estoque_minimo')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque mínimo deve ser um número inteiro positivo'),
    handleValidationErrors
  ]
};

// Validações para Filiais
const filialValidations = [
  body('codigo_filial')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Código da filial deve ter pelo menos 1 caractere')
    .trim(),
  
  body('cnpj')
    .optional()
    .custom((value) => {
      if (value) {
        const cnpjLimpo = value.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
          throw new Error('CNPJ deve ter 14 dígitos');
        }
      }
      return true;
    })
    .withMessage('CNPJ deve ter 14 dígitos'),
  
  body('filial')
    .notEmpty()
    .withMessage('Nome da filial é obrigatório')
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome da filial deve ter entre 3 e 255 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Nome da filial contém caracteres inválidos')
    .trim(),
  
  body('razao_social')
    .notEmpty()
    .withMessage('Razão social é obrigatória')
    .isLength({ min: 3, max: 255 })
    .withMessage('Razão social deve ter entre 3 e 255 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Razão social contém caracteres inválidos')
    .trim(),
  
  body('logradouro')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Logradouro deve ter no máximo 255 caracteres')
    .trim(),
  
  body('numero')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número deve ter no máximo 20 caracteres')
    .trim(),
  
  body('bairro')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bairro deve ter no máximo 100 caracteres')
    .trim(),
  
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000 ou 00000000'),
  
  body('cidade')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Cidade contém caracteres inválidos')
    .trim(),
  
  body('estado')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter 2 caracteres')
    .matches(/^[A-Z]{2}$/)
    .withMessage('Estado deve ser a sigla em maiúsculas (ex: SP, RJ)'),
  
  body('supervisao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Supervisão deve ter no máximo 100 caracteres')
    .trim(),
  
  body('coordenacao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Coordenação deve ter no máximo 100 caracteres')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['0', '1'])
    .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
];

const filialAtualizacaoValidations = [
  body('codigo_filial')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Código da filial deve ter pelo menos 1 caractere')
    .trim(),
  
  body('cnpj')
    .optional()
    .custom((value) => {
      if (value) {
        const cnpjLimpo = value.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
          throw new Error('CNPJ deve ter 14 dígitos');
        }
      }
      return true;
    })
    .withMessage('CNPJ deve ter 14 dígitos'),
  
  body('filial')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome da filial deve ter entre 3 e 255 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Nome da filial contém caracteres inválidos')
    .trim(),
  
  body('razao_social')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Razão social deve ter entre 3 e 255 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Razão social contém caracteres inválidos')
    .trim(),
  
  body('logradouro')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Logradouro deve ter no máximo 255 caracteres')
    .trim(),
  
  body('numero')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número deve ter no máximo 20 caracteres')
    .trim(),
  
  body('bairro')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bairro deve ter no máximo 100 caracteres')
    .trim(),
  
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000 ou 00000000'),
  
  body('cidade')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Cidade contém caracteres inválidos')
    .trim(),
  
  body('estado')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter 2 caracteres')
    .matches(/^[A-Z]{2}$/)
    .withMessage('Estado deve ser a sigla em maiúsculas (ex: SP, RJ)'),
  
  body('supervisao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Supervisão deve ter no máximo 100 caracteres')
    .trim(),
  
  body('coordenacao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Coordenação deve ter no máximo 100 caracteres')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['0', '1'])
    .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
 ];

// Validações para Unidades
const unidadeValidations = [
  body('nome')
    .notEmpty()
    .withMessage('Nome da unidade é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome da unidade deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Nome da unidade contém caracteres inválidos')
    .trim(),
  
  body('sigla')
    .notEmpty()
    .withMessage('Sigla é obrigatória')
    .isLength({ min: 1, max: 10 })
    .withMessage('Sigla deve ter entre 1 e 10 caracteres')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Sigla deve conter apenas letras maiúsculas e números')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['0', '1'])
    .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
];

const unidadeAtualizacaoValidations = [
  body('nome')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome da unidade deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Nome da unidade contém caracteres inválidos')
    .trim(),
  
  body('sigla')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('Sigla deve ter entre 1 e 10 caracteres')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Sigla deve conter apenas letras maiúsculas e números')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['0', '1'])
    .withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
 ];

// Validações para Unidades Escolares
const unidadeEscolarValidations = [
  body('codigo_teknisa')
    .notEmpty()
    .withMessage('Código Teknisa é obrigatório')
    .isLength({ min: 1, max: 50 })
    .withMessage('Código Teknisa deve ter entre 1 e 50 caracteres')
    .trim(),
  
  body('nome_escola')
    .notEmpty()
    .withMessage('Nome da escola é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome da escola deve ter entre 3 e 200 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Nome da escola contém caracteres inválidos')
    .trim(),
  
  body('cidade')
    .notEmpty()
    .withMessage('Cidade é obrigatória')
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Cidade contém caracteres inválidos')
    .trim(),
  
  body('estado')
    .notEmpty()
    .withMessage('Estado é obrigatório')
    .isLength({ min: 2, max: 50 })
    .withMessage('Estado deve ter entre 2 e 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Estado contém caracteres inválidos')
    .trim(),
  
  body('endereco')
    .notEmpty()
    .withMessage('Endereço é obrigatório')
    .isLength({ min: 5, max: 300 })
    .withMessage('Endereço deve ter entre 5 e 300 caracteres')
    .trim(),
  
  body('pais')
    .optional()
    .isLength({ max: 100 })
    .withMessage('País deve ter no máximo 100 caracteres')
    .trim(),
  
  body('numero')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número deve ter no máximo 20 caracteres')
    .trim(),
  
  body('bairro')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bairro deve ter no máximo 100 caracteres')
    .trim(),
  
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000 ou 00000000'),
  
  body('centro_distribuicao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Centro de distribuição deve ter no máximo 100 caracteres')
    .trim(),
  
  body('rota_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da rota deve ser um número inteiro válido'),
  
  body('regional')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Regional deve ter no máximo 100 caracteres')
    .trim(),
  
  body('lot')
    .optional()
    .isLength({ max: 50 })
    .withMessage('LOT deve ter no máximo 50 caracteres')
    .trim(),
  
  body('cc_senic')
    .optional()
    .isLength({ max: 50 })
    .withMessage('CC Senic deve ter no máximo 50 caracteres')
    .trim(),
  
  body('codigo_senio')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Código Senio deve ter no máximo 50 caracteres')
    .trim(),
  
  body('abastecimento')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Abastecimento deve ter no máximo 100 caracteres')
    .trim(),
  
  body('ordem_entrega')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem de entrega deve ser um número inteiro não negativo'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser ativo ou inativo'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações deve ter no máximo 500 caracteres')
    .trim()
];

const unidadeEscolarAtualizacaoValidations = [
  body('codigo_teknisa')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Código Teknisa deve ter entre 1 e 50 caracteres')
    .trim(),
  
  body('nome_escola')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome da escola deve ter entre 3 e 200 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\.\(\)]+$/)
    .withMessage('Nome da escola contém caracteres inválidos')
    .trim(),
  
  body('cidade')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Cidade contém caracteres inválidos')
    .trim(),
  
  body('estado')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Estado deve ter entre 2 e 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Estado contém caracteres inválidos')
    .trim(),
  
  body('endereco')
    .optional()
    .isLength({ min: 5, max: 300 })
    .withMessage('Endereço deve ter entre 5 e 300 caracteres')
    .trim(),
  
  body('pais')
    .optional()
    .isLength({ max: 100 })
    .withMessage('País deve ter no máximo 100 caracteres')
    .trim(),
  
  body('numero')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número deve ter no máximo 20 caracteres')
    .trim(),
  
  body('bairro')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bairro deve ter no máximo 100 caracteres')
    .trim(),
  
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000 ou 00000000'),
  
  body('centro_distribuicao')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Centro de distribuição deve ter no máximo 100 caracteres')
    .trim(),
  
  body('rota_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da rota deve ser um número inteiro válido'),
  
  body('regional')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Regional deve ter no máximo 100 caracteres')
    .trim(),
  
  body('lot')
    .optional()
    .isLength({ max: 50 })
    .withMessage('LOT deve ter no máximo 50 caracteres')
    .trim(),
  
  body('cc_senic')
    .optional()
    .isLength({ max: 50 })
    .withMessage('CC Senic deve ter no máximo 50 caracteres')
    .trim(),
  
  body('codigo_senio')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Código Senio deve ter no máximo 50 caracteres')
    .trim(),
  
  body('abastecimento')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Abastecimento deve ter no máximo 100 caracteres')
    .trim(),
  
  body('ordem_entrega')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem de entrega deve ser um número inteiro não negativo'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser ativo ou inativo'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações deve ter no máximo 500 caracteres')
    .trim()
 ];

// Validações para Motoristas
const motoristaValidations = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome contém caracteres inválidos')
    .trim(),
  
  body('cpf')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00'),
  
  body('cnh')
    .optional()
    .isLength({ max: 20 })
    .withMessage('CNH deve ter no máximo 20 caracteres')
    .trim(),
  
  body('categoria_cnh')
    .optional()
    .isLength({ max: 5 })
    .withMessage('Categoria CNH deve ter no máximo 5 caracteres')
    .trim(),
  
  body('telefone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (00) 00000-0000'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser um email válido')
    .normalizeEmail(),
  
  body('endereco')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Endereço deve ter no máximo 500 caracteres')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
    .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
  
  body('data_admissao')
    .optional()
    .isISO8601()
    .withMessage('Data de admissão deve ser uma data válida'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('filial_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número inteiro válido'),
  
  body('cnh_validade')
    .optional()
    .isISO8601()
    .withMessage('Data de validade da CNH deve ser uma data válida')
];

const motoristaAtualizacaoValidations = [
  body('nome')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome contém caracteres inválidos')
    .trim(),
  
  body('cpf')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00'),
  
  body('cnh')
    .optional()
    .isLength({ max: 20 })
    .withMessage('CNH deve ter no máximo 20 caracteres')
    .trim(),
  
  body('categoria_cnh')
    .optional()
    .isLength({ max: 5 })
    .withMessage('Categoria CNH deve ter no máximo 5 caracteres')
    .trim(),
  
  body('telefone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (00) 00000-0000'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser um email válido')
    .normalizeEmail(),
  
  body('endereco')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Endereço deve ter no máximo 500 caracteres')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
    .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
  
  body('data_admissao')
    .optional()
    .isISO8601()
    .withMessage('Data de admissão deve ser uma data válida'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('filial_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número inteiro válido'),
  
  body('cnh_validade')
    .optional()
    .isISO8601()
    .withMessage('Data de validade da CNH deve ser uma data válida')
 ];

// Validações para Ajudantes
const ajudanteValidations = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome contém caracteres inválidos')
    .trim(),
  
  body('cpf')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00'),
  
  body('telefone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (00) 00000-0000'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser um email válido')
    .normalizeEmail(),
  
  body('endereco')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Endereço deve ter no máximo 500 caracteres')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
    .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
  
  body('data_admissao')
    .optional()
    .isISO8601()
    .withMessage('Data de admissão deve ser uma data válida'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('filial_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número inteiro válido')
];

const ajudanteAtualizacaoValidations = [
  body('nome')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome contém caracteres inválidos')
    .trim(),
  
  body('cpf')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00'),
  
  body('telefone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (00) 00000-0000'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser um email válido')
    .normalizeEmail(),
  
  body('endereco')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Endereço deve ter no máximo 500 caracteres')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'ferias', 'licenca'])
    .withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
  
  body('data_admissao')
    .optional()
    .isISO8601()
    .withMessage('Data de admissão deve ser uma data válida'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('filial_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número inteiro válido')
 ];

// Validações para Veículos
const veiculoValidations = [
  body('placa')
    .notEmpty()
    .withMessage('Placa é obrigatória')
    .isLength({ min: 6, max: 10 })
    .withMessage('Placa deve ter entre 6 e 10 caracteres')
    .matches(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/)
    .withMessage('Placa deve estar no formato Mercosul (ABC1D23) ou antigo (ABC1234)')
    .trim(),
  
  body('renavam')
    .optional()
    .isLength({ min: 9, max: 11 })
    .withMessage('RENAVAM deve ter entre 9 e 11 dígitos')
    .isNumeric()
    .withMessage('RENAVAM deve conter apenas números')
    .trim(),
  
  body('chassi')
    .optional()
    .isLength({ min: 17, max: 17 })
    .withMessage('Chassi deve ter exatamente 17 caracteres')
    .trim(),
  
  body('modelo')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Modelo deve ter no máximo 100 caracteres')
    .trim(),
  
  body('marca')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Marca deve ter no máximo 50 caracteres')
    .trim(),
  
  body('ano_fabricacao')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Ano de fabricação deve ser um ano válido'),
  
  body('tipo_veiculo')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Tipo de veículo deve ter no máximo 50 caracteres')
    .trim(),
  
  body('carroceria')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Carroceria deve ter no máximo 50 caracteres')
    .trim(),
  
  body('combustivel')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Combustível deve ter no máximo 30 caracteres')
    .trim(),
  
  body('categoria')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Categoria deve ter no máximo 30 caracteres')
    .trim(),
  
  body('capacidade_carga')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Capacidade de carga deve ser um número positivo'),
  
  body('numero_eixos')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Número de eixos deve ser entre 1 e 10'),
  
  body('tara')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tara deve ser um número positivo'),
  
  body('peso_bruto_total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Peso bruto total deve ser um número positivo'),
  
  body('potencia_motor')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Potência do motor deve ser um número positivo'),
  
  body('tipo_tracao')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Tipo de tração deve ter no máximo 30 caracteres')
    .trim(),
  
  body('quilometragem_atual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quilometragem atual deve ser um número positivo'),
  
  body('data_licenciamento')
    .optional()
    .isISO8601()
    .withMessage('Data de licenciamento deve ser uma data válida'),
  
  body('data_vencimento_licenciamento')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento do licenciamento deve ser uma data válida'),
  
  body('data_inspecao_veicular')
    .optional()
    .isISO8601()
    .withMessage('Data de inspeção veicular deve ser uma data válida'),
  
  body('data_vencimento_inspecao')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento da inspeção deve ser uma data válida'),
  
  body('data_vencimento_documentacao')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento da documentação deve ser uma data válida'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'manutencao', 'acidente', 'vendido'])
    .withMessage('Status deve ser ativo, inativo, manutencao, acidente ou vendido'),
  
  body('status_detalhado')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Status detalhado deve ter no máximo 100 caracteres')
    .trim(),
  
  body('data_aquisicao')
    .optional()
    .isISO8601()
    .withMessage('Data de aquisição deve ser uma data válida'),
  
  body('valor_compra')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor de compra deve ser um número positivo'),
  
  body('fornecedor')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Fornecedor deve ter no máximo 100 caracteres')
    .trim(),
  
  body('numero_frota')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número da frota deve ter no máximo 20 caracteres')
    .trim(),
  
  body('situacao_financeira')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Situação financeira deve ter no máximo 50 caracteres')
    .trim(),
  
  body('foto_veiculo')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Caminho da foto do veículo deve ter no máximo 255 caracteres')
    .trim(),
  
  body('foto_documentacao')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Caminho da foto da documentação deve ter no máximo 255 caracteres')
    .trim(),
  
  body('foto_inspecao')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Caminho da foto da inspeção deve ter no máximo 255 caracteres')
    .trim(),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('filial_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número inteiro válido'),
  
  body('motorista_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do motorista deve ser um número inteiro válido')
];

const veiculoAtualizacaoValidations = [
  body('placa')
    .optional()
    .isLength({ min: 6, max: 10 })
    .withMessage('Placa deve ter entre 6 e 10 caracteres')
    .matches(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/)
    .withMessage('Placa deve estar no formato Mercosul (ABC1D23) ou antigo (ABC1234)')
    .trim(),
  
  body('renavam')
    .optional()
    .isLength({ min: 9, max: 11 })
    .withMessage('RENAVAM deve ter entre 9 e 11 dígitos')
    .isNumeric()
    .withMessage('RENAVAM deve conter apenas números')
    .trim(),
  
  body('chassi')
    .optional()
    .isLength({ min: 17, max: 17 })
    .withMessage('Chassi deve ter exatamente 17 caracteres')
    .trim(),
  
  body('modelo')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Modelo deve ter no máximo 100 caracteres')
    .trim(),
  
  body('marca')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Marca deve ter no máximo 50 caracteres')
    .trim(),
  
  body('ano_fabricacao')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Ano de fabricação deve ser um ano válido'),
  
  body('tipo_veiculo')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Tipo de veículo deve ter no máximo 50 caracteres')
    .trim(),
  
  body('carroceria')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Carroceria deve ter no máximo 50 caracteres')
    .trim(),
  
  body('combustivel')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Combustível deve ter no máximo 30 caracteres')
    .trim(),
  
  body('categoria')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Categoria deve ter no máximo 30 caracteres')
    .trim(),
  
  body('capacidade_carga')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Capacidade de carga deve ser um número positivo'),
  
  body('numero_eixos')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Número de eixos deve ser entre 1 e 10'),
  
  body('tara')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tara deve ser um número positivo'),
  
  body('peso_bruto_total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Peso bruto total deve ser um número positivo'),
  
  body('potencia_motor')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Potência do motor deve ser um número positivo'),
  
  body('tipo_tracao')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Tipo de tração deve ter no máximo 30 caracteres')
    .trim(),
  
  body('quilometragem_atual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quilometragem atual deve ser um número positivo'),
  
  body('data_emplacamento')
    .optional()
    .isISO8601()
    .withMessage('Data de emplacamento deve ser uma data válida'),
  
  body('vencimento_licenciamento')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento do licenciamento deve ser uma data válida'),
  
  body('proxima_inspecao_veicular')
    .optional()
    .isISO8601()
    .withMessage('Data da próxima inspeção veicular deve ser uma data válida'),
  
  body('vencimento_ipva')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento do IPVA deve ser uma data válida'),
  
  body('vencimento_dpvat')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento do DPVAT deve ser uma data válida'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'manutencao', 'acidente', 'vendido'])
    .withMessage('Status deve ser ativo, inativo, manutencao, acidente ou vendido'),
  
  body('status_detalhado')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Status detalhado deve ter no máximo 100 caracteres')
    .trim(),
  
  body('data_aquisicao')
    .optional()
    .isISO8601()
    .withMessage('Data de aquisição deve ser uma data válida'),
  
  body('valor_compra')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor de compra deve ser um número positivo'),
  
  body('fornecedor')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Fornecedor deve ter no máximo 100 caracteres')
    .trim(),
  
  body('numero_frota')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número da frota deve ter no máximo 20 caracteres')
    .trim(),
  
  body('situacao_financeira')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Situação financeira deve ter no máximo 50 caracteres')
    .trim(),
  
  body('foto_frente')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Caminho da foto frontal deve ter no máximo 255 caracteres')
    .trim(),
  
  body('foto_traseira')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Caminho da foto traseira deve ter no máximo 255 caracteres')
    .trim(),
  
  body('foto_lateral')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Caminho da foto lateral deve ter no máximo 255 caracteres')
    .trim(),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('filial_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número inteiro válido'),
  
  body('motorista_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do motorista deve ser um número inteiro válido')
 ];

// Validações para Rotas
const rotaValidations = [
  body('filial_id')
    .notEmpty()
    .withMessage('ID da filial é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número inteiro válido'),
  
  body('codigo')
    .notEmpty()
    .withMessage('Código é obrigatório')
    .isLength({ min: 3, max: 20 })
    .withMessage('Código deve ter entre 3 e 20 caracteres')
    .trim(),
  
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .trim(),
  
  body('distancia_km')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distância deve ser um número positivo'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser ativo ou inativo'),
  
  body('tipo_rota')
    .optional()
    .isIn(['semanal', 'quinzenal', 'mensal', 'transferencia'])
    .withMessage('Tipo de rota deve ser semanal, quinzenal, mensal ou transferencia'),
  
  body('custo_diario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Custo diário deve ser um número positivo'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
    .trim()
];

const rotaAtualizacaoValidations = [
  body('filial_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número inteiro válido'),
  
  body('codigo')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Código deve ter entre 3 e 20 caracteres')
    .trim(),
  
  body('nome')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .trim(),
  
  body('distancia_km')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distância deve ser um número positivo'),
  
  body('status')
    .optional()
    .isIn(['ativo', 'inativo'])
    .withMessage('Status deve ser ativo ou inativo'),
  
  body('tipo_rota')
    .optional()
    .isIn(['semanal', 'quinzenal', 'mensal', 'transferencia'])
    .withMessage('Tipo de rota deve ser semanal, quinzenal, mensal ou transferencia'),
  
  body('custo_diario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Custo diário deve ser um número positivo'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
    .trim()
 ];

// Validações para Nome Genérico de Produto
const nomeGenericoProdutoValidations = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome deve ter entre 3 e 200 caracteres')
    .trim(),
  
  body('grupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do grupo deve ser um número inteiro válido'),
  
  body('subgrupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do subgrupo deve ser um número inteiro válido'),
  
  body('classe_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da classe deve ser um número inteiro válido'),
  
  body('status')
    .optional()
    .isIn([0, 1, true, false])
    .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)')
];

const nomeGenericoProdutoAtualizacaoValidations = [
  body('nome')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome deve ter entre 3 e 200 caracteres')
    .trim(),
  
  body('grupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do grupo deve ser um número inteiro válido'),
  
  body('subgrupo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do subgrupo deve ser um número inteiro válido'),
  
  body('classe_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da classe deve ser um número inteiro válido'),
  
  body('status')
    .optional()
    .isIn([0, 1, true, false])
    .withMessage('Status deve ser 0 (inativo) ou 1 (ativo)')
];

module.exports = {
  handleValidationErrors,
  commonValidations,
  userValidations,
  fornecedorValidations,
  clienteValidations,
  grupoValidations,
  subgrupoValidations,
  marcaValidations,
  classeValidations,
  produtoValidations,
  filialValidations,
  filialAtualizacaoValidations,
  unidadeValidations,
  unidadeAtualizacaoValidations,
  unidadeEscolarValidations,
  unidadeEscolarAtualizacaoValidations,
  motoristaValidations,
  motoristaAtualizacaoValidations,
  ajudanteValidations,
  ajudanteAtualizacaoValidations,
  veiculoValidations,
  veiculoAtualizacaoValidations,
  rotaValidations,
  rotaAtualizacaoValidations,
  nomeGenericoProdutoValidations,
  nomeGenericoProdutoAtualizacaoValidations
}; 