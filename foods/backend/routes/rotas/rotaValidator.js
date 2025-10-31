/**
 * Validações específicas para Rotas
 * Centraliza todas as validações relacionadas às rotas
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para rotas
const handleValidationErrors = createEntityValidationHandler('rotas');

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

// Validações específicas para rotas
const rotaValidations = {
  // Validações para criação de rota
  create: [
    body('nome')
      .notEmpty().withMessage('Nome da rota é obrigatório')
      .isString().trim().isLength({ min: 2, max: 150 }).withMessage('Nome deve ter entre 2 e 150 caracteres'),
    
    body('codigo')
      .notEmpty().withMessage('Código da rota é obrigatório')
      .isString().trim().isLength({ min: 1, max: 20 }).withMessage('Código deve ter entre 1 e 20 caracteres'),
    
    body('frequencia_entrega')
      .notEmpty().withMessage('Frequência de entrega é obrigatória')
      .isString().trim()
      .custom(async (value) => {
        // Buscar valores válidos do ENUM dinamicamente
        const { executeQuery } = require('../../config/database');
        try {
          const query = `
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'rotas'
              AND COLUMN_NAME = 'frequencia_entrega'
          `;
          const result = await executeQuery(query);
          
          if (result.length > 0) {
            const enumStr = result[0].COLUMN_TYPE;
            const enumValues = enumStr
              .replace(/^enum\(|\)$/gi, '')
              .split(',')
              .map(val => val.replace(/^'|'$/g, '').trim())
              .filter(val => val.length > 0);
            
            if (!enumValues.includes(value)) {
              throw new Error(`Frequência deve ser uma das seguintes: ${enumValues.join(', ')}`);
            }
          }
          return true;
        } catch (error) {
          // Se houver erro ao buscar ENUM, usar valores padrão como fallback
          const valoresPadrao = ['semanal', 'quinzenal', 'mensal', 'transferencia'];
          if (!valoresPadrao.includes(value)) {
            throw new Error(`Frequência deve ser uma das seguintes: ${valoresPadrao.join(', ')}`);
          }
          return true;
        }
      }),
    
    body('tipo_rota_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID do tipo de rota deve ser um número inteiro positivo')
      .custom(async (value, { req }) => {
        if (value) {
          const { executeQuery } = require('../../config/database');
          const filial_id = req.body.filial_id;
          
          if (!filial_id) {
            return true; // Se não tiver filial_id, a validação de filial_id obrigatória já vai capturar
          }
          
          const tipoRota = await executeQuery(
            'SELECT id FROM tipo_rota WHERE id = ? AND filial_id = ?',
            [value, filial_id]
          );
          
          if (tipoRota.length === 0) {
            throw new Error('Tipo de rota não encontrado ou não pertence à filial selecionada');
          }
        }
        return true;
      }),
    
    body('filial_id')
      .notEmpty().withMessage('Filial é obrigatória')
      .isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    handleValidationErrors
  ],

  // Validações para atualização de rota
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('nome')
      .optional()
      .isString().trim().isLength({ min: 2, max: 150 }).withMessage('Nome deve ter entre 2 e 150 caracteres'),
    
    body('codigo')
      .optional()
      .isString().trim().isLength({ min: 1, max: 20 }).withMessage('Código deve ter entre 1 e 20 caracteres'),
    
    body('frequencia_entrega')
      .optional()
      .isString().trim()
      .custom(async (value) => {
        // Buscar valores válidos do ENUM dinamicamente
        const { executeQuery } = require('../../config/database');
        try {
          const query = `
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'rotas'
              AND COLUMN_NAME = 'frequencia_entrega'
          `;
          const result = await executeQuery(query);
          
          if (result.length > 0) {
            const enumStr = result[0].COLUMN_TYPE;
            const enumValues = enumStr
              .replace(/^enum\(|\)$/gi, '')
              .split(',')
              .map(val => val.replace(/^'|'$/g, '').trim())
              .filter(val => val.length > 0);
            
            if (!enumValues.includes(value)) {
              throw new Error(`Frequência deve ser uma das seguintes: ${enumValues.join(', ')}`);
            }
          }
          return true;
        } catch (error) {
          // Se houver erro ao buscar ENUM, usar valores padrão como fallback
          const valoresPadrao = ['semanal', 'quinzenal', 'mensal', 'transferencia'];
          if (!valoresPadrao.includes(value)) {
            throw new Error(`Frequência deve ser uma das seguintes: ${valoresPadrao.join(', ')}`);
          }
          return true;
        }
      }),
    
    body('tipo_rota_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID do tipo de rota deve ser um número inteiro positivo')
      .custom(async (value, { req }) => {
        if (value) {
          const { executeQuery } = require('../../config/database');
          // Pode ser que filial_id não esteja sendo atualizado, então buscar da rota atual
          let filial_id = req.body.filial_id;
          
          if (!filial_id) {
            // Buscar filial da rota atual
            const rota = await executeQuery(
              'SELECT filial_id FROM rotas WHERE id = ?',
              [req.params.id]
            );
            if (rota.length > 0) {
              filial_id = rota[0].filial_id;
            }
          }
          
          if (filial_id) {
            const tipoRota = await executeQuery(
              'SELECT id FROM tipo_rota WHERE id = ? AND filial_id = ?',
              [value, filial_id]
            );
            
            if (tipoRota.length === 0) {
              throw new Error('Tipo de rota não encontrado ou não pertence à filial selecionada');
            }
          }
        }
        return true;
      }),
    
    body('filial_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo ou inativo'),
    
    handleValidationErrors
  ]
};

module.exports = {
  rotaValidations,
  commonValidations
};
