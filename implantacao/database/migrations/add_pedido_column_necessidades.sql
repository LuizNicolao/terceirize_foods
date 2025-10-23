-- Migração: Adicionar coluna pedido na tabela necessidades
-- Data: 2024-12-19
-- Descrição: Adiciona coluna pedido para controlar se a necessidade já foi convertida em pedido

USE implantacao_db;

-- Adicionar coluna pedido na tabela necessidades
ALTER TABLE necessidades 
ADD COLUMN pedido VARCHAR(50) 
COMMENT 'ID do pedido gerado a partir desta necessidade (NULL se ainda não foi convertida)';

-- Criar índice para melhorar performance das consultas por pedido
CREATE INDEX idx_necessidades_pedido ON necessidades(pedido);
