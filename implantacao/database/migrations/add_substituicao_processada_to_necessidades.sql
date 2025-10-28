-- Adicionar coluna substituicao_processada na tabela necessidades
-- Para controlar quais necessidades já foram processadas para substituição

ALTER TABLE necessidades 
ADD COLUMN substituicao_processada TINYINT(1) DEFAULT 0 COMMENT 'Indica se a necessidade já foi processada para substituição (0=não, 1=sim)';

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_necessidades_substituicao_processada ON necessidades(substituicao_processada);

-- Atualizar registros existentes que já têm substituições
UPDATE necessidades n
SET substituicao_processada = 1
WHERE EXISTS (
    SELECT 1 
    FROM necessidades_substituicoes ns 
    WHERE ns.produto_origem_id = n.produto_id 
    AND ns.semana_abastecimento = n.semana_abastecimento 
    AND ns.semana_consumo = n.semana_consumo
    AND ns.ativo = 1
);
