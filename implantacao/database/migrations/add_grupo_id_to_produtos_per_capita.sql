-- Adicionar coluna grupo_id na tabela produtos_per_capita
ALTER TABLE produtos_per_capita 
ADD COLUMN grupo_id INT DEFAULT NULL COMMENT 'ID do grupo do produto';

-- Criar índice para melhor performance
CREATE INDEX idx_produtos_per_capita_grupo_id ON produtos_per_capita(grupo_id);

-- Atualizar registros existentes com grupo_id baseado no nome do grupo
UPDATE produtos_per_capita ppc
SET ppc.grupo_id = CASE 
  WHEN ppc.grupo = 'FRIOS' THEN 1
  WHEN ppc.grupo = 'SECOS' THEN 2
  WHEN ppc.grupo = 'USO E CONSUMO' THEN 3
  WHEN ppc.grupo = 'HORTIFRUTI' THEN 4
  WHEN ppc.grupo = 'PADARIA E CONFEITARIA' THEN 5
  WHEN ppc.grupo = 'GASES E SIMILARES' THEN 6
  WHEN ppc.grupo = 'EQUIPAMENTOS' THEN 7
  WHEN ppc.grupo = 'UTENSILIOS' THEN 8
  WHEN ppc.grupo = 'UNIFORMES E EPI' THEN 9
  ELSE NULL
END
WHERE ppc.grupo IS NOT NULL;
