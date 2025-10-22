-- Migration para corrigir estrutura da tabela necessidades
-- Data: 2025-01-17
-- Descrição: Ajustar estrutura para compatibilidade com sistema

-- Remover campos desnecessários
ALTER TABLE `necessidades` 
DROP COLUMN `quantidade`,
DROP COLUMN `frequencia`,
DROP COLUMN `percapita`,
DROP COLUMN `grupo_id`,
DROP COLUMN `ativo`;

-- Adicionar campos necessários
ALTER TABLE `necessidades` 
ADD COLUMN `usuario_id` INT NOT NULL AFTER `id`,
ADD COLUMN `escola_id` INT NOT NULL AFTER `usuario_id`,
ADD COLUMN `produto_id` INT NOT NULL AFTER `escola_id`,
ADD COLUMN `escola_rota` VARCHAR(100) DEFAULT NULL AFTER `escola`,
ADD COLUMN `produto_unidade` VARCHAR(50) DEFAULT NULL AFTER `produto`;

-- Adicionar índices para os novos campos
ALTER TABLE `necessidades`
ADD INDEX `idx_usuario_id` (`usuario_id`),
ADD INDEX `idx_escola_id` (`escola_id`),
ADD INDEX `idx_produto_id` (`produto_id`);

-- Adicionar chave única para evitar duplicatas
ALTER TABLE `necessidades`
ADD UNIQUE KEY `uk_necessidade_unica` (`usuario_id`, `escola_id`, `produto_id`, `semana_consumo`);

-- Comentário da tabela
ALTER TABLE `necessidades` 
COMMENT = 'Tabela de necessidades - estrutura corrigida para compatibilidade com sistema';
