-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 17/07/2025 às 16:59
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `registros`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `codigo_produto` varchar(10) DEFAULT NULL,
  `nome` varchar(200) NOT NULL COMMENT 'Exemplo: PATINHO BOVINO EM CUBOS KING',
  `descricao` text DEFAULT NULL COMMENT 'Descrição detalhada do produto',
  `codigo_barras` varchar(50) DEFAULT NULL COMMENT 'Exemplo: 1234567891234',
  `referencia` varchar(100) DEFAULT NULL COMMENT 'Referência interna do produto',
  `referencia_externa` varchar(100) DEFAULT NULL COMMENT 'Exemplo: 123654',
  `referencia_mercado` varchar(200) DEFAULT NULL COMMENT 'Exemplo: Corte Bovino / Patinho / Cubos',
  `unidade_id` int(11) DEFAULT NULL COMMENT 'ID da unidade de medida - Exemplo: PCT',
  `quantidade` decimal(10,3) DEFAULT 1.000 COMMENT 'Exemplo: 1',
  `grupo_id` int(11) DEFAULT NULL COMMENT 'Agrupamento N1 - Exemplo: FRIOS',
  `subgrupo_id` int(11) DEFAULT NULL COMMENT 'Agrupamento N2 - Exemplo: CONGELADO',
  `classe_id` int(11) DEFAULT NULL,
  `marca_id` int(11) DEFAULT NULL,
  `agrupamento_n3` varchar(100) DEFAULT NULL COMMENT 'Agrupamento N3 - Exemplo: BOVINO',
  `agrupamento_n4` varchar(100) DEFAULT NULL COMMENT 'Agrupamento N4 - Exemplo: PATINHO BOVINO EM CUBOS 1KG',
  `peso_liquido` decimal(10,3) DEFAULT NULL COMMENT 'Peso líquido em kg - Exemplo: 1',
  `peso_bruto` decimal(10,3) DEFAULT NULL COMMENT 'Peso bruto em kg - Exemplo: 1',
  `marca` varchar(100) DEFAULT NULL COMMENT 'Exemplo: KING',
  `fabricante` varchar(100) DEFAULT NULL COMMENT 'Exemplo: KING',
  `informacoes_adicionais` text DEFAULT NULL COMMENT 'Exemplo: PRODUTO COM 5% DE GORDURA',
  `foto_produto` varchar(255) DEFAULT NULL COMMENT 'Caminho da foto - Exemplo: IMAGEM',
  `prazo_validade` int(11) DEFAULT NULL COMMENT 'Prazo de validade (número) - Exemplo: 12',
  `unidade_validade` enum('DIAS','SEMANAS','MESES','ANOS') DEFAULT NULL COMMENT 'Exemplo: DIAS',
  `regra_palet_un` int(11) DEFAULT NULL COMMENT 'Regra palet (unidades) - Exemplo: 1200',
  `ficha_homologacao` varchar(50) DEFAULT NULL COMMENT 'Exemplo: 123456',
  `registro_especifico` varchar(200) DEFAULT NULL COMMENT 'Exemplo: 1234456 CA, REGISTRO, MODELO, Nº SERIE',
  `comprimento` decimal(10,2) DEFAULT NULL COMMENT 'Comprimento em cm - Exemplo: 20',
  `largura` decimal(10,2) DEFAULT NULL COMMENT 'Largura em cm - Exemplo: 15',
  `altura` decimal(10,2) DEFAULT NULL COMMENT 'Altura em cm - Exemplo: 10',
  `volume` decimal(10,2) DEFAULT NULL COMMENT 'Volume em cm³ - Exemplo: 3000',
  `integracao_senior` varchar(50) DEFAULT NULL COMMENT 'Exemplo: 123654',
  `ncm` varchar(10) DEFAULT NULL COMMENT 'Classificação NCM',
  `cest` varchar(10) DEFAULT NULL COMMENT 'Código CEST',
  `cfop` varchar(10) DEFAULT NULL COMMENT 'Código CFOP',
  `ean` varchar(50) DEFAULT NULL COMMENT 'Código EAN',
  `cst_icms` varchar(3) DEFAULT NULL COMMENT 'CST ICMS',
  `csosn` varchar(3) DEFAULT NULL COMMENT 'CSOSN',
  `aliquota_icms` decimal(5,2) DEFAULT NULL COMMENT 'Alíquota ICMS (%)',
  `aliquota_ipi` decimal(5,2) DEFAULT NULL COMMENT 'Alíquota IPI (%)',
  `aliquota_pis` decimal(5,2) DEFAULT NULL COMMENT 'Alíquota PIS (%)',
  `aliquota_cofins` decimal(5,2) DEFAULT NULL COMMENT 'Alíquota COFINS (%)',
  `preco_custo` decimal(10,2) DEFAULT NULL COMMENT 'Preço de custo',
  `preco_venda` decimal(10,2) DEFAULT NULL COMMENT 'Preço de venda',
  `estoque_atual` int(11) DEFAULT 0 COMMENT 'Estoque atual',
  `estoque_minimo` int(11) DEFAULT 0 COMMENT 'Estoque mínimo',
  `fornecedor_id` int(11) DEFAULT NULL COMMENT 'ID do fornecedor',
  `status` tinyint(1) DEFAULT 1 COMMENT 'Status do produto (1=ativo, 0=inativo)',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_criador_id` int(11) DEFAULT NULL COMMENT 'ID do usuário que criou o produto',
  `usuario_atualizador_id` int(11) DEFAULT NULL COMMENT 'ID do usuário que atualizou o produto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_produto` (`codigo_produto`),
  ADD KEY `idx_produtos_nome` (`nome`),
  ADD KEY `idx_produtos_codigo_barras` (`codigo_barras`),
  ADD KEY `idx_produtos_referencia` (`referencia`),
  ADD KEY `idx_produtos_referencia_externa` (`referencia_externa`),
  ADD KEY `idx_produtos_referencia_mercado` (`referencia_mercado`),
  ADD KEY `idx_produtos_marca` (`marca`),
  ADD KEY `idx_produtos_fabricante` (`fabricante`),
  ADD KEY `idx_produtos_agrupamento_n3` (`agrupamento_n3`),
  ADD KEY `idx_produtos_agrupamento_n4` (`agrupamento_n4`),
  ADD KEY `idx_produtos_integracao_senior` (`integracao_senior`),
  ADD KEY `idx_produtos_ncm` (`ncm`),
  ADD KEY `idx_produtos_cest` (`cest`),
  ADD KEY `idx_produtos_ean` (`ean`),
  ADD KEY `idx_produtos_cst_icms` (`cst_icms`),
  ADD KEY `idx_produtos_csosn` (`csosn`),
  ADD KEY `idx_produtos_grupo` (`grupo_id`),
  ADD KEY `idx_produtos_subgrupo` (`subgrupo_id`),
  ADD KEY `idx_produtos_fornecedor` (`fornecedor_id`),
  ADD KEY `idx_produtos_status` (`status`),
  ADD KEY `idx_produtos_classe_id` (`classe_id`),
  ADD KEY `idx_produtos_marca_id` (`marca_id`),
  ADD KEY `idx_produtos_codigo_produto` (`codigo_produto`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `fk_produtos_classes` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_produtos_marcas` FOREIGN KEY (`marca_id`) REFERENCES `marcas` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
