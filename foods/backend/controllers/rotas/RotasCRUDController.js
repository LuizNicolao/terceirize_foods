/**
 * Controller CRUD de Rotas
 * Responsável por criar, atualizar e excluir rotas
 */

const { executeQuery } = require('../../config/database');

class RotasCRUDController {
  // Criar rota
  static async criarRota(req, res) {
    try {
      const {
        filial_id,
        codigo,
        nome,
        status = 'ativo',
        tipo_rota = 'semanal',
        unidades_selecionadas = []
      } = req.body;

      // Validações específicas
      if (!codigo || codigo.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Código inválido',
          message: 'O código deve ter pelo menos 3 caracteres'
        });
      }

      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se código já existe na filial
      const existingCodigo = await executeQuery(
        'SELECT id FROM rotas WHERE codigo = ? AND filial_id = ?',
        [codigo.trim(), filial_id]
      );

      if (existingCodigo.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Código já cadastrado',
          message: 'Já existe uma rota com este código nesta filial'
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

      // Inserir rota
      const insertQuery = `
        INSERT INTO rotas (
          filial_id, codigo, nome, status, tipo_rota
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        filial_id,
        codigo.trim(),
        nome.trim(),
        status,
        tipo_rota
      ]);

      // Vincular unidades escolares selecionadas à rota
      if (unidades_selecionadas && unidades_selecionadas.length > 0) {
        for (const unidade of unidades_selecionadas) {
          if (unidade.id) {
            // Verificar se a unidade existe e não está vinculada a outra rota
            const unidadeExistente = await executeQuery(
              'SELECT id, rota_id FROM unidades_escolares WHERE id = ?',
              [unidade.id]
            );

            if (unidadeExistente.length > 0 && !unidadeExistente[0].rota_id) {
              // Vincular a unidade à rota e definir ordem de entrega individual
              const ordemEntrega = unidade.ordem_entrega || 0;
              await executeQuery(
                'UPDATE unidades_escolares SET rota_id = ?, ordem_entrega = ? WHERE id = ?',
                [result.insertId, ordemEntrega, unidade.id]
              );
            }
          }
        }
      }

      // Buscar rota criada
      const newRota = await executeQuery(
        'SELECT r.*, f.filial as filial_nome FROM rotas r LEFT JOIN filiais f ON r.filial_id = f.id WHERE r.id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Rota criada com sucesso',
        data: newRota[0]
      });

    } catch (error) {
      console.error('Erro ao criar rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar a rota'
      });
    }
  }

  // Atualizar rota
  static async atualizarRota(req, res) {
    try {
      const { id } = req.params;
      const {
        filial_id,
        codigo,
        nome,
        status,
        tipo_rota,
        unidades_selecionadas = []
      } = req.body;

      // Verificar se a rota existe
      const existingRota = await executeQuery(
        'SELECT * FROM rotas WHERE id = ?',
        [id]
      );

      if (existingRota.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Rota não encontrada',
          message: 'A rota especificada não foi encontrada'
        });
      }

      // Validações específicas
      if (codigo && codigo.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Código inválido',
          message: 'O código deve ter pelo menos 3 caracteres'
        });
      }

      if (nome && nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se código já existe em outra rota da mesma filial
      if (codigo) {
        const codigoCheck = await executeQuery(
          'SELECT id FROM rotas WHERE codigo = ? AND filial_id = ? AND id != ?',
          [codigo.trim(), filial_id || existingRota[0].filial_id, id]
        );

        if (codigoCheck.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Código já cadastrado',
            message: 'Já existe outra rota com este código nesta filial'
          });
        }
      }

      // Verificar se a filial existe (se fornecida)
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

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateParams = [];

      if (filial_id !== undefined) {
        updateFields.push('filial_id = ?');
        updateParams.push(filial_id);
      }
      if (codigo !== undefined) {
        updateFields.push('codigo = ?');
        updateParams.push(codigo.trim());
      }
      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateParams.push(nome.trim());
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      if (tipo_rota !== undefined) {
        updateFields.push('tipo_rota = ?');
        updateParams.push(tipo_rota);
      }

      // Sempre atualizar o timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar',
          message: 'Nenhum campo foi fornecido para atualização'
        });
      }

      updateParams.push(id);
      await executeQuery(
        `UPDATE rotas SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Atualizar unidades escolares vinculadas se fornecidas
      if (unidades_selecionadas !== undefined) {
        // Primeiro, remover todas as vinculações existentes desta rota
        await executeQuery(
          'UPDATE unidades_escolares SET rota_id = NULL, ordem_entrega = 0 WHERE rota_id = ?',
          [id]
        );

        // Depois, vincular as novas unidades selecionadas
        if (unidades_selecionadas && unidades_selecionadas.length > 0) {
          for (const unidade of unidades_selecionadas) {
            if (unidade.id) {
              // Verificar se a unidade existe e não está vinculada a outra rota
              const unidadeExistente = await executeQuery(
                'SELECT id, rota_id FROM unidades_escolares WHERE id = ?',
                [unidade.id]
              );

              if (unidadeExistente.length > 0 && (!unidadeExistente[0].rota_id || unidadeExistente[0].rota_id == id)) {
                // Vincular a unidade à rota e definir ordem de entrega individual
                const ordemEntrega = unidade.ordem_entrega || 0;
                await executeQuery(
                  'UPDATE unidades_escolares SET rota_id = ?, ordem_entrega = ? WHERE id = ?',
                  [id, ordemEntrega, unidade.id]
                );
              }
            }
          }
        }
      }

      // Buscar rota atualizada
      const updatedRota = await executeQuery(
        'SELECT r.*, f.filial as filial_nome FROM rotas r LEFT JOIN filiais f ON r.filial_id = f.id WHERE r.id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Rota atualizada com sucesso',
        data: updatedRota[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar a rota'
      });
    }
  }

  // Excluir rota
  static async excluirRota(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a rota existe
      const rota = await executeQuery(
        'SELECT * FROM rotas WHERE id = ?',
        [id]
      );

      if (rota.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Rota não encontrada',
          message: 'A rota especificada não foi encontrada'
        });
      }

      // Verificar se há unidades escolares vinculadas
      const unidadesVinculadas = await executeQuery(
        'SELECT COUNT(*) as total FROM unidades_escolares WHERE rota_id = ?',
        [id]
      );

      if (unidadesVinculadas[0].total > 0) {
        const totalUnidades = unidadesVinculadas[0].total;
        return res.status(400).json({
          success: false,
          error: 'Rota em uso',
          message: `Não é possível excluir esta rota. Existem ${totalUnidades} unidade(s) escolar(es) vinculada(s) a ela. Para excluir esta rota, primeiro desvincule todas as unidades escolares editando a rota e desmarcando as escolas selecionadas.`
        });
      }

      // Excluir rota
      await executeQuery('DELETE FROM rotas WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Rota excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir a rota'
      });
    }
  }
}

module.exports = RotasCRUDController;
