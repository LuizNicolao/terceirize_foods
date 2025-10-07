-- Conectar ao banco foods_db
USE foods_db;

-- Alterar coluna estado para permitir NULL
ALTER TABLE unidades_escolares 
MODIFY COLUMN `estado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Estado da unidade';

-- Verificar se a alteração foi aplicada
DESCRIBE unidades_escolares;
