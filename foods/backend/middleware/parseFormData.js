/**
 * Middleware para parsear campos JSON do FormData
 * Quando FormData é enviado, campos complexos como arrays vêm como strings JSON
 */

const parseFormData = (req, res, next) => {
  // Se houver arquivo(s) (multer processou), pode ser FormData
  // Verificar tanto req.file (singular) quanto req.files (plural)
  // Também verificar se req.body existe e tem conteúdo (mesmo sem arquivos, pode ser FormData)
  const hasFiles = req.file || req.files;
  const hasBody = req.body && Object.keys(req.body).length > 0;
  
  if (hasFiles || hasBody) {
    // Parsear campo itens se for string JSON
    if (req.body.itens && typeof req.body.itens === 'string') {
      try {
        req.body.itens = JSON.parse(req.body.itens);
      } catch (e) {
        // Se não conseguir parsear, deixar como está para o validador tratar
      }
    }

    // Campos que devem ser inteiros
    const integerFields = [
      'fornecedor_id', 'filial_id', 'almoxarifado_id', 'pedido_compra_id', 'rir_id',
      'volumes_quantidade',
      // Campos da ficha de homologação (inteiros)
      'produto_generico_id', 'avaliador_id', 'unidade_medida_id'
    ];

    integerFields.forEach(field => {
      const value = req.body[field];
      const originalValue = value;
      // Tratar strings "null", "undefined", vazias ou undefined
      if (value === '' || value === 'null' || value === 'undefined' || value === undefined || value === null) {
        req.body[field] = null;
      } else if (typeof value === 'string' || typeof value === 'number') {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) {
          req.body[field] = numValue;
        } else {
          // Se não conseguir converter, manter como está (será validado depois)
          req.body[field] = value;
        }
      }
    });

    // Campos que devem ser decimais (float)
    const decimalFields = [
      'valor_produtos', 'valor_frete', 'valor_seguro', 'valor_desconto', 
      'valor_outras_despesas', 'valor_ipi', 'valor_icms', 'valor_icms_st',
      'valor_pis', 'valor_cofins', 'volumes_peso_bruto', 
      'volumes_peso_liquido', 'base_calculo_icms', 'base_calculo_icms_st',
      // Campos da ficha de homologação (decimais)
      'peso_valor', 'peso_cru_valor', 'peso_cozido_valor', 'fator_coccao_valor'
    ];

    decimalFields.forEach(field => {
      const value = req.body[field];
      const originalValue = value;
      // Tratar strings "null", "undefined", vazias ou undefined
      if (value === '' || value === 'null' || value === 'undefined' || value === undefined || value === null) {
        req.body[field] = null;
      } else if (typeof value === 'string' || typeof value === 'number') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          req.body[field] = numValue;
        } else {
          // Se não conseguir converter, manter como está (será validado depois)
          req.body[field] = value;
        }
      }
    });

    // Converter strings vazias para null em campos opcionais de texto
    const optionalTextFields = [
      'serie', 'chave_acesso', 'natureza_operacao', 'cfop',
      'transportadora_nome', 'transportadora_cnpj', 'transportadora_placa', 
      'transportadora_uf', 'transportadora_endereco', 'transportadora_bairro',
      'transportadora_municipio', 'transportadora_inscricao_estadual', 'codigo_antt',
      'volumes_especie', 'volumes_marca', 'informacoes_complementares', 'observacoes',
      // Campos da ficha de homologação (texto opcional)
      'marca', 'fabricante', 'composicao', 'lote', 'conclusao',
      'cor_observacao', 'odor_observacao', 'sabor_observacao', 'aparencia_observacao',
      'tipo', 'peso', 'peso_cru', 'peso_cozido', 'fator_coccao', 'cor', 'odor', 'sabor', 'aparencia',
      'resultado_final', 'fabricacao', 'validade', 'data_analise'
    ];

    optionalTextFields.forEach(field => {
      const value = req.body[field];
      const originalValue = value;
      // Tratar strings vazias, "null", "undefined" ou undefined
      if (value === '' || value === 'null' || value === 'undefined' || value === undefined) {
        req.body[field] = null;
      } else if (typeof value === 'string') {
        // Manter strings válidas, mas trim se necessário
        const trimmed = value.trim();
        req.body[field] = trimmed || null;
      }
    });
  }

  next();
};

module.exports = parseFormData;

