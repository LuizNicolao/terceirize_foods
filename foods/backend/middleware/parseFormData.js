/**
 * Middleware para parsear campos JSON do FormData
 * Quando FormData é enviado, campos complexos como arrays vêm como strings JSON
 */

const parseFormData = (req, res, next) => {
  // Se houver arquivo (multer processou), pode ser FormData
  if (req.file && req.body) {
    // Parsear campo itens se for string JSON
    if (req.body.itens && typeof req.body.itens === 'string') {
      try {
        req.body.itens = JSON.parse(req.body.itens);
      } catch (e) {
        // Se não conseguir parsear, deixar como está para o validador tratar
        console.error('Erro ao parsear itens do FormData:', e);
      }
    }

    // Converter campos numéricos que podem vir como strings
    const numericFields = [
      'fornecedor_id', 'filial_id', 'almoxarifado_id', 'pedido_compra_id', 'rir_id',
      'valor_produtos', 'valor_frete', 'valor_seguro', 'valor_desconto', 
      'valor_outras_despesas', 'valor_ipi', 'valor_icms', 'valor_icms_st',
      'valor_pis', 'valor_cofins', 'volumes_quantidade', 'volumes_peso_bruto', 
      'volumes_peso_liquido', 'base_calculo_icms', 'base_calculo_icms_st'
    ];

    numericFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
        const numValue = parseFloat(req.body[field]);
        if (!isNaN(numValue)) {
          req.body[field] = numValue;
        }
      } else if (req.body[field] === '') {
        // Converter strings vazias para null em campos opcionais
        req.body[field] = null;
      }
    });

    // Converter strings vazias para null em campos opcionais de texto
    const optionalTextFields = [
      'serie', 'chave_acesso', 'natureza_operacao', 'cfop',
      'transportadora_nome', 'transportadora_cnpj', 'transportadora_placa', 
      'transportadora_uf', 'transportadora_endereco', 'transportadora_bairro',
      'transportadora_municipio', 'transportadora_inscricao_estadual', 'codigo_antt',
      'volumes_especie', 'volumes_marca', 'informacoes_complementares', 'observacoes'
    ];

    optionalTextFields.forEach(field => {
      if (req.body[field] === '') {
        req.body[field] = null;
      }
    });
  }

  next();
};

module.exports = parseFormData;

