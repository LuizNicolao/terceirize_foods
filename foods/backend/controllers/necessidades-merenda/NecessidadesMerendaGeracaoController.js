/**
 * Controller de Geração de Necessidades da Merenda
 * Responsável por gerar necessidades a partir de cardápios
 */

const { executeQuery } = require('../../config/database');
const { logAction } = require('../../utils/audit');
const PythonPDFService = require('../../services/pythonPDFService');

class NecessidadesMerendaGeracaoController {
  // Processar PDF e gerar necessidades
  static async processarPDFEGerarNecessidades(req, res) {
    try {

      const { filiais_ids, unidades_ids, rotas_ids } = req.body;
      const pdfFile = req.file;

      if (!pdfFile) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo PDF é obrigatório'
        });
      }

      // Determinar o tipo de seleção
      let unidadesEscolares = [];
      let tipoSelecao = '';

      if (filiais_ids || unidades_ids) {
        // Seleção por filiais e unidades
        tipoSelecao = 'filiais';
        if (unidades_ids) {
          const unidadesIds = unidades_ids.split(',').filter(id => id.trim()).map(id => parseInt(id.trim()));
          
          if (unidadesIds.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'Nenhuma unidade escolar selecionada'
            });
          }

          // Buscar unidades escolares selecionadas
          const placeholders = unidadesIds.map(() => '?').join(',');
          unidadesEscolares = await executeQuery(
            `SELECT id, nome_escola, filial_id FROM unidades_escolares WHERE id IN (${placeholders})`,
            unidadesIds
          );
        }

      } else if (rotas_ids) {
        // Seleção por rotas de nutricionistas
        tipoSelecao = 'rotas';
        const rotasIds = rotas_ids.split(',').filter(id => id.trim()).map(id => parseInt(id.trim()));
        
        if (rotasIds.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Nenhuma rota de nutricionista selecionada'
          });
        }

        // Buscar unidades escolares das rotas selecionadas
        const placeholders = rotasIds.map(() => '?').join(',');
        const rotas = await executeQuery(
          `SELECT escolas_responsaveis FROM rotas_nutricionistas WHERE id IN (${placeholders})`,
          rotasIds
        );

        // Extrair IDs das unidades escolares das rotas
        const todasUnidadesIds = [];
        rotas.forEach(rota => {
          if (rota.escolas_responsaveis) {
            const unidades = rota.escolas_responsaveis.split(',').map(id => parseInt(id.trim()));
            todasUnidadesIds.push(...unidades);
          }
        });

        if (todasUnidadesIds.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Nenhuma unidade escolar encontrada nas rotas selecionadas'
          });
        }

        // Buscar unidades escolares
        const unidadesPlaceholders = [...new Set(todasUnidadesIds)].map(() => '?').join(',');
        unidadesEscolares = await executeQuery(
          `SELECT id, nome_escola, filial_id FROM unidades_escolares WHERE id IN (${unidadesPlaceholders})`,
          [...new Set(todasUnidadesIds)]
        );

      } else {
        return res.status(400).json({
          success: false,
          message: 'Tipo de seleção deve ser informado (filiais ou rotas)'
        });
      }

      if (unidadesEscolares.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Nenhuma unidade escolar encontrada'
        });
      }

      
      // Processar PDF usando o serviço Python
      const pythonService = new PythonPDFService();
      const resultado = await pythonService.processarPDF(pdfFile.buffer, pdfFile.originalname);
      
      if (!resultado.success) {
        return res.status(400).json({
          success: false,
          message: 'Erro ao processar PDF',
          error: resultado.error
        });
      }

      // Processar cada unidade escolar
      const resultados = [];
      
      try {
        for (const unidade of unidadesEscolares) {
        
        // Buscar efetivos da unidade
        const efetivos = await executeQuery(
          `SELECT 
            e.tipo_efetivo,
            e.quantidade,
            i.nome as intolerancia_nome
          FROM efetivos e
          LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
          WHERE e.unidade_escolar_id = ?`,
          [unidade.id]
        );

        // Calcular efetivos totais
        const efetivosCalculados = {
          padrao: efetivos.filter(e => e.tipo_efetivo === 'PADRAO').reduce((sum, e) => sum + e.quantidade, 0),
          nae: efetivos.filter(e => e.tipo_efetivo === 'NAE').reduce((sum, e) => sum + e.quantidade, 0),
          por_intolerancia: {}
        };

        // Agrupar NAE por intolerância
        efetivos.filter(e => e.tipo_efetivo === 'NAE').forEach(efetivo => {
          const intolerancia = efetivo.intolerancia_nome || 'Não especificada';
          efetivosCalculados.por_intolerancia[intolerancia] = 
            (efetivosCalculados.por_intolerancia[intolerancia] || 0) + efetivo.quantidade;
        });


        // Extrair datas do cardapio_por_data e converter para formato MySQL
        const datas = Object.keys(resultado.data.cardapio_por_data || {});
        
        const converterDataParaMySQL = (dataStr) => {
          if (!dataStr) return null;
          // Converter de DD/MM/YYYY para YYYY-MM-DD
          const [dia, mes, ano] = dataStr.split('/');
          return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        };
        
        const dataInicio = datas.length > 0 ? converterDataParaMySQL(datas[0]) : null;
        const dataFim = datas.length > 0 ? converterDataParaMySQL(datas[datas.length - 1]) : null;

        // Criar cardápio
        const cardapioData = {
          nome: `Cardápio ${resultado.data.metadados?.arquivo_original || 'Processado'}`,
          tipo: 'importado_pdf',
          periodo: resultado.data.metadados?.arquivo_original || 'Não identificado',
          data_inicio: dataInicio,
          data_fim: dataFim,
          unidade_id: unidade.id,
          receitas: JSON.stringify(resultado.data.refeicoes || []),
          status: 'rascunho',
          criado_por: req.user?.id
        };

        const cardapioResult = await executeQuery(
          `INSERT INTO cardapios_gerados (
            codigo_interno, nome, descricao, unidade_escolar_id, 
            data_inicio, data_fim, status, criado_por
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `CARD_${Date.now()}`, // codigo_interno
            cardapioData.nome,
            `Cardápio gerado a partir de PDF - ${cardapioData.periodo}`, // descricao
            cardapioData.unidade_id,
            cardapioData.data_inicio,
            cardapioData.data_fim,
            cardapioData.status,
            cardapioData.criado_por
          ]
        );

        const cardapioId = cardapioResult.insertId;

        // Processar receitas e gerar necessidades
        const necessidadesGeradas = await NecessidadesMerendaGeracaoController.gerarNecessidadesDoCardapio(
          cardapioId,
          resultado.data,
          efetivosCalculados,
          unidade.id
        );

        resultados.push({
          unidade_escolar: {
            id: unidade.id,
            nome: unidade.nome_escola,
            filial_id: unidade.filial_id
          },
          cardapio_id: cardapioId,
          efetivos: efetivosCalculados,
          necessidades_geradas: necessidadesGeradas.length,
          receitas_processadas: resultado.data.refeicoes?.length || 0
        });

        }

        // Registrar auditoria
        await logAction(req.user?.id, 'create', 'necessidades_cardapio', {
          acao: 'processar_pdf_gerar_necessidades',
          unidades_processadas: resultados.length,
          total_necessidades: resultados.reduce((sum, r) => sum + r.necessidades_geradas, 0)
        });

        res.json({
          success: true,
          message: 'PDF processado e necessidades geradas com sucesso',
          data: {
            resumo: {
              unidades_processadas: resultados.length,
              total_necessidades: resultados.reduce((sum, r) => sum + r.necessidades_geradas, 0),
              total_receitas: resultados.reduce((sum, r) => sum + r.receitas_processadas, 0)
            },
            resultados
          }
        });

      } catch (processError) {
        return res.status(400).json({
          success: false,
          message: 'Erro ao processar unidades escolares',
          error: processError.message
        });
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Gerar necessidades a partir de um cardápio existente
  static async gerarNecessidadesDeCardapioExistente(req, res) {
    try {
      const { cardapio_id } = req.params;

      // Verificar se o cardápio existe
      const [cardapio] = await executeQuery(
        `SELECT 
          cg.id,
          cg.nome,
          cg.periodo,
          cg.unidade_id,
          cg.receitas,
          ue.nome_escola,
          ue.filial_id
        FROM cardapios_gerados cg
        LEFT JOIN unidades_escolares ue ON cg.unidade_id = ue.id
        WHERE cg.id = ?`,
        [cardapio_id]
      );

      if (!cardapio) {
        return res.status(404).json({
          success: false,
          message: 'Cardápio não encontrado'
        });
      }

      // Buscar efetivos da unidade
      const efetivos = await executeQuery(
        `SELECT 
          e.tipo_efetivo,
          e.quantidade,
          i.nome as intolerancia_nome
        FROM efetivos e
        LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
        WHERE e.unidade_escolar_id = ?`,
        [cardapio.unidade_id]
      );

      // Calcular efetivos totais
      const efetivosCalculados = {
        padrao: efetivos.filter(e => e.tipo_efetivo === 'PADRAO').reduce((sum, e) => sum + e.quantidade, 0),
        nae: efetivos.filter(e => e.tipo_efetivo === 'NAE').reduce((sum, e) => sum + e.quantidade, 0),
        por_intolerancia: {}
      };

      // Agrupar NAE por intolerância
      efetivos.filter(e => e.tipo_efetivo === 'NAE').forEach(efetivo => {
        const intolerancia = efetivo.intolerancia_nome || 'Não especificada';
        efetivosCalculados.por_intolerancia[intolerancia] = 
          (efetivosCalculados.por_intolerancia[intolerancia] || 0) + efetivo.quantidade;
      });

      // Parse das receitas do cardápio
      const receitas = JSON.parse(cardapio.receitas || '[]');

      // Gerar necessidades
      const necessidadesGeradas = await this.gerarNecessidadesDoCardapio(
        cardapio_id,
        { refeicoes: receitas },
        efetivosCalculados,
        cardapio.unidade_id
      );

      // Registrar auditoria
      await logAction(req.user?.id, 'create', 'necessidades_cardapio', {
        acao: 'gerar_necessidades_cardapio_existente',
        cardapio_id,
        necessidades_geradas: necessidadesGeradas.length
      });

      res.json({
        success: true,
        message: 'Necessidades geradas com sucesso',
        data: {
          cardapio: {
            id: cardapio.id,
            nome: cardapio.nome,
            periodo: cardapio.periodo,
            unidade_escolar: cardapio.nome_escola
          },
          efetivos: efetivosCalculados,
          necessidades_geradas: necessidadesGeradas.length,
          receitas_processadas: receitas.length
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Método auxiliar para gerar necessidades do cardápio
  static async gerarNecessidadesDoCardapio(cardapioId, dadosCardapio, efetivos, unidadeId) {
    const necessidadesGeradas = [];

    if (!dadosCardapio.refeicoes || !Array.isArray(dadosCardapio.refeicoes)) {
      return necessidadesGeradas;
    }

    // Agrupar receitas por data
    const receitasPorData = {};
    dadosCardapio.refeicoes.forEach(refeicao => {
      const data = refeicao.data;
      if (!receitasPorData[data]) {
        receitasPorData[data] = [];
      }
      receitasPorData[data].push(refeicao);
    });

    // Processar cada data
    for (const [data, receitasDoDia] of Object.entries(receitasPorData)) {
      
      // Converter data para formato MySQL
      const converterDataParaMySQL = (dataStr) => {
        if (!dataStr) return null;
        // Converter de DD/MM/YYYY para YYYY-MM-DD
        const [dia, mes, ano] = dataStr.split('/');
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      };
      
      const dataMySQL = converterDataParaMySQL(data);

      // Agrupar ingredientes por produto
      const ingredientesPorProduto = {};

      for (const receita of receitasDoDia) {
        // Buscar ou criar receita no banco
        let receitaId = await this.buscarOuCriarReceita(receita);

        // Simular ingredientes (aqui você implementaria a lógica real de extração)
        const ingredientes = this.simularIngredientes(receita);

        for (const ingrediente of ingredientes) {
          const chave = `${ingrediente.produto_id}_${ingrediente.unidade}`;
          
          if (!ingredientesPorProduto[chave]) {
            ingredientesPorProduto[chave] = {
              produto_id: ingrediente.produto_id,
              unidade: ingrediente.unidade,
              quantidade_por_pessoa: ingrediente.quantidade_por_pessoa,
              total_quantidade: 0
            };
          }
          
          ingredientesPorProduto[chave].total_quantidade += ingrediente.quantidade_por_pessoa;
        }
      }

      // Calcular necessidades para cada produto
      for (const [chave, ingrediente] of Object.entries(ingredientesPorProduto)) {
        const quantidadePadrao = ingrediente.total_quantidade * efetivos.padrao;
        const quantidadeNAE = ingrediente.total_quantidade * efetivos.nae;
        const quantidadeTotal = quantidadePadrao + quantidadeNAE;

        // Inserir necessidade
        const result = await executeQuery(
          `INSERT INTO necessidades_cardapio (
            codigo_interno, nome, descricao, unidade_escolar_id, 
            cardapio_id, data_inicio, data_fim, status, 
            total_efetivos, total_nae
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `NEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // codigo_interno
            `Necessidade - ${ingrediente.nome}`, // nome
            `Necessidade gerada para ${ingrediente.nome} em ${data}`, // descricao
            unidadeId,
            cardapioId,
            dataMySQL,
            dataMySQL, // data_fim igual a data_inicio para item específico
            'rascunho',
            efetivos.padrao,
            efetivos.nae
          ]
        );

        necessidadesGeradas.push({
          id: result.insertId,
          data,
          produto_id: ingrediente.produto_id,
          quantidade_padrao: quantidadePadrao,
          quantidade_nae: quantidadeNAE,
          quantidade_total: quantidadeTotal,
          unidade: ingrediente.unidade
        });
      }
    }

    return necessidadesGeradas;
  }

  // Método auxiliar para buscar ou criar receita
  static async buscarOuCriarReceita(receita) {
    // Buscar receita existente por código de referência
    const [existente] = await executeQuery(
      'SELECT id FROM receitas_processadas WHERE codigo_referencia = ?',
      [receita.codigo]
    );

    if (existente) {
      return existente.id;
    }

    // Criar nova receita
    const result = await executeQuery(
      `INSERT INTO receitas_processadas (
        codigo_interno, codigo_referencia, nome, descricao, texto_extraido, 
        origem, tipo, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `REC-${Date.now()}`, // Código interno temporário
        receita.codigo,
        receita.descricao || receita.codigo,
        receita.descricao || '',
        receita.descricao || receita.contexto || '', // Texto extraído - usar descrição original
        'pdf',
        'almoco', // Tipo padrão
        'ativo'
      ]
    );

    return result.insertId;
  }

  // Método auxiliar para simular ingredientes (implementar lógica real)
  static simularIngredientes(receita) {
    // Esta é uma simulação - implementar lógica real de extração de ingredientes
    const ingredientesSimulados = [
      { produto_id: 1, quantidade_por_pessoa: 0.2, unidade: 'kg' }, // Arroz
      { produto_id: 2, quantidade_por_pessoa: 0.1, unidade: 'kg' }, // Feijão
      { produto_id: 3, quantidade_por_pessoa: 0.15, unidade: 'kg' } // Carne
    ];

    return ingredientesSimulados;
  }
}

module.exports = NecessidadesMerendaGeracaoController;
