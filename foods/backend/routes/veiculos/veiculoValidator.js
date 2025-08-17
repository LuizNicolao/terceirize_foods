/**
 * Validações específicas para Veículos
 * Centraliza todas as validações relacionadas aos veículos
 */

const { body, param, query } = require('express-validator');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');

// Criar handler de validação específico para veículos
const handleValidationErrors = createEntityValidationHandler('veiculos');

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

// Validações específicas para veículos
const veiculoValidations = {
  // Validações para criação de veículo
  create: [
    body('placa')
      .notEmpty().withMessage('Placa é obrigatória')
      .isString().trim().isLength({ min: 1, max: 10 }).withMessage('Placa deve ter entre 1 e 10 caracteres'),
    
    body('renavam')
      .optional()
      .isString().trim().isLength({ min: 1, max: 20 }).withMessage('Renavam deve ter entre 1 e 20 caracteres'),
    
    body('chassi')
      .optional()
      .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Chassi deve ter entre 1 e 50 caracteres'),
    
    body('modelo')
      .optional()
      .isString().trim().isLength({ min: 1, max: 100 }).withMessage('Modelo deve ter entre 1 e 100 caracteres'),
    
    body('marca')
      .optional()
      .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Marca deve ter entre 1 e 50 caracteres'),
    
    body('fabricante')
      .optional()
      .isString().trim().isLength({ min: 1, max: 100 }).withMessage('Fabricante deve ter entre 1 e 100 caracteres'),
    
    body('ano_fabricacao')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Ano de fabricação deve ser válido'),
    
    body('tipo_veiculo')
      .optional()
      .isIn(['caminhao', 'van', 'carro', 'moto', 'onibus']).withMessage('Tipo deve ser caminhao, van, carro, moto ou onibus'),
    
    body('carroceria')
      .optional()
      .isIn(['Bau', 'Refrigerado', 'Bipartido', 'Grade Baixa', 'Sider', 'Graneleiro', 'Tanque', 'Cacamba']).withMessage('Carroceria deve ser um dos tipos válidos'),
    
    body('combustivel')
      .optional()
      .isIn(['gasolina', 'diesel', 'etanol', 'flex', 'GNV', 'eletrico']).withMessage('Combustível deve ser um dos tipos válidos'),
    
    body('categoria')
      .optional()
      .isIn(['carga', 'passageiros', 'utilitario', 'especial']).withMessage('Categoria deve ser carga, passageiros, utilitario ou especial'),
    
    body('capacidade_carga')
      .optional()
      .isFloat({ min: 0 }).withMessage('Capacidade de carga deve ser um número positivo'),
    
    body('capacidade_volume')
      .optional()
      .isFloat({ min: 0 }).withMessage('Capacidade de volume deve ser um número positivo'),
    
    body('numero_eixos')
      .optional()
      .isInt({ min: 1 }).withMessage('Número de eixos deve ser um número inteiro positivo'),
    
    body('tara')
      .optional()
      .isFloat({ min: 0 }).withMessage('Tara deve ser um número positivo'),
    
    body('peso_bruto_total')
      .optional()
      .isFloat({ min: 0 }).withMessage('Peso bruto total deve ser um número positivo'),
    
    body('potencia_motor')
      .optional()
      .isFloat({ min: 0 }).withMessage('Potência do motor deve ser um número positivo'),
    
    body('tipo_tracao')
      .optional()
      .isIn(['4x2', '4x4', 'dianteira', 'traseira']).withMessage('Tipo de tração deve ser 4x2, 4x4, dianteira ou traseira'),
    
    body('quilometragem_atual')
      .optional()
      .isFloat({ min: 0 }).withMessage('Quilometragem atual deve ser um número positivo'),
    
    body('data_emplacamento')
      .optional()
      .isDate().withMessage('Data de emplacamento deve ser uma data válida'),
    
    body('vencimento_licenciamento')
      .optional()
      .isDate().withMessage('Vencimento do licenciamento deve ser uma data válida'),
    
    body('vencimento_ipva')
      .optional()
      .isDate().withMessage('Vencimento do IPVA deve ser uma data válida'),
    
    body('vencimento_dpvat')
      .optional()
      .isDate().withMessage('Vencimento do DPVAT deve ser uma data válida'),
    
    body('numero_apolice_seguro')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('Número da apólice deve ter no máximo 50 caracteres'),
    
    body('situacao_documental')
      .optional()
      .isIn(['regular', 'alienado', 'bloqueado']).withMessage('Situação documental deve ser regular, alienado ou bloqueado'),
    
    body('data_ultima_revisao')
      .optional()
      .isDate().withMessage('Data da última revisão deve ser uma data válida'),
    
    body('quilometragem_proxima_revisao')
      .optional()
      .isFloat({ min: 0 }).withMessage('Quilometragem da próxima revisão deve ser um número positivo'),
    
    body('data_ultima_troca_oleo')
      .optional()
      .isDate().withMessage('Data da última troca de óleo deve ser uma data válida'),
    
    body('vencimento_alinhamento_balanceamento')
      .optional()
      .isDate().withMessage('Vencimento do alinhamento/balanceamento deve ser uma data válida'),
    
    body('proxima_inspecao_veicular')
      .optional()
      .isDate().withMessage('Próxima inspeção veicular deve ser uma data válida'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'manutencao']).withMessage('Status deve ser ativo, inativo ou manutencao'),
    
    body('status_detalhado')
      .optional()
      .isIn(['Ativo', 'Em manutencao', 'Alugado', 'Vendido']).withMessage('Status detalhado deve ser Ativo, Em manutencao, Alugado ou Vendido'),
    
    body('data_aquisicao')
      .optional()
      .isDate().withMessage('Data de aquisição deve ser uma data válida'),
    
    body('valor_compra')
      .optional()
      .isFloat({ min: 0 }).withMessage('Valor de compra deve ser um número positivo'),
    
    body('fornecedor')
      .optional()
      .isString().trim().isLength({ max: 200 }).withMessage('Fornecedor deve ter no máximo 200 caracteres'),
    
    body('numero_frota')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Número da frota deve ter no máximo 20 caracteres'),
    
    body('situacao_financeira')
      .optional()
      .isIn(['Proprio', 'Financiado', 'leasing']).withMessage('Situação financeira deve ser Proprio, Financiado ou leasing'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ],

  // Validações para atualização de veículo
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    
    body('placa')
      .optional()
      .isString().trim().isLength({ min: 1, max: 10 }).withMessage('Placa deve ter entre 1 e 10 caracteres'),
    
    body('renavam')
      .optional()
      .isString().trim().isLength({ min: 1, max: 20 }).withMessage('Renavam deve ter entre 1 e 20 caracteres'),
    
    body('chassi')
      .optional()
      .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Chassi deve ter entre 1 e 50 caracteres'),
    
    body('modelo')
      .optional()
      .isString().trim().isLength({ min: 1, max: 100 }).withMessage('Modelo deve ter entre 1 e 100 caracteres'),
    
    body('marca')
      .optional()
      .isString().trim().isLength({ min: 1, max: 50 }).withMessage('Marca deve ter entre 1 e 50 caracteres'),
    
    body('fabricante')
      .optional()
      .isString().trim().isLength({ min: 1, max: 100 }).withMessage('Fabricante deve ter entre 1 e 100 caracteres'),
    
    body('ano_fabricacao')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Ano de fabricação deve ser válido'),
    
    body('tipo_veiculo')
      .optional()
      .isIn(['caminhao', 'van', 'carro', 'moto', 'onibus']).withMessage('Tipo deve ser caminhao, van, carro, moto ou onibus'),
    
    body('carroceria')
      .optional()
      .isIn(['Bau', 'Refrigerado', 'Bipartido', 'Grade Baixa', 'Sider', 'Graneleiro', 'Tanque', 'Cacamba']).withMessage('Carroceria deve ser um dos tipos válidos'),
    
    body('combustivel')
      .optional()
      .isIn(['gasolina', 'diesel', 'etanol', 'flex', 'GNV', 'eletrico']).withMessage('Combustível deve ser um dos tipos válidos'),
    
    body('categoria')
      .optional()
      .isIn(['carga', 'passageiros', 'utilitario', 'especial']).withMessage('Categoria deve ser carga, passageiros, utilitario ou especial'),
    
    body('capacidade_carga')
      .optional()
      .isFloat({ min: 0 }).withMessage('Capacidade de carga deve ser um número positivo'),
    
    body('capacidade_volume')
      .optional()
      .isFloat({ min: 0 }).withMessage('Capacidade de volume deve ser um número positivo'),
    
    body('numero_eixos')
      .optional()
      .isInt({ min: 1 }).withMessage('Número de eixos deve ser um número inteiro positivo'),
    
    body('tara')
      .optional()
      .isFloat({ min: 0 }).withMessage('Tara deve ser um número positivo'),
    
    body('peso_bruto_total')
      .optional()
      .isFloat({ min: 0 }).withMessage('Peso bruto total deve ser um número positivo'),
    
    body('potencia_motor')
      .optional()
      .isFloat({ min: 0 }).withMessage('Potência do motor deve ser um número positivo'),
    
    body('tipo_tracao')
      .optional()
      .isIn(['4x2', '4x4', 'dianteira', 'traseira']).withMessage('Tipo de tração deve ser 4x2, 4x4, dianteira ou traseira'),
    
    body('quilometragem_atual')
      .optional()
      .isFloat({ min: 0 }).withMessage('Quilometragem atual deve ser um número positivo'),
    
    body('data_emplacamento')
      .optional()
      .isDate().withMessage('Data de emplacamento deve ser uma data válida'),
    
    body('vencimento_licenciamento')
      .optional()
      .isDate().withMessage('Vencimento do licenciamento deve ser uma data válida'),
    
    body('vencimento_ipva')
      .optional()
      .isDate().withMessage('Vencimento do IPVA deve ser uma data válida'),
    
    body('vencimento_dpvat')
      .optional()
      .isDate().withMessage('Vencimento do DPVAT deve ser uma data válida'),
    
    body('numero_apolice_seguro')
      .optional()
      .isString().trim().isLength({ max: 50 }).withMessage('Número da apólice deve ter no máximo 50 caracteres'),
    
    body('situacao_documental')
      .optional()
      .isIn(['regular', 'alienado', 'bloqueado']).withMessage('Situação documental deve ser regular, alienado ou bloqueado'),
    
    body('data_ultima_revisao')
      .optional()
      .isDate().withMessage('Data da última revisão deve ser uma data válida'),
    
    body('quilometragem_proxima_revisao')
      .optional()
      .isFloat({ min: 0 }).withMessage('Quilometragem da próxima revisão deve ser um número positivo'),
    
    body('data_ultima_troca_oleo')
      .optional()
      .isDate().withMessage('Data da última troca de óleo deve ser uma data válida'),
    
    body('vencimento_alinhamento_balanceamento')
      .optional()
      .isDate().withMessage('Vencimento do alinhamento/balanceamento deve ser uma data válida'),
    
    body('proxima_inspecao_veicular')
      .optional()
      .isDate().withMessage('Próxima inspeção veicular deve ser uma data válida'),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'manutencao']).withMessage('Status deve ser ativo, inativo ou manutencao'),
    
    body('status_detalhado')
      .optional()
      .isIn(['Ativo', 'Em manutencao', 'Alugado', 'Vendido']).withMessage('Status detalhado deve ser Ativo, Em manutencao, Alugado ou Vendido'),
    
    body('data_aquisicao')
      .optional()
      .isDate().withMessage('Data de aquisição deve ser uma data válida'),
    
    body('valor_compra')
      .optional()
      .isFloat({ min: 0 }).withMessage('Valor de compra deve ser um número positivo'),
    
    body('fornecedor')
      .optional()
      .isString().trim().isLength({ max: 200 }).withMessage('Fornecedor deve ter no máximo 200 caracteres'),
    
    body('numero_frota')
      .optional()
      .isString().trim().isLength({ max: 20 }).withMessage('Número da frota deve ter no máximo 20 caracteres'),
    
    body('situacao_financeira')
      .optional()
      .isIn(['Proprio', 'Financiado', 'leasing']).withMessage('Situação financeira deve ser Proprio, Financiado ou leasing'),
    
    body('observacoes')
      .optional()
      .isString().trim().isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ]
};

module.exports = {
  veiculoValidations,
  commonValidations
};
