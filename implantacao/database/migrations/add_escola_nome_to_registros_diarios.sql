-- Adicionar campo escola_nome na tabela registros_diarios
ALTER TABLE `registros_diarios` 
ADD COLUMN `escola_nome` VARCHAR(255) NULL AFTER `escola_id`;

-- Criar índice para melhorar performance de buscas
ALTER TABLE `registros_diarios` 
ADD INDEX `idx_escola_nome` (`escola_nome`);

