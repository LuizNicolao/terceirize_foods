-- Atualizar procedimento para considerar meses configurados
DELIMITER $$
DROP PROCEDURE IF EXISTS `recalcular_media_escola`$$
CREATE DEFINER=`root`@`%` PROCEDURE `recalcular_media_escola`(IN `p_escola_id` INT)
BEGIN
  DECLARE v_count INT;
  DECLARE v_nutricionista_id INT;
  DECLARE v_escola_nome VARCHAR(255);
  DECLARE v_media_lanche_manha INT;
  DECLARE v_media_parcial_manha INT;
  DECLARE v_media_almoco INT;
  DECLARE v_media_lanche_tarde INT;
  DECLARE v_media_parcial_tarde INT;
  DECLARE v_media_eja INT;
  DECLARE v_ultima_atualizacao TIMESTAMP;
  DECLARE v_ano_atual INT;

  -- Obter ano atual
  SET v_ano_atual = YEAR(CURDATE());

  -- Quantos dias (datas distintas) ativos existem para a escola nos meses configurados
  SELECT COUNT(DISTINCT rd.data)
    INTO v_count
  FROM registros_diarios rd
  INNER JOIN configuracao_medias_meses cmm 
    ON YEAR(rd.data) = cmm.ano 
    AND MONTH(rd.data) = cmm.mes
  WHERE rd.escola_id = p_escola_id
    AND rd.ativo = 1
    AND cmm.ativo = 1
    AND cmm.ano = v_ano_atual;

  -- Se não houver registros, remover média
  IF v_count = 0 THEN
    DELETE FROM media_escolas
    WHERE escola_id = p_escola_id;

  ELSE
    -- Pegar o registro mais recente (sem GROUP BY/ORDER BY em agregação)
    SELECT
      nutricionista_id,
      escola_nome,
      data_atualizacao
    INTO
      v_nutricionista_id,
      v_escola_nome,
      v_ultima_atualizacao
    FROM registros_diarios
    WHERE escola_id = p_escola_id
      AND ativo = 1
    ORDER BY data_atualizacao DESC
    LIMIT 1;

    -- Calcular médias (inteiro, com ROUND) para os 6 tipos, considerando apenas meses configurados
    SELECT
      ROUND(AVG(CASE WHEN rd.tipo_refeicao = 'lanche_manha'    THEN rd.valor END)),
      ROUND(AVG(CASE WHEN rd.tipo_refeicao = 'parcial_manha'   THEN rd.valor END)),
      ROUND(AVG(CASE WHEN rd.tipo_refeicao = 'almoco'          THEN rd.valor END)),
      ROUND(AVG(CASE WHEN rd.tipo_refeicao = 'lanche_tarde'    THEN rd.valor END)),
      ROUND(AVG(CASE WHEN rd.tipo_refeicao = 'parcial_tarde'   THEN rd.valor END)),
      ROUND(AVG(CASE WHEN rd.tipo_refeicao = 'eja'             THEN rd.valor END))
    INTO
      v_media_lanche_manha,
      v_media_parcial_manha,
      v_media_almoco,
      v_media_lanche_tarde,
      v_media_parcial_tarde,
      v_media_eja
    FROM registros_diarios rd
    INNER JOIN configuracao_medias_meses cmm 
      ON YEAR(rd.data) = cmm.ano 
      AND MONTH(rd.data) = cmm.mes
    WHERE rd.escola_id = p_escola_id
      AND rd.ativo = 1
      AND cmm.ativo = 1
      AND cmm.ano = v_ano_atual;

    -- Upsert das médias
    INSERT INTO media_escolas (
      escola_id,
      escola_nome,
      nutricionista_id,
      media_lanche_manha,
      media_parcial_manha,
      media_almoco,
      media_lanche_tarde,
      media_parcial_tarde,
      media_eja,
      calculada_automaticamente,
      quantidade_lancamentos,
      data_calculo,
      ultima_atualizacao_registros
    ) VALUES (
      p_escola_id,
      v_escola_nome,
      v_nutricionista_id,
      COALESCE(v_media_lanche_manha, 0),
      COALESCE(v_media_parcial_manha, 0),
      COALESCE(v_media_almoco, 0),
      COALESCE(v_media_lanche_tarde, 0),
      COALESCE(v_media_parcial_tarde, 0),
      COALESCE(v_media_eja, 0),
      1,
      v_count,
      NOW(),
      v_ultima_atualizacao
    )
    ON DUPLICATE KEY UPDATE
      escola_nome                   = VALUES(escola_nome),
      nutricionista_id              = VALUES(nutricionista_id),
      media_lanche_manha            = VALUES(media_lanche_manha),
      media_parcial_manha           = VALUES(media_parcial_manha),
      media_almoco                  = VALUES(media_almoco),
      media_lanche_tarde            = VALUES(media_lanche_tarde),
      media_parcial_tarde           = VALUES(media_parcial_tarde),
      media_eja                     = VALUES(media_eja),
      calculada_automaticamente     = 1,
      quantidade_lancamentos        = VALUES(quantidade_lancamentos),
      data_calculo                  = NOW(),
      ultima_atualizacao_registros  = VALUES(ultima_atualizacao_registros),
      data_atualizacao              = NOW();
  END IF;
END$$
DELIMITER ;

