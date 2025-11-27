/**
 * Controller CRUD de Notas Fiscais
 * Responsável por operações de Create, Update e Delete
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const PedidosComprasHelpers = require('../pedidos-compras/PedidosComprasHelpers');
const fs = require('fs');
const path = require('path');

class NotaFiscalCRUDController {
  
  /**
   * Criar nova nota fiscal
   */
  static criarNotaFiscal = asyncHandler(async (req, res) => {
    // Parsear campos JSON se vierem como string (FormData)
    let bodyData = { ...req.body };
    if (bodyData.itens && typeof bodyData.itens === 'string') {
      try {
        bodyData.itens = JSON.parse(bodyData.itens);
      } catch (e) {
        return errorResponse(res, 'Formato inválido do campo itens', STATUS_CODES.BAD_REQUEST);
      }
    }

    const {
      tipo_nota = 'ENTRADA',
      numero_nota,
      serie,
      chave_acesso,
      fornecedor_id,
      filial_id,
      pedido_compra_id,
      rir_id,
      almoxarifado_id,
      data_emissao,
      data_saida,
      valor_produtos = 0.00,
      valor_frete = 0.00,
      valor_seguro = 0.00,
      valor_desconto = 0.00,
      valor_outras_despesas = 0.00,
      valor_ipi = 0.00,
      valor_icms = 0.00,
      valor_icms_st = 0.00,
      valor_pis = 0.00,
      valor_cofins = 0.00,
      natureza_operacao,
      cfop,
      tipo_frete = '9-SEM_FRETE',
      transportadora_nome,
      transportadora_cnpj,
      transportadora_placa,
      transportadora_uf,
      volumes_quantidade = 0,
      volumes_especie,
      volumes_marca,
      volumes_peso_bruto = 0.000,
      volumes_peso_liquido = 0.000,
      informacoes_complementares,
      observacoes,
      xml_path,
      itens = []
    } = bodyData;

    // Validações
    if (!numero_nota) {
      return errorResponse(res, 'Número da nota é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    if (!fornecedor_id) {
      return errorResponse(res, 'Fornecedor é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    if (!filial_id) {
      return errorResponse(res, 'Filial é obrigatória', STATUS_CODES.BAD_REQUEST);
    }

    if (!almoxarifado_id) {
      return errorResponse(res, 'Almoxarifado é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    if (!data_emissao) {
      return errorResponse(res, 'Data de emissão é obrigatória', STATUS_CODES.BAD_REQUEST);
    }

    if (!data_saida) {
      return errorResponse(res, 'Data de saída é obrigatória', STATUS_CODES.BAD_REQUEST);
    }

    // Validar arquivo obrigatório
    if (!req.file) {
      return errorResponse(res, 'Arquivo da nota fiscal é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    if (!itens || itens.length === 0) {
      return errorResponse(res, 'A nota fiscal deve ter pelo menos um item', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se chave de acesso já existe (se fornecida)
    if (chave_acesso) {
      const existingNota = await executeQuery(
        'SELECT id FROM notas_fiscais WHERE chave_acesso = ?',
        [chave_acesso]
      );

      if (existingNota.length > 0) {
        return conflictResponse(res, 'Chave de acesso já cadastrada');
      }
    }

    // Verificar se já existe nota fiscal com mesmo número + série + fornecedor
    const existingNotaByNumber = await executeQuery(
      'SELECT id FROM notas_fiscais WHERE numero_nota = ? AND serie = ? AND fornecedor_id = ?',
      [numero_nota, serie || '', fornecedor_id]
    );

    if (existingNotaByNumber.length > 0) {
      return conflictResponse(res, 'Já existe uma nota fiscal com este número, série e fornecedor');
    }

    // Verificar se fornecedor existe
    const fornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE id = ?',
      [fornecedor_id]
    );

    if (fornecedor.length === 0) {
      return errorResponse(res, 'Fornecedor não encontrado', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se filial existe
    const filial = await executeQuery(
      'SELECT id FROM filiais WHERE id = ?',
      [filial_id]
    );

    if (filial.length === 0) {
      return errorResponse(res, 'Filial não encontrada', STATUS_CODES.BAD_REQUEST);
    }

    // Calcular valor total
    const valor_total = parseFloat(valor_produtos) +
      parseFloat(valor_frete || 0) +
      parseFloat(valor_seguro || 0) +
      parseFloat(valor_outras_despesas || 0) +
      parseFloat(valor_ipi || 0) +
      parseFloat(valor_icms || 0) +
      parseFloat(valor_icms_st || 0) +
      parseFloat(valor_pis || 0) +
      parseFloat(valor_cofins || 0) -
      parseFloat(valor_desconto || 0);

    // Função auxiliar para converter ISO 8601 para formato MySQL
    const convertISOToMySQL = (isoDate) => {
      if (!isoDate) return null;
      // Se já estiver no formato MySQL, retornar como está
      if (isoDate.includes(' ') && !isoDate.includes('T')) return isoDate;
      // Converter ISO 8601 para MySQL (remover timezone e T)
      if (isoDate.includes('T')) {
        const datePart = isoDate.split('T')[0];
        const timePart = isoDate.split('T')[1]?.split('.')[0] || '00:00:00';
        return `${datePart} ${timePart}`;
      }
      // Se for apenas YYYY-MM-DD, adicionar hora
      return `${isoDate} 00:00:00`;
    };

    // Converter datas para formato MySQL
    const dataEmissaoMySQL = convertISOToMySQL(data_emissao);
    const dataSaidaMySQL = convertISOToMySQL(data_saida);

    // Buscar dados do fornecedor para nomear o arquivo
    const fornecedorData = await executeQuery(
      'SELECT razao_social FROM fornecedores WHERE id = ?',
      [fornecedor_id]
    );
    const fornecedorNome = fornecedorData[0]?.razao_social || 'FORNECEDOR';

    // Processar upload do arquivo
    let arquivoPath = null;
    if (req.file) {
      // O diretório de upload já está definido no middleware
      // req.file.path contém o caminho completo do arquivo temporário
      const uploadDir = path.dirname(req.file.path);
      
      // Criar nome do arquivo: "Nº NOTA - FORNECEDOR.extensão"
      const extensao = path.extname(req.file.originalname);
      const nomeArquivo = `${numero_nota} - ${fornecedorNome}${extensao}`;
      
      // Remover caracteres inválidos do nome do arquivo
      const nomeArquivoLimpo = nomeArquivo.replace(/[<>:"/\\|?*]/g, '_');
      
      // Caminho completo do arquivo final
      const novoCaminho = path.join(uploadDir, nomeArquivoLimpo);
      
      // Se o arquivo temporário existe, renomear
      if (fs.existsSync(req.file.path)) {
        // Se já existe um arquivo com esse nome, adicionar timestamp
        if (fs.existsSync(novoCaminho)) {
          const timestamp = Date.now();
          const nomeComTimestamp = `${numero_nota} - ${fornecedorNome}_${timestamp}${extensao}`;
          const nomeComTimestampLimpo = nomeComTimestamp.replace(/[<>:"/\\|?*]/g, '_');
          arquivoPath = path.join(uploadDir, nomeComTimestampLimpo);
          fs.renameSync(req.file.path, arquivoPath);
        } else {
          fs.renameSync(req.file.path, novoCaminho);
          arquivoPath = novoCaminho;
        }
      }
      
      // Converter para caminho relativo a partir da pasta foods
      // O caminho absoluto é algo como: /home/luiznicolao/terceirize_foods/foods/arquivos/notas-fiscais/...
      // Precisamos de: arquivos/notas-fiscais/...
      const foodsRoot = path.join(__dirname, '../..'); // Volta para foods
      arquivoPath = path.relative(foodsRoot, arquivoPath).replace(/\\/g, '/');
    }

    // Data de lançamento = data/hora atual
    const dataLancamentoMySQL = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Inserir nota fiscal
    const insertQuery = `
      INSERT INTO notas_fiscais (
        tipo_nota, numero_nota, serie, chave_acesso, fornecedor_id, filial_id, pedido_compra_id, rir_id, almoxarifado_id,
        data_emissao, data_saida, data_lancamento, valor_produtos, valor_frete, valor_seguro,
        valor_desconto, valor_outras_despesas, valor_ipi, valor_icms, valor_icms_st,
        valor_pis, valor_cofins, valor_total, natureza_operacao, cfop, tipo_frete,
        transportadora_nome, transportadora_cnpj, transportadora_placa, transportadora_uf,
        volumes_quantidade, volumes_especie, volumes_marca, volumes_peso_bruto,
        volumes_peso_liquido, informacoes_complementares, observacoes, xml_path,
        status, usuario_cadastro_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const notaFiscalResult = await executeQuery(insertQuery, [
      tipo_nota, numero_nota, serie || null, chave_acesso || null, fornecedor_id, filial_id, pedido_compra_id || null, rir_id || null, almoxarifado_id || null,
      dataEmissaoMySQL, dataSaidaMySQL, dataLancamentoMySQL, valor_produtos, valor_frete, valor_seguro,
      valor_desconto, valor_outras_despesas, valor_ipi, valor_icms, valor_icms_st,
      valor_pis, valor_cofins, valor_total, natureza_operacao || null, cfop || null, tipo_frete,
      transportadora_nome || null, transportadora_cnpj || null, transportadora_placa || null, transportadora_uf || null,
      volumes_quantidade, volumes_especie || null, volumes_marca || null, volumes_peso_bruto,
      volumes_peso_liquido, informacoes_complementares || null, observacoes || null, arquivoPath || null,
      'LANCADA', req.user?.id || null
    ]);

    const notaFiscalId = notaFiscalResult.insertId;

    // Inserir itens da nota fiscal
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      const numero_item = i + 1;

      // Calcular valor total do item
      const valor_total_item = (parseFloat(item.quantidade) * parseFloat(item.valor_unitario)) - parseFloat(item.valor_desconto || 0);

      const itemQuery = `
        INSERT INTO notas_fiscais_itens (
          nota_fiscal_id, produto_generico_id, numero_item, codigo_produto, descricao,
          ncm, cfop, unidade_comercial, quantidade, valor_unitario, valor_total,
          valor_desconto, valor_frete, valor_seguro, valor_outras_despesas,
          valor_ipi, aliquota_ipi, valor_icms, aliquota_icms, valor_icms_st,
          aliquota_icms_st, valor_pis, aliquota_pis, valor_cofins, aliquota_cofins,
          informacoes_adicionais
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await executeQuery(itemQuery, [
        notaFiscalId,
        item.produto_generico_id || null,
        numero_item,
        item.codigo_produto,
        item.descricao,
        item.ncm || null,
        item.cfop || null,
        item.unidade_comercial || null,
        item.quantidade,
        item.valor_unitario,
        valor_total_item,
        item.valor_desconto || 0.00,
        item.valor_frete || 0.00,
        item.valor_seguro || 0.00,
        item.valor_outras_despesas || 0.00,
        item.valor_ipi || 0.00,
        item.aliquota_ipi || 0.00,
        item.valor_icms || 0.00,
        item.aliquota_icms || 0.00,
        item.valor_icms_st || 0.00,
        item.aliquota_icms_st || 0.00,
        item.valor_pis || 0.00,
        item.aliquota_pis || 0.00,
        item.valor_cofins || 0.00,
        item.aliquota_cofins || 0.00,
        item.informacoes_adicionais || null
      ]);
    }

    // Buscar nota fiscal criada com relacionamentos
    const notaFiscalQuery = `
      SELECT 
        nf.*,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_fantasia,
        f.cnpj as fornecedor_cnpj,
        f.email as fornecedor_email,
        f.logradouro as fornecedor_logradouro,
        f.numero as fornecedor_numero,
        f.cep as fornecedor_cep,
        f.bairro as fornecedor_bairro,
        f.municipio as fornecedor_municipio,
        f.uf as fornecedor_uf,
        fil.filial as filial_nome,
        fil.codigo_filial,
        fil.cnpj as filial_cnpj,
        fil.razao_social as filial_razao_social,
        fil.logradouro as filial_logradouro,
        fil.numero as filial_numero,
        fil.cep as filial_cep,
        fil.bairro as filial_bairro,
        fil.cidade as filial_cidade,
        fil.estado as filial_estado
      FROM notas_fiscais nf
      LEFT JOIN fornecedores f ON nf.fornecedor_id = f.id
      LEFT JOIN filiais fil ON nf.filial_id = fil.id
      WHERE nf.id = ?
    `;

    const notaFiscal = await executeQuery(notaFiscalQuery, [notaFiscalId]);

    // Buscar itens
    const itensQuery = `
      SELECT 
        nfi.*,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo
      FROM notas_fiscais_itens nfi
      LEFT JOIN produto_generico pg ON nfi.produto_generico_id = pg.id
      WHERE nfi.nota_fiscal_id = ?
      ORDER BY nfi.numero_item ASC
    `;

    const itensRetornados = await executeQuery(itensQuery, [notaFiscalId]);

    // Atualizar status do pedido de compra se houver vínculo
    if (pedido_compra_id) {
      await PedidosComprasHelpers.atualizarStatusPedido(pedido_compra_id);
    }

    // Atualizar status do RIR para FINALIZADO se houver rir_id
    if (rir_id) {
      await executeQuery(
        'UPDATE relatorio_inspecao SET status = \'FINALIZADO\', nota_fiscal_id = ? WHERE id = ?',
        [notaFiscalId, rir_id]
      );
    }

    return successResponse(res, {
      ...notaFiscal[0],
      itens: itensRetornados
    }, STATUS_CODES.CREATED);
  });

  /**
   * Atualizar nota fiscal
   */
  static atualizarNotaFiscal = asyncHandler(async (req, res) => {
    const { id } = req.params;
      const {
      tipo_nota,
      numero_nota,
      serie,
      chave_acesso,
      fornecedor_id,
      filial_id,
      pedido_compra_id,
      rir_id,
      almoxarifado_id,
      data_emissao,
      data_saida,
      valor_produtos,
      valor_frete,
      valor_seguro,
      valor_desconto,
      valor_outras_despesas,
      valor_ipi,
      valor_icms,
      valor_icms_st,
      valor_pis,
      valor_cofins,
      natureza_operacao,
      cfop,
      tipo_frete,
      transportadora_nome,
      transportadora_cnpj,
      transportadora_placa,
      transportadora_uf,
      volumes_quantidade,
      volumes_especie,
      volumes_marca,
      volumes_peso_bruto,
      volumes_peso_liquido,
      informacoes_complementares,
      observacoes,
      xml_path,
      itens
    } = req.body;

    // Verificar se nota fiscal existe
    const notaFiscal = await executeQuery(
      'SELECT id, status, pedido_compra_id FROM notas_fiscais WHERE id = ?',
      [id]
    );

    if (notaFiscal.length === 0) {
      return notFoundResponse(res, 'Nota fiscal não encontrada');
    }

    const pedidoCompraIdAnterior = notaFiscal[0].pedido_compra_id;
    const rirIdAnterior = notaFiscal[0].rir_id;

    // Notas fiscais podem ser editadas independente do status

    // Verificar se chave de acesso já existe (se fornecida e diferente da atual)
    if (chave_acesso) {
      const existingNota = await executeQuery(
        'SELECT id FROM notas_fiscais WHERE chave_acesso = ? AND id != ?',
        [chave_acesso, id]
      );

      if (existingNota.length > 0) {
        return conflictResponse(res, 'Chave de acesso já cadastrada');
      }
    }

    // Calcular valor total
    const valor_total = parseFloat(valor_produtos || 0) +
      parseFloat(valor_frete || 0) +
      parseFloat(valor_seguro || 0) +
      parseFloat(valor_outras_despesas || 0) +
      parseFloat(valor_ipi || 0) +
      parseFloat(valor_icms || 0) +
      parseFloat(valor_icms_st || 0) +
      parseFloat(valor_pis || 0) +
      parseFloat(valor_cofins || 0) -
      parseFloat(valor_desconto || 0);

    // Função auxiliar para converter ISO 8601 para formato MySQL
    const convertISOToMySQL = (isoDate) => {
      if (!isoDate) return null;
      // Se já estiver no formato MySQL, retornar como está
      if (isoDate.includes(' ') && !isoDate.includes('T')) return isoDate;
      // Converter ISO 8601 para MySQL (remover timezone e T)
      if (isoDate.includes('T')) {
        const datePart = isoDate.split('T')[0];
        const timePart = isoDate.split('T')[1]?.split('.')[0] || '00:00:00';
        return `${datePart} ${timePart}`;
      }
      // Se for apenas YYYY-MM-DD, adicionar hora
      return `${isoDate} 00:00:00`;
    };

    // Converter datas para formato MySQL
    const dataEmissaoMySQL = convertISOToMySQL(data_emissao);
    const dataSaidaMySQL = convertISOToMySQL(data_saida);

    // Atualizar nota fiscal
    const updateQuery = `
      UPDATE notas_fiscais SET
        tipo_nota = ?,
        numero_nota = ?,
        serie = ?,
        chave_acesso = ?,
        fornecedor_id = ?,
        filial_id = ?,
        pedido_compra_id = ?,
        rir_id = ?,
        almoxarifado_id = ?,
        data_emissao = ?,
        data_saida = ?,
        valor_produtos = ?,
        valor_frete = ?,
        valor_seguro = ?,
        valor_desconto = ?,
        valor_outras_despesas = ?,
        valor_ipi = ?,
        valor_icms = ?,
        valor_icms_st = ?,
        valor_pis = ?,
        valor_cofins = ?,
        valor_total = ?,
        natureza_operacao = ?,
        cfop = ?,
        tipo_frete = ?,
        transportadora_nome = ?,
        transportadora_cnpj = ?,
        transportadora_placa = ?,
        transportadora_uf = ?,
        volumes_quantidade = ?,
        volumes_especie = ?,
        volumes_marca = ?,
        volumes_peso_bruto = ?,
        volumes_peso_liquido = ?,
        informacoes_complementares = ?,
        observacoes = ?,
        xml_path = ?,
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [
      tipo_nota, numero_nota, serie, chave_acesso, fornecedor_id, filial_id, pedido_compra_id || null, rir_id || null, almoxarifado_id || null,
      dataEmissaoMySQL, dataSaidaMySQL, valor_produtos, valor_frete, valor_seguro,
      valor_desconto, valor_outras_despesas, valor_ipi, valor_icms, valor_icms_st,
      valor_pis, valor_cofins, valor_total, natureza_operacao, cfop, tipo_frete,
      transportadora_nome, transportadora_cnpj, transportadora_placa, transportadora_uf,
      volumes_quantidade, volumes_especie, volumes_marca, volumes_peso_bruto,
      volumes_peso_liquido, informacoes_complementares, observacoes, xml_path,
      id
    ]);

    // Se itens foram fornecidos, atualizar itens
    if (itens && Array.isArray(itens)) {
      // Deletar itens antigos
      await executeQuery(
        'DELETE FROM notas_fiscais_itens WHERE nota_fiscal_id = ?',
        [id]
      );

      // Inserir novos itens
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        const numero_item = i + 1;

        const valor_total_item = (parseFloat(item.quantidade) * parseFloat(item.valor_unitario)) - parseFloat(item.valor_desconto || 0);

        const itemQuery = `
          INSERT INTO notas_fiscais_itens (
            nota_fiscal_id, produto_generico_id, numero_item, codigo_produto, descricao,
            ncm, cfop, unidade_comercial, quantidade, valor_unitario, valor_total,
            valor_desconto, valor_frete, valor_seguro, valor_outras_despesas,
            valor_ipi, aliquota_ipi, valor_icms, aliquota_icms, valor_icms_st,
            aliquota_icms_st, valor_pis, aliquota_pis, valor_cofins, aliquota_cofins,
            informacoes_adicionais
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await executeQuery(itemQuery, [
          id,
          item.produto_generico_id || null,
          numero_item,
          item.codigo_produto,
          item.descricao,
          item.ncm || null,
          item.cfop || null,
          item.unidade_comercial || null,
          item.quantidade,
          item.valor_unitario,
          valor_total_item,
          item.valor_desconto || 0.00,
          item.valor_frete || 0.00,
          item.valor_seguro || 0.00,
          item.valor_outras_despesas || 0.00,
          item.valor_ipi || 0.00,
          item.aliquota_ipi || 0.00,
          item.valor_icms || 0.00,
          item.aliquota_icms || 0.00,
          item.valor_icms_st || 0.00,
          item.aliquota_icms_st || 0.00,
          item.valor_pis || 0.00,
          item.aliquota_pis || 0.00,
          item.valor_cofins || 0.00,
          item.aliquota_cofins || 0.00,
          item.informacoes_adicionais || null
        ]);
      }
    }

    // Buscar nota fiscal atualizada
    const notaFiscalQuery = `
      SELECT 
        nf.*,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_fantasia,
        f.cnpj as fornecedor_cnpj,
        f.email as fornecedor_email,
        f.logradouro as fornecedor_logradouro,
        f.numero as fornecedor_numero,
        f.cep as fornecedor_cep,
        f.bairro as fornecedor_bairro,
        f.municipio as fornecedor_municipio,
        f.uf as fornecedor_uf,
        fil.filial as filial_nome,
        fil.codigo_filial,
        fil.cnpj as filial_cnpj,
        fil.razao_social as filial_razao_social,
        fil.logradouro as filial_logradouro,
        fil.numero as filial_numero,
        fil.cep as filial_cep,
        fil.bairro as filial_bairro,
        fil.cidade as filial_cidade,
        fil.estado as filial_estado
      FROM notas_fiscais nf
      LEFT JOIN fornecedores f ON nf.fornecedor_id = f.id
      LEFT JOIN filiais fil ON nf.filial_id = fil.id
      WHERE nf.id = ?
    `;

    const notaFiscalAtualizada = await executeQuery(notaFiscalQuery, [id]);

    // Buscar itens
    const itensQuery = `
      SELECT 
        nfi.*,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo
      FROM notas_fiscais_itens nfi
      LEFT JOIN produto_generico pg ON nfi.produto_generico_id = pg.id
      WHERE nfi.nota_fiscal_id = ?
      ORDER BY nfi.numero_item ASC
    `;

    const itensAtualizados = await executeQuery(itensQuery, [id]);

    // Atualizar status do pedido de compra (tanto o anterior quanto o novo, se mudou)
    const pedidoCompraIdNovo = pedido_compra_id || notaFiscalAtualizada[0].pedido_compra_id;
    const rirIdNovo = rir_id || notaFiscalAtualizada[0].rir_id;
    
    if (pedidoCompraIdAnterior && pedidoCompraIdAnterior !== pedidoCompraIdNovo) {
      // Se mudou de pedido, atualizar ambos
      await PedidosComprasHelpers.atualizarStatusPedido(pedidoCompraIdAnterior);
    }
    
    if (pedidoCompraIdNovo) {
      await PedidosComprasHelpers.atualizarStatusPedido(pedidoCompraIdNovo);
    }

    // Gerenciar status do RIR
    // Se tinha um RIR anterior e mudou ou removeu, voltar para DISPONIVEL
    if (rirIdAnterior && rirIdAnterior !== rirIdNovo) {
      await executeQuery(
        'UPDATE relatorio_inspecao SET status = \'DISPONIVEL\', nota_fiscal_id = NULL WHERE id = ?',
        [rirIdAnterior]
      );
    }
    
    // Se tem um RIR novo (diferente do anterior), atualizar para FINALIZADO
    if (rirIdNovo && rirIdNovo !== rirIdAnterior) {
      await executeQuery(
        'UPDATE relatorio_inspecao SET status = \'FINALIZADO\', nota_fiscal_id = ? WHERE id = ?',
        [id, rirIdNovo]
      );
    }

    return successResponse(res, {
      ...notaFiscalAtualizada[0],
      itens: itensAtualizados
    });
  });

  /**
   * Excluir nota fiscal
   */
  static excluirNotaFiscal = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se nota fiscal existe
    const notaFiscal = await executeQuery(
      'SELECT id, status, pedido_compra_id, rir_id FROM notas_fiscais WHERE id = ?',
      [id]
    );

    if (notaFiscal.length === 0) {
      return notFoundResponse(res, 'Nota fiscal não encontrada');
    }

    const pedidoCompraId = notaFiscal[0].pedido_compra_id;
    const rirId = notaFiscal[0].rir_id;

    // Notas fiscais podem ser excluídas independente do status

    // Excluir nota fiscal (itens serão excluídos automaticamente por CASCADE)
    await executeQuery(
      'DELETE FROM notas_fiscais WHERE id = ?',
      [id]
    );

    // Atualizar status do pedido de compra após excluir nota fiscal
    if (pedidoCompraId) {
      await PedidosComprasHelpers.atualizarStatusPedido(pedidoCompraId);
    }

    // Atualizar status do RIR para DISPONIVEL se houver vínculo
    if (rirId) {
      await executeQuery(
        'UPDATE relatorio_inspecao SET status = \'DISPONIVEL\', nota_fiscal_id = NULL WHERE id = ?',
        [rirId]
      );
    }

    return successResponse(res, { message: 'Nota fiscal excluída com sucesso' });
  });

}

module.exports = NotaFiscalCRUDController;

