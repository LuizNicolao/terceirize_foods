/**
 * Exportações centralizadas de todos os services
 */

// Services principais
export { default as api } from './api';
export { default as FoodsApiService } from './FoodsApiService';

// Services por entidade
export * from './usuarios';
export * from './permissoes';
export * from './produtos';
export * from './escolas';
export * from './recebimentos';

// Services específicos
export { default as FornecedoresService } from './fornecedores';
