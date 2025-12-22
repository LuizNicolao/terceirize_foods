-- Script para atualizar IDs de necessidades existentes
-- Formato novo: SEMANAID-ESCOLAID-GRUPOID
-- Executar no banco implantacao_db

USE implantacao_db;

-- Criar tabela temporária com os novos IDs calculados
CREATE TEMPORARY TABLE temp_novos_ids AS
SELECT DISTINCT
    n.necessidade_id as id_antigo,
    n.escola_id,
    n.grupo_id,
    n.semana_consumo,
    -- Buscar ID da semana no calendario (foods_db)
    COALESCE(
        -- Tentativa 1: Busca exata
        (SELECT MIN(c.id) 
         FROM foods_db.calendario c 
         WHERE c.semana_consumo = n.semana_consumo
         LIMIT 1),
        -- Tentativa 2: Busca com LIKE (sem parênteses)
        (SELECT MIN(c.id) 
         FROM foods_db.calendario c 
         WHERE REPLACE(REPLACE(c.semana_consumo, '(', ''), ')', '') 
               LIKE CONCAT('%', REPLACE(REPLACE(n.semana_consumo, '(', ''), ')', ''), '%')
         LIMIT 1),
        -- Fallback: Hash usando CRC32 (gera número de 32 bits, limitamos a 5 dígitos)
        ABS(CRC32(COALESCE(n.semana_consumo, ''))) % 100000
    ) as semana_id,
    -- Gerar novo ID no formato: SEMANAID-ESCOLAID-GRUPOID
    CONCAT(
        COALESCE(
            -- Tentativa 1: Busca exata
            (SELECT MIN(c.id) 
             FROM foods_db.calendario c 
             WHERE c.semana_consumo = n.semana_consumo
             LIMIT 1),
            -- Tentativa 2: Busca com LIKE
            (SELECT MIN(c.id) 
             FROM foods_db.calendario c 
             WHERE REPLACE(REPLACE(c.semana_consumo, '(', ''), ')', '') 
                   LIKE CONCAT('%', REPLACE(REPLACE(n.semana_consumo, '(', ''), ')', ''), '%')
             LIMIT 1),
            -- Fallback: Hash
            ABS(CRC32(COALESCE(n.semana_consumo, ''))) % 100000
        ),
        '-',
        COALESCE(n.escola_id, 'NULL'),
        '-',
        COALESCE(n.grupo_id, 'NULL')
    ) as id_novo
FROM necessidades n
WHERE n.necessidade_id IS NOT NULL
  AND n.escola_id IS NOT NULL
  AND n.grupo_id IS NOT NULL
  AND n.semana_consumo IS NOT NULL
  AND n.semana_consumo != '';

-- Verificar quantos registros serão atualizados
SELECT 
    COUNT(*) as total_necessidades,
    COUNT(DISTINCT id_antigo) as ids_unicos_antigos,
    COUNT(DISTINCT id_novo) as ids_unicos_novos
FROM temp_novos_ids;

-- Mostrar preview dos IDs que serão atualizados (primeiros 20)
SELECT 
    id_antigo,
    id_novo,
    escola_id,
    grupo_id,
    semana_consumo,
    semana_id
FROM temp_novos_ids
ORDER BY id_antigo
LIMIT 20;

-- ATENÇÃO: Descomente as linhas abaixo para executar o UPDATE
-- Recomendado: Fazer backup antes de executar!

/*
-- Verificar se há conflitos (mesmo id_novo para diferentes id_antigo)
SELECT 
    id_novo,
    COUNT(DISTINCT id_antigo) as qtd_ids_antigos,
    GROUP_CONCAT(DISTINCT id_antigo) as ids_antigos
FROM temp_novos_ids
GROUP BY id_novo
HAVING COUNT(DISTINCT id_antigo) > 1;

-- Se não houver conflitos, executar o UPDATE
UPDATE necessidades n
INNER JOIN temp_novos_ids t ON n.necessidade_id = t.id_antigo
SET n.necessidade_id = t.id_novo
WHERE n.necessidade_id IS NOT NULL;

-- Verificar resultado
SELECT 
    necessidade_id,
    escola_id,
    grupo_id,
    semana_consumo,
    COUNT(*) as qtd_produtos
FROM necessidades
WHERE necessidade_id LIKE '%-%-%'
GROUP BY necessidade_id, escola_id, grupo_id, semana_consumo
ORDER BY necessidade_id
LIMIT 20;
*/

-- Limpar tabela temporária
DROP TEMPORARY TABLE IF EXISTS temp_novos_ids;
