-- Conectar ao banco foods_db
USE foods_db;

-- Verificar se a foreign key já existe
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'foods_db' 
    AND TABLE_NAME = 'unidades_escolares' 
    AND CONSTRAINT_NAME = 'unidades_escolares_ibfk_rota_nutricionista'
);

-- Adicionar foreign key se não existir
SET @sql = IF(@constraint_exists = 0, 
  'ALTER TABLE unidades_escolares ADD CONSTRAINT unidades_escolares_ibfk_rota_nutricionista FOREIGN KEY (rota_nutricionista_id) REFERENCES rotas_nutricionistas(id) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT "Foreign key já existe" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar se a foreign key foi criada
SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'foods_db' 
  AND TABLE_NAME = 'unidades_escolares' 
  AND CONSTRAINT_NAME = 'unidades_escolares_ibfk_rota_nutricionista';
