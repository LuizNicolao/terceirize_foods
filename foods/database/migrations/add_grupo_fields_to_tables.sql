-- =====================================================
-- Migração: Adicionar campos grupo_id e grupo_nome
-- Tabelas: notas_fiscais_itens e almoxarifado_estoque
-- Data: 2025-11-28
-- =====================================================

-- Adicionar campos grupo_id e grupo_nome na tabela notas_fiscais_itens
ALTER TABLE notas_fiscais_itens 
ADD COLUMN grupo_id INT NULL COMMENT 'ID do grupo do produto' AFTER produto_generico_id,
ADD COLUMN grupo_nome VARCHAR(100) NULL COMMENT 'Nome do grupo do produto' AFTER grupo_id;

-- Adicionar índices para melhorar performance de consultas
ALTER TABLE notas_fiscais_itens 
ADD INDEX idx_grupo_id (grupo_id);

-- Adicionar campos grupo_id e grupo_nome na tabela almoxarifado_estoque
ALTER TABLE almoxarifado_estoque 
ADD COLUMN grupo_id INT NULL COMMENT 'ID do grupo do produto' AFTER produto_generico_id,
ADD COLUMN grupo_nome VARCHAR(100) NULL COMMENT 'Nome do grupo do produto' AFTER grupo_id;

-- Adicionar índices para melhorar performance de consultas
ALTER TABLE almoxarifado_estoque 
ADD INDEX idx_grupo_id (grupo_id);

