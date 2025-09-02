-- Adicionar coluna filial_id na tabela unidades_escolares
USE foods_db;

ALTER TABLE unidades_escolares 
ADD COLUMN filial_id INT(11) DEFAULT NULL COMMENT 'ID da filial relacionada' AFTER observacoes;
