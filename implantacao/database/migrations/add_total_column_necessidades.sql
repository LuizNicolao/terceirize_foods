-- Adicionar coluna total na tabela necessidades
-- Esta coluna armazena o total calculado automaticamente pelo sistema
-- para permitir geração de relatórios no futuro

ALTER TABLE necessidades 
ADD COLUMN total DECIMAL(10, 3) NULL DEFAULT NULL 
COMMENT 'Total calculado automaticamente (soma de todas as quantidades por período)';

-- Criar índice para melhorar performance em consultas por total
CREATE INDEX idx_necessidades_total ON necessidades(total);

