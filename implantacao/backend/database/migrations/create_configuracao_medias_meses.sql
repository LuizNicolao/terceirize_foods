-- Tabela para configuração de meses válidos para cálculo de médias
CREATE TABLE IF NOT EXISTS `configuracao_medias_meses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ano` int NOT NULL COMMENT 'Ano de referência',
  `mes` int NOT NULL COMMENT 'Mês (1-12)',
  `ativo` tinyint(1) DEFAULT '1' COMMENT 'Se o mês está ativo para cálculo',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ano_mes` (`ano`, `mes`),
  KEY `idx_ano` (`ano`),
  KEY `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuração de meses válidos para cálculo de médias';

-- Inserir meses padrão para o ano atual (todos ativos)
INSERT INTO `configuracao_medias_meses` (`ano`, `mes`, `ativo`)
SELECT YEAR(CURDATE()) as ano, mes, 1 as ativo
FROM (
  SELECT 1 as mes UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
  UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
) meses
ON DUPLICATE KEY UPDATE ativo = 1;

