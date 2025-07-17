-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 17/07/2025 às 16:58
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
-- Estrutura para tabela `marcas`
--

CREATE TABLE `marcas` (
  `id` int(11) NOT NULL,
  `marca` varchar(100) NOT NULL COMMENT 'Nome da marca (ex: KING, COCA-COLA, SADIA)',
  `fabricante` varchar(200) NOT NULL COMMENT 'Nome do fabricante (ex: KING ALIMENTOS LTDA)',
  `descricao` text DEFAULT NULL COMMENT 'Descrição detalhada da marca/fabricante',
  `cnpj` varchar(18) DEFAULT NULL COMMENT 'CNPJ do fabricante',
  `telefone` varchar(20) DEFAULT NULL COMMENT 'Telefone do fabricante',
  `email` varchar(100) DEFAULT NULL COMMENT 'Email do fabricante',
  `website` varchar(200) DEFAULT NULL COMMENT 'Website do fabricante',
  `endereco` text DEFAULT NULL COMMENT 'Endereço completo do fabricante',
  `status` tinyint(1) DEFAULT 1 COMMENT 'Status da marca (1=ativo, 0=inativo)',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `marcas`
--

INSERT INTO `marcas` (`id`, `marca`, `fabricante`, `descricao`, `cnpj`, `telefone`, `email`, `website`, `endereco`, `status`, `criado_em`, `atualizado_em`) VALUES
(1, 'KING', 'KING ALIMENTOS LTDA', 'Especializada em produtos de carne bovina e suína', '12.345.678/0001-90', '(11) 1234-5678', 'contato@king.com.br', 'www.king.com.br', 'Rua das Carnes, 123 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32'),
(2, 'SADIA', 'SADIA S.A.', 'Produtos alimentícios e processados', '98.765.432/0001-10', '(11) 9876-5432', 'contato@sadia.com.br', 'www.sadia.com.br', 'Av. Sadia, 456 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32'),
(3, 'PERDIGÃO', 'PERDIGÃO S.A.', 'Produtos de aves e derivados', '11.222.333/0001-44', '(11) 1111-2222', 'contato@perdigao.com.br', 'www.perdigao.com.br', 'Rua Perdigão, 789 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32'),
(4, 'COCA-COLA', 'COCA-COLA BRASIL LTDA', 'Refrigerantes e bebidas', '22.333.444/0001-55', '(11) 2222-3333', 'contato@coca-cola.com.br', 'www.coca-cola.com.br', 'Av. Coca-Cola, 321 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32'),
(5, 'PEPSI', 'PEPSI-COLA BRASIL LTDA', 'Refrigerantes e bebidas', '33.444.555/0001-66', '(11) 3333-4444', 'contato@pepsi.com.br', 'www.pepsi.com.br', 'Rua Pepsi, 654 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32'),
(6, 'NESTLÉ', 'NESTLÉ BRASIL LTDA', 'Produtos alimentícios e bebidas', '44.555.666/0001-77', '(11) 4444-5555', 'contato@nestle.com.br', 'www.nestle.com.br', 'Av. Nestlé, 987 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32'),
(7, 'UNILEVER', 'UNILEVER BRASIL LTDA', 'Produtos de limpeza e higiene', '55.666.777/0001-88', '(11) 5555-6666', 'contato@unilever.com.br', 'www.unilever.com.br', 'Rua Unilever, 147 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32'),
(8, 'PROCTER & GAMBLE', 'PROCTER & GAMBLE BRASIL LTDA', 'Produtos de higiene e limpeza', '66.777.888/0001-99', '(11) 6666-7777', 'contato@pg.com.br', 'www.pg.com.br', 'Av. P&G, 258 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32'),
(9, 'JBS', 'JBS S.A.', 'Produtos de carne bovina e suína', '77.888.999/0001-00', '(11) 7777-8888', 'contato@jbs.com.br', 'www.jbs.com.br', 'Rua JBS, 369 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32'),
(10, 'BRF', 'BRF S.A.', 'Produtos alimentícios processados', '88.999.000/0001-11', '(11) 8888-9999', 'contato@brf.com.br', 'www.brf.com.br', 'Av. BRF, 741 - São Paulo/SP', 1, '2025-07-17 14:07:32', '2025-07-17 14:07:32');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_marcas_marca` (`marca`),
  ADD KEY `idx_marcas_fabricante` (`fabricante`),
  ADD KEY `idx_marcas_cnpj` (`cnpj`),
  ADD KEY `idx_marcas_status` (`status`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
