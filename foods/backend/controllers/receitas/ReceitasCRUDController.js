/**
 * Controller CRUD de Receitas
 * Implementa operações de criação, atualização e exclusão de receitas
 */

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
      
      const query = `
        INSERT INTO receitas_processadas (
          codigo_interno, codigo_referencia, nome, descricao, texto_extraido, ingredientes,
          origem, tipo, status, observacoes, criado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        codigoInterno,
        dados.codigo_referencia,
        dados.nome,
        dados.descricao || null,
        dados.texto_extraido || null,
        dados.ingredientes || null,
        dados.origem || 'manual',
        dados.tipo,
        dados.status || 'ativo',
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

      // Importar dependências necessárias
      const pdf = require('pdf-parse');
      const PDFProcessor = require('../../utils/pdfProcessor');
      const OpenAIService = require('../../services/openaiService');

      console.log('📄 Iniciando processamento de PDF de receita...');
      console.log('📊 Tamanho do arquivo:', req.file.size, 'bytes');

      // 1. Extrair texto do PDF
      const pdfData = await pdf(req.file.buffer);
      const textoExtraido = pdfData.text;

      console.log('✅ Texto extraído:', textoExtraido.length, 'caracteres');
      console.log('📝 Primeiros 300 caracteres:', textoExtraido.substring(0, 300));

      // 2. Tentar extrair ingredientes usando OpenAI (se disponível)
      let ingredientesExtraidos = [];
      let instrucoes = '';
      let nomeReceita = '';
      let descricao = '';

      const openaiService = new OpenAIService();
      if (openaiService.isReady()) {
        try {
          console.log('🤖 Tentando extrair ingredientes usando OpenAI...');
          const resultadoIA = await openaiService.extrairIngredientes(textoExtraido);
          
          if (resultadoIA.sucesso && resultadoIA.ingredientes) {
            ingredientesExtraidos = resultadoIA.ingredientes.map(ing => ({
              nome: ing.nome || ing.ingrediente || '',
              quantidade: ing.quantidade || ing.medida || '',
              unidade: ing.unidade || ''
            }));

            nomeReceita = resultadoIA.nomeReceita || 'Receita Extraída do PDF';
            descricao = resultadoIA.descricao || 'Receita extraída automaticamente do PDF';
            instrucoes = resultadoIA.instrucoes || resultadoIA.modoPreparo || '';

            console.log('✅ OpenAI extraiu', ingredientesExtraidos.length, 'ingredientes');
          } else {
            console.log('⚠️ OpenAI retornou sem sucesso, usando fallback');
            throw new Error('OpenAI não retornou dados válidos');
          }
        } catch (error) {
          console.log('⚠️ Erro ao usar OpenAI, usando fallback:', error.message);
          // Fallback: usar extração manual
        }
      }

      // 3. Fallback: extrair ingredientes usando PDFProcessor
      if (ingredientesExtraidos.length === 0) {
        console.log('📋 Usando extração manual de ingredientes...');
        const pdfProcessor = new PDFProcessor();
        const ingredientesBrutos = pdfProcessor.extrairIngredientes(textoExtraido);
        
        ingredientesExtraidos = ingredientesBrutos.map(ing => ({
          nome: ing.nome || '',
          quantidade: ing.quantidade_per_capita || ing.quantidade || '',
          unidade: ing.unidade_medida || ''
        }));

        console.log('✅ Extração manual encontrou', ingredientesExtraidos.length, 'ingredientes');
      }

      // 4. Tentar identificar nome da receita e instruções do texto
      if (!nomeReceita || !instrucoes) {
        const linhas = textoExtraido.split('\n').filter(l => l.trim());
        
        // Primeiras linhas geralmente contêm o nome
        if (!nomeReceita && linhas.length > 0) {
          nomeReceita = linhas[0].trim().substring(0, 200);
        }

        // Buscar seção de instruções/preparo
        const palavrasChave = ['modo de preparo', 'instruções', 'preparo', 'como fazer'];
        const indiceInstrucoes = linhas.findIndex(l => 
          palavrasChave.some(palavra => l.toLowerCase().includes(palavra))
        );

        if (indiceInstrucoes !== -1 && indiceInstrucoes < linhas.length - 1) {
          instrucoes = linhas.slice(indiceInstrucoes + 1, indiceInstrucoes + 10)
            .join('\n')
            .trim();
        } else {
          // Usar parte do texto como instruções
          instrucoes = textoExtraido.substring(textoExtraido.length / 2).trim().substring(0, 500);
        }
      }

      // 5. Preparar dados extraídos
      const dadosExtraidos = {
        nome: nomeReceita || 'Receita Extraída do PDF',
        descricao: descricao || 'Receita extraída automaticamente do PDF',
        texto_extraido_pdf: textoExtraido,
        ingredientes: ingredientesExtraidos,
        instrucoes: instrucoes || 'Instruções extraídas do PDF...'
      };

      console.log('✅ Processamento concluído:', {
        nome: dadosExtraidos.nome,
        ingredientes: dadosExtraidos.ingredientes.length
      });

      res.json({
        success: true,
        data: dadosExtraidos,
        message: 'PDF processado com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao processar PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message || 'Não foi possível processar o PDF'
      });
    }
  }

}

module.exports = ReceitasCRUDController;
