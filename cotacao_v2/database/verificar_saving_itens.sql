-- Script de verificação rápida para diagnosticar saving_itens faltantes

-- 1. Verificar quantos savings existem vs quantos têm itens
SELECT 
    'Total de Savings' as descricao,
    COUNT(*) as total
FROM saving
UNION ALL
SELECT 
    'Savings com Itens' as descricao,
    COUNT(DISTINCT s.id) as total
FROM saving s
JOIN saving_itens si ON s.id = si.saving_id
UNION ALL
SELECT 
    'Savings SEM Itens' as descricao,
    COUNT(*) as total
FROM saving s
LEFT JOIN saving_itens si ON s.id = si.saving_id
WHERE si.id IS NULL;

-- 2. Listar savings sem itens
SELECT 
    s.id as saving_id,
    s.cotacao_id,
    s.valor_total_inicial,
    s.valor_total_final,
    s.economia,
    s.economia_percentual,
    s.data_registro
FROM saving s
LEFT JOIN saving_itens si ON s.id = si.saving_id
WHERE si.id IS NULL
ORDER BY s.id;

-- 3. Verificar se as cotações originais ainda existem
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
WHERE s.id IN (
    SELECT s2.id 
    FROM saving s2
    LEFT JOIN saving_itens si2 ON s2.id = si2.saving_id
    WHERE si2.id IS NULL
)
ORDER BY s.id;

-- 4. Verificar produtos_fornecedores para cotações que existem
SELECT 
    s.id as saving_id,
    s.cotacao_id,
    COUNT(pf.id) as total_produtos_fornecedores,
    GROUP_CONCAT(DISTINCT f.nome) as fornecedores
FROM saving s
JOIN cotacoes c ON s.cotacao_id = c.id
LEFT JOIN fornecedores f ON c.id = f.cotacao_id
LEFT JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE s.id IN (
    SELECT s2.id 
    FROM saving s2
    LEFT JOIN saving_itens si2 ON s2.id = si2.saving_id
    WHERE si2.id IS NULL
)
GROUP BY s.id, s.cotacao_id
ORDER BY s.id;

-- 5. Verificar alguns produtos_fornecedores de exemplo
SELECT 
    c.id as cotacao_id,
    f.nome as fornecedor,
    pf.nome as produto,
    pf.qtde as quantidade,
    pf.primeiro_valor as valor_inicial,
    pf.valor_unitario as valor_final,
    (pf.primeiro_valor - pf.valor_unitario) * pf.qtde as economia_calculada
FROM cotacoes c
JOIN fornecedores f ON c.id = f.cotacao_id
JOIN produtos_fornecedores pf ON f.id = pf.fornecedor_id
WHERE c.id IN (153, 154, 155, 156, 163, 164, 169, 168, 170, 171)
ORDER BY c.id, f.nome, pf.nome
LIMIT 10; 