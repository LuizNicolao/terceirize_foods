/**
 * Controller de CRUD para Ficha Homologação
 * Responsável por operações de criação, atualização e exclusão
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class FichaHomologacaoCRUDController {
  
  /**
   * Criar nova ficha de homologação
   */
  static criarFichaHomologacao = asyncHandler(async (req, res) => {
    const {
      produto_generico_id,
      tipo,
      data_analise,
      marca_id,
      fabricante,
      fornecedor_id,
      composicao,
      fabricacao,
      lote,
      validade,
      unidade_medida_id,
      peso,
      peso_cru,
      peso_cozido,
      fator_coccao,
      cor,
      odor,
      sabor,
      aparencia,
      conclusao,
      avaliador_id,
      foto_embalagem,
      foto_produto,
      status
    } = req.body;

    // Verificar se nome genérico existe (se fornecido)
    if (produto_generico_id) {
      const nomeGenerico = await executeQuery(
        'SELECT id FROM produto_generico WHERE id = ?',
        [produto_generico_id]
      );

      if (nomeGenerico.length === 0) {
        return errorResponse(res, 'Nome genérico não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se marca existe (se fornecido)
    if (marca_id) {
      const marca = await executeQuery(
        'SELECT id FROM marcas WHERE id = ?',
        [marca_id]
      );

      if (marca.length === 0) {
        return errorResponse(res, 'Marca não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se fornecedor existe (se fornecido)
    if (fornecedor_id) {
      const fornecedor = await executeQuery(
        'SELECT id FROM fornecedores WHERE id = ?',
        [fornecedor_id]
      );

      if (fornecedor.length === 0) {
        return errorResponse(res, 'Fornecedor não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se unidade de medida existe (se fornecida)
    if (unidade_medida_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [unidade_medida_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se avaliador existe (se fornecido)
    if (avaliador_id) {
      const avaliador = await executeQuery(
        'SELECT id FROM usuarios WHERE id = ?',
        [avaliador_id]
      );

      if (avaliador.length === 0) {
        return errorResponse(res, 'Avaliador não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Inserir nova ficha de homologação
    const result = await executeQuery(
      `INSERT INTO ficha_homologacao (
        produto_generico_id, tipo, data_analise, marca_id, fabricante, fornecedor_id,
        composicao, fabricacao, lote, validade, unidade_medida_id,
        peso, peso_cru, peso_cozido, fator_coccao, cor, odor, sabor, aparencia,
        conclusao, avaliador_id, foto_embalagem, foto_produto, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        produto_generico_id, tipo, data_analise, marca_id, fabricante, fornecedor_id,
        composicao, fabricacao, lote, validade, unidade_medida_id,
        peso, peso_cru, peso_cozido, fator_coccao, cor, odor, sabor, aparencia,
        conclusao, avaliador_id, foto_embalagem, foto_produto, status || 'ativo'
      ]
    );

    // Buscar ficha de homologação criada
    const fichaHomologacaoCriada = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        m.marca as marca_nome,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_nome_fantasia,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome,
        u.email as avaliador_email
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE fh.id = ?`,
      [result.insertId]
    );

    successResponse(res, fichaHomologacaoCriada[0], 'Ficha de homologação criada com sucesso');
  });

  /**
   * Atualizar ficha de homologação
   */
  static atualizarFichaHomologacao = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      produto_generico_id,
      tipo,
      data_analise,
      marca_id,
      fabricante,
      fornecedor_id,
      composicao,
      fabricacao,
      lote,
      validade,
      unidade_medida_id,
      peso,
      peso_cru,
      peso_cozido,
      fator_coccao,
      cor,
      odor,
      sabor,
      aparencia,
      conclusao,
      avaliador_id,
      foto_embalagem,
      foto_produto,
      status
    } = req.body;

    // Verificar se ficha de homologação existe
    const fichaHomologacao = await executeQuery(
      'SELECT id FROM ficha_homologacao WHERE id = ?',
      [id]
    );

    if (fichaHomologacao.length === 0) {
      return notFoundResponse(res, 'Ficha de homologação não encontrada');
    }

    // Verificar se nome genérico existe (se fornecido)
    if (produto_generico_id !== undefined && produto_generico_id !== null) {
      const nomeGenerico = await executeQuery(
        'SELECT id FROM produto_generico WHERE id = ?',
        [produto_generico_id]
      );

      if (nomeGenerico.length === 0) {
        return errorResponse(res, 'Nome genérico não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se marca existe (se fornecido)
    if (marca_id !== undefined && marca_id !== null) {
      const marca = await executeQuery(
        'SELECT id FROM marcas WHERE id = ?',
        [marca_id]
      );

      if (marca.length === 0) {
        return errorResponse(res, 'Marca não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se fornecedor existe (se fornecido)
    if (fornecedor_id !== undefined && fornecedor_id !== null) {
      const fornecedor = await executeQuery(
        'SELECT id FROM fornecedores WHERE id = ?',
        [fornecedor_id]
      );

      if (fornecedor.length === 0) {
        return errorResponse(res, 'Fornecedor não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se unidade de medida existe (se fornecida)
    if (unidade_medida_id !== undefined && unidade_medida_id !== null) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [unidade_medida_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se avaliador existe (se fornecido)
    if (avaliador_id !== undefined && avaliador_id !== null) {
      const avaliador = await executeQuery(
        'SELECT id FROM usuarios WHERE id = ?',
        [avaliador_id]
      );

      if (avaliador.length === 0) {
        return errorResponse(res, 'Avaliador não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Atualizar ficha de homologação
    await executeQuery(
      `UPDATE ficha_homologacao SET
        produto_generico_id = ?,
        tipo = ?,
        data_analise = ?,
        marca_id = ?,
        fabricante = ?,
        fornecedor_id = ?,
        composicao = ?,
        fabricacao = ?,
        lote = ?,
        validade = ?,
        unidade_medida_id = ?,
        peso = ?,
        peso_cru = ?,
        peso_cozido = ?,
        fator_coccao = ?,
        cor = ?,
        odor = ?,
        sabor = ?,
        aparencia = ?,
        conclusao = ?,
        avaliador_id = ?,
        foto_embalagem = ?,
        foto_produto = ?,
        status = ?
      WHERE id = ?`,
      [
        produto_generico_id, tipo, data_analise, marca_id, fabricante, fornecedor_id,
        composicao, fabricacao, lote, validade, unidade_medida_id,
        peso, peso_cru, peso_cozido, fator_coccao, cor, odor, sabor, aparencia,
        conclusao, avaliador_id, foto_embalagem, foto_produto, status, id
      ]
    );

    // Buscar ficha de homologação atualizada
    const fichaHomologacaoAtualizada = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        m.marca as marca_nome,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_nome_fantasia,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome,
        u.email as avaliador_email
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE fh.id = ?`,
      [id]
    );

    successResponse(res, fichaHomologacaoAtualizada[0], 'Ficha de homologação atualizada com sucesso');
  });

  /**
   * Excluir ficha de homologação
   */
  static excluirFichaHomologacao = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se ficha de homologação existe
    const fichaHomologacao = await executeQuery(
      'SELECT id FROM ficha_homologacao WHERE id = ?',
      [id]
    );

    if (fichaHomologacao.length === 0) {
      return notFoundResponse(res, 'Ficha de homologação não encontrada');
    }

    // Excluir ficha de homologação
    await executeQuery(
      'DELETE FROM ficha_homologacao WHERE id = ?',
      [id]
    );

    successResponse(res, null, 'Ficha de homologação excluída com sucesso');
  });
}

module.exports = FichaHomologacaoCRUDController;

