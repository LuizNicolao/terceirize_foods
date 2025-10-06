-- Script para criar 3 cotações de teste baseadas nos dados de saving
-- Cotação 1: Alimentos básicos
INSERT INTO cotacoes (id, comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa, motivo_final, status, data_criacao, data_atualizacao, total_produtos, produtos_duplicados, total_quantidade, total_fornecedores) VALUES
(1, 'Administrador', 'CD CHAPECO', 'programada', '', 'Compra de alimentos básicos para escolas', 'Compra Programada', 'aguardando_aprovacao', NOW(), NOW(), 5, 0, 500, 2);

-- Cotação 2: Material de escritório
INSERT INTO cotacoes (id, comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa, motivo_final, status, data_criacao, data_atualizacao, total_produtos, produtos_duplicados, total_quantidade, total_fornecedores) VALUES
(2, 'Administrador', 'CD CURITIBANOS', 'programada', '', 'Compra de material de escritório', 'Compra Programada', 'aguardando_aprovacao', NOW(), NOW(), 4, 0, 200, 2);

-- Cotação 3: Produtos de limpeza
INSERT INTO cotacoes (id, comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa, motivo_final, status, data_criacao, data_atualizacao, total_produtos, produtos_duplicados, total_quantidade, total_fornecedores) VALUES
(3, 'Administrador', 'CD TOLEDO', 'programada', '', 'Compra de produtos de limpeza', 'Compra Programada', 'aguardando_aprovacao', NOW(), NOW(), 3, 0, 150, 1);

-- Fornecedores para Cotação 1
INSERT INTO fornecedores (id, cotacao_id, fornecedor_id, nome, tipo_frete, valor_frete, prazo_pagamento, frete) VALUES
(1, 1, 'forn_001_supermercado', 'SUPERMERCADO CENTRAL', 'CIF', 50.00, '30/60/90', '50.00'),
(2, 1, 'forn_002_distribuidora', 'DISTRIBUIDORA ALIMENTOS LTDA', 'FOB', 30.00, '15/30/45', '30.00');

-- Fornecedores para Cotação 2
INSERT INTO fornecedores (id, cotacao_id, fornecedor_id, nome, tipo_frete, valor_frete, prazo_pagamento, frete) VALUES
(3, 2, 'forn_003_papelaria', 'PAPELARIA ESCOLAR', 'CIF', 25.00, '15/30', '25.00'),
(4, 2, 'forn_004_escritorio', 'MATERIAL DE ESCRITÓRIO LTDA', 'FOB', 20.00, '30/60', '20.00');

-- Fornecedores para Cotação 3
INSERT INTO fornecedores (id, cotacao_id, fornecedor_id, nome, tipo_frete, valor_frete, prazo_pagamento, frete) VALUES
(5, 3, 'forn_005_limpeza', 'PRODUTOS DE LIMPEZA LTDA', 'CIF', 40.00, '30/60', '40.00');

-- Produtos para Cotação 1 (Alimentos)
INSERT INTO produtos_fornecedores (id, fornecedor_id, produto_id, nome, qtde, un, prazo_entrega, ult_valor_aprovado, ult_fornecedor_aprovado, valor_anterior, valor_unitario, primeiro_valor, difal, ipi, data_entrega_fn, total) VALUES
(1, 1, 'prod_001_arroz', 'ARROZ BRANCO TIPO 1 5KG - PCT', 100.00, 'PCT', '15/07/2025', '15.50', 'SUPERMERCADO CENTRAL', '16.00', '15.50', '15.50', 0.00, 0.00, '15/07/2025', 1550.00),
(2, 1, 'prod_002_feijao', 'FEIJAO PRETO 1KG - PCT', 80.00, 'PCT', '15/07/2025', '8.90', 'SUPERMERCADO CENTRAL', '9.20', '8.90', '8.90', 0.00, 0.00, '15/07/2025', 712.00),
(3, 1, 'prod_003_acucar', 'ACUCAR CRISTAL 1KG - PCT', 120.00, 'PCT', '15/07/2025', '4.50', 'SUPERMERCADO CENTRAL', '4.80', '4.50', '4.50', 0.00, 0.00, '15/07/2025', 540.00),
(4, 2, 'prod_001_arroz', 'ARROZ BRANCO TIPO 1 5KG - PCT', 100.00, 'PCT', '10/07/2025', '15.80', 'DISTRIBUIDORA ALIMENTOS LTDA', '16.00', '15.80', '15.80', 0.00, 0.00, '10/07/2025', 1580.00),
(5, 2, 'prod_002_feijao', 'FEIJAO PRETO 1KG - PCT', 80.00, 'PCT', '10/07/2025', '9.10', 'DISTRIBUIDORA ALIMENTOS LTDA', '9.20', '9.10', '9.10', 0.00, 0.00, '10/07/2025', 728.00),
(6, 2, 'prod_003_acucar', 'ACUCAR CRISTAL 1KG - PCT', 120.00, 'PCT', '10/07/2025', '4.60', 'DISTRIBUIDORA ALIMENTOS LTDA', '4.80', '4.60', '4.60', 0.00, 0.00, '10/07/2025', 552.00);

