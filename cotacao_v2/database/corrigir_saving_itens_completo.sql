-- Script completo para corrigir saving_itens faltantes
-- Para os IDs de saving: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

-- =====================================================
-- 1. VERIFICAÇÃO INICIAL
-- =====================================================

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
WHERE s.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
GROUP BY s.id, s.cotacao_id, s.valor_total_inicial, s.valor_total_final, s.economia, s.economia_percentual
ORDER BY s.id;

-- =====================================================
-- 2. VERIFICAR SE AS COTAÇÕES EXISTEM
-- =====================================================

SELECT 
    s.id as saving_id,
    s.cotacao_id,
    CASE 
        WHEN c.id IS NOT NULL THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as cotacao_status,
    c.comprador,
    c.local_entrega,
    c.tipo_compra
FROM saving s
LEFT JOIN cotacoes c ON s.cotacao_id = c.id
WHERE s.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
ORDER BY s.id;

-- =====================================================
-- 3. VERIFICAR PRODUTOS_FORNECEDORES
-- =====================================================

SELECT 
    s.id as saving_id,
    s.cotacao_id,
    COUNT(pf.id) as total_produtos_fornecedores,
    GROUP_CONCAT(DISTINCT f.nome) as fornecedores
FROM saving s
LEFT JOIN cotacoes c ON s.cotacao_id = c.id
LEFT JOIN fornecedores f ON c.id = f.cotacao_id
LEFT JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE s.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
GROUP BY s.id, s.cotacao_id
ORDER BY s.id;

-- =====================================================
-- 4. CRIAR SAVING_ITENS FALTANTES
-- =====================================================

-- Saving ID 1 (cotacao_id 153)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    1 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 153;

-- Saving ID 2 (cotacao_id 154)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    2 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 154;

-- Saving ID 3 (cotacao_id 155)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    3 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 155;

-- Saving ID 4 (cotacao_id 156)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    4 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 156;

-- Saving ID 5 (cotacao_id 163)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    5 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 163;

-- Saving ID 6 (cotacao_id 164)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    6 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 164;

-- Saving ID 7 (cotacao_id 169)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    7 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 169;

-- Saving ID 8 (cotacao_id 168)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    8 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 168;

-- Saving ID 9 (cotacao_id 170)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    9 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 170;

-- Saving ID 10 (cotacao_id 171)
INSERT INTO saving_itens (
    saving_id, item_id, descricao, fornecedor, valor_unitario_inicial, valor_unitario_final,
    economia, economia_percentual, status, quantidade, prazo_entrega, data_entrega_fn, prazo_pagamento
)
SELECT 
    10 as saving_id, pf.id as item_id, pf.nome as descricao, f.nome as fornecedor,
    COALESCE(pf.primeiro_valor, pf.valor_unitario) as valor_unitario_inicial,
    pf.valor_unitario as valor_unitario_final,
    (COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) * pf.qtde as economia,
    CASE 
        WHEN COALESCE(pf.primeiro_valor, pf.valor_unitario) > 0 
        THEN ((COALESCE(pf.primeiro_valor, pf.valor_unitario) - pf.valor_unitario) / COALESCE(pf.primeiro_valor, pf.valor_unitario)) * 100
        ELSE 0 
    END as economia_percentual,
    'aprovado' as status, pf.qtde as quantidade, pf.prazo_entrega, pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 171;

-- =====================================================
-- 5. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todos os savings agora têm itens
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
WHERE s.id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
GROUP BY s.id, s.cotacao_id, s.valor_total_inicial, s.valor_total_final, s.economia, s.economia_percentual
ORDER BY s.id;

-- Verificar alguns itens criados
SELECT 
    si.saving_id,
    si.descricao,
    si.fornecedor,
    si.valor_unitario_inicial,
    si.valor_unitario_final,
    si.economia,
    si.economia_percentual,
    si.quantidade
FROM saving_itens si
WHERE si.saving_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
ORDER BY si.saving_id, si.id
LIMIT 20; 