const { executeQuery } = require('../../config/database');

/**
 * Controller para API de integração do calendário
 */
class CalendarioAPIController {
  
  /**
   * Buscar semanas de consumo por ano
   */
  static async buscarSemanasConsumo(req, res) {
    try {
      const { ano = new Date().getFullYear() } = req.params;

      const semanas = await executeQuery(`
        SELECT DISTINCT 
          semana_consumo,
          semana_consumo_inicio,
          semana_consumo_fim,
          semana_abastecimento,
          semana_abastecimento_inicio,
          semana_abastecimento_fim,
          mes_referencia
        FROM calendario 
        WHERE ano = ? AND semana_consumo IS NOT NULL AND semana_consumo != ''
        ORDER BY semana_consumo_inicio DESC
      `, [ano]);

      // Formatar semanas de consumo a partir das datas, adicionando 1 dia para corrigir o deslocamento
      const semanasLimpas = semanas.map(semana => {
        let semanaFormatada = semana.semana_consumo;
        
        // Se temos as datas de início e fim, formatar corretamente adicionando 1 dia
        if (semana.semana_consumo_inicio && semana.semana_consumo_fim) {
          try {
            // Converter datas do MySQL (YYYY-MM-DD) para Date
            const dataInicio = new Date(semana.semana_consumo_inicio);
            const dataFim = new Date(semana.semana_consumo_fim);
            
            // Adicionar 1 dia a cada data para corrigir o deslocamento
            dataInicio.setDate(dataInicio.getDate() + 1);
            dataFim.setDate(dataFim.getDate() + 1);
            
            // Formatar como DD/MM
            const formatarData = (data) => {
              const dia = String(data.getDate()).padStart(2, '0');
              const mes = String(data.getMonth() + 1).padStart(2, '0');
              return `${dia}/${mes}`;
            };
            
            // SEMPRE usar o ano solicitado na busca (parâmetro 'ano')
            // Se o usuário busca semanas de 2025, sempre mostrar /25, mesmo se as datas cruzarem para 2026
            // Isso garante que o dropdown mostre o ano correto que o usuário está visualizando
            const anoFormatado = ano;
            semanaFormatada = `(${formatarData(dataInicio)} a ${formatarData(dataFim)}/${anoFormatado.toString().slice(-2)})`;
          } catch (error) {
            // Se houver erro na formatação, usar o valor original do banco
            console.error('Erro ao formatar semana de consumo:', error);
          }
        }
        
        return {
          ...semana,
          semana_consumo: semanaFormatada
        };
      });

      res.json({
        success: true,
        data: semanasLimpas
      });

    } catch (error) {
      console.error('Erro ao buscar semanas de consumo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar semanas de abastecimento por ano
   */
  static async buscarSemanasAbastecimento(req, res) {
    try {
      const { ano = new Date().getFullYear() } = req.params;

      const semanas = await executeQuery(`
        SELECT DISTINCT 
          semana_abastecimento,
          semana_abastecimento_inicio,
          semana_abastecimento_fim
        FROM calendario 
        WHERE ano = ? AND semana_abastecimento IS NOT NULL AND semana_abastecimento != ''
        ORDER BY semana_abastecimento_inicio
      `, [ano]);

      res.json({
        success: true,
        data: semanas
      });

    } catch (error) {
      console.error('Erro ao buscar semanas de abastecimento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar dias úteis por mês
   */
  static async buscarDiasUteis(req, res) {
    try {
      const { ano, mes } = req.params;

      if (!ano || !mes) {
        return res.status(400).json({
          success: false,
          message: 'Ano e mês são obrigatórios'
        });
      }

      const dias = await executeQuery(`
        SELECT 
          data,
          dia_semana_nome,
          dia_util,
          feriado,
          nome_feriado
        FROM calendario 
        WHERE ano = ? AND mes = ? AND dia_util = 1
        ORDER BY data
      `, [ano, mes]);

      res.json({
        success: true,
        data: dias
      });

    } catch (error) {
      console.error('Erro ao buscar dias úteis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar dias de abastecimento por mês
   */
  static async buscarDiasAbastecimento(req, res) {
    try {
      const { ano, mes } = req.params;

      if (!ano || !mes) {
        return res.status(400).json({
          success: false,
          message: 'Ano e mês são obrigatórios'
        });
      }

      const dias = await executeQuery(`
        SELECT 
          data,
          dia_semana_nome,
          dia_abastecimento,
          feriado,
          nome_feriado
        FROM calendario 
        WHERE ano = ? AND mes = ? AND dia_abastecimento = 1
        ORDER BY data
      `, [ano, mes]);

      res.json({
        success: true,
        data: dias
      });

    } catch (error) {
      console.error('Erro ao buscar dias de abastecimento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar dias de consumo por mês
   */
  static async buscarDiasConsumo(req, res) {
    try {
      const { ano, mes } = req.params;

      if (!ano || !mes) {
        return res.status(400).json({
          success: false,
          message: 'Ano e mês são obrigatórios'
        });
      }

      const dias = await executeQuery(`
        SELECT 
          data,
          dia_semana_nome,
          dia_consumo,
          feriado,
          nome_feriado
        FROM calendario 
        WHERE ano = ? AND mes = ? AND dia_consumo = 1
        ORDER BY data
      `, [ano, mes]);

      res.json({
        success: true,
        data: dias
      });

    } catch (error) {
      console.error('Erro ao buscar dias de consumo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar feriados por ano
   */
  static async buscarFeriados(req, res) {
    try {
      const { ano = new Date().getFullYear() } = req.params;

      const feriados = await executeQuery(`
        SELECT 
          data,
          nome_feriado,
          observacoes,
          dia_semana_nome
        FROM calendario 
        WHERE ano = ? AND feriado = 1
        ORDER BY data
      `, [ano]);

      res.json({
        success: true,
        data: feriados
      });

    } catch (error) {
      console.error('Erro ao buscar feriados:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar se uma data é feriado
   */
  static async verificarFeriado(req, res) {
    try {
      const { data } = req.params;

      const [dia] = await executeQuery(`
        SELECT 
          data,
          feriado,
          nome_feriado,
          dia_util,
          dia_abastecimento,
          dia_consumo
        FROM calendario 
        WHERE data = ?
      `, [data]);

      if (!dia) {
        return res.status(404).json({
          success: false,
          message: 'Data não encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          data: dia.data,
          feriado: Boolean(dia.feriado),
          nome_feriado: dia.nome_feriado,
          dia_util: Boolean(dia.dia_util),
          dia_abastecimento: Boolean(dia.dia_abastecimento),
          dia_consumo: Boolean(dia.dia_consumo)
        }
      });

    } catch (error) {
      console.error('Erro ao verificar feriado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar semana por data de consumo
   */
  static async buscarSemanaPorDataConsumo(req, res) {
    try {
      const { data } = req.params;

      const [semana] = await executeQuery(`
        SELECT 
          semana_abastecimento,
          semana_abastecimento_inicio,
          semana_abastecimento_fim,
          semana_consumo,
          semana_consumo_inicio,
          semana_consumo_fim,
          mes_referencia
        FROM calendario 
        WHERE data = ?
      `, [data]);

      if (!semana) {
        return res.status(404).json({
          success: false,
          message: 'Data não encontrada'
        });
      }

      res.json({
        success: true,
        data: semana
      });

    } catch (error) {
      console.error('Erro ao buscar semana por data:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar semana de abastecimento por semana de consumo
   */
  static async buscarSemanaAbastecimentoPorConsumo(req, res) {
    try {
      // Usar query parameter em vez de path parameter para evitar problemas com caracteres especiais
      let semanaConsumo = req.query.semanaConsumo || req.params.semanaConsumo;

      if (!semanaConsumo) {
        return res.status(400).json({
          success: false,
          message: 'Semana de consumo é obrigatória'
        });
      }

      // Decodificar o parâmetro (pode vir encoded da URL)
      try {
        semanaConsumo = decodeURIComponent(semanaConsumo);
      } catch (e) {
        // Se já estiver decodificado, continuar
      }

      console.log('🔍 Buscando semana de abastecimento para:', semanaConsumo);

      // Extrair datas do valor formatado (ex: "(06/01 a 12/01/26)" -> 06/01 e 12/01)
      // O valor formatado tem +1 dia em relação ao banco, então precisamos subtrair 1 dia
      let dataInicioFormatada, dataFimFormatada;
      
      try {
        // Remover parênteses e ano do final
        const semanaLimpa = semanaConsumo.replace(/[()]/g, '').replace(/\/\d{2}$/, '');
        const [inicioStr, fimStr] = semanaLimpa.split(' a ');
        
        if (inicioStr && fimStr) {
          const [diaInicio, mesInicio] = inicioStr.split('/');
          const [diaFim, mesFim] = fimStr.split('/');
          
          // Extrair ano da string original ou usar ano atual
          const anoMatch = semanaConsumo.match(/\/(\d{2})[)]?$/);
          const ano2digitos = anoMatch ? anoMatch[1] : new Date().getFullYear().toString().slice(-2);
          const ano = parseInt(`20${ano2digitos}`);
          
          // Criar datas e subtrair 1 dia para obter as datas originais do banco
          const dataInicio = new Date(ano, parseInt(mesInicio) - 1, parseInt(diaInicio));
          const dataFim = new Date(ano, parseInt(mesFim) - 1, parseInt(diaFim));
          
          dataInicio.setDate(dataInicio.getDate() - 1);
          dataFim.setDate(dataFim.getDate() - 1);
          
          // Formatar como YYYY-MM-DD para buscar no banco
          const formatarParaMySQL = (data) => {
            const ano = data.getFullYear();
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const dia = String(data.getDate()).padStart(2, '0');
            return `${ano}-${mes}-${dia}`;
          };
          
          dataInicioFormatada = formatarParaMySQL(dataInicio);
          dataFimFormatada = formatarParaMySQL(dataFim);
          
          console.log('📅 Datas extraídas e ajustadas:', dataInicioFormatada, 'a', dataFimFormatada);
        }
      } catch (error) {
        console.error('❌ Erro ao extrair datas:', error);
      }

      // Buscar usando as datas diretamente (mais confiável que a string formatada)
      let semana = null;
      
      if (dataInicioFormatada && dataFimFormatada) {
        [semana] = await executeQuery(`
          SELECT 
            semana_abastecimento,
            semana_abastecimento_inicio,
            semana_abastecimento_fim,
            semana_consumo,
            semana_consumo_inicio,
            semana_consumo_fim,
            mes_referencia
          FROM calendario 
          WHERE semana_consumo_inicio = ? AND semana_consumo_fim = ?
          LIMIT 1
        `, [dataInicioFormatada, dataFimFormatada]);
      }

      // Se não encontrou pelas datas, tentar busca pela string formatada (fallback)
      if (!semana) {
        console.log('⚠️ Busca por datas não encontrou. Tentando busca pela string...');
        [semana] = await executeQuery(`
          SELECT 
            semana_abastecimento,
            semana_abastecimento_inicio,
            semana_abastecimento_fim,
            semana_consumo,
            semana_consumo_inicio,
            semana_consumo_fim,
            mes_referencia
          FROM calendario 
          WHERE semana_consumo = ? OR TRIM(semana_consumo) = TRIM(?)
          LIMIT 1
        `, [semanaConsumo, semanaConsumo]);
      }

      if (!semana) {
        console.log('❌ Semana não encontrada no banco para:', semanaConsumo);
        return res.status(404).json({
          success: false,
          message: 'Semana de consumo não encontrada'
        });
      }

      console.log('✅ Semana encontrada:', semana.semana_abastecimento);

      // Extrair ano da semana de consumo solicitada (ex: "(06/01 a 12/01/25)" -> 2025)
      let anoSolicitado = null;
      try {
        const anoMatch = semanaConsumo.match(/\/(\d{2})[)]?$/);
        if (anoMatch) {
          const ano2digitos = parseInt(anoMatch[1]);
          // Assumir que anos 00-30 são 2000-2030, anos 31-99 são 1931-1999
          anoSolicitado = ano2digitos <= 30 ? 2000 + ano2digitos : 1900 + ano2digitos;
        }
      } catch (e) {
        console.log('⚠️ Não foi possível extrair ano da semana de consumo:', e);
      }

      // Formatar semana de abastecimento a partir das datas, adicionando 1 dia para corrigir o deslocamento
      let semanaAbastecimentoFormatada = semana.semana_abastecimento;
      
      if (semana.semana_abastecimento_inicio && semana.semana_abastecimento_fim) {
        try {
          // Converter datas do MySQL (YYYY-MM-DD) para Date
          const dataInicio = new Date(semana.semana_abastecimento_inicio);
          const dataFim = new Date(semana.semana_abastecimento_fim);
          
          // Adicionar 1 dia a cada data para corrigir o deslocamento
          dataInicio.setDate(dataInicio.getDate() + 1);
          dataFim.setDate(dataFim.getDate() + 1);
          
          // Formatar como DD/MM
          const formatarData = (data) => {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            return `${dia}/${mes}`;
          };
          
          // Usar o ano solicitado na semana de consumo, ou ano da data de início como fallback
          const anoInicio = dataInicio.getFullYear();
          const anoFim = dataFim.getFullYear();
          let anoFormatado = anoSolicitado || anoInicio;
          
          // Se o ano solicitado não corresponde às datas, usar o ano da data de início
          if (anoSolicitado && anoInicio !== anoSolicitado && anoFim !== anoSolicitado) {
            // Apenas usar ano da data se realmente não corresponder ao solicitado
            anoFormatado = anoInicio;
          }
          
          semanaAbastecimentoFormatada = `(${formatarData(dataInicio)} a ${formatarData(dataFim)}/${anoFormatado.toString().slice(-2)})`;
        } catch (error) {
          // Se houver erro na formatação, usar o valor original do banco
          console.error('Erro ao formatar semana de abastecimento:', error);
        }
      }

      res.json({
        success: true,
        data: {
          ...semana,
          semana_abastecimento: semanaAbastecimentoFormatada
        }
      });

    } catch (error) {
      console.error('Erro ao buscar semana de abastecimento por consumo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CalendarioAPIController;
