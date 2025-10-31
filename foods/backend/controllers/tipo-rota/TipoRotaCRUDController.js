/**
 * Controller CRUD de Tipo de Rota
 * Responsável por criar, atualizar e excluir tipos de rota
 * Implementa validação: escola só pode estar em uma rota por grupo
 */

const { executeQuery } = require('../../config/database');

class TipoRotaCRUDController {
  // Criar tipo de rota (com suporte a múltiplos grupos)
  static async criarTipoRota(req, res) {
    try {
      const {
        filial_id,
        grupos_id, // Array de IDs de grupos
        nome,
        status = 'ativo'
      } = req.body;

      // Validações específicas
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Validar grupos_id como array
      if (!Array.isArray(grupos_id) || grupos_id.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Grupos inválidos',
          message: 'É necessário selecionar ao menos um grupo'
        });
      }

      // Verificar se a filial existe
      const filial = await executeQuery(
        'SELECT id FROM filiais WHERE id = ?',
        [filial_id]
      );

      if (filial.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Filial não encontrada',
          message: 'A filial especificada não foi encontrada'
        });
      }

      // Verificar se todos os grupos existem
      const gruposIds = grupos_id.map(id => parseInt(id));
      const placeholders = gruposIds.map(() => '?').join(',');
      const gruposExistentes = await executeQuery(
        `SELECT id FROM grupos WHERE id IN (${placeholders})`,
        gruposIds
      );

      if (gruposExistentes.length !== gruposIds.length) {
        return res.status(400).json({
          success: false,
          error: 'Grupos inválidos',
          message: 'Um ou mais grupos especificados não foram encontrados'
        });
      }

      // Inserir múltiplos registros (um para cada grupo)
      const insertQuery = `
        INSERT INTO tipo_rota (
          filial_id, grupo_id, nome, status
        ) VALUES (?, ?, ?, ?)
      `;

      const insertedIds = [];
      for (const grupoId of gruposIds) {
        const result = await executeQuery(insertQuery, [
          filial_id,
          grupoId,
          nome.trim(),
          status
        ]);
        insertedIds.push(result.insertId);
      }

      // Buscar todos os tipos de rota criados (agrupados por nome)
      const tipoRotasCriados = await executeQuery(
        `SELECT 
          tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
          f.filial as filial_nome,
          g.nome as grupo_nome
         FROM tipo_rota tr
         LEFT JOIN filiais f ON tr.filial_id = f.id
         LEFT JOIN grupos g ON tr.grupo_id = g.id
         WHERE tr.id IN (${insertedIds.map(() => '?').join(',')})
         ORDER BY g.nome ASC`,
        insertedIds
      );

      // Agrupar por nome e retornar estrutura consolidada
      const grupos = tipoRotasCriados.map(tr => ({
        id: tr.grupo_id,
        nome: tr.grupo_nome
      }));

      const primeiroRegistro = tipoRotasCriados[0];
      const data = {
        id: primeiroRegistro.id, // Retorna o primeiro ID (para compatibilidade)
        nome: primeiroRegistro.nome,
        filial_id: primeiroRegistro.filial_id,
        filial_nome: primeiroRegistro.filial_nome,
        status: primeiroRegistro.status,
        grupos_id: gruposIds,
        grupos: grupos
      };

      res.status(201).json({
        success: true,
        message: 'Tipo de rota criado com sucesso',
        data: data
      });

    } catch (error) {
      console.error('Erro ao criar tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar o tipo de rota'
      });
    }
  }

  // Atualizar tipo de rota (com suporte a múltiplos grupos)
  static async atualizarTipoRota(req, res) {
    try {
      const { id } = req.params;
      const {
        filial_id,
        grupos_id, // Array de IDs de grupos
        nome,
        status
      } = req.body;

      // Verificar se o tipo de rota existe
      const existingTipoRota = await executeQuery(
        'SELECT * FROM tipo_rota WHERE id = ?',
        [id]
      );

      if (existingTipoRota.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de rota não encontrado',
          message: 'O tipo de rota especificado não foi encontrado'
        });
      }

      const registroAtual = existingTipoRota[0];
      const nomeAtual = registroAtual.nome;
      const filialAtual = registroAtual.filial_id;

      // Validações específicas
      if (nome && nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se a filial existe (se fornecida)
      const filialParaUsar = filial_id || filialAtual;
      if (filial_id) {
        const filial = await executeQuery(
          'SELECT id FROM filiais WHERE id = ?',
          [filial_id]
        );

        if (filial.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Filial não encontrada',
            message: 'A filial especificada não foi encontrada'
          });
        }
      }

      // Buscar todos os registros relacionados (mesmo nome e filial)
      const registrosRelacionados = await executeQuery(
        'SELECT * FROM tipo_rota WHERE nome = ? AND filial_id = ?',
        [nomeAtual, filialAtual]
      );

      const idsRelacionados = registrosRelacionados.map(r => r.id);

      // Se grupos_id foi fornecido, gerenciar grupos
      if (grupos_id !== undefined) {
        if (!Array.isArray(grupos_id) || grupos_id.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Grupos inválidos',
            message: 'É necessário selecionar ao menos um grupo'
          });
        }

        // Verificar se todos os grupos existem
        const gruposIds = grupos_id.map(gId => parseInt(gId));
        const placeholders = gruposIds.map(() => '?').join(',');
        const gruposExistentes = await executeQuery(
          `SELECT id FROM grupos WHERE id IN (${placeholders})`,
          gruposIds
        );

        if (gruposExistentes.length !== gruposIds.length) {
          return res.status(400).json({
            success: false,
            error: 'Grupos inválidos',
            message: 'Um ou mais grupos especificados não foram encontrados'
          });
        }

        // Remover registros antigos relacionados
        if (idsRelacionados.length > 0) {
          const deletePlaceholders = idsRelacionados.map(() => '?').join(',');
          await executeQuery(
            `DELETE FROM tipo_rota WHERE id IN (${deletePlaceholders})`,
            idsRelacionados
          );
        }

        // Criar novos registros com os grupos fornecidos
        const insertQuery = `
          INSERT INTO tipo_rota (
            filial_id, grupo_id, nome, status
          ) VALUES (?, ?, ?, ?)
        `;

        const nomeParaUsar = (nome || nomeAtual).trim();
        const statusParaUsar = status !== undefined ? status : registroAtual.status;

        const novosIds = [];
        for (const grupoId of gruposIds) {
          const result = await executeQuery(insertQuery, [
            filialParaUsar,
            grupoId,
            nomeParaUsar,
            statusParaUsar
          ]);
          novosIds.push(result.insertId);
        }

        // Buscar tipos de rota atualizados
        const tipoRotasAtualizados = await executeQuery(
          `SELECT 
            tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
            f.filial as filial_nome,
            g.nome as grupo_nome
           FROM tipo_rota tr
           LEFT JOIN filiais f ON tr.filial_id = f.id
           LEFT JOIN grupos g ON tr.grupo_id = g.id
           WHERE tr.id IN (${novosIds.map(() => '?').join(',')})
           ORDER BY g.nome ASC`,
          novosIds
        );

        // Agrupar por nome e retornar estrutura consolidada
        const grupos = tipoRotasAtualizados.map(tr => ({
          id: tr.grupo_id,
          nome: tr.grupo_nome
        }));

        const primeiroRegistro = tipoRotasAtualizados[0];
        const data = {
          id: primeiroRegistro.id,
          nome: primeiroRegistro.nome,
          filial_id: primeiroRegistro.filial_id,
          filial_nome: primeiroRegistro.filial_nome,
          status: primeiroRegistro.status,
          grupos_id: gruposIds,
          grupos: grupos
        };

        return res.json({
          success: true,
          message: 'Tipo de rota atualizado com sucesso',
          data: data
        });
      } else {
        // Se grupos_id não foi fornecido, apenas atualizar outros campos em todos os registros relacionados
        const updateFields = [];
        const updateParams = [];

        if (filial_id !== undefined) {
          updateFields.push('filial_id = ?');
          updateParams.push(filial_id);
        }
        if (nome !== undefined) {
          updateFields.push('nome = ?');
          updateParams.push(nome.trim());
        }
        if (status !== undefined) {
          updateFields.push('status = ?');
          updateParams.push(status);
        }

        // Sempre atualizar o timestamp
        updateFields.push('updated_at = CURRENT_TIMESTAMP');

        if (updateFields.length > 0 && idsRelacionados.length > 0) {
          const updatePlaceholders = idsRelacionados.map(() => '?').join(',');
          await executeQuery(
            `UPDATE tipo_rota SET ${updateFields.join(', ')} WHERE id IN (${updatePlaceholders})`,
            [...updateParams, ...idsRelacionados]
          );
        }

        // Buscar tipo de rota atualizado (primeiro registro)
        const updatedTipoRota = await executeQuery(
          `SELECT 
            tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
            f.filial as filial_nome,
            g.nome as grupo_nome
           FROM tipo_rota tr
           LEFT JOIN filiais f ON tr.filial_id = f.id
           LEFT JOIN grupos g ON tr.grupo_id = g.id
           WHERE tr.id = ?`,
          [id]
        );

        if (updatedTipoRota.length === 0) {
          // Se o registro foi deletado (pode acontecer se grupos_id foi processado antes), buscar qualquer registro relacionado
          const registrosAtualizados = await executeQuery(
            `SELECT 
              tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
              f.filial as filial_nome,
              g.nome as grupo_nome
             FROM tipo_rota tr
             LEFT JOIN filiais f ON tr.filial_id = f.id
             LEFT JOIN grupos g ON tr.grupo_id = g.id
             WHERE tr.nome = ? AND tr.filial_id = ?
             LIMIT 1`,
            [nome || nomeAtual, filialParaUsar]
          );
          
          if (registrosAtualizados.length > 0) {
            return res.json({
              success: true,
              message: 'Tipo de rota atualizado com sucesso',
              data: registrosAtualizados[0]
            });
          }
        }

        return res.json({
          success: true,
          message: 'Tipo de rota atualizado com sucesso',
          data: updatedTipoRota[0]
        });
      }

    } catch (error) {
      console.error('Erro ao atualizar tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar o tipo de rota'
      });
    }
  }

  // Excluir tipo de rota
  static async excluirTipoRota(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o tipo de rota existe
      const tipoRota = await executeQuery(
        `SELECT tr.*, f.filial as filial_nome, g.nome as grupo_nome
         FROM tipo_rota tr
         LEFT JOIN filiais f ON tr.filial_id = f.id
         LEFT JOIN grupos g ON tr.grupo_id = g.id
         WHERE tr.id = ?`,
        [id]
      );

      if (tipoRota.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de rota não encontrado',
          message: 'O tipo de rota especificado não foi encontrado'
        });
      }

      const tipoRotaData = tipoRota[0];
      
      // Buscar todos os registros relacionados (mesmo nome e filial)
      const registrosRelacionados = await executeQuery(
        'SELECT id FROM tipo_rota WHERE nome = ? AND filial_id = ?',
        [tipoRotaData.nome, tipoRotaData.filial_id]
      );
      
      const idsParaExcluir = registrosRelacionados.map(r => r.id);

      // Verificar se existem rotas vinculadas a qualquer um dos registros relacionados
      const placeholders = idsParaExcluir.map(() => '?').join(',');
      const rotasVinculadas = await executeQuery(
        `SELECT DISTINCT r.id, r.codigo, r.nome, r.status 
         FROM rotas r
         INNER JOIN tipo_rota tr ON r.tipo_rota_id = tr.id
         WHERE tr.nome = ? AND tr.filial_id = ?`,
        [tipoRotaData.nome, tipoRotaData.filial_id]
      );

      // Se houver rotas vinculadas, retornar erro com informações das rotas
      if (rotasVinculadas.length > 0) {
        // Criar lista de códigos e nomes das rotas para a mensagem principal
        const rotasCodigos = rotasVinculadas
          .map(r => `${r.codigo} - ${r.nome}`)
          .join(', ');

        const rotasList = rotasVinculadas.map(r => 
          `"${r.nome}" (${r.codigo})`
        ).join(', ');

        const mensagemPrincipal = rotasVinculadas.length === 1
          ? `O tipo de rota "${tipoRotaData.nome}" não pode ser excluído pois está vinculado à rota ${rotasCodigos}.`
          : `O tipo de rota "${tipoRotaData.nome}" não pode ser excluído pois está vinculado a ${rotasVinculadas.length} rotas no sistema: ${rotasCodigos}.`;

        return res.status(400).json({
          success: false,
          error: 'Não é possível excluir o tipo de rota',
          message: mensagemPrincipal,
          details: {
            tipoRota: {
              id: tipoRotaData.id,
              nome: tipoRotaData.nome,
              filial: tipoRotaData.filial_nome,
              grupo: tipoRotaData.grupo_nome
            },
            rotasVinculadas: rotasVinculadas.map(r => ({
              id: r.id,
              codigo: r.codigo,
              nome: r.nome,
              status: r.status
            })),
            rotasList: rotasList
          }
        });
      }

      // Se não houver rotas vinculadas, proceder com a exclusão
      // Remover vinculações de unidades escolares (se houver) - para todos os registros relacionados
      if (idsParaExcluir.length > 0) {
        const unidadesPlaceholders = idsParaExcluir.map(() => '?').join(',');
        await executeQuery(
          `UPDATE unidades_escolares SET tipo_rota_id = NULL, ordem_entrega = 0 WHERE tipo_rota_id IN (${unidadesPlaceholders})`,
          idsParaExcluir
        );
      }

      // Excluir todos os registros relacionados (todos os grupos deste tipo de rota)
      if (idsParaExcluir.length > 0) {
        const deletePlaceholders = idsParaExcluir.map(() => '?').join(',');
        await executeQuery(
          `DELETE FROM tipo_rota WHERE id IN (${deletePlaceholders})`,
          idsParaExcluir
        );
      }

      res.json({
        success: true,
        message: `Tipo de rota "${tipoRotaData.nome}" excluído com sucesso!`,
        data: {
          id: tipoRotaData.id,
          nome: tipoRotaData.nome
        }
      });

    } catch (error) {
      console.error('Erro ao excluir tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o tipo de rota'
      });
    }
  }
}

module.exports = TipoRotaCRUDController;

