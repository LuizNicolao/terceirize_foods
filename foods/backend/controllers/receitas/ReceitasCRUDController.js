/**
 * Controller CRUD de Receitas
 * Implementa operações de criação, atualização e exclusão de receitas
 */

const ReceitasPdfService = require('../../services/receitasPdfService');
const {
  computeFileHash,
  computeNormalizedHash,
  findDuplicateUpload,
  insertUploadWithRecipes
} = require('../../services/pdfUploadService');

const receitasPdfService = new ReceitasPdfService();

class ReceitasCRUDController {
  /**
   * Criar novo receita
   */
  static async criar(req, res) {
    try {
      const dados = req.body;
      const receita = await ReceitasCRUDController.criarReceita(dados);

      res.status(201).json({
        success: true,
        data: receita,
        message: 'Receita criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar receita
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;
      
      const receita = await ReceitasCRUDController.atualizarReceita(parseInt(id), dados);

      if (!receita) {
        return res.status(404).json({
          success: false,
          error: 'Receita não encontrada'
        });
      }

      res.json({
        success: true,
        data: receita,
        message: 'Receita atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Excluir receita
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;
      const sucesso = await ReceitasCRUDController.excluirReceita(parseInt(id));

      if (!sucesso) {
        return res.status(404).json({
          success: false,
          error: 'Receita não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Receita excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }


  // ===== MÉTODOS DE LÓGICA DE NEGÓCIO =====

  /**
   * Criar novo receita
   */
  static async criarReceita(dados) {
    try {
      const { executeQuery } = require('../../config/database');
      
      // Gerar código interno único
      const codigoInterno = `REC-${Date.now()}`;
      
      // Preparar ingredientes - converter array para JSON string se necessário
      let ingredientesJson = null;
      if (dados.ingredientes) {
        if (Array.isArray(dados.ingredientes)) {
          ingredientesJson = JSON.stringify(dados.ingredientes);
        } else if (typeof dados.ingredientes === 'string') {
          ingredientesJson = dados.ingredientes;
        }
      }
      
      // Preparar texto extraído (pode vir como texto_extraido_pdf)
      const textoExtraido = dados.texto_extraido || dados.texto_extraido_pdf || null;
      
      const query = `
        INSERT INTO receitas_processadas (
          codigo_interno, codigo_referencia, nome, descricao, texto_extraido, ingredientes,
          origem, tipo, status, observacoes, criado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        codigoInterno,
        dados.codigo_referencia || null,
        dados.nome || null,
        dados.descricao || null,
        textoExtraido,
        ingredientesJson,
        dados.origem || 'pdf',
        dados.tipo || 'receita',
        dados.status || 'rascunho',
        dados.observacoes || null,
        dados.criado_por || null
      ];
      
      const result = await executeQuery(query, params);
      
      // Buscar a receita criada
      const receitaCriada = await ReceitasCRUDController.buscarReceitaPorId(result.insertId);
      
      return receitaCriada;
    } catch (error) {
      console.error('Erro no service de criar receita:', error);
      throw error;
    }
  }

  /**
   * Atualizar receita
   */
  static async atualizarReceita(id, dados) {
    try {
      const { executeQuery } = require('../../config/database');
      
      const query = `
        UPDATE receitas_processadas SET
          codigo_referencia = ?,
          nome = ?,
          descricao = ?,
          texto_extraido = ?,
          ingredientes = ?,
          tipo = ?,
          status = ?,
          observacoes = ?,
          atualizado_por = ?
        WHERE id = ?
      `;
      
      const params = [
        dados.codigo_referencia,
        dados.nome,
        dados.descricao || null,
        dados.texto_extraido || null,
        dados.ingredientes || null,
        dados.tipo,
        dados.status,
        dados.observacoes || null,
        dados.atualizado_por || null,
        id
      ];
      
      await executeQuery(query, params);
      
      // Buscar a receita atualizada
      const receitaAtualizada = await ReceitasCRUDController.buscarReceitaPorId(id);
      
      return receitaAtualizada;
    } catch (error) {
      console.error('Erro no service de atualizar receita:', error);
      throw error;
    }
  }

  /**
   * Excluir receita
   */
  static async excluirReceita(id) {
    try {
      const { executeQuery } = require('../../config/database');
      
      const query = `DELETE FROM receitas_processadas WHERE id = ?`;
      await executeQuery(query, [id]);
      
      return true;
    } catch (error) {
      console.error('Erro no service de excluir receita:', error);
      throw error;
    }
  }

  /**
   * Buscar receita por ID
   */
  static async buscarReceitaPorId(id) {
    try {
      const { executeQuery } = require('../../config/database');
      
      const query = `
        SELECT 
          id,
          codigo_interno,
          codigo_referencia,
          nome,
          descricao,
          ingredientes,
          origem,
          tipo,
          status,
          observacoes,
          criado_em,
          atualizado_em,
          criado_por,
          atualizado_por
        FROM receitas_processadas 
        WHERE id = ?
      `;
      
      const result = await executeQuery(query, [id]);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar receita por ID:', error);
      throw error;
    }
  }

  /**
   * Processar PDF de receita e extrair ingredientes
   */
  static async processarPDF(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo PDF é obrigatório'
        });
      }

      console.log('\n' + '='.repeat(80));
      console.log('📄 INICIANDO PROCESSAMENTO DE PDF DE RECEITA');
      console.log('='.repeat(80));
      console.log('📊 Tamanho do arquivo:', req.file.size, 'bytes');
      console.log('📋 Nome do arquivo:', req.file.originalname);
      console.log('📋 Tipo MIME:', req.file.mimetype);

      const resultado = await receitasPdfService.processar(req.file.buffer, req.file.originalname);
      const { dadosExtraidos, receitasEstruturadas, debugPaths, resumo, reports, resultadoPython } = resultado;

      const fileHash = computeFileHash(req.file.buffer);
      const normalizedHash = computeNormalizedHash(reports.normalizedCardapio);

      const existingUpload = await findDuplicateUpload({ fileHash, normalizedHash });
      let uploadInfo = null;

      if (existingUpload && existingUpload.status !== 'discarded') {
        uploadInfo = {
          duplicate: true,
          uploadId: existingUpload.id,
          status: existingUpload.status
        };
      } else {
        const insertResult = await insertUploadWithRecipes({
          originalName: req.file.originalname,
          fileHash,
          normalizedHash,
          periodLabel: resultadoPython?.metadados?.periodo || null,
          pages: resultadoPython?.metadados?.total_paginas || null,
          normalizedCardapio: reports.normalizedCardapio,
          receitas: receitasEstruturadas,
          status: 'committed'
        });

        uploadInfo = {
          duplicate: false,
          uploadId: insertResult.uploadId,
          totalReceitasRegistradas: insertResult.totalReceitas
        };
      }

      console.log('\n✅ PROCESSAMENTO CONCLUÍDO:');
      console.log('='.repeat(80));
      console.log('📋 Resumo dos dados extraídos:');
      console.log('   - Receitas únicas identificadas:', receitasEstruturadas.length);
      console.log('   - Código de Referência (primeira receita):', dadosExtraidos.codigo_referencia || 'Não encontrado');
      console.log('   - Nome (primeira receita):', dadosExtraidos.nome || 'Não identificado');
      console.log('   - Tipo (primeira receita):', dadosExtraidos.tipo || 'Não identificado');
      console.log('   - Total de ingredientes (primeira receita):', dadosExtraidos.ingredientes.length);
      console.log('   - Total de refeições:', resumo.total_refeicoes);
      console.log('   - Total de dias:', resumo.total_dias);
      console.log('   - Caminho debug JSON:', debugPaths.json);
      console.log('   - Caminho debug TXT:', debugPaths.texto);
      console.log('='.repeat(80));

      res.json({
        success: true,
        data: {
          ...dadosExtraidos,
          upload: uploadInfo,
          resumo,
          reports: {
            raw_json: debugPaths.json,
            raw_txt: debugPaths.texto,
            processed_json: reports.json,
            processed_txt: reports.txt
          }
        },
        message: uploadInfo?.duplicate
          ? 'PDF já processado anteriormente. Dados retornados para conferência.'
          : 'PDF processado e receitas registradas com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao processar PDF:', error);
      const statusCode = error.status || 500;
      res.status(statusCode).json({
        success: false,
        error: statusCode === 500 ? 'Erro interno do servidor' : error.message,
        message: error.message || 'Não foi possível processar o PDF'
      });
    }
  }

}

module.exports = ReceitasCRUDController;
