/**
 * Controller de Busca de Rotas
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

class RotasSearchController {
  // Buscar rotas ativas
  static async buscarRotasAtivas(req, res) {
    try {
      const query = `
        SELECT 
          r.id, r.codigo, r.nome, r.frequencia_entrega, r.status, r.filial_id,
          f.filial as filial_nome
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query);

      // Buscar total de unidades para cada rota
      const rotasComUnidades = await Promise.all(
        rotas.map(async (rota) => {
          try {
            const unidadesQuery = `
              SELECT COUNT(*) as total_unidades 
              FROM unidades_escolares 
              WHERE rota_id = ? AND status = 'ativo'
            `;
            const unidadesResult = await executeQuery(unidadesQuery, [rota.id]);
            return {
              ...rota,
              total_unidades: unidadesResult[0]?.total_unidades || 0
            };
          } catch (error) {
            console.error(`Erro ao buscar unidades para rota ${rota.id}:`, error);
            return {
              ...rota,
              total_unidades: 0
            };
          }
        })
      );

      res.json({
        success: true,
        data: rotasComUnidades
      });

    } catch (error) {
      console.error('Erro ao buscar rotas ativas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas ativas'
      });
    }
  }

  // Buscar rotas por filial
  static async buscarRotasPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          r.id, r.codigo, r.nome, r.frequencia_entrega, r.status, r.filial_id,
          f.filial as filial_nome
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.filial_id = ? AND r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query, [filialId]);

      // Buscar total de unidades para cada rota
      const rotasComUnidades = await Promise.all(
        rotas.map(async (rota) => {
          try {
            const unidadesQuery = `
              SELECT COUNT(*) as total_unidades 
              FROM unidades_escolares 
              WHERE rota_id = ? AND status = 'ativo'
            `;
            const unidadesResult = await executeQuery(unidadesQuery, [rota.id]);
            return {
              ...rota,
              total_unidades: unidadesResult[0]?.total_unidades || 0
            };
          } catch (error) {
            console.error(`Erro ao buscar unidades para rota ${rota.id}:`, error);
            return {
              ...rota,
              total_unidades: 0
            };
          }
        })
      );

      res.json({
        success: true,
        data: rotasComUnidades
      });

    } catch (error) {
      console.error('Erro ao buscar rotas por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas por filial'
      });
    }
  }

  // Buscar rotas por tipo
  static async buscarRotasPorTipo(req, res) {
    try {
      const { tipo } = req.params;

      const query = `
        SELECT 
          r.id, r.codigo, r.nome, r.frequencia_entrega, r.status, r.filial_id,
          f.filial as filial_nome
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.frequencia_entrega = ? AND r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query, [tipo]);

      // Buscar total de unidades para cada rota
      const rotasComUnidades = await Promise.all(
        rotas.map(async (rota) => {
          try {
            const unidadesQuery = `
              SELECT COUNT(*) as total_unidades 
              FROM unidades_escolares 
              WHERE rota_id = ? AND status = 'ativo'
            `;
            const unidadesResult = await executeQuery(unidadesQuery, [rota.id]);
            return {
              ...rota,
              total_unidades: unidadesResult[0]?.total_unidades || 0
            };
          } catch (error) {
            console.error(`Erro ao buscar unidades para rota ${rota.id}:`, error);
            return {
              ...rota,
              total_unidades: 0
            };
          }
        })
      );

      res.json({
        success: true,
        data: rotasComUnidades
      });

    } catch (error) {
      console.error('Erro ao buscar rotas por frequência:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas por frequência'
      });
    }
  }

  // Listar tipos de rota (DEPRECATED - usar listarFrequenciasEntrega)
  static async listarTiposRota(req, res) {
    try {
      const query = `
        SELECT DISTINCT frequencia_entrega 
        FROM rotas 
        WHERE frequencia_entrega IS NOT NULL AND frequencia_entrega != ''
        ORDER BY frequencia_entrega ASC
      `;

      const tipos = await executeQuery(query);

      res.json({
        success: true,
        data: tipos.map(item => item.frequencia_entrega)
      });

    } catch (error) {
      console.error('Erro ao listar frequências de entrega:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as frequências de entrega'
      });
    }
  }

  // Listar frequências de entrega disponíveis no ENUM
  static async listarFrequenciasEntrega(req, res) {
    try {
      // Buscar os valores do ENUM diretamente da tabela
      const query = `
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'rotas'
          AND COLUMN_NAME = 'frequencia_entrega'
      `;

      const result = await executeQuery(query);

      if (result.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Extrair valores do ENUM: ENUM('semanal','quinzenal','mensal','transferencia')
      const enumStr = result[0].COLUMN_TYPE;
      const enumValues = enumStr
        .replace(/^enum\(|\)$/gi, '')
        .split(',')
        .map(val => val.replace(/^'|'$/g, '').trim())
        .filter(val => val.length > 0);

      res.json({
        success: true,
        data: enumValues
      });

    } catch (error) {
      console.error('Erro ao listar frequências de entrega:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as frequências de entrega'
      });
    }
  }

  // Adicionar nova frequência de entrega ao ENUM
  static async adicionarFrequenciaEntrega(req, res) {
    try {
      const { nome } = req.body;

      if (!nome || nome.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome da frequência é obrigatório'
        });
      }

      const nomeLimpo = nome.trim().toLowerCase();

      // Validar formato (sem espaços, caracteres especiais, etc)
      if (!/^[a-z_]+$/.test(nomeLimpo)) {
        return res.status(400).json({
          success: false,
          error: 'Formato inválido',
          message: 'O nome deve conter apenas letras minúsculas e underscore'
        });
      }

      // Verificar se já existe
      const enumQuery = `
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'rotas'
          AND COLUMN_NAME = 'frequencia_entrega'
      `;
      const enumResult = await executeQuery(enumQuery);

      if (enumResult.length === 0) {
        return res.status(500).json({
          success: false,
          error: 'Erro ao buscar ENUM',
          message: 'Não foi possível acessar a definição da coluna'
        });
      }

      // Extrair valores atuais do ENUM
      const enumStr = enumResult[0].COLUMN_TYPE;
      const valoresAtuais = enumStr
        .replace(/^enum\(|\)$/gi, '')
        .split(',')
        .map(val => val.replace(/^'|'$/g, '').trim())
        .filter(val => val.length > 0);

      // Verificar se já existe
      if (valoresAtuais.includes(nomeLimpo)) {
        return res.status(400).json({
          success: false,
          error: 'Frequência já existe',
          message: 'Esta frequência de entrega já está cadastrada'
        });
      }

      // Construir novo ENUM com todos os valores + novo
      const novosValores = [...valoresAtuais, nomeLimpo];
      const enumNovo = novosValores.map(val => `'${val}'`).join(',');

      // Executar ALTER TABLE (usar connection direto para DDL)
      const { pool } = require('../../config/database');
      const connection = await pool.getConnection();
      
      try {
        // Usar query() ao invés de execute() para DDL
        const alterQuery = `
          ALTER TABLE rotas 
          MODIFY frequencia_entrega ENUM(${enumNovo}) DEFAULT 'semanal'
        `;
        
        await connection.query(alterQuery);
      } finally {
        connection.release();
      }

      res.json({
        success: true,
        message: 'Frequência de entrega adicionada com sucesso',
        data: {
          nome: nomeLimpo,
          todas_frequencias: novosValores
        }
      });

    } catch (error) {
      console.error('Erro ao adicionar frequência de entrega:', error);
      
      // Verificar se é erro de duplicação do MySQL
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate')) {
        return res.status(400).json({
          success: false,
          error: 'Frequência já existe',
          message: 'Esta frequência de entrega já está cadastrada'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível adicionar a frequência de entrega'
      });
    }
  }

  // Buscar unidades escolares de uma rota
  static async buscarUnidadesEscolaresRota(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado,
          ue.endereco, ue.ordem_entrega, ue.status
        FROM unidades_escolares ue
        WHERE ue.rota_id = ? AND ue.status = 'ativo'
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [id]);

      res.json({
        success: true,
        data: {
          unidades: unidades,
          total: unidades.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares da rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares da rota'
      });
    }
  }

  // Buscar unidades escolares disponíveis para uma rota (considerando grupo)
  static async buscarUnidadesDisponiveisParaRota(req, res) {
    try {
      const { filialId } = req.params;
      const { grupoId, rotaId } = req.query;

      if (!filialId) {
        return res.status(400).json({
          success: false,
          error: 'Filial é obrigatória',
          message: 'ID da filial é obrigatório'
        });
      }

      // Se grupoId não for fornecido, buscar grupo da rota atual
      let grupoIdFinal = grupoId;
      if (!grupoIdFinal && rotaId) {
        const rotaQuery = `
          SELECT tr.grupo_id
          FROM rotas r
          LEFT JOIN tipo_rota tr ON r.tipo_rota_id = tr.id
          WHERE r.id = ?
        `;
        const rotaResult = await executeQuery(rotaQuery, [rotaId]);
        if (rotaResult.length > 0 && rotaResult[0].grupo_id) {
          grupoIdFinal = rotaResult[0].grupo_id;
        }
      }

      // Query para buscar unidades disponíveis
      // Regra: Se escola já está em uma rota do mesmo grupo, não deve aparecer
      // Se está em uma rota de outro grupo, pode aparecer
      let query = `
        SELECT 
          ue.id,
          ue.codigo_teknisa,
          ue.nome_escola,
          ue.cidade,
          ue.estado,
          ue.endereco,
          ue.numero,
          ue.bairro,
          ue.centro_distribuicao
        FROM unidades_escolares ue
        WHERE ue.filial_id = ? 
          AND ue.status = 'ativo'
      `;

      const params = [filialId];

      // Se temos um grupoId, aplicar filtro de grupo
      if (grupoIdFinal) {
        query += `
          AND (
            -- Unidades não vinculadas a nenhuma rota
            ue.rota_id IS NULL
        `;
        
        if (rotaId) {
          query += `
            OR
            -- Unidades já vinculadas a esta rota (modo edição - permite manter)
            ue.rota_id = ?
          `;
          params.push(rotaId);
        }
        
        query += `
            OR
            -- Unidades vinculadas a rotas que NÃO são do mesmo grupo
            -- (ou seja, de outros grupos ou sem tipo_rota definido)
            NOT EXISTS (
              SELECT 1 
              FROM rotas r
              INNER JOIN tipo_rota tr ON r.tipo_rota_id = tr.id
              WHERE r.id = ue.rota_id 
                AND tr.grupo_id = ?
        `;
        params.push(grupoIdFinal);
        
        if (rotaId) {
          query += `
                AND r.id != ?
          `;
          params.push(rotaId);
        }
        
        query += `
            )
          )
        `;
      } else {
        // Se não tem grupo, mostrar todas as unidades não vinculadas ou vinculadas a esta rota
        if (rotaId) {
          query += ` AND (ue.rota_id IS NULL OR ue.rota_id = ?)`;
          params.push(rotaId);
        } else {
          query += ` AND ue.rota_id IS NULL`;
        }
      }

      query += ` ORDER BY ue.nome_escola ASC`;

      const unidades = await executeQuery(query, params);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades disponíveis para rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades disponíveis'
      });
    }
  }
}

module.exports = RotasSearchController;
