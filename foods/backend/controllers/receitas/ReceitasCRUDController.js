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

      // Importar dependências necessárias
      const pdf = require('pdf-parse');
      const pdfProcessor = require('../../utils/pdfProcessor');

      console.log('\n' + '='.repeat(80));
      console.log('📄 INICIANDO PROCESSAMENTO DE PDF DE RECEITA');
      console.log('='.repeat(80));
      console.log('📊 Tamanho do arquivo:', req.file.size, 'bytes');
      console.log('📋 Nome do arquivo:', req.file.originalname);
      console.log('📋 Tipo MIME:', req.file.mimetype);

      // 1. Extrair texto do PDF
      console.log('\n🔍 Extraindo texto do PDF...');
      const pdfData = await pdf(req.file.buffer);
      
      console.log('📄 Metadados do PDF:');
      console.log('   - Número de páginas:', pdfData.numpages);
      console.log('   - Informações:', JSON.stringify(pdfData.info, null, 2));
      
      const textoExtraido = pdfData.text;

      console.log('\n✅ Texto extraído com sucesso!');
      console.log('📏 Tamanho total do texto:', textoExtraido.length, 'caracteres');
      console.log('📏 Número de linhas:', textoExtraido.split('\n').length);
      
      console.log('\n📝 TEXTO COMPLETO EXTRAÍDO DO PDF:');
      console.log('-'.repeat(80));
      console.log(textoExtraido);
      console.log('-'.repeat(80));
      
      console.log('\n📝 Primeiros 500 caracteres:');
      console.log(textoExtraido.substring(0, 500));
      
      console.log('\n📝 Últimos 500 caracteres:');
      console.log(textoExtraido.substring(Math.max(0, textoExtraido.length - 500)));

      // 2. Extrair ingredientes usando PDFProcessor
      console.log('\n📋 Extraindo ingredientes do texto...');
      const ingredientesBrutos = pdfProcessor.extrairIngredientes(textoExtraido);
      
      console.log('📊 Ingredientes brutos encontrados:', ingredientesBrutos.length);
      console.log('📋 Lista de ingredientes brutos:');
      ingredientesBrutos.forEach((ing, idx) => {
        console.log(`   ${idx + 1}. Nome: "${ing.nome}", Quantidade: "${ing.quantidade_per_capita || ing.quantidade}", Unidade: "${ing.unidade_medida}"`);
      });
      
      const ingredientesExtraidos = ingredientesBrutos.map(ing => ({
        nome: ing.nome || '',
        quantidade: ing.quantidade_per_capita || ing.quantidade || '',
        unidade: ing.unidade_medida || ''
      }));

      console.log('\n✅ Extração encontrou', ingredientesExtraidos.length, 'ingredientes');
      console.log('📋 Ingredientes processados (primeiros 10):');
      ingredientesExtraidos.slice(0, 10).forEach((ing, idx) => {
        console.log(`   ${idx + 1}. ${ing.nome} - ${ing.quantidade} ${ing.unidade}`);
      });

      // 3. Tentar identificar nome da receita e instruções do texto
      console.log('\n🔍 Analisando estrutura do texto para extrair nome e instruções...');
      const linhas = textoExtraido.split('\n').filter(l => l.trim());
      
      console.log('📊 Total de linhas:', linhas.length);
      console.log('📋 Primeiras 20 linhas:');
      linhas.slice(0, 20).forEach((linha, idx) => {
        console.log(`   ${idx + 1}. "${linha.trim()}"`);
      });
      
      // Primeiras linhas geralmente contêm o nome (pular cabeçalhos comuns)
      let nomeReceita = '';
      let inicioTexto = 0;
      const palavrasCabeçalho = ['SECRETARIA', 'DIRETORIA', 'GERÊNCIA', 'ESTADO', 'EDUCAÇÃO'];
      
      console.log('\n🔍 Buscando nome da receita (pulando cabeçalhos)...');
      for (let i = 0; i < Math.min(10, linhas.length); i++) {
        const linha = linhas[i].trim();
        console.log(`   Linha ${i + 1}: "${linha}"`);
        if (linha.length > 10 && !palavrasCabeçalho.some(p => linha.toUpperCase().includes(p))) {
          nomeReceita = linha.substring(0, 200);
          inicioTexto = i;
          console.log(`   ✅ Nome encontrado na linha ${i + 1}: "${nomeReceita}"`);
          break;
        }
      }
      
      if (!nomeReceita && linhas.length > 0) {
        nomeReceita = linhas[0].trim().substring(0, 200);
        console.log(`   ⚠️ Usando primeira linha como nome: "${nomeReceita}"`);
      }

      // Buscar seção de instruções/preparo
      console.log('\n🔍 Buscando seção de instruções/preparo...');
      let instrucoes = '';
      const palavrasChave = ['modo de preparo', 'instruções', 'preparo', 'como fazer', 'modo de fazer'];
      const indiceInstrucoes = linhas.findIndex((l, idx) => 
        idx > inicioTexto && palavrasChave.some(palavra => l.toLowerCase().includes(palavra))
      );

      if (indiceInstrucoes !== -1 && indiceInstrucoes < linhas.length - 1) {
        instrucoes = linhas.slice(indiceInstrucoes + 1, indiceInstrucoes + 20)
          .join('\n')
          .trim();
        console.log(`   ✅ Instruções encontradas a partir da linha ${indiceInstrucoes + 1}`);
        console.log(`   📝 Primeiros 200 caracteres: "${instrucoes.substring(0, 200)}"`);
      } else {
        // Usar parte do meio do texto como instruções
        const meioTexto = Math.floor(textoExtraido.length / 2);
        instrucoes = textoExtraido.substring(meioTexto).trim().substring(0, 1000);
        console.log(`   ⚠️ Instruções não encontradas, usando parte do meio do texto`);
        console.log(`   📝 Primeiros 200 caracteres: "${instrucoes.substring(0, 200)}"`);
      }

      const descricao = 'Receita extraída automaticamente do PDF';

      // 4. Preparar dados extraídos
      console.log('\n📦 Preparando dados extraídos para retorno...');
      const dadosExtraidos = {
        nome: nomeReceita || 'Receita Extraída do PDF',
        descricao: descricao,
        texto_extraido_pdf: textoExtraido,
        ingredientes: ingredientesExtraidos,
        instrucoes: instrucoes || 'Instruções extraídas do PDF...'
      };

      console.log('\n✅ PROCESSAMENTO CONCLUÍDO:');
      console.log('='.repeat(80));
      console.log('📋 Resumo dos dados extraídos:');
      console.log('   - Nome:', dadosExtraidos.nome);
      console.log('   - Descrição:', dadosExtraidos.descricao);
      console.log('   - Total de ingredientes:', dadosExtraidos.ingredientes.length);
      console.log('   - Tamanho do texto extraído:', dadosExtraidos.texto_extraido_pdf.length, 'caracteres');
      console.log('   - Tamanho das instruções:', dadosExtraidos.instrucoes.length, 'caracteres');
      console.log('='.repeat(80));

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