-- Produtos para Cotação 2 (Material de Escritório)
INSERT INTO produtos_fornecedores (id, fornecedor_id, produto_id, nome, qtde, un, prazo_entrega, ult_valor_aprovado, ult_fornecedor_aprovado, valor_anterior, valor_unitario, primeiro_valor, difal, ipi, data_entrega_fn, total) VALUES
(7, 3, 'prod_004_caneta', 'CANETA ESFEROGRAFICA AZUL', 50.00, 'UN', '20/07/2025', '2.50', 'PAPELARIA ESCOLAR', '2.80', '2.50', '2.50', 0.00, 0.00, '20/07/2025', 125.00),
(8, 3, 'prod_005_caderno', 'CADERNO ESPIRAL 96 FOLHAS', 30.00, 'UN', '20/07/2025', '8.90', 'PAPELARIA ESCOLAR', '9.50', '8.90', '8.90', 0.00, 0.00, '20/07/2025', 267.00),
(9, 4, 'prod_004_caneta', 'CANETA ESFEROGRAFICA AZUL', 50.00, 'UN', '25/07/2025', '2.60', 'MATERIAL DE ESCRITÓRIO LTDA', '2.80', '2.60', '2.60', 0.00, 0.00, '25/07/2025', 130.00),
(10, 4, 'prod_005_caderno', 'CADERNO ESPIRAL 96 FOLHAS', 30.00, 'UN', '25/07/2025', '9.20', 'MATERIAL DE ESCRITÓRIO LTDA', '9.50', '9.20', '9.20', 0.00, 0.00, '25/07/2025', 276.00),
(11, 4, 'prod_006_lapis', 'LÁPIS GRAPHITE HB', 40.00, 'UN', '25/07/2025', '1.20', 'MATERIAL DE ESCRITÓRIO LTDA', '1.50', '1.20', '1.20', 0.00, 0.00, '25/07/2025', 48.00),
(12, 4, 'prod_007_borracha', 'BORRACHA BRANCA', 30.00, 'UN', '25/07/2025', '1.80', 'MATERIAL DE ESCRITÓRIO LTDA', '2.00', '1.80', '1.80', 0.00, 0.00, '25/07/2025', 54.00);

-- Produtos para Cotação 3 (Produtos de Limpeza)
INSERT INTO produtos_fornecedores (id, fornecedor_id, produto_id, nome, qtde, un, prazo_entrega, ult_valor_aprovado, ult_fornecedor_aprovado, valor_anterior, valor_unitario, primeiro_valor, difal, ipi, data_entrega_fn, total) VALUES
(13, 5, 'prod_008_detergente', 'DETERGENTE LÍQUIDO 500ML', 60.00, 'UN', '30/07/2025', '3.50', 'PRODUTOS DE LIMPEZA LTDA', '3.80', '3.50', '3.50', 0.00, 0.00, '30/07/2025', 210.00),
(14, 5, 'prod_009_sabao', 'SABÃO EM PÓ 1KG', 50.00, 'UN', '30/07/2025', '8.90', 'PRODUTOS DE LIMPEZA LTDA', '9.20', '8.90', '8.90', 0.00, 0.00, '30/07/2025', 445.00),
(15, 5, 'prod_010_desinfetante', 'DESINFETANTE 500ML', 40.00, 'UN', '30/07/2025', '4.20', 'PRODUTOS DE LIMPEZA LTDA', '4.50', '4.20', '4.20', 0.00, 0.00, '30/07/2025', 168.00);

-- Verificar as cotações criadas
SELECT 'Cotações criadas:' as info;
SELECT id, comprador, local_entrega, status, total_produtos, total_fornecedores FROM cotacoes;

SELECT 'Fornecedores criados:' as info;
SELECT id, cotacao_id, nome FROM fornecedores;

SELECT 'Produtos criados:' as info;
SELECT COUNT(*) as total_produtos FROM produtos_fornecedores;
