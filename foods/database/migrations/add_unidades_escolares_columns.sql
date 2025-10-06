-- Adicionar colunas atendimento e horario na tabela unidades_escolares
-- Data: 2024-12-19

USE foods_db;

-- Adicionar coluna atendimento
ALTER TABLE unidades_escolares 
ADD COLUMN `atendimento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- Adicionar coluna horario
ALTER TABLE unidades_escolares 
ADD COLUMN `horario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- Verificar se as colunas foram adicionadas corretamente
DESCRIBE unidades_escolares;
