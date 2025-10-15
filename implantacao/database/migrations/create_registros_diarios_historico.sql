-- Criar tabela de histórico para registros diários
CREATE TABLE IF NOT EXISTS `registros_diarios_historico` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `registro_id` INT NOT NULL COMMENT 'ID do registro original em registros_diarios',
  `escola_id` INT NOT NULL,
  `escola_nome` VARCHAR(255) NULL,
  `nutricionista_id` INT NOT NULL,
  `data` DATE NOT NULL,
  `tipo_refeicao` ENUM('lanche_manha','almoco','lanche_tarde','parcial','eja') NOT NULL,
  `valor` INT NOT NULL DEFAULT 0,
  `valor_anterior` INT NULL COMMENT 'Valor antes da alteração',
  `acao` ENUM('criacao','edicao','exclusao') NOT NULL DEFAULT 'criacao',
  `data_acao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registro_id` (`registro_id`),
  KEY `idx_escola_id` (`escola_id`),
  KEY `idx_data` (`data`),
  KEY `idx_data_acao` (`data_acao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
COMMENT='Histórico de todas as alterações em registros diários';

-- Trigger para criar histórico ao INSERIR
DELIMITER $$
CREATE TRIGGER `after_registros_diarios_insert_historico`
AFTER INSERT ON `registros_diarios`
FOR EACH ROW
BEGIN
  INSERT INTO registros_diarios_historico (
    registro_id,
    escola_id,
    escola_nome,
    nutricionista_id,
    data,
    tipo_refeicao,
    valor,
    valor_anterior,
    acao,
    data_acao
  ) VALUES (
    NEW.id,
    NEW.escola_id,
    NEW.escola_nome,
    NEW.nutricionista_id,
    NEW.data,
    NEW.tipo_refeicao,
    NEW.valor,
    NULL,
    'criacao',
    NOW()
  );
END$$
DELIMITER ;

-- Trigger para criar histórico ao ATUALIZAR
DELIMITER $$
CREATE TRIGGER `after_registros_diarios_update_historico`
AFTER UPDATE ON `registros_diarios`
FOR EACH ROW
BEGIN
  -- Só cria histórico se o valor mudou
  IF OLD.valor != NEW.valor THEN
    INSERT INTO registros_diarios_historico (
      registro_id,
      escola_id,
      escola_nome,
      nutricionista_id,
      data,
      tipo_refeicao,
      valor,
      valor_anterior,
      acao,
      data_acao
    ) VALUES (
      NEW.id,
      NEW.escola_id,
      NEW.escola_nome,
      NEW.nutricionista_id,
      NEW.data,
      NEW.tipo_refeicao,
      NEW.valor,
      OLD.valor,
      'edicao',
      NOW()
    );
  END IF;
END$$
DELIMITER ;

-- Trigger para criar histórico ao DELETAR
DELIMITER $$
CREATE TRIGGER `before_registros_diarios_delete_historico`
BEFORE DELETE ON `registros_diarios`
FOR EACH ROW
BEGIN
  INSERT INTO registros_diarios_historico (
    registro_id,
    escola_id,
    escola_nome,
    nutricionista_id,
    data,
    tipo_refeicao,
    valor,
    valor_anterior,
    acao,
    data_acao
  ) VALUES (
    OLD.id,
    OLD.escola_id,
    OLD.escola_nome,
    OLD.nutricionista_id,
    OLD.data,
    OLD.tipo_refeicao,
    OLD.valor,
    OLD.valor,
    'exclusao',
    NOW()
  );
END$$
DELIMITER ;

