/**
 * Controller CRUD de Unidades Escolares
 * Responsável por criar, atualizar e excluir unidades escolares
 */

const { executeQuery } = require('../../config/database');

class UnidadesEscolaresCRUDController {
  // Criar unidade escolar
  static async criarUnidadeEscolar(req, res) {
    try {
      const {
        codigo_teknisa,
        nome_escola,
        cidade,
        estado,
        pais = 'Brasil',
        endereco,
        numero,
        bairro,
        cep,
        centro_distribuicao,
        rota_id,
        regional,
        lot,
        cc_senior,
        codigo_senior,
        abastecimento,
        ordem_entrega = 0,
        status = 'ativo',
        observacoes
      } = req.body;

      // Verificar se a rota existe (se fornecida)
      if (rota_id) {
        const rota = await executeQuery(
          'SELECT id FROM rotas WHERE id = ?',
          [rota_id]
        );

        if (rota.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Rota não encontrada',
            message: 'A rota especificada não foi encontrada'
          });
        }
      }

      // Verificar se código teknisa já existe
      const existingUnidade = await executeQuery(
        'SELECT id FROM unidades_escolares WHERE codigo_teknisa = ?',
        [codigo_teknisa.trim()]
      );

      if (existingUnidade.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Código Teknisa já existe',
          message: 'Já existe uma unidade escolar com este código Teknisa'
        });
      }

      // Inserir unidade escolar
      const insertQuery = `
        INSERT INTO unidades_escolares (
          codigo_teknisa, nome_escola, cidade, estado, pais, endereco, numero, bairro, cep,
          centro_distribuicao, rota_id, regional, lot, cc_senior, codigo_senior, abastecimento,
          ordem_entrega, status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertParams = [
        codigo_teknisa.trim(),
        nome_escola.trim(),
        cidade.trim(),
        estado.trim(),
        pais.trim(),
        endereco.trim(),
        numero || null,
        bairro || null,
        cep || null,
        centro_distribuicao || null,
        rota_id || null,
        regional || null,
        lot || null,
        cc_senior || null,
        codigo_senior || null,
        abastecimento || null,
        ordem_entrega,
        status,
        observacoes || null
      ];

      const result = await executeQuery(insertQuery, insertParams);
      const newId = result.insertId;

      // Buscar unidade escolar criada
      const newUnidade = await executeQuery(
        'SELECT ue.*, r.nome as rota_nome FROM unidades_escolares ue LEFT JOIN rotas r ON ue.rota_id = r.id WHERE ue.id = ?',
        [newId]
      );

      res.status(201).json({
        success: true,
        message: 'Unidade escolar criada com sucesso',
        data: newUnidade[0]
      });

    } catch (error) {
      console.error('Erro ao criar unidade escolar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar a unidade escolar'
      });
    }
  }

  // Atualizar unidade escolar
  static async atualizarUnidadeEscolar(req, res) {
    try {
      const { id } = req.params;
      const {
        codigo_teknisa,
        nome_escola,
        cidade,
        estado,
        pais,
        endereco,
        numero,
        bairro,
        cep,
        centro_distribuicao,
        rota_id,
        regional,
        lot,
        cc_senior,
        codigo_senior,
        abastecimento,
        ordem_entrega,
        status,
        observacoes
      } = req.body;

      // Verificar se a unidade escolar existe
      const existingUnidade = await executeQuery(
        'SELECT * FROM unidades_escolares WHERE id = ?',
        [id]
      );

      if (existingUnidade.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada',
          message: 'A unidade escolar especificada não foi encontrada'
        });
      }

      // Verificar se a rota existe (se fornecida)
      if (rota_id) {
        const rota = await executeQuery(
          'SELECT id FROM rotas WHERE id = ?',
          [rota_id]
        );

        if (rota.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Rota não encontrada',
            message: 'A rota especificada não foi encontrada'
          });
        }
      }

      // Verificar se código teknisa já existe (se estiver sendo alterado)
      if (codigo_teknisa) {
        const codigoCheck = await executeQuery(
          'SELECT id FROM unidades_escolares WHERE codigo_teknisa = ? AND id != ?',
          [codigo_teknisa.trim(), id]
        );

        if (codigoCheck.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Código Teknisa já existe',
            message: 'Já existe outra unidade escolar com este código Teknisa'
          });
        }
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateParams = [];

      if (codigo_teknisa !== undefined) {
        updateFields.push('codigo_teknisa = ?');
        updateParams.push(codigo_teknisa.trim());
      }
      if (nome_escola !== undefined) {
        updateFields.push('nome_escola = ?');
        updateParams.push(nome_escola.trim());
      }
      if (cidade !== undefined) {
        updateFields.push('cidade = ?');
        updateParams.push(cidade.trim());
      }
      if (estado !== undefined) {
        updateFields.push('estado = ?');
        updateParams.push(estado.trim());
      }
      if (pais !== undefined) {
        updateFields.push('pais = ?');
        updateParams.push(pais.trim());
      }
      if (endereco !== undefined) {
        updateFields.push('endereco = ?');
        updateParams.push(endereco.trim());
      }
      if (numero !== undefined) {
        updateFields.push('numero = ?');
        updateParams.push(numero);
      }
      if (bairro !== undefined) {
        updateFields.push('bairro = ?');
        updateParams.push(bairro);
      }
      if (cep !== undefined) {
        updateFields.push('cep = ?');
        updateParams.push(cep);
      }
      if (centro_distribuicao !== undefined) {
        updateFields.push('centro_distribuicao = ?');
        updateParams.push(centro_distribuicao);
      }
      if (rota_id !== undefined) {
        updateFields.push('rota_id = ?');
        updateParams.push(rota_id);
      }
      if (regional !== undefined) {
        updateFields.push('regional = ?');
        updateParams.push(regional);
      }
      if (lot !== undefined) {
        updateFields.push('lot = ?');
        updateParams.push(lot);
      }
      if (cc_senior !== undefined) {
        updateFields.push('cc_senior = ?');
        updateParams.push(cc_senior);
      }
      if (codigo_senior !== undefined) {
        updateFields.push('codigo_senior = ?');
        updateParams.push(codigo_senior);
      }
      if (abastecimento !== undefined) {
        updateFields.push('abastecimento = ?');
        updateParams.push(abastecimento);
      }
      if (ordem_entrega !== undefined) {
        updateFields.push('ordem_entrega = ?');
        updateParams.push(ordem_entrega);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      if (observacoes !== undefined) {
        updateFields.push('observacoes = ?');
        updateParams.push(observacoes);
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
        `UPDATE unidades_escolares SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Buscar unidade escolar atualizada
      const updatedUnidade = await executeQuery(
        'SELECT ue.*, r.nome as rota_nome FROM unidades_escolares ue LEFT JOIN rotas r ON ue.rota_id = r.id WHERE ue.id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Unidade escolar atualizada com sucesso',
        data: updatedUnidade[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar unidade escolar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar a unidade escolar'
      });
    }
  }

  // Excluir unidade escolar
  static async excluirUnidadeEscolar(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a unidade escolar existe
      const unidade = await executeQuery(
        'SELECT * FROM unidades_escolares WHERE id = ?',
        [id]
      );

      if (unidade.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada',
          message: 'A unidade escolar especificada não foi encontrada'
        });
      }

      // Excluir unidade escolar
      await executeQuery('DELETE FROM unidades_escolares WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Unidade escolar excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir unidade escolar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir a unidade escolar'
      });
    }
  }
}

module.exports = UnidadesEscolaresCRUDController;
