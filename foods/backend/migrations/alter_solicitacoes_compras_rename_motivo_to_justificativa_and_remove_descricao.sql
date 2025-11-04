-- Migration: Renomear campo motivo para justificativa e remover campo descricao
-- Data: 2024

-- Renomear coluna motivo para justificativa
ALTER TABLE `solicitacoes_compras`
  CHANGE COLUMN `motivo` `justificativa` VARCHAR(100) DEFAULT NULL;

-- Remover coluna descricao
ALTER TABLE `solicitacoes_compras`
  DROP COLUMN `descricao`;
