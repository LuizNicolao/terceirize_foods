/**
 * Validações específicas para Chamados
 * Implementa validações usando express-validator
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para chamados
const handleValidationErrors = createEntityValidationHandler('chamados');

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

// Validações específicas para chamados
const chamadoValidations = {
  create: [
    body('titulo')
      .notEmpty().withMessage('Título é obrigatório')
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 3 && trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Título deve ter entre 3 e 255 caracteres'),
    
    body('descricao')
      .notEmpty().withMessage('Descrição é obrigatória')
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 10;
        }
        return false;
      })
      .withMessage('Descrição deve ter pelo menos 10 caracteres'),
    
    body('sistema')
      .notEmpty().withMessage('Sistema é obrigatório')
      .custom((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 1 && trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Sistema deve ter entre 1 e 100 caracteres'),
    
    body('tela')
      .optional({ checkFalsy: true })
      .custom((value) => {
        // Se não foi enviado ou está vazio, aceita
        if (!value || value === '') {
          return true;
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Tela deve ter no máximo 255 caracteres'),
    
    body('tipo')
      .notEmpty().withMessage('Tipo é obrigatório')
      .custom((value) => {
        return ['bug', 'erro', 'melhoria', 'feature'].includes(value);
      })
      .withMessage('Tipo deve ser bug, erro, melhoria ou feature'),
    
    body('prioridade')
      .optional({ checkFalsy: true })
      .custom((value) => {
        // Se não foi enviado ou está vazio, aceita
        if (!value || value === '') {
          return true;
        }
        return ['baixa', 'media', 'alta', 'critica'].includes(value);
      })
      .withMessage('Prioridade deve ser baixa, media, alta ou critica'),
    
    // Status não deve ser enviado na criação (sempre será "aberto")
    body('status')
      .optional({ checkFalsy: true })
      .custom((value) => {
        // Se não foi enviado ou está vazio, aceita
        if (!value || value === '') {
          return true;
        }
        return value === 'aberto';
      })
      .withMessage('Status deve ser "aberto" para novos chamados ou não deve ser enviado'),
    
    body('usuario_responsavel_id')
      .optional({ checkFalsy: true })
      .custom((value) => {
        // Se não foi enviado ou está vazio, aceita
        if (value === null || value === undefined || value === '' || value === 0) {
          return true;
        }
        // Verificar se é um número inteiro positivo (aceita string ou número)
        const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
        return !isNaN(numValue) && Number.isInteger(numValue) && numValue > 0;
      })
      .withMessage('ID do usuário responsável deve ser um número inteiro positivo'),
    
    // usuario_abertura_id não deve ser enviado na criação (é preenchido automaticamente pelo backend)
    body('usuario_abertura_id')
      .optional()
      .custom((value) => {
        // Se foi enviado, rejeita (deve ser undefined/null)
        if (value !== undefined && value !== null) {
          throw new Error('Campo usuario_abertura_id não deve ser enviado. Ele é preenchido automaticamente pelo sistema.');
        }
        return true;
      })
      .withMessage('Campo usuario_abertura_id não deve ser enviado. Ele é preenchido automaticamente pelo sistema.'),
    
    handleValidationErrors
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('titulo')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 3 && trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Título deve ter entre 3 e 255 caracteres'),
    
    body('descricao')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 10;
        }
        return false;
      })
      .withMessage('Descrição deve ter pelo menos 10 caracteres'),
    
    body('sistema')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length >= 1 && trimmed.length <= 100;
        }
        return false;
      })
      .withMessage('Sistema deve ter entre 1 e 100 caracteres'),
    
    body('tela')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed.length <= 255;
        }
        return false;
      })
      .withMessage('Tela deve ter no máximo 255 caracteres'),
    
    body('tipo')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        return ['bug', 'erro', 'melhoria', 'feature'].includes(value);
      })
      .withMessage('Tipo deve ser bug, erro, melhoria ou feature'),
    
    body('status')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        return ['aberto', 'em_analise', 'em_desenvolvimento', 'em_teste', 'concluido', 'fechado'].includes(value);
      })
      .withMessage('Status inválido'),
    
    body('prioridade')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        return ['baixa', 'media', 'alta', 'critica'].includes(value);
      })
      .withMessage('Prioridade deve ser baixa, media, alta ou critica'),
    
    body('usuario_responsavel_id')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        return Number.isInteger(value) && value > 0;
      })
      .withMessage('ID do usuário responsável deve ser um número inteiro positivo'),
    
    handleValidationErrors
  ],

  comentario: {
    create: [
      param('chamadoId')
        .isInt({ min: 1 })
        .withMessage('ID do chamado deve ser um número inteiro positivo'),
      
      body('comentario')
        .notEmpty().withMessage('Comentário é obrigatório')
        .custom((value) => {
          if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed.length >= 3;
          }
          return false;
        })
        .withMessage('Comentário deve ter pelo menos 3 caracteres'),
      
      body('tipo')
        .optional()
        .custom((value) => {
          if (value === null || value === undefined || value === '') {
            return true;
          }
          return ['comentario', 'resolucao', 'atualizacao'].includes(value);
        })
        .withMessage('Tipo deve ser comentario, resolucao ou atualizacao'),
      
      handleValidationErrors
    ],

    update: [
      param('chamadoId')
        .isInt({ min: 1 })
        .withMessage('ID do chamado deve ser um número inteiro positivo'),
      
      param('comentarioId')
        .isInt({ min: 1 })
        .withMessage('ID do comentário deve ser um número inteiro positivo'),
      
      body('comentario')
        .optional()
        .custom((value) => {
          if (value === null || value === undefined || value === '') {
            return true;
          }
          if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed.length >= 3;
          }
          return false;
        })
        .withMessage('Comentário deve ter pelo menos 3 caracteres'),
      
      body('tipo')
        .optional()
        .custom((value) => {
          if (value === null || value === undefined || value === '') {
            return true;
          }
          return ['comentario', 'resolucao', 'atualizacao'].includes(value);
        })
        .withMessage('Tipo deve ser comentario, resolucao ou atualizacao'),
      
      handleValidationErrors
    ]
  }
};

module.exports = {
  chamadoValidations,
  commonValidations
};
