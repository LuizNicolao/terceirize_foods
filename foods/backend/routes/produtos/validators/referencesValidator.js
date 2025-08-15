/**
 * Validador para Referências do Produto
 */

const { body } = require('express-validator');

const referencesValidations = [
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
  
  body('integracao_senior')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Integração Senior deve ter entre 1 e 50 caracteres'),
  
  body('embalagem_secundaria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Embalagem secundária deve ser selecionada'),
  
  body('fator_conversao_embalagem')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Fator de conversão da embalagem deve ser um número inteiro positivo')
];

module.exports = {
  referencesValidations
};
