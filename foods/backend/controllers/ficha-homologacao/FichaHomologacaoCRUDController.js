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
const path = require('path');
const fs = require('fs');

class FichaHomologacaoCRUDController {
  
  /**
   * Criar nova ficha de homologação
   */
  static criarFichaHomologacao = asyncHandler(async (req, res) => {
    const {
      produto_generico_id,
      tipo,
      data_analise,
      marca,
      fabricante,
      fornecedor_id,
      composicao,
      fabricacao,
      lote,
      validade,
      unidade_medida_id,
      peso,
      peso_valor,
      peso_cru,
      peso_cru_valor,
      peso_cozido,
      peso_cozido_valor,
      fator_coccao,
      fator_coccao_valor,
      cor,
      cor_observacao,
      odor,
      odor_observacao,
      sabor,
      sabor_observacao,
      aparencia,
      aparencia_observacao,
      conclusao,
      resultado_final,
      avaliador_id,
      foto_embalagem,
      foto_produto_cru,
      foto_produto_cozido,
      pdf_avaliacao_antiga,
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

    // Processar upload de arquivos
    let fotoEmbalagemPath = null;
    let fotoProdutoCruPath = null;
    let fotoProdutoCozidoPath = null;
    let pdfAvaliacaoAntigaPath = null;

    if (req.files) {
      // Processar foto_embalagem
      if (req.files.foto_embalagem && req.files.foto_embalagem[0]) {
        const file = req.files.foto_embalagem[0];
        const foodsRoot = path.join(__dirname, '../..');
        fotoEmbalagemPath = path.relative(foodsRoot, file.path).replace(/\\/g, '/');
      }

      // Processar foto_produto_cru
      if (req.files.foto_produto_cru && req.files.foto_produto_cru[0]) {
        const file = req.files.foto_produto_cru[0];
        const foodsRoot = path.join(__dirname, '../..');
        fotoProdutoCruPath = path.relative(foodsRoot, file.path).replace(/\\/g, '/');
      }

      // Processar foto_produto_cozido
      if (req.files.foto_produto_cozido && req.files.foto_produto_cozido[0]) {
        const file = req.files.foto_produto_cozido[0];
        const foodsRoot = path.join(__dirname, '../..');
        fotoProdutoCozidoPath = path.relative(foodsRoot, file.path).replace(/\\/g, '/');
      }

      // Processar pdf_avaliacao_antiga
      if (req.files.pdf_avaliacao_antiga && req.files.pdf_avaliacao_antiga[0]) {
        const file = req.files.pdf_avaliacao_antiga[0];
        const foodsRoot = path.join(__dirname, '../..');
        pdfAvaliacaoAntigaPath = path.relative(foodsRoot, file.path).replace(/\\/g, '/');
      }
    }

    // Se não houver arquivos no upload mas houver no body (edição mantendo arquivos existentes)
    // Usar os valores do body se não foram enviados novos arquivos
    if (!fotoEmbalagemPath && foto_embalagem && typeof foto_embalagem === 'string' && !foto_embalagem.startsWith('data:')) {
      fotoEmbalagemPath = foto_embalagem;
    }
    if (!fotoProdutoCruPath && foto_produto_cru && typeof foto_produto_cru === 'string' && !foto_produto_cru.startsWith('data:')) {
      fotoProdutoCruPath = foto_produto_cru;
    }
    if (!fotoProdutoCozidoPath && foto_produto_cozido && typeof foto_produto_cozido === 'string' && !foto_produto_cozido.startsWith('data:')) {
      fotoProdutoCozidoPath = foto_produto_cozido;
    }
    if (!pdfAvaliacaoAntigaPath && pdf_avaliacao_antiga && typeof pdf_avaliacao_antiga === 'string' && !pdf_avaliacao_antiga.startsWith('data:')) {
      pdfAvaliacaoAntigaPath = pdf_avaliacao_antiga;
    }

    // Inserir nova ficha de homologação
    const result = await executeQuery(
      `INSERT INTO ficha_homologacao (
        produto_generico_id, tipo, data_analise, marca, fabricante, fornecedor_id,
        composicao, fabricacao, lote, validade, unidade_medida_id,
        peso, peso_valor, peso_cru, peso_cru_valor, peso_cozido, peso_cozido_valor, fator_coccao, fator_coccao_valor, cor, cor_observacao, odor, odor_observacao, sabor, sabor_observacao, aparencia, aparencia_observacao,
        conclusao, resultado_final, avaliador_id, foto_embalagem, foto_produto_cru, foto_produto_cozido, pdf_avaliacao_antiga, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        produto_generico_id, tipo, data_analise, marca, fabricante, fornecedor_id,
        composicao, fabricacao, lote, validade, unidade_medida_id,
        peso, peso_valor || null, peso_cru, peso_cru_valor || null, peso_cozido, peso_cozido_valor || null, fator_coccao, fator_coccao_valor || null, cor, cor_observacao || null, odor, odor_observacao || null, sabor, sabor_observacao || null, aparencia, aparencia_observacao || null,
        conclusao, resultado_final || null, avaliador_id, fotoEmbalagemPath, fotoProdutoCruPath, fotoProdutoCozidoPath, pdfAvaliacaoAntigaPath, status || 'ativo'
      ]
    );

    // Buscar ficha de homologação criada
    const fichaHomologacaoCriada = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_nome_fantasia,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome,
        u.email as avaliador_email
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
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
      marca,
      fabricante,
      fornecedor_id,
      composicao,
      fabricacao,
      lote,
      validade,
      unidade_medida_id,
      peso,
      peso_valor,
      peso_cru,
      peso_cru_valor,
      peso_cozido,
      peso_cozido_valor,
      fator_coccao,
      fator_coccao_valor,
      cor,
      cor_observacao,
      odor,
      odor_observacao,
      sabor,
      sabor_observacao,
      aparencia,
      aparencia_observacao,
      conclusao,
      resultado_final,
      avaliador_id,
      foto_embalagem,
      foto_produto_cru,
      foto_produto_cozido,
      pdf_avaliacao_antiga,
      status
    } = req.body;

    // Verificar se ficha de homologação existe e buscar arquivos existentes
    const fichaHomologacao = await executeQuery(
      'SELECT id, foto_embalagem, foto_produto_cru, foto_produto_cozido, pdf_avaliacao_antiga FROM ficha_homologacao WHERE id = ?',
      [id]
    );

    if (fichaHomologacao.length === 0) {
      return notFoundResponse(res, 'Ficha de homologação não encontrada');
    }

    const fichaExistente = fichaHomologacao[0];

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

    // Processar upload de arquivos
    let fotoEmbalagemPath = fichaExistente.foto_embalagem;
    let fotoProdutoCruPath = fichaExistente.foto_produto_cru;
    let fotoProdutoCozidoPath = fichaExistente.foto_produto_cozido;
    let pdfAvaliacaoAntigaPath = fichaExistente.pdf_avaliacao_antiga;

    // Função auxiliar para deletar arquivo antigo
    const deletarArquivoAntigo = (caminhoAntigo) => {
      if (caminhoAntigo) {
        try {
          const foodsRoot = path.join(__dirname, '../..');
          const caminhoCompleto = path.join(foodsRoot, caminhoAntigo);
          if (fs.existsSync(caminhoCompleto)) {
            fs.unlinkSync(caminhoCompleto);
          }
        } catch (error) {
          console.error('Erro ao deletar arquivo antigo:', error);
        }
      }
    };

    if (req.files) {
      // Processar foto_embalagem
      if (req.files.foto_embalagem && req.files.foto_embalagem[0]) {
        // Deletar arquivo antigo se existir
        if (fotoEmbalagemPath) {
          deletarArquivoAntigo(fotoEmbalagemPath);
        }
        const file = req.files.foto_embalagem[0];
        const foodsRoot = path.join(__dirname, '../..');
        fotoEmbalagemPath = path.relative(foodsRoot, file.path).replace(/\\/g, '/');
      }

      // Processar foto_produto_cru
      if (req.files.foto_produto_cru && req.files.foto_produto_cru[0]) {
        // Deletar arquivo antigo se existir
        if (fotoProdutoCruPath) {
          deletarArquivoAntigo(fotoProdutoCruPath);
        }
        const file = req.files.foto_produto_cru[0];
        const foodsRoot = path.join(__dirname, '../..');
        fotoProdutoCruPath = path.relative(foodsRoot, file.path).replace(/\\/g, '/');
      }

      // Processar foto_produto_cozido
      if (req.files.foto_produto_cozido && req.files.foto_produto_cozido[0]) {
        // Deletar arquivo antigo se existir
        if (fotoProdutoCozidoPath) {
          deletarArquivoAntigo(fotoProdutoCozidoPath);
        }
        const file = req.files.foto_produto_cozido[0];
        const foodsRoot = path.join(__dirname, '../..');
        fotoProdutoCozidoPath = path.relative(foodsRoot, file.path).replace(/\\/g, '/');
      }

      // Processar pdf_avaliacao_antiga
      if (req.files.pdf_avaliacao_antiga && req.files.pdf_avaliacao_antiga[0]) {
        // Deletar arquivo antigo se existir
        if (pdfAvaliacaoAntigaPath) {
          deletarArquivoAntigo(pdfAvaliacaoAntigaPath);
        }
        const file = req.files.pdf_avaliacao_antiga[0];
        const foodsRoot = path.join(__dirname, '../..');
        pdfAvaliacaoAntigaPath = path.relative(foodsRoot, file.path).replace(/\\/g, '/');
      }
    }

    // Se não houver arquivos no upload, verificar se há valores no body
    // Isso acontece quando não há novos arquivos sendo enviados (edição sem alterar arquivos)
    if (!req.files || (!req.files.foto_embalagem && !req.files.foto_produto_cru && !req.files.foto_produto_cozido && !req.files.pdf_avaliacao_antiga)) {
      // Se não há arquivos sendo enviados, verificar se há valores no body para manter ou remover
      if (foto_embalagem !== undefined) {
        if (foto_embalagem && typeof foto_embalagem === 'string' && !foto_embalagem.startsWith('data:') && !foto_embalagem.startsWith('http')) {
          fotoEmbalagemPath = foto_embalagem;
        } else if (foto_embalagem === null || foto_embalagem === '') {
          // Se foi enviado null ou vazio explicitamente, deletar arquivo antigo
          deletarArquivoAntigo(fotoEmbalagemPath);
          fotoEmbalagemPath = null;
        }
        // Se foto_embalagem for undefined, manter o valor existente (não fazer nada)
      }
      
      if (foto_produto_cru !== undefined) {
        if (foto_produto_cru && typeof foto_produto_cru === 'string' && !foto_produto_cru.startsWith('data:') && !foto_produto_cru.startsWith('http')) {
          fotoProdutoCruPath = foto_produto_cru;
        } else if (foto_produto_cru === null || foto_produto_cru === '') {
          deletarArquivoAntigo(fotoProdutoCruPath);
          fotoProdutoCruPath = null;
        }
      }
      
      if (foto_produto_cozido !== undefined) {
        if (foto_produto_cozido && typeof foto_produto_cozido === 'string' && !foto_produto_cozido.startsWith('data:') && !foto_produto_cozido.startsWith('http')) {
          fotoProdutoCozidoPath = foto_produto_cozido;
        } else if (foto_produto_cozido === null || foto_produto_cozido === '') {
          deletarArquivoAntigo(fotoProdutoCozidoPath);
          fotoProdutoCozidoPath = null;
        }
      }
      
      if (pdf_avaliacao_antiga !== undefined) {
        if (pdf_avaliacao_antiga && typeof pdf_avaliacao_antiga === 'string' && !pdf_avaliacao_antiga.startsWith('data:') && !pdf_avaliacao_antiga.startsWith('http')) {
          pdfAvaliacaoAntigaPath = pdf_avaliacao_antiga;
        } else if (pdf_avaliacao_antiga === null || pdf_avaliacao_antiga === '') {
          deletarArquivoAntigo(pdfAvaliacaoAntigaPath);
          pdfAvaliacaoAntigaPath = null;
        }
      }
    }

    // Atualizar ficha de homologação
    await executeQuery(
      `UPDATE ficha_homologacao SET
        produto_generico_id = ?,
        tipo = ?,
        data_analise = ?,
        marca = ?,
        fabricante = ?,
        fornecedor_id = ?,
        composicao = ?,
        fabricacao = ?,
        lote = ?,
        validade = ?,
        unidade_medida_id = ?,
        peso = ?,
        peso_valor = ?,
        peso_cru = ?,
        peso_cru_valor = ?,
        peso_cozido = ?,
        peso_cozido_valor = ?,
        fator_coccao = ?,
        fator_coccao_valor = ?,
        cor = ?,
        cor_observacao = ?,
        odor = ?,
        odor_observacao = ?,
        sabor = ?,
        sabor_observacao = ?,
        aparencia = ?,
        aparencia_observacao = ?,
        conclusao = ?,
        resultado_final = ?,
        avaliador_id = ?,
        foto_embalagem = ?,
        foto_produto_cru = ?,
        foto_produto_cozido = ?,
        pdf_avaliacao_antiga = ?,
        status = ?
      WHERE id = ?`,
      [
        produto_generico_id, tipo, data_analise, marca, fabricante, fornecedor_id,
        composicao, fabricacao, lote, validade, unidade_medida_id,
        peso, peso_valor || null, peso_cru, peso_cru_valor || null, peso_cozido, peso_cozido_valor || null, fator_coccao, fator_coccao_valor || null, cor, cor_observacao || null, odor, odor_observacao || null, sabor, sabor_observacao || null, aparencia, aparencia_observacao || null,
        conclusao, resultado_final || null, avaliador_id, fotoEmbalagemPath, fotoProdutoCruPath, fotoProdutoCozidoPath, pdfAvaliacaoAntigaPath, status, id
      ]
    );

    // Buscar ficha de homologação atualizada
    const fichaHomologacaoAtualizada = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_nome_fantasia,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome,
        u.email as avaliador_email
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
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

    // Verificar se ficha de homologação existe e buscar arquivos
    const fichaHomologacao = await executeQuery(
      'SELECT id, foto_embalagem, foto_produto_cru, foto_produto_cozido, pdf_avaliacao_antiga FROM ficha_homologacao WHERE id = ?',
      [id]
    );

    if (fichaHomologacao.length === 0) {
      return notFoundResponse(res, 'Ficha de homologação não encontrada');
    }

    const ficha = fichaHomologacao[0];

    // Deletar arquivos do servidor
    const foodsRoot = path.join(__dirname, '../..');
    const arquivosParaDeletar = [
      ficha.foto_embalagem,
      ficha.foto_produto_cru,
      ficha.foto_produto_cozido,
      ficha.pdf_avaliacao_antiga
    ].filter(arquivo => arquivo);

    arquivosParaDeletar.forEach(arquivo => {
      try {
        const caminhoCompleto = path.join(foodsRoot, arquivo);
        if (fs.existsSync(caminhoCompleto)) {
          fs.unlinkSync(caminhoCompleto);
        }
      } catch (error) {
        console.error('Erro ao deletar arquivo:', error);
      }
    });

    // Excluir ficha de homologação
    await executeQuery(
      'DELETE FROM ficha_homologacao WHERE id = ?',
      [id]
    );

    successResponse(res, null, 'Ficha de homologação excluída com sucesso');
  });
}

module.exports = FichaHomologacaoCRUDController;

