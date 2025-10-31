/**
 * Controller CRUD de Tipo de Rota
 * Responsável por criar, atualizar e excluir tipos de rota
 * Implementa validação: escola só pode estar em uma rota por grupo
 */

const { executeQuery } = require('../../config/database');

class TipoRotaCRUDController {
  // Função auxiliar para converter array de IDs em string separada por vírgula
  static gruposToString(gruposIds) {
    if (!Array.isArray(gruposIds) || gruposIds.length === 0) {
      return '';
    }
    return gruposIds.map(id => parseInt(id)).join(',');
  }

  // Função auxiliar para converter string separada por vírgula em array de IDs
  static gruposToArray(gruposString) {
    if (!gruposString || typeof gruposString !== 'string') {
      return [];
    }
    return gruposString
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id) && id > 0);
  }
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

      // Validar duplicidade: verificar se algum grupo já está vinculado a outro tipo de rota nesta filial
      const gruposConflitantes = [];
      for (const grupoId of gruposIds) {
        const tiposRotaExistentes = await executeQuery(
          `SELECT tr.id, tr.nome, tr.grupo_id 
           FROM tipo_rota tr 
           WHERE tr.filial_id = ? AND FIND_IN_SET(?, tr.grupo_id) > 0`,
          [filial_id, grupoId]
        );

        if (tiposRotaExistentes.length > 0) {
          // Buscar nome do grupo para a mensagem
          const grupoInfo = await executeQuery(
            'SELECT nome FROM grupos WHERE id = ?',
            [grupoId]
          );
          const grupoNome = grupoInfo.length > 0 ? grupoInfo[0].nome : `ID ${grupoId}`;
          
          // Buscar nome da filial para a mensagem
          const filialInfo = await executeQuery(
            'SELECT filial FROM filiais WHERE id = ?',
            [filial_id]
          );
          const filialNome = filialInfo.length > 0 ? filialInfo[0].filial : `ID ${filial_id}`;

          const tipoRotaExistente = tiposRotaExistentes[0];
          gruposConflitantes.push({
            grupoId,
            grupoNome,
            tipoRotaId: tipoRotaExistente.id,
            tipoRotaNome: tipoRotaExistente.nome
          });
        }
      }

      if (gruposConflitantes.length > 0) {
        const gruposNomesConflitantes = gruposConflitantes.map(gc => gc.grupoNome).join(', ');
        const tiposRotasNomes = gruposConflitantes.map(gc => `"${gc.tipoRotaNome}"`).join(', ');
        
        return res.status(400).json({
          success: false,
          error: 'Grupo já vinculado',
          message: `O(s) grupo(s) ${gruposNomesConflitantes} já está(ão) vinculado(s) a outro(s) tipo(s) de rota (${tiposRotasNomes}) nesta filial. Cada grupo só pode estar vinculado a um único tipo de rota por filial.`
        });
      }

      // Converter array de grupos em string separada por vírgula
      const gruposString = TipoRotaCRUDController.gruposToString(gruposIds);

      // Inserir um único registro com grupos como string
      const insertQuery = `
        INSERT INTO tipo_rota (
          filial_id, grupo_id, nome, status
        ) VALUES (?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        filial_id,
        gruposString,
        nome.trim(),
        status
      ]);

      // Buscar grupos para construir resposta
      const gruposNomes = await executeQuery(
        `SELECT id, nome FROM grupos WHERE id IN (${gruposIds.map(() => '?').join(',')}) ORDER BY nome ASC`,
        gruposIds
      );

      // Buscar tipo de rota criado
      const tipoRotaCriado = await executeQuery(
        `SELECT 
          tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
          f.filial as filial_nome
         FROM tipo_rota tr
         LEFT JOIN filiais f ON tr.filial_id = f.id
         WHERE tr.id = ?`,
        [result.insertId]
      );

      const grupos = gruposNomes.map(g => ({
        id: g.id,
        nome: g.nome
      }));

      const registro = tipoRotaCriado[0];
      const data = {
        id: registro.id,
        nome: registro.nome,
        filial_id: registro.filial_id,
        filial_nome: registro.filial_nome,
        status: registro.status,
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

      // Construir campos de atualização
      const updateFields = [];
      const updateParams = [];

      // Se grupos_id foi fornecido, converter para string e atualizar
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

        // Validar duplicidade: verificar se algum grupo já está vinculado a OUTRO tipo de rota nesta filial
        const filialParaValidar = filial_id || filialAtual;
        const gruposConflitantes = [];
        
        for (const grupoId of gruposIds) {
          // Buscar tipos de rota que têm este grupo na mesma filial (exceto o que está sendo editado)
          const tiposRotaExistentes = await executeQuery(
            `SELECT tr.id, tr.nome, tr.grupo_id 
             FROM tipo_rota tr 
             WHERE tr.filial_id = ? AND tr.id != ? AND FIND_IN_SET(?, tr.grupo_id) > 0`,
            [filialParaValidar, id, grupoId]
          );

          if (tiposRotaExistentes.length > 0) {
            // Buscar nome do grupo para a mensagem
            const grupoInfo = await executeQuery(
              'SELECT nome FROM grupos WHERE id = ?',
              [grupoId]
            );
            const grupoNome = grupoInfo.length > 0 ? grupoInfo[0].nome : `ID ${grupoId}`;
            
            // Buscar nome da filial para a mensagem
            const filialInfo = await executeQuery(
              'SELECT filial FROM filiais WHERE id = ?',
              [filialParaValidar]
            );
            const filialNome = filialInfo.length > 0 ? filialInfo[0].filial : `ID ${filialParaValidar}`;

            const tipoRotaExistente = tiposRotaExistentes[0];
            gruposConflitantes.push({
              grupoId,
              grupoNome,
              tipoRotaId: tipoRotaExistente.id,
              tipoRotaNome: tipoRotaExistente.nome
            });
          }
        }

        if (gruposConflitantes.length > 0) {
          const gruposNomesConflitantes = gruposConflitantes.map(gc => gc.grupoNome).join(', ');
          const tiposRotasNomes = gruposConflitantes.map(gc => `"${gc.tipoRotaNome}"`).join(', ');
          
          return res.status(400).json({
            success: false,
            error: 'Grupo já vinculado',
            message: `O(s) grupo(s) ${gruposNomesConflitantes} já está(ão) vinculado(s) a outro(s) tipo(s) de rota (${tiposRotasNomes}) nesta filial. Cada grupo só pode estar vinculado a um único tipo de rota por filial.`
          });
        }

        // Converter grupos para string
        const gruposString = TipoRotaCRUDController.gruposToString(gruposIds);
        updateFields.push('grupo_id = ?');
        updateParams.push(gruposString);
      }

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

      if (updateFields.length > 0) {
        updateParams.push(id);
        await executeQuery(
          `UPDATE tipo_rota SET ${updateFields.join(', ')} WHERE id = ?`,
          updateParams
        );
      }

      // Buscar tipo de rota atualizado
      const updatedTipoRota = await executeQuery(
        `SELECT 
          tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
          f.filial as filial_nome
         FROM tipo_rota tr
         LEFT JOIN filiais f ON tr.filial_id = f.id
         WHERE tr.id = ?`,
        [id]
      );

      if (updatedTipoRota.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de rota não encontrado',
          message: 'O tipo de rota não foi encontrado após a atualização'
        });
      }

      // Parsear grupos_id da string
      const gruposIdsAtualizados = TipoRotaCRUDController.gruposToArray(updatedTipoRota[0].grupo_id);
      
      // Buscar nomes dos grupos
      const gruposNomes = gruposIdsAtualizados.length > 0 ? await executeQuery(
        `SELECT id, nome FROM grupos WHERE id IN (${gruposIdsAtualizados.map(() => '?').join(',')}) ORDER BY nome ASC`,
        gruposIdsAtualizados
      ) : [];

      const grupos = gruposNomes.map(g => ({
        id: g.id,
        nome: g.nome
      }));

      const registro = updatedTipoRota[0];
      const data = {
        id: registro.id,
        nome: registro.nome,
        filial_id: registro.filial_id,
        filial_nome: registro.filial_nome,
        status: registro.status,
        grupos_id: gruposIdsAtualizados,
        grupos: grupos
      };

      return res.json({
        success: true,
        message: 'Tipo de rota atualizado com sucesso',
        data: data
      });

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

      // Verificar se existem rotas vinculadas a este tipo de rota
      const rotasVinculadas = await executeQuery(
        `SELECT DISTINCT r.id, r.codigo, r.nome, r.status 
         FROM rotas r
         WHERE r.tipo_rota_id = ?`,
        [id]
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
      // Remover vinculações de unidades escolares (se houver)
      await executeQuery(
        'UPDATE unidades_escolares SET tipo_rota_id = NULL, ordem_entrega = 0 WHERE tipo_rota_id = ?',
        [id]
      );

      // Excluir registro
      await executeQuery('DELETE FROM tipo_rota WHERE id = ?', [id]);

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

