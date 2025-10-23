-- Migração: Atualizar necessidade_id para formato sequencial
-- Data: 2024-12-19
-- Descrição: Atualiza IDs existentes para formato sequencial simples

USE implantacao_db;

-- Atualizar necessidade_id para formato sequencial nos registros existentes
SET @row_number = 0;
UPDATE necessidades 
SET necessidade_id = (@row_number := @row_number + 1)
WHERE necessidade_id IS NULL OR necessidade_id NOT REGEXP '^[0-9]+$'
ORDER BY id;

-- Verificar se há registros com necessidade_id nulo
UPDATE necessidades 
SET necessidade_id = '1'
WHERE necessidade_id IS NULL;
