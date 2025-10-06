-- Conectar ao banco foods_db
USE foods_db;

-- Adicionar coluna supervisao
ALTER TABLE unidades_escolares 
ADD COLUMN `supervisao` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Supervisão da unidade escolar';

-- Adicionar coluna coordenacao
ALTER TABLE unidades_escolares 
ADD COLUMN `coordenacao` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Coordenação da unidade escolar';

-- Adicionar coluna lat (latitude)
ALTER TABLE unidades_escolares 
ADD COLUMN `lat` decimal(10,8) DEFAULT NULL COMMENT 'Latitude da unidade escolar';

-- Adicionar coluna long (longitude)
ALTER TABLE unidades_escolares 
ADD COLUMN `long` decimal(11,8) DEFAULT NULL COMMENT 'Longitude da unidade escolar';

-- Verificar se as colunas foram adicionadas corretamente
DESCRIBE unidades_escolares;
