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
        observacoes,
        atendimento,
        horario,
        supervisao,
        coordenacao,
        lat,
        long,
        filial_id
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
          ordem_entrega, status, observacoes, atendimento, horario, supervisao, coordenacao, lat, \`long\`, filial_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        observacoes || null,
        atendimento || null,
        horario || null,
        supervisao || null,
        coordenacao || null,
        lat || null,
        long || null,
        filial_id || null
      ];

      const result = await executeQuery(insertQuery, insertParams);
      const newId = result.insertId;

      // Buscar unidade escolar criada
      const newUnidade = await executeQuery(
        'SELECT ue.*, r.nome as rota_nome, f.filial as filial_nome FROM unidades_escolares ue LEFT JOIN rotas r ON ue.rota_id = r.id LEFT JOIN filiais f ON ue.filial_id = f.id WHERE ue.id = ?',
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
        observacoes,
        atendimento,
        horario,
        supervisao,
        coordenacao,
        lat,
        long,
        filial_id
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
      if (atendimento !== undefined) {
        updateFields.push('atendimento = ?');
        updateParams.push(atendimento);
      }
      if (horario !== undefined) {
        updateFields.push('horario = ?');
        updateParams.push(horario);
      }
      if (supervisao !== undefined) {
        updateFields.push('supervisao = ?');
        updateParams.push(supervisao);
      }
      if (coordenacao !== undefined) {
        updateFields.push('coordenacao = ?');
        updateParams.push(coordenacao);
      }
      if (lat !== undefined) {
        updateFields.push('lat = ?');
        updateParams.push(lat);
      }
      if (long !== undefined) {
        updateFields.push('`long` = ?');
        updateParams.push(long);
      }
      if (filial_id !== undefined) {
        updateFields.push('filial_id = ?');
        updateParams.push(filial_id);
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

  // ===== MÉTODOS PARA TIPOS DE CARDÁPIO =====

  // Listar tipos de cardápio vinculados à unidade escolar
  static async getTiposCardapioUnidade(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID da unidade escolar é obrigatório'
        });
      }

      const query = `
        SELECT 
          tc.id,
          tc.nome,
          tc.codigo,
          tc.descricao,
          tc.status,
          tc.created_at,
          tc.updated_at,
          uetc.data_vinculo
        FROM unidades_escolares_tipos_cardapio uetc
        INNER JOIN tipos_cardapio tc ON uetc.tipo_cardapio_id = tc.id
        WHERE uetc.unidade_escolar_id = ?
        ORDER BY tc.nome ASC
      `;

      const tipos = await executeQuery(query, [id]);

      res.json({
        success: true,
        data: tipos
      });

    } catch (error) {
      console.error('Erro ao buscar tipos de cardápio da unidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os tipos de cardápio da unidade'
      });
    }
  }

  // Vincular tipo de cardápio à unidade escolar
  static async vincularTipoCardapio(req, res) {
    try {
      const { id } = req.params;
      const { tipo_cardapio_id } = req.body;

      if (!id || !tipo_cardapio_id) {
        return res.status(400).json({
          success: false,
          error: 'ID da unidade escolar e ID do tipo de cardápio são obrigatórios'
        });
      }

      // Verificar se a unidade escolar existe
      const unidadeQuery = 'SELECT id, filial_id FROM unidades_escolares WHERE id = ?';
      const unidades = await executeQuery(unidadeQuery, [id]);
      
      if (unidades.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada'
        });
      }

      const unidade = unidades[0];

      // Verificar se o tipo de cardápio está disponível para a filial da unidade
      const tipoDisponivelQuery = `
        SELECT tc.id 
        FROM tipos_cardapio tc
        INNER JOIN tipos_cardapio_filiais tcf ON tc.id = tcf.tipo_cardapio_id
        WHERE tc.id = ? AND tcf.filial_id = ? AND tc.status = 'ativo'
      `;
      const tiposDisponiveis = await executeQuery(tipoDisponivelQuery, [tipo_cardapio_id, unidade.filial_id]);
      
      if (tiposDisponiveis.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de cardápio não está disponível para a filial desta unidade escolar'
        });
      }

      // Verificar se já não está vinculado
      const jaVinculadoQuery = `
        SELECT id FROM unidades_escolares_tipos_cardapio 
        WHERE unidade_escolar_id = ? AND tipo_cardapio_id = ?
      `;
      const jaVinculado = await executeQuery(jaVinculadoQuery, [id, tipo_cardapio_id]);
      
      if (jaVinculado.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de cardápio já está vinculado a esta unidade escolar'
        });
      }

      // Vincular tipo de cardápio
      const vincularQuery = `
        INSERT INTO unidades_escolares_tipos_cardapio (unidade_escolar_id, tipo_cardapio_id, data_vinculo)
        VALUES (?, ?, NOW())
      `;
      
      await executeQuery(vincularQuery, [id, tipo_cardapio_id]);

      res.json({
        success: true,
        message: 'Tipo de cardápio vinculado com sucesso!',
        data: { unidade_escolar_id: id, tipo_cardapio_id }
      });

    } catch (error) {
      console.error('Erro ao vincular tipo de cardápio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível vincular o tipo de cardápio'
      });
    }
  }

  // Desvincular tipo de cardápio da unidade escolar
  static async desvincularTipoCardapio(req, res) {
    try {
      const { id, tipoId } = req.params;

      if (!id || !tipoId) {
        return res.status(400).json({
          success: false,
          error: 'ID da unidade escolar e ID do tipo de cardápio são obrigatórios'
        });
      }

      // Verificar se o vínculo existe
      const vinculoQuery = `
        SELECT id FROM unidades_escolares_tipos_cardapio 
        WHERE unidade_escolar_id = ? AND tipo_cardapio_id = ?
      `;
      const vinculos = await executeQuery(vinculoQuery, [id, tipoId]);
      
      if (vinculos.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Vínculo não encontrado'
        });
      }

      // Desvincular tipo de cardápio
      const desvincularQuery = `
        DELETE FROM unidades_escolares_tipos_cardapio 
        WHERE unidade_escolar_id = ? AND tipo_cardapio_id = ?
      `;
      
      await executeQuery(desvincularQuery, [id, tipoId]);

      res.json({
        success: true,
        message: 'Tipo de cardápio desvinculado com sucesso!',
        data: { unidade_escolar_id: id, tipo_cardapio_id: tipoId }
      });

    } catch (error) {
      console.error('Erro ao desvincular tipo de cardápio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível desvincular o tipo de cardápio'
      });
    }
  }

  // ===== MÉTODOS PARA PERÍODOS DE REFEIÇÃO =====

  static async getPeriodosRefeicao(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          pr.id,
          pr.nome,
          pr.codigo,
          pr.descricao,
          pr.status,
          uepr.data_vinculacao,
          uepr.quantidade_efetivos_padrao,
          uepr.quantidade_efetivos_nae,
          uepr.id as vinculo_id,
          uepr.quantidade_efetivos_padrao as efetivos_cadastrados_padrao,
          uepr.quantidade_efetivos_nae as efetivos_cadastrados_nae
        FROM periodos_refeicao pr
        INNER JOIN unidades_escolares_periodos_refeicao uepr ON pr.id = uepr.periodo_refeicao_id
        WHERE uepr.unidade_escolar_id = ?
        ORDER BY pr.nome ASC
      `;

      const periodos = await executeQuery(query, [id]);

      res.json({
        success: true,
        data: periodos
      });

    } catch (error) {
      console.error('Erro ao buscar períodos de refeição da unidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os períodos de refeição da unidade'
      });
    }
  }

  // Vincular período de refeição à unidade escolar
  static async vincularPeriodoRefeicao(req, res) {
    try {
      const { id } = req.params;
      const { 
        periodo_refeicao_id, 
        quantidade_efetivos_padrao = 0, 
        quantidade_efetivos_nae = 0 
      } = req.body;

      if (!id || !periodo_refeicao_id) {
        return res.status(400).json({
          success: false,
          error: 'ID da unidade escolar e ID do período de refeição são obrigatórios'
        });
      }

      // Verificar se a unidade escolar existe
      const unidadeQuery = 'SELECT id, filial_id FROM unidades_escolares WHERE id = ?';
      const unidades = await executeQuery(unidadeQuery, [id]);
      
      if (unidades.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada'
        });
      }

      const unidade = unidades[0];

      // Verificar se o período de refeição está disponível para a filial da unidade
      const periodoDisponivelQuery = `
        SELECT pr.id 
        FROM periodos_refeicao pr
        INNER JOIN periodos_refeicao_filiais prf ON pr.id = prf.periodo_refeicao_id
        WHERE pr.id = ? AND prf.filial_id = ? AND pr.status = 'ativo'
      `;
      const periodosDisponiveis = await executeQuery(periodoDisponivelQuery, [periodo_refeicao_id, unidade.filial_id]);
      
      if (periodosDisponiveis.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Período de refeição não está disponível para a filial desta unidade escolar'
        });
      }

      // Verificar se já não está vinculado
      const jaVinculadoQuery = `
        SELECT id FROM unidades_escolares_periodos_refeicao 
        WHERE unidade_escolar_id = ? AND periodo_refeicao_id = ?
      `;
      const jaVinculado = await executeQuery(jaVinculadoQuery, [id, periodo_refeicao_id]);
      
      if (jaVinculado.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Período de refeição já está vinculado a esta unidade escolar'
        });
      }

      // Vincular período de refeição
      const vincularQuery = `
        INSERT INTO unidades_escolares_periodos_refeicao 
        (unidade_escolar_id, periodo_refeicao_id, quantidade_efetivos_padrao, quantidade_efetivos_nae, data_vinculacao)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      await executeQuery(vincularQuery, [id, periodo_refeicao_id, quantidade_efetivos_padrao, quantidade_efetivos_nae]);

      res.json({
        success: true,
        message: 'Período de refeição vinculado com sucesso!',
        data: { unidade_escolar_id: id, periodo_refeicao_id }
      });

    } catch (error) {
      console.error('Erro ao vincular período de refeição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível vincular o período de refeição'
      });
    }
  }

  // Atualizar quantidades de efetivos de um período vinculado
  static async atualizarQuantidadesEfetivos(req, res) {
    try {
      const { id, periodoId } = req.params;
      const { quantidade_efetivos_padrao, quantidade_efetivos_nae } = req.body;

      if (!id || !periodoId) {
        return res.status(400).json({
          success: false,
          error: 'ID da unidade escolar e ID do período de refeição são obrigatórios'
        });
      }

      if (quantidade_efetivos_padrao === undefined || quantidade_efetivos_nae === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Quantidades de efetivos padrão e NAE são obrigatórias'
        });
      }

      if (quantidade_efetivos_padrao < 0 || quantidade_efetivos_nae < 0) {
        return res.status(400).json({
          success: false,
          error: 'As quantidades de efetivos devem ser números positivos'
        });
      }

      // Verificar se o vínculo existe
      const vinculoQuery = `
        SELECT id FROM unidades_escolares_periodos_refeicao 
        WHERE unidade_escolar_id = ? AND periodo_refeicao_id = ?
      `;
      const vinculos = await executeQuery(vinculoQuery, [id, periodoId]);
      
      if (vinculos.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Vínculo não encontrado'
        });
      }

      // Atualizar quantidades
      const atualizarQuery = `
        UPDATE unidades_escolares_periodos_refeicao 
        SET quantidade_efetivos_padrao = ?, quantidade_efetivos_nae = ?, atualizado_em = NOW()
        WHERE unidade_escolar_id = ? AND periodo_refeicao_id = ?
      `;
      
      await executeQuery(atualizarQuery, [quantidade_efetivos_padrao, quantidade_efetivos_nae, id, periodoId]);

      res.json({
        success: true,
        message: 'Quantidades de efetivos atualizadas com sucesso!',
        data: { 
          unidade_escolar_id: id, 
          periodo_refeicao_id: periodoId,
          quantidade_efetivos_padrao,
          quantidade_efetivos_nae
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar quantidades de efetivos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar as quantidades de efetivos'
      });
    }
  }

  // Desvincular período de refeição da unidade escolar
  static async desvincularPeriodoRefeicao(req, res) {
    try {
      const { id, periodoId } = req.params;

      if (!id || !periodoId) {
        return res.status(400).json({
          success: false,
          error: 'ID da unidade escolar e ID do período de refeição são obrigatórios'
        });
      }

      // Verificar se o vínculo existe
      const vinculoQuery = `
        SELECT id FROM unidades_escolares_periodos_refeicao 
        WHERE unidade_escolar_id = ? AND periodo_refeicao_id = ?
      `;
      const vinculos = await executeQuery(vinculoQuery, [id, periodoId]);
      
      if (vinculos.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Vínculo não encontrado'
        });
      }

      // Desvincular período de refeição
      const desvincularQuery = `
        DELETE FROM unidades_escolares_periodos_refeicao 
        WHERE unidade_escolar_id = ? AND periodo_refeicao_id = ?
      `;
      
      await executeQuery(desvincularQuery, [id, periodoId]);

      res.json({
        success: true,
        message: 'Período de refeição desvinculado com sucesso!',
        data: { unidade_escolar_id: id, periodo_refeicao_id: periodoId }
      });

    } catch (error) {
      console.error('Erro ao desvincular período de refeição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível desvincular o período de refeição'
      });
    }
  }
}

module.exports = UnidadesEscolaresCRUDController;
