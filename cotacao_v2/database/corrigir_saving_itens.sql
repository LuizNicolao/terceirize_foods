-- Script para corrigir saving_itens faltantes
-- Este script busca os dados das cotações originais e cria os itens faltantes na tabela saving_itens

-- Verificar quais savings não têm itens
SELECT 
    s.id as saving_id,
    s.cotacao_id,
    s.valor_total_inicial,
    s.valor_total_final,
    s.economia,
    s.economia_percentual,
    COUNT(si.id) as total_itens
FROM saving s
LEFT JOIN saving_itens si ON s.id = si.saving_id
GROUP BY s.id, s.cotacao_id, s.valor_total_inicial, s.valor_total_final, s.economia, s.economia_percentual
HAVING COUNT(si.id) = 0
ORDER BY s.id;

-- Verificar se as cotações originais ainda existem
SELECT 
    s.id as saving_id,
    s.cotacao_id,
    CASE 
        WHEN c.id IS NOT NULL THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as cotacao_status
FROM saving s
LEFT JOIN cotacoes c ON s.cotacao_id = c.id
WHERE s.id IN (
    SELECT s2.id 
    FROM saving s2
    LEFT JOIN saving_itens si2 ON s2.id = si2.saving_id
    GROUP BY s2.id
    HAVING COUNT(si2.id) = 0
)
ORDER BY s.id;

-- Verificar se há produtos_fornecedores para as cotações
SELECT 
    s.id as saving_id,
    s.cotacao_id,
    COUNT(pf.id) as total_produtos_fornecedores
FROM saving s
LEFT JOIN cotacoes c ON s.cotacao_id = c.id
LEFT JOIN fornecedores f ON c.id = f.cotacao_id
LEFT JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE s.id IN (
    SELECT s2.id 
    FROM saving s2
    LEFT JOIN saving_itens si2 ON s2.id = si2.saving_id
    GROUP BY s2.id
    HAVING COUNT(si2.id) = 0
)
GROUP BY s.id, s.cotacao_id
ORDER BY s.id;

-- Script para criar saving_itens faltantes baseado nos produtos_fornecedores
-- Este script deve ser executado apenas se os dados das cotações ainda existirem

-- Primeiro, vamos criar uma tabela temporária com os dados necessários
CREATE TEMPORARY TABLE temp_saving_itens AS
SELECT 
    s.id as saving_id,
    pf.id as item_id,
    pf.nome as descricao,
    f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    pf.qtde as quantidade,
    pf.prazo_entrega,
    pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM saving s
JOIN cotacoes c ON s.cotacao_id = c.id
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE s.id IN (
    SELECT s2.id 
    FROM saving s2
    LEFT JOIN saving_itens si2 ON s2.id = si2.saving_id
    GROUP BY s2.id
    HAVING COUNT(si2.id) = 0
);

-- Verificar os dados que serão inseridos
SELECT * FROM temp_saving_itens ORDER BY saving_id, item_id;

-- Inserir os saving_itens faltantes
INSERT INTO saving_itens (
    saving_id,
    item_id,
    descricao,
    fornecedor,
    valor_unitario_inicial,
    valor_unitario_final,
    economia,
    economia_percentual,
    status,
    quantidade,
    prazo_entrega,
    data_entrega_fn,
    prazo_pagamento
)
SELECT 
    saving_id,
    item_id,
    descricao,
    fornecedor,
    valor_unitario_inicial,
    valor_unitario_final,
    economia,
    economia_percentual,
    'aprovado' as status,
    quantidade,
    prazo_entrega,
    data_entrega_fn,
    prazo_pagamento
FROM temp_saving_itens;

-- Verificar se a inserção foi bem-sucedida
SELECT 
    s.id as saving_id,
    s.cotacao_id,
    COUNT(si.id) as total_itens_apos_correcao
FROM saving s
LEFT JOIN saving_itens si ON s.id = si.saving_id
WHERE s.id IN (
    SELECT saving_id FROM temp_saving_itens
)
GROUP BY s.id, s.cotacao_id
ORDER BY s.id;

-- Limpar tabela temporária
DROP TEMPORARY TABLE IF EXISTS temp_saving_itens;

-- Verificação final - todos os savings devem ter itens
SELECT 
    s.id as saving_id,
    s.cotacao_id,
    s.valor_total_inicial,
    s.valor_total_final,
    s.economia,
    s.economia_percentual,
    COUNT(si.id) as total_itens
FROM saving s
LEFT JOIN saving_itens si ON s.id = si.saving_id
GROUP BY s.id, s.cotacao_id, s.valor_total_inicial, s.valor_total_final, s.economia, s.economia_percentual
ORDER BY s.id; 