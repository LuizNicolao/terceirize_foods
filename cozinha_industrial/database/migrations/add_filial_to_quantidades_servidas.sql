-- Migration: Adicionar campos filial_id e filial_nome na tabela quantidades_servidas
-- Data: 2024

ALTER TABLE `quantidades_servidas`
ADD COLUMN `filial_id` int DEFAULT NULL COMMENT 'ID da filial (relaciona com filiais do Foods)' AFTER `unidade_id`,
ADD COLUMN `filial_nome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Nome da filial' AFTER `filial_id`;

-- Criar índice para melhorar performance nas consultas por filial
CREATE INDEX `idx_quantidades_servidas_filial_id` ON `quantidades_servidas` (`filial_id`);

