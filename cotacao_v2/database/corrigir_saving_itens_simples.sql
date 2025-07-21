-- Script simples para corrigir saving_itens faltantes
-- Baseado nos IDs mencionados pelo usuário: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

-- Primeiro, vamos verificar quais savings não têm itens
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

-- Verificar se as cotações originais existem
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

-- Verificar produtos_fornecedores para cada cotação
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

-- Se as cotações existem, criar os saving_itens
-- Executar apenas se as cotações ainda existirem

-- Exemplo para saving ID 1 (cotacao_id 153)
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
    1 as saving_id,
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
    'aprovado' as status,
    pf.qtde as quantidade,
    pf.prazo_entrega,
    pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 153;

-- Exemplo para saving ID 2 (cotacao_id 154)
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
    2 as saving_id,
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
    'aprovado' as status,
    pf.qtde as quantidade,
    pf.prazo_entrega,
    pf.data_entrega_fn,
    COALESCE(f.prazo_pagamento, 'N/A') as prazo_pagamento
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id = 154;

-- Continuar para os outros savings...
-- (Repetir o mesmo padrão para os IDs 3-10)

-- Verificação final
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