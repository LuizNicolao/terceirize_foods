-- Script para adicionar a coluna produto_origem_id na tabela produtos
-- Execute este script no banco de dados para adicionar a nova coluna

-- Adicionar a coluna produto_origem_id
ALTER TABLE `produtos` 
ADD COLUMN `produto_origem_id` int DEFAULT NULL COMMENT 'ID do produto origem do produto' 
AFTER `nome_generico_id`;

-- Adicionar a chave estrangeira
ALTER TABLE `produtos`
ADD CONSTRAINT `fk_produtos_produto_origem` 
FOREIGN KEY (`produto_origem_id`) REFERENCES `produto_origem` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Adicionar índice para melhor performance
ALTER TABLE `produtos` 
ADD INDEX `idx_produto_origem_id` (`produto_origem_id`);

-- Atualizar produtos existentes com produto_origem_id baseado no produto_generico
UPDATE `produtos` p
INNER JOIN `produto_generico` pg ON p.nome_generico_id = pg.id
SET p.produto_origem_id = pg.produto_origem_id
WHERE p.nome_generico_id IS NOT NULL AND pg.produto_origem_id IS NOT NULL;
